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
import mongoTimesheetsGuardPostManagersModel from "../mongo/models/mongoTimesheetsGuardPostManagersModel";
import mongoUserArchiveModel from "../mongo/models/mongoUserArchiveModel";

class TimesheetService {

    async changeTimesheet(inputData) {

        try {

            //Validate date

            const timesheetsData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            const {guardPost, month, guardsRow, manager} = timesheetsData;
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

                const user = await mongoUserModel.findById(manager);
                
                if( user ){

                    await mongoTimesheetsGuardPostManagersModel.updateOne({
                        guardPost: guardPost, 
                        month: month
                    }, {
                        manager: user.id, 
                        managerSheme: user.constructor.modelName
                    }, {
                        upsert: true
                    });

                }else{

                    const userArchive = await mongoUserArchiveModel.findById(manager);

                    if( userArchive ){

                        await mongoTimesheetsGuardPostManagersModel.updateOne({
                            guardPost: guardPost, 
                            month: month
                        }, {
                            manager: userArchive.id, 
                            managerSheme: userArchive.constructor.modelName
                        }, {
                            upsert: true
                        });

                    }else{

                        throw ApiError.BadRequest(`Неккоректно указан ID менеджера: ${manager}`);

                    }
                }

            }else{
                await mongoTimesheetsGuardPostManagersModel.deleteOne({guardPost: guardPost, month: month});
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
            const responce = await mongoTimesheetsGuardsModel.find({guardPost: guardPost, month: month}, null, {sort: {timesheetDays: 1}}).populate('guard').lean();

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

            //get manager data
            const timesheetsGuardPostManagers = await mongoTimesheetsGuardPostManagersModel.find({guardPost: guardPost, month: month}).lean();

            return { guardsRow, optionGuards, manager: timesheetsGuardPostManagers.manager ? timesheetsGuardPostManagers.manager.toString() : "EMPTY" }

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

            const {guardPost, month} = timesheetsData;

            //Check initials condition
            await mongoConnect();

            const guardPosts = guardPost.map(function(el) { return mongoose.Types.ObjectId(el) })

            const responce = await mongoTimesheetsGuardsModel.aggregate([
                { $match: {guardPost: {$in: guardPosts}, month: new Date(month)} },
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
                    name: "$guardPost.name",
                    address: "$guardPost.address",
                    number: "$guardPost.number",
                    callsign: "$guardPost.callsign",
                    guardRow: "$guardRow"
                } } },
                { $sort : { number : 1, callsign: 1 } }
            ]);

            return { ...responce }

        } catch (error) {
            console.log(error);

            throw error;
        }

    }

}

export default new TimesheetService();