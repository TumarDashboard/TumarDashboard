import DTOGuardPost, { DTOGuardPostArchive, validateYup } from "../dtos/dtoGuardPost";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoConnect from "../mongo/mongoConnect";
import { ApiError } from "../../middleware/exceptions";
import googleDrive from "../google/api/googleDrive";
import mongoGuardPostsModel from "../mongo/models/mongoGuardPostsModel";
import mongoGuardPostsArchiveModel from "../mongo/models/mongoGuardPostsArchiveModel";
import mongoGuardsModel from "../mongo/models/mongoGuardsModel";
import mongoGuardsArchiveModel from "../mongo/models/mongoGuardsArchiveModel";
import mongoose from "mongoose";
import { getCurrentMonth } from "../utils/dateUtils";
import mongoTimesheetsGuardPostModel from "../mongo/models/mongoTimesheetsGuardPostModel";
import mongoTimesheetsGuardsModel from "../mongo/models/mongoTimesheetsGuardsModel";
import mongoUserArchiveModel from "../mongo/models/mongoUserArchiveModel";

function managerEquals(a, b) {
    if (!a && !b) {
        return false;
    }
    if (!a || !b) {
        return true;
    }
    return Boolean(a.toString().localeCompare(b.toString()));
}

class GuardPostService {

    async getGuardEditForm(inputData) {

        try {

            // console.log('-------------------------------------');
            const month = new Date(getCurrentMonth());
            const day = (new Date()).getDate() - 1;

            // console.log('getTimesheetToday: %o', day);

            //Check initials condition
            await mongoConnect();

            //Запустить агрегат на посты
            const responceAggregateUpdateData = [{
                value: 'EMPTY', label: 'Отсутствует'
            },
            ...await mongoGuardPostsModel.aggregate([
                { $sort: { number: 1, callsign: 1 } },
                {
                    $project: {
                        _id: 0,
                        value: '$_id',
                        label: {
                            $concat: [
                                { $ifNull: ["$number", ""] },
                                { $cond: [{$not: ["$number"]}, "", ", "]},
                                "$callsign"
                            ]
                        }
                    }
                }
            ])];

            // console.log('responceAggregateUpdateData: %o', responceAggregateUpdateData);
            return responceAggregateUpdateData;

        } catch (error) {
            console.log(error);

            throw error;
        }
    }

}

export default new GuardPostService();