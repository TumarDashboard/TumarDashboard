import { object, lazy, string } from "yup";
import { fetchAuth, fetchAuthMethod } from "../../middleware/requests";
import { mapValue } from "../utils/arrayUtils";

const minlengthFullName = process.env.NEXT_PUBLIC_MIN_LENGTH_INITIALS;
const maxlengthFullName = process.env.NEXT_PUBLIC_MAX_LENGTH_INITIALS;

const minlengthEmail = process.env.NEXT_PUBLIC_MIN_LENGTH_EMAIL;
const maxlengthEmail = process.env.NEXT_PUBLIC_MAX_LENGTH_EMAIL;

const minlengthPassword = process.env.NEXT_PUBLIC_MIN_LENGTH_PASSWORD;
const maxlengthPassword = process.env.NEXT_PUBLIC_MAX_LENGTH_PASSWORD;

export default class DTOUser {
    surname;
    firstName;
    patronymic;
    initials;
    email;
    id;
    isActivated;
    uiAvatarsSrc;
    positions;
    createdAt;
    updatedAt;

    constructor(model) {
        this.surname = model.surname;
        this.firstName = model.firstName;
        this.patronymic = model.patronymic;
        this.initials = [model.surname, model.firstName, model.patronymic].join(' ');
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
        this.uiAvatarsSrc = model.uiAvatarsSrc;
        this.positions = model.positions;
        this.createdAt = model.createdAt;
        this.updatedAt = model.updatedAt;
    }

    equals( dtoUser ){

        for (const key in this) {
            if( key != 'uiAvatarsSrc' && JSON.stringify(this[key]) != JSON.stringify(dtoUser[key])) {
                return false;
            }
        }

        return true;
    }

}

export const validateYup = (dtoUser, options) => {

    let validationSchema = lazy(dtoUser => object(
        mapValue(dtoUser, (value, key) => {

            if (options?.deleteEmptyKey && (!dtoUser[key] || dtoUser[key] === '' || dtoUser[key].length === 0)) {

                delete dtoUser[key];

            } else {

                if (key === 'id') {
                    return string()
                        .required('Не указан id пользователя')
                }

                if (key === 'surname') {
                    return string()
                        .min(minlengthFullName, `Фамилия должна содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .max(maxlengthFullName, `Фамилия должна содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .matches(/(?=.*[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ])^[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ]+/,
                            'Для фамилии могут использоваться буквы только русского и казахского алфавитов')
                        .required('Не указана фамилия');
                }

                if (key === 'firstName') {
                    return string()
                        .min(minlengthFullName, `Имя должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .max(maxlengthFullName, `Имя должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .matches(/(?=.*[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ])^[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ]+/,
                            'Для имени могут использоваться буквы только русского и казахского алфавитов')
                        .required('Не указано имя');
                }

                if (key === 'patronymic' && dtoUser[key]) {
                    return string()
                        .min(minlengthFullName, `Отчество должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .max(maxlengthFullName, `Отчество должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .matches(/(?=.*[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ])^[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ]+/,
                            'Для отчества могут использоваться буквы только русского и казахского алфавитов')
                        .required('Не указано отчество');
                }

                if (key === 'email') {
                    return string()
                        .required('Не указан электронный адрес')
                        .min(minlengthEmail, `Электронный адрес должен содержать от ${minlengthEmail} до ${maxlengthEmail} символов`)
                        .max(maxlengthEmail, `Электронный адрес должен содержать от ${minlengthEmail} до ${maxlengthEmail} символов`)
                        .email('Электронный адрес указан не корректно')
                }

                if (key === 'password') {
                    return string()
                        .min(minlengthPassword, `Пароль должен содержать от ${minlengthPassword} до ${maxlengthPassword} символов`)
                        .max(maxlengthPassword, `Пароль должен содержать от ${minlengthPassword} до ${maxlengthPassword} символов`)
                        .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать как минимум одну строчную букву, одну заглавную букву и одну цифру')
                        .required('Не указан пароль');
                }

                if (key === 'passwordNew') {
                    return string()
                        .min(minlengthPassword, `Новый пароль должен содержать от ${minlengthPassword} до ${maxlengthPassword} символов`)
                        .max(maxlengthPassword, `Новый пароль должен содержать от ${minlengthPassword} до ${maxlengthPassword} символов`)
                        .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать как минимум одну строчную букву, одну заглавную букву и одну цифру')
                        .required('Не указан пароль');
                }

            }
        })
    ));

    return validationSchema.validate(dtoUser, { strict: true, abortEarly: false });

}

/*-------------------------------------------------------------------------------------------------------
    Self функции
-------------------------------------------------------------------------------------------------------*/
export const changeUser = async (id, uiAvatarsSrc, surname, firstName, patronymic, positions) => {
    return await fetchAuthMethod('/method/user/changeUser', { id, uiAvatarsSrc, surname, firstName, patronymic, positions });
}

export const changeUserPassword = async (id, password, passwordNew) => {
    return await fetchAuth('/method/user/changeUserPassword', { id, password, passwordNew });
}

export const deleteUser = async (id, reason) => {
    return await fetchAuthMethod('/method/user/deleteUser', { id, reason });
}

/*-------------------------------------------------------------------------------------------------------
    Hard функции
-------------------------------------------------------------------------------------------------------*/
export const createUserHard = async ( idHard, uiAvatarsSrc, email, surname, firstName, patronymic, positions ) => {
    return await fetchAuthMethod('/method/userHard/createUserHard', { idHard, uiAvatarsSrc, email, surname, firstName, patronymic, positions });
}

export const editUserHard = async ( idHard, id, uiAvatarsSrc, email, surname, firstName, patronymic, positions ) => {
    return await fetchAuthMethod('/method/userHard/editUserHard', { idHard, id, uiAvatarsSrc, email, surname, firstName, patronymic, positions });
}

export const deleteUserHard = async (idHard, id, reason) => {
    return await fetchAuthMethod('/method/userHard/deleteUserHard', { idHard, id, reason });
}

export const activateUserHard = async (idHard, id) => {
    return await fetchAuthMethod('/method/userHard/activateUserHard', { idHard, id });
}

export const resetUserPasswordHard = async (idHard, id) => {
    return await fetchAuthMethod('/method/userHard/resetUserPasswordHard', { idHard, id });
}

export const recoverUserHard = async (idUser) => {
    return await fetchAuthMethod('/method/userHard/recoverUserHard', { idUser });
}