import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';
import { FInputFile } from "../../levelE_low/FInputFile";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FSelect } from "../../levelE_low/FSelect";
import Image from "next/legacy/image";

import { equalArrays } from '../../../src/utils/arrayUtils';
import { FInputInitials, inputInitialsValidate } from '../../levelE_low/FInputInitials';
import { FInputTelephone } from '../../levelE_low/FInputTelephone';
import { FInputIIN } from '../../levelE_low/FInputIIN';

export function FGuardEditForm({ form, setForm, submitAdd, submitEdit, guardPosts, users }) {

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

  /*--Физ.посты Формы редактирования---------------------------------------------------------------------*/
  const optionGuardPosts = [{
    label: 'Отсутствует', value: 'EMPTY'
  }, ...guardPosts?.map((guardPost) => {
    return {
      label: [guardPost.number, guardPost.callsign].filter(Boolean).join(', '),
      value: guardPost._id,
    }
  })]

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
      console.log(form.guard);
      console.log(form.guard?.uiAvatarsSrc);
      setOperation(form.operation);
      GuardSurnameChange(form.guard?.surname, inputInitialsValidate(form.guard?.surname));
      // setInputGuardSurname(form.guard?.surname);
      // setInputValidateGuardSurname(inputInitialsValidate());
      setInputGuardfirstName(form.guard?.firstName);
      setInputValidateGuardfirstName(false);
      setInputGuardPatronymic(form.guard?.patronymic);
      setInputValidateGuardPatronymic(form.operation == 'Добавить');
      setInputGuardUIAvatarsSrc(null);
      setInputGuardTelephone(form.guard?.telephone);
      setInputValidateGuardTelephone(form.operation == 'Добавить');
      setInputGuardIIN(form.guard?.iin);
      setInputValidateGuardIIN(form.operation == 'Добавить');
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
              (isInputValidateGuardSurname
                || isInputValidateGuardfirstName
                || isInputValidateGuardPatronymic
                || isInputValidateGuardTelephone
                || isInputValidateGuardIIN
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
          <FInputFile
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
            options={optionGuardPosts}
            onChange={guardPostChange}
            value={inputGuardGuardPosts}
            key={form.key}
            multiple
          />
        </div>

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