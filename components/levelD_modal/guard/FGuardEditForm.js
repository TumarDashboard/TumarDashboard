import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';
import { FInputImageFile } from "../../levelE_low/FInputImageFile";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FSelect } from "../../levelE_low/FSelect";
import Image from "next/legacy/image";
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import useSWRImmutable from 'swr/immutable';
import { fetchAuthMethod } from "../../../middleware/requests";

import { equalArrays } from '../../../src/utils/arrayUtils';
import { FInputInitials, inputInitialsValidate } from '../../levelE_low/FInputInitials';
import { FInputTelephone } from '../../levelE_low/FInputTelephone';
import { FInputIIN } from '../../levelE_low/FInputIIN';

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
      setInputValidateGuardSurname(validate && (value != form.guard?.surname));
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
      setInputValidateGuardfirstName(validate && (value != form.guard?.firstName));
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
        setInputValidateGuardPatronymic(validate && (value != form.guard?.patronymic));
      else
        setInputValidateGuardPatronymic(value != form.guard?.patronymic);
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
      setInputValidateGuardTelephone(validate && (value != form.guard?.telephone));
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
      setInputValidateGuardIIN(validate && (value != form.guard?.IIN));
    }
  }

  /*--Официальное трудоустройство Формы редактирования-------------------------------------------------------*/
  const [inputGuardIsOfficial, setInputGuardIsOfficial] = useState(false);

  const [isInputValidateGuardIsOfficial, setInputValidateGuardIsOfficial] = useState(true);

  const GuardIsOfficialChange = (value) => {
    setInputGuardIsOfficial(value);
    if (operation == 'Добавить') {
      setInputValidateGuardIsOfficial(true);
    } else {
      setInputValidateGuardIsOfficial(value != form.guard?.isOfficial);
    }
  }

  /*--Запрос данных на сервере---------------------------------------------------------------------*/

  const {
    data: optionGuardPosts,
    isMutating: isMutatingFromServer,
    trigger: triggerFromServer,
  } = useSWRMutation('/method/modal/getGuardEditForm', fetchAuthMethod);

  /*--Физ.посты Формы редактирования---------------------------------------------------------------------*/
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

  /*--Чистка/Обновление инпутов--------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {
      triggerFromServer();

      setOperation(form.operation);
      GuardSurnameChange(form.guard?.surname, inputInitialsValidate(form.guard?.surname));
      setInputGuardfirstName(form.guard?.firstName);
      setInputValidateGuardfirstName(false);
      setInputGuardPatronymic(form.guard?.patronymic);
      setInputValidateGuardPatronymic(form.operation == 'Добавить');
      setInputGuardUIAvatarsSrc(null);
      setInputGuardTelephone(form.guard?.telephone);
      setInputValidateGuardTelephone(form.operation == 'Добавить');
      setInputGuardIIN(form.guard?.iin);
      setInputValidateGuardIIN(form.operation == 'Добавить');
      setInputGuardIsOfficial(form.guard?.isOfficial || false);
      setInputValidateGuardIsOfficial(form.operation == 'Добавить');
      setInputGuardGuardPosts(form.guard?.guardPosts || []);

      setError(null);
    }
  }, [form])

  /*-----------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={`${operation} данные охранника`}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col md:flex-row items-center md:items-start p-4 w-full overflow-y-auto max-h-[90vh]"
      widthForm='min-w-min'
    >

      {/* {Изображение аватара, кнопки управления} */}
      <div
        className="flex-none md:order-last md:ml-4 flex flex-col border-t-8 border-red-700 rounded-md bg-color_C"
      >

        {/* {Изображение аватара} */}
        {(inputGuardUIAvatarsSrc || form.guard?.uiAvatarsSrc) &&
          <div
            className="w-full flex items-center justify-center p-4 select-none"
          >
            <Image
              className="object-cover w-44 h-44 rounded-full"
              width={176}
              height={176}
              src={inputGuardUIAvatarsSrc ? inputGuardUIAvatarsSrc : form.guard?.uiAvatarsSrc}
              alt=""
            />
          </div>
        }

        {/* {Кнопки управления для компьютера} */}
        <div
          className="flex-1 p-4 hidden md:inline-flex items-center justify-center flex-col select-none"
        >

          <FButtonRed
            className="hidden md:inline-flex m-4"
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
                || isInputValidateGuardIsOfficial
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
              inputGuardGuardPosts,
              inputGuardIsOfficial
            ) : submitEdit(e,
              inputGuardSurname,
              inputGuardfirstName,
              inputGuardPatronymic,
              inputGuardUIAvatarsSrc,
              inputGuardTelephone,
              inputGuardIIN,
              inputGuardGuardPosts,
              inputGuardIsOfficial
            )}
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
        className="flex-initial flex flex-col space-y-4 w-full md:max-w-xl bg-white rounded-md"
      >

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

        {/* Официальное трудоустройство */}
        <div className="form-item w-full mt-4 flex items-center">
          <label className="text-lg pr-4 cursor-pointer flex items-center text-black font-bold select-none">
            <input 
              type="checkbox" 
              className="mr-2 h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
              checked={inputGuardIsOfficial} 
              onChange={(e) => GuardIsOfficialChange(e.target.checked)} 
            />
            Официальный сотрудник
          </label>
        </div>

        {/* Физ. посты */}
        {isMutatingFromServer ?
          <div className="form-item w-full mt-4 flex justify-center">
            <svg fill='none' className="w-32 h-32 animate-spin" viewBox="0 0 32 32" xmlns='http://www.w3.org/2000/svg'>
              <path clipRule='evenodd'
                d='M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z'
                fill='currentColor' fillRule='evenodd' />
            </svg>
          </div>
          :
          <div className="form-item w-full mt-4">
            <label className="text-lg pr-4">Физ. посты</label>
            <FSelect
              options={optionGuardPosts}
              onChange={guardPostChange}
              value={inputGuardGuardPosts}
              key={form.key}
              disabled={isMutatingFromServer}
              multiple
            />
          </div>
        }


        {/* Статус ошибки */}
        <div className="form-item">
          <span className="text-color_C italic break-words">
            {error}
          </span>
        </div>

        {/* Кнопки */}
        <div className="form-item md:hidden self-end flex flex-col space-y-4 select-none">

          <FButtonRed
            className=""
            disabled={!(form.isOpen && (operation == 'Добавить' ?
              (isInputValidateGuardSurname
                && isInputValidateGuardfirstName
                && isInputValidateGuardPatronymic
                && isInputValidateGuardTelephone) :
              (isInputValidateGuardSurname
                || isInputValidateGuardfirstName
                || isInputValidateGuardPatronymic
                || isInputValidateGuardTelephone
                || isInputValidateGuardIIN
                || isInputValidateGuardIsOfficial
                || (!equalArrays(inputGuardGuardPosts, form.guard?.guardPosts))
                || inputGuardUIAvatarsSrc != null
              )
            ))}
            onClick={(e) => operation == 'Добавить' ? submitAdd(e,
              inputGuardSurname,
              inputGuardfirstName,
              inputGuardPatronymic,
              inputGuardUIAvatarsSrc,
              inputGuardTelephone,
              inputGuardIIN,
              inputGuardGuardPosts,
              inputGuardIsOfficial
            ) : submitEdit(e,
              inputGuardSurname,
              inputGuardfirstName,
              inputGuardPatronymic,
              inputGuardUIAvatarsSrc,
              inputGuardTelephone,
              inputGuardIIN,
              inputGuardGuardPosts,
              inputGuardIsOfficial
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

      </div>

    </FModalForm >
  )
}