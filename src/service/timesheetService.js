import DTOTimesheet, { validateYup } from "../dtos/dtoTimesheet";
import mongoConnect from "../mongo/mongoConnect";
import { ApiError } from "../../middleware/exceptions";
import googleDrive from "../google/api/googleDrive";
import mongoTimesheetsModel from "../mongo/models/mongoTimesheetsModel";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoGuardPostsModel from "../mongo/models/mongoGuardPostsModel";
import mongoGuardPostsArchiveModel from "../mongo/models/mongoGuardPostsArchiveModel";
import mongoGuardsModel from "../mongo/models/mongoGuardsModel";
import mongoGuardsArchiveModel from "../mongo/models/mongoGuardsArchiveModel";
import mongoose from "mongoose";
import DTOGuard from "../dtos/dtoGuard";

class TimesheetService {

    async changeTimesheet(inputData) {

        try {

            //Validate date

            const timesheetsData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });
            const {guardPost, month, guardsRow} = timesheetsData;

            //Check initials condition
            await mongoConnect();
            
            const existArray = [];

            const responce = await mongoTimesheetsModel.bulkWrite([
                ...guardsRow.map(guardRow=>{
                    existArray.push(guardRow._id);
                    return {
                        updateOne:{
                            filter: {guardPost: guardPost, month: month, guard: guardRow._id},
                            update: {
                                timesheetShifts: guardRow.timesheetShifts,
                                timesheetDays: guardRow.timesheetDays,
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

            return { responce }

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

            const responce = await mongoTimesheetsModel.find({guardPost: guardPost, month: month}).populate('guard').lean();

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

            return { guardsRow, optionGuards }

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

            const responce = await mongoTimesheetsModel.aggregate([
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