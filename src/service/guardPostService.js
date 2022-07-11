import DTOGuardPost, { validateYup } from "../dtos/dtoGuardPost";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoConnect from "../mongo/mongoConnect";
import { ApiError } from "../../middleware/exceptions";
import googleDrive from "../google/api/googleDrive";
import mongoGuardPostsModel from "../mongo/models/mongoGuardPostsModel";
import mongoGuardPostsArchiveModel from "../mongo/models/mongoGuardPostsArchiveModel";
import mongoGuardsModel from "../mongo/models/mongoGuardsModel";
import mongoGuardsArchiveModel from "../mongo/models/mongoGuardsArchiveModel";
import mongoose from "mongoose";

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
            if(guardPostData.photo){
                photo = guardPostData.photo;
                delete guardPostData['photo'];
            }else{

                guardPostData.photo = `https://ui-avatars.com/api/?name=${ 
                    guardPostData.number ? guardPostData.number : guardPostData.name.replace(/ /ig, ',')
                }&size=256&font-size=0.33&length=3&background=random`;

            }

            //Check number condition
            await mongoConnect();
            
            if( guardPostData.number ){

                const candidate = await mongoGuardPostsModel.findOne({ number: guardPostData.number }).lean();

                if (candidate) {
                    throw ApiError.BadRequest(`Физ пост с номером ${guardPostData.number} уже существует`);
                }

            }

            //cast manager id from string to id
            let manager;
            if( guardPostData.manager == 'EMPTY' ){
                guardPostData.manager = null;
            }else if(guardPostData.manager){
                guardPostData.manager = new mongoose.mongo.ObjectId(guardPostData.manager);
                guardPostData.managerSheme = 'User';
                manager = await mongoUserModel.findById(guardPostData.manager, 'surname firstName').lean();
            }

            //Create model
            let mongoGuardPost = await mongoGuardPostsModel.create( guardPostData );
            deleteGuardPost = mongoGuardPost;

            //Google
            if ( photo ) {
    
                const googleDriveFileID = await googleDrive.uploadGuardPostPhoto( mongoGuardPost._id.toString(), photo );
    
                if (googleDriveFileID)
                    mongoGuardPost.photo = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;

                await mongoGuardPost.save();
                    
            }

            if( manager ){
                mongoGuardPost._doc.manager = manager;
            }
            
            const dtoGuardPost = new DTOGuardPost(mongoGuardPost);

            return { guardPost: dtoGuardPost }

        } catch (error) {
            console.log(error);

            if( deleteGuardPost ){

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

        //Validate date
        if( inputData.number ){
            inputData.number = parseInt(inputData.number);
        }

        const guardPostData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

            throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

        });

        //Google
        if ( guardPostData.photo ) {

            const googleDriveFileID = await googleDrive.uploadGuardPostPhoto( guardPostData.id, guardPostData.photo );

            if (googleDriveFileID)
            guardPostData.photo = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;
                
        }else{
            delete guardPostData['photo'];
        }

        //cast manager id from string to id
        if( guardPostData.manager == 'EMPTY' ){
            guardPostData.manager = null;
        }else if(guardPostData.manager){
            guardPostData.manager = new mongoose.mongo.ObjectId(guardPostData.manager);
            guardPostData.managerSheme = 'User';
        }

        //Mongo
        await mongoConnect();

        const mongoGuardPost = await mongoGuardPostsModel.
                                        findByIdAndUpdate(guardPostData.id, guardPostData, { new: true }).
                                        populate('manager', 'surname firstName').lean();

        if (!mongoGuardPost) {
            throw ApiError.BadRequest(`Физ. пост с id: ${guardPostData.id} не найден`);
        }

        //DTO

        const dtoGuardPost = new DTOGuardPost(mongoGuardPost);

        //Result

        return { guardPost: dtoGuardPost }

    }

    async deleteGuardPost(inputData) {
        const { idGuardPost, idUser, reason } = inputData;

        if( !idGuardPost ){
            throw ApiError.BadRequest("Не указан ID физ. поста для проведения операции удаления");
        }

        if( !idUser ){
            throw ApiError.BadRequest("Не указан ID Пользователя для проведения операции удаления");
        }

        //Google

        await googleDrive.deleteGuardPostAvatar(idGuardPost);

        //Mongo
            
        await mongoConnect();

        const mongoGuardPost = await mongoGuardPostsModel.findById(idGuardPost);

        if(!mongoGuardPost){
            throw ApiError.BadRequest("Не найден физ. пост для проведения операции удаления");
        }

        const mongoGuardPostArchive = await mongoGuardPostsArchiveModel.create(mongoGuardPost.toJSON());

        mongoGuardPostArchive.reason = reason;
        mongoGuardPostArchive.userPerfomed = new mongoose.mongo.ObjectId(idUser);
        mongoGuardPostArchive.userPerfomedSheme = 'User';

        await mongoGuardPostArchive.save();

        await mongoGuardsModel.updateMany({guardPosts: mongoGuardPost.id}, {
            $pullAll: {
                guardPosts: [ mongoGuardPost.id ]
            }
        }).lean();

        await mongoGuardsArchiveModel.updateMany({guardPosts: mongoGuardPost.id}, {
            $pullAll: {
                guardPosts: [ mongoGuardPost.id ]
            }
        }).lean();
        
        await mongoGuardPost.delete();
        
        const dtoGuardPost = new DTOGuardPost(mongoGuardPostArchive);

        return { guardPost: dtoGuardPost }
    }
}

export default new GuardPostService();