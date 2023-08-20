import { object, lazy, string, number } from "yup";
import { fetchAuthFileMethod, fetchAuthMethod } from "../../middleware/requests";
import { mapValue } from "../utils/arrayUtils";

const minlengthNumber = process.env.NEXT_PUBLIC_MIN_LENGTH_PROTECTED_OBJECT_NUMBER_INPUT;
const maxlengthNumber = process.env.NEXT_PUBLIC_MAX_LENGTH_PROTECTED_OBJECT_NUMBER_INPUT;
const minlengthRateNumber = process.env.NEXT_PUBLIC_MIN_LENGTH_RATE_INPUT;
const maxlengthRateNumber = process.env.NEXT_PUBLIC_MAX_LENGTH_RATE_INPUT;

export default class DTOProtectedObject {

    _id;
    number;
    name;
    address;
    photo;
    description;
    sim1;
    sim2;

    constructor(model) {
        this._id = model._id;
        this.number = model.number;
        this.name = model.name;
        this.address = model.address;
        this.photo = model.photo;
        this.description = model.description;
        this.sim1 = model.sim1;
        this.sim2 = model.sim2;
    }

}

export class DTOProtectedObjectArchive {

    _id;
    reason;
    number;
    name;
    address;
    photo;
    description;
    sim1;
    sim2;

    constructor(model) {
        this._id = model._id;
        this.reason = model.reason;
        this.number = model.number;
        this.name = model.name;
        this.address = model.address;
        this.photo = model.photo;
        this.description = model.description;
        this.sim1 = model.sim1;
        this.sim2 = model.sim2;
    }

}

export const validateYup = (dtoProtectedObject, options) => {

    let validationSchema = lazy(dtoProtectedObject => object(
        mapValue(dtoProtectedObject, (value, key) => {

            if (options?.deleteEmptyKey && (!dtoProtectedObject[key] || dtoProtectedObject[key] === '' || dtoProtectedObject[key].length === 0)) {

                delete dtoProtectedObject[key];

            } else {

                if (key === 'id' || key === '_id') {
                    return string()
                        .required('Не указан id пультового объекта')
                }

                if (key === 'number') {
                    return number()
                        .nullable()
                        .integer('Для номера могут использоваться только цифры')
                        .min(minlengthNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthNumber} до ${maxlengthNumber}`)
                        .max(maxlengthNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthNumber} до ${maxlengthNumber}`)
                }

                if(key === 'obj_json'){
                    return string()
                        .nullable('Отсутствуют данные файла obj_json')
                        .trim()
                        .matches(
                            /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@/?%\s]*)$/i,
                            'Некорректный файл obj_json',
                        )
                        .required('Отсутствуют данные файла obj_json')
                }

                // if (key === 'callsign') {
                //     return string()
                //         .required('Не указано краткое наименование')
                // }

                // if (key === 'rate') {
                //     return number()
                //         .nullable()
                //         // .integer('Для тарифа могут использоваться только целые цифры')
                //         .min(minlengthRateNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthRateNumber} до ${maxlengthRateNumber}`)
                //         .max(maxlengthRateNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthRateNumber} до ${maxlengthRateNumber}`)
                // }
                
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

    return validationSchema.validate(dtoProtectedObject, { strict: true, abortEarly: false });

}

export const createProtectedObject = async (number, name, address, photo, description, sim1, sim2) => {
    return await fetchAuthMethod('/method/protectedObject/createProtectedObject', { number, name, address, photo, description, sim1, sim2});
}

export const editProtectedObject = async (id, number, name, address, photo, description, sim1, sim2 ) => {
    return await fetchAuthMethod('/method/protectedObject/editProtectedObject', { id, number, name, address, photo, description, sim1, sim2 });
}

export const deleteProtectedObject = async (idProtectedObject, idUser, reason) => {
    return await fetchAuthMethod('/method/protectedObject/deleteProtectedObject', { idProtectedObject, idUser, reason });
}

export const recoverProtectedObject = async (idProtectedObject) => {
    return await fetchAuthMethod('/method/protectedObject/recoverProtectedObject', { idProtectedObject });
}

export const searchProtectedObject = async ( text ) => {
    return await fetchAuthMethod('/method/protectedObject/searchProtectedObject', { text });
}

export const reportProtectedObjects = async () => {
    return await fetchAuthFileMethod('/method/protectedObject/reportProtectedObjects');
}

export const uploadJsonProtectedObjects = async (obj_json) => {
    return await fetchAuthMethod('/method/protectedObject/uploadJsonProtectedObjects', { obj_json });
}

export const uploadFinishProtectedObjects = async (transactionData, idUser) => {
    return await fetchAuthMethod('/method/protectedObject/uploadFinishProtectedObjects', { transactionData, idUser });
}