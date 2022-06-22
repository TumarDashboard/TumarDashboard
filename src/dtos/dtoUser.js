import { object, lazy, string } from "yup";

const minlengthFullName = process.env.NEXT_PUBLIC_MIN_LENGTH_TEXT;
const maxlengthFullName = process.env.NEXT_PUBLIC_MAX_LENGTH_TEXT;

const minlengthEmail = process.env.NEXT_PUBLIC_MIN_LENGTH_EMAIL;
const maxlengthEmail = process.env.NEXT_PUBLIC_MAX_LENGTH_EMAIL;

const minlengthPassword = process.env.NEXT_PUBLIC_MIN_LENGTH_PASSWORD;
const maxlengthPassword = process.env.NEXT_PUBLIC_MAX_LENGTH_PASSWORD;

function mapValue(object, iteratee) {
    object = Object(object)
    const result = {}

    Object.keys(object).forEach((key) => {
        result[key] = iteratee(object[key], key, object)
    })
    return result
}

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
    }

}

export const validateYup = (dtoUser, options) => {

    let validationSchema = lazy(dtoUser => object(
        mapValue(dtoUser, (value, key) => {

            if (options?.deleteEmptyKey && (!dtoUser[key] || dtoUser[key] === '')) {

                delete dtoUser[key];

            } else {

                if (key === 'id') {
                    return string()
                        .required('Не указан id пользователя')
                }

                if (key === 'surname') {
                    return string()
                        .min(minlengthPassword, `Фамилия должна содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .max(maxlengthPassword, `Фамилия должна содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .matches(/(?=.*[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ])^[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ]+/,
                            'Для фамилии могут использоваться буквы только русского и казахского алфавитов')
                        .required('Не указана фамилия')
                }

                if (key === 'firstName') {
                    return string()
                        .min(minlengthPassword, `Имя должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .max(maxlengthPassword, `Имя должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .matches(/(?=.*[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ])^[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ]+/,
                            'Для имени могут использоваться буквы только русского и казахского алфавитов')
                        .required('Не указано имя')
                }

                if (key === 'patronymic') {
                    return string()
                        .min(minlengthPassword, `Отчество должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .max(maxlengthPassword, `Отчество должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .matches(/(?=.*[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ])^[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ]+/,
                            'Для отчества могут использоваться буквы только русского и казахского алфавитов')
                        .required('Не указано отчество')
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
                        .required('Не указан пароль')
                }

            }
        })
    ));

    return validationSchema.validate(dtoUser, { strict: true, abortEarly: false });

}