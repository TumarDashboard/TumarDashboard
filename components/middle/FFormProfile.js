import { motion } from "framer-motion";
import { useState } from 'react';
import { useRouter } from "next/router";
import { observer } from 'mobx-react-lite'
import Image from 'next/image';

import { useStore } from "../hight/StoreProvider";
import { changeUser, deleteUser } from "../../src/mobx/mobxUser";

import { ApiError } from "../../middleware/exceptions";

import { FUserDeleteForm } from "../modal/FUserDeleteForm";
import { FGoogleAuthErrorForm } from "../hight/GoogleAuthError";

import { FInputText } from "../low/FInputText";
import { FInputFile } from "../low/FInputFile";
import { FButtonRed } from "../low/FButtonRed";
import { FSelect } from "../low/FSelect";

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

const optionPositions = [
  { text: "Отсутствует", code: 'FPEMP' },
  { text: "Начальник службы охраны", code: 'FPNSO' },
  { text: "Сотрудник отдела кадров", code: 'FPHRM' },
  { text: "Сотрудник технического отдела", code: 'FRTHN' },
]

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
  const [inputPositions, setInputPositions] = useState([]);

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

        <div
          className="flex-none md:order-last md:ml-4 flex flex-col border-t-8 border-red-700 rounded-t-md"
        >
          <div
            className="bg-white w-full flex items-center justify-center p-4"
          >
            <Image
              className="object-cover w-44 h-44 rounded-full"
              width={176}
              height={176}
              src={uriAvatar ? uriAvatar : MOBXuser?.avatar}
              alt=""
            />
          </div>

          <span
            className="flex-none font-bold p-4 bg-white text-center rounded-b-md"
          >
            {MOBXuser?.user?.email}
          </span>

          <div
            className="flex-1 p-4 hidden md:inline-flex items-center justify-center flex-col"
          >
            <FButtonRed
              className="hidden md:inline-flex m-4"
              onClick={saveChanges}
              disabled={!(uriAvatar || isInputValidateSurname || isInputValidateFirstName || isInputValidatePatronymic || isInputValidatePositions)}
            >
              Сохранить
            </FButtonRed>

            <FButtonRed
              className="hidden md:inline-flex m-4"
              onClick={() => setUserDeleteForm({
                isOpen: true,
                email: MOBXuser.user.email
              })}
            >
              Удалить
            </FButtonRed>

          </div>

        </div>

        <div
          className="flex-initial flex flex-col space-y-4 w-full max-w-xl bg-white p-4 rounded-md"
        >

          <div className="form-item">
            <label className="text-xl ">Фото</label>
            <FInputFile
              setUri={setUriAvatar}
            />
          </div>

          <div className="form-item">
            <label className="text-xl ">Фамилия</label>
            <FInputText
              id='family-name'
              placeholder='Фамилия'
              value={inputSurname ? inputSurname : MOBXuser?.user?.surname}
              onChange={surnameChange}
            />
          </div>

          <div className="form-item">
            <label className="text-xl ">Имя</label>
            <FInputText
              id='FullName'
              placeholder='Имя'
              value={inputFirstName ? inputFirstName : MOBXuser?.user?.firstName}
              onChange={firstNameChange}
            />
          </div>

          <div className="form-item">
            <label className="text-xl ">Отчество</label>
            <FInputText
              id='additional-name'
              placeholder='Отчество'
              value={inputPatronymic ? inputPatronymic : MOBXuser?.user?.patronymic}
              onChange={patronymicChange}
            />
          </div>

          <div className="form-item">
            <label className="text-xl">Должность</label>
            <FSelect
              options={optionPositions}
              onChange={positionsChange}
              value={inputPositions}
              defaultValue={MOBXuser?.user?.positions}
              multiple
            />
          </div>

          <div className="form-item">
            <span className="text-color_C italic break-words">
              {onError}
            </span>
          </div>

          <FButtonRed
            className="form-item md:hidden self-end"
            onClick={saveChanges}
            disabled={!(uriAvatar || isInputValidateSurname || isInputValidateFirstName || isInputValidatePatronymic || isInputValidatePositions)}
          >
            Сохранить
          </FButtonRed>

          <FButtonRed
            className="form-item md:hidden self-end"
            onClick={() => setUserDeleteForm({
              isOpen: true,
              email: MOBXuser.user.email
            })}
          >
            Удалить
          </FButtonRed>

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