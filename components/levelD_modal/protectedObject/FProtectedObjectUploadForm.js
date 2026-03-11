import { ShareIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { FModalForm } from '../FModalForm';

import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FSelect } from "../../levelE_low/FSelect";

import { ApiError } from '../../../middleware/exceptions';
import { uploadJsonProtectedObjects, uploadFinishProtectedObjects } from '../../../src/dtos/dtoProtectedObject';
import {
  getTimesheetPrint,
  getTimesheetPrintForDay,
  getTimesheetPrintForMonthBuh,
  getTimesheetPrintForMonthFull,
  getTimesheetPrintForMonthPart
} from '../../../src/dtos/dtoTimesheet';
import { getCurrentDateStamp, getCurrentMonth } from '../../../src/utils/dateUtils';
import { FInputBase64File } from '../../levelE_low/FInputBase64File';
import {
  FUDTransactionAddition,
  FUDTransactionArchive,
  FUDTransactionIgnore,
  FUDTransactionReplacement,
  FUDTransactionUpdate,
  getBGColorWithAction
} from '../../levelZ_variable/FUploadDataTransactionList';
import { FButtonWhite } from '../../levelE_low/FButtonWhite';
import { FButtonSlateSmall } from '../../levelE_low/FButtonSlateSmall';
import { FButtonWhiteSmall } from '../../levelE_low/FButtonWhiteSmall';

const UDFromJsonFile = 'UDFromJsonFile';
const UDFromExcelFile = 'UDFromExcelFile';

const uploadOperation = async (operation, data) => {
  switch (operation) {

    case UDFromJsonFile:
      return await uploadJsonProtectedObjects(data);

    // case UDFromExcelFile:
    //   return await uploadJsonProtectedObjects(data);

    default:
      return null;

  }
}

export function FProtectedObjectUploadForm({ accessRules, form, setForm, MOBXui, MOBXuser, errorCallback,
  setTableProtectedObjects, setTableProtectedObjectsArchive, setRenderTableProtectedObjects }) {

  /*----Определение правил доступа-----------------------------------------------------------------------*/
  const ARuploadJsonProtectedObject = accessRules.includes('uploadJsonProtectedObjects');
  // const ARuploadExcelProtectedObject = accessRules.includes('getTimesheetPrintForMonthPart');

  /*--Операция-------------------------------------------------------------------------------------------*/
  const [error, setError] = useState('');

  /*--Данные по типу проводимой операции-----------------------------------------------------------------*/
  const FOperationItemList = [
    ARuploadJsonProtectedObject ? { label: "JSON файл", value: UDFromJsonFile } : null,
    // ARuploadExcelProtectedObject ? { label: "Excel файл", value: UDFromExcelFile } : null,
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

  const [selectedView, setSelectedView] = useState({});

  const [selectedTransactionResult, setSelectedTransactionResult] = useState({ count: 0 });

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

      const responce = await uploadOperation(selectedOperation, inputProtectedObjectFile);

      // console.log(responce);

      if (!responce.transactionData || !Array.isArray(responce.transactionData) || responce.transactionData.length == 0)
        throw new ApiError(500, "Сервер вернул пустой ответ, сообщите администратору");

      if( responce.protectedObjects ){
        setTableProtectedObjects(responce.protectedObjects);
        setRenderTableProtectedObjects(responce.protectedObjects);
      }

      setTransactionData(responce.transactionData);

      setInputProtectedObjectFile(null);

      setSelectedTransactionResult({ count: 0 });

      setSelectedView({});

    } catch (error) {

      errorCallback(error, setForm);

    } finally {

      MOBXui.setLoading();

    }

  }

  /*--Функция загрузки данных----------------------------------------------------------------------------*/
  const transactionFinishProtectedObjects = async (event) => {

    setError('');

    setForm(form => {
      let formNew = { ...form };
      delete formNew.error;
      return formNew;
    });

    MOBXui.setLoading();

    try {

      // console.log(inputProtectedObjectFile);
      const transaction = transactionData.reduce((result, value, index) => {
        // Если ручной выбор сделан, отправляем его
        if (selectedTransactionResult[index] > 0) {
          result.push({
            ...value,
            operation: selectedTransactionResult[index]
          })
        } 
        // Иначе, если это автоматическая операция (Addition, Update, Unaffected),
        // отправляем её как есть, так как она не требует ручного выбора
        else if (value.operation !== FUDTransactionReplacement && value.operation !== FUDTransactionArchive) {
          result.push({
             ...value
          })
        }

        return result
      }, []);

      // console.log(transaction);

      const responce = await uploadFinishProtectedObjects(transaction, MOBXuser?.user?.id);

      if( responce?.protectedObjects ){
        setTableProtectedObjects(responce.protectedObjects);
        setRenderTableProtectedObjects(responce.protectedObjects);
      }

      if( responce?.protectedObjectsArchive ){
        setTableProtectedObjectsArchive(responce.protectedObjectsArchive);
      }

      setTransactionData(result => {
        return result.map((value, index) => {
          if (selectedTransactionResult[index] > 0) {
            switch (selectedTransactionResult[index]) {

              case FUDTransactionReplacement:
                value.operation = FUDTransactionAddition;
                value.log = `${value.insertData?.document?.name}, ${value.insertData?.document?.address} отсутствовал в облаке, и был добавлен\r\n${value.archiveData?.document?.name}, ${value.archiveData?.document?.address} архивирован в облако`;
                delete value.insertData;
                delete value.archiveData;
                break;

              case FUDTransactionUpdate:
                value.operation = FUDTransactionUpdate;
                value.log = `${value.insertData?.document?.name}, ${value.insertData?.document?.address} был обновлен`;
                delete value.insertData;
                delete value.archiveData;
                break;

              case FUDTransactionArchive:
                value.operation = FUDTransactionIgnore;
                value.log = `${value.archiveData?.document?.name}, ${value.archiveData?.document?.address} архивирован в облако`;
                delete value.archiveData;
                break;

              default:
                break;
            }
          }
          return value;
        })
      });

      setSelectedTransactionResult({ count: 0 });

      setSelectedView({});

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
      widthForm='w-full lg:w-1/2 mx-6'
      title={`Загрузка данных пультовых объектов`}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[80vh]"
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

        {/* Статус ошибки */}
        <div className="form-item">
          <span className="text-color_C italic break-words">
            {error}
          </span>
        </div>

        {/* {Тело} */}
        {(transactionData && Array.isArray(transactionData) && transactionData.length > 0) &&
          <div className="flex flex-col w-full items-center form-item mt-2">

            <FButtonWhiteSmall
              className={'w-full mb-1'}
              disabled={
                // Отключаем, если нет действий для отправки (count == 0 && нет автоматических операций)
                selectedTransactionResult.count === 0 &&
                !transactionData.some(t => t.operation !== FUDTransactionReplacement && t.operation !== FUDTransactionArchive)
              }
              onClick={transactionFinishProtectedObjects}
            >
              Завершить транзакцию
            </FButtonWhiteSmall>

            <table className="min-w-full border-collapse block">
              <tbody className="block">
                {transactionData.map((value, index) => {
                  return (
                    <tr
                      className={`rounded-md flex flex-col border mb-1 ${selectedTransactionResult[index] == FUDTransactionReplacement
                          ? 'bg-orange-100'
                          : selectedTransactionResult[index] == FUDTransactionUpdate
                            ? 'bg-green-100'
                            : selectedTransactionResult[index] == FUDTransactionArchive
                              ? 'bg-red-100'
                              : getBGColorWithAction(value.operation)
                        }`}
                      key={index}
                    >

                      {/* { Номер и лог} */}
                      <td className="flex">
                        <p className="text-left px-2 text-sm font-bold text-black">{value.number}</p>
                        {value.log && <span
                          className="text-left px-1 text-sm text-black whitespace-pre-line"
                        >{value.log}</span>}
                      </td>

                      {(value.operation == FUDTransactionReplacement || value.operation == FUDTransactionArchive) &&
                        <td className="flex p-2 w-full">

                          {value.archiveData?.document?.description &&
                            <FButtonSlateSmall
                              className={'mr-2'}
                              disabled={selectedView[index] == 1}
                              onClick={(e) => {
                                setSelectedView({
                                  ...selectedView,
                                  [index]: selectedView[index] == 1 ? 0 : 1
                                })
                              }}
                            >
                              Облако
                            </FButtonSlateSmall>}

                          {value.insertData?.document?.description &&
                            <FButtonSlateSmall
                              className={'mr-2'}
                              disabled={selectedView[index] == 2}
                              onClick={(e) => {
                                setSelectedView({
                                  ...selectedView,
                                  [index]: selectedView[index] == 2 ? 0 : 2
                                })
                              }}
                            >
                              Файл
                            </FButtonSlateSmall>}

                          {selectedView[index] > 0 &&
                            <FButtonSlateSmall
                              className={'mr-2'}
                              onClick={(e) => {
                                setSelectedView({
                                  ...selectedView,
                                  [index]: 0
                                })
                              }}
                            >
                              X
                            </FButtonSlateSmall>}

                          {value.operation == FUDTransactionReplacement &&
                            <FButtonSlateSmall
                              className={'ml-auto mr-2'}
                              disabled={selectedTransactionResult[index] == FUDTransactionReplacement}
                              onClick={(e) => {
                                setSelectedTransactionResult({
                                  ...selectedTransactionResult,
                                  count: selectedTransactionResult.count + 1,
                                  [index]: FUDTransactionReplacement
                                })
                              }}
                            >
                              Новый объект
                            </FButtonSlateSmall>}

                          {value.operation == FUDTransactionReplacement &&
                            <FButtonSlateSmall
                              className={'mr-2'}
                              disabled={selectedTransactionResult[index] == FUDTransactionUpdate}
                              onClick={(e) => {
                                setSelectedTransactionResult({
                                  ...selectedTransactionResult,
                                  [index]: FUDTransactionUpdate,
                                  count: selectedTransactionResult.count + 1
                                })
                              }}
                            >
                              Тот же объект
                            </FButtonSlateSmall>}

                          {value.operation == FUDTransactionArchive &&
                            <FButtonSlateSmall
                              className={'ml-auto mr-2'}
                              disabled={selectedTransactionResult[index] == FUDTransactionArchive}
                              onClick={(e) => {
                                setSelectedTransactionResult({
                                  ...selectedTransactionResult,
                                  [index]: FUDTransactionArchive,
                                  count: selectedTransactionResult.count + 1
                                })
                              }}
                            >
                              Архивировать
                            </FButtonSlateSmall>}

                          {selectedTransactionResult[index] > 0 &&
                            <FButtonSlateSmall
                              onClick={(e) => {
                                setSelectedTransactionResult({
                                  ...selectedTransactionResult,
                                  [index]: 0,
                                  count: selectedTransactionResult.count - 1
                                })
                              }}
                            >
                              Отмена
                            </FButtonSlateSmall>}

                        </td>}

                      {selectedView[index] > 0 &&
                        <td
                          className='fles mx-2 mb-2 p-2 bg-color_G rounded-md border-[1px] border-slate-300'>
                          <p className="whitespace-pre-line text-xs">{selectedView[index] == 1 ? value.archiveData?.document?.description : value.insertData?.document?.description}</p>
                        </td>}

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        }

      </> : <span className="text-color_C italic break-words">
        Отсутствуют права загрузки данных. Обратитесь к администратору.
      </span>}

    </FModalForm>
  )
}