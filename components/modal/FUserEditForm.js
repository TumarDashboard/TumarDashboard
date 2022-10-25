import { FModalForm } from './FModalForm';
import { useState, useEffect } from 'react';

import Image from 'next/image';
import { FInputNumber } from "../low/FInputNumber";
import { FTextArea } from "../low/FTextArea";
import { FInputFile } from "../low/FInputFile";
import { FButtonRed } from "../low/FButtonRed";
import { FButtonWhite } from "../low/FButtonWhite";
import { FSelect } from "../low/FSelect";
import { FSelectShifts } from "../low/FSelectShifts";

import { equalArrays } from '../../src/utils/arrayUtils';
import { FInputText } from '../low/FInputText';
import { FInputInitials } from '../low/FInputInitials';
import FPositionItemList from '../variable/FPositionItemList';
import { FInputEmail } from '../low/FInputEmail';

export function FUserEditForm({ form, setForm, submitAdd, submitEdit }) {

  /*-------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  -------------------------------------------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');

  const [currentUser, setCurrentUser] = useState({});

  /*----------------------------------------------------------------------------------------------------------------------------
      Фото
  ----------------------------------------------------------------------------------------------------------------------------*/
  const [uriAvatar, setUriAvatar] = useState(null);

  /*-------------------------------------------------------------------------------------------------------
      Email Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputEmail, setInputEmail] = useState('');

  const [isInputValidateEmail, setInputValidateEmail] = useState(false);

  const emailChange = (value, validate) => {
    setInputEmail(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateEmail(validate);
      else
        setInputValidateEmail(false);
    } else {
      setInputValidateEmail(validate && value != currentUser?.email);
    }
    setError('');
  }

  /*-------------------------------------------------------------------------------------------------------
      Фамилия Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputSurname, setInputSurname] = useState('');

  const [isInputValidateSurname, setInputValidateSurname] = useState(false);

  const surnameChange = (surname, validate) => {
    setInputSurname(surname);
    if (operation == 'Добавить') {
      if (surname)
        setInputValidateSurname(validate);
      else
        setInputValidateSurname(false);
    } else {
      setInputValidateSurname(validate && surname != currentUser?.surname);
    }
    setError('');
  }

  /*-------------------------------------------------------------------------------------------------------
      Имя Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputFirstName, setInputFirstName] = useState('');

  const [isInputValidateFirstName, setInputValidateFirstName] = useState(false);

  const firstNameChange = (firstName, validate) => {
    setInputFirstName(firstName);
    if (operation == 'Добавить') {
      if (firstName)
        setInputValidateFirstName(validate);
      else
        setInputValidateFirstName(false);
    } else {
      setInputValidateFirstName(validate && firstName != currentUser?.firstName);
    }
    setError('');
  }

  /*-------------------------------------------------------------------------------------------------------
      Отчество Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputPatronymic, setInputPatronymic] = useState('');

  const [isInputValidatePatronymic, setInputValidatePatronymic] = useState(false);

  const patronymicChange = (patronymic, validate) => {
    setInputPatronymic(patronymic);
    if (operation == 'Добавить') {
      if (patronymic)
        setInputValidatePatronymic(validate);
      else
        setInputValidatePatronymic(true);
    } else {
      if (patronymic)
        setInputValidatePatronymic(validate && patronymic != currentUser?.patronymic);
      else
        setInputValidatePatronymic(patronymic != currentUser?.patronymic);
    }
    setError('');
  }

  /*-------------------------------------------------------------------------------------------------------
      Должность Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [inputPositions, setInputPositions] = useState([]);

  // const [isInputValidatePositions, setInputValidatePositions] = useState(false);

  const positionsChange = (e) => {

    var options = e.target.options;
    var positions = [];

    for (var i = 1, l = options.length; i < l; i++) {
      if (options[i].selected) {
        positions.push(options[i].value);
      }
    }

    setInputPositions(positions);
    setError('');
  }

  /*-------------------------------------------------------------------------------------------------------
      Чистка/Обновление инпутов
  -------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {
      setOperation(form.operation);
      setCurrentUser(form.user || {});
      setInputEmail(form.user?.email || '')
      setInputValidateEmail(false);
      setInputSurname(form.user?.surname || '')
      setInputValidateSurname(false);
      setInputFirstName(form.user?.firstName || '');
      setInputValidateFirstName(false);
      setInputPatronymic(form.user?.patronymic || '');
      setInputValidatePatronymic(form.operation == 'Добавить');
      setUriAvatar(null)
      setInputPositions(form.user?.positions || []);
      setError(null);
    }
  }, [form])

  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={`${operation} данные сотрудника`}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className=" 
      w-full flex flex-col md:flex-row
      p-4 items-center
      overflow-y-auto max-h-[90vh]"
    >
      {/* {Изображение аватара, емайл, кнопки управления} */}
      <div
        className="flex-none md:order-last md:ml-4 rounded-t-md
        flex flex-col"
      >

        {/* {Изображение аватара} */}
        {(uriAvatar || currentUser.uiAvatarsSrc) && <div
          className="w-full flex items-center justify-center p-4 select-none"
        >
          <Image
            className="object-cover w-44 h-44 rounded-full"
            width={176}
            height={176}
            src={uriAvatar ? uriAvatar : currentUser.uiAvatarsSrc}
            alt=""
          />
        </div>}

        {/* {Кнопки управления для компьютера} */}
        <div
          className="flex-1 p-4 hidden md:inline-flex flex-col select-none
          items-center justify-center"
        >

          <FButtonRed
            className="hidden md:inline-flex m-4"
            disabled={!(form.isOpen && (operation == 'Добавить' ?
              (isInputValidateEmail 
                && isInputValidateSurname
                && isInputValidateFirstName
                && isInputValidatePatronymic) :
              (isInputValidateEmail 
                || isInputValidateSurname
                || isInputValidateFirstName
                || isInputValidatePatronymic
                || (!equalArrays(inputPositions, currentUser?.positions))
                || uriAvatar != null
              )
            ))}          
            onClick={(e) => {
              if (operation == 'Добавить') {
                submitAdd(e,
                uriAvatar,
                inputEmail,
                inputSurname,
                inputFirstName,
                inputPatronymic,
                inputPositions, 
              )} else {
                if(!equalArrays(inputPositions, currentUser?.positions) 
                && !confirm('После проведения данной операции потребуется повторная авторизация пользователя'))
                  return;
                submitEdit(e,
                uriAvatar,
                inputEmail,
                inputSurname,
                inputFirstName,
                inputPatronymic,
                inputPositions,
              )}}}
          >
            {operation}
          </FButtonRed>

          <FButtonWhite
            className="hidden md:inline-flex m-4"
            onClick={() => setForm({ isOpen: false })}
          >
            Закрыть
          </FButtonWhite>

        </div>

      </div>

      {/* {Панель информации} */}
      <div
        className="flex-initial flex flex-col space-y-2 w-full rounded-md"
      >

        {/* {Ввод нового аватара} */}
        <div className="form-item">
          <label className="text-xl select-none">Фото</label>
          <FInputFile
            setUri={setUriAvatar}
          />
        </div>

        {/* {Email} */}
        <div className="form-item">
          <label className="text-xl select-none">Email</label>
          <FInputEmail
            value={inputEmail}
            onEmailChange={emailChange}
          />
        </div>

        {/* {Фамилия} */}
        <div className="form-item">
          <label className="text-xl select-none">Фамилия</label>
          <FInputInitials
            id='family-name'
            placeholder='Фамилия'
            value={inputSurname}
            onChange={surnameChange}
          />
        </div>

        {/* {Имя} */}
        <div className="form-item">
          <label className="text-xl select-noneselect-none">Имя</label>
          <FInputInitials
            id='FullName'
            placeholder='Имя'
            value={inputFirstName}
            onChange={firstNameChange}
          />
        </div>

        {/* {Отчество} */}
        <div className="form-item">
          <label className="text-xl select-noneselect-none">Отчество</label>
          <FInputInitials
            id='additional-name'
            placeholder='Отчество'
            value={inputPatronymic}
            onChange={patronymicChange}
          />
        </div>

        {/* {Должность} */}
        <div className="form-item">
          <label className="text-xl select-noneselect-none">Должность</label>
          <FSelect
            options={FPositionItemList}
            onChange={positionsChange}
            value={inputPositions}
            defaultValue={currentUser.positions}
            multiple
          />
        </div>

        {/* {Ошибки} */}
        <div className="form-item">
          <span className="text-color_C italic break-words">
            {error}
          </span>
        </div>

        {/* {Кнопки управления для телефона} */}
        <div
          className="form-item md:hidden self-end flex flex-col space-y-2 select-none"
        >

          <FButtonRed
            disabled={!(form.isOpen && (operation == 'Добавить' ?
              (isInputValidateEmail 
                && isInputValidateSurname
                && isInputValidateFirstName
                && isInputValidatePatronymic) :
              (isInputValidateEmail 
                || isInputValidateSurname
                || isInputValidateFirstName
                || isInputValidatePatronymic
                || (!equalArrays(inputPositions, currentUser?.positions))
                || uriAvatar != null
              )
            ))}         
            onClick={(e) => {
              if (operation == 'Добавить') {
                submitAdd(e,
                uriAvatar,
                inputEmail,
                inputSurname,
                inputFirstName,
                inputPatronymic,
                inputPositions, 
              )} else {
                if(!equalArrays(inputPositions, currentUser?.positions) 
                && !confirm('После проведения данной операции потребуется повторная авторизация пользователя'))
                  return;
                submitEdit(e,
                uriAvatar,
                inputEmail,
                inputSurname,
                inputFirstName,
                inputPatronymic,
                inputPositions,
              )}}}
          >
            {operation}
          </FButtonRed>

          <FButtonWhite
            onClick={() => setForm({ isOpen: false })}
          >
            Закрыть
          </FButtonWhite>

        </div>

      </div>

    </FModalForm>
  )
}