import { ShareIcon } from '@heroicons/react/24/solid';
import { useEffect, useMemo, useState } from 'react';
import { FModalForm } from '../FModalForm';

import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FSelect } from "../../levelE_low/FSelect";

import { ApiError } from '../../../middleware/exceptions';
import { reportGuardPosts } from '../../../src/dtos/dtoGuardPost';
import {
  getTimesheetPrint,
  getTimesheetPrintForDay,
  getTimesheetPrintForMonthBuh,
  getTimesheetPrintForMonthFull,
  getTimesheetPrintForMonthFullSplit,
  getTimesheetPrintForMonthPart,
  getTimesheetPrintForMonthHours
} from '../../../src/dtos/dtoTimesheet';
import { getCurrentDateStamp, getCurrentMonth } from '../../../src/utils/dateUtils';
import { FPositionHRM } from "../../../components/levelZ_variable/FPositionItemList";

const DTForDay = 'DTForDay';
const DTForMonthPart = 'DTForMonthPart';
const DTForMonthFull = 'DTForMonthFull';
const DTForMonthFullSplit = 'DTForMonthFullSplit';
const DTForMonthBuh = 'DTForMonthBuh';
const DTForMonthHours = 'DTForMonthHours';
const DTForMonthHoursByCallsign = 'DTForMonthHoursByCallsign';
const PRForAllGuardPosts = 'PRForAllGuardPosts';

const getInputDate = (operation) => {
  switch (operation) {

    case DTForDay:
      return getCurrentDateStamp('-');

    case DTForMonthPart:
      return getCurrentMonth();

    case DTForMonthFull:
      return getCurrentMonth();

    case DTForMonthFullSplit:
      return getCurrentMonth();

    case DTForMonthBuh:
      return getCurrentMonth();

    case DTForMonthHours:
      return getCurrentMonth();

    case DTForMonthHoursByCallsign:
      return getCurrentMonth();

    case PRForAllGuardPosts:
      return getCurrentMonth();

    default:
      return getCurrentMonth();

  }
}

const getTimesheet = async (operation, guardPosts, date, manager, customHeaders, selectedCallsignId) => {
  if (!date) throw ApiError.BadRequest('Отсутствуют необходимые данные: дата');
  switch (operation) {

    case DTForDay:
      return {
        responce: await getTimesheetPrintForDay(date, customHeaders),
        documentName: 'Список охранников-' + date + '.xlsx'
      };

    case DTForMonthPart:
      if (!manager) throw ApiError.BadRequest('Отсутствуют необходимые данные: данные о сотруднике, выполняющим операцию');

      const NSOinitials = manager.surname ? [
        manager.surname,
        manager.firstName?.length > 0 ? manager.firstName.charAt(0) + '.' : null,
        manager.patronymic?.length > 0 ? manager.patronymic.charAt(0) + '.' : null,
      ].filter(Boolean).join(' ') : null;

      return {
        responce: await getTimesheetPrintForMonthPart(date, manager.id, customHeaders),
        documentName: `Табель ${NSOinitials} ${date}.xlsx`
      };

    case DTForMonthFull:
      return {
        responce: await getTimesheetPrintForMonthFull(date, customHeaders),
        documentName: 'Табель-' + date + '.xlsx'
      };

    case DTForMonthFullSplit:
      return {
        responce: await getTimesheetPrintForMonthFullSplit(date, customHeaders),
        documentName: 'Табель-ОФ-Неоф-' + date + '.xlsx'
      };

    case DTForMonthBuh:
      return {
        responce: await getTimesheetPrintForMonthBuh(date, customHeaders),
        documentName: 'Платёжная ведомость-' + date + '.xlsx'
      };

    case DTForMonthHours:
      if (!guardPosts) throw ApiError.BadRequest('Отсутствуют необходимые данные: данные о физ. постах');
      return {
        responce: await getTimesheetPrintForMonthHours(guardPosts.map(value => value._id), date, customHeaders),
        documentName: 'Табель-часы-' + date + '.xlsx'
      };

    case DTForMonthHoursByCallsign: {
      if (!guardPosts) throw ApiError.BadRequest('Отсутствуют необходимые данные: данные о физ. постах');
      if (!selectedCallsignId) throw ApiError.BadRequest('Отсутствуют необходимые данные: не выбран позывной');

      const selectedPost = guardPosts.find(gp => gp._id === selectedCallsignId);
      const callsignLabel = selectedPost ? (selectedPost.callsign || selectedPost.name || '№' + selectedPost.number) : selectedCallsignId;

      return {
        responce: await getTimesheetPrintForMonthHours([selectedCallsignId], date, customHeaders),
        documentName: `Табель-часы-${callsignLabel}-${date}.xlsx`
      };
    }

    case PRForAllGuardPosts:
      return {
        responce: await reportGuardPosts(),
        documentName: 'Список физ. постов -' + date + '.xlsx'
      };

    default:
      if (!guardPosts) throw ApiError.BadRequest('Отсутствуют необходимые данные: данные о физ. постах');
      return {
        responce: await getTimesheetPrint(guardPosts.map(value => value._id), date, customHeaders),
        documentName: 'Табель-' + date + '.xlsx'
      };

  }
}

export function FGuardPostPrintForm({ accessRules, form, setForm, MOBXui, MOBXuser, errorCallback, guardPosts }) {

  /*----Определение правил доступа-----------------------------------------------------------------------*/
  const ARgetTimesheetPrintForDay = accessRules.includes('getTimesheetPrintForDay');
  const ARgetTimesheetPrintForMonthPart = accessRules.includes('getTimesheetPrintForMonthPart');
  const ARgetTimesheetPrintForMonthFull = accessRules.includes('getTimesheetPrintForMonthFull');
  const ARgetTimesheetPrintForMonthFullSplit = accessRules.includes('getTimesheetPrintForMonthFullSplit');
  const ARgetTimesheetPrintForMonthFullBuh = accessRules.includes('getTimesheetPrintForMonthBuh');
  const ARgetTimesheetPrintForMonthHours = accessRules.includes('getTimesheetPrintForMonthHours');
  const ARreportGuardPosts = accessRules.includes('reportGuardPosts');

  /*--Операция-------------------------------------------------------------------------------------------*/
  const [error, setError] = useState('');

  /*--Вычисление прав для выгрузки--*/
  const isHR = MOBXuser?.user?.positions?.includes(FPositionHRM);

  /*--Данные по типу проводимой операции-----------------------------------------------------------------*/
  const FOperationItemList = [
    ARgetTimesheetPrintForDay ? { label: "Отчёт за день", value: DTForDay } : null,
    ARgetTimesheetPrintForMonthPart ? { label: "Отчёт за месяц - частичный", value: DTForMonthPart } : null,
    (isHR && ARgetTimesheetPrintForMonthFull) ? { label: "Отчёт за месяц - полный", value: DTForMonthFull } : null,
    (isHR && ARgetTimesheetPrintForMonthFullSplit) ? { label: "Отчёт за месяц - ОФ/Неоф", value: DTForMonthFullSplit } : null,
    ARgetTimesheetPrintForMonthHours ? { label: "Отчёт за месяц - только часы", value: DTForMonthHours } : null,
    ARgetTimesheetPrintForMonthHours ? { label: "Отчёт за месяц - по позывному", value: DTForMonthHoursByCallsign } : null,
    (isHR && ARgetTimesheetPrintForMonthFullBuh) ? { label: "Платёжная ведомость", value: DTForMonthBuh } : null,
    ARreportGuardPosts ? { label: "Список физ. постов", value: PRForAllGuardPosts } : null,
  ].filter(Boolean);

  const [selectedOperation, setSelectedOperation] = useState();

  const selectedOperationChange = (e) => {

    setSelectedOperation(e.target.value);

    setInputTimesheetDate(getInputDate(e.target.value));

    setError('');
  }

  /*--Пользовательские данные для шапки--*/
  const [customHeaders, setCustomHeaders] = useState({
    companyName: '',
    directorName: '',
    zDirName: '',
    hrmName: '',
    buhName: ''
  });

  const handleCustomHeaderChange = (e) => {
    const { name, value } = e.target;
    setCustomHeaders(prev => ({ ...prev, [name]: value }));
  };

  /*--Выбор позывного для фильтрации--------------------------------------------------------------------*/
  const [selectedCallsignId, setSelectedCallsignId] = useState('');

  const callsignOptions = useMemo(() => {
    if (!guardPosts) return [];
    return guardPosts
      .filter(gp => gp.callsign || gp.number)
      .sort((a, b) => (a.number || 0) - (b.number || 0))
      .map(gp => ({
        label: [gp.number ? '№' + gp.number : null, gp.callsign, gp.name].filter(Boolean).join(', '),
        value: gp._id
      }));
  }, [guardPosts]);

  /*--Выбор месяц��---------------------------------------------------------------------------------------*/
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

      // Очищаем пустые значения в customHeaders перед отправкой
      const cleanCustomHeaders = Object.fromEntries(Object.entries(customHeaders).filter(([_, v]) => v.trim() !== ''));

      const { responce, documentName } = await getTimesheet(selectedOperation, guardPosts, inputTimesheetDate, MOBXuser?.user, cleanCustomHeaders, selectedCallsignId);
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

  // Устанавливаем первый позывной при смене операции на DTForMonthHoursByCallsign
  useEffect(() => {
    if (selectedOperation === DTForMonthHoursByCallsign && callsignOptions.length > 0 && !selectedCallsignId) {
      setSelectedCallsignId(callsignOptions[0].value);
    }
  }, [selectedOperation, callsignOptions])

  /*-----------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={`Формирование отчётов для физ. постов`}
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

        {/* Выбор позывного для выгрузки по позывному */}
        {selectedOperation === DTForMonthHoursByCallsign && (
          <div className="flex flex-row items-center form-item mb-2 w-full">
            <label className="text-lg pr-4 select-none">Позывной</label>
            <FSelect
              className='flex-1 pl-2 pr-8 py-0'
              options={callsignOptions}
              onChange={(e) => setSelectedCallsignId(e.target.value)}
              value={selectedCallsignId}
              disabled={callsignOptions.length <= 1}
            />
          </div>
        )}

        {/* Дополнительные поля для HR (замена шапки и подписантов) */}
        {isHR && selectedOperation !== PRForAllGuardPosts && (
          <div className="flex flex-col w-full mb-4 mt-2 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="text-md font-bold mb-2 text-gray-700">Настройки шапки и подписантов (ОК)</h3>
            <p className="text-xs text-gray-500 mb-4">Оставьте пустым для использования значений по умолчанию.</p>

            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="flex flex-col w-full md:w-1/2">
                <label className="text-sm text-gray-600 mb-1">Наименование компании</label>
                <input type="text" name="companyName" value={customHeaders.companyName} onChange={handleCustomHeaderChange} className="border border-gray-300 rounded p-1 text-sm focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200" placeholder='Тұмар Гранд Секьюрити' />
              </div>
              <div className="flex flex-col w-full md:w-1/2">
                <label className="text-sm text-gray-600 mb-1">ФИО Директора (для Утверждаю)</label>
                <input type="text" name="directorName" value={customHeaders.directorName} onChange={handleCustomHeaderChange} className="border border-gray-300 rounded p-1 text-sm focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200" placeholder='Ким А.А.' />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="flex flex-col w-full md:w-1/3">
                <label className="text-sm text-gray-600 mb-1">Зам. Директора</label>
                <input type="text" name="zDirName" value={customHeaders.zDirName} onChange={handleCustomHeaderChange} className="border border-gray-300 rounded p-1 text-sm focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200" placeholder='Автоматически' />
              </div>
              <div className="flex flex-col w-full md:w-1/3">
                <label className="text-sm text-gray-600 mb-1">Бухгалтер</label>
                <input type="text" name="buhName" value={customHeaders.buhName} onChange={handleCustomHeaderChange} className="border border-gray-300 rounded p-1 text-sm focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200" placeholder='Автоматически' />
              </div>
              <div className="flex flex-col w-full md:w-1/3">
                <label className="text-sm text-gray-600 mb-1">Инспектор ОК</label>
                <input type="text" name="hrmName" value={customHeaders.hrmName} onChange={handleCustomHeaderChange} className="border border-gray-300 rounded p-1 text-sm focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200" placeholder='Автоматически' />
              </div>
            </div>
          </div>
        )}

        {/* Месяц и Кнопка выгрузки */}
        <div className='flex flex-col md:flex-row w-full '>

          {selectedOperation != PRForAllGuardPosts &&
            <div className="form-item flex items-center md:mr-4">
              <label className="text-lg pr-4 select-none">{
                selectedOperation == DTForDay ? 'Дата' : 'Месяц'
              }</label>
              <div className='flex justify-center'>
                <input
                  type={
                    selectedOperation == DTForDay ? 'date' : 'month'
                  }
                  id="start"
                  name="start"
                  min={selectedOperation == DTForDay ? "2022-01-01" : "2022-01"}
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
              disabled={!inputTimesheetDate || (selectedOperation === DTForMonthHoursByCallsign && !selectedCallsignId)}
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