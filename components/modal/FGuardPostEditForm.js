import { FModalForm } from '../modal/FModalForm';
import { useState, useEffect } from 'react';

import { FInputNumber } from "../low/FInputNumber";
import { FTextArea } from "../low/FTextArea";
import { FInputFile } from "../low/FInputFile";
import { FButtonRed } from "../low/FButtonRed";
import { FButtonWhite } from "../low/FButtonWhite";
import { FSelect } from "../low/FSelect";
import { FSelectShifts } from "../low/FSelectShifts";

import { equalArrays } from '../../src/utils/arrayUtils';

export function FGuardPostEditForm({ form, setForm, submitAdd, submitEdit, users }) {

  /*-------------------------------------------------------------------------------------------------------
      Операция
  -------------------------------------------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Номер физ. поста Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputGuardPostNumber, setInputGuardPostNumber] = useState('');

  const [isInputValidateGuardPostNumber, setInputValidateGuardPostNumber] = useState(true);

  const GuardPostNumberChange = (value, validate) => {
    setInputGuardPostNumber(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateGuardPostNumber(validate);
      else
        setInputValidateGuardPostNumber(true);
    } else {
      setInputValidateGuardPostNumber(validate && (value != form.guardPost?.number));
    }
  }

  /*-------------------------------------------------------------------------------------------------------
      Наименование Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputGuardPostName, setInputGuardPostName] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Адрес Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputGuardPostAddress, setInputGuardPostAddress] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Описание Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputGuardPostDescription, setInputGuardPostDescription] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Фото Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputGuardPostPhoto, setInputGuardPostPhoto] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Менеджер Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const optionGuardPostManager = [{
    text: 'Отсутствует', code: 'EMPTY'
  }, ...users?.map((user) => {
    return {
      text: [user.surname, user.firstName].join(' '),
      code: user._id
    }
  })]

  const [inputGuardPostManager, setInputGuardPostManager] = useState('EMPTY');

  /*-------------------------------------------------------------------------------------------------------
      Смены Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputGuardPostShifts, setInputGuardPostShifts] = useState([]);

  /*-------------------------------------------------------------------------------------------------------
      Чистка/Обновление инпутов
  -------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if ( form.error ){
      setError(form.error);
    }else if (form.isOpen) {
      setOperation(form.operation);
      setInputGuardPostNumber(form.guardPost?.number);
      setInputValidateGuardPostNumber(form.operation == 'Добавить');
      setInputGuardPostName(form.guardPost?.name);
      setInputGuardPostAddress(form.guardPost?.address);
      setInputGuardPostDescription(form.guardPost?.description);
      setInputGuardPostPhoto(null);
      setInputGuardPostManager(form.guardPost?.manager?._id || 'EMPTY');
      setInputGuardPostShifts(form.guardPost?.shifts || []);
      setError(null);
    }
  }, [ form ])
  
  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={`${operation} физ. пост`}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
    >
      {/* Номер и менеджер */}
      <div className='flex flex-col md:flex-row w-full'>

        <div className="form-item flex items-center md:mr-4">
          <label className="text-lg pr-4">Номер</label>
          <FInputNumber
            id='guard-post-number'
            placeholder='Номер'
            value={inputGuardPostNumber ? inputGuardPostNumber : ''}
            onChange={GuardPostNumberChange}
            key={form.key}
          />
        </div>

        <div className="form-item flex items-center w-full mt-4 md:mt-0">
          <label className="text-lg pr-4">НСО</label>
          <FSelect
            options={optionGuardPostManager}
            onChange={(e) => { setInputGuardPostManager(e?.target?.value) }}
            value={inputGuardPostManager ? inputGuardPostManager : 'EMPTY'}
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
          value={inputGuardPostName ? inputGuardPostName : ''}
          onChange={setInputGuardPostName}
          key={form.key}
        />
      </div>

      {/* Адрес */}
      <div className="form-item w-full mt-4">
        <label className="text-lg">Адрес</label>
        <FTextArea
          id='address'
          placeholder='Адрес'
          value={inputGuardPostAddress ? inputGuardPostAddress : ''}
          onChange={setInputGuardPostAddress}
          key={form.key}
        />
      </div>

      {/* Фото */}
      <div className="form-item flex items-center w-full mt-4">
        <label className="text-lg pr-4">Фото</label>
        <FInputFile
          setUri={setInputGuardPostPhoto}
          key={form.key}
        />
      </div>

      {/* Описание */}
      <div className="form-item w-full mt-4">
        <label className="text-lg">Описание</label>
        <FTextArea
          id='description'
          placeholder='Описание'
          value={inputGuardPostDescription ? inputGuardPostDescription : ''}
          onChange={setInputGuardPostDescription}
          key={form.key}
        />
      </div>

      {/* Смены */}
      <div className="form-item flex items-center w-full mt-4">
        <label className="text-lg pr-4">Смены</label>
        <FSelectShifts
          onChange={setInputGuardPostShifts}
          selected={inputGuardPostShifts ? inputGuardPostShifts : []}
          key={form.key}
        />
      </div>

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
            (isInputValidateGuardPostNumber
              && inputGuardPostName
              && inputGuardPostAddress) :
            (isInputValidateGuardPostNumber
              || (inputGuardPostName != '' && inputGuardPostName != form.guardPost?.name)
              || (inputGuardPostAddress != '' && inputGuardPostAddress != form.guardPost?.address)
              || (inputGuardPostManager != form.guardPost?.manager?._id)
              || (inputGuardPostDescription != form.guardPost?.description)
              || (!equalArrays(inputGuardPostShifts, form.guardPost?.shifts))
              || inputGuardPostPhoto != null)
          ))}
          onClick={(e) => operation == 'Добавить' ? submitAdd(e,
              inputGuardPostNumber,
              inputGuardPostName,
              inputGuardPostAddress,
              inputGuardPostPhoto,
              inputGuardPostManager,
              inputGuardPostShifts,
              inputGuardPostDescription
            ) : submitEdit(e,
              inputGuardPostNumber,
              inputGuardPostName,
              inputGuardPostAddress,
              inputGuardPostPhoto,
              inputGuardPostManager,
              inputGuardPostShifts,
              inputGuardPostDescription
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