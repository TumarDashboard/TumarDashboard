import DTOGuard, { validateYup } from "../dtos/dtoGuard";
import mongoConnect from "../mongo/mongoConnect";
import { ApiError } from "../../middleware/exceptions";
import googleDrive from "../google/api/googleDrive";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoGuardPostsModel from "../mongo/models/mongoGuardPostsModel";
import mongoGuardPostsArchiveModel from "../mongo/models/mongoGuardPostsArchiveModel";
import mongoGuardsModel from "../mongo/models/mongoGuardsModel";
import mongoGuardsArchiveModel from "../mongo/models/mongoGuardsArchiveModel";
import mongoose from "mongoose";

class GuardService {

    async createGuard(inputData) {

        let deleteGuard;

        try {

            //Validate date

            const guardData = await validateYup(inputData, { deleteEmptyKey: true }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            //break image
            let uiAvatarsSrc;
            if(guardData.uiAvatarsSrc){
                uiAvatarsSrc = guardData.uiAvatarsSrc;
                delete guardData['uiAvatarsSrc'];
            }else{

                guardData.uiAvatarsSrc = `https://ui-avatars.com/api/?name=${guardData.surname}+${guardData.firstName}&size=256&font-size=0.33&length=2&background=random`;

            }

            //Check initials condition
            await mongoConnect();

            const candidate = await mongoGuardsModel.findOne({ surname: guardData.surname, firstName: guardData.firstName }).lean();

            if (candidate) {
                throw ApiError.BadRequest(`Инициалы ${guardData.firstName} ${guardData.surname} уже использовались для создания`);
            }

            const candidateDeleted = await mongoGuardsArchiveModel.findOne({ surname: guardData.surname, firstName: guardData.firstName }).lean();

            if (candidateDeleted) {
                throw ApiError.BadRequest(`Инициалы ${guardData.firstName} ${guardData.surname} уже использовались для создания, после чего были деактивированы`);
            }

            //cast manager id from string to id
            let manager;
            if( guardData.manager == 'EMPTY' ){
                guardData.manager = null;
            }else if(guardData.manager){
                guardData.manager = new mongoose.mongo.ObjectId(guardData.manager);
                guardData.managerSheme = 'User';
                manager = await mongoUserModel.findById(guardData.manager, 'surname firstName').lean();
            }

            //cast guardPosts id from string to id
            let guardPosts = guardData.guardPosts;
            if( guardData.guardPosts == 'EMPTY' ){
                guardData.guardPosts = null;
            }else if(guardData.guardPosts){
                guardData.guardPosts = guardData.guardPosts.map((value)=>new mongoose.mongo.ObjectId(value))
            }

            //Create model
            let mongoGuard = await mongoGuardsModel.create( guardData );
            deleteGuard = mongoGuard;

            //Google
            if ( uiAvatarsSrc ) {
    
                const googleDriveFileID = await googleDrive.uploadGuardAvatar( mongoGuard._id.toString(), uiAvatarsSrc );
    
                if (googleDriveFileID)
                    mongoGuard.uiAvatarsSrc = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;

                await mongoGuard.save();
                    
            }

            if( manager ){
                mongoGuard._doc.manager = manager;
            }else{
                mongoGuard._doc.manager = {_id:"EMPTY"};
            }

            if( guardPosts ){
                mongoGuard._doc.guardPosts = guardPosts;
            }
            
            const dtoGuard = new DTOGuard(mongoGuard);

            return { guard: dtoGuard }

        } catch (error) {
            console.log(error);

            if( deleteGuard ){

                try {
    
                    await mongoGuardsModel.deleteOne({ _id: deleteGuard._id })
    
                } catch (error) {
                    
                    throw error;
    
                }

            }

            throw error;
        }

    }

    async editGuard(inputData) {

        //Validate date
        const guardData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

            throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

        });

        //Google
        if ( guardData.uiAvatarsSrc ) {

            const googleDriveFileID = await googleDrive.uploadGuardAvatar( guardData.id, guardData.uiAvatarsSrc );

            if (googleDriveFileID)
            guardData.uiAvatarsSrc = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;
                
        }else{
            delete guardData['uiAvatarsSrc'];
        }

        //cast manager id from string to id
        if( guardData.manager == 'EMPTY' ){
            guardData.manager = null;
        }else if(guardData.manager){
            guardData.manager = new mongoose.mongo.ObjectId(guardData.manager);
            guardData.managerSheme = 'User';
        }

        //cast guardPosts id from string to id
        if( guardData.guardPosts == 'EMPTY' ){
            guardData.guardPosts = null;
        }else if(guardData.guardPosts){
            for (let i = 0; i < guardData.guardPosts.length; i++) {
                guardData.guardPosts[i] = new mongoose.mongo.ObjectId(guardData.guardPosts[i]);
            }
        }

        //Mongo
        await mongoConnect();

        var mongoGuard = await mongoGuardsModel.findById(guardData.id);

        if (!mongoGuard) {
            throw ApiError.BadRequest(`Охранник с id: ${guardData.id} не найден`);
        }

        if (mongoGuard.uiAvatarsSrc.startsWith('https://ui-avatars.com/api/?name=') &&
            !guardPostData.uiAvatarsSrc &&
            ((mongoGuardPost.surname.localeCompare(guardPostData.surname) != 0 )
                || (mongoGuardPost.firstName.localeCompare(guardPostData.firstName) != 0 ))) {

            guardData.uiAvatarsSrc = `https://ui-avatars.com/api/?name=${guardData.surname}+${guardData.firstName}&size=256&font-size=0.33&length=2&background=random`;

        }

        mongoGuard = await mongoGuardsModel.
                                        findByIdAndUpdate(guardData.id, guardData, { new: true }).
                                        populate('manager', 'surname firstName').
                                        populate('guardPosts', 'id').lean();

        //break populate data
        mongoGuard._id = mongoGuard._id.toString();

        if (mongoGuard.manager) {
            mongoGuard.manager._id = mongoGuard.manager._id.toString();
        }else{
            mongoGuard.manager = {_id:"EMPTY"}
        }
        if (mongoGuard.guardPosts) {
            mongoGuard.guardPosts = mongoGuard.guardPosts.map((value)=>value._id.toString())
        }

        //DTO

        const dtoGuard = new DTOGuard(mongoGuard);

        //Result

        return { guard: dtoGuard }

    }

    async deleteGuard(inputData) {
        const { idGuard, idUser, reason } = inputData;

        if( !idGuard ){
            throw ApiError.BadRequest("Не указан ID охранника для проведения операции удаления");
        }

        if( !idUser ){
            throw ApiError.BadRequest("Не указан ID Пользователя для проведения операции удаления");
        }

        //Google

        await googleDrive.deleteGuardAvatar(idGuard);

        //Mongo
            
        await mongoConnect();

        const mongoGuard = await mongoGuardsModel.findById(idGuard);

        if(!mongoGuard){
            throw ApiError.BadRequest("Не найдены данные охранника для проведения операции удаления");
        }

        const mongoGuardArchive = await mongoGuardsArchiveModel.create(mongoGuard.toJSON());

        mongoGuardArchive.reason = reason;
        mongoGuardArchive.userPerfomed = new mongoose.mongo.ObjectId(idUser);
        mongoGuardArchive.userPerfomedSheme = 'User';

        await mongoGuardArchive.save();
        
        await mongoGuard.delete();
        
        const dtoGuard = new DTOGuard(mongoGuardArchive);

        return { guard: dtoGuard }
    }
}

export default new GuardService();