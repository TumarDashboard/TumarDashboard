import DTOGuardPost, { DTOGuardPostArchive, validateYup } from "../dtos/dtoGuardPost";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoConnect from "../mongo/mongoConnect";
import { ApiError } from "../../middleware/exceptions";
import googleDrive from "../google/api/googleDrive";
import mongoGuardPostsModel from "../mongo/models/mongoGuardPostsModel";
import mongoGuardPostsArchiveModel from "../mongo/models/mongoGuardPostsArchiveModel";
import mongoGuardsModel from "../mongo/models/mongoGuardsModel";
import mongoGuardsArchiveModel from "../mongo/models/mongoGuardsArchiveModel";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import { getCurrentMonth } from "../utils/dateUtils";
import mongoTimesheetsGuardPostModel from "../mongo/models/mongoTimesheetsGuardPostModel";
import mongoTimesheetsGuardsModel from "../mongo/models/mongoTimesheetsGuardsModel";
import mongoUserArchiveModel from "../mongo/models/mongoUserArchiveModel";
import mongoProtectedObjectsModel from "../mongo/models/mongoProtectedObjectsModel";
import mongoSimCardsModel from "../mongo/models/mongoSimCardsModel";
import { FProviderRegEx } from "../../components/levelZ_variable/FProviderItemList";
import { FPositionNSO } from "../../components/levelZ_variable/FPositionItemList";
import DTOGuard from "../dtos/dtoGuard";
import DTOProtectedObject from "../dtos/dtoProtectedObject";
import DTOUser from "../dtos/dtoUser";
import DTOSimCard from "../dtos/dtoSimCard";

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

    async getGuardPostEditForm(inputData) {

        try {

            // console.log('---------------getGuardPostEditForm-----------------');

            //Validate date----------------------------------------------------------------------------------------------
            const { apiBlock, userCompare, userDataID, userDataPositions } = inputData;

            const guardPostID = inputData.arg._id;
            // await new Promise(resolve=>setTimeout(()=>resolve(), 1000))
            // throw new ApiError(500,'dsdsd2222222222222222222222222222222222222222222222222 32ычффффффффффффффффффффффффффффффффффф1 12ывфыв')
            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            // Выборка данных о физ. посте----------------------------------------------------------------------------------
            var dtoGuardPost;
            
            if (guardPostID) {

                //Запрос данных из Монго-------------------------------------------------------------------------------------
                const mongoGuardPost = await mongoGuardPostsModel
                    .findById(guardPostID)
                    .lean();
    
                if (!mongoGuardPost) {
                    throw ApiError.BadRequest("Не найдены данные физ. поста по указанному ID");
                }
    
                //Сверка с доступом к данным---------------------------------------------------------------------------------
                if (userCompare && mongoGuardPost.manager.toString() != userDataID ){
                    throw ApiError.BadRequest("Вы не имеете право доступа к данным физ. поста");
                }
    
                //Удаление данных apiBlock------------------------------------------------------------------------------------
                if (apiBlock) {
                    for (const block of apiBlock.split(' ')) {
                        delete mongoGuardPost[block];
                    }
                }

                //Форматированние данных для возврата-------------------------------------------------------------------------
                dtoGuardPost = new DTOGuardPost(mongoGuardPost);
            }

            // Выборка данных об НСО--------------------------------------------------------------------------------------
            const mongoUsers = await mongoUserModel.find({ positions: FPositionNSO }, 'surname firstName').lean();

            const optionsGuardPostManagers = [{
                label: 'Отсутствует', value: 'EMPTY'
              }, ...mongoUsers?.map((user) => {
                return {
                  label: [user.surname, user.firstName].join(' '),
                  value: user._id.toString()
                }
              })]

            //Возврат данных----------------------------------------------------------------------------------------------
            return { guardPost: dtoGuardPost, optionsGuardPostManagers }

        } catch (error) {
            console.log(error);

            throw error;
        }
    }

    async getGuardEditForm(inputData) {

        try {

            // console.log('---------------getGuardEditForm-----------------');

            //Validate date----------------------------------------------------------------------------------------------

            const { apiBlock, userCompare, userDataID, userDataPositions } = inputData;

            const guardID = inputData?.arg?._id;

            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            // Выборка данных об охраннике----------------------------------------------------------------------------------
            var dtoGuard;
            
            if (guardID) {

                //Запрос данных из Монго-------------------------------------------------------------------------------------
                const mongoGuard = await mongoGuardsModel
                    .findById(guardID)
                    .lean();
    
                if (!mongoGuard) {
                    throw ApiError.BadRequest("Не найдены данные охранника по указанному ID");
                }

                //Удаление данных apiBlock------------------------------------------------------------------------------------
                if (apiBlock) {
                    for (const block of apiBlock.split(' ')) {
                        delete mongoGuard[block];
                    }
                }

                //Форматированние данных для возврата-------------------------------------------------------------------------
                dtoGuard = new DTOGuard(mongoGuard);
            }

            // Выборка данных о физ постах--------------------------------------------------------------------------------------
            
            const mongoGuardPosts = await mongoGuardPostsModel.aggregate([
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
            ]);

            const optionsGuardPosts = [{
                value: 'EMPTY', label: 'Отсутствует'
            },
            ...mongoGuardPosts];

            //Возврат данных----------------------------------------------------------------------------------------------
            return {guard: dtoGuard, optionsGuardPosts};

        } catch (error) {
            console.log(error);

            throw error;
        }
    }

    async getProtectedObjectEditForm(inputData) {

        try {

            // console.log('---------------getProtectedObjectEditForm-----------------');

            //Validate date----------------------------------------------------------------------------------------------
            const { apiBlock, userCompare, userDataID, userDataPositions } = inputData;

            const protectedObjectID = inputData?.arg?._id;

            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            // Выборка данных об объекте----------------------------------------------------------------------------------
            var dtoProtectedObject;

            if (protectedObjectID) {

                //Запрос данных из Монго-------------------------------------------------------------------------------------
                const mongoProtectedObject = await mongoProtectedObjectsModel
                    .findById(protectedObjectID)
                    .lean();
    
                if (!mongoProtectedObject) {
                    throw ApiError.BadRequest("Не найден ID пультового объекта");
                }

                //Удаление данных apiBlock------------------------------------------------------------------------------------
                if (apiBlock) {
                    for (const block of apiBlock.split(' ')) {
                        delete mongoProtectedObject[block];
                    }
                }

                //Форматированние данных для возврата-------------------------------------------------------------------------
                dtoProtectedObject = new DTOProtectedObject(mongoProtectedObject);
            }

            //Возврат данных----------------------------------------------------------------------------------------------
            return {protectedObject: dtoProtectedObject, ping: 'ping'};

        } catch (error) {
            console.log(error);

            throw error;
        }
    }

    async getUserHardEditForm(inputData) {

        try {

            // console.log('---------------getUserHardEditForm-----------------');

            //Validate date----------------------------------------------------------------------------------------------
            const { apiBlock, userCompare, userDataID, userDataPositions } = inputData;

            const userID = inputData?.arg?._id;

            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            // Выборка данных об объекте----------------------------------------------------------------------------------
            var dtoUser;

            if (userID) {

                //Запрос данных из Монго-------------------------------------------------------------------------------------
                const mongoUser = await mongoUserModel
                    .findById(userID)
                    .lean();
    
                if (!mongoUser) {
                    throw ApiError.BadRequest("Не найден ID пультового объекта");
                }

                //Удаление данных apiBlock------------------------------------------------------------------------------------
                if (apiBlock) {
                    for (const block of apiBlock.split(' ')) {
                        delete mongoUser[block];
                    }
                }

                //Форматированние данных для возврата-------------------------------------------------------------------------
                dtoUser = new DTOUser(mongoUser);
            }

            //Возврат данных----------------------------------------------------------------------------------------------
            return {user: dtoUser, ping: 'ping'};

        } catch (error) {
            console.log(error);

            throw error;
        }
    }

    async getSimCardEditForm(inputData) {

        try {

            console.log('---------------getSimCardEditForm-----------------');

            //Validate date----------------------------------------------------------------------------------------------
            const { apiBlock, userCompare, userDataID, userDataPositions } = inputData;

            const simCardID = inputData?.arg?._id;

            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            // Выборка данных об объекте----------------------------------------------------------------------------------
            var dtoSimCard;

            if (simCardID) {
                console.log(simCardID);
                //Запрос данных из Монго-------------------------------------------------------------------------------------
                const mongoSimCard = await mongoSimCardsModel
                    .findById(simCardID)
                    .populate('protectedObjects.protectedObject', 'number name address')
                    .lean();
    
                if (!mongoSimCard) {
                    throw ApiError.BadRequest("Не найден ID сим карты");
                }

                console.log(mongoSimCard);

                //Удаление данных apiBlock------------------------------------------------------------------------------------
                if (apiBlock) {
                    for (const block of apiBlock.split(' ')) {
                        delete mongoSimCard[block];
                    }
                }

                //Форматированние данных для возврата-------------------------------------------------------------------------
                dtoSimCard = new DTOSimCard(mongoSimCard);
            }

            //Возврат данных----------------------------------------------------------------------------------------------
            return {simCard: dtoSimCard, ping: 'ping'};

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
                .populate('protectedObjects.protectedObject', 'number name address')
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

    async getGuardPosts(inputData) {

        try {

            // console.log('---------------getGuardPostEditForm-----------------');

            //Validate date----------------------------------------------------------------------------------------------
            const { apiBlock, userCompare, userDataID, userDataPositions } = inputData;

            const guardPostID = inputData.arg._id;
            // await new Promise(resolve=>setTimeout(()=>resolve(), 1000))
            // throw new ApiError(500,'dsdsd2222222222222222222222222222222222222222222222222 32ычффффффффффффффффффффффффффффффффффф1 12ывфыв')
            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            // Выборка данных о физ. посте----------------------------------------------------------------------------------
            var dtoGuardPost;
            
            if (guardPostID) {

                //Запрос данных из Монго-------------------------------------------------------------------------------------
                const mongoGuardPost = await mongoGuardPostsModel
                    .findById(guardPostID)
                    .lean();
    
                if (!mongoGuardPost) {
                    throw ApiError.BadRequest("Не найдены данные физ. поста по указанному ID");
                }
    
                //Сверка с доступом к данным---------------------------------------------------------------------------------
                if (userCompare && mongoGuardPost.manager.toString() != userDataID ){
                    throw ApiError.BadRequest("Вы не имеете право доступа к данным физ. поста");
                }
    
                //Удаление данных apiBlock------------------------------------------------------------------------------------
                if (apiBlock) {
                    for (const block of apiBlock.split(' ')) {
                        delete mongoGuardPost[block];
                    }
                }

                //Форматированние данных для возврата-------------------------------------------------------------------------
                dtoGuardPost = new DTOGuardPost(mongoGuardPost);
            }

            // Выборка данных об НСО--------------------------------------------------------------------------------------
            const mongoUsers = await mongoUserModel.find({ positions: FPositionNSO }, 'surname firstName').lean();

            const optionsGuardPostManagers = [{
                label: 'Отсутствует', value: 'EMPTY'
              }, ...mongoUsers?.map((user) => {
                return {
                  label: [user.surname, user.firstName].join(' '),
                  value: user._id.toString()
                }
              })]

            //Возврат данных----------------------------------------------------------------------------------------------
            return { guardPost: dtoGuardPost, optionsGuardPostManagers }

        } catch (error) {
            console.log(error);

            throw error;
        }
    }  
}

export default new ModalService();