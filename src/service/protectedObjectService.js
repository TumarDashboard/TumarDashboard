import { ApiError } from "../../middleware/exceptions";
import DTOProtectedObject, { DTOProtectedObjectArchive, validateYup } from "../dtos/dtoProtectedObject";
import googleDrive from "../google/api/googleDrive";
import mongoProtectedObjectsArchiveModel from "../mongo/models/mongoProtectedObjectsArchiveModel";
import mongoProtectedObjectsModel from "../mongo/models/mongoProtectedObjectsModel";
import mongoUserModel from "../mongo/models/mongoUserModel";
import mongoConnect from "../mongo/mongoConnect";
import { getCurrentTimeStamp } from "../utils/dateUtils";
import { reportForAllProtectedObjects } from "../utils/reportsUtils";

function managerEquals( a, b ){
    if( !a && !b ){
        return false;
    }
    if( !a || !b ){
        return true;
    }
    return Boolean(a.toString().localeCompare( b.toString() ));
}

class ProtectedObjectService {

    async createProtectedObject(inputData) {

        let deleteProtectedObject;

        try {

            //Validate date
            if (inputData.number) {
                inputData.number = parseInt(inputData.number);
            }else{
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

            //Check number condition
            await mongoConnect();

            if (protectedObjectData.number) {

                const candidate = await mongoProtectedObjectsModel.findOne({ number: protectedObjectData.number }).lean();

                if (candidate) {
                    throw ApiError.BadRequest(`Пультовой объект с номером ${protectedObjectData.number} уже существует`);
                }

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
            }else{
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

                protectedObjectData.photo = `https://ui-avatars.com/api/?name=${
                    protectedObjectData.number
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

        if(mongoProtectedObjectArchive['reason']) delete mongoProtectedObjectArchive['reason'];
        if(mongoProtectedObjectArchive['userPerfomed']) delete mongoProtectedObjectArchive['userPerfomed'];
        if(mongoProtectedObjectArchive['userPerfomedSheme']) delete mongoProtectedObjectArchive['userPerfomedSheme'];

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

        let deleteProtectedObject;

        try {
            
            console.log('---------------uploadJsonProtectedObjects-----------------');

            return {date: "validate"}
            //Validate date
            if (inputData.number) {
                inputData.number = parseInt(inputData.number);
            }else{
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

            //Check number condition
            await mongoConnect();

            if (protectedObjectData.number) {

                const candidate = await mongoProtectedObjectsModel.findOne({ number: protectedObjectData.number }).lean();

                if (candidate) {
                    throw ApiError.BadRequest(`Пультовой объект с номером ${protectedObjectData.number} уже существует`);
                }

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

}

export default new ProtectedObjectService();