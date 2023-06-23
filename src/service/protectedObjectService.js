import { ApiError } from "../../middleware/exceptions";
import DTOProtectedObject, { DTOProtectedObjectArchive, validateYup } from "../dtos/dtoProtectedObject";
import googleDrive from "../google/api/googleDrive";
import mongoProtectedObjectsArchiveModel from "../mongo/models/mongoProtectedObjectsArchiveModel";
import mongoProtectedObjectsModel from "../mongo/models/mongoProtectedObjectsModel";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoConnect from "../mongo/mongoConnect";
import { mapValue } from "../utils/arrayUtils";
import { UnicodeToWin1251 } from "../utils/dataUtils";
import { getCurrentTimeStamp } from "../utils/dateUtils";
import { reportForAllProtectedObjects } from "../utils/reportsUtils";

function managerEquals(a, b) {
    if (!a && !b) {
        return false;
    }
    if (!a || !b) {
        return true;
    }
    return Boolean(a.toString().localeCompare(b.toString()));
}

class ProtectedObjectService {

    async createProtectedObject(inputData) {

        let deleteProtectedObject;

        try {

            //Validate date
            if (inputData.number) {
                inputData.number = parseInt(inputData.number);
            } else {
                delete inputData.number
            }

            const protectedObjectData = await validateYup(inputData, { deleteEmptyKey: true }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            //break image
            let photo;
            if (protectedObjectData.photo) {
                photo = protectedObjectData.photo;
                delete protectedObjectData['photo'];
            } else {

                protectedObjectData.photo = `https://ui-avatars.com/api/?name=${protectedObjectData.number ? protectedObjectData.number : protectedObjectData.name?.replace(/ /ig, ',')
                    }&size=256&font-size=0.33&length=3&background=random`;

            }

            //Проверка соединения с Монго
            await mongoConnect();

            const candidate = await mongoProtectedObjectsModel.findOne({ number: protectedObjectData.number }).lean();

            if (candidate) {
                throw ApiError.BadRequest(`Пультовой объект с номером ${protectedObjectData.number} уже существует`);
            }

            //Create model
            let mongoProtectedObject = await mongoProtectedObjectsModel.create(protectedObjectData);
            deleteProtectedObject = mongoProtectedObject;

            //Google
            if (photo) {

                const googleDriveFileID = await googleDrive.uploadProtectedObjectPhoto(mongoProtectedObject._id.toString(), photo);

                if (googleDriveFileID)
                    mongoProtectedObject.photo = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;

                await mongoProtectedObject.save();

            }

            const dtoProtectedObject = new DTOProtectedObject(mongoProtectedObject);

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
            // console.log('-----------------------editProtectedObject-------------------');

            //Validate date 
            if (inputData.number) {
                inputData.number = parseInt(inputData.number);
            } else {
                inputData.number = null;
            }

            const protectedObjectData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            //Google
            if (protectedObjectData.photo) {

                const googleDriveFileID = await googleDrive.uploadProtectedObjectPhoto(protectedObjectData.id, protectedObjectData.photo);

                if (googleDriveFileID)
                    protectedObjectData.photo = `http://drive.google.com/uc?export=view&id=${googleDriveFileID}`;

            } else {
                delete protectedObjectData['photo'];
            }

            //Mongo
            await mongoConnect();

            var mongoProtectedObject = await mongoProtectedObjectsModel.findById(protectedObjectData.id);

            if (!mongoProtectedObject) {
                throw ApiError.BadRequest(`Пультовой объект с id: ${protectedObjectData.id} не найден`);
            }

            if (mongoProtectedObject.photo.startsWith('https://ui-avatars.com/api/?name=') &&
                !protectedObjectData.photo &&
                (mongoProtectedObject.number != protectedObjectData.number)) {

                protectedObjectData.photo = `https://ui-avatars.com/api/?name=${protectedObjectData.number
                    }&size=256&font-size=0.33&length=3&background=random`;

            }

            // Обновляем данные в самого пультового объекта---------------------------------------------------------------------------------------------------------------------
            mongoProtectedObject = await mongoProtectedObjectsModel.
                findByIdAndUpdate(protectedObjectData.id, protectedObjectData, { new: true }).lean();

            //DTO
            const dtoProtectedObject = new DTOProtectedObject(mongoProtectedObject);

            //Result

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

            // reason: 'объект архивирован в ходе синхронизации данных с файлом obj_json ' + currentTimeStamp,
            // userPerfomed: userPerfomed._id,
            // userPerfomedSheme: 'User',

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
                .find({}, '-createdAt -updatedAt', { sort: { 'number': 1 } })
                .lean();

            // console.log('currentProtectedObjects: %o', currentProtectedObjects);

            // Формирование агрегационных и транзакционных данных--------------------------------------------------------
            // сюда записываются данные об агрегации
            const bulkData = [];

            //сюда записываются данные о транзакциях
            const transactionData = [];

            // Просматриваем среди данных на изменение найденные и подготовка к агрегации и транзакции
            for (const jsonProtectedObject of jsonProtectedObjects) {

                // проверка наличия в облаке данных с имеющимися номерами
                let existProtectedObject;

                if (currentProtectedObjects.length > 0) {

                    currentProtectedObjects = currentProtectedObjects.reduce((data, valueB) => {

                        if (valueB.number == jsonProtectedObject.N) {
                            existProtectedObject = valueB;
                        } else {
                            data.push(valueB)
                        }

                        return data;

                    }, []);

                }

                // переменные
                const photo = existProtectedObject?.photo ? existProtectedObject.photo : `https://ui-avatars.com/api/?name=${
                    jsonProtectedObject.CutName ? jsonProtectedObject.CutName.replace(/ /ig, ',') : jsonProtectedObject.N
                    }&size=256&font-size=0.33&length=3&background=random`;

                const description = jsonProtectedObject.Describe?.replace(/^\d\!|---/gm, '');

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
                            operation: 'Архивация',
                            archiveData: {
                                document: {
                                    _id: existProtectedObject._id,
                                    number: existProtectedObject.N,
                                    name: existProtectedObject.CutName,
                                    address: existProtectedObject.Address,
                                    description: existProtectedObject.description,
                                    photo: existProtectedObject.photo
                                }
                            }
                        })

                    } else if (jsonProtectedObject.CutName == existProtectedObject.name
                        && jsonProtectedObject.Address == existProtectedObject.address) {

                        if (description == existProtectedObject.description 
                            && photo == existProtectedObject.photo ) {

                            // console.log("Объект №%o, %o, %o есть в облаке, и остается без изменений",
                            //     jsonProtectedObject.N,
                            //     jsonProtectedObject.CutName,
                            //     jsonProtectedObject.Address,
                            // );         

                            transactionData.push({
                                number: jsonProtectedObject.N,
                                log: `${jsonProtectedObject.CutName}, ${jsonProtectedObject.Address} есть в облаке, и остается без изменений`,
                                operation: 'Без изменений',
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
                                operation: 'Обновление',
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
                            log: `есть в облаке, но его данные не совпадают с данными загруженного файла\r\nВ облаке: ${jsonProtectedObject.CutName}, ${jsonProtectedObject.Address}\r\nВ файле:${existProtectedObject.name}, ${existProtectedObject.address}`,
                            operation: 'Замена',
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
                                document: {
                                    _id: existProtectedObject._id,
                                    number: existProtectedObject.N,
                                    name: existProtectedObject.CutName,
                                    address: existProtectedObject.Address,
                                    description: existProtectedObject.description,
                                    photo: existProtectedObject.photo
                                }
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
                        operation: 'Игнорирование',
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
                        log: `${jsonProtectedObject.CutName}, ${jsonProtectedObject.Address} отсутствует в облаке, и был добавлен`,
                        operation: 'Добавление',
                    })
                }
            }

            // Внесение агрегационных данных-----------------------------------------------------------------------------
            // console.log('bulkWriteData: %o', bulkWriteData);
            // если среди данных нет агрегата - добавить 
            if (bulkData.length > 0) {

                const responce = await mongoProtectedObjectsModel.bulkWrite(bulkData);

                // console.log('bulkWrite: %o', responce);

            }

            return { transactionData }

        } catch (error) {

            console.log(error);

            throw error;

        }

    }

}

export default new ProtectedObjectService();