import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';

import { FInputProtectedObjectNumber } from "../../levelE_low/FInputProtectedObjectNumber";
import { FTextArea } from "../../levelE_low/FTextArea";
import { FInputImageFile } from "../../levelE_low/FInputImageFile";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FSelect } from "../../levelE_low/FSelect";
import { FSelectShifts } from "../../levelE_low/FSelectShifts";
import useSWRMutation from 'swr/mutation';
import { fetchAuthMethod } from "../../../middleware/requests";

import { equalArrays } from '../../../src/utils/arrayUtils';
import { FInputText } from '../../levelE_low/FInputText';

export function FProtectedObjectEditForm({ accessRules, form, setForm, submitAdd, submitEdit, users }) {

  /*--Использование глобальных данных--------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');

  /*--Определение правил доступа-------------------------------------------------------------------------*/
  // const AReditProtectedObjectManager = !accessRules.includes('editProtectedObject/editBlock/manager');
  // const AReditProtectedObjectRate = !accessRules.includes('editProtectedObject/editBlock/rate');

  /*--Номер пультовой объекта Формы редактирования-------------------------------------------------------*/
  const [inputProtectedObjectNumber, setInputProtectedObjectNumber] = useState('');

  const [isInputValidateProtectedObjectNumber, setInputValidateProtectedObjectNumber] = useState(true);

  const ProtectedObjectNumberChange = (value, validate) => {
    setInputProtectedObjectNumber(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateProtectedObjectNumber(validate);
      else
        setInputValidateProtectedObjectNumber(true);
    } else {
      setInputValidateProtectedObjectNumber(validate && (value != form.protectedObject?.number));
    }
  }

  /*--Краткое Наименование Формы редактирования----------------------------------------------------------*/
  // const [inputProtectedObjectCallsign, setInputProtectedObjectCallsign] = useState('');

  /*--Наименование Формы редактирования------------------------------------------------------------------*/
  const [inputProtectedObjectName, setInputProtectedObjectName] = useState('');

  /*--Адрес Формы редактирования-------------------------------------------------------------------------*/
  const [inputProtectedObjectAddress, setInputProtectedObjectAddress] = useState('');

  /*--Описание Формы редактирования----------------------------------------------------------------------*/
  const [inputProtectedObjectDescription, setInputProtectedObjectDescription] = useState('');

  /*--Фото Формы редактирования--------------------------------------------------------------------------*/
  const [inputProtectedObjectPhoto, setInputProtectedObjectPhoto] = useState('');

  /*--Запрос данных на сервере---------------------------------------------------------------------*/
  const {
    data: serverData,
    isMutating: isMutatingFromServer,
    trigger: triggerFromServer,
    reset: resetServerData
  } = useSWRMutation('/method/modal/getProtectedObjectEditForm', fetchAuthMethod);

  /*-------------------------------------------------------------------------------------------------------
      Чистка/Обновление инпутов
  -------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {

      if (form.operation != 'Добавить')
        triggerFromServer(form.protectedObject?._id);

      setOperation(form.operation);
      setInputProtectedObjectNumber(form.protectedObject?.number);
      setInputValidateProtectedObjectNumber(form.operation == 'Добавить');
      setInputProtectedObjectName(form.protectedObject?.name);
      setInputProtectedObjectAddress(form.protectedObject?.address);
      setInputProtectedObjectDescription(form.protectedObject?.description);
      setInputProtectedObjectPhoto(null);
      setError(null);
    } else {
      resetServerData();
    }
  }, [form])

  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={`${operation} пультовой объект`}
      widthForm='w-full lg:w-1/2 mx-6'
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[90vh]"
    >
      {/* Номер и менеджер */}
      <div className='flex flex-col xl:flex-row w-full'>

        {/* Номер */}
        <div className="form-item flex items-center xl:mr-4 min-w-[150px]">
          <label className="text-lg pr-4">Номер</label>
          <FInputProtectedObjectNumber
            id='guard-post-number'
            placeholder='###'
            value={inputProtectedObjectNumber ? inputProtectedObjectNumber : ''}
            onChange={ProtectedObjectNumberChange}
            key={form.key}
          />
        </div>

      </div>

      {/* Наименование */}
      <div className="form-item w-full mt-4">
        <label className="text-lg">Наименование</label>
        <FTextArea
          id='name'
          placeholder='Наименование'
          value={inputProtectedObjectName ? inputProtectedObjectName : ''}
          onChange={setInputProtectedObjectName}
          key={form.key}
        />
      </div>

      {/* Адрес */}
      <div className="form-item w-full mt-4">
        <label className="text-lg">Адрес</label>
        <FTextArea
          id='address'
          placeholder='Адрес'
          value={inputProtectedObjectAddress ? inputProtectedObjectAddress : ''}
          onChange={setInputProtectedObjectAddress}
          key={form.key}
        />
      </div>

      {/* Фото */}
      <div className="form-item flex items-center w-full mt-4">
        <label className="text-lg pr-4">Фото</label>
        <FInputImageFile
          setUri={setInputProtectedObjectPhoto}
          key={form.key}
        />
      </div>

      {/* Описание */}
      {form.operation == 'Добавить' || (serverData && !isMutatingFromServer) ?
        <div className="form-item w-full mt-4">
          <label className="text-lg">Описание</label>
          <FTextArea
            id='description'
            placeholder='Описание'
            value={inputProtectedObjectDescription ? inputProtectedObjectDescription : serverData ? serverData.description : ''}
            onChange={setInputProtectedObjectDescription}
            key={form.key}
          />
        </div>
        :
        <div className="form-item w-full mt-4 flex justify-center">
          <svg fill='none' className="w-24 h-24 animate-spin" viewBox="0 0 32 32" xmlns='http://www.w3.org/2000/svg'>
            <path clipRule='evenodd'
              d='M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z'
              fill='currentColor' fillRule='evenodd' />
          </svg>
        </div>
      }

      {/* Статус ошибки */}
      <div className="form-item">
        <span className="text-color_C italic break-words">
          {error}
        </span>
      </div>

      {/* Кнопки */}
      <div className="ml-auto mt-4">

        <FButtonRed
          className=""
          disabled={!(form.isOpen && (operation == 'Добавить' ?
            (isInputValidateProtectedObjectNumber
              && inputProtectedObjectName) :
            (!isMutatingFromServer && (
              isInputValidateProtectedObjectNumber
              || (inputProtectedObjectName != form.protectedObject?.name)
              || (inputProtectedObjectAddress != form.protectedObject?.address)
              || (inputProtectedObjectDescription != form.protectedObject?.description)
              || inputProtectedObjectPhoto != null
            ))
          ))}
          onClick={(e) => operation == 'Добавить' ? submitAdd(e,
            inputProtectedObjectNumber,
            inputProtectedObjectName,
            inputProtectedObjectAddress,
            inputProtectedObjectPhoto,
            inputProtectedObjectDescription,
          ) : submitEdit(e,
            inputProtectedObjectNumber,
            inputProtectedObjectName,
            inputProtectedObjectAddress,
            inputProtectedObjectPhoto,
            inputProtectedObjectDescription,
          )}
        >
          {operation}
        </FButtonRed>

        <FButtonWhite
          className="ml-4"
          onClick={() => setForm({ isOpen: false })}
        >
          Закрыть
        </FButtonWhite>

      </div>
    </FModalForm>
  )
}