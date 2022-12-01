import DTOTimesheet, { validateYup } from "../dtos/dtoTimesheet";
import mongoConnect from "../mongo/mongoConnect";
import { ApiError } from "../../middleware/exceptions";
import googleDrive from "../google/api/googleDrive";
import mongoTimesheetsGuardsModel from "../mongo/models/mongoTimesheetsGuardsModel";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoGuardPostsModel from "../mongo/models/mongoGuardPostsModel";
import mongoGuardPostsArchiveModel from "../mongo/models/mongoGuardPostsArchiveModel";
import mongoGuardsModel from "../mongo/models/mongoGuardsModel";
import mongoGuardsArchiveModel from "../mongo/models/mongoGuardsArchiveModel";
import mongoose from "mongoose";
import DTOGuard from "../dtos/dtoGuard";
import mongoTimesheetsGuardPostModel from "../mongo/models/mongoTimesheetsGuardPostModel";
import mongoUserArchiveModel from "../mongo/models/mongoUserArchiveModel";
import { FPositionBUH, FPositionHRM, FPositionZDIR } from "../../components/levelZ_variable/FPositionItemList";
import { timesheetPrintServer } from "../utils/timesheetUtils";
import userService from "./userService";

class TimesheetService {

    async changeTimesheet(inputData) {

        try {
            //Validate date

            const timesheetsData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            const {guardPost, month, guardsRow, manager, rate} = timesheetsData;
            //Check initials condition
            await mongoConnect();
            
            // change mongoTimesheetsGuardsModel
            const existArray = [];

            await mongoTimesheetsGuardsModel.bulkWrite([
                ...guardsRow.map(guardRow=>{
                    existArray.push(guardRow._id);
                    return {
                        updateOne:{
                            filter: {guardPost: guardPost, month: month, guard: guardRow._id},
                            update: {
                                timesheetShifts: guardRow.timesheetShifts,
                                timesheetDays: guardRow.timesheetDays
                            },
                            upsert: true
                        }
                    }
                }),
                {
                    deleteMany:{
                        filter: {guardPost: guardPost, month: month, guard: {$nin: existArray}},
                    }
                }
            ]);
            // change mongoTimesheetsGuardsModel
            if( manager && manager != 'EMPTY' ){

                console.log(manager, rate ? rate : null);

                const user = await mongoUserModel.findById(manager) || await mongoUserArchiveModel.findById(manager);

                if( user ){

                    console.log(await mongoTimesheetsGuardPostModel.updateOne({
                        guardPost: guardPost, 
                        month: month
                    }, {
                            manager: user.id, 
                            managerSheme: user.constructor.modelName,
                            rate: rate
                    }, {
                        upsert: true
                    }));

                }else{

                    throw ApiError.BadRequest(`Неккоректно указан ID менеджера: ${manager}`);

                }

            }else if( rate ){

                await mongoTimesheetsGuardPostModel.updateOne({
                    guardPost: guardPost, 
                    month: month
                }, {
                    manager: null, 
                    managerSheme: null,
                    rate: rate
                }, {
                    upsert: true
                });

            }else if(manager === 'EMPTY'){
                await mongoTimesheetsGuardPostModel.deleteOne({guardPost: guardPost, month: month});
            }

            return;

        } catch (error) {
            console.log(error);

            throw error;
        }

    }

    async getTimesheet(inputData) {

        try {

            //Validate date

            const timesheetsData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            const {guardPost, month} = timesheetsData;

            //Check initials condition
            await mongoConnect();

            //get timesheet data
            const responce = await mongoTimesheetsGuardsModel.find({guardPost: guardPost, month: month}).populate('guard').lean();

            // console.log('getTimesheet');
            const optionGuards = [];
            const guardsRow = responce.map(timesheet=>{

                if (!timesheet.guard.manager) {
                    timesheet.guard.manager = { _id: "EMPTY" }
                }

                const dtoGuard = new DTOGuard(timesheet.guard);
                dtoGuard.timesheetDays = timesheet.timesheetDays;
                dtoGuard.timesheetShifts = timesheet.timesheetShifts;

                optionGuards.push(dtoGuard._id);

                return dtoGuard;
            });

            //get GuardPost data for request month

            var manager = "EMPTY";
            var rate = null;

            const timesheetsGuardPost = await mongoTimesheetsGuardPostModel.findOne({guardPost: guardPost, month: month}).lean();

            if( timesheetsGuardPost ){
                manager = timesheetsGuardPost.manager ? timesheetsGuardPost.manager.toString() : manager;
                rate = timesheetsGuardPost.rate ? timesheetsGuardPost.rate : rate;
            }

            return { guardsRow, optionGuards, manager, rate}

        } catch (error) {
            console.log(error);

            throw error;
        }

    }

    async getTimesheetPrint(inputData) {

        try {

            //Validate date
            const timesheetsData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            //Извлечение параметров для формирования
            const {guardPost, month} = timesheetsData;
            
            const date = new Date(month);

            //Check initials condition
            await mongoConnect();

            // Формируем ObjectID из списка guardPost на фильтр
            const guardPosts = guardPost.map(function(el) { return mongoose.Types.ObjectId(el) });

            // Сначала запрашиваем данные из таблицы с ГРАФИКАМИ СМЕН
            const responceTimesheetsGuards = await mongoTimesheetsGuardsModel.aggregate([
                { $match: {guardPost: {$in: guardPosts}, month: date} },
                { $lookup: {
                    from: mongoGuardsModel.collection.name,
                    localField: 'guard',
                    foreignField: '_id',
                    as: 'guard'
                }},
                { $lookup: {
                    from: mongoGuardsArchiveModel.collection.name,
                    localField: 'guard',
                    foreignField: '_id',
                    as: 'guardArchive'
                }}, 
                {$project: {  
                    guardPost: 1,
                    timesheetDays: 1,
                    timesheetShifts: 1,
                    guard:{$setUnion: [ "$guard", "$guardArchive" ]}
                 }},
                { $unwind: { path : "$guard" } },
                { $group: { 
                    _id: '$guardPost',
                    guardRow: { $push: {
                        surname: "$guard.surname",
                        firstName: "$guard.firstName",
                        patronymic: "$guard.patronymic",
                        timesheetDays: "$timesheetDays",
                        timesheetShifts: "$timesheetShifts",
                    }}
                }},
                { $lookup: {
                    from: mongoGuardPostsModel.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'guardPost'
                }},
                { $lookup: {
                    from: mongoGuardPostsArchiveModel.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'guardPostArchive'
                }},
                {$project: { 
                    guardPost:{$setUnion: [ "$guardPost", "$guardPostArchive" ]}, 
                    guardRow: 1
                 }},    
                { $unwind: { path : "$guardPost" } },
                { $replaceRoot: { newRoot: {
                    _id: "$_id",
                    name: "$guardPost.name",
                    address: "$guardPost.address",
                    number: "$guardPost.number",
                    callsign: "$guardPost.callsign",
                    rate: "$guardPost.rate",
                    guardRow: "$guardRow"
                } } },
                { $sort : { number : 1, callsign: 1 } }
            ]);

            // Переводим ObjectID найденных ФИЗ. ПОСТОВ с имеющимися ГРАФИКАМИ СМЕН
            const responceTimesheetsGuardsLean = responceTimesheetsGuards.map((element, index)=>{
                element._id = element._id.toString();
                return element;
            })

            // Запрашиваем данные физ поста на искомый ПЕРИОД по данным ФИЗ. ПОСТОВ
            const responceTimesheetsGuardPost  = await mongoTimesheetsGuardPostModel.aggregate([
                { $match: {
                    guardPost: {$in: guardPosts}, 
                    month: date,         
                    manager: { $exists: true, $ne: null }} 
                },
                { $group: { 
                    _id: '$manager',
                    managerSheme: { $first: "$managerSheme" },
                    guardPosts: { $push: {
                        guardPost: "$guardPost",
                        rate: "$rate",
                    }}
                }},
                { $lookup: {
                    from: mongoUserModel.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }},
                { $lookup: {
                    from: mongoUserArchiveModel.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userArchive'
                }},
                {$project: {
                    guardPosts: 1,
                    user:{$setUnion: [ "$user", "$userArchive" ]}
                    }},         
                { $unwind: { path : "$user" } }, 
                { $replaceRoot: { newRoot: {
                    surname: "$user.surname",
                    firstName: "$user.firstName",
                    patronymic: "$user.patronymic",
                    guardPosts: "$guardPosts"
                } } },
            ]);

            // Инициируем список индексов с графиками смен, для которых есть НСО
            const responceTimesheetsGuardsIncludeManagerIndex = [];

            // Формируем ответ, сопоставляя найденных НСО с графиками ФИЗ. ПОСТОВ
            const responce = responceTimesheetsGuardPost.reduce((result, element)=>{

                const listGuardPosts = element.guardPosts.map((guardPost)=>{
                    return guardPost.guardPost.toString();
                })
                
                const guardPosts = responceTimesheetsGuardsLean.filter((guardPost, index)=>{

                    const indexOf = listGuardPosts.indexOf(guardPost._id);

                    if( indexOf >= 0 ){
                        responceTimesheetsGuardsIncludeManagerIndex.push(index);
                        guardPost.rate = element.guardPosts[indexOf].rate ? element.guardPosts[indexOf].rate : guardPost.rate;
                        return true;
                    }

                    return false;

                });

                if( guardPosts.length > 0 ){
                    result.push({
                        surname: element.surname,
                        firstName: element.firstName,
                        patronymic: element.patronymic,
                        guardPosts: guardPosts
                    })
                }

                return result;

            }, []);
            
            // Запрашиваем данные физ поста на искомый ПЕРИОД по данным ФИЗ. ПОСТОВ без НСО
            const responceTimesheetsGuardPostEmptyManager = await mongoTimesheetsGuardPostModel.find( {
                guardPost: {$in: guardPosts}, 
                month: date, 
                manager: null
            }).lean();

            const listGuardPostsEmptyManager = responceTimesheetsGuardPostEmptyManager.map((timeSheetGuardPost)=>{
                return timeSheetGuardPost.guardPost.toString();
            })

            // Формируем список ФИЗ. ПОСТОВ без НСО
            const guardPostsEmptyManager = responceTimesheetsGuardsLean.filter((guardPost, index)=>{
                if( responceTimesheetsGuardsIncludeManagerIndex.includes(index) ){
                    return false;
                }else{
                    const indexOf = listGuardPostsEmptyManager.indexOf(guardPost._id);
                    if( indexOf >= 0 ){
                        guardPost.rate = responceTimesheetsGuardPostEmptyManager[indexOf].rate ? responceTimesheetsGuardPostEmptyManager[indexOf].rate : guardPost.rate;
                    }
                    return true;
                }
            });

            // Добавляем данные о ФИЗ. ПОСТАХ без НСО
            if( guardPostsEmptyManager.length > 0 ){
                responce.push({
                    surname: '',
                    firstName: '',
                    patronymic: '',
                    guardPosts: guardPostsEmptyManager
                })
            }

            if(responce.length==0){
                throw ApiError.FileCreateError('Данные отсутствуют')
            }

            // Добавляем данные о пользователях
            const usersOnPosition = await userService.getUsersInitialsWithPositions([FPositionZDIR, FPositionHRM, FPositionBUH]);

            // Формируем документ из полученных данных
            const document = timesheetPrintServer( responce, usersOnPosition , date );

            const googleDriveFileID = `http://drive.google.com/uc?export=view&id=${await googleDrive.uploadExcelTimesheet( document, month )}`;

            return {document, googleDriveFileID};

        } catch (error) {

            throw error;
        }

    }

}

export default new TimesheetService();