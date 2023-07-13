import bcrypt from "bcrypt";
import { v4 } from "uuid";
import mailService from "./mailService";
import * as tokenService from "./tokenService";
import DTOUser, { validateYup } from "../dtos/dtoUser";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoUserArchiveModel from "../mongo/models/mongoUserArchiveModel";
import mongoGuardPostsModel from "../mongo/models/mongoGuardPostsModel";
import mongoGuardPostsArchiveModel from "../mongo/models/mongoGuardPostsArchiveModel";
import mongoGuardsModel from "../mongo/models/mongoGuardsModel";
import mongoGuardsArchiveModel from "../mongo/models/mongoGuardsArchiveModel";
import mongoConnect from "../mongo/mongoConnect";
import { ApiError } from "../../middleware/exceptions";
import googleDrive from "../google/api/googleDrive";
import mongoTimesheetsGuardPostModel from "../mongo/models/mongoTimesheetsGuardPostModel";
import { getCurrentDateStamp, getDateStamp } from "../utils/dateUtils";
import { getPositionWithCodeList } from "../../components/levelZ_variable/FPositionItemList";
import mongoose from "mongoose";
import { equalArrays } from "../utils/arrayUtils";

class UserService {

    /*-------------------------------------------------------------------------------------------------------
        Self функции
    -------------------------------------------------------------------------------------------------------*/
    async registration(surname, firstName, patronymic, email, password) {

        try {

            await validateYup({ surname, firstName, patronymic, email, password }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            await mongoConnect();

            const candidate = await mongoUserModel.findOne({ email }).lean();

            if (candidate) {
                throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
            }            
            
            const candidateDeleted = await mongoUserArchiveModel.findOne({ email }).lean();

            if (candidateDeleted) {
                throw ApiError.BadRequest(`Почтовый адрес ${email} использовался для регистрации, после чего был деактивирован`);
            }

            const hashPassword = await bcrypt.hash(password, parseInt(process.env.NEXT_PRIVATE_PASSWORD_SALT))

            const activationLink = v4();

            const mongoUser = await mongoUserModel.create({
                surname: surname,
                firstName: firstName,
                patronymic: patronymic,
                email: email,
                password: hashPassword,
                activationLink: activationLink,
                uiAvatarsSrc: `https://ui-avatars.com/api/?name=${surname}+${firstName}&size=256&font-size=0.33&length=2&background=random`,
            });

            await mailService.sendActivationMail(email, `${process.env.NEXT_PUBLIC_API_URL}/api/authorization/activate/${activationLink}`).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка отправки письма для активации на почту ${email}( ${e.response} )`);

            });

            const dtoUser = new DTOUser(mongoUser);

            const tokens = await tokenService.generateTokens({ ...dtoUser });

            await tokenService.saveToken(dtoUser.id, tokens.refreshToken);

            return { ...tokens, user: dtoUser }

        } catch (error) {

            console.log(error);

            try {

                await mongoUserModel.deleteOne({
                    email: email
                }).lean()

            } catch (error) {

                throw error;

            }

            throw error;
        }

    }

    async activate(activationLink) {

        await mongoConnect();

        const mongoUser = await mongoUserModel.findOne({ activationLink });

        if (!mongoUser) {
            throw ApiError.BadRequest('Неккоректная ссылка активации');
        }

        mongoUser.isActivated = true;
        mongoUser.activationLink = undefined;

        await mongoUser.save();

        const dtoUser = new DTOUser(mongoUser);

        const tokens = await tokenService.generateTokens({ ...dtoUser });

        await tokenService.saveToken(dtoUser.id, tokens.refreshToken);

        return { ...tokens, user: dtoUser }

    }

    async login(email, password) {

        await validateYup({ email, password }).catch((e) => {

            throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

        });

        await mongoConnect();

        const mongoUser = await mongoUserModel.findOne({ email }).lean();

        if (!mongoUser) {
            throw ApiError.BadRequest(`Пользователь с указанным адресом электронной почты не найден`);
        }

        const isPassEquals = await bcrypt.compare(password, mongoUser.password)

        if (!isPassEquals) {
            throw ApiError.BadRequest(`Некорректный пароль`);
        }

        const dtoUser = new DTOUser(mongoUser);

        const tokens = await tokenService.generateTokens({ ...dtoUser });

        await tokenService.saveToken(dtoUser.id, tokens.refreshToken);

        return { ...tokens, user: dtoUser }

    }

    async logout(refreshToken) {

        await mongoConnect();

        return await tokenService.removeToken(refreshToken);

    }

    async refresh(refreshToken, store) {

        const {dtoUser, noUpdate} = await this.checkAuth(refreshToken, store);

        if( noUpdate ){

            const accessToken = await tokenService.generateAccessToken({ ...dtoUser });

            // console.log('refresh autorizate token %o for user %o', refreshToken, dtoUser);
    
            return { accessToken: accessToken, refreshToken: refreshToken, user: dtoUser }

        }else{

            const tokens = await tokenService.generateTokens({ ...dtoUser });
    
            await tokenService.saveToken(dtoUser.id, tokens.refreshToken);

            // console.log('refresh update refreshToken %o for user %o', tokens.refreshToken, dtoUser);
    
            return { ...tokens, user: dtoUser }

        }

    }

    async checkAuth(refreshToken, store) {
        try {

            // throw ApiError.UnauthorizedError();
            // console.log('checkAuth for token: %s',refreshToken);

            if (!refreshToken) {
                // console.log('checkAuth error: отстутствует refreshToken: %s', refreshToken );
                throw ApiError.UnauthorizedError();
            }
    
            const userData = await tokenService.validateRefreshToken(refreshToken);

            // console.log('checkAuth validate userData from refreshToken: %o', userData);

            if (!userData) {
                // console.log('checkAuth error: отстутствует userData: %o', userData );
                throw ApiError.UnauthorizedError();
            }

            await mongoConnect();
    
            const tokenFromDb = await tokenService.findToken(refreshToken);

            // console.log('checkAuth finded tokenFromDb in db: %o', tokenFromDb);

            if (!tokenFromDb) {

                // console.log('checkAuth error: отстутствует tokenFromDb: %o', tokenFromDb );
    
                // const tokenFromDbByID = await tokenService.findTokenByUserID(userData.id);

                // console.log('checkAuth error: текущий tokenFromDbByID: %o', tokenFromDbByID );

                throw ApiError.UnauthorizedError();
            }

            const mongoUser = await mongoUserModel.findById(userData.id, store == 'update' ? '-uiAvatarsSrc' : '').lean();

            // console.log('checkAuth finded mongoUser in db: %o', mongoUser);
    
            if (!mongoUser) {
                // console.log('checkAuth error: отстутствует mongoUser: %o', mongoUser );
                throw ApiError.BadRequest(`При обновлении токена сессии была обнаружена ошибка`);
            }

            const dtoUser = new DTOUser(mongoUser);

            const noUpdate = dtoUser.equals(userData) && ( userData.exp - userData.iat > 5000 );

            // console.log('checkAuth is finished with store "%o" and return %o', store, result);
            
            return {dtoUser, noUpdate};
            
        } catch (error) {
            // console.log(error, refreshToken);
            throw error
        }
    }

    async changeUser(inputUserData) {

        //Validate date
        const userData = await validateYup(inputUserData, { deleteEmptyKey: false }).catch((e) => {

            throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

        });

        if( userData.isActivated ){
            delete userData['isActivated'];
        }

        if( userData.activationLink ){
            delete userData['activationLink'];
        }

        //Google
        if (userData.uiAvatarsSrc) {

            const googleDriveFileID = await googleDrive.uploadUserAvatar(userData.id, userData.uiAvatarsSrc);

            if (googleDriveFileID)
                userData.uiAvatarsSrc = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;
        }else{
            delete userData['uiAvatarsSrc'];
        }

        //Mongo

        await mongoConnect();

        const mongoUser = await mongoUserModel.findByIdAndUpdate(userData.id, userData, { new: true }).lean();

        if (!mongoUser) {
            throw ApiError.BadRequest(`Пользователь с id: ${userData.id} не найден`);
        }

        //DTO

        const dtoUser = new DTOUser(mongoUser);

        //Tokens

        const tokens = await tokenService.generateTokens({ ...dtoUser });

        await tokenService.saveToken(dtoUser.id, tokens.refreshToken);

        //Result

        // console.log(inputUserData);

        return { ...tokens, user: dtoUser }

    }

    async changeUserPassword(inputUserData) {
        //Validate date

        const userData = await validateYup(inputUserData, { deleteEmptyKey: false }).catch((e) => {

            throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

        });

        await mongoConnect();

        const mongoUser = await mongoUserModel.findById(userData.id);

        if (!mongoUser) {
            throw ApiError.BadRequest('Пользователь с указанным id не найден');
        }
        console.log('changeUserPassword %s', mongoUser.password);
        const isPassEquals = await bcrypt.compare(userData.password, mongoUser.password)

        if (!isPassEquals) {
            throw ApiError.BadRequest('Старый пароль указан некорректно');
        }

        const hashPassword = await bcrypt.hash(userData.passwordNew, parseInt(process.env.NEXT_PRIVATE_PASSWORD_SALT))

        mongoUser.password = hashPassword;

        await mongoUser.save();

    }

    async deleteUser(requestData) {

        const { id, reason } = requestData;

        if (!id) {
            throw ApiError.BadRequest("Не указан ID пользователя для проведения операции удаления");
        }

        //Google

        await googleDrive.deleteUserAvatar(id);

        //Mongo

        await mongoConnect();

        const mongoUser = await mongoUserModel.findById(id);

        const mongoUserArchive = await mongoUserArchiveModel.create(mongoUser.toJSON());

        mongoUserArchive.reason = reason;
        mongoUserArchive.userPerfomed = new mongoose.mongo.ObjectId(id);
        mongoUserArchive.userPerfomedSheme = 'UserArchive';

        await mongoUserArchive.save();
        
        await mongoUser.delete();
        
        // Rewrite sheme for all dependencies
        await mongoUserArchiveModel.updateMany({userPerfomed: mongoUserArchive.id, _id:{ $ne: id }}, {userPerfomedSheme:'UserArchive'}).lean();

        await mongoGuardPostsModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        await mongoGuardPostsArchiveModel.updateMany({userPerfomed: mongoUserArchive.id}, {userPerfomedSheme:'UserArchive'}).lean();

        await mongoGuardPostsArchiveModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        await mongoGuardsModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        await mongoGuardsArchiveModel.updateMany({userPerfomed: mongoUserArchive.id}, {userPerfomedSheme:'UserArchive'}).lean();

        await mongoGuardsArchiveModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        await mongoTimesheetsGuardPostModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        //Tokens

        return await tokenService.removeTokenByID(id);

    }

    async getUsersInitialsWithPositions(positions){

        if( !positions || positions.length == 0 )
            return {};

        await mongoConnect();

        const users = await mongoUserModel.find({positions: {"$in": positions}}, 'surname firstName patronymic positions').lean();

        const result = {};

        for (const position of positions) {
            const usersOnPosition = users.filter((user)=>user.positions.includes(position));
            result[position] = usersOnPosition.length > 0 ? [
                usersOnPosition[0].surname,
                usersOnPosition[0].firstName?.length > 0 ? usersOnPosition[0].firstName.charAt(0) + '.' : null,
                usersOnPosition[0].patronymic?.length > 0 ? usersOnPosition[0].patronymic.charAt(0) + '.' : null,
              ].filter(Boolean).join(' ') : '';
        }

        return result;

    }

    /*-------------------------------------------------------------------------------------------------------
        Hard функции
    -------------------------------------------------------------------------------------------------------*/
    async createUserHard(inputData) {

        let deleteUser;

        try {

            //Validate date
            const userData = await validateYup(inputData, { deleteEmptyKey: true }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            //break image
            let uiAvatarsSrc;
            if(userData.uiAvatarsSrc){
                uiAvatarsSrc = userData.uiAvatarsSrc;
                delete userData['uiAvatarsSrc'];
            }else{

                userData.uiAvatarsSrc = `https://ui-avatars.com/api/?name=${userData.surname}+${userData.firstName}&size=256&font-size=0.33&length=2&background=random`;

            }

            //mongoConnect
            await mongoConnect();

            //check existing
            var candidate = await mongoUserModel.findOne({ email: userData.email }).lean();

            if (candidate) {
                throw ApiError.BadRequest(`Пользователь с почтовым адресом ${userData.email} уже существует`);
            }      

            candidate = await mongoUserModel.findOne({ surname: userData.surname, firstName: userData.firstName }).lean();

            if (candidate) {
                throw ApiError.BadRequest(`Инициалы ${userData.firstName} ${userData.surname} уже использовались для создания`);
            }  

            var candidateDeleted = await mongoUserArchiveModel.findOne({ email: userData.email }).lean();

            if (candidateDeleted) {
                throw ApiError.BadRequest(`Почтовый адрес ${userData.email} использовался для регистрации, после чего был деактивирован`);
            }

            candidateDeleted = await mongoUserArchiveModel.findOne({ surname: userData.surname, firstName: userData.firstName }).lean();

            if (candidateDeleted) {
                throw ApiError.BadRequest(`Инициалы ${userData.firstName} ${userData.surname} уже использовались для создания, после чего были деактивированы`);
            }

            //password create
            const password = 'State' + getCurrentDateStamp();

            const hashPassword = await bcrypt.hash(password, parseInt(process.env.NEXT_PRIVATE_PASSWORD_SALT))

            const activationLink = v4();

            userData.password = hashPassword;

            userData.activationLink = activationLink;

            //Create model
            let mongoUser = await mongoUserModel.create( userData );
            deleteUser = mongoUser;

            //Google
            if ( uiAvatarsSrc ) {
    
                const googleDriveFileID = await googleDrive.uploadUserAvatar( mongoUser._id.toString(), uiAvatarsSrc );
    
                if (googleDriveFileID)
                    mongoUser.uiAvatarsSrc = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;

                await mongoUser.save();
                    
            }
            
            //Send activation link
            await mailService.sendActivationMail(mongoUser.email, 
                `${process.env.NEXT_PUBLIC_API_URL}/authorization/activatelink/${mongoUser.activationLink}`).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка отправки письма для активации на почту ${email}( ${e.response} )`);

            });

            //prepare responce
            const dtoUser = new DTOUser(mongoUser);
            console.log(dtoUser,mongoUser);
            dtoUser._id = mongoUser._id.toString();

            if(dtoUser.positions){
                dtoUser.positionsText = getPositionWithCodeList(dtoUser.positions);
            }

            //return responce
            return { user: dtoUser }

        } catch (error) {
            console.log(error);

            if( deleteUser ){

                try {
    
                    await mongoUserModel.deleteOne({ _id: deleteUser._id })
    
                } catch (error) {
                    
                    throw error;
    
                }

            }

            throw error;
        }

    }

    async editUserHard(inputData) {

        //Validate date
        const userData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {
            throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);
        });

        //Google
        if (userData.uiAvatarsSrc) {

            const googleDriveFileID = await googleDrive.uploadUserAvatar(userData.id, userData.uiAvatarsSrc);

            if (googleDriveFileID)
                userData.uiAvatarsSrc = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;
        }else{
            delete userData['uiAvatarsSrc'];
        }

        //mongoConnect
        await mongoConnect();

        //Update model
        var mongoUser = await mongoUserModel.findById(userData.id);

        if (!mongoUser) {
            throw ApiError.BadRequest(`Охранник с id: ${userData.id} не найден`);
        }

        if (mongoUser.uiAvatarsSrc && 
            mongoUser.uiAvatarsSrc.startsWith('https://ui-avatars.com/api/?name=') &&
            ((userData.surname.localeCompare(mongoUser.surname) != 0 )
                || (userData.firstName.localeCompare(mongoUser.firstName) != 0 ))) {
            
            userData.uiAvatarsSrc = `https://ui-avatars.com/api/?name=${userData.surname}+${userData.firstName}&size=256&font-size=0.33&length=2&background=random`;
        }

        if( !equalArrays(mongoUser.positions, userData.positions)){
            await tokenService.removeTokenByID(userData.id);
        }

        mongoUser = await mongoUserModel.findByIdAndUpdate(userData.id, userData, { new: true }).lean();

        //prepare responce
        const dtoUser = new DTOUser(mongoUser);

        dtoUser._id = mongoUser._id.toString();

        if(dtoUser.positions){
            dtoUser.positionsText = getPositionWithCodeList(dtoUser.positions);
        }

        //Result
        return { user: dtoUser }

    }

    async deleteUserHard(inputData) {

        // const { id, reason } = requestData;
        const { id, idHard, reason } = inputData;

        //Validate date
        if (!id) {
            throw ApiError.BadRequest("Не указан ID пользователя для проведения операции удаления");
        }

        if( !idHard ){
            throw ApiError.BadRequest("Не указан ID Пользователя, проводящего операцию удаления");
        }

        //Google
        await googleDrive.deleteUserAvatar(id);

        //Mongo
        await mongoConnect();

        //Delete model
        const mongoUser = await mongoUserModel.findById(id);

        if(!mongoUser){
            throw ApiError.BadRequest("Не найдены данные пользователя для проведения операции удаления");
        }

        const mongoUserArchive = await mongoUserArchiveModel.create(mongoUser.toJSON());

        mongoUserArchive.reason = reason;
        mongoUserArchive.userPerfomed = new mongoose.mongo.ObjectId(idHard);
        mongoUserArchive.userPerfomedSheme = 'User';

        await mongoUserArchive.save();

        await mongoUser.delete();

        // await mongoUserArchive.delete();
        
        // Rewrite sheme for all dependencies
        await mongoUserArchiveModel.updateMany({userPerfomed: mongoUserArchive.id}, {userPerfomedSheme:'UserArchive'}).lean();

        await mongoGuardPostsModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        await mongoGuardPostsArchiveModel.updateMany({userPerfomed: mongoUserArchive.id}, {userPerfomedSheme:'UserArchive'}).lean();

        await mongoGuardPostsArchiveModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        await mongoGuardsModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        await mongoGuardsArchiveModel.updateMany({userPerfomed: mongoUserArchive.id}, {userPerfomedSheme:'UserArchive'}).lean();

        await mongoGuardsArchiveModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        await mongoTimesheetsGuardPostModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        //Remove tokens
        await tokenService.removeTokenByID(id);

        //prepare responce
        const dtoUser = new DTOUser(mongoUserArchive);

        //return responce
        return { user: dtoUser };
    }

    async registrationEnd(activatelink, password ) {

        await mongoConnect();

        const mongoUser = await mongoUserModel.findOne({ activationLink: activatelink });

        if (!mongoUser) {
            throw ApiError.BadRequest('Неккоректная ссылка активации');
        }
        
        const hashPassword = await bcrypt.hash(password, parseInt(process.env.NEXT_PRIVATE_PASSWORD_SALT));

        mongoUser.password = hashPassword;
        mongoUser.isActivated = true;
        mongoUser.activationLink = undefined;

        await mongoUser.save();

        const dtoUser = new DTOUser(mongoUser);

        const tokens = await tokenService.generateTokens({ ...dtoUser });

        await tokenService.saveToken(dtoUser.id, tokens.refreshToken);

        return { ...tokens, user: dtoUser }

    }

    async activateUserHard( inputData ) {
        //Validate date
        const userData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {
            throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);
        });

        //mongo update
        await mongoConnect();

        const mongoUser = await mongoUserModel.findByIdAndUpdate(userData.id, { isActivated:true }).lean();

        if (!mongoUser) {
            throw ApiError.BadRequest('Пользователь с указанным id не найден');
        }

    }    
    
    async resetUserPasswordHard( inputData ) {
        //Validate date
        const userData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {
            throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);
        });
        console.log(userData);
        //mongo update
        await mongoConnect();

        const mongoUser = await mongoUserModel.findById(userData.id);

        if (!mongoUser) {
            throw ApiError.BadRequest('Пользователь с указанным id не найден');
        }

        //password create
        
        const password = 'State' + getCurrentDateStamp();

        const hashPassword = await bcrypt.hash(password, parseInt(process.env.NEXT_PRIVATE_PASSWORD_SALT))

        const activationLink = v4();

        mongoUser.password = hashPassword;

        mongoUser.activationLink = activationLink;

        await mongoUser.save();

        //Send activation link
        await mailService.sendPasswordResetMail(mongoUser.email, 
            `${process.env.NEXT_PUBLIC_API_URL}/authorization/activatelink/${mongoUser.activationLink}`).catch((e) => {

            throw ApiError.BadRequest(`Произошла ошибка отправки письма для активации на почту ${email}( ${e.response} )`);

        });
    }
}

export default new UserService();