import { object, lazy, string, number, array } from "yup";
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
                        // .integer('Для тарифа могут использоваться только целые цифры')
                        .min(minlengthRateNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthRateNumber} до ${maxlengthRateNumber}`)
                        .max(maxlengthRateNumber, `Кол-во цифр должно быть в диапозоне от ${minlengthRateNumber} до ${maxlengthRateNumber}`)
                }

                if (key === 'timesheetToday') {
                    return array()
                        .of(object({
                            guardPost: string().required('В некоторых данных для смены отсутствует ID физ. поста'),
                            guardsToday: array()
                                .of( string().required('В некоторых данных для смены некорректно указан ID охранника') )
                          }),)
                        .required('Отсутствуют данные о сменах за сегодня')
                }

            }
        })
    ));

    return validationSchema.validate(dtoGuardPost, { strict: true, abortEarly: false });

}

export const changeTimesheet = async (guardPost, guardPostManager, month, guardsRow, manager, rate) => {
    return await fetchAuthMethod('/method/timesheet/changeTimesheet', { guardPost, guardPostManager, month, guardsRow, manager, rate});
}

export const changeTimesheetToday = async (guardPostManagers, timesheetToday) => {
    return await fetchAuthMethod('/method/timesheet/changeTimesheetToday', { guardPostManagers, timesheetToday});
}

export const getTimesheetToday = async () => {
    return await fetchAuthMethod('/method/timesheet/getTimesheetToday');
}

export const getTimesheet = async (guardPost, guardPostManager, month) => {
    return await fetchAuthMethod('/method/timesheet/getTimesheet', { guardPost, guardPostManager, month });
}

export const getTimesheetPrint = async (guardPost, month) => {
    return await fetchAuthFileMethod('/method/timesheet/getTimesheetPrint', { guardPost, month });
}


export const getTimesheetPrintForDay = async (date) => {
    return await fetchAuthFileMethod('/method/timesheet/getTimesheetPrintForDay', { date });
}

export const getTimesheetPrintForMonthPart = async (month) => {
    return await fetchAuthFileMethod('/method/timesheet/getTimesheetPrintForMonthPart', { month });
}

export const getTimesheetPrintForMonthFull = async (month) => {
    return await fetchAuthFileMethod('/method/timesheet/getTimesheetPrintForMonthFull', { month });
}