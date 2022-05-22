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

            // const validationSchema = Yup.object().shape({
            //     surname: Yup.string()
            //         .min(minlengthPassword, `Фамилия должна содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
            //         .max(maxlengthPassword, `Фамилия должна содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
            //         .matches(/(?=.*[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ])^[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ]+/,
            //             'Для фамилии могут использоваться буквы только русского и казахского алфавитов')
            //         .required('Не указана фамилия'),
            //     firstName: Yup.string()
            //         .min(minlengthPassword, `Имя должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
            //         .max(maxlengthPassword, `Имя должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
            //         .matches(/(?=.*[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ])^[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ]+/,
            //             'Для имени могут использоваться буквы только русского и казахского алфавитов')
            //         .required('Не указано имя'),
            //     patronymic: Yup.string()
            //         .min(minlengthPassword, `Отчество должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
            //         .max(maxlengthPassword, `Отчество должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
            //         .matches(/(?=.*[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ])^[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ]+/,
            //             'Для отчества могут использоваться буквы только русского и казахского алфавитов')
            //         .required('Не указано отчество'),
            //     email: Yup.string()
            //         .required('Не указан электронный адрес')
            //         .min(minlengthEmail, `Электронный адрес должен содержать от ${minlengthEmail} до ${maxlengthEmail} символов`)
            //         .max(maxlengthEmail, `Электронный адрес должен содержать от ${minlengthEmail} до ${maxlengthEmail} символов`)
            //         .email('Электронный адрес указан не корректно'),
            //     password: Yup.string()
            //         .min(minlengthPassword, `Пароль должен содержать от ${minlengthPassword} до ${maxlengthPassword} символов`)
            //         .max(maxlengthPassword, `Пароль должен содержать от ${minlengthPassword} до ${maxlengthPassword} символов`)
            //         .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать как минимум одну строчную букву, одну заглавную букву и одну цифру')
            //         .required('Не указан пароль')
            // });

            // await validationSchema.validate({ surname, firstName, patronymic, email, password }, { abortEarly: false }).catch((e) => {
            //     console.log(e);
            //     throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);
        
            // });

            await validateYup( { surname, firstName, patronymic, email, password } ).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);
        
            });

            await mongoConnect();

            const candidate = await mongoUserModel.findOne({ email }).lean();

            if (candidate) {
                throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
            }

            const hashPassword = await bcrypt.hash(password, parseInt(process.env.NEXT_PRIVATE_PASSWORD_SALT))

            const activationLink = v4();

            const User = await mongoUserModel.create({
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

            const dtoUser = new DTOUser(User);

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

        const User = await mongoUserModel.findOne({ activationLink });

        if (!User) {
            throw ApiError.BadRequest('Неккоректная ссылка активации');
        }

        User.isActivated = true;

        await User.save();

        const dtoUser = new DTOUser(User);

        const tokens = await tokenService.generateTokens({ ...dtoUser });

        await tokenService.saveToken(dtoUser.id, tokens.refreshToken);

        return { ...tokens, user: dtoUser }

    }

    async login(email, password) {

        // const validationSchema = Yup.object().shape({
        //     email: Yup.string()
        //         .required('Не указан электронный адрес')
        //         .min(minlengthEmail, `Электронный адрес должен содержать от ${minlengthEmail} до ${maxlengthEmail} символов`)
        //         .max(maxlengthEmail, `Электронный адрес должен содержать от ${minlengthEmail} до ${maxlengthEmail} символов`)
        //         .email('Электронный адрес указан не корректно'),
        //     password: Yup.string()
        //         .min(minlengthPassword, `Пароль должен содержать от ${minlengthPassword} до ${maxlengthPassword} символов`)
        //         .max(maxlengthPassword, `Пароль должен содержать от ${minlengthPassword} до ${maxlengthPassword} символов`)
        //         .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать как минимум одну строчную букву, одну заглавную букву и одну цифру')
        //         .required('Не указан пароль')
        // });

        // await validationSchema.validate({ email, password }, { abortEarly: false }).catch((e) => {

        //     throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

        // });

        await validateYup({ email, password }).catch((e) => {

            throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);
    
        });

        await mongoConnect();

        const User = await mongoUserModel.findOne({ email }).lean();

        if (!User) {
            throw ApiError.BadRequest(`Пользователь с указанным адресом электронной почты не найден`);
        }

        const isPassEquals = await bcrypt.compare(password, User.password)

        if (!isPassEquals) {
            throw ApiError.BadRequest(`Некорректный пароль`);
        }

        const dtoUser = new DTOUser(User);

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

        const User = await mongoUserModel.findById(userData.id, store=='update'?'-uiAvatarsSrc':'' ).lean();

        if (!User) {
            throw ApiError.BadRequest(`При обновлении токена сессии была обнаружена ошибка`);
        }

        const dtoUser = new DTOUser(User);

        return dtoUser;
    }

    async getAllUsers() {

        await mongoConnect();

        return await mongoUserModel.find().lean();

    }

    async changeUser( inputUserData ) {

        try {

            //Validate date

            const userData = await validateYup(inputUserData, {deleteEmptyKey:true}).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);
        
            });
            // console.log(inputUserData);
            //Google
            if( inputUserData.uiAvatarsSrc ){

                const googleDriveFile = await googleDrive.uploadUserAvatar(inputUserData.uiAvatarsSrc);

            }

            //Mongo

            await mongoConnect();
            
            const User = await mongoUserModel.findByIdAndUpdate( userData.id, userData, { new: true }).lean();

            if (!User) {
                throw ApiError.BadRequest(`Пользователь с id: ${userData.id} не найден`);
            }

            //DTO

            const dtoUser = new DTOUser(User);

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