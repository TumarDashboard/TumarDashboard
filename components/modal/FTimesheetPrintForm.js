import { FModalForm } from './FModalForm';
import { useState, useEffect } from 'react';
import { ShareIcon } from '@heroicons/react/solid';

import { FInputNumber } from "../low/FInputNumber";
import { FTextArea } from "../low/FTextArea";
import { FInputFile } from "../low/FInputFile";
import { FButtonRed } from "../low/FButtonRed";
import { FButtonWhite } from "../low/FButtonWhite";
import { FSelect } from "../low/FSelect";
import { FSelectShifts } from "../low/FSelectShifts";

import { equalArrays } from '../../src/utils/arrayUtils';
import { getCurrentMonth } from '../../src/utils/dateUtils';
import { FInputMonth } from '../low/FInputMonth';
import { getTimesheetPrint } from '../../src/dtos/dtoTimesheet';
import { ApiError } from '../../middleware/exceptions';

export function FTimesheetPrintForm({ form, setForm, MOBXui, errorCallback, guardPosts }) {

  /*-------------------------------------------------------------------------------------------------------
  ----Операция---------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/
  const [error, setError] = useState('');

  /*-------------------------------------------------------------------------------------------------------
  ----Выбор месяца-----------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  const [timesheetMonth, setTimesheetMonth] = useState('');
  const [file, setFile] = useState(null);

  /*-------------------------------------------------------------------------------------------------------
  ----Функция выгрузки документа---------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/
  const timesheetChangeHandle = async (event) => {  

    event.preventDefault();

    setError('');
    setFile({ url: '', name: 'Выгрузка...' });

    setForm(form => {
      let formNew = { ...form };
      delete formNew.error;
      return formNew;
    });

    MOBXui.setLoading();

    try {

      const responce = await getTimesheetPrint(guardPosts.map(value=>value._id), timesheetMonth);

      const googleDriveFileID = responce.headers.get('googleDriveFileID');

      const xlsblob = await responce.blob();
      
      const xlsName = 'Табель-' + timesheetMonth + '.xlsx';

      const url = window.URL.createObjectURL(xlsblob);

      setFile({ url: url, name: xlsName, googleDriveFileID: googleDriveFileID ? googleDriveFileID : null });

    } catch (error) {
    
      setFile({});

      errorCallback(error, setForm);

    } finally {
  
      MOBXui.setLoading();

    }

  }
  
  /*-------------------------------------------------------------------------------------------------------
  ----Функция выгрузки документа---------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/
  const timesheetShare = async (event)=>{

    event.preventDefault();   
    
    try {

      await navigator.share({
        url: file.googleDriveFileID
      })

    } catch (error) {

      // setFile({});
      console.log(error);

      errorCallback(ApiError.FileCreateError( error ), setForm);

    } 
  }

  /*-------------------------------------------------------------------------------------------------------
  ----Чистка/Обновление инпутов----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if ( form.error ){
      setError(form.error);
    }else if (form.isOpen) {
      setError(null);
      if (!timesheetMonth) {
        setTimesheetMonth(getCurrentMonth());
      }
    }
  }, [ form ])
  
  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={`Выгрузка графика рабочих часов`}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[90vh]"
    >
      {/* Месяц и Кнопка выгрузки */}
      <div className='flex flex-col md:flex-row w-full '>

        <div className="form-item flex items-center md:mr-4">
          <label className="text-lg pr-4">Месяц</label>
          <div className='flex justify-center'>
              <FInputMonth
                onChange={setTimesheetMonth}
                value={timesheetMonth}
              />
          </div>
        </div>

        <div className="form-item flex items-center justify-end md:justify-start w-full mt-4 md:mt-0">
            <FButtonRed
              disabled={!timesheetMonth}
              onClick={timesheetChangeHandle}
            >
              Выгрузить
            </FButtonRed>
        </div>

      </div>

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