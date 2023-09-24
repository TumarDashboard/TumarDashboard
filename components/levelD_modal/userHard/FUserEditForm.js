import { FModalForm } from '../FModalForm';
import { useEffect, useState } from 'react';
import useSWRMutation from 'swr/mutation';

import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FInputImageFile } from "../../levelE_low/FInputImageFile";
import { FSelect } from "../../levelE_low/FSelect";
import { FInputEmail } from '../../levelE_low/FInputEmail';
import { FInputInitials } from '../../levelE_low/FInputInitials';
import Image from "next/legacy/image";

import { equalArrays } from '../../../src/utils/arrayUtils';
import { getCurrentDateStamp } from '../../../src/utils/dateUtils';
import FPositionItemList from '../../levelZ_variable/FPositionItemList';
import { fetchAuthMethod } from "../../../middleware/requests";

export function FUserEditForm({ form, setForm, submitAdd, submitEdit }) {

  /*--Использование глобальных данных--------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');

  const [currentUser, setCurrentUser] = useState({});

  /*--Фото--------------------------------------------------------------------------------------------------------------------*/
  const [uriAvatar, setUriAvatar] = useState(null);

  /*--Email Формы редактирования-------------------------------------------------------------------------*/
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
      setInputValidateEmail(validate && (value != serverData?.user?.email));
    }
    setError('');
  }

  /*--Фамилия Формы редактирования-----------------------------------------------------------------------*/
  const [inputSurname, setInputSurname] = useState('');

  const [isInputValidateSurname, setInputValidateSurname] = useState(false);

  const surnameChange = (value, validate) => {
    setInputSurname(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateSurname(validate);
      else
        setInputValidateSurname(false);
    } else {
      setInputValidateSurname(validate && (value != serverData?.user?.surname));
    }
    setError('');
  }

  /*--Имя Формы редактирования---------------------------------------------------------------------------*/
  const [inputFirstName, setInputFirstName] = useState('');

  const [isInputValidateFirstName, setInputValidateFirstName] = useState(false);

  const firstNameChange = (value, validate) => {
    setInputFirstName(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateFirstName(validate);
      else
        setInputValidateFirstName(false);
    } else {
      setInputValidateFirstName(validate && (value != serverData?.user?.firstName));
    }
    setError('');
  }

  /*--Отчество Формы редактирования----------------------------------------------------------------------*/
  const [inputPatronymic, setInputPatronymic] = useState('');

  const [isInputValidatePatronymic, setInputValidatePatronymic] = useState(false);

  const patronymicChange = (value, validate) => {
    setInputPatronymic(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidatePatronymic(validate);
      else
        setInputValidatePatronymic(true);
    } else {
      if (value)
        setInputValidatePatronymic(validate && (value != serverData?.user?.patronymic));
      else
        setInputValidatePatronymic(value != serverData?.user?.patronymic);
    }
    setError('');
  }

  /*--Должность Формы редактирования---------------------------------------------------------------------*/
  const [inputPositions, setInputPositions] = useState([]);

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

  /*--Запрос данных на сервере---------------------------------------------------------------------------*/
  const {
    data: serverData,
    isMutating: isMutatingFromServer,
    trigger: triggerFromServer,
    reset: resetServerData
  } = useSWRMutation('/method/modal/getUserHardEditForm', fetchAuthMethod, {
    onError: (e) => setError(e)
  });

  useEffect(() => {
    if (serverData?.user) {
      setInputEmail(serverData.user.email)
      setInputSurname(serverData.user.surname)
      setInputFirstName(serverData.user.firstName);
      setInputPatronymic(serverData.user.patronymic);
      setInputPositions(serverData.user.positions || []);
    }else{
      setInputValidatePatronymic(operation == 'Добавить');
    }
    return () => {
      setInputEmail(null)
      setInputValidateEmail(false);
      setInputSurname(null)
      setInputValidateSurname(false);
      setInputFirstName(null);
      setInputValidateFirstName(false);
      setInputPatronymic(null);
      setInputValidatePatronymic(false);
      setUriAvatar(null)
      setInputPositions([]);
    }
  }, [serverData]);

  /*--Чистка/Обновление инпутов--------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {

      setError(null);

      triggerFromServer({
        _id: form.user?._id
      });

      setOperation(form.operation);

    }else{
      resetServerData();
    }
  }, [form])

  /*-----------------------------------------------------------------------------------------------------*/
  return (
    <FModalForm
      title={operation == 'Добавить' ? 'Добавить данные сотрудника' : 'Данные сотрудника'}
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
        {(uriAvatar || serverData?.user?.uiAvatarsSrc) &&
          <div
            className="w-full flex md:hidden items-center justify-center mb-4 select-none"
          >
            <Image
              className="object-cover w-44 h-44 rounded-full"
              width={176}
              height={176}
              src={uriAvatar ? uriAvatar : serverData?.user?.uiAvatarsSrc}
              alt=""
            />
          </div>
        }

        {/* {Ввод нового аватара} */}
        <div className="form-item">
          <label className="text-xl select-none">Фото</label>
          <FInputImageFile
            setUri={setUriAvatar}
          />
        </div>

        {/* {Email} */}
        <div className="form-item">
          <label className="text-xl select-none">Email</label>
          <FInputEmail
            value={inputEmail ? inputEmail : ''}
            onEmailChange={emailChange}
          />
        </div>

        {/* {Фамилия} */}
        <div className="form-item">
          <label className="text-xl select-none">Фамилия</label>
          <FInputInitials
            id='family-name'
            placeholder='Фамилия'
            value={inputSurname ? inputSurname : ''}
            onChange={surnameChange}
          />
        </div>

        {/* {Имя} */}
        <div className="form-item">
          <label className="text-xl select-noneselect-none">Имя</label>
          <FInputInitials
            id='FullName'
            placeholder='Имя'
            value={inputFirstName ? inputFirstName : ''}
            onChange={firstNameChange}
          />
        </div>

        {/* {Отчество} */}
        <div className="form-item">
          <label className="text-xl select-noneselect-none">Отчество</label>
          <FInputInitials
            id='additional-name'
            placeholder='Отчество'
            value={inputPatronymic ? inputPatronymic : ''}
            onChange={patronymicChange}
          />
        </div>

        {/* {Должность} */}
        <div className="form-item">
          <label className="text-xl select-noneselect-none">Должность</label>
          <FSelect
            options={FPositionItemList}
            onChange={positionsChange}
            value={inputPositions ? inputPositions : []}
            defaultValue={serverData?.user.positions}
            multiple
          />
        </div>

        {/* {Информация о пароле} */}
        {operation == 'Добавить' && <div className="form-item">
          <span className="text-blue-700 break-words">
            Пароль нового пользователя: <b>State{getCurrentDateStamp()}</b>
          </span>
        </div>}

        {/* {Ошибки} */}
        <div className="form-item">
          <span className="text-color_C italic break-words">
            {error}
          </span>
        </div>

      </div>
      
      {/* {Изображение аватара, емайл, кнопки управления} */}
      <div
        className="flex flex-col select-none items-end w-full justify-between md:items-center md:w-fit md:p-4"
      >

        {/* {Изображение аватара} */}
        <div
          className="w-full hidden md:flex items-center justify-center mb-4 select-none"
        >
          {(uriAvatar || serverData?.user?.uiAvatarsSrc) &&
            <Image
              className="object-cover w-44 h-44 rounded-full"
              width={176}
              height={176}
              src={uriAvatar ? uriAvatar : serverData?.user?.uiAvatarsSrc}
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
              (isInputValidateEmail
                && isInputValidateSurname
                && isInputValidateFirstName
                && isInputValidatePatronymic) :
              (isInputValidateEmail
                || isInputValidateSurname
                || isInputValidateFirstName
                || isInputValidatePatronymic
                || (!equalArrays(inputPositions, serverData?.user?.positions))
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
                )
              } else {
                if (!equalArrays(inputPositions, serverData?.user?.positions)
                  && !confirm('После проведения данной операции потребуется повторная авторизация пользователя'))
                  return;
                submitEdit(e,
                  uriAvatar,
                  inputEmail,
                  inputSurname,
                  inputFirstName,
                  inputPatronymic,
                  inputPositions,
                )
              }
            }}
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

    </FModalForm>
  )
}