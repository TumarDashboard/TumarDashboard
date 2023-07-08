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
import mongoProtectedObjectsModel from "../mongo/models/mongoProtectedObjectsModel";
import mongoSimCardsModel from "../mongo/models/mongoSimCardsModel";
import { FProviderRegEx } from "../../components/levelZ_variable/FProviderItemList";

function managerEquals(a, b) {
    if (!a && !b) {
        return false;
    }
    if (!a || !b) {
        return true;
    }
    return Boolean(a.toString().localeCompare(b.toString()));
}

class ModalService {

    async getGuardEditForm(inputData) {

        try {

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
                                { $cond: [{ $not: ["$number"] }, "", ", "] },
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

    async getProtectedObjectEditForm(inputData) {

        try {

            console.log('---------------getProtectedObjectEditForm-----------------');

            //Validate date----------------------------------------------------------------------------------------------

            const protectedObjectID = inputData.arg;
            const apiBlock = inputData.apiBlock;

            if (!protectedObjectID) {
                throw ApiError.BadRequest("Не указан ID пультового объекта");
            }

            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            const responce = await mongoProtectedObjectsModel
                .findById(protectedObjectID, inputData.apiBlock)
                .lean();

            if (!responce) {
                throw ApiError.BadRequest("Не найден ID пультового объекта");
            }

            return responce

        } catch (error) {
            console.log(error);

            throw error;
        }
    }

    async getSimCardFindForm(inputData) {

        try {

            console.log('---------------getProtectedObjectEditForm-----------------');

            //Validate date----------------------------------------------------------------------------------------------

            let regExp = new RegExp( `^[78]{1}(${FProviderRegEx})`);

            let preFilter = inputData.arg.toString().replace( regExp, '');

            const filter = `.*${preFilter.split('').join('[\\(\\)\\+\\-\\s]{0,1}')}.*`;

            if (!filter) {
                throw ApiError.BadRequest("Отсутствуют данные для поиска");
            }

            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            const responce = await mongoSimCardsModel
                .find({
                    $or: [
                        { msisdn: { $regex: filter, $options: "i" }},
                        { iccid: { $regex: filter, $options: "i" }}
                    ]
                })
                .limit(20)
                .lean();

            if (!responce || responce.length==0) {
                throw ApiError.BadRequest("Данные, удовлетворяющие параметрам поиска отсутствуют");
            }

            return responce

        } catch (error) {
            console.log(error);

            throw error;
        }
    }
}

export default new ModalService();