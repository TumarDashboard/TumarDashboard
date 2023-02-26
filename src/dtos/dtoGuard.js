import { object, lazy, string, number } from "yup";
import { fetchAuthMethod } from "../../middleware/requests";
import { mapValue } from "../utils/arrayUtils";
import { isINNIndividual } from "../utils/dataUtils";

const minlengthFullName = process.env.NEXT_PUBLIC_MIN_LENGTH_INITIALS;
const maxlengthFullName = process.env.NEXT_PUBLIC_MAX_LENGTH_INITIALS;

export default class DTOGuard {

    _id;
    surname;
    firstName;
    patronymic;
    uiAvatarsSrc;
    telephone;
    iin;
    guardPosts;

    constructor(model) {
        this._id = model._id;
        this.surname = model.surname;
        this.firstName = model.firstName;
        this.patronymic = model.patronymic;
        this.uiAvatarsSrc = model.uiAvatarsSrc;
        this.telephone = model.telephone;
        this.iin = model.iin;
        this.guardPosts = model.guardPosts;
    }

}

export const validateYup = (dtoGuardPost, options) => {

    let validationSchema = lazy(dtoGuardPost => object(
        mapValue(dtoGuardPost, (value, key) => {

            if (options?.deleteEmptyKey && (!dtoGuardPost[key] || dtoGuardPost[key] === '' || dtoGuardPost[key].length === 0)) {

                delete dtoGuardPost[key];

            } else {

                if (key === 'id' || key === '_id') {
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

                if (key === 'patronymic' && dtoGuardPost[key]) {
                    return string()
                        .min(minlengthFullName, `Отчество должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .max(maxlengthFullName, `Отчество должно содержать от ${minlengthFullName} до ${maxlengthFullName} символов`)
                        .matches(/(?=.*[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ])^[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ]+/,
                            'Для отчества могут использоваться буквы только русского и казахского алфавитов')
                        .required('Не указано отчество');
                }

                if (key === 'iin' && dtoGuardPost[key]) {
                    return string()
                        .test('innValid', 'Неверный ИНН', value => isINNIndividual(value))
                        .required('Не указан ИИН')
                }

            }
        })
    ));

    return validationSchema.validate(dtoGuardPost, { strict: true, abortEarly: false });

}

export const createGuard = async (surname, firstName, patronymic, uiAvatarsSrc, telephone, iin, guardPosts) => {
    return await fetchAuthMethod('/method/guard/createGuard', { surname, firstName, patronymic, uiAvatarsSrc, telephone, iin, guardPosts });
}

export const editGuard = async (id, surname, firstName, patronymic, uiAvatarsSrc, telephone, iin, guardPosts) => {
    return await fetchAuthMethod('/method/guard/editGuard', { id, surname, firstName, patronymic, uiAvatarsSrc, telephone, iin, guardPosts });
}

export const deleteGuard = async (idGuard, idUser, reason) => {
    return await fetchAuthMethod('/method/guard/deleteGuard', { idGuard, idUser, reason });
}

export const recoverGuard = async (idGuard) => {
    return await fetchAuthMethod('/method/guard/recoverGuard', { idGuard });
}