import { object, lazy, string } from "yup";
import { fetchAuthFileMethod, fetchAuthMethod } from "../../middleware/requests";
import { mapValue } from "../utils/arrayUtils";

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

            }
        })
    ));

    return validationSchema.validate(dtoGuardPost, { strict: true, abortEarly: false });

}

export const changeTimesheet = async (guardPost, month, guardsRow, manager, rate) => {
    return await fetchAuthMethod('/method/changeTimesheet', { guardPost, month, guardsRow, manager, rate});
}

export const getTimesheet = async (guardPost, month) => {
    return await fetchAuthMethod('/method/getTimesheet', { guardPost, month });
}

export const getTimesheetPrint = async (guardPost, month) => {
    return await fetchAuthFileMethod('/method/getTimesheetPrint', { guardPost, month });
}