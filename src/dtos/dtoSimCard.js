import { object, lazy, string, number } from "yup";
import { fetchAuthFileMethod, fetchAuthMethod } from "../../middleware/requests";
import { mapValue } from "../utils/arrayUtils";

// const minlengthNumber = process.env.NEXT_PUBLIC_MIN_LENGTH_PROTECTED_OBJECT_NUMBER_INPUT;
// const maxlengthNumber = process.env.NEXT_PUBLIC_MAX_LENGTH_PROTECTED_OBJECT_NUMBER_INPUT;
// const minlengthRateNumber = process.env.NEXT_PUBLIC_MIN_LENGTH_RATE_INPUT;
// const maxlengthRateNumber = process.env.NEXT_PUBLIC_MAX_LENGTH_RATE_INPUT;

export default class DTOSimCard {

    _id;
    msisdn;
    iccid;
    provider;

    constructor(model) {
        this._id = model._id;
        this.msisdn = model.msisdn;
        this.iccid = model.iccid;
        this.provider = model.provider;
        this.protectedObjects = model.protectedObjects;
    }

}

export class DTOSimCardArchive {

    _id;
    reason;
    msisdn;
    iccid;
    provider;

    constructor(model) {
        this._id = model._id;
        this.reason = model.reason;
        this.msisdn = model.msisdn;
        this.iccid = model.iccid;
        this.provider = model.provider;
        this.protectedObjects = model.protectedObjects;
    }

}

export const validateYup = (dtoSimCard, options) => {

    let validationSchema = lazy(dtoSimCard => object(
        mapValue(dtoSimCard, (value, key) => {

            if (options?.deleteEmptyKey && (!dtoSimCard[key] || dtoSimCard[key] === '' || dtoSimCard[key].length === 0)) {

                delete dtoSimCard[key];

            } else {

                if (key === 'id' || key === '_id') {
                    return string()
                        .required('Не указан id сим карты')
                }

                // if (key === 'number') {
                //     return number()
                //         .nullable()
                //         .integer('Для номера могут использоваться только цифры')
                //         .min(minlengthNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthNumber} до ${maxlengthNumber}`)
                //         .max(maxlengthNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthNumber} до ${maxlengthNumber}`)
                // }

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

    return validationSchema.validate(dtoSimCard, { strict: true, abortEarly: false });

}

export const createSimCard = async (msisdn, iccid, provider) => {
    return await fetchAuthMethod('/method/simCard/createSimCard', { msisdn, iccid, provider });
}

export const editSimCard = async (id, msisdn, iccid, provider ) => {
    return await fetchAuthMethod('/method/simCard/editSimCard', { id, msisdn, iccid, provider });
}

export const deleteSimCard = async (idSimCard, idUser, reason) => {
    return await fetchAuthMethod('/method/simCard/deleteSimCard', { idSimCard, idUser, reason });
}

export const recoverSimCard = async (idSimCard) => {
    return await fetchAuthMethod('/method/simCard/recoverSimCard', { idSimCard });
}

export const reportSimCards = async () => {
    return await fetchAuthFileMethod('/method/simCard/reportSimCards');
}

export const uploadJsonSimCards = async (obj_json) => {
    return await fetchAuthMethod('/method/simCard/uploadJsonSimCards', { obj_json });
}

export const uploadExcellSimCards = async (document, columnMSISDN, columnICCID) => {
    return await fetchAuthMethod('/method/simCard/uploadExcellSimCards', { document, columnMSISDN, columnICCID });
}

export const uploadFinishSimCards = async (transactionData, idUser) => {
    return await fetchAuthMethod('/method/simCard/uploadFinishSimCards', { transactionData, idUser });
}