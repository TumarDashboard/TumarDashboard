import DTOGuard, { validateYup } from "../dtos/dtoGuard";
import mongoConnect from "../mongo/mongoConnect";
import { ApiError } from "../../middleware/exceptions";
import googleDrive from "../google/api/googleDrive";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoGuardPostsModel from "../mongo/models/mongoGuardPostsModel";
import mongoGuardPostsArchiveModel from "../mongo/models/mongoGuardPostsArchiveModel";
import mongoGuardsModel from "../mongo/models/mongoGuardsModel";
import mongoGuardsArchiveModel from "../mongo/models/mongoGuardsArchiveModel";
import mongoTimesheetsGuardsModel from "../mongo/models/mongoTimesheetsGuardsModel";
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

            //Check exist condition
            const candidateCondition = [ 
                { surname: guardData.surname, firstName: guardData.firstName }, 
                guardData.iin ? { iin: guardData.iin } : null
            ].filter(Boolean);

            const candidate = await mongoGuardsModel.findOne({ $or: candidateCondition }).lean();

            if (candidate) {
                
                if(guardData.iin && guardData.iin == candidate.iin ){
                    throw ApiError.BadRequest(`ИИН ${candidate.iin} уже использовались для создания ${candidate.firstName} ${candidate.surname}`);
                }

                throw ApiError.BadRequest(`Инициалы ${candidate.firstName} ${candidate.surname} уже использовались для создания`);
            }

            const candidateDeleted = await mongoGuardsArchiveModel.findOne({ $or: candidateCondition }).lean();

            if (candidateDeleted) {
                
                if(guardData.iin && guardData.iin == candidateDeleted.iin ){
                    throw ApiError.BadRequest(`ИИН ${candidateDeleted.iin} уже использовались для создания ${candidateDeleted.firstName} ${candidateDeleted.surname}, после чего были деактивированы`);
                }

                throw ApiError.BadRequest(`Инициалы ${candidateDeleted.firstName} ${candidateDeleted.surname} уже использовались для создания, после чего были деактивированы`);
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
        // console.log(inputData);
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

        // check exist condition
        const candidateCondition = [ 
            { surname: guardData.surname, firstName: guardData.firstName }, 
            guardData.iin ? { iin: guardData.iin } : null
        ].filter(Boolean);

        const candidate = await mongoGuardsModel.findOne({ $and: [
            { $or: candidateCondition },
            { _id: { $ne: guardData.id } }
        ] }).lean();

        if (candidate) {
            
            if(guardData.iin && guardData.iin == candidate.iin ){
                throw ApiError.BadRequest(`ИИН ${candidate.iin} уже используются для данных сотрудника ${candidate.firstName} ${candidate.surname}`);
            }

            throw ApiError.BadRequest(`Инициалы ${candidate.firstName} ${candidate.surname} уже используются для данных другого сотрудника`);
        }

        const candidateDeleted = await mongoGuardsArchiveModel.findOne({ $and: [
            { $or: candidateCondition },
            { _id: { $ne: guardData.id } }
        ] }).lean();

        if (candidateDeleted) {
            
            if(guardData.iin && guardData.iin == candidateDeleted.iin ){
                throw ApiError.BadRequest(`ИИН ${candidateDeleted.iin} уже использовались для данных сотрудника  ${candidateDeleted.firstName} ${candidateDeleted.surname}, после чего были деактивированы`);
            }

            throw ApiError.BadRequest(`Инициалы ${candidateDeleted.firstName} ${candidateDeleted.surname} уже использовались для данных другого сотрудника, после чего были деактивированы`);
        }
        //Абдулла Нурлыбек
        //Update model
        var mongoGuard = await mongoGuardsModel.findById(guardData.id);

        if (!mongoGuard) {
            throw ApiError.BadRequest(`Охранник с id: ${guardData.id} не найден`);
        }

        if (mongoGuard.uiAvatarsSrc.startsWith('https://ui-avatars.com/api/?name=') &&
            !guardData.uiAvatarsSrc &&
            ((guardData.surname.localeCompare(mongoGuard.surname) != 0 )
                || (guardData.firstName.localeCompare(mongoGuard.firstName) != 0 ))) {
            
            guardData.uiAvatarsSrc = `https://ui-avatars.com/api/?name=${guardData.surname}+${guardData.firstName}&size=256&font-size=0.33&length=2&background=random`;
        }

        mongoGuard = await mongoGuardsModel.
                                        findByIdAndUpdate(guardData.id, guardData, { new: true }).
                                        populate('guardPosts', 'id').lean();

        //break populate data
        mongoGuard._id = mongoGuard._id.toString();

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
            throw ApiError.BadRequest("Не указан ID Пользователя, проводящего операцию удаления");
        }

        //Google

        await googleDrive.deleteGuardAvatar(idGuard);

        //Mongo 
        await mongoConnect();

        //Delete model
        const mongoGuard = await mongoGuardsModel.findById(idGuard);

        if(!mongoGuard){
            throw ApiError.BadRequest("Не найдены данные охранника для проведения операции удаления");
        }

        const mongoGuardArchive = await mongoGuardsArchiveModel.create(mongoGuard.toJSON());

        mongoGuardArchive.reason = reason;
        mongoGuardArchive.userPerfomed = new mongoose.mongo.ObjectId(idUser);
        mongoGuardArchive.userPerfomedSheme = 'User';

        await mongoGuardArchive.save();

        await mongoTimesheetsGuardsModel.updateMany({guard: mongoGuard.id}, {
            guard: mongoGuardArchive._id,
            guardSheme:'GuardsArchive'
        }).lean();

        await mongoGuard.delete();
        
        const dtoGuard = new DTOGuard(mongoGuardArchive);

        return { guard: dtoGuard }
    }

    async recoverGuard(inputData) {

        const { idGuard } = inputData;

        if( !idGuard ){
            throw ApiError.BadRequest("Не указан ID охранника для проведения операции удаления");
        }

        //Mongo 
        await mongoConnect();

        //Delete model
        const mongoGuardArchive = await mongoGuardsArchiveModel.findById(idGuard);

        if(!mongoGuardArchive){
            throw ApiError.BadRequest("Не найдены данные охранника для проведения операции удаления");
        }

        if(mongoGuardArchive['reason']) delete mongoGuardArchive['reason'];
        if(mongoGuardArchive['userPerfomed']) delete mongoGuardArchive['userPerfomed'];
        if(mongoGuardArchive['userPerfomedSheme']) delete mongoGuardArchive['userPerfomedSheme'];

        const mongoGuard = await mongoGuardsModel.create(mongoGuardArchive.toJSON());

        await mongoTimesheetsGuardsModel.updateMany({guard: mongoGuardsArchiveModel.id}, {
            guard: mongoGuard._id,
            guardSheme:'Guards'
        }).lean();

        await mongoGuardArchive.delete();
        
        const dtoGuard = new DTOGuard(mongoGuard);

        return { guard: dtoGuard }
    }
}

export default new GuardService();