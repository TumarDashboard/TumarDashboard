import { object, lazy, string, number } from "yup";
import { fetchAuthMethod } from "../../middleware/requests";
import { mapValue } from "../utils/arrayUtils";

const minlengthNumber = process.env.NEXT_PUBLIC_MIN_LENGTH_NUMBER_INPUT;
const maxlengthNumber = process.env.NEXT_PUBLIC_MAX_LENGTH_NUMBER_INPUT;

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

export const createGuardPost = async (number, callsign, name, address, photo, manager, shifts, description) => {
    return await fetchAuthMethod('/method/createGuardPost', { number, callsign, name, address, photo, manager, shifts, description });
}

export const editGuardPost = async (id, number, callsign, name, address, photo, manager, shifts, description) => {
    return await fetchAuthMethod('/method/editGuardPost', { id, number, callsign, name, address, photo, manager, shifts, description });
}

export const deleteGuardPost = async (idGuardPost, idUser, reason) => {
    return await fetchAuthMethod('/method/deleteGuardPost', { idGuardPost, idUser, reason });
}