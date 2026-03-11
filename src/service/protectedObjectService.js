import { isUndefined } from "swr/_internal";
import {
    FUDTransactionArchive,
    FUDTransactionNoChange,
    FUDTransactionUpdate,
    FUDTransactionReplacement,
    FUDTransactionIgnore,
    FUDTransactionAddition
} from "../../components/levelZ_variable/FUploadDataTransactionList";
import { ApiError } from "../../middleware/exceptions";
import DTOProtectedObject, { DTOProtectedObjectArchive, validateYup } from "../dtos/dtoProtectedObject";
import googleDrive from "../google/api/googleDrive";
import mongoProtectedObjectsArchiveModel from "../mongo/models/mongoProtectedObjectsArchiveModel";
import mongoProtectedObjectsModel from "../mongo/models/mongoProtectedObjectsModel";
import mongoSimCardsModel from "../mongo/models/mongoSimCardsModel";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoConnect from "../mongo/mongoConnect";
import { mapValue } from "../utils/arrayUtils";
import { UnicodeToWin1251 } from "../utils/dataUtils";
import { getCurrentTimeStamp } from "../utils/dateUtils";
import { reportForAllProtectedObjects } from "../utils/reportsUtils";
import mongoose from "mongoose";

function managerEquals(a, b) {
    if (!a && !b) {
        return false;
    }
    if (!a || !b) {
        return true;
    }
    return Boolean(a.toString().localeCompare(b.toString()));
}

async function checkAndAddSimCardToProtectedObject(newData, mongoData) {

    // console.log('-----------------------checkAndAddSimCardToProtectedObject-------------------');

    /*--Формирование фильтров для поиска---------------------------------------------------------------------------------------------------------*/
    var regExpSim1 = newData.sim1 && (newData.sim1 != mongoData?.sim1)
        ? newData.sim1.toLowerCase().replaceAll(/[^\w]/g, '').split('').join('[\\(\\)\\+\\-\\s]{0,1}')
        : null;

    var regExpSim2 = newData.sim2 && (newData.sim2 != mongoData?.sim2)
        ? newData.sim2.toLowerCase().replaceAll(/[^\w]/g, '').split('').join('[\\(\\)\\+\\-\\s]{0,1}')
        : null;

    var filterSim = [regExpSim1, regExpSim2].filter(Boolean);

    // console.log('filterSim %o', filterSim);

    /*--Если произошла изменение и пользователь ввёл новые данные---------------------------------------------------------------------------------*/
    if (filterSim.length > 0) {

        /*--Доработка фильтра---------------------------------------------------------------------------------------------------------------------*/
        let filter = '.*(' + filterSim.join(')|(') + ').*';

        /*--Поиск данных указанных пользователем--------------------------------------------------------------------------------------------------*/
        const simCards = await mongoSimCardsModel.find({ msisdn: { $regex: filter, $options: "i" } }).populate('protectedObjects.protectedObject');

        // console.log('simCards %o', simCards);

        /*--Формирование ошибки в случае если количество найденных экземпляров данных не совпадает------------------------------------------------*/
        if (simCards.length != filterSim.length) {

            const uncknowSimCards = [];

            // сверка - что же именно не было найдено
            filterSim.forEach(value => {

                let regExpSimCard = new RegExp('.*' + value + '.*');
                let exist = true;

                for (let i = 0; i < simCards.length; i++) {
                    if (regExpSimCard.test(simCards[i].msisdn)) {
                        exist = false;
                        break;
                    }
                }

                if (exist) {
                    if (regExpSim1 == value)
                        uncknowSimCards.push(newData.sim1)
                    else if (regExpSim2 == value)
                        uncknowSimCards.push(newData.sim2)
                }

            })

            throw ApiError.BadRequest(`Ошибка регистрации сим-карт для пультового объекта - в базе данных отсутствуют номера: ${uncknowSimCards.join(', ')}`);

        }

        /*--Обновление найденных данных-----------------------------------------------------------------------------------------------------------*/
        for (let i = 0; i < simCards.length; i++) {

            const simCard = simCards[i];

            if (!simCard.protectedObjects || !Array.isArray(simCard.protectedObjects)) {
                // Создание новой истории
                simCard.protectedObjects = [];
            } else if (simCard.protectedObjects.length > 0) {
                // Обновление данных и пультовых объектов в старой истории
                for (let k = 0; k < simCard.protectedObjects.length; k++) {

                    const protectedObjectRecord = simCard.protectedObjects[k];

                    if( protectedObjectRecord.inProtectedObject ){

                        let exist = {};
                        
                        if (simCard.msisdn == protectedObjectRecord.protectedObject.sim1) exist.sim1 = 1;
                        if (simCard.msisdn == protectedObjectRecord.protectedObject.sim2) exist.sim2 = 1;

                        if (exist.sim1 || exist.sim2) {

                            protectedObjectRecord.inProtectedObject = false;
                            protectedObjectRecord.unmounted = new Date();

                            await mongoProtectedObjectsModel.updateOne({ _id: protectedObjectRecord.protectedObject._id }, { $unset: exist });

                        }
                    }
                }
            }

            // Добавление данных о пультовом объекте историю
            simCard.protectedObjects.push({
                protectedObject: mongoData._id,
                protectedObjectSheme: 'ProtectedObjects',
                inProtectedObject: true,
                mounted: new Date(),
            })

            // console.log('simCards %o', simCard);

            await simCard.save();

        }
    }
}

async function checkAndUnsetSimCardFromProtectedObject(newData, mongoData) {

    // console.log('-----------------------checkAndUnsetSimCardFromProtectedObject-------------------');

    /*--Формирование фильтров для поиска---------------------------------------------------------------------------------------------------------*/
    var regExpSim1 = !newData.sim1 && ( mongoData.sim1 !== '' )
        ? mongoData.sim1
        : null;

    var regExpSim2 = !newData.sim2 && ( mongoData.sim2 !== '' )
        ? mongoData.sim2
        : null;

    var filterSim = [regExpSim1, regExpSim2].filter(Boolean);

    // console.log('filterSim %o', filterSim);

    /*--Если произошла изменение и пользователь удалил старые данные-----------------------------------------------------------------------------*/
    if (filterSim.length > 0) {

        //--Поиск данных указанных пользователем--------------------------------------------------------------------------------------------------
        const simCards = await mongoSimCardsModel.find({ msisdn: { $in: filterSim } }).populate('protectedObjects.protectedObject');

        // console.log('simCards %o', simCards);

        //--Формирование ошибки в случае если количество найденных экземпляров данных не совпадает------------------------------------------------
        if (simCards.length != filterSim.length) {

            // сверка - что же именно не было найдено
            simCards.forEach( value => {
                
                filterSim = filterSim.filter( filter => value != filter.msisdn );

            })

            throw ApiError.BadRequest(`Ошибка удаления данных сим-карты для пультового объекта - в базе данных отсутствуют номера: ${filterSim.join(', ')}, сообщите администратору`);

        }

        //--Обновление найденных данных-----------------------------------------------------------------------------------------------------------
        for (let i = 0; i < simCards.length; i++) {

            const simCard = simCards[i];

            if( Array.isArray(simCard.protectedObjects) && (simCard.protectedObjects.length > 0) ){

                const protectedObjectRecord = simCard.protectedObjects[simCard.protectedObjects.length-1];

                protectedObjectRecord.inProtectedObject = false;
                protectedObjectRecord.unmounted = new Date();

                await simCard.save();

            }

        }
    }
}

class ProtectedObjectService {

    async createProtectedObject(inputData) {

        let deleteProtectedObject;

        try {

            console.log('-----------------------createProtectedObject-------------------');

            /*--Валидация данных---------------------------------------------------------------------------------------------------------*/
            if (inputData.number) {
                inputData.number = parseInt(inputData.number);
            } else {
                delete inputData.number
            }

            const protectedObjectData = await validateYup(inputData, { deleteEmptyKey: true }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });
            console.log('protectedObjectData %o', protectedObjectData);

            /*--Разрушение изображения--------------------------------------------------------------------------------------------------*/
            let photo;
            if (protectedObjectData.photo) {
                photo = protectedObjectData.photo;
                delete protectedObjectData['photo'];
            } else {

                protectedObjectData.photo = `https://ui-avatars.com/api/?name=${
                    protectedObjectData.number ? protectedObjectData.number : protectedObjectData.name?.replace(/ /ig, ',')
                    }&size=256&font-size=0.33&length=3&background=random`;

            }

            /*--Проверка соединения с Mongo----------------------------------------------------------------------------------------------*/
            await mongoConnect();

            /*--Проверка существующего объекта в базе данных-----------------------------------------------------------------------------*/
            const candidate = await mongoProtectedObjectsModel.findOne({ number: protectedObjectData.number }).lean();

            if (candidate) {
                throw ApiError.BadRequest(`Пультовой объект с номером ${protectedObjectData.number} уже существует`);
            }

            /*--Создание данных самого пультового объекта--------------------------------------------------------------------------------*/
            let mongoProtectedObject = await mongoProtectedObjectsModel.create(protectedObjectData);
            deleteProtectedObject = mongoProtectedObject;

            /*--Проверка в базе данных операций добавлений СимКарт-----------------------------------------------------------------------*/
            await checkAndAddSimCardToProtectedObject(protectedObjectData, {_id: mongoProtectedObject._id});

            /*--Загрузка данных в Google-------------------------------------------------------------------------------------------------*/
            if (photo) {

                const googleDriveFileID = await googleDrive.uploadProtectedObjectPhoto(mongoProtectedObject._id.toString(), photo);

                if (googleDriveFileID)
                    mongoProtectedObject.photo = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;

                await mongoProtectedObject.save();

            }

            /*--Формирование DTO---------------------------------------------------------------------------------------------------------*/
            const dtoProtectedObject = new DTOProtectedObject(mongoProtectedObject);

            /*--Возврат результата-------------------------------------------------------------------------------------------------------*/
            return { protectedObject: dtoProtectedObject }

        } catch (error) {
            console.log(error);

            if (deleteProtectedObject) {

                try {

                    await mongoProtectedObjectsModel.deleteOne({ _id: deleteProtectedObject._id })

                } catch (error) {

                    throw error;

                }

            }

            throw error;
        }

    }

    async editProtectedObject(inputData) {
        try {

            console.log('-----------------------editProtectedObject-------------------');

            /*--Валидация данных---------------------------------------------------------------------------------------------------------*/
            if (inputData.number) {
                inputData.number = parseInt(inputData.number);
            } else if (!isUndefined(inputData.number)) {
                inputData.number = null;
            }

            // console.log('inputData %o', inputData);

            const protectedObjectData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            // console.log('protectedObjectData %o', protectedObjectData);

            /*--Загрузка данных в Google-------------------------------------------------------------------------------------------------*/
            if (protectedObjectData.photo) {

                const googleDriveFileID = await googleDrive.uploadProtectedObjectPhoto(protectedObjectData.id, protectedObjectData.photo);

                if (googleDriveFileID)
                    protectedObjectData.photo = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;

            } else {
                delete protectedObjectData['photo'];
            }

            /*--Проверка соединения с Mongo----------------------------------------------------------------------------------------------*/
            await mongoConnect();

            /*--Проверка существующего объекта в базе данных-----------------------------------------------------------------------------*/
            var mongoProtectedObject = await mongoProtectedObjectsModel.findById(protectedObjectData.id);

            if (!mongoProtectedObject) {
                throw ApiError.BadRequest(`Пультовой объект с id: ${protectedObjectData.id} не найден`);
            }

            /*--Проверка в базе данных операций добавлений или удаления СимКарт----------------------------------------------------------*/
            await checkAndUnsetSimCardFromProtectedObject(protectedObjectData, mongoProtectedObject);
            await checkAndAddSimCardToProtectedObject(protectedObjectData, mongoProtectedObject);

            /*--Проверка на изменение UI-аватара-----------------------------------------------------------------------------------------*/
            // console.log('mongoProtectedObject.number %o', mongoProtectedObject.number);
            // console.log('!isUndefined(mongoProtectedObject.number) %o', !isUndefined(mongoProtectedObject.number));
            if (mongoProtectedObject.photo.startsWith('https://ui-avatars.com/api/?name=')
                && !protectedObjectData.photo
                && (mongoProtectedObject.number != protectedObjectData.number)
                && !isUndefined(protectedObjectData.number)) {

                protectedObjectData.photo = `https://ui-avatars.com/api/?name=${
                    protectedObjectData.number ? protectedObjectData.number : protectedObjectData.name?.replace(/ /ig, ',')
                    }&size=256&font-size=0.33&length=3&background=random`;

            }

            /*--Обновляем данные самого пультового объекта-------------------------------------------------------------------------------*/
            mongoProtectedObject = await mongoProtectedObjectsModel.
                findByIdAndUpdate(protectedObjectData.id, protectedObjectData, { new: true }).lean();

            /*--Формирование DTO---------------------------------------------------------------------------------------------------------*/
            const dtoProtectedObject = new DTOProtectedObject(mongoProtectedObject);

            /*--Возврат результата-------------------------------------------------------------------------------------------------------*/
            return { protectedObject: dtoProtectedObject }

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async deleteProtectedObject(inputData) {
        const { idProtectedObject, idUser, reason } = inputData;

        if (!idProtectedObject) {
            throw ApiError.BadRequest("Не указан ID пультового объекта для проведения операции удаления");
        }

        if (!idUser) {
            throw ApiError.BadRequest("Не указан ID Пользователя, проводящего операцию удаления");
        }

        //Google
        await googleDrive.deleteProtectedObjectAvatar(idProtectedObject);

        //Mongo
        await mongoConnect();

        const userPerfomed = await mongoUserModel.findById(idUser, 'surname firstName').lean();

        if (!userPerfomed) {
            throw ApiError.BadRequest("Не найден ID Пользователя, проводящего операцию удаления");
        }

        const mongoProtectedObject = await mongoProtectedObjectsModel.findById(idProtectedObject);

        if (!mongoProtectedObject) {
            throw ApiError.BadRequest("Не найден пультовой объект для проведения операции удаления");
        }

        const mongoProtectedObjectArchive = await mongoProtectedObjectsArchiveModel.create(mongoProtectedObject.toJSON());

        mongoProtectedObjectArchive.reason = reason;
        mongoProtectedObjectArchive.userPerfomed = userPerfomed._id;
        mongoProtectedObjectArchive.userPerfomedSheme = 'User';

        await mongoProtectedObjectArchive.save();

        // await mongoGuardsModel.updateMany({ protectedObjects: mongoProtectedObject.id }, {
        //     $pullAll: {
        //         protectedObjects: [mongoProtectedObject.id]
        //     }
        // }).lean();

        // await mongoGuardsArchiveModel.updateMany({ protectedObjects: mongoProtectedObject.id }, {
        //     $pullAll: {
        //         protectedObjects: [mongoProtectedObject.id]
        //     }
        // }).lean();

        await mongoProtectedObject.delete();

        mongoProtectedObjectArchive.userPerfomed = userPerfomed;

        const dtoProtectedObject = new DTOProtectedObjectArchive(mongoProtectedObjectArchive);

        return { protectedObject: dtoProtectedObject }
    }

    async recoverProtectedObject(inputData) {

        const { idProtectedObject } = inputData;

        if (!idProtectedObject) {
            throw ApiError.BadRequest("Не указан ID пультового объекта для проведения операции восстановления");
        }

        //Mongo

        await mongoConnect();

        const mongoProtectedObjectArchive = await mongoProtectedObjectsArchiveModel.findById(idProtectedObject);

        if (!mongoProtectedObjectArchive) {
            throw ApiError.BadRequest("Не найден пультового объекта для проведения операции восстановления");
        }

        if (mongoProtectedObjectArchive['reason']) delete mongoProtectedObjectArchive['reason'];
        if (mongoProtectedObjectArchive['userPerfomed']) delete mongoProtectedObjectArchive['userPerfomed'];
        if (mongoProtectedObjectArchive['userPerfomedSheme']) delete mongoProtectedObjectArchive['userPerfomedSheme'];

        const mongoProtectedObject = await mongoProtectedObjectsModel.create(mongoProtectedObjectArchive.toJSON());

        await mongoProtectedObjectArchive.delete();

        const dtoProtectedObject = new DTOProtectedObject(mongoProtectedObject);

        return { protectedObject: dtoProtectedObject }
    }

    async searchProtectedObject(inputData) {
        try {

            console.log('-----------------------searchProtectedObject-------------------');

            /*--Валидация данных---------------------------------------------------------------------------------------------------------*/

            const {text} = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            if (!text) {
                throw ApiError.BadRequest(`Отсутствуют данные для поиска`);
            }
            console.log('text %o', text);

            /*--Проверка соединения с Mongo----------------------------------------------------------------------------------------------*/
            await mongoConnect();

            /*--Поиск данных объектов в базе данных--------------------------------------------------------------------------------------*/
            var mongoProtectedObject = await mongoProtectedObjectsModel.find({$text: {$search: text}})
            // console.log('mongoProtectedObject %o', mongoProtectedObject);

            /*--Возврат результата-------------------------------------------------------------------------------------------------------*/
            return { search: mongoProtectedObject.map( protectedObject => protectedObject.number ) }

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async reportProtectedObjects() {

        try {
            console.log('---------------reportProtectedObjects-----------------');

            //Check initials condition
            await mongoConnect();

            // Сначала запрашиваем данные 
            const responceProtectedObjects = await mongoProtectedObjectsModel.find({},
                '-createdAt -updatedAt -description',
                { sort: { 'number': 1 } })
                .lean();

            // console.log('responceProtectedObjects: %o', responceProtectedObjects);

            // Формируем документ из полученных данных
            const document = reportForAllProtectedObjects(responceProtectedObjects);

            const documentName = `Список пультовых объектов-${getCurrentTimeStamp()}.xlsx`;

            const googleDriveFileID = `http://drive.google.com/uc?export=view&id=${await googleDrive.uploadExcelTimesheet(
                document,
                documentName,
                process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_REPORT_PRINT_FOR_ALL_PROTECTED_OBJECTS)
                }`;

            return { document, googleDriveFileID };

        } catch (error) {
            console.log(error);
            throw error;
        }

    }

    async uploadJsonProtectedObjects(inputData) {

        try {

            console.log('---------------uploadJsonProtectedObjects-----------------');

            // Переменные------------------------------------------------------------------------------------------------
            // const currentTimeStamp = getCurrentTimeStamp();

            //Validate date----------------------------------------------------------------------------------------------
            const { obj_json } = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            // console.log('obj_json: %o', obj_json);

            // Извлечение массива данных---------------------------------------------------------------------------------
            const stringProtectedObjects = new TextDecoder('windows-1251').decode(Buffer.from(obj_json.split(',')[1], 'base64'));

            // console.log('utf8ProtectedObjects: %o', utf8ProtectedObjects);

            const jsonProtectedObjects = JSON.parse(stringProtectedObjects);

            // console.log('requestJson: %o', requestJson);

            // Описание JSON документа-----------------------------------------------------------------------------------
            try {
                // Старый формат
                // 'ABIObjs',-
                // 'Address',Адресс
                // 'CutName',Наименование
                // 'Decoder4p2',-
                // 'Describe',Описание
                // 'DevType',?
                // 'FB', непонятные номера телефонов
                // 'FIREMON', пустота
                // 'IMEI_OF_OBJECT', имеи неизвестные
                // 'N', Номер
                // 'ObjType', Тип объекта
                // 'P', везде 1
                // 'RepPerAlarms', много где 1 мало где undefined
                // 'TT2', непонятный массив
                // 'TechNum', номер пользователя техника
                // 'WS', везде 1
                // 'alar', массив { A: { o: 1, v: 30 }, G: { o: 1, v: 900 }, T: { o: 1, v: 180 } }
                // 'm_PartsCount', везде 16
                // 'msk', непонятный массив
                // 'AddEve', маска для зон
                // 'HardMin', много где undefined мало где 1
                // 'HardTst', много где undefined мало где 1
                // 'RESPONSIBLE_PERSON',
                // 'm_bCalmBattRDnKeyrings',
                // 'm_SENDSMSIF_TT_BR_ONLY',
                // 'UseTech',
                // 'm_AutoOffByTest_objprop',
                // 'bObjectIsIgnored',
                // 'm_bIs_K_series',
                // 'm_bCalmDownTempers',
                // 'm_AutoOffByAccs_objprop',
                // 'DOLZHNIK',
                // 'm_bIs_Kommerce',

                // Новый формат
                // 'DevType', ?
                // 'ObjType', Тип объекта
                // 'WORK_GR', везде 1
                // 'TechNum', номер пользователя техника
                // 'RepPerAlarms', много где 1 мало где undefined
                // 'Lati', везде 0
                // 'Long', везде 0
                // 'alar', массив { A: { o: 1, v: 30 }, G: { o: 1, v: 900 }, T: { o: 1, v: 180 } }
                // 'CutName', Наименование
                // 'Address', Адресс
                // 'Describe', Описание
                // 'Describe_f', либо 0 либо 1 либо undefined
                // 'm_ZonesGroups', непонятный массив
                // 'Decoder4p2', везде 0|
                // 'ABIObjs', везде 0|
                // 'OBJECT_TIMETABLE', массив с данными о времени охраны
                // 'SMSM4S', везде { W: '00000000-0000-0000-0000-000000000000' }
                // 'N', Номер
                // 'P', везде 1
                // 'HardMin', много где undefined мало где 1
                // 'HardTst', много где undefined мало где 1
                // 'm_bCalmBattRDnKeyrings', много где undefined мало где 1
                // 'OBJECT_USERS', Массив пользователей объекта
                // 'FB', непонятные номера телефонов
                // 'm_SENDSMSIF_TT_BR_ONLY', почти везде undefined только на одном 15 - 1
                // 'UseTech',  где то undefined  где то 1
                // 'm_AutoOffByTest_objprop',
                // 'bObjectIsIgnored', если отключен - 1, если включён - undifined
                // 'Describe_fa', непонятные данные
                // 'm_bCalmDownTempers',
                // 'm_AutoOffByAccs_objprop',
                // 'AddEve', много где undefined мало где 1
                // 'DOLZHNIK', почти везде undefined только на одном 120 - 1
                // 'm_bIs_Kommerce', почти везде undefined только на одном 136 и 171 - 1
                // 'FIREMON', почти везде undefined только на одном 1300 - { lat: '0', lon: '0' }
                // 'CID_TEMPLATE_ID', почти везде undefined только на одном 1300 - 4
            } catch (error) { }

            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            // Выборка данных о пультовых объектах-----------------------------------------------------------------------
            var currentProtectedObjects = await mongoProtectedObjectsModel
                .find({}, '-createdAt -updatedAt')
                .lean();

            // console.log('currentProtectedObjects: %o', currentProtectedObjects);

            // Формирование агрегационных и транзакционных данных--------------------------------------------------------
            // сюда записываются данные об агрегации
            const bulkData = [];

            // сюда записываются данные о транзакциях
            const transactionData = [];

            // Создаем Map для быстрого поиска существующих объектов по номеру
            const currentObjectsMap = new Map();
            for (const obj of currentProtectedObjects) {
                currentObjectsMap.set(obj.number, obj);
            }

            // Просматриваем среди данных на изменение найденные и подготовка к агрегации и транзакции
            for (const jsonProtectedObject of jsonProtectedObjects) {

                // быстрый поиск в Map
                const existProtectedObject = currentObjectsMap.get(jsonProtectedObject.N);

                // переменные
                const photo = existProtectedObject?.photo 
                ? existProtectedObject.photo 
                : `https://ui-avatars.com/api/?name=${
                    jsonProtectedObject.N ? jsonProtectedObject.N : jsonProtectedObject.CutName.replace(/ /ig, ',')
                    }&size=256&font-size=0.33&length=3&background=random`;

                const description = jsonProtectedObject.Describe ? jsonProtectedObject.Describe.replace(/^\d\!|---/gm, '') : null;

                // формирование агрегации и транзакции
                if (existProtectedObject) {

                    if (jsonProtectedObject.bObjectIsIgnored) {

                        // console.log("Объект №%o, %o, %o есть в облаке, и отмечен как отключенный",
                        //     jsonProtectedObject.N,
                        //     jsonProtectedObject.CutName,
                        //     jsonProtectedObject.Address,
                        // );

                        transactionData.push({
                            number: jsonProtectedObject.N,
                            log: `${jsonProtectedObject.CutName}, ${jsonProtectedObject.Address} есть в облаке, и отмечен как отключенный`,
                            operation: FUDTransactionArchive,
                            archiveData: {
                                document: existProtectedObject
                            }
                        })

                    } else if (jsonProtectedObject.CutName == existProtectedObject.name
                        && jsonProtectedObject.Address == existProtectedObject.address) {

                        if (description == existProtectedObject.description
                            && photo == existProtectedObject.photo) {

                            // console.log("Объект №%o, %o, %o есть в облаке, и остается без изменений",
                            //     jsonProtectedObject.N,
                            //     jsonProtectedObject.CutName,
                            //     jsonProtectedObject.Address,
                            // );         

                            transactionData.push({
                                number: jsonProtectedObject.N,
                                log: `${jsonProtectedObject.CutName}, ${jsonProtectedObject.Address} есть в облаке, и остается без изменений`,
                                operation: FUDTransactionNoChange,
                            })

                        } else {

                            // console.log("Объект №%o, %o, %o есть в облаке, но его данные требуют изменений",
                            //     jsonProtectedObject.N,
                            //     jsonProtectedObject.CutName,
                            //     jsonProtectedObject.Address,
                            // );

                            bulkData.push({
                                updateOne: {
                                    filter: {
                                        number: jsonProtectedObject.N,
                                    },
                                    update: {
                                        description: description,
                                        photo: photo
                                    }
                                }
                            })

                            transactionData.push({
                                number: jsonProtectedObject.N,
                                log: `${jsonProtectedObject.CutName}, ${jsonProtectedObject.Address} есть в облаке, но его данные были обновлены`,
                                operation: FUDTransactionUpdate,
                            })
                        }

                    } else {

                        // console.log("Объект №%o, но его данные не совпадают с данными загруженного файла\r\nНаименование: %o - %o\r\nАдрес: %o - %o",
                        //     jsonProtectedObject.N,
                        //     jsonProtectedObject.CutName,
                        //     existProtectedObject.name,
                        //     jsonProtectedObject.Address,
                        //     existProtectedObject.address,
                        // );

                        transactionData.push({
                            number: jsonProtectedObject.N,
                            log: `есть в облаке, но его данные не совпадают с данными загруженного файла\r\nВ облаке: ${existProtectedObject.name}, ${existProtectedObject.address}\r\nВ файле: ${jsonProtectedObject.CutName}, ${jsonProtectedObject.Address}`,
                            operation: FUDTransactionReplacement,
                            insertData: {
                                document: {
                                    number: jsonProtectedObject.N,
                                    name: jsonProtectedObject.CutName,
                                    address: jsonProtectedObject.Address,
                                    description: description,
                                    photo: photo
                                }
                            },
                            archiveData: {
                                document: existProtectedObject
                            }
                        })

                    }

                } else if (jsonProtectedObject.bObjectIsIgnored) {

                    // console.log("Объект №%o, %o, %o отсутствует в облаке, и отмечен как отключенный",
                    //     jsonProtectedObject.N,
                    //     jsonProtectedObject.CutName,
                    //     jsonProtectedObject.Address,
                    // );      

                    transactionData.push({
                        number: jsonProtectedObject.N,
                        log: `${jsonProtectedObject.CutName}, ${jsonProtectedObject.Address} отсутствует в облаке, и отмечен как отключенный`,
                        operation: FUDTransactionIgnore,
                    })

                } else {

                    // console.log("Объект №%o, %o, %o отсутствует в облаке, и будет добавлен",
                    //     jsonProtectedObject.N,
                    //     jsonProtectedObject.CutName,
                    //     jsonProtectedObject.Address,
                    // );    

                    bulkData.push({
                        insertOne: {
                            document: {
                                number: jsonProtectedObject.N,
                                name: jsonProtectedObject.CutName,
                                address: jsonProtectedObject.Address,
                                description: description,
                                photo: photo
                            }
                        }
                    })

                    transactionData.push({
                        number: jsonProtectedObject.N,
                        log: `${jsonProtectedObject.CutName}, ${jsonProtectedObject.Address} отсутствовал в облаке, и был добавлен`,
                        operation: FUDTransactionAddition,
                    })
                }
            }

            // Внесение агрегационных данных-----------------------------------------------------------------------------
            var protectedObjects;
            // console.log('bulkWriteData: %o', bulkWriteData);
            // если среди данных нет агрегата - добавить 
            if (bulkData.length > 0) {

                const responce = await mongoProtectedObjectsModel.bulkWrite(bulkData);

                // console.log('bulkWrite: %o', responce);

                // Выборка данных о пультовых объектах
                protectedObjects = await mongoProtectedObjectsModel
                    .find({}, '-createdAt -updatedAt -description -sim1 -sim2')
                    .lean();

                protectedObjects.sort((a, b) => {
                    if (a.number && b.number)
                        return (a.number - b.number);
                    else return -1;
                });
            }

            transactionData.sort((a, b) => {
                if ([FUDTransactionReplacement, FUDTransactionArchive].includes(a.operation)) {
                    if (a.number && b.number && [FUDTransactionReplacement, FUDTransactionArchive].includes(b.operation))
                        return (a.number - b.number);
                    else return -1;
                } else if (a.number && b.number)
                    return (a.number - b.number);
                else return -1;
            })

            return { transactionData, protectedObjects }

        } catch (error) {

            console.log(error);

            throw error;

        }

    }

    async uploadFinishProtectedObjects(inputData) {

        try {
            console.log('---------------uploadFinishProtectedObjects-----------------');
            // Переменные------------------------------------------------------------------------------------------------
            const currentTimeStamp = new Date().toLocaleString("ru-RU");

            //Validate date----------------------------------------------------------------------------------------------
            const { transactionData, idUser } = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            // console.log('transactionData: %o, idUser: %o', transactionData, idUser);

            if (!transactionData || !Array.isArray(transactionData) || transactionData.length == 0) {
                throw ApiError.BadRequest("Не указаны данные операции завершения загрузки данных");
            }

            if (!idUser) {
                throw ApiError.BadRequest("Не указан ID Пользователя, проводящего операцию завершения загрузки данных");
            }

            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            //Проверка данных о пользователе-----------------------------------------------------------------------------
            const userPerfomed = await mongoUserModel.findById(idUser, 'surname firstName').lean();

            if (!userPerfomed) {
                throw ApiError.BadRequest("Не найден ID Пользователя, проводящего операцию удаления");
            }

            // Формирование агрегационных и транзакционных данных--------------------------------------------------------
            // сюда записываются данные об агрегации
            const bulkWriteData = [];

            // сюда записываются данные об агрегации
            const bulkDeleteData = [];

            // сюда записываются данные об агрегации
            const bulkArchiveData = [];

            //Удаление данных в гугл облаке-------------------------------------------------------------------------------
            const googleDriveDeletions = [];

            for (const element of transactionData) {
                switch (element.operation) {

                    case FUDTransactionReplacement:
                        if (element.insertData?.document && element.archiveData?.document?._id) {

                            bulkWriteData.push({ insertOne: element.insertData });

                            bulkDeleteData.push(element.archiveData.document._id);

                            bulkArchiveData.push({
                                insertOne: {
                                    document: {
                                        reason: 'объект архивирован в ходе синхронизации данных с файлом obj_json ' + currentTimeStamp,
                                        userPerfomed: userPerfomed._id,
                                        userPerfomedSheme: 'User',
                                        ...element.archiveData.document,
                                    }
                                }
                            });

                            //Удаление данных в гугл облаке-------------------------------------------------------------------------------
                            googleDriveDeletions.push(googleDrive.deleteProtectedObjectAvatar(element.archiveData.document._id));

                        }
                        break;

                    case FUDTransactionUpdate:
                        if (element.insertData?.document && element.archiveData?.document?._id) {

                            bulkWriteData.push({
                                updateOne: {
                                    filter: {
                                        _id: element.archiveData.document._id,
                                    },
                                    update: {
                                        name: element.insertData.document.name ? element.insertData.document.name : null,
                                        address: element.insertData.document.address ? element.insertData.document.address : null,
                                        description: element.insertData.document.description ? element.insertData.document.description : null,
                                    }
                                }
                            })

                        }
                        break;

                    case FUDTransactionArchive:
                        if (element.archiveData?.document?._id) {

                            bulkDeleteData.push(element.archiveData.document._id);

                            bulkArchiveData.push({
                                insertOne: {
                                    document: {
                                        reason: 'объект архивирован в ходе синхронизации данных с файлом obj_json ' + currentTimeStamp,
                                        userPerfomed: userPerfomed._id,
                                        userPerfomedSheme: 'User',
                                        ...element.archiveData.document,
                                    }
                                }
                            });

                            //Удаление данных в гугл облаке-------------------------------------------------------------------------------
                            googleDriveDeletions.push(googleDrive.deleteProtectedObjectAvatar(element.archiveData.document._id));

                        }
                        break;

                    default:
                        break;
                }
            }

            // Выполнение параллельного удаления в Google Drive
            if (googleDriveDeletions.length > 0) {
                await Promise.allSettled(googleDriveDeletions);
            }

            // Внесение агрегационных данных-----------------------------------------------------------------------------
            // console.log('bulkDeleteData: %o', bulkDeleteData);
            if (bulkDeleteData.length > 0) {
                bulkWriteData.unshift({
                    deleteMany: {
                        filter: {
                            _id: { $in: bulkDeleteData.map(element => mongoose.Types.ObjectId(element)) }
                        }
                    }
                });
            }

            var protectedObjects;
            // console.log('bulkWriteData: %o', bulkWriteData);
            // если среди данных нет агрегата - добавить 
            if (bulkWriteData.length > 0) {

                const responce = await mongoProtectedObjectsModel.bulkWrite(bulkWriteData);

                console.log('bulkWrite: %o', responce);

                // Выборка данных о пультовых объектах
                protectedObjects = await mongoProtectedObjectsModel
                    .find({}, '-createdAt -updatedAt -description -sim1 -sim2')
                    .lean();

                protectedObjects.sort((a, b) => {
                    if (a.number && b.number)
                        return (a.number - b.number);
                    else return -1;
                });
            }

            var protectedObjectsArchive;
            // console.log('bulkArchiveData: %o', bulkArchiveData);
            // если среди данных нет агрегата - добавить 
            if (bulkArchiveData.length > 0) {

                const responce = await mongoProtectedObjectsArchiveModel.bulkWrite(bulkArchiveData);

                // console.log('bulkArchiveData: %o', responce);

                protectedObjectsArchive = await mongoProtectedObjectsArchiveModel
                    .find({}, '-createdAt -updatedAt -description -sim1 -sim2')
                    .populate('userPerfomed', 'surname firstName')
                    .lean();

                protectedObjectsArchive.sort((a, b) => {
                    if (a.number && b.number)
                        return (a.number - b.number);
                    else return -1;
                });

                protectedObjectsArchive.forEach(value => {

                    // Преобразование ID в строки
                    value._id = value._id.toString();

                    if (value.userPerfomed) {
                        value.userPerfomed._id = value.userPerfomed._id.toString();
                    }

                });
            }

            return { protectedObjects, protectedObjectsArchive };

        } catch (error) {

            console.log(error);

            throw error;

        }

    }

}

export default new ProtectedObjectService();