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

function managerEquals( a, b ){
    if( !a && !b ){
        return true;
    }
    if( !a || !b ){
        return false;
    }
    return a.toString().localeCompare( b.toString() );
}

class GuardPostService {

    async createGuardPost(inputData) {

        let deleteGuardPost;

        try {

            //Validate date

            const guardPostData = await validateYup(inputData, { deleteEmptyKey: true }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            //break image
            let photo;
            if (guardPostData.photo) {
                photo = guardPostData.photo;
                delete guardPostData['photo'];
            } else {

                guardPostData.photo = `https://ui-avatars.com/api/?name=${guardPostData.number ? guardPostData.number : guardPostData.callsign?.replace(/ /ig, ',')
                    }&size=256&font-size=0.33&length=3&background=random`;

            }

            //Check number condition
            await mongoConnect();

            if (guardPostData.number) {

                const candidate = await mongoGuardPostsModel.findOne({ number: guardPostData.number }).lean();

                if (candidate) {
                    throw ApiError.BadRequest(`Физ пост с номером ${guardPostData.number} уже существует`);
                }

            }

            //cast manager id from string to id
            let manager;
            if (guardPostData.manager == 'EMPTY') {
                guardPostData.manager = null;
            } else if (guardPostData.manager) {
                guardPostData.manager = new mongoose.mongo.ObjectId(guardPostData.manager);
                guardPostData.managerSheme = 'User';
                manager = await mongoUserModel.findById(guardPostData.manager, 'surname firstName').lean();
            }

            //Create model
            let mongoGuardPost = await mongoGuardPostsModel.create(guardPostData);
            deleteGuardPost = mongoGuardPost;

            //Google
            if (photo) {

                const googleDriveFileID = await googleDrive.uploadGuardPostPhoto(mongoGuardPost._id.toString(), photo);

                if (googleDriveFileID)
                    mongoGuardPost.photo = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;

                await mongoGuardPost.save();

            }

            if (manager) {
                mongoGuardPost._doc.manager = manager;
            }

            const dtoGuardPost = new DTOGuardPost(mongoGuardPost);

            return { guardPost: dtoGuardPost }

        } catch (error) {
            console.log(error);

            if (deleteGuardPost) {

                try {

                    await mongoGuardPostsModel.deleteOne({ _id: deleteGuardPost._id })

                } catch (error) {

                    throw error;

                }

            }

            throw error;
        }

    }

    async editGuardPost(inputData) {
        try {
            // console.log('-----------------------editGuardPost-------------------');

            //Validate date 
            if (inputData.number) {
                inputData.number = parseInt(inputData.number);
            }

            if (inputData.rate) {
                inputData.rate = parseFloat(inputData.rate);
            }

            const guardPostData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });
            
            //Google
            if (guardPostData.photo) {

                const googleDriveFileID = await googleDrive.uploadGuardPostPhoto(guardPostData.id, guardPostData.photo);

                if (googleDriveFileID)
                    guardPostData.photo = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;

            } else {
                delete guardPostData['photo'];
            }

            //cast manager id from string to id
            if (guardPostData.manager == 'EMPTY') {
                guardPostData.manager = null;
                guardPostData.managerSheme = null;
            } else if (guardPostData.manager) {
                guardPostData.manager = new mongoose.mongo.ObjectId(guardPostData.manager);
                guardPostData.managerSheme = 'User';
            }

            //Mongo
            await mongoConnect();

            var mongoGuardPost = await mongoGuardPostsModel.findById(guardPostData.id);

            if (!mongoGuardPost) {
                throw ApiError.BadRequest(`Физ. пост с id: ${guardPostData.id} не найден`);
            }

            if (mongoGuardPost.photo.startsWith('https://ui-avatars.com/api/?name=') &&
                !guardPostData.photo &&
                ((mongoGuardPost.number != guardPostData.number)
                    || (mongoGuardPost.callsign.localeCompare(guardPostData.callsign) != 0))) {

                guardPostData.photo = `https://ui-avatars.com/api/?name=${guardPostData.number ? guardPostData.number : guardPostData.callsign.replace(/ /ig, ',')
                    }&size=256&font-size=0.33&length=3&background=random`;

            }

            // Обновляем данные в записях о графиках физ постов--------------------------------------------------------------------------------------------------------
            if( !managerEquals(mongoGuardPost.manager, guardPostData.manager) || mongoGuardPost.rate != guardPostData.rate ){

                const month = new Date(getCurrentMonth());

                if( guardPostData.rate == null && guardPostData.manager == null ){

                    await mongoTimesheetsGuardPostModel.deleteOne({ guardPost: mongoGuardPost._id, month: month });
                    
                }else{

                    await mongoTimesheetsGuardPostModel.updateOne({
                        guardPost: mongoGuardPost._id,
                        month: month
                    }, {
                        manager: guardPostData.manager,
                        managerSheme: guardPostData.managerSheme,
                        rate: guardPostData.rate
                    });

                }
            }

            // Обновляем данные в самого физ поста---------------------------------------------------------------------------------------------------------------------
            mongoGuardPost = await mongoGuardPostsModel.
                findByIdAndUpdate(guardPostData.id, guardPostData, { new: true }).
                populate('manager', 'surname firstName').lean();

            //DTO
            const dtoGuardPost = new DTOGuardPost(mongoGuardPost);

            //Result

            return { guardPost: dtoGuardPost }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getGuardPost(inputData) {

        try {

            // console.log('-------------------------------------');
            const month = new Date(getCurrentMonth());
            const day = (new Date()).getDate() - 1;

            // console.log('getTimesheetToday: %o', day);

            //Check initials condition
            await mongoConnect();

            //Запустить агрегат на посты
            const responceAggregateUpdateData = await mongoTimesheetsGuardsModel.aggregate([
                {
                    $match: {
                        month: month,
                        timesheetDays: day
                    }
                },
                {
                    $project: {
                        guardPost: 1,
                        guard: 1,
                    }
                },
                {
                    $group: {
                        _id: '$guardPost',
                        today: {
                            $push: {
                                guard: "$guard",
                            }
                        }
                    }
                },
            ]).then(responce => responce.map(element => {
                //Результат - все посты имеющие охранников за сегодня
                return {
                    _id: element._id.toString(),
                    today: element.today.map(value => value.guard.toString()),
                }
            }));

            // console.log('responceAggregateUpdateData: %o', responceAggregateUpdateData);
            return responceAggregateUpdateData;

        } catch (error) {
            console.log(error);

            throw error;
        }
    }

    async deleteGuardPost(inputData) {
        const { idGuardPost, idUser, reason } = inputData;

        if (!idGuardPost) {
            throw ApiError.BadRequest("Не указан ID физ. поста для проведения операции удаления");
        }

        if (!idUser) {
            throw ApiError.BadRequest("Не указан ID Пользователя, проводящего операцию удаления");
        }

        //Google

        await googleDrive.deleteGuardPostAvatar(idGuardPost);

        //Mongo

        await mongoConnect();

        const userPerfomed = await mongoUserModel.findById(idUser, 'surname firstName').lean();

        if (!userPerfomed) {
            throw ApiError.BadRequest("Не найден ID Пользователя, проводящего операцию удаления");
        }

        const mongoGuardPost = await mongoGuardPostsModel.findById(idGuardPost);

        if (!mongoGuardPost) {
            throw ApiError.BadRequest("Не найден физ. пост для проведения операции удаления");
        }
        
        const mongoGuardPostArchive = await mongoGuardPostsArchiveModel.create(mongoGuardPost.toJSON());

        mongoGuardPostArchive.reason = reason;
        mongoGuardPostArchive.userPerfomed = userPerfomed._id;
        mongoGuardPostArchive.userPerfomedSheme = 'User';

        await mongoGuardPostArchive.save();

        await mongoGuardsModel.updateMany({ guardPosts: mongoGuardPost.id }, {
            $pullAll: {
                guardPosts: [mongoGuardPost.id]
            }
        }).lean();

        await mongoGuardsArchiveModel.updateMany({ guardPosts: mongoGuardPost.id }, {
            $pullAll: {
                guardPosts: [mongoGuardPost.id]
            }
        }).lean();

        await mongoGuardPost.delete();

        mongoGuardPostArchive.userPerfomed = userPerfomed;

        const dtoGuardPost = new DTOGuardPostArchive(mongoGuardPostArchive);

        if( mongoGuardPostArchive.manager ){
            dtoGuardPost.manager = await mongoUserModel.findById(mongoGuardPostArchive.manager, 'surname firstName').lean();            
            if(!dtoGuardPost.manager){
                dtoGuardPost.manager = await mongoUserArchiveModel.findById(mongoGuardPostArchive.manager, 'surname firstName').lean();
            }
        }

        return { guardPost: dtoGuardPost }
    }

    async recoverGuardPost(inputData) {

        const { idGuardPost } = inputData;

        if (!idGuardPost) {
            throw ApiError.BadRequest("Не указан ID физ. поста для проведения операции восстановления");
        }

        //Mongo

        await mongoConnect();

        const mongoGuardPostArchive = await mongoGuardPostsArchiveModel.findById(idGuardPost);

        if (!mongoGuardPostArchive) {
            throw ApiError.BadRequest("Не найден физ. пост для проведения операции восстановления");
        }

        if(mongoGuardPostArchive['reason']) delete mongoGuardPostArchive['reason'];
        if(mongoGuardPostArchive['userPerfomed']) delete mongoGuardPostArchive['userPerfomed'];
        if(mongoGuardPostArchive['userPerfomedSheme']) delete mongoGuardPostArchive['userPerfomedSheme'];

        const mongoGuardPost = await mongoGuardPostsModel.create(mongoGuardPostArchive.toJSON());

        await mongoGuardPostArchive.delete();

        const dtoGuardPost = new DTOGuardPost(mongoGuardPost);

        if( mongoGuardPost.manager ){
            dtoGuardPost.manager = await mongoUserModel.findById(mongoGuardPost.manager, 'surname firstName').lean();            
            if(!dtoGuardPost.manager){
                dtoGuardPost.manager = await mongoUserArchiveModel.findById(mongoGuardPost.manager, 'surname firstName').lean();
            }
        }

        return { guardPost: dtoGuardPost }
    }

}

export default new GuardPostService();