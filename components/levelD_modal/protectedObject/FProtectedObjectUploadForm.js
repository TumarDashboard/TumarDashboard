import { ShareIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { FModalForm } from '../FModalForm';

import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FSelect } from "../../levelE_low/FSelect";

import { ApiError } from '../../../middleware/exceptions';
import { uploadJsonProtectedObjects } from '../../../src/dtos/dtoProtectedObject';
import {
  getTimesheetPrint,
  getTimesheetPrintForDay,
  getTimesheetPrintForMonthBuh,
  getTimesheetPrintForMonthFull,
  getTimesheetPrintForMonthPart
} from '../../../src/dtos/dtoTimesheet';
import { getCurrentDateStamp, getCurrentMonth } from '../../../src/utils/dateUtils';
import { FInputBase64File } from '../../levelE_low/FInputBase64File';

const UDFromJsonFile = 'UDFromJsonFile';
const UDFromExcelFile = 'UDFromExcelFile';

const uploadOperation = async (operation, data) => {
  switch (operation) {

    case UDFromJsonFile:
      return {
        responce: await uploadJsonProtectedObjects(data)
      };

    case UDFromExcelFile:
      return {
        responce: await uploadJsonProtectedObjects(data)
      };

    default:
      return {
        responce: null
      };

  }
}

export function FProtectedObjectUploadForm({ accessRules, form, setForm, MOBXui, MOBXuser, errorCallback, protectedObjects }) {

  /*----Определение правил доступа-----------------------------------------------------------------------*/
  const ARuploadJsonProtectedObject = true;// accessRules.includes('getTimesheetPrintForDay');
  const ARuploadExcelProtectedObject = true; // accessRules.includes('getTimesheetPrintForMonthPart');

  /*--Операция-------------------------------------------------------------------------------------------*/
  const [error, setError] = useState('');

  /*--Данные по типу проводимой операции-----------------------------------------------------------------*/
  const FOperationItemList = [
    ARuploadJsonProtectedObject ? { label: "JSON файл", value: UDFromJsonFile } : null,
    ARuploadExcelProtectedObject ? { label: "Excel файл", value: UDFromExcelFile } : null,
  ].filter(Boolean);

  const [selectedOperation, setSelectedOperation] = useState();

  const selectedOperationChange = (e) => {

    setSelectedOperation(e.target.value);

    setError('');
  }

  /*--Файл Формы редактирования--------------------------------------------------------------------------*/
  const [inputProtectedObjectFile, setInputProtectedObjectFile] = useState(null);

  /*--Данные транзакции----------------------------------------------------------------------------------*/
  const [transactionData, setTransactionData] = useState(null);

  /*--Функция загрузки данных----------------------------------------------------------------------------*/
  const uploadDataProtectedObjects = async (event) => {

    setError('');

    setForm(form => {
      let formNew = { ...form };
      delete formNew.error;
      return formNew;
    });

    MOBXui.setLoading();

    try {

      // console.log(inputProtectedObjectFile);

      const { responce } = await uploadOperation(selectedOperation, inputProtectedObjectFile);

      console.log(responce);

      setTransactionData(responce.transactionData);

      setInputProtectedObjectFile(null);

    } catch (error) {

      errorCallback(error, setForm);

    } finally {

      MOBXui.setLoading();

    }

  }

  /*--Чистка/Обновление инпутов--------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {
      setError(null);
      setInputProtectedObjectFile(null);
      if (FOperationItemList.length > 0 && !selectedOperation) {
        setSelectedOperation(FOperationItemList[0].value);
      }
    }
  }, [form])

  /*-----------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={`Загрузка данных пультовых объектов`}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[90vh]"
    >
      {FOperationItemList.length > 0 ? <>


        {/* Поле ввода файла */}
        <div className="form-item flex items-center w-full">
          <FInputBase64File
            accept={
              selectedOperation == UDFromJsonFile ? ".obj_json" :
                selectedOperation == UDFromExcelFile ? ".xlsx" :
                  "image/*"
            }
            setUri={setInputProtectedObjectFile}
            key={form.key}
          />
        </div>

        {/* Тип проводимой операции и кнопка загрузки*/}
        <div className="flex flex-row w-full items-center form-item mt-2">
          <label className="text-lg pr-4 select-none">Тип данных</label>
          <FSelect
            className='flex-1 pl-2 pr-8 py-0 mr-2'
            options={FOperationItemList}
            onChange={selectedOperationChange}
            value={selectedOperation}
            disabled={FOperationItemList.length == 1}
          />
          <FButtonRed
            disabled={inputProtectedObjectFile == null}
            onClick={uploadDataProtectedObjects}
          >
            Загрузить
          </FButtonRed>
        </div>

        {transactionData &&
          <div className="flex w-full items-center form-item mt-2">

<           table className="min-w-full border-collapse block">

              <tbody className="block">
                {/* {transactionData.map(value=>{
                  return 
                })} */}
              </tbody>

            </table>
          </div>
        }

      </> : <span className="text-color_C italic break-words">
        Отсутствуют права загрузки данных. Обратитесь к администратору.
      </span>}

      {/* Статус ошибки */}
      <div className="form-item">
        <span className="text-color_C italic break-words">
          {error}
        </span>
      </div>

    </FModalForm>
  )
}