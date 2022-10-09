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
import mongoTimesheetsGuardPostManagersModel from "../mongo/models/mongoTimesheetsGuardPostManagersModel";

class UserService {

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
                avatarInitials: {
                    data: "",
                    contentType: 'image/png'
                }
            });

            await mailService.sendActivationMail(email, `${process.env.NEXT_PUBLIC_API_URL}/api/authorization/activate/${activationLink}`).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка отправки письма для активации на почту ${email}( ${e.response} )`);

            });

            const dtoUser = new DTOUser(mongoUser);

            const tokens = await tokenService.generateTokens({ ...dtoUser });

            await tokenService.saveToken(dtoUser.id, tokens.refreshToken);

            return { ...tokens, user: dtoUser }

        } catch (error) {

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

        const dtoUser = await this.checkAuth(refreshToken, store);

        if( dtoUser.exp - dtoUser.iat > 5000 ){

            const accessToken = await tokenService.generateAccessToken({ ...dtoUser });

            console.log('refresh autorizate token %o for user %o', refreshToken, dtoUser);
    
            return { accessToken: accessToken, refreshToken: refreshToken, user: dtoUser }

        }else{

            const tokens = await tokenService.generateTokens({ ...dtoUser });
    
            await tokenService.saveToken(dtoUser.id, tokens.refreshToken);

            console.log('refresh update refreshToken %o for user %o', tokens.refreshToken, dtoUser);
    
            return { ...tokens, user: dtoUser }

        }

    }

    async checkAuth(refreshToken, store) {
        try {

            // throw ApiError.UnauthorizedError();
            console.log('checkAuth for token: %s',refreshToken);

            if (!refreshToken) {
                console.log('checkAuth error: отстутствует refreshToken: %s', refreshToken );
                throw ApiError.UnauthorizedError();
            }
    
            const userData = await tokenService.validateRefreshToken(refreshToken);

            console.log('checkAuth validate userData from refreshToken: %o', userData);

            if (!userData) {
                console.log('checkAuth error: отстутствует userData: %o', userData );
                throw ApiError.UnauthorizedError();
            }

            await mongoConnect();
    
            const tokenFromDb = await tokenService.findToken(refreshToken);

            console.log('checkAuth finded tokenFromDb in db: %o', tokenFromDb);

            if (!tokenFromDb) {

                console.log('checkAuth error: отстутствует tokenFromDb: %o', tokenFromDb );
    
                const tokenFromDbByID = await tokenService.findTokenByUserID(userData.id);

                console.log('checkAuth error: текущий tokenFromDbByID: %o', tokenFromDbByID );

                throw ApiError.UnauthorizedError();
            }

            const mongoUser = await mongoUserModel.findById(userData.id, store == 'update' ? '-uiAvatarsSrc' : '').lean();

            console.log('checkAuth finded mongoUser in db: %o', mongoUser);
    
            if (!mongoUser) {
                console.log('checkAuth error: отстутствует mongoUser: %o', mongoUser );
                throw ApiError.BadRequest(`При обновлении токена сессии была обнаружена ошибка`);
            }

            console.log('checkAuth is finished with store "%o" and return %o', store, store == 'update' ? userData : new DTOUser(mongoUser));
            
            return store == 'update' ? userData : new DTOUser(mongoUser);
            
        } catch (error) {
            // console.log(error, refreshToken);
            throw error
        }
    }

    async getAllUsers() {

        await mongoConnect();

        return await mongoUserModel.find().lean();

    }

    async changeUser(inputUserData) {

        //Validate date

        const userData = await validateYup(inputUserData, { deleteEmptyKey: true }).catch((e) => {

            throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

        });

        //Google

        if (userData.uiAvatarsSrc) {

            const googleDriveFileID = await googleDrive.uploadUserAvatar(userData.id, userData.uiAvatarsSrc);

            if (googleDriveFileID)
                userData.uiAvatarsSrc = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;
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

    async deleteUser(requestData, refreshToken) {

        const { id, reason } = requestData;

        if (!id) {
            throw ApiError.BadRequest("Не указан ID пользователя для проведения операции удаления");
        }

        //Google

        await googleDrive.deleteUserAvatar(requestData.id);

        //Mongo

        await mongoConnect();

        const mongoUser = await mongoUserModel.findById(requestData.id);

        const mongoUserArchive = await mongoUserArchiveModel.create(mongoUser.toJSON());

        mongoUserArchive.reason = reason;

        await mongoUserArchive.save();

        await mongoGuardPostsModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        await mongoGuardPostsArchiveModel.updateMany({userPerfomed: mongoUserArchive.id}, {userPerfomedSheme:'UserArchive'}).lean();

        await mongoGuardPostsArchiveModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        await mongoGuardsModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        await mongoGuardsArchiveModel.updateMany({userPerfomed: mongoUserArchive.id}, {userPerfomedSheme:'UserArchive'}).lean();

        await mongoGuardsArchiveModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();

        await mongoTimesheetsGuardPostManagersModel.updateMany({manager: mongoUserArchive.id}, {managerSheme:'UserArchive'}).lean();
        
        await mongoUser.delete();

        //Tokens

        return await tokenService.removeTokenByID(requestData.id);

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
}

export default new UserService();