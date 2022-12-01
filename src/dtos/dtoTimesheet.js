import { object, lazy, string, number } from "yup";
import { fetchAuthFileMethod, fetchAuthMethod } from "../../middleware/requests";
import { mapValue } from "../utils/arrayUtils";

const minlengthRateNumber = process.env.NEXT_PUBLIC_MIN_LENGTH_RATE_INPUT;
const maxlengthRateNumber = process.env.NEXT_PUBLIC_MAX_LENGTH_RATE_INPUT;

export default class DTOTimesheet {

    _id
    guardPost;
    month;
    guard;
    timesheetShifts;
    timesheetDays;
    manager;

    constructor(model) {
        this._id = model._id;
        this.guardPost = model.guardPost;
        this.month = model.month;
        this.guard = model.guard;
        this.timesheetShifts = model.timesheetShifts;
        this.timesheetDays = model.timesheetDays;
        this.manager = model.manager;
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

                if (key === 'rate') {
                    return number()
                        .nullable()
                        .integer('Для номера могут использоваться только цифры')
                        .min(minlengthRateNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthRateNumber} до ${maxlengthRateNumber}`)
                        .max(maxlengthRateNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthRateNumber} до ${maxlengthRateNumber}`)
                }

            }
        })
    ));

    return validationSchema.validate(dtoGuardPost, { strict: true, abortEarly: false });

}

export const changeTimesheet = async (guardPost, guardPostManager, month, guardsRow, manager, rate) => {
    return await fetchAuthMethod('/method/timesheet/changeTimesheet', { guardPost, guardPostManager, month, guardsRow, manager, rate});
}

export const getTimesheet = async (guardPost, guardPostManager, month) => {
    return await fetchAuthMethod('/method/timesheet/getTimesheet', { guardPost, guardPostManager, month });
}

export const getTimesheetPrint = async (guardPost, month) => {
    return await fetchAuthFileMethod('/method/timesheet/getTimesheetPrint', { guardPost, month });
}