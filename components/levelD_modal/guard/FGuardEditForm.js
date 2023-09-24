import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';
import useSWRMutation from 'swr/mutation';

import { FInputImageFile } from "../../levelE_low/FInputImageFile";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FSelect } from "../../levelE_low/FSelect";
import { FInputInitials, inputInitialsValidate } from '../../levelE_low/FInputInitials';
import { FInputTelephone } from '../../levelE_low/FInputTelephone';
import { FInputIIN } from '../../levelE_low/FInputIIN';
import Image from "next/legacy/image";

import { fetchAuthMethod } from "../../../middleware/requests";
import { equalArrays } from '../../../src/utils/arrayUtils';

export function FGuardEditForm({ form, setForm, submitAdd, submitEdit }) {

  /*--Операция-------------------------------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');

  /*--Фамилия охранника Формы редактирования-------------------------------------------------------------*/
  const [inputGuardSurname, setInputGuardSurname] = useState('');

  const [isInputValidateGuardSurname, setInputValidateGuardSurname] = useState(false);

  const GuardSurnameChange = (value, validate) => {
    setInputGuardSurname(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateGuardSurname(validate);
      else
        setInputValidateGuardSurname(false);
    } else {
      setInputValidateGuardSurname(validate && (value != serverData?.guard?.surname));
    }
  }

  /*--Имя охранника Формы редактирования-----------------------------------------------------------------*/
  const [inputGuardfirstName, setInputGuardfirstName] = useState('');

  const [isInputValidateGuardfirstName, setInputValidateGuardfirstName] = useState(false);

  const GuardfirstNameChange = (value, validate) => {
    setInputGuardfirstName(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateGuardfirstName(validate);
      else
        setInputValidateGuardfirstName(false);
    } else {
      setInputValidateGuardfirstName(validate && (value != serverData?.guard?.firstName));
    }
  }

  /*--Отчество охранника Формы редактирования------------------------------------------------------------*/
  const [inputGuardPatronymic, setInputGuardPatronymic] = useState('');

  const [isInputValidateGuardPatronymic, setInputValidateGuardPatronymic] = useState(true);

  const GuardPatronymicChange = (value, validate) => {
    setInputGuardPatronymic(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateGuardPatronymic(validate);
      else
        setInputValidateGuardPatronymic(true);
    } else {
      if (value)
        setInputValidateGuardPatronymic(validate && (value != serverData?.guard?.patronymic));
      else
        setInputValidateGuardPatronymic(value != serverData?.guard?.patronymic);
    }
  }

  /*--Фото Формы редактирования--------------------------------------------------------------------------*/
  const [inputGuardUIAvatarsSrc, setInputGuardUIAvatarsSrc] = useState('');

  /*--Телефон Формы редактирования-----------------------------------------------------------------------*/
  const [inputGuardTelephone, setInputGuardTelephone] = useState('');

  const [isInputValidateGuardTelephone, setInputValidateGuardTelephone] = useState(true);

  const GuardTelephoneChange = (value, validate) => {
    setInputGuardTelephone(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateGuardTelephone(validate);
      else
        setInputValidateGuardTelephone(true);
    } else {
      setInputValidateGuardTelephone(validate && (value != serverData?.guard?.telephone));
    }
  }

  /*--ИИН Формы редактирования-----------------------------------------------------------------------*/
  const [inputGuardIIN, setInputGuardIIN] = useState('');

  const [isInputValidateGuardIIN, setInputValidateGuardIIN] = useState(true);

  const GuardIINChange = (value, validate) => {
    setInputGuardIIN(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateGuardIIN(validate);
      else
        setInputValidateGuardIIN(true);
    } else {
      setInputValidateGuardIIN(validate && (value != serverData?.guard?.IIN));
    }
  }

  /*--Физ.посты Формы редактирования---------------------------------------------------------------------*/

  const [optionsGuardPosts, setOptionsGuardPosts] = useState([{ value: 'EMPTY', label: 'Отсутствует' }]);

  const [inputGuardGuardPosts, setInputGuardGuardPosts] = useState([]);

  const guardPostChange = (e) => {

    var options = e.target.options;
    var positions = [];

    for (var i = 1, l = options.length; i < l; i++) {
      if (options[i].selected) {
        positions.push(options[i].value);
      }
    }

    setInputGuardGuardPosts(positions);
  }

  /*--Запрос данных на сервере---------------------------------------------------------------------*/

  const {
    data: serverData,
    isMutating: isMutatingFromServer,
    trigger: triggerFromServer,
    reset: resetServerData
  } = useSWRMutation('/method/modal/getGuardEditForm', fetchAuthMethod, {
    onError: (e) => setError(e)
  });

  useEffect(() => {
    if (serverData?.guard) {
      setInputGuardSurname(serverData.guard.surname);
      setInputGuardfirstName(serverData.guard.firstName);
      setInputGuardPatronymic(serverData.guard.patronymic);
      setInputGuardUIAvatarsSrc(null);
      setInputGuardTelephone(serverData.guard.telephone);
      setInputGuardIIN(serverData.guard.iin);
      setInputGuardGuardPosts(serverData.guard.guardPosts || []);
    }else{
      setInputValidateGuardPatronymic(operation == 'Добавить');
      setInputValidateGuardTelephone(operation == 'Добавить');
      setInputValidateGuardIIN(operation == 'Добавить');
      GuardSurnameChange(form?.guard?.surname, inputInitialsValidate(form?.guard?.surname));
    }
    if (serverData?.optionsGuardPosts) {
      setOptionsGuardPosts(serverData.optionsGuardPosts);
    }
    return () => {
      setInputGuardSurname(null);
      setInputValidateGuardSurname(false)
      setInputGuardfirstName(null);
      setInputValidateGuardfirstName(false);
      setInputGuardPatronymic(null);
      setInputValidateGuardPatronymic(false);
      setInputGuardUIAvatarsSrc(null);
      setInputGuardTelephone(null);
      setInputValidateGuardTelephone(false);
      setInputGuardIIN(null);
      setInputValidateGuardIIN(false);
      setInputGuardGuardPosts([]);
    }
  }, [serverData]);

  /*--Чистка/Обновление инпутов--------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {

      setError(null);

      triggerFromServer({
        _id: form.guard?._id
      });

      setOperation(form.operation);
      
    }else{
      resetServerData();
    }
  }, [form])

  /*-----------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={operation == 'Добавить' ? 'Добавить данные охранника' : 'Данные охранника'}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      isModalFormLoading={!serverData || isMutatingFromServer}
      isModalFormError={error}
      className="flex flex-col items-center md:flex-row md:items-stretch p-4 w-full overflow-y-auto max-h-[90vh]"
      widthForm='min-w-min'
    >

      {/* {Панель информации} */}
      <div
        className="flex-initial flex flex-col space-y-4 w-full md:max-w-xl bg-white rounded-md"
      >
        {/* {Изображение аватара для мобильного} */}
        {(inputGuardUIAvatarsSrc || serverData?.guard?.uiAvatarsSrc) &&
          <div
            className="w-full flex md:hidden items-center justify-center mb-4 select-none"
          >
            <Image
              className="object-cover w-44 h-44 rounded-full"
              width={176}
              height={176}
              src={inputGuardUIAvatarsSrc ? inputGuardUIAvatarsSrc : serverData?.guard?.uiAvatarsSrc}
              alt=""
            />
          </div>
        }

        {/* Фамилия */}
        <div className="form-item w-full flex items-center">
          <label className="text-lg pr-4">Фамилия</label>
          <FInputInitials
            id='family-name'
            placeholder='Фамилия'
            value={inputGuardSurname ? inputGuardSurname : ''}
            onChange={GuardSurnameChange}
            key={form.key}
          />
        </div>

        {/* Имя */}
        <div className="form-item w-full mt-4 flex items-center">
          <label className="text-lg pr-4">Имя</label>
          <FInputInitials
            id='FullName'
            placeholder='Имя'
            value={inputGuardfirstName ? inputGuardfirstName : ''}
            onChange={GuardfirstNameChange}
            key={form.key}
          />
        </div>

        {/* Отчество */}
        <div className="form-item w-full mt-4 flex items-center">
          <label className="text-lg pr-4">Отчество</label>
          <FInputInitials
            id='additional-name'
            placeholder='Отчество'
            value={inputGuardPatronymic ? inputGuardPatronymic : ''}
            onChange={GuardPatronymicChange}
            key={form.key}
          />
        </div>

        {/* Фото */}
        <div className="form-item flex items-center w-full mt-4">
          <label className="text-lg pr-4">Фото</label>
          <FInputImageFile
            setUri={setInputGuardUIAvatarsSrc}
            key={form.key}
          />
        </div>

        {/* Телефон Менеджер ИИН*/}
        <div className='flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0'>

          {/* Телефон */}
          <div className="form-item w-full flex items-center">
            <label className="text-lg pr-4">Телефон</label>
            <FInputTelephone
              placeholder='Телефон'
              value={inputGuardTelephone ? inputGuardTelephone : ''}
              onChange={GuardTelephoneChange}
              key={form.key}
            />
          </div>

          {/* ИИН */}
          <div className="form-item w-full flex items-center">
            <label className="text-lg pr-4">ИИН</label>
            <FInputIIN
              placeholder='ИИН'
              value={inputGuardIIN ? inputGuardIIN : ''}
              onChange={GuardIINChange}
              key={form.key}
            />
          </div>

        </div>

        {/* Физ. посты */}
        <div className="form-item w-full mt-4">
          <label className="text-lg pr-4">Физ. посты</label>
          <FSelect
            options={optionsGuardPosts}
            onChange={guardPostChange}
            value={inputGuardGuardPosts}
            key={form.key}
            disabled={isMutatingFromServer}
            multiple
          />
        </div>

        {/* Статус ошибки */}
        <div className="form-item">
          <span className="text-color_C italic break-words">
            {error}
          </span>
        </div>

      </div>

      {/* {Изображение аватара для компьютера, кнопки управления} */}
      <div
        className="flex flex-col select-none items-end w-full justify-between md:items-center md:w-fit md:p-4 
        md:ml-4 md:border-t-8  md:border-red-700  md:rounded-md  md:bg-color_C"
      >

        {/* {Изображение аватара} */}
        <div
          className="w-full hidden md:flex items-center justify-center mb-4 select-none"
        >
          {(inputGuardUIAvatarsSrc || serverData?.guard?.uiAvatarsSrc) &&
            <Image
              className="object-cover w-44 h-44 rounded-full"
              width={176}
              height={176}
              src={inputGuardUIAvatarsSrc ? inputGuardUIAvatarsSrc : serverData?.guard?.uiAvatarsSrc}
              alt=""
            />
          }
        </div>

        {/* {Кнопки управления} */}
        <div
          className="flex flex-col"
        >

          <FButtonRed
            className="mb-4"
            disabled={!(form.isOpen && (operation == 'Добавить' ?
              (isInputValidateGuardSurname
                && isInputValidateGuardfirstName
                && isInputValidateGuardPatronymic
                && isInputValidateGuardTelephone) :
              (!isMutatingFromServer && (
                isInputValidateGuardSurname
                || isInputValidateGuardfirstName
                || isInputValidateGuardPatronymic
                || isInputValidateGuardTelephone
                || isInputValidateGuardIIN
                || (!equalArrays(inputGuardGuardPosts, form.guard?.guardPosts))
                || inputGuardUIAvatarsSrc != null
              ))
            ))}
            onClick={(e) => operation == 'Добавить' ? submitAdd(e,
              inputGuardSurname,
              inputGuardfirstName,
              inputGuardPatronymic,
              inputGuardUIAvatarsSrc,
              inputGuardTelephone,
              inputGuardIIN,
              inputGuardGuardPosts
            ) : submitEdit(e,
              inputGuardSurname,
              inputGuardfirstName,
              inputGuardPatronymic,
              inputGuardUIAvatarsSrc,
              inputGuardTelephone,
              inputGuardIIN,
              inputGuardGuardPosts
            )}
          >
            {operation}
          </FButtonRed>

          <FButtonWhite
            className=""
            onClick={() => setForm({ isOpen: false })}
          >
            Закрыть
          </FButtonWhite>

        </div>

      </div>

    </FModalForm >
  )
}