import DTOTimesheet, { validateYup } from "../dtos/dtoTimesheet";
import mongoConnect from "../mongo/mongoConnect";
import { ApiError } from "../../middleware/exceptions";
import googleDrive from "../google/api/googleDrive";
import mongoTimesheetsGuardsModel from "../mongo/models/mongoTimesheetsGuardsModel";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoGuardPostsModel from "../mongo/models/mongoGuardPostsModel";
import mongoGuardPostsArchiveModel from "../mongo/models/mongoGuardPostsArchiveModel";
import mongoGuardsModel from "../mongo/models/mongoGuardsModel";
import mongoGuardsArchiveModel from "../mongo/models/mongoGuardsArchiveModel";
import mongoose from "mongoose";
import DTOGuard from "../dtos/dtoGuard";
import mongoTimesheetsGuardPostModel from "../mongo/models/mongoTimesheetsGuardPostModel";
import mongoUserArchiveModel from "../mongo/models/mongoUserArchiveModel";
import { FPositionBUH, FPositionHRM, FPositionZDIR } from "../../components/levelZ_variable/FPositionItemList";
import { timesheetPrintServer, timesheetExcellForMonthPart, timesheetExcellForMonthFull, timesheetExcellForDay } from "../utils/timesheetUtils";
import userService from "./userService";
import { getCurrentMonth, getCurrentTimeStamp, getMonthFromString } from "../utils/dateUtils";

class TimesheetService {

    async changeTimesheet(inputData) {

        try {
            //Validate date

            const timesheetsData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            const { guardPost, month, guardsRow, manager, rate } = timesheetsData;

            const parseRate = rate ? parseFloat(rate) : null;

            //Check initials condition
            await mongoConnect();

            // change mongoTimesheetsGuardsModel
            const existArray = [];

            await mongoTimesheetsGuardsModel.bulkWrite([
                ...guardsRow.map(element => {
                    existArray.push(element._id);
                    return {
                        updateOne: {
                            filter: { guardPost: guardPost, month: month, guard: element._id },
                            update: {
                                timesheetShifts: element.timesheetShifts,
                                timesheetDays: element.timesheetDays
                            },
                            upsert: true
                        }
                    }
                }),
                {
                    deleteMany: {
                        filter: { guardPost: guardPost, month: month, guard: { $nin: existArray } },
                    }
                }
            ]);

            // change mongoTimesheetsGuardsModel
            if (manager && manager != 'EMPTY') {

                // console.log(manager, rate ? rate : null);

                const user = (await mongoUserModel.findById(manager)) || (await mongoUserArchiveModel.findById(manager));

                if (user) {

                    await mongoTimesheetsGuardPostModel.updateOne({
                        guardPost: guardPost,
                        month: month
                    }, {
                        manager: user.id,
                        managerSheme: user.constructor.modelName,
                        rate: parseRate
                    }, {
                        upsert: true
                    });

                } else {

                    throw ApiError.BadRequest(`Неккоректно указан ID менеджера: ${manager}`);

                }

            } else if (parseRate) {

                await mongoTimesheetsGuardPostModel.updateOne({
                    guardPost: guardPost,
                    month: month
                }, {
                    manager: null,
                    managerSheme: null,
                    rate: parseRate
                }, {
                    upsert: true
                });

            } else if (manager === 'EMPTY') {
                await mongoTimesheetsGuardPostModel.deleteOne({ guardPost: guardPost, month: month });
            }

            return;

        } catch (error) {
            console.log(error);

            throw error;
        }

    }

    async changeTimesheetToday(inputData) {

        try {
            console.log('------------------changeTimesheetToday-----------------------');
            //Validate date-------------------------------------------------------------------------------------------

            const timesheetsData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            // console.log('-------------------------------------');

            const { timesheetToday } = timesheetsData;

            const guardPosts = timesheetToday.map(element => mongoose.Types.ObjectId(element.guardPost));
            const month = new Date(getCurrentMonth());
            const day = (new Date()).getDate() - 1;

            // console.log('guardPosts: %o', guardPosts);

            //Check initials condition--------------------------------------------------------------------------------
            await mongoConnect();

            //Запустить агрегат на посты, месяц и день----------------------------------------------------------------
            const responceAggregateData = await mongoTimesheetsGuardsModel.aggregate([
                {
                    $match: {
                        guardPost: {
                            $in: guardPosts
                        },
                        month: month,
                        timesheetDays: day
                    }
                },
                {
                    $project: {
                        guardPost: 1,
                        guard: 1,
                        index: { $indexOfArray: ["$timesheetDays", day] },
                        size: { $size: "$timesheetDays" }
                    }
                },
                {
                    $group: {
                        _id: '$guardPost',
                        today: {
                            $push: {
                                timesheet: "$_id",
                                guard: "$guard",
                                index: "$index",
                                size: "$size",
                            }
                        }
                    }
                },
            ]).then(responce => responce.map(element => {

                //Результат - все посты имеющие охранников за сегодня, где указана позиция сегоднешнего дня в их списке дней,
                //и общее количество дней за этот месяц
                return {
                    _id: element._id.toString(),
                    today: element.today.map(value => {
                        return {
                            timesheet: value.timesheet.toString(),
                            guard: value.guard.toString(),
                            index: value.index,
                            size: value.size
                        }
                    }),
                }
            }));

            // console.log('responceAggregateData: %o', responceAggregateData);
            // сюда записываются данные о том что надо удалить данные за сегодня у охранника
            const bulkClearData = [];

            // сюда записываются данные о том что данные за сегодня были за сегодня и данные 
            //о выходе охранника на пост подлежат удалению
            const bulkDeleteData = [];

            //сюда записываются данные о том что охранник вышел на пост сегодня
            const bulkWriteData = timesheetToday.reduce((result, element) => {

                let aggregateData = responceAggregateData.find(value => value._id == element.guardPost);

                // console.log('aggregateData: %o', aggregateData);

                // Просматриваем среди данных на изменение найденные в агрегации данные
                // если есть - ни чего не делаем с bulkWriteData, из агрегационных данных убираем позицию
                // если нет - добавляем в bulkWriteData
                element.guardsToday.forEach((valueA) => {

                    let existDay;

                    if (aggregateData?.today?.length > 0) {

                        aggregateData.today = aggregateData.today.reduce((data, valueB) => {

                            if (valueB.guard == valueA) {
                                existDay = valueB;
                            } else {
                                data.push(valueB)
                            }

                            return data;

                        }, []);

                    }

                    // console.log('existDay: %o', existDay);

                    if (existDay) {

                    } else {

                        result.push({
                            updateOne: {
                                filter: { guardPost: element.guardPost, month: month, guard: valueA },
                                update: {
                                    $push: {
                                        timesheetShifts: '?',
                                        timesheetDays: day
                                    }
                                },
                                upsert: true
                            }
                        })

                    }

                })

                // console.log('aggregateData.today: %o', aggregateData?.today);
                // Если среди агрегационных данных остались позиции - значит необходимо удалить
                // Если запись о смене была не единственной в этом месяце на физ посте - удаляем данные об сегоднешнем дне
                // Если запись о смене была единственно в этом месяце на физ посте - удаляем данные об участии охранника
                if (aggregateData?.today?.length > 0) {

                    aggregateData.today.forEach(value => {

                        if (value.size > 1) {

                            result.push({
                                updateOne: {
                                    filter: { _id: value.timesheet },
                                    update: {
                                        $set: {
                                            ['timesheetShifts.' + value.index]: null,
                                            ['timesheetDays.' + value.index]: null
                                        }
                                    }
                                }
                            })

                            bulkClearData.push({
                                updateOne: {
                                    filter: { _id: value.timesheet },
                                    update: {
                                        $pullAll: {
                                            'timesheetShifts': [null],
                                            'timesheetDays': [null]
                                        }
                                    }
                                }
                            })

                        } else {

                            bulkDeleteData.push(value.timesheet)

                        }
                    })
                }

                return result;
            }, []);

            // console.log('bulkWriteData: %o', bulkWriteData);
            // если среди данных нет агрегата - добавить ?
            if (bulkWriteData.length > 0) {

                const responce = await mongoTimesheetsGuardsModel.bulkWrite(bulkWriteData);

                // console.log('bulkWrite: %o', responce);

            }

            // console.log('bulkClearData: %o', bulkClearData);
            // если среди агрегата нет данных - удалить смену за сегодня
            // это выполняется отдельным bulkWrite из за невозможности использовать в одном PipeLine $set и $pullAll
            // перед этим в bulkWriteData была сделана запись $set о назначении null смене
            if (bulkClearData.length > 0) {

                const responce = await mongoTimesheetsGuardsModel.bulkWrite(bulkClearData);

                // console.log('bulkClear: %o', responce);

            }

            // console.log('bulkDeleteData: %o', bulkDeleteData);
            // если среди агрегата нет данных и смена единственная за месяц - зачистить данные об участии охранника на физ. посте
            if (bulkDeleteData.length > 0) {

                const responce = await mongoTimesheetsGuardsModel.deleteMany({ _id: { $in: bulkDeleteData } })

                // console.log('bulkDelete: %o', responce);

            }

            //Запустить агрегат на наличие записей об НСО и Тарифе----------------------------------------------------
            const responseAggregateDataGuardPost = await mongoTimesheetsGuardPostModel.find({
                guardPost: {
                    $in: guardPosts
                },
                month: month,
            }, 'guardPost rate manager').lean().then(responce => responce.reduce((result, element) => {
                if (element.manager || element.rate) {
                    result.push(element.guardPost.toString());
                }
                return result;
            }, []));

            // если в базе не совпадает кол-во записей за месяц об НСО и Тарифе
            if (responseAggregateDataGuardPost.length != guardPosts.length) {

                // Определить список остутствующих записей за месяц об НСО и Тарифах
                const unresponsedDataGuardPost = guardPosts.reduce((result, value) => {
                    if (!responseAggregateDataGuardPost.includes(value.toString())) {
                        result.push(value)
                    }
                    return result;
                }, []);

                // Запросить данные об НСО и Тарифах для списка остутствующих
                const dataGuardPost = await mongoGuardPostsModel.find({
                    _id: {
                        $in: unresponsedDataGuardPost
                    },
                }, '_id manager rate').lean();

                // Создать записи
                await mongoTimesheetsGuardPostModel.bulkWrite([
                    ...dataGuardPost.map(element => {
                        return {
                            updateOne: {
                                filter: { guardPost: element._id, month: month },
                                update: {
                                    manager: element.manager,
                                    rate: element.rate
                                },
                                upsert: true
                            }
                        }
                    }),
                ]);

                console.log(unresponsedDataGuardPost);
            }

            //Запустить агрегат на посты, не участвующие в обновлении--------------------------------------------------
            const responceAggregateUpdateData = await mongoTimesheetsGuardsModel.aggregate([
                {
                    $match: {
                        guardPost: { $nin: guardPosts },
                        month: month,
                        timesheetDays: day
                    }
                },
                {
                    $project: {
                        guardPost: 1,
                        guard: 1,
                    }
                },
                {
                    $group: {
                        _id: '$guardPost',
                        today: {
                            $push: {
                                guard: "$guard",
                            }
                        }
                    }
                },
            ]).then(responce => responce.map(element => {

                //Результат - все посты имеющие охранников за сегодня
                return {
                    _id: element._id.toString(),
                    today: element.today.map(value => value.guard.toString()),
                }
            }));

            // console.log('responceAggregateUpdateData: %o', responceAggregateUpdateData);

            return responceAggregateUpdateData;

        } catch (error) {
            console.log(error);

            throw error;
        }

    }

    async getTimesheetToday() {

        try {

            // console.log('-------------------------------------');
            const month = new Date(getCurrentMonth());
            const day = (new Date()).getDate() - 1;

            // console.log('getTimesheetToday: %o', day);

            //Check initials condition
            await mongoConnect();

            //Запустить агрегат на посты
            const responceAggregateUpdateData = await mongoTimesheetsGuardsModel.aggregate([
                {
                    $match: {
                        month: month,
                        timesheetDays: day
                    }
                },
                {
                    $project: {
                        guardPost: 1,
                        guard: 1,
                    }
                },
                {
                    $group: {
                        _id: '$guardPost',
                        today: {
                            $push: {
                                guard: "$guard",
                            }
                        }
                    }
                },
            ]).then(responce => responce.map(element => {
                //Результат - все посты имеющие охранников за сегодня
                return {
                    _id: element._id.toString(),
                    today: element.today.map(value => value.guard.toString()),
                }
            }));

            // console.log('responceAggregateUpdateData: %o', responceAggregateUpdateData);
            return responceAggregateUpdateData;

        } catch (error) {
            console.log(error);

            throw error;
        }

    }

    async getTimesheet(inputData) {

        try {

            //Validate date

            const timesheetsData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            const { guardPost, month } = timesheetsData;

            //Check initials condition
            await mongoConnect();

            //get timesheet data
            const responce = await mongoTimesheetsGuardsModel.find({ guardPost: guardPost, month: month }).populate('guard').lean();

            // console.log('getTimesheet');
            const optionGuards = [];
            const guardsRow = responce.map(timesheet => {

                if (!timesheet.guard.manager) {
                    timesheet.guard.manager = { _id: "EMPTY" }
                }

                const dtoGuard = new DTOGuard(timesheet.guard);
                dtoGuard.timesheetDays = timesheet.timesheetDays;
                dtoGuard.timesheetShifts = timesheet.timesheetShifts;

                optionGuards.push(dtoGuard._id);

                return dtoGuard;
            });

            //get GuardPost data for request month

            var manager = "EMPTY";
            var rate = null;

            const timesheetsGuardPost = await mongoTimesheetsGuardPostModel.findOne({ guardPost: guardPost, month: month }).lean();

            if (timesheetsGuardPost) {
                manager = timesheetsGuardPost.manager ? timesheetsGuardPost.manager.toString() : manager;
                rate = timesheetsGuardPost.rate ? timesheetsGuardPost.rate : rate;
            }

            return { guardsRow, optionGuards, manager, rate }

        } catch (error) {
            console.log(error);

            throw error;
        }

    }

    async getTimesheetPrint(inputData) {

        try {

            console.log('----------------getTimesheetPrint--------------');
            //Validate date
            const timesheetsData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            //Извлечение параметров для формирования
            const { guardPost, month } = timesheetsData;

            if (!guardPost || !month) {
                throw ApiError.BadRequest(`Отсутствуют данные для формирования: guardPost или month`);
            }

            const date = new Date(month);

            //Check initials condition
            await mongoConnect();

            // Формируем ObjectID из списка guardPost на фильтр
            const guardPosts = guardPost.map(function (el) { return mongoose.Types.ObjectId(el) });

            // Сначала запрашиваем данные из таблицы с ГРАФИКАМИ СМЕН
            const responceTimesheetsGuards = await mongoTimesheetsGuardsModel.aggregate([
                { $match: { guardPost: { $in: guardPosts }, month: date } },
                {
                    $lookup: {
                        from: mongoGuardsModel.collection.name,
                        localField: 'guard',
                        foreignField: '_id',
                        as: 'guard'
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardsArchiveModel.collection.name,
                        localField: 'guard',
                        foreignField: '_id',
                        as: 'guardArchive'
                    }
                },
                {
                    $project: {
                        guardPost: 1,
                        timesheetDays: 1,
                        timesheetShifts: 1,
                        guard: { $setUnion: ["$guard", "$guardArchive"] }
                    }
                },
                { $unwind: { path: "$guard" } },
                {
                    $group: {
                        _id: '$guardPost',
                        element: {
                            $push: {
                                surname: "$guard.surname",
                                firstName: "$guard.firstName",
                                patronymic: "$guard.patronymic",
                                timesheetDays: "$timesheetDays",
                                timesheetShifts: "$timesheetShifts",
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardPostsModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'guardPost'
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardPostsArchiveModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'guardPostArchive'
                    }
                },
                {
                    $project: {
                        guardPost: { $setUnion: ["$guardPost", "$guardPostArchive"] },
                        element: 1
                    }
                },
                { $unwind: { path: "$guardPost" } },
                {
                    $replaceRoot: {
                        newRoot: {
                            _id: "$_id",
                            name: "$guardPost.name",
                            address: "$guardPost.address",
                            number: "$guardPost.number",
                            callsign: "$guardPost.callsign",
                            rate: "$guardPost.rate",
                            element: "$element"
                        }
                    }
                },
                { $sort: { number: 1, callsign: 1 } }
            ]);

            // Переводим ObjectID найденных ФИЗ. ПОСТОВ с имеющимися ГРАФИКАМИ СМЕН
            const responceTimesheetsGuardsLean = responceTimesheetsGuards.map((element, index) => {
                element._id = element._id.toString();
                return element;
            })

            // Запрашиваем данные физ поста на искомый ПЕРИОД по данным ФИЗ. ПОСТОВ
            const responceTimesheetsGuardPost = await mongoTimesheetsGuardPostModel.aggregate([
                {
                    $match: {
                        guardPost: { $in: guardPosts },
                        month: date,
                        manager: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: '$manager',
                        managerSheme: { $first: "$managerSheme" },
                        guardPosts: {
                            $push: {
                                guardPost: "$guardPost",
                                rate: "$rate",
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: mongoUserModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: mongoUserArchiveModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userArchive'
                    }
                },
                {
                    $project: {
                        guardPosts: 1,
                        user: { $setUnion: ["$user", "$userArchive"] }
                    }
                },
                { $unwind: { path: "$user" } },
                {
                    $replaceRoot: {
                        newRoot: {
                            surname: "$user.surname",
                            firstName: "$user.firstName",
                            patronymic: "$user.patronymic",
                            guardPosts: "$guardPosts"
                        }
                    }
                },
            ]);

            // Инициируем список индексов с графиками смен, для которых есть НСО
            const responceTimesheetsGuardsIncludeManagerIndex = [];

            // Формируем ответ, сопоставляя найденных НСО с графиками ФИЗ. ПОСТОВ
            const responce = responceTimesheetsGuardPost.reduce((result, element) => {

                const listGuardPosts = element.guardPosts.map((guardPost) => {
                    return guardPost.guardPost.toString();
                })

                const guardPosts = responceTimesheetsGuardsLean.filter((guardPost, index) => {

                    const indexOf = listGuardPosts.indexOf(guardPost._id);

                    if (indexOf >= 0) {
                        responceTimesheetsGuardsIncludeManagerIndex.push(index);
                        guardPost.rate = element.guardPosts[indexOf].rate ? element.guardPosts[indexOf].rate : guardPost.rate;
                        return true;
                    }

                    return false;

                });

                if (guardPosts.length > 0) {
                    result.push({
                        surname: element.surname,
                        firstName: element.firstName,
                        patronymic: element.patronymic,
                        guardPosts: guardPosts
                    })
                }

                return result;

            }, []);

            // Запрашиваем данные физ поста на искомый ПЕРИОД по данным ФИЗ. ПОСТОВ без НСО
            const responceTimesheetsGuardPostEmptyManager = await mongoTimesheetsGuardPostModel.find({
                guardPost: { $in: guardPosts },
                month: date,
                manager: null
            }).lean();

            const listGuardPostsEmptyManager = responceTimesheetsGuardPostEmptyManager.map((timeSheetGuardPost) => {
                return timeSheetGuardPost.guardPost.toString();
            })

            // Формируем список ФИЗ. ПОСТОВ без НСО
            const guardPostsEmptyManager = responceTimesheetsGuardsLean.filter((guardPost, index) => {
                if (responceTimesheetsGuardsIncludeManagerIndex.includes(index)) {
                    return false;
                } else {
                    const indexOf = listGuardPostsEmptyManager.indexOf(guardPost._id);
                    if (indexOf >= 0) {
                        guardPost.rate = responceTimesheetsGuardPostEmptyManager[indexOf].rate ? responceTimesheetsGuardPostEmptyManager[indexOf].rate : guardPost.rate;
                    }
                    return true;
                }
            });

            // Добавляем данные о ФИЗ. ПОСТАХ без НСО
            if (guardPostsEmptyManager.length > 0) {
                responce.push({
                    surname: '',
                    firstName: '',
                    patronymic: '',
                    guardPosts: guardPostsEmptyManager
                })
            }

            if (responce.length == 0) {
                throw ApiError.FileCreateError('Данные отсутствуют')
            }

            // Добавляем данные о пользователях
            const usersOnPosition = await userService.getUsersInitialsWithPositions([FPositionZDIR, FPositionHRM, FPositionBUH]);

            // Формируем документ из полученных данных
            const document = timesheetPrintServer(responce, usersOnPosition, date);

            const documentName = `Табель-${month}-${getCurrentTimeStamp()}-old.xlsx`

            const googleDriveFileID = `http://drive.google.com/uc?export=view&id=${await googleDrive.uploadExcelTimesheet(
                document,
                documentName,
                process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_TIMESHEET_PRINT_FOR_MONTH_FULL)
                }`;

            return { document, googleDriveFileID };

        } catch (error) {

            throw error;
        }

    }

    async getTimesheetPrintForDay(inputData) {

        try {
            console.log('------------------getTimesheetPrintForDay-----------------------');

            //Validate date--------------------------------------------------------------------------------
            const timesheetsData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            //Извлечение параметров для формирования-------------------------------------------------------

            const { date } = timesheetsData;

            if (!date) {
                throw ApiError.BadRequest(`Отсутствуют данные для формирования: date`);
            }

            const month = getMonthFromString(date);
            const day = new Date(date).getDate() - 1;

            //Check initials condition---------------------------------------------------------------------
            await mongoConnect();

            // Сначала запрашиваем данные из таблицы с ГРАФИКАМИ СМЕН--------------------------------------
            const responceTimesheetsGuards = await mongoTimesheetsGuardsModel.aggregate([
                {
                    $match: {
                        month: month,
                        timesheetDays: day
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardsModel.collection.name,
                        localField: 'guard',
                        foreignField: '_id',
                        as: 'guard'
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardsArchiveModel.collection.name,
                        localField: 'guard',
                        foreignField: '_id',
                        as: 'guardArchive'
                    }
                },
                {
                    $project: {
                        guardPost: 1,
                        timesheetDays: 1,
                        timesheetShifts: 1,
                        guard: { $setUnion: ["$guard", "$guardArchive"] }
                    }
                },
                { $unwind: { path: "$guard" } },
                {
                    $group: {
                        _id: '$guardPost',
                        element: {
                            $push: {
                                surname: "$guard.surname",
                                firstName: "$guard.firstName",
                                patronymic: "$guard.patronymic",
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardPostsModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'guardPost'
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardPostsArchiveModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'guardPostArchive'
                    }
                },
                {
                    $project: {
                        guardPost: { $setUnion: ["$guardPost", "$guardPostArchive"] },
                        element: 1
                    }
                },
                { $unwind: { path: "$guardPost" } },
                {
                    $replaceRoot: {
                        newRoot: {
                            _id: "$_id",
                            name: "$guardPost.name",
                            address: "$guardPost.address",
                            number: "$guardPost.number",
                            callsign: "$guardPost.callsign",
                            element: "$element"
                        }
                    }
                },
                { $sort: { number: 1, callsign: 1 } }
            ]);

            // Переводим ObjectID с имеющимися ГРАФИКАМИ СМЕН----------------------------------------------
            const registeredGuardPosts = [];

            const responceTimesheetsGuardsLean = responceTimesheetsGuards.map((element, index) => {
                registeredGuardPosts.push(element._id);
                element._id = element._id.toString();
                return element;
            });

            // Запрашиваем данные физ поста на искомый ПЕРИОД----------------------------------------------
            const responceTimesheetsGuardPost = await mongoTimesheetsGuardPostModel.aggregate([
                {
                    $match: {
                        month: month,
                        manager: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: '$manager',
                        managerSheme: { $first: "$managerSheme" },
                        guardPosts: {
                            $push: "$guardPost"
                        }
                    }
                },
                {
                    $lookup: {
                        from: mongoUserModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: mongoUserArchiveModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userArchive'
                    }
                },
                {
                    $project: {
                        guardPosts: 1,
                        user: { $setUnion: ["$user", "$userArchive"] }
                    }
                },
                { $unwind: { path: "$user" } },
                {
                    $replaceRoot: {
                        newRoot: {
                            _id: "$user._id",
                            surname: "$user.surname",
                            firstName: "$user.firstName",
                            patronymic: "$user.patronymic",
                            guardPosts: "$guardPosts"
                        }
                    }
                },
            ]);

            // Инициируем список индексов с графиками смен, для которых есть НСО
            const responceTimesheetsGuardsIncludeManagerIndex = [];

            // Формируем ответ, сопоставляя найденных НСО с графиками ФИЗ. ПОСТОВ
            const responce = responceTimesheetsGuardPost.reduce((result, element) => {

                const listGuardPosts = element.guardPosts.map((guardPost) => {
                    return guardPost.toString();
                })

                const guardPosts = responceTimesheetsGuardsLean.filter((guardPost, index) => {

                    const indexOf = listGuardPosts.indexOf(guardPost._id);

                    if (indexOf >= 0) {
                        responceTimesheetsGuardsIncludeManagerIndex.push(index);
                        return true;
                    }

                    return false;

                });

                if (guardPosts.length > 0) {
                    result.push({
                        _id: element._id.toString(),
                        surname: element.surname,
                        firstName: element.firstName,
                        patronymic: element.patronymic,
                        guardPosts: guardPosts
                    })
                }

                return result;

            }, []);

            // Запрашиваем данные физ поста на искомый ПЕРИОД по данным ФИЗ. ПОСТОВ без НСО
            const responceTimesheetsGuardPostEmptyManager = await mongoTimesheetsGuardPostModel.find({
                // guardPost: { $in: guardPosts },
                month: date,
                manager: null
            }).lean();

            const listGuardPostsEmptyManager = responceTimesheetsGuardPostEmptyManager.map((timeSheetGuardPost) => {
                return timeSheetGuardPost.guardPost.toString();
            })

            // Формируем список ФИЗ. ПОСТОВ без НСО
            const guardPostsEmptyManager = responceTimesheetsGuardsLean.filter((guardPost, index) => {
                if (responceTimesheetsGuardsIncludeManagerIndex.includes(index)) {
                    return false;
                } else {
                    const indexOf = listGuardPostsEmptyManager.indexOf(guardPost._id);
                    if (indexOf >= 0) {
                        guardPost.rate = responceTimesheetsGuardPostEmptyManager[indexOf].rate ? responceTimesheetsGuardPostEmptyManager[indexOf].rate : guardPost.rate;
                    }
                    return true;
                }
            });

            // Добавляем данные о ФИЗ. ПОСТАХ без НСО
            if (guardPostsEmptyManager.length > 0) {
                responce.push({
                    surname: '',
                    firstName: '',
                    patronymic: '',
                    guardPosts: guardPostsEmptyManager
                })
            }

            if (responce.length == 0) {
                throw ApiError.FileCreateError('Данные отсутствуют')
            }

            // Рассматриваем текущий месяц или нет---------------------------------------------------------
            if (date.startsWith(getCurrentMonth())) {

                // Запрашиваем данные о физ. постах без охранников за день и с НСО
                const unregisteredDataWithManager = await mongoGuardPostsModel.aggregate([
                    {
                        $match: {
                            _id: { $nin: registeredGuardPosts },
                            manager: { $exists: true, $ne: null }
                        }
                    },
                    { $sort: { callsign: 1, number: 1 } },
                    {
                        $group: {
                            _id: '$manager',
                            managerSheme: { $first: "$managerSheme" },
                            guardPosts: {
                                $push: {
                                    _id: "$_id",
                                    name: "$name",
                                    address: "$address",
                                    number: "$number",
                                    callsign: "$callsign",
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: mongoUserModel.collection.name,
                            localField: '_id',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $lookup: {
                            from: mongoUserArchiveModel.collection.name,
                            localField: '_id',
                            foreignField: '_id',
                            as: 'userArchive'
                        }
                    },                {
                        $project: {
                            guardPosts: 1,
                            user: { $setUnion: ["$user", "$userArchive"] }
                        }
                    },
                    { $unwind: { path: "$user" } },
                    {
                        $replaceRoot: {
                            newRoot: {
                                _id: "$user._id",
                                surname: "$user.surname",
                                firstName: "$user.firstName",
                                patronymic: "$user.patronymic",
                                guardPosts: "$guardPosts"
                            }
                        }
                    },
                ])

                // Добавляем найденные данные в респонс
                if( unregisteredDataWithManager && unregisteredDataWithManager.length > 0 ){

                    unregisteredDataWithManager.forEach(element=>{
    
                        element._id = element._id.toString();
    
                        const registeredInResponce = responce.find(value => value._id == element._id );

                        if(registeredInResponce){
                            registeredInResponce.guardPosts = registeredInResponce.guardPosts.concat( element.guardPosts );
                        }else{
                            responce.unshift( element );
                        }
    
                    });

                }

                // Запрашиваем данные о физ. постах без охранников за день и без НСО
                const unregisteredDataWithoutManager = await mongoGuardPostsModel.find({
                    _id: { $nin: registeredGuardPosts },
                    manager: null
                }, 'name address number callsign').lean();

                // Добавляем найденные данные в респонс
                if( unregisteredDataWithoutManager && unregisteredDataWithoutManager.length > 0 ){

                    const registeredInResponce = responce.find(value => value._id == undefined );

                    if(registeredInResponce){
                        registeredInResponce.guardPosts = registeredInResponce.guardPosts.concat( unregisteredDataWithoutManager );
                    }else{
                        responce.push( {
                            surname: '',
                            firstName: '',
                            patronymic: '',
                            guardPosts: unregisteredDataWithoutManager
                        } );
                    }

                }

            }

            // console.log('%o', responce);

            // Формируем документ из полученных данных-----------------------------------------------------
            const document = timesheetExcellForDay(responce, date);

            const documentName = `Список-охранников-${date}.xlsx`;

            const googleDriveFileID = `http://drive.google.com/uc?export=view&id=${await googleDrive.uploadExcelTimesheet(
                document,
                documentName,
                process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_TIMESHEET_PRINT_FOR_DAY)
                }`;

            return { document, googleDriveFileID };

        } catch (error) {
            throw error;
        }

    }

    async getTimesheetPrintForMonthPart(inputData) {

        try {

            console.log('----------------getTimesheetPrintForMonthPart--------------');
            //Validate date
            const timesheetsData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            //Извлечение параметров для формирования
            const { month, guardPostManager } = timesheetsData;

            if (!month || !guardPostManager) {
                throw ApiError.BadRequest(`Отсутствуют данные для формирования: month`);
            }

            const date = new Date(month);

            //Check initials condition
            await mongoConnect();

            // Формируем данные об НСО сделавшем запрос
            const manager = await mongoUserModel.findById(guardPostManager);

            // Запрашиваем данные физ поста на искомый ПЕРИОД по данным ФИЗ. ПОСТОВ
            const responceTimesheetsGuardPost = await mongoTimesheetsGuardPostModel.find({
                month: date,
                manager: manager._id
            }, 'guardPost');

            // Формируем ObjectID из списка guardPost на фильтр
            const guardPosts = responceTimesheetsGuardPost.map(function (el) { return el.guardPost });

            // Сначала запрашиваем данные из таблицы с ГРАФИКАМИ СМЕН
            const responceTimesheetsGuards = await mongoTimesheetsGuardsModel.aggregate([
                {
                    $match: {
                        guardPost: { $in: guardPosts },
                        month: date
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardsModel.collection.name,
                        localField: 'guard',
                        foreignField: '_id',
                        as: 'guard'
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardsArchiveModel.collection.name,
                        localField: 'guard',
                        foreignField: '_id',
                        as: 'guardArchive'
                    }
                },
                {
                    $project: {
                        guardPost: 1,
                        timesheetDays: 1,
                        timesheetShifts: 1,
                        guard: { $setUnion: ["$guard", "$guardArchive"] }
                    }
                },
                { $unwind: { path: "$guard" } },
                {
                    $group: {
                        _id: '$guardPost',
                        element: {
                            $push: {
                                surname: "$guard.surname",
                                firstName: "$guard.firstName",
                                patronymic: "$guard.patronymic",
                                timesheetDays: "$timesheetDays",
                                timesheetShifts: "$timesheetShifts",
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardPostsModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'guardPost'
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardPostsArchiveModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'guardPostArchive'
                    }
                },
                {
                    $project: {
                        guardPost: { $setUnion: ["$guardPost", "$guardPostArchive"] },
                        element: 1
                    }
                },
                { $unwind: { path: "$guardPost" } },
                {
                    $replaceRoot: {
                        newRoot: {
                            _id: "$_id",
                            name: "$guardPost.name",
                            address: "$guardPost.address",
                            number: "$guardPost.number",
                            callsign: "$guardPost.callsign",
                            rate: "$guardPost.rate",
                            element: "$element"
                        }
                    }
                },
                { $sort: { number: 1, callsign: 1 } }
            ]);

            if (responceTimesheetsGuards.length == 0) {
                throw ApiError.FileCreateError('Данные отсутствуют')
            }

            // Добавляем данные о пользователях
            const usersOnPosition = await userService.getUsersInitialsWithPositions([FPositionZDIR, FPositionHRM, FPositionBUH]);

            // Формируем Инициалы NSO
            const NSOinitials = manager.surname ? [
                manager.surname,
                manager.firstName?.length > 0 ? manager.firstName.charAt(0) + '.' : null,
                manager.patronymic?.length > 0 ? manager.patronymic.charAt(0) + '.' : null,
            ].filter(Boolean).join(' ') : null;

            // Формируем документ из полученных данных
            const document = timesheetExcellForMonthPart(NSOinitials, responceTimesheetsGuards, usersOnPosition, date);

            const documentName = `Табель ${NSOinitials}-${month}-${getCurrentTimeStamp()}.xlsx`;

            const googleDriveFileID = `http://drive.google.com/uc?export=view&id=${await googleDrive.uploadExcelTimesheet(
                document,
                documentName,
                process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_TIMESHEET_PRINT_FOR_MONTH_PART)
                }`;

            return { document, googleDriveFileID };

        } catch (error) {
            throw error;
        }

    }

    async getTimesheetPrintForMonthFull(inputData) {

        try {
            console.log('---------------ARgetTimesheetPrintForMonthFull-----------------');
            //Validate date
            const timesheetsData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            //Извлечение параметров для формирования
            const { month } = timesheetsData;

            const date = new Date(month);

            //Check initials condition
            await mongoConnect();

            // Формируем ObjectID из списка guardPost на фильтр
            // const guardPosts = guardPost.map(function (el) { return mongoose.Types.ObjectId(el) });

            // Сначала запрашиваем данные из таблицы с ГРАФИКАМИ СМЕН
            const responceTimesheetsGuards = await mongoTimesheetsGuardsModel.aggregate([
                {
                    $match: {
                        // guardPost: { $in: guardPosts },
                        month: date
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardsModel.collection.name,
                        localField: 'guard',
                        foreignField: '_id',
                        as: 'guard'
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardsArchiveModel.collection.name,
                        localField: 'guard',
                        foreignField: '_id',
                        as: 'guardArchive'
                    }
                },
                {
                    $project: {
                        guardPost: 1,
                        timesheetDays: 1,
                        timesheetShifts: 1,
                        guard: { $setUnion: ["$guard", "$guardArchive"] }
                    }
                },
                { $unwind: { path: "$guard" } },
                {
                    $group: {
                        _id: '$guardPost',
                        element: {
                            $push: {
                                _id: "$guard._id",
                                surname: "$guard.surname",
                                firstName: "$guard.firstName",
                                patronymic: "$guard.patronymic",
                                timesheetDays: "$timesheetDays",
                                timesheetShifts: "$timesheetShifts",
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardPostsModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'guardPost'
                    }
                },
                {
                    $lookup: {
                        from: mongoGuardPostsArchiveModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'guardPostArchive'
                    }
                },
                {
                    $project: {
                        guardPost: { $setUnion: ["$guardPost", "$guardPostArchive"] },
                        element: 1
                    }
                },
                { $unwind: { path: "$guardPost" } },
                {
                    $replaceRoot: {
                        newRoot: {
                            _id: "$_id",
                            name: "$guardPost.name",
                            address: "$guardPost.address",
                            number: "$guardPost.number",
                            callsign: "$guardPost.callsign",
                            rate: "$guardPost.rate",
                            element: "$element"
                        }
                    }
                },
                { $sort: { number: 1, callsign: 1 } }
            ]);

            // Переводим ObjectID найденных ФИЗ. ПОСТОВ с имеющимися ГРАФИКАМИ СМЕН
            const responceTimesheetsGuardsLean = responceTimesheetsGuards.map((element, index) => {
                element._id = element._id.toString();
                return element;
            })

            // Запрашиваем данные физ поста на искомый ПЕРИОД по данным ФИЗ. ПОСТОВ
            const responceTimesheetsGuardPost = await mongoTimesheetsGuardPostModel.aggregate([
                {
                    $match: {
                        // guardPost: { $in: guardPosts },
                        month: date,
                        manager: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: '$manager',
                        managerSheme: { $first: "$managerSheme" },
                        guardPosts: {
                            $push: {
                                guardPost: "$guardPost",
                                rate: "$rate",
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: mongoUserModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: mongoUserArchiveModel.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userArchive'
                    }
                },
                {
                    $project: {
                        guardPosts: 1,
                        user: { $setUnion: ["$user", "$userArchive"] }
                    }
                },
                { $unwind: { path: "$user" } },
                {
                    $replaceRoot: {
                        newRoot: {
                            surname: "$user.surname",
                            firstName: "$user.firstName",
                            patronymic: "$user.patronymic",
                            guardPosts: "$guardPosts"
                        }
                    }
                },
            ]);

            // Инициируем список индексов с графиками смен, для которых есть НСО
            const responceTimesheetsGuardsIncludeManagerIndex = [];

            // Формируем ответ, сопоставляя найденных НСО с графиками ФИЗ. ПОСТОВ
            const responce = responceTimesheetsGuardPost.reduce((result, element) => {

                const listGuardPosts = element.guardPosts.map((guardPost) => {
                    return guardPost.guardPost.toString();
                })

                const guardPosts = responceTimesheetsGuardsLean.filter((guardPost, index) => {

                    const indexOf = listGuardPosts.indexOf(guardPost._id);

                    if (indexOf >= 0) {
                        responceTimesheetsGuardsIncludeManagerIndex.push(index);
                        guardPost.rate = element.guardPosts[indexOf].rate ? element.guardPosts[indexOf].rate : guardPost.rate;
                        return true;
                    }

                    return false;

                });

                if (guardPosts.length > 0) {
                    result.push({
                        surname: element.surname,
                        firstName: element.firstName,
                        patronymic: element.patronymic,
                        guardPosts: guardPosts
                    })
                }

                return result;

            }, []);

            // Запрашиваем данные физ поста на искомый ПЕРИОД по данным ФИЗ. ПОСТОВ без НСО
            const responceTimesheetsGuardPostEmptyManager = await mongoTimesheetsGuardPostModel.find({
                // guardPost: { $in: guardPosts },
                month: date,
                manager: null
            }).lean();

            const listGuardPostsEmptyManager = responceTimesheetsGuardPostEmptyManager.map((timeSheetGuardPost) => {
                return timeSheetGuardPost.guardPost.toString();
            })

            // Формируем список ФИЗ. ПОСТОВ без НСО
            const guardPostsEmptyManager = responceTimesheetsGuardsLean.filter((guardPost, index) => {
                if (responceTimesheetsGuardsIncludeManagerIndex.includes(index)) {
                    return false;
                } else {
                    const indexOf = listGuardPostsEmptyManager.indexOf(guardPost._id);
                    if (indexOf >= 0) {
                        guardPost.rate = responceTimesheetsGuardPostEmptyManager[indexOf].rate ? responceTimesheetsGuardPostEmptyManager[indexOf].rate : guardPost.rate;
                    }
                    return true;
                }
            });

            // Добавляем данные о ФИЗ. ПОСТАХ без НСО
            if (guardPostsEmptyManager.length > 0) {
                responce.push({
                    surname: '',
                    firstName: '',
                    patronymic: '',
                    guardPosts: guardPostsEmptyManager
                })
            }

            if (responce.length == 0) {
                throw ApiError.FileCreateError('Данные отсутствуют')
            }

            // Добавляем данные о пользователях
            const usersOnPosition = await userService.getUsersInitialsWithPositions([FPositionZDIR, FPositionHRM, FPositionBUH]);

            // Формируем документ из полученных данных
            const document = timesheetExcellForMonthFull(responce, usersOnPosition, date);

            const documentName = `Табель-${month}-${getCurrentTimeStamp()}.xlsx`;

            const googleDriveFileID = `http://drive.google.com/uc?export=view&id=${await googleDrive.uploadExcelTimesheet(
                document,
                documentName,
                process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_TIMESHEET_PRINT_FOR_MONTH_FULL)
                }`;

            return { document, googleDriveFileID };

        } catch (error) {
            throw error;
        }

    }
}

export default new TimesheetService();