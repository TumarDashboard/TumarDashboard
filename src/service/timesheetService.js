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

            const responce = await mongoTimesheetsModel.bulkWrite(guardsRow.map(guardRow=>(
                {
                    updateOne:{
                        filter: {guardPost: guardPost, month: month, guard: guardRow._id},
                        update: {
                            timesheetShifts: guardRow.timesheetShifts,
                            timesheetDays: guardRow.timesheetDays,
                        },
                        upsert: true
                    }
                }
            )));

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

}

export default new TimesheetService();