import {
    FUDTransactionArchive,
    FUDTransactionNoChange,
    FUDTransactionUpdate,
    FUDTransactionReplacement,
    FUDTransactionIgnore,
    FUDTransactionAddition
} from "../../components/levelZ_variable/FUploadDataTransactionList";
import { ApiError } from "../../middleware/exceptions";
import DTOSimCard, { DTOSimCardArchive, validateYup } from "../dtos/dtoSimCard";
import googleDrive from "../google/api/googleDrive";
import mongoSimCardsArchiveModel from "../mongo/models/mongoSimCardsArchiveModel";
import mongoSimCardsModel from "../mongo/models/mongoSimCardsModel";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoConnect from "../mongo/mongoConnect";
import { mapValue } from "../utils/arrayUtils";
import { UnicodeToWin1251 } from "../utils/dataUtils";
import { getCurrentTimeStamp } from "../utils/dateUtils";
import { reportForAllSimCards } from "../utils/reportsUtils";
import mongoose from "mongoose";
import ExcelJS from "exceljs";
import { getFormatedTelephoneNumberAndProvider, isNumberICCID, isNumberMSISDN } from "../../components/levelZ_variable/FProviderItemList";

function managerEquals(a, b) {
    if (!a && !b) {
        return false;
    }
    if (!a || !b) {
        return true;
    }
    return Boolean(a.toString().localeCompare(b.toString()));
}

class SimCardService {

    async createSimCard(inputData) {

        let deleteSimCard;

        try {

            //Validate date----------------------------------------------------------------------------------------------

            const simCardData = await validateYup(inputData, { deleteEmptyKey: true }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            //Проверка существующего абон. номера------------------------------------------------------------------------
            const candidate = await mongoSimCardsModel.findOne({ msisdn: simCardData.msisdn }).lean();

            if (candidate) {
                throw ApiError.BadRequest(`Сим. карта с абон. номером ${simCardData.msisdn} уже существует`);
            }

            //Создание документа-----------------------------------------------------------------------------------------
            let mongoSimCard = await mongoSimCardsModel.create(simCardData);
            deleteSimCard = mongoSimCard;

            //ДТО документ-----------------------------------------------------------------------------------------------
            const dtoSimCard = new DTOSimCard(mongoSimCard);

            //Возврат результата-----------------------------------------------------------------------------------------
            return { simCard: dtoSimCard }

        } catch (error) {
            console.log(error);

            if (deleteSimCard) {

                try {

                    await mongoSimCardsModel.deleteOne({ _id: deleteSimCard._id })

                } catch (error) {

                    throw error;

                }

            }

            throw error;
        }

    }

    async editSimCard(inputData) {
        try {
            // console.log('-----------------------editSimCard-------------------');

            //Validate date----------------------------------------------------------------------------------------------
            const simCardData = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            //Проверка существующего абон. номера------------------------------------------------------------------------
            var mongoSimCard = await mongoSimCardsModel.findById(simCardData.id);

            if (!mongoSimCard) {
                throw ApiError.BadRequest(`Сим-карта с id: ${simCardData.id} не найдена`);
            }

            // Обновляем данные сим-карты--------------------------------------------------------------------------------
            mongoSimCard = await mongoSimCardsModel.
                findByIdAndUpdate(simCardData.id, simCardData, { new: true }).lean();

            //ДТО документ-----------------------------------------------------------------------------------------------
            const dtoSimCard = new DTOSimCard(mongoSimCard);

            //Возврат результата-----------------------------------------------------------------------------------------
            return { simCard: dtoSimCard }

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async deleteSimCard(inputData) {
        // Validate date----------------------------------------------------------------------------------------------
        const { idSimCard, idUser, reason } = inputData;

        if (!idSimCard) {
            throw ApiError.BadRequest("Не указан ID пультового объекта для проведения операции удаления");
        }

        if (!idUser) {
            throw ApiError.BadRequest("Не указан ID Пользователя, проводящего операцию удаления");
        }

        // Проверка соединения с Монго--------------------------------------------------------------------------------
        await mongoConnect();

        const userPerfomed = await mongoUserModel.findById(idUser, 'surname firstName').lean();

        // Проверка существующего пользователя------------------------------------------------------------------------
        if (!userPerfomed) {
            throw ApiError.BadRequest("Не найден ID Пользователя, проводящего операцию удаления");
        }

        // Проверка существующего абон. номера------------------------------------------------------------------------
        const mongoSimCard = await mongoSimCardsModel.findById(idSimCard);

        if (!mongoSimCard) {
            throw ApiError.BadRequest("Не найдена сим-карта для проведения операции удаления");
        }

        // Архивация абон. номера-------------------------------------------------------------------------------------
        const mongoSimCardArchive = await mongoSimCardsArchiveModel.create(mongoSimCard.toJSON());

        mongoSimCardArchive.reason = reason;
        mongoSimCardArchive.userPerfomed = userPerfomed._id;
        mongoSimCardArchive.userPerfomedSheme = 'User';

        await mongoSimCardArchive.save();

        // Обновление зависимостей------------------------------------------------------------------------------------
        // await mongoGuardsModel.updateMany({ simCards: mongoSimCard.id }, {
        //     $pullAll: {
        //         simCards: [mongoSimCard.id]
        //     }
        // }).lean();

        // await mongoGuardsArchiveModel.updateMany({ simCards: mongoSimCard.id }, {
        //     $pullAll: {
        //         simCards: [mongoSimCard.id]
        //     }
        // }).lean();

        // Удаление абон. номера-------------------------------------------------------------------------------------
        await mongoSimCard.delete();

        //ДТО документ-----------------------------------------------------------------------------------------------
        mongoSimCardArchive.userPerfomed = userPerfomed;

        const dtoSimCard = new DTOSimCardArchive(mongoSimCardArchive);

        //Возврат результата-----------------------------------------------------------------------------------------
        return { simCard: dtoSimCard }
    }

    async recoverSimCard(inputData) {
        // Validate date----------------------------------------------------------------------------------------------
        const { idSimCard } = inputData;

        if (!idSimCard) {
            throw ApiError.BadRequest("Не указан ID сим-карты для проведения операции восстановления");
        }

        // Проверка соединения с Монго--------------------------------------------------------------------------------
        await mongoConnect();

        // Проверка архивированного абон. номера----------------------------------------------------------------------
        const mongoSimCardArchive = await mongoSimCardsArchiveModel.findById(idSimCard);

        if (!mongoSimCardArchive) {
            throw ApiError.BadRequest("Не найден пультового объекта для проведения операции восстановления");
        }

        // Удаление архивных полей данных-----------------------------------------------------------------------------
        if (mongoSimCardArchive['reason']) delete mongoSimCardArchive['reason'];
        if (mongoSimCardArchive['userPerfomed']) delete mongoSimCardArchive['userPerfomed'];
        if (mongoSimCardArchive['userPerfomedSheme']) delete mongoSimCardArchive['userPerfomedSheme'];

        // Создание актуального абон. номера--------------------------------------------------------------------------
        const mongoSimCard = await mongoSimCardsModel.create(mongoSimCardArchive.toJSON());

        // Удаление архивного абон. номера----------------------------------------------------------------------------
        await mongoSimCardArchive.delete();

        //ДТО документ-----------------------------------------------------------------------------------------------
        const dtoSimCard = new DTOSimCard(mongoSimCard);

        //Возврат результата-----------------------------------------------------------------------------------------
        return { simCard: dtoSimCard }
    }

    async reportSimCards() {

        try {
            console.log('---------------reportSimCards-----------------');

            // Проверка соединения с Монго---------------------------------------------------------------------------
            await mongoConnect();

            // Сначала запрашиваем данные----------------------------------------------------------------------------
            const responceSimCards = await mongoSimCardsModel
            .find({}, '-createdAt -updatedAt', { sort: { provider: 1, msisdn: 1 } })
            .lean();

            // console.log('responceSimCards: %o', responceSimCards);

            // Формируем документ из полученных данных---------------------------------------------------------------
            const document = reportForAllSimCards(responceSimCards);

            // Загружаем документ в гугл облако----------------------------------------------------------------------
            const documentName = `Список сим-карт-${getCurrentTimeStamp()}.xlsx`;

            const googleDriveFileID = `http://drive.google.com/uc?export=view&id=${await googleDrive.uploadExcelTimesheet(
                document,
                documentName,
                process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_REPORT_PRINT_FOR_ALL_SIM_CARDS)
                }`;

            //Возврат результата-------------------------------------------------------------------------------------
            return { document, googleDriveFileID };

        } catch (error) {
            console.log(error);
            throw error;
        }

    }

    async uploadJsonSimCards(inputData) {

        try {

            console.log('---------------uploadJsonSimCards-----------------');
            console.log(inputData);
            return {validate: 'finish'};
            // Переменные------------------------------------------------------------------------------------------------
            // const currentTimeStamp = getCurrentTimeStamp();

            //Validate date----------------------------------------------------------------------------------------------
            const { obj_json } = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            // console.log('obj_json: %o', obj_json);

            // Извлечение массива данных---------------------------------------------------------------------------------
            const stringSimCards = new TextDecoder('windows-1251').decode(Buffer.from(obj_json.split(',')[1], 'base64'));

            // console.log('utf8SimCards: %o', utf8SimCards);

            const jsonSimCards = JSON.parse(stringSimCards);

            // console.log('requestJson: %o', requestJson);

            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            // Выборка данных о пультовых объектах-----------------------------------------------------------------------
            var currentSimCards = await mongoSimCardsModel
                .find({}, '-createdAt -updatedAt', { sort: { 'number': 1 } })
                .lean();

            // console.log('currentSimCards: %o', currentSimCards);

            // Формирование агрегационных и транзакционных данных--------------------------------------------------------
            // сюда записываются данные об агрегации
            const bulkData = [];

            // сюда записываются данные о транзакциях
            const transactionData = [];

            // Просматриваем среди данных на изменение найденные и подготовка к агрегации и транзакции
            for (const jsonSimCard of jsonSimCards) {

                // проверка наличия в облаке данных с имеющимися номерами
                let existSimCard;

                if (currentSimCards.length > 0) {

                    currentSimCards = currentSimCards.reduce((data, valueB) => {

                        if (valueB.number == jsonSimCard.N) {
                            existSimCard = valueB;
                        } else {
                            data.push(valueB)
                        }

                        return data;

                    }, []);

                }

                // переменные
                const photo = existSimCard?.photo ? existSimCard.photo : `https://ui-avatars.com/api/?name=${jsonSimCard.CutName ? jsonSimCard.CutName.replace(/ /ig, ',') : jsonSimCard.N
                    }&size=256&font-size=0.33&length=3&background=random`;

                const description = jsonSimCard.Describe ? jsonSimCard.Describe.replace(/^\d\!|---/gm, '') : null;

                // формирование агрегации и транзакции
                if (existSimCard) {

                    if (jsonSimCard.bObjectIsIgnored) {

                        // console.log("Объект №%o, %o, %o есть в облаке, и отмечен как отключенный",
                        //     jsonSimCard.N,
                        //     jsonSimCard.CutName,
                        //     jsonSimCard.Address,
                        // );

                        transactionData.push({
                            number: jsonSimCard.N,
                            log: `${jsonSimCard.CutName}, ${jsonSimCard.Address} есть в облаке, и отмечен как отключенный`,
                            operation: FUDTransactionArchive,
                            archiveData: {
                                document: existSimCard
                            }
                        })

                    } else if (jsonSimCard.CutName == existSimCard.name
                        && jsonSimCard.Address == existSimCard.address) {

                        if (description == existSimCard.description
                            && photo == existSimCard.photo) {

                            // console.log("Объект №%o, %o, %o есть в облаке, и остается без изменений",
                            //     jsonSimCard.N,
                            //     jsonSimCard.CutName,
                            //     jsonSimCard.Address,
                            // );         

                            transactionData.push({
                                number: jsonSimCard.N,
                                log: `${jsonSimCard.CutName}, ${jsonSimCard.Address} есть в облаке, и остается без изменений`,
                                operation: FUDTransactionNoChange,
                            })

                        } else {

                            // console.log("Объект №%o, %o, %o есть в облаке, но его данные требуют изменений",
                            //     jsonSimCard.N,
                            //     jsonSimCard.CutName,
                            //     jsonSimCard.Address,
                            // );

                            bulkData.push({
                                updateOne: {
                                    filter: {
                                        number: jsonSimCard.N,
                                    },
                                    update: {
                                        description: description,
                                        photo: photo
                                    }
                                }
                            })

                            transactionData.push({
                                number: jsonSimCard.N,
                                log: `${jsonSimCard.CutName}, ${jsonSimCard.Address} есть в облаке, но его данные были обновлены`,
                                operation: FUDTransactionUpdate,
                            })
                        }

                    } else {

                        // console.log("Объект №%o, но его данные не совпадают с данными загруженного файла\r\nНаименование: %o - %o\r\nАдрес: %o - %o",
                        //     jsonSimCard.N,
                        //     jsonSimCard.CutName,
                        //     existSimCard.name,
                        //     jsonSimCard.Address,
                        //     existSimCard.address,
                        // );

                        transactionData.push({
                            number: jsonSimCard.N,
                            log: `есть в облаке, но его данные не совпадают с данными загруженного файла\r\nВ облаке: ${existSimCard.name}, ${existSimCard.address}\r\nВ файле: ${jsonSimCard.CutName}, ${jsonSimCard.Address}`,
                            operation: FUDTransactionReplacement,
                            insertData: {
                                document: {
                                    number: jsonSimCard.N,
                                    name: jsonSimCard.CutName,
                                    address: jsonSimCard.Address,
                                    description: description,
                                    photo: photo
                                }
                            },
                            archiveData: {
                                document: existSimCard
                            }
                        })

                    }

                } else if (jsonSimCard.bObjectIsIgnored) {

                    // console.log("Объект №%o, %o, %o отсутствует в облаке, и отмечен как отключенный",
                    //     jsonSimCard.N,
                    //     jsonSimCard.CutName,
                    //     jsonSimCard.Address,
                    // );      

                    transactionData.push({
                        number: jsonSimCard.N,
                        log: `${jsonSimCard.CutName}, ${jsonSimCard.Address} отсутствует в облаке, и отмечен как отключенный`,
                        operation: FUDTransactionIgnore,
                    })

                } else {

                    // console.log("Объект №%o, %o, %o отсутствует в облаке, и будет добавлен",
                    //     jsonSimCard.N,
                    //     jsonSimCard.CutName,
                    //     jsonSimCard.Address,
                    // );    

                    bulkData.push({
                        insertOne: {
                            document: {
                                number: jsonSimCard.N,
                                name: jsonSimCard.CutName,
                                address: jsonSimCard.Address,
                                description: description,
                                photo: photo
                            }
                        }
                    })

                    transactionData.push({
                        number: jsonSimCard.N,
                        log: `${jsonSimCard.CutName}, ${jsonSimCard.Address} отсутствовал в облаке, и был добавлен`,
                        operation: FUDTransactionAddition,
                    })
                }
            }

            // Внесение агрегационных данных-----------------------------------------------------------------------------
            var simCards;
            // console.log('bulkWriteData: %o', bulkWriteData);
            // если среди данных нет агрегата - добавить 
            if (bulkData.length > 0) {

                const responce = await mongoSimCardsModel.bulkWrite(bulkData);

                // console.log('bulkWrite: %o', responce);

                // Выборка данных о пультовых объектах
                simCards = await mongoSimCardsModel
                    .find({}, '-createdAt -updatedAt -description')
                    .lean();

                simCards.sort((a, b) => {
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

            return { transactionData, simCards }

        } catch (error) {

            console.log(error);

            throw error;

        }

    }

    async uploadExcellSimCards(inputData) {

        try {

            console.log('---------------uploadExcellSimCards-----------------');

            //Validate date----------------------------------------------------------------------------------------------
            var { document, columnMSISDN, columnICCID } = await validateYup(inputData, { deleteEmptyKey: false }).catch((e) => {

                throw ApiError.BadRequest(`Произошла ошибка валидации введёных данных: ${e.errors.join(", ")}`);

            });

            // console.log('document: %o', document, columnMSISDN, columnICCID);

            // Извлечение массива данных---------------------------------------------------------------------------------
            const ExcelJSWorkbook = new ExcelJS.Workbook();

            await ExcelJSWorkbook.xlsx.load( Buffer.from(document.split(',')[1], 'base64') );
            
            const worksheet = ExcelJSWorkbook.getWorksheet(1);

            const parsingData = [];

            for (let indexRow = 1; indexRow < worksheet.rowCount; indexRow++) {

                const row = worksheet.getRow(indexRow);

                var msisdn, provider, iccid;

                var ceil = row.getCell(columnMSISDN).text;

                if( isNumberMSISDN(ceil) ){

                    [ msisdn, provider ] = getFormatedTelephoneNumberAndProvider(ceil);
                    
                }

                ceil = row.getCell(columnICCID).text;

                if( isNumberICCID(ceil) ){

                    iccid = ceil;

                }
                
                if( !msisdn || !iccid ){

                    for (let indexCeil = 1; indexCeil < row.cellCount; indexCeil++) {

                        ceil = row.getCell(indexCeil).text;

                        if( !msisdn && isNumberMSISDN(ceil) ){

                            columnMSISDN = indexCeil;

                            [ msisdn, provider ] = getFormatedTelephoneNumberAndProvider(ceil);

                            if (iccid) break;

                        }else if( !iccid && isNumberICCID(ceil) ){

                            columnICCID  = indexCeil;

                            iccid = ceil;

                            if (msisdn) break;
                        }
                        
                    }

                }

                if( msisdn ){
                    parsingData.push({
                        msisdn: msisdn,
                        iccid: iccid,
                        provider: provider
                    })
                }

            }

            // console.log('parsingData: %o', parsingData);

            //Проверка соединения с Монго--------------------------------------------------------------------------------
            await mongoConnect();

            // Выборка данных о пультовых объектах-----------------------------------------------------------------------
            var currentData = await mongoSimCardsModel
                .find({}, '-createdAt -updatedAt')
                .lean();

            // console.log('currentSimCards: %o', currentData);

            // Формирование агрегационных и транзакционных данных--------------------------------------------------------
            // сюда записываются данные об агрегации
            const bulkData = [];

            // сюда записываются данные о транзакциях
            const transactionData = [];

            // Просматриваем среди данных на изменение найденные и подготовка к агрегации и транзакции
            for (const elementData of parsingData) {

                // проверка наличия в облаке данных с имеющимися номерами
                let existsData;

                if (currentData.length > 0) {

                    currentData = currentData.reduce((data, valueB) => {

                        if (valueB.msisdn == elementData.msisdn) {
                            existsData = valueB;
                        } else {
                            data.push(valueB)
                        }

                        return data;

                    }, []);

                }

                // переменные

                // формирование агрегации и транзакции
                if (existsData) {

                    // if (elementData.bObjectIsIgnored) {

                    //     // console.log("Объект №%o, %o, %o есть в облаке, и отмечен как отключенный",
                    //     //     jsonSimCard.N,
                    //     //     jsonSimCard.CutName,
                    //     //     jsonSimCard.Address,
                    //     // );

                    //     transactionData.push({
                    //         number: elementData.N,
                    //         log: `${elementData.CutName}, ${elementData.Address} есть в облаке, и отмечен как отключенный`,
                    //         operation: FUDTransactionArchive,
                    //         archiveData: {
                    //             document: existsData
                    //         }
                    //     })

                    // } else 
                    if (elementData.provider == existsData.provider
                        && elementData.iccid == existsData.iccid) {

                        // if (description == existsData.description
                        //     && photo == existsData.photo) {

                            // console.log("Объект №%o, %o, %o есть в облаке, и остается без изменений",
                            //     elementData.N,
                            //     elementData.CutName,
                            //     elementData.Address,
                            // );         

                            transactionData.push({
                                msisdn: elementData.msisdn,
                                log: `${elementData.provider}, ${elementData.iccid} есть в облаке, и остается без изменений`,
                                operation: FUDTransactionNoChange,
                            })

                        // } else {

                        //     // console.log("Объект №%o, %o, %o есть в облаке, но его данные требуют изменений",
                        //     //     jsonSimCard.N,
                        //     //     jsonSimCard.CutName,
                        //     //     jsonSimCard.Address,
                        //     // );

                        //     bulkData.push({
                        //         updateOne: {
                        //             filter: {
                        //                 number: elementData.N,
                        //             },
                        //             update: {
                        //                 description: description,
                        //                 photo: photo
                        //             }
                        //         }
                        //     })

                        //     transactionData.push({
                        //         number: elementData.N,
                        //         log: `${elementData.CutName}, ${elementData.Address} есть в облаке, но его данные были обновлены`,
                        //         operation: FUDTransactionUpdate,
                        //     })
                        // }

                    } else {

                        // console.log("Объект №%o, но его данные не совпадают с данными загруженного файла\r\nНаименование: %o - %o\r\nАдрес: %o - %o",
                        //     jsonSimCard.N,
                        //     jsonSimCard.CutName,
                        //     existSimCard.name,
                        //     jsonSimCard.Address,
                        //     existSimCard.address,
                        // );

                        transactionData.push({
                            msisdn: elementData.msisdn,
                            log: `есть в облаке, но его данные не совпадают с данными загруженного файла\r\nВ облаке: ${existsData.provider}, ${existsData.iccid}\r\nВ файле: ${elementData.provider}, ${elementData.iccid}`,
                            operation: FUDTransactionReplacement,
                            insertData: {
                                document: {
                                    msisdn: elementData.msisdn,
                                    iccid: elementData.iccid,
                                    provider: elementData.provider
                                }
                            },
                            archiveData: {
                                document: existsData
                            }
                        })

                    }

                } 
                // else if (elementData.bObjectIsIgnored) {

                //     // console.log("Объект №%o, %o, %o отсутствует в облаке, и отмечен как отключенный",
                //     //     jsonSimCard.N,
                //     //     jsonSimCard.CutName,
                //     //     jsonSimCard.Address,
                //     // );      

                //     transactionData.push({
                //         number: elementData.N,
                //         log: `${elementData.CutName}, ${elementData.Address} отсутствует в облаке, и отмечен как отключенный`,
                //         operation: FUDTransactionIgnore,
                //     })

                // } 
                else {

                    // console.log("Объект №%o, %o, %o отсутствует в облаке, и будет добавлен",
                    //     jsonSimCard.N,
                    //     jsonSimCard.CutName,
                    //     jsonSimCard.Address,
                    // );    

                    bulkData.push({
                        insertOne: {
                            document: {
                                msisdn: elementData.msisdn,
                                iccid: elementData.iccid,
                                provider: elementData.provider
                            }
                        }
                    })

                    transactionData.push({
                        msisdn: elementData.msisdn,
                        log: `${elementData.provider}, ${elementData.iccid} отсутствовал в облаке, и был добавлен`,
                        operation: FUDTransactionAddition,
                    })
                }
            }

            // Внесение агрегационных данных-----------------------------------------------------------------------------
            var simCards;
            // console.log('bulkWriteData: %o', bulkWriteData);
            // если среди данных нет агрегата - добавить 
            if (bulkData.length > 0) {

                const responce = await mongoSimCardsModel.bulkWrite(bulkData);

                // console.log('bulkWrite: %o', responce);

                // Выборка данных о пультовых объектах
                simCards = await mongoSimCardsModel
                    .find({}, '-createdAt -updatedAt', { sort: { provider: 1, msisdn: 1 } })
                    .lean();

                // simCards.sort((a, b) => {
                //         if (a.number && b.number)
                //             return (a.number - b.number);
                //         else return -1;
                //     });
            }

            transactionData.sort((a, b) => {
                if ([FUDTransactionReplacement, FUDTransactionArchive].includes(a.operation)) {
                    if (a.msisdn && b.msisdn && [FUDTransactionReplacement, FUDTransactionArchive].includes(b.operation))
                        return (a.msisdn - b.msisdn);
                    else return -1;
                } else if (a.msisdn && b.msisdn)
                    return (a.msisdn - b.msisdn);
                else return -1;
            })

            return { transactionData, simCards }

        } catch (error) {

            console.log(error);

            throw error;

        }

    }

    async uploadFinishSimCards(inputData) {

        try {
            console.log('---------------uploadFinishSimCards-----------------');
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
            for (const element of transactionData) {
                switch (element.operation) {

                    case FUDTransactionReplacement:
                        if (element.insertData?.document && element.archiveData?.document?._id) {

                            bulkWriteData.push({ insertOne: element.insertData });

                            bulkDeleteData.push(element.archiveData.document._id);

                            bulkArchiveData.push({
                                insertOne: {
                                    document: {
                                        reason: 'сим-карта архивирована в ходе синхронизации данных с файлом excel ' + currentTimeStamp,
                                        userPerfomed: userPerfomed._id,
                                        userPerfomedSheme: 'User',
                                        ...element.archiveData.document,
                                    }
                                }
                            });

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
                                        name: element.insertData.document.msisdn ? element.insertData.document.msisdn : null,
                                        address: element.insertData.document.iccid ? element.insertData.document.iccid : null,
                                        description: element.insertData.document.provider ? element.insertData.document.provider : null,
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

                        }
                        break;

                    default:
                        break;
                }
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

            var simCards;
            // console.log('bulkWriteData: %o', bulkWriteData);
            // если среди данных нет агрегата - добавить 
            if (bulkWriteData.length > 0) {

                const responce = await mongoSimCardsModel.bulkWrite(bulkWriteData);

                console.log('bulkWrite: %o', responce);

                // Выборка данных о пультовых объектах
                simCards = await mongoSimCardsModel
                    .find({}, '-createdAt -updatedAt', { sort: { provider: 1, msisdn: 1 } })
                    .lean();

                // simCards.sort((a, b) => {
                //     if (a.number && b.number)
                //         return (a.number - b.number);
                //     else return -1;
                // });
            }

            var simCardsArchive;
            // console.log('bulkArchiveData: %o', bulkArchiveData);
            // если среди данных нет агрегата - добавить 
            if (bulkArchiveData.length > 0) {

                const responce = await mongoSimCardsArchiveModel.bulkWrite(bulkArchiveData);

                // console.log('bulkArchiveData: %o', responce);

                simCardsArchive = await mongoSimCardsArchiveModel
                    .find({}, '-createdAt -updatedAt', { sort: { provider: 1, msisdn: 1 } })
                    .populate('userPerfomed', 'surname firstName')
                    .lean();

                simCardsArchive.forEach(value => {

                    // Преобразование ID в строки
                    value._id = value._id.toString();

                    if (value.userPerfomed) {
                        value.userPerfomed._id = value.userPerfomed._id.toString();
                    }

                });
            }

            return { simCards, simCardsArchive};

        } catch (error) {

            console.log(error);

            throw error;

        }

    }

}

export default new SimCardService();