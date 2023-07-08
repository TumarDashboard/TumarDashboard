import { ShareIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { FModalForm } from '../FModalForm';

import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FSelect } from "../../levelE_low/FSelect";

import { ApiError } from '../../../middleware/exceptions';
import { reportSimCards } from '../../../src/dtos/dtoSimCard';
import {
  getTimesheetPrint,
  getTimesheetPrintForDay,
  getTimesheetPrintForMonthBuh,
  getTimesheetPrintForMonthFull,
  getTimesheetPrintForMonthPart
} from '../../../src/dtos/dtoTimesheet';
import { getCurrentDateStamp, getCurrentMonth } from '../../../src/utils/dateUtils';

const DTForDay = 'DTForDay';
const DTForMonthPart = 'DTForMonthPart';
const DTForMonthFull = 'DTForMonthFull';
const DTForMonthBuh = 'DTForMonthBuh';
const PRForAllSimCards = 'PRForAllSimCards';

const getInputDate = (operation) => {
  switch (operation) {

    // case DTForDay:
    //   return getCurrentDateStamp('-');

    // case DTForMonthPart:
    //   return getCurrentMonth();

    // case DTForMonthFull:
    //   return getCurrentMonth();

    // case DTForMonthBuh:
    //   return getCurrentMonth();

    case PRForAllSimCards:
      return getCurrentMonth();

    default:
      return getCurrentMonth();

  }
}

const getTimesheet = async (operation, simCards, date, manager) => {
  if (!date) throw ApiError.BadRequest('Отсутствуют необходимые данные: дата');
  switch (operation) {

    // case DTForDay:
    //   return {
    //     responce: await getTimesheetPrintForDay(date),
    //     documentName: 'Список охранников-' + date + '.xlsx'
    //   };

    // case DTForMonthPart:
    //   if (!manager) throw ApiError.BadRequest('Отсутствуют необходимые данные: данные о сотруднике, выполняющим операцию');

    //   const NSOinitials = manager.surname ? [
    //     manager.surname,
    //     manager.firstName?.length > 0 ? manager.firstName.charAt(0) + '.' : null,
    //     manager.patronymic?.length > 0 ? manager.patronymic.charAt(0) + '.' : null,
    //   ].filter(Boolean).join(' ') : null;

    //   return {
    //     responce: await getTimesheetPrintForMonthPart(date, manager.id),
    //     documentName: `Табель ${NSOinitials} ${date}.xlsx`
    //   };

    // case DTForMonthFull:
    //   return {
    //     responce: await getTimesheetPrintForMonthFull(date),
    //     documentName: 'Табель-' + date + '.xlsx'
    //   };

    // case DTForMonthBuh:
    //   return {
    //     responce: await getTimesheetPrintForMonthBuh(date),
    //     documentName: 'Платёжная ведомость-' + date + '.xlsx'
    //   };

    case PRForAllSimCards:
      return {
        responce: await reportSimCards(),
        documentName: 'Список сим-карт - ' + date + '.xlsx'
      };

    default:
      if (!simCards) throw ApiError.BadRequest('Отсутствуют необходимые данные: данные о пультовой объектах');
      return {
        responce: await getTimesheetPrint(simCards.map(value => value._id), date),
        documentName: 'Список-' + date + '.xlsx'
      };

  }
}

export function FSimCardPrintForm({ accessRules, form, setForm, MOBXui, MOBXuser, errorCallback, simCards }) {

  /*----Определение правил доступа-----------------------------------------------------------------------*/
  // const ARgetTimesheetPrintForDay = accessRules.includes('getTimesheetPrintForDay');
  // const ARgetTimesheetPrintForMonthPart = accessRules.includes('getTimesheetPrintForMonthPart');
  // const ARgetTimesheetPrintForMonthFull = accessRules.includes('getTimesheetPrintForMonthFull');
  // const ARgetTimesheetPrintForMonthFullBuh = accessRules.includes('getTimesheetPrintForMonthBuh');
  const ARreportSimCards = accessRules.includes('reportSimCards');

  /*--Операция-------------------------------------------------------------------------------------------*/
  const [error, setError] = useState('');

  /*--Данные по типу проводимой операции-----------------------------------------------------------------*/
  const FOperationItemList = [
    // ARgetTimesheetPrintForDay ? { label: "Отчёт за день", value: DTForDay } : null,
    // ARgetTimesheetPrintForMonthPart ? { label: "Отчёт за месяц - частичный", value: DTForMonthPart } : null,
    // ARgetTimesheetPrintForMonthFull ? { label: "Отчёт за месяц - полный", value: DTForMonthFull } : null,
    // ARgetTimesheetPrintForMonthFullBuh ? { label: "Платёжная ведомость", value: DTForMonthBuh } : null,
    ARreportSimCards ? { label: "Список сим-карт", value: PRForAllSimCards } : null,
  ].filter(Boolean);

  const [selectedOperation, setSelectedOperation] = useState();

  const selectedOperationChange = (e) => {

    setSelectedOperation(e.target.value);

    setInputTimesheetDate(getInputDate(e.target.value));

    setError('');
  }

  /*--Выбор месяца---------------------------------------------------------------------------------------*/
  const [inputTimesheetDate, setInputTimesheetDate] = useState('');

  /*--Функция выгрузки документа-------------------------------------------------------------------------*/
  const [file, setFile] = useState(null);

  const timesheetChangeHandle = async (event) => {

    setError('');
    setFile({ url: '', name: 'Выгрузка...' });

    setForm(form => {
      let formNew = { ...form };
      delete formNew.error;
      return formNew;
    });

    MOBXui.setLoading();

    try {

      const { responce, documentName } = await getTimesheet(selectedOperation, simCards, inputTimesheetDate, MOBXuser?.user);
      // console.log(responce);
      const googleDriveFileID = responce.headers.get('googleDriveFileID');

      const xlsblob = await responce.blob();

      const url = window.URL.createObjectURL(xlsblob);

      setFile({ url: url, name: documentName, googleDriveFileID: googleDriveFileID ? googleDriveFileID : null });

    } catch (error) {

      setFile(null);

      errorCallback(error, setForm);

    } finally {

      MOBXui.setLoading();

    }

  }

  /*--Функция выгрузки документа-------------------------------------------------------------------------*/
  const timesheetShare = async (event) => {

    event.preventDefault();

    try {

      await navigator.share({
        url: file.googleDriveFileID
      })

    } catch (error) {

      // setFile({});

      errorCallback(ApiError.FileCreateError(error), setForm);

    }
  }

  /*--Чистка/Обновление инпутов--------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {
      setError(null);
      if (FOperationItemList.length > 0 && !selectedOperation) {
        setSelectedOperation(FOperationItemList[0].value);
        setInputTimesheetDate(getInputDate(FOperationItemList[0].value));
      }
    }
  }, [form])

  /*-----------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={`Формирование отчётов для сим-карт`}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[90vh]"
    >
      {FOperationItemList.length > 0 ? <>

        {/* Форма проводимой операции */}
        <div className="flex flex-row items-center form-item mb-2">
          <label className="text-lg pr-4 select-none">Тип отчёта</label>
          <FSelect
            className='flex-1 pl-2 pr-8 py-0'
            options={FOperationItemList}
            onChange={selectedOperationChange}
            value={selectedOperation}
            disabled={FOperationItemList.length == 1}
          />
        </div>

        {/* Месяц и Кнопка выгрузки */}
        <div className='flex flex-col md:flex-row w-full '>

          {selectedOperation != PRForAllSimCards &&
            <div className="form-item flex items-center md:mr-4">
              <label className="text-lg pr-4 select-none">{
                selectedOperation == DTForDay ? 'Дата' :
                  selectedOperation == DTForMonthPart ? 'Месяц' :
                    selectedOperation == DTForMonthPart ? 'Месяц' : 'Месяц'
              }</label>
              <div className='flex justify-center'>
                <input
                  type={
                    selectedOperation == DTForDay ? 'date' :
                      selectedOperation == DTForMonthPart ? 'month' :
                        selectedOperation == DTForMonthPart ? 'month' : 'month'
                  }
                  id="start"
                  name="start"
                  min="2022-01"
                  max="2023-12"
                  onChange={(e) => setInputTimesheetDate(e.target.value)}
                  value={inputTimesheetDate}
                  className='border border-gray-300 p-0
                    focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
                    rounded-md shadow-sm disabled:bg-gray-100 open:bg-black
                    text-black font-bold text-center'
                />
              </div>
            </div>
          }
          
          <div className="form-item flex items-center justify-end md:justify-start w-full mt-4 md:mt-0">
            <FButtonRed
              disabled={!inputTimesheetDate}
              onClick={timesheetChangeHandle}
            >
              Выгрузить
            </FButtonRed>
          </div>

        </div>

      </> : <span className="text-color_C italic break-words">
        Отсутствуют права выгрузки. Обратитесь к администратору.
      </span>}

      {/* Кнопка скачивания */}
      {file &&
        <div className='flex flex-row w-full mt-4 items-center justify-start'>

          <div className="form-item items-center justify-center h-10 px-2 pt-2 bg-white
              font-semibold text-sky-800
              border border-transparent rounded-sm border-sky-900
              hover:bg-sky-700 hover:text-color_F active:bg-sky-700 focus:outline-none focus:border-sky-700 focus:ring focus:ring-sky-200"
          >
            <a
              href={file.url}
              download={file.name}
            >
              {file.name}
            </a>
          </div>

          {navigator?.canShare && file.googleDriveFileID &&
            <div className="form-item justify-start ml-2">
              <button
                className="items-center justify-start h-10 px-2 py-1 bg-white
              font-semibold text-sky-800
              border border-transparent rounded-sm border-sky-900
              hover:bg-sky-700 hover:text-color_F active:bg-sky-700 focus:outline-none focus:border-sky-700 focus:ring focus:ring-sky-200 group "
                onClick={timesheetShare}
              >
                <ShareIcon
                  className="h-5 w-5 fill-sky-700
              group-hover:fill-sky-200"
                />
              </button>
            </div>}


        </div>}

      {/* Статус ошибки */}
      <div className="form-item">
        <span className="text-color_C italic break-words">
          {error}
        </span>
      </div>

    </FModalForm>
  )
}