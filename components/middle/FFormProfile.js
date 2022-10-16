import { motion } from "framer-motion";
import { useState } from 'react';
import { useRouter } from "next/router";
import { observer } from 'mobx-react-lite'
import Image from 'next/image';
import { useStore } from "../hight/StoreProvider";
import { changeUser, deleteUser } from "../../src/dtos/dtoUser";
import { ApiError } from "../../middleware/exceptions";
import { FUserDeleteForm } from "../modal/FUserDeleteForm";
import { FInputInitials } from "../low/FInputInitials";
import { FInputFile } from "../low/FInputFile";
import { FButtonRed } from "../low/FButtonRed";
import { FSelect } from "../low/FSelect";
import FPositionItemList from "../variable/FPositionItemList";

const inputs = {
  initial: {
    y: -20,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

const FFormProfile = observer(function FFormProfile() {
  /*----------------------------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  ----------------------------------------------------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();

  /*----------------------------------------------------------------------------------------------------------------------------
      Данные инпутов
  ----------------------------------------------------------------------------------------------------------------------------*/

  const [onError, setOnError] = useState('');

  const [uriAvatar, setUriAvatar] = useState(null);

  // Фамилия
  const [inputSurname, setInputSurname] = useState('');

  const [isInputValidateSurname, setInputValidateSurname] = useState(false);

  const surnameChange = (surname, validate) => {
    setInputSurname(surname);
    setInputValidateSurname(validate && surname != MOBXuser?.user?.surname);
    setOnError('');
  }

  // Имя
  const [inputFirstName, setInputFirstName] = useState('');

  const [isInputValidateFirstName, setInputValidateFirstName] = useState(false);

  const firstNameChange = (firstName, validate) => {
    setInputFirstName(firstName);
    setInputValidateFirstName(validate && firstName != MOBXuser?.user?.firstName);
    setOnError('');
  }

  // Отчество
  const [inputPatronymic, setInputPatronymic] = useState('');

  const [isInputValidatePatronymic, setInputValidatePatronymic] = useState(false);

  const patronymicChange = (patronymic, validate) => {
    setInputPatronymic(patronymic);
    setInputValidatePatronymic(validate && patronymic != MOBXuser?.user?.patronymic);
    setOnError('');
  }

  //Должность
  const [inputPositions, setInputPositions] = useState(MOBXuser?.user?.positions || []);

  const [isInputValidatePositions, setInputValidatePositions] = useState(false);

  const positionsChange = (e) => {

    var options = e.target.options;
    var positions = [];

    for (var i = 1, l = options.length; i < l; i++) {
      if (options[i].selected) {
        positions.push(options[i].value);
      }
    }

    setInputPositions(positions);

    if (positions.length == 0) {
      setInputValidatePositions(MOBXuser.user.positions?.length > 0);
    } else {
      setInputValidatePositions(JSON.stringify(positions.sort()) != JSON.stringify(MOBXuser.user.positions?.sort()));
    }

    setOnError('');
  }

  /*----------------------------------------------------------------------------------------------------------------------------
      Функция сохранения
  ----------------------------------------------------------------------------------------------------------------------------*/

  const saveChanges = async (event) => {

    event.preventDefault();

    setOnError('');

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {
        const responce = await changeUser(MOBXuser.user.id, uriAvatar, inputSurname, inputFirstName, inputPatronymic, inputPositions);

        setUriAvatar(null);
        setInputValidateFirstName(false);
        setInputValidatePatronymic(false);
        setInputValidateSurname(false);
        setInputValidatePositions(false);

        MOBXuser.setUser(responce.user);

      }

    } catch (error) {

      if (error instanceof ApiError) {

        if (error.statusCode == 520) {

          const message = JSON.parse(error.message)

          setOnError(message.message);

          MOBXui.openGoogleAuthError(message.email, message.authorizeUrl);

        } else {

          setOnError(error.message);

        }

      } else {
        throw error
      }

    } finally {

      MOBXui.setLoading();

    }
  }

  /*-------------------------------------------------------------------------------------------------------
      Модальное окно Формы удаления
  -------------------------------------------------------------------------------------------------------*/
  const [userDeleteForm, setUserDeleteForm] = useState({
    isOpen: false
  });

  /*----------------------------------------------------------------------------------------------------------------------------
      Функция удаления
  ----------------------------------------------------------------------------------------------------------------------------*/
  const userDeleteFormSubmit = async (event, reason) => {

    event.preventDefault();

    setUserDeleteForm({
      isOpen: false
    });

    setOnError('');

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        await deleteUser(MOBXuser.user.id, reason);

        MOBXuser.setAuth(false);
        MOBXuser.setUser({});

        router.push('/');

      }

    } catch (error) {

      if (error instanceof ApiError) {

        if (error.statusCode == 520) {

          const message = JSON.parse(error.message)

          setOnError(message.message);

          MOBXui.openGoogleAuthError(message.email, message.authorizeUrl);

        } else {

          setOnError(error.message);

        }

      } else {
        throw error
      }

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----------------------------------------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/

  if (MOBXuser.isAuth)
    return (
      <motion.div
        variants={inputs}
        className="w-full m-4 flex flex-col md:flex-row"
      >

        {/* {Изображение аватара, емайл, кнопки управления} */}
        <div
          className="flex-none md:order-last md:ml-4 flex flex-col border-t-8 border-red-700 rounded-t-md"
        >

          {/* {Изображение аватара} */}
          <div
            className="bg-white w-full flex items-center justify-center p-4 select-none"
          >
            <Image
              className="object-cover w-44 h-44 rounded-full"
              width={176}
              height={176}
              src={uriAvatar ? uriAvatar : MOBXuser?.avatar}
              alt=""
            />
          </div>

          {/* {Емайл} */}
          <span
            className="flex-none font-bold p-4 bg-white text-center rounded-b-md"
          >
            {MOBXuser?.user?.email}
          </span>

          {/* {Кнопки управления для компьютера} */}
          <div
            className="flex-1 p-4 hidden md:inline-flex items-center justify-center flex-col select-none"
          >
            {MOBXuser.accessRules.includes('changeUser/self') &&
              <FButtonRed
                className="hidden md:inline-flex m-4"
                onClick={saveChanges}
                disabled={!(uriAvatar || isInputValidateSurname || isInputValidateFirstName || isInputValidatePatronymic || isInputValidatePositions)}
              >
                Сохранить
              </FButtonRed>}

            {MOBXuser.accessRules.includes('deleteUser') &&
            <FButtonRed
              className="hidden md:inline-flex m-4"
              onClick={() => setUserDeleteForm({
                isOpen: true,
                email: MOBXuser.user.email
              })}
            >
              Удалить
            </FButtonRed>}

          </div>

        </div>

        {/* {Панель информации} */}
        <div
          className="flex-initial flex flex-col space-y-4 w-full md:max-w-xl bg-white p-4 rounded-md"
        >

          {/* {Ввод нового аватара} */}
          <div className="form-item">
            <label className="text-xl select-none">Фото</label>
            <FInputFile
              setUri={setUriAvatar}
            />
          </div>

          {/* {Фамилия} */}
          <div className="form-item">
            <label className="text-xl select-none">Фамилия</label>
            <FInputInitials
              id='family-name'
              placeholder='Фамилия'
              value={inputSurname ? inputSurname : MOBXuser?.user?.surname}
              onChange={surnameChange}
            />
          </div>

          {/* {Имя} */}
          <div className="form-item">
            <label className="text-xl select-noneselect-none">Имя</label>
            <FInputInitials
              id='FullName'
              placeholder='Имя'
              value={inputFirstName ? inputFirstName : MOBXuser?.user?.firstName}
              onChange={firstNameChange}
            />
          </div>

          {/* {Отчество} */}
          <div className="form-item">
            <label className="text-xl select-noneselect-none">Отчество</label>
            <FInputInitials
              id='additional-name'
              placeholder='Отчество'
              value={inputPatronymic ? inputPatronymic : MOBXuser?.user?.patronymic}
              onChange={patronymicChange}
            />
          </div>

          {/* {Должность} */}
          {MOBXuser.accessRules.includes('changeUser') &&
            <div className="form-item">
              <label className="text-xl select-noneselect-none">Должность</label>
              <FSelect
                options={FPositionItemList}
                onChange={positionsChange}
                value={inputPositions}
                defaultValue={MOBXuser?.user?.positions}
                multiple
              />
            </div>}

          {!MOBXuser.accessRules.includes('changeUser') && (MOBXuser?.user?.positions.length > 0) &&
            <div className="form-item select-none">
              <label className="text-xl">Должность</label>
              <ul
                  className='block w-full 
                  border border-gray-300 
                  p-2 bg-gray-100 
                  rounded-md shadow-sm'
              >
                  {FPositionItemList?.reduce((result, value) => {
                    if( MOBXuser?.user?.positions.includes(value.value) ){
                      result.push(
                        <li
                          key={value.label + value.value}
                        >
                            {value.label}
                        </li>
                      );
                    }
                    return result;
                  }, [])}
              </ul>
            </div>}

          {/* {Ошибки} */}
          <div className="form-item">
            <span className="text-color_C italic break-words">
              {onError}
            </span>
          </div>

          {/* {Кнопки управления для телефона} */}
          <div
            className="form-item md:hidden self-end flex flex-col space-y-4 select-none"
          >

            {MOBXuser.accessRules.includes('changeUser/self') &&
            <FButtonRed
              onClick={saveChanges}
              disabled={!(uriAvatar || isInputValidateSurname || isInputValidateFirstName || isInputValidatePatronymic || isInputValidatePositions)}
            >
              Сохранить
            </FButtonRed>}

            {MOBXuser.accessRules.includes('deleteUser') &&
            <FButtonRed
              onClick={() => setUserDeleteForm({
                isOpen: true,
                email: MOBXuser.user.email
              })}
            >
              Удалить
            </FButtonRed>}

          </div>

        </div>

        {/* {Форма удаления аккаунта} */}
        <FUserDeleteForm
          form={userDeleteForm}
          setForm={setUserDeleteForm}
          submit={userDeleteFormSubmit}
        />

      </motion.div>
    )
  else return null;

});


export default FFormProfile;