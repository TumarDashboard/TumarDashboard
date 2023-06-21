import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';

import { FInputProtectedObjectNumber } from "../../levelE_low/FInputProtectedObjectNumber";
import { FTextArea } from "../../levelE_low/FTextArea";
import { FInputImageFile } from "../../levelE_low/FInputImageFile";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FSelect } from "../../levelE_low/FSelect";
import { FSelectShifts } from "../../levelE_low/FSelectShifts";

import { equalArrays } from '../../../src/utils/arrayUtils';
import { FInputText } from '../../levelE_low/FInputText';

export function FProtectedObjectEditForm({ accessRules, form, setForm, submitAdd, submitEdit, users }) {

  /*-------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  -------------------------------------------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Определение правил доступа
  -------------------------------------------------------------------------------------------------------*/
  // const AReditProtectedObjectManager = !accessRules.includes('editProtectedObject/editBlock/manager');
  // const AReditProtectedObjectRate = !accessRules.includes('editProtectedObject/editBlock/rate');

  /*-------------------------------------------------------------------------------------------------------
      Номер пультовой объекта Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
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

  /*-------------------------------------------------------------------------------------------------------
      Краткое Наименование Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  // const [inputProtectedObjectCallsign, setInputProtectedObjectCallsign] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Наименование Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputProtectedObjectName, setInputProtectedObjectName] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Адрес Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputProtectedObjectAddress, setInputProtectedObjectAddress] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Описание Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputProtectedObjectDescription, setInputProtectedObjectDescription] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Фото Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputProtectedObjectPhoto, setInputProtectedObjectPhoto] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Менеджер Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  // const optionProtectedObjectManager = [{
  //   label: 'Отсутствует', value: 'EMPTY'
  // }, ...users?.map((user) => {
  //   return {
  //     label: [user.surname, user.firstName].join(' '),
  //     value: user._id
  //   }
  // })]

  // const [inputProtectedObjectManager, setInputProtectedObjectManager] = useState('EMPTY');

  /*-------------------------------------------------------------------------------------------------------
      Смены Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  // const [inputProtectedObjectShifts, setInputProtectedObjectShifts] = useState([]);

  /*-------------------------------------------------------------------------------------------------------
      Тариф Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  // const [inputProtectedObjectRate, setInputProtectedObjectRate] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Чистка/Обновление инпутов
  -------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {
      setOperation(form.operation);
      setInputProtectedObjectNumber(form.protectedObject?.number);
      // setInputProtectedObjectCallsign(form.protectedObject?.callsign);
      setInputValidateProtectedObjectNumber(form.operation == 'Добавить');
      setInputProtectedObjectName(form.protectedObject?.name);
      setInputProtectedObjectAddress(form.protectedObject?.address);
      setInputProtectedObjectDescription(form.protectedObject?.description);
      setInputProtectedObjectPhoto(null);
      // setInputProtectedObjectManager(form.protectedObject?.manager?._id || 'EMPTY');
      // setInputProtectedObjectShifts(form.protectedObject?.shifts || []);
      // setInputProtectedObjectRate(form.protectedObject?.rate);
      setError(null);
    }
  }, [form])

  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={`${operation} пультовой объект`}
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

        {/* Кратко */}
        {/* <div className="form-item flex w-full items-center mt-4 xl:mt-0 xl:mr-4">
          <FInputText
            id='guard-post-callsign'
            placeholder='Кратко'
            value={inputProtectedObjectCallsign ? inputProtectedObjectCallsign : ''}
            onChange={setInputProtectedObjectCallsign}
            className="font-bold"
            key={form.key}
          />
        </div> */}

        {/* менеджер */}
        {/* {AReditProtectedObjectManager &&
          <div className="form-item flex min-w-fit items-center mt-4 xl:mt-0">
            <label className="text-lg pr-4">НСО</label>
            <FSelect
              options={optionProtectedObjectManager}
              onChange={(e) => { setInputProtectedObjectManager(e?.target?.value) }}
              value={inputProtectedObjectManager ? inputProtectedObjectManager : 'EMPTY'}
              key={form.key}
            />
            {!AReditProtectedObjectManager && form.protectedObject?.manager &&
              <label className="text-lg pr-4">{[form.protectedObject?.manager?.surname, form.protectedObject?.manager?.firstName].join(' ')}</label>}
          </div>} */}

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
      <div className="form-item w-full mt-4">
        <label className="text-lg">Описание</label>
        <FTextArea
          id='description'
          placeholder='Описание'
          value={inputProtectedObjectDescription ? inputProtectedObjectDescription : ''}
          onChange={setInputProtectedObjectDescription}
          key={form.key}
        />
      </div>

      {/* Смены */}
      {/* <div className="form-item flex items-center w-full mt-4">
        <label className="text-lg pr-4">Смены</label>
        <FSelectShifts
          onChange={setInputProtectedObjectShifts}
          selected={inputProtectedObjectShifts ? inputProtectedObjectShifts : []}
          key={form.key}
        />
      </div> */}

      {/* Тариф */}
      {/* {AReditProtectedObjectRate &&
        <div className="form-item flex items-center mt-4 ">
          <label className="text-lg pr-4">Тариф</label>
          <input
            id='guard-post-rate'
            type="number"
            name='guard-post-rate'
            placeholder='###'
            value={inputProtectedObjectRate ? inputProtectedObjectRate : ''}
            onChange={(e) => { setInputProtectedObjectRate(e.target.value) }}
            className="border border-gray-300 block w-full
            focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
            rounded-md shadow-sm disabled:bg-gray-100 "
          />
        </div>} */}

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
            (isInputValidateProtectedObjectNumber
              // || (inputProtectedObjectCallsign != '' && inputProtectedObjectCallsign != form.protectedObject?.callsign)
              || (inputProtectedObjectName != form.protectedObject?.name)
              || (inputProtectedObjectAddress != form.protectedObject?.address)
              // || (inputProtectedObjectManager != form.protectedObject?.manager?._id)
              || (inputProtectedObjectDescription != form.protectedObject?.description)
              // || (!equalArrays(inputProtectedObjectShifts, form.protectedObject?.shifts))
              // || (inputProtectedObjectRate != form.protectedObject?.rate)
              || inputProtectedObjectPhoto != null)
          ))}
          onClick={(e) => operation == 'Добавить' ? submitAdd(e,
            inputProtectedObjectNumber,
            // inputProtectedObjectCallsign,
            inputProtectedObjectName,
            inputProtectedObjectAddress,
            inputProtectedObjectPhoto,
            // inputProtectedObjectManager,
            // inputProtectedObjectShifts,
            inputProtectedObjectDescription,
            // inputProtectedObjectRate
          ) : submitEdit(e,
            inputProtectedObjectNumber,
            // inputProtectedObjectCallsign,
            inputProtectedObjectName,
            inputProtectedObjectAddress,
            inputProtectedObjectPhoto,
            // inputProtectedObjectManager,
            // inputProtectedObjectShifts,
            inputProtectedObjectDescription,
            // inputProtectedObjectRate
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