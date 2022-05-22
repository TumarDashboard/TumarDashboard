import bcrypt from "bcrypt";
import { v4 } from "uuid";
import * as Yup from 'yup';
import mailService from "./mailService";
import * as tokenService from "./tokenService";
import DTOUser, { validateYup } from "../dtos/dtoUser";
import mongoUserModel from "../../mongo/models/mongoUserModel";
import mongoConnect from "../../mongo/mongoConnect";
import { ApiError } from "../../../middleware/exceptions";
import googleDrive from "../../google/api/googleDrive";

const minlengthFullName = process.env.NEXT_PUBLIC_MIN_LENGTH_TEXT;
const maxlengthFullName = process.env.NEXT_PUBLIC_MAX_LENGTH_TEXT;

const minlengthEmail = process.env.NEXT_PUBLIC_MIN_LENGTH_EMAIL;
const maxlengthEmail = process.env.NEXT_PUBLIC_MAX_LENGTH_EMAIL;

const minlengthPassword = process.env.NEXT_PUBLIC_MIN_LENGTH_PASSWORD;
const maxlengthPassword = process.env.NEXT_PUBLIC_MAX_LENGTH_PASSWORD;

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

            const hashPassword = await bcrypt.hash(password, parseInt(process.env.NEXT_PRIVATE_PASSWORD_SALT))

            const activationLink = v4();

            const mongoUser = await mongoUserModel.create({
                surname: surname,
                firstName: firstName,
                patronymic: patronymic,
                email: email,
                password: hashPassword,
                activationLink: activationLink,
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
                console.log(error);
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

        const tokens = await tokenService.generateTokens({ ...dtoUser });

        await tokenService.saveToken(dtoUser.id, tokens.refreshToken);

        return { ...tokens, user: dtoUser }

    }

    async checkAuth(refreshToken, store) {

        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = await tokenService.validateRefreshToken(refreshToken);

        await mongoConnect();

        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }

        const mongoUser = await mongoUserModel.findById(userData.id, store == 'update' ? '-uiAvatarsSrc' : '').lean();

        if (!mongoUser) {
            throw ApiError.BadRequest(`При обновлении токена сессии была обнаружена ошибка`);
        }

        const dtoUser = new DTOUser(mongoUser);

        return dtoUser;
    }

    async getAllUsers() {

        await mongoConnect();

        return await mongoUserModel.find().lean();

    }

    async changeUser(inputUserData) {
        
        try {

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

        } catch (error) {

            throw error;
        }

    }
}

export default new UserService();