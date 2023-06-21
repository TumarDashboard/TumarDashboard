import { object, lazy, string, number } from "yup";
import { fetchAuthFileMethod, fetchAuthMethod } from "../../middleware/requests";
import { mapValue } from "../utils/arrayUtils";

const minlengthNumber = process.env.NEXT_PUBLIC_MIN_LENGTH_GUARD_POST_NUMBER_INPUT;
const maxlengthNumber = process.env.NEXT_PUBLIC_MAX_LENGTH_GUARD_POST_NUMBER_INPUT;
const minlengthRateNumber = process.env.NEXT_PUBLIC_MIN_LENGTH_RATE_INPUT;
const maxlengthRateNumber = process.env.NEXT_PUBLIC_MAX_LENGTH_RATE_INPUT;

export default class DTOGuardPost {

    _id;
    number;
    callsign;
    name;
    address;
    photo;
    manager;
    shifts;
    description;
    rate;

    constructor(model) {
        this._id = model._id;
        this.number = model.number;
        this.callsign = model.callsign;
        this.name = model.name;
        this.address = model.address;
        this.photo = model.photo;
        this.manager = model.manager;
        this.shifts = model.shifts;
        this.description = model.description;
        this.rate = model.rate;
    }

}

export class DTOGuardPostArchive {

    _id;
    reason;
    number;
    callsign;
    name;
    address;
    photo;
    manager;
    shifts;
    description;
    rate;

    constructor(model) {
        this._id = model._id;
        this.reason = model.reason;
        this.number = model.number;
        this.callsign = model.callsign;
        this.name = model.name;
        this.address = model.address;
        this.photo = model.photo;
        this.manager = model.manager;
        this.shifts = model.shifts;
        this.description = model.description;
        this.rate = model.rate;
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

                if (key === 'number') {
                    return number()
                        .nullable()
                        .integer('Для номера могут использоваться только цифры')
                        .min(minlengthNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthNumber} до ${maxlengthNumber}`)
                        .max(maxlengthNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthNumber} до ${maxlengthNumber}`)
                }

                if (key === 'callsign') {
                    return string()
                        .required('Не указано краткое наименование')
                }

                if (key === 'rate') {
                    return number()
                        .nullable()
                        // .integer('Для тарифа могут использоваться только целые цифры')
                        .min(minlengthRateNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthRateNumber} до ${maxlengthRateNumber}`)
                        .max(maxlengthRateNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthRateNumber} до ${maxlengthRateNumber}`)
                }
                // if (key === 'name') {
                //     return string()
                //         .required('Не указано наименование')
                // }

                // if (key === 'address') {
                //     return string()
                //         .required('Не указан адрес')
                // }

            }
        })
    ));

    return validationSchema.validate(dtoGuardPost, { strict: true, abortEarly: false });

}

export const createGuardPost = async (number, callsign, name, address, photo, manager, shifts, description, rate) => {
    return await fetchAuthMethod('/method/guardPost/createGuardPost', { number, callsign, name, address, photo, manager, shifts, description, rate });
}

export const editGuardPost = async (id, number, callsign, name, address, photo, manager, shifts, description, rate) => {
    return await fetchAuthMethod('/method/guardPost/editGuardPost', { id, number, callsign, name, address, photo, manager, shifts, description, rate });
}

export const deleteGuardPost = async (idGuardPost, idUser, reason) => {
    return await fetchAuthMethod('/method/guardPost/deleteGuardPost', { idGuardPost, idUser, reason });
}

export const recoverGuardPost = async (idGuardPost) => {
    return await fetchAuthMethod('/method/guardPost/recoverGuardPost', { idGuardPost });
}

export const reportGuardPosts = async () => {
    return await fetchAuthFileMethod('/method/guardPost/reportGuardPosts');
}