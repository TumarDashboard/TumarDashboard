import { ShareIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { FModalForm } from '../FModalForm';

import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FSelect } from "../../levelE_low/FSelect";

import { ApiError } from '../../../middleware/exceptions';
import { uploadJsonSimCards, uploadFinishSimCards, uploadExcellSimCards } from '../../../src/dtos/dtoSimCard';
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
import FProviderItemList, { FProviderEMPTY } from '../../levelZ_variable/FProviderItemList';
import { FInputText } from '../../levelE_low/FInputText';

const UDFromJsonFile = 'UDFromJsonFile';
const UDFromExcelFile = 'UDFromExcelFile';


export function FSimCardUploadForm({ accessRules, form, setForm, MOBXui, MOBXuser, errorCallback,
  setTableSimCards, setTableSimCardsArchive, setRenderTableSimCards }) {

  /*----Определение правил доступа-----------------------------------------------------------------------*/
  const ARuploadJsonSimCard = true;// accessRules.includes('getTimesheetPrintForDay');
  const ARuploadExcelSimCard = true; // accessRules.includes('getTimesheetPrintForMonthPart');

  /*--Операция-------------------------------------------------------------------------------------------*/
  const [error, setError] = useState('');

  /*--Данные по типу проводимой операции-----------------------------------------------------------------*/
  const FOperationItemList = [
    ARuploadExcelSimCard ? { label: "Excel файл", value: UDFromExcelFile } : null,
    ARuploadJsonSimCard ? { label: "JSON файл", value: UDFromJsonFile } : null,
  ].filter(Boolean);

  const [selectedOperation, setSelectedOperation] = useState();

  const selectedOperationChange = (e) => {

    setSelectedOperation(e.target.value);

    setError('');
  }

  /*--Файл Формы загрузки--------------------------------------------------------------------------------*/
  const [inputSimCardFile, setInputSimCardFile] = useState(null);

  /*--Абонентский номер------ Формы загрузки-------------------------------------------------------------*/
  const [inputSimCardColumnMSISDN, setInputSimCardColumnMSISDN] = useState();

  /*--Серийный номер Формы загрузки------------------------------------------------------------------------*/
  const [inputSimCardColumnICCID, setInputSimCardColumnICCID] = useState();

  /*--Провайдер Формы загрузки---------------------------------------------------------------------------*/
  const [inputSimCardProvider, setInputSimCardProvider] = useState();

  const selectedInputSimCardProvider = (e) => {

    setInputSimCardProvider(e.target.value);

    setError('');
  }

  /*--выбор опреации загрузки Формы загрузки---------------------------------------------------------------------------*/
  const validateOperation = () => {
    switch (selectedOperation) {
  
      case UDFromJsonFile:
        return false;
  
      case UDFromExcelFile:
        return inputSimCardFile == null || !inputSimCardColumnMSISDN || !inputSimCardColumnICCID || inputSimCardProvider;
  
      default:
        return false;
  
    }
  }

  /*--выбор опреации загрузки Формы загрузки---------------------------------------------------------------------------*/
  const uploadOperation = async (operation, data) => {
    switch (operation) {
  
      case UDFromJsonFile:
        return await uploadJsonSimCards(data);
  
      case UDFromExcelFile:
        return await uploadExcellSimCards(data, inputSimCardColumnMSISDN, inputSimCardColumnICCID, inputSimCardProvider);
  
      default:
        return null;
  
    }
  }

  /*--Данные транзакции----------------------------------------------------------------------------------*/
  const [transactionData, setTransactionData] = useState(null);

  const [selectedView, setSelectedView] = useState({});

  const [selectedTransactionResult, setSelectedTransactionResult] = useState({ count: 0 });

  /*--Функция загрузки данных----------------------------------------------------------------------------*/
  const uploadDataSimCards = async (event) => {
    setError('');

    setForm(form => {
      let formNew = { ...form };
      delete formNew.error;
      return formNew;
    });

    MOBXui.setLoading();

    try {

      // console.log(inputSimCardFile);

      const responce = await uploadOperation(selectedOperation, inputSimCardFile);

      // console.log(responce);

      if (!responce.transactionData || !Array.isArray(responce.transactionData) || responce.transactionData.length == 0)
        throw new ApiError(500, "Сервер вернул пустой ответ, сообщите администратору");

      if (responce.simCards) {
        setTableSimCards(responce.simCards);
        setRenderTableSimCards(responce.simCards);
      }

      setTransactionData(responce.transactionData);

      setInputSimCardFile(null);

      setSelectedTransactionResult({ count: 0 });

      setSelectedView({});

    } catch (error) {

      errorCallback(error, setForm);

    } finally {

      MOBXui.setLoading();

    }

  }
  /*--Функция загрузки данных----------------------------------------------------------------------------*/
  const transactionFinishSimCards = async (event) => {

    setError('');

    setForm(form => {
      let formNew = { ...form };
      delete formNew.error;
      return formNew;
    });

    MOBXui.setLoading();

    try {

      // console.log(inputSimCardFile);
      const transaction = transactionData.reduce((result, value, index) => {
        if (selectedTransactionResult[index] > 0) {
          result.push({
            ...value,
            operation: selectedTransactionResult[index]
          })
        }
        return result
      }, []);

      // console.log(transaction);

      const responce = await uploadFinishSimCards(transaction, MOBXuser?.user?.id);

      if (responce?.simCards) {
        setTableSimCards(responce.simCards);
        setRenderTableSimCards(responce.simCards);
      }

      if (responce?.simCardsArchive) {
        setTableSimCardsArchive(responce.simCardsArchive);
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
      setInputSimCardFile(null);
      if (FOperationItemList.length > 0 && !selectedOperation) {
        setSelectedOperation(FOperationItemList[0].value);
      }
    }
  }, [form])

  /*-----------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      widthForm='w-full lg:w-1/2 mx-6'
      title={`Загрузка данных сим-карт`}
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
            setUri={setInputSimCardFile}
            key={form.key}
          />
        </div>

        {selectedOperation == UDFromExcelFile &&
          <div className='flex flex-row w-full space-x-4 mt-2'>

            {/* <div className="form-item min-w-fit flex items-center">
              <label className="text-lg pr-4 select-none">Провайдер</label>
              <FSelect
                className='flex-1 pl-2 pr-8 py-0 mr-2 min-w-fit'
                options={FProviderItemList}
                onChange={selectedInputSimCardProvider}
                value={inputSimCardProvider}
                disabled={FProviderItemList.length == 1}
              />
            </div> */}

            <div className="form-item w-full flex items-center">
              <label className="text-lg pr-4 select-none">Колонки</label>
              <FInputText
                placeholder='абон. номера'
                minlength="1" 
                maxlength="1"
                value={inputSimCardColumnMSISDN ? inputSimCardColumnMSISDN : ''}
                onChange={setInputSimCardColumnMSISDN}
                className="font-bold"
              />
              <FInputText
                placeholder='серийного номера'
                minlength="1" 
                maxlength="1"
                value={inputSimCardColumnICCID ? inputSimCardColumnICCID : ''}
                onChange={setInputSimCardColumnICCID}
                className="font-bold"
              />
            </div>

          </div>}

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
            disabled={
              selectedOperation == UDFromExcelFile
              ? !(inputSimCardFile != null && inputSimCardColumnMSISDN && inputSimCardColumnICCID && inputSimCardProvider != FProviderEMPTY)
              : selectedOperation == UDFromJsonFile
              ? true
              : true
            }
            onClick={uploadDataSimCards}
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
              disabled={selectedTransactionResult.count == 0}
              onClick={transactionFinishSimCards}
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