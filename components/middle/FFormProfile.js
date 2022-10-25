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
import { equalArrays } from "../../src/utils/arrayUtils";

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

const FFormProfile = observer(function FFormProfile({userData, accessRules}) {
  /*----------------------------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  ----------------------------------------------------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();

  const [ currentUser, setCurrentUser ] = useState(userData ? userData : {});
  
  /*----------------------------------------------------------------------------------------------------------------------------
      Данные инпутов
  ----------------------------------------------------------------------------------------------------------------------------*/

  const [onError, setError] = useState('');

  const [uriAvatar, setUriAvatar] = useState(null);

  // Фамилия
  const [inputSurname, setInputSurname] = useState(userData.surname);

  const [isInputValidateSurname, setInputValidateSurname] = useState(false);

  const surnameChange = (surname, validate) => {
    setInputSurname(surname);
    setInputValidateSurname(validate && surname != currentUser?.surname);
    setError('');
  }

  // Имя
  const [inputFirstName, setInputFirstName] = useState(userData.firstName);

  const [isInputValidateFirstName, setInputValidateFirstName] = useState(false);

  const firstNameChange = (firstName, validate) => {
    setInputFirstName(firstName);
    setInputValidateFirstName(validate && firstName != currentUser?.firstName);
    setError('');
  }

  // Отчество
  const [inputPatronymic, setInputPatronymic] = useState(userData.patronymic);

  const [isInputValidatePatronymic, setInputValidatePatronymic] = useState(false);

  const patronymicChange = (patronymic, validate) => {
    setInputPatronymic(patronymic);
    setInputValidatePatronymic(validate && patronymic != currentUser?.patronymic);
    setError('');
  }

  //Должность
  const [inputPositions, setInputPositions] = useState(userData.positions || []);

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
      setInputValidatePositions(currentUser?.positions?.length > 0);
    } else {
      setInputValidatePositions(JSON.stringify(positions.sort()) != JSON.stringify(currentUser?.positions?.sort()));
    }

    setError('');
  }

  /*----------------------------------------------------------------------------------------------------------------------------
      Функция сохранения
  ----------------------------------------------------------------------------------------------------------------------------*/

  const saveChanges = async (event) => {

    event.preventDefault();

    setError('');

    MOBXui.setLoading();

    try {
      if (currentUser && currentUser?.id) {

        const responce = await changeUser(currentUser.id, uriAvatar, inputSurname, inputFirstName, inputPatronymic, inputPositions);

        setUriAvatar(null);
        setInputValidateFirstName(false);
        setInputValidatePatronymic(false);
        setInputValidateSurname(false);
        setInputValidatePositions(false);

        MOBXuser.setUser(responce.user);

        setCurrentUser(responce.user)

        if(!equalArrays(inputPositions, currentUser.positions)){
          router.reload(window.location.pathname);
        }

      }

    } catch (error) {

      if (error instanceof ApiError) {

        if (error.statusCode == 520) {

          const message = JSON.parse(error.message)

          setError(message.message);

          MOBXui.openGoogleAuthError(message.email, message.authorizeUrl);

        } else {

          setError(error.message);

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

    setError('');

    MOBXui.setLoading();

    try {

      if (currentUser && currentUser?.id) {

        await deleteUser(currentUser?.id, reason);

        MOBXuser.setAuth(false);
        MOBXuser.setUser({});

        router.push('/');

      }

    } catch (error) {

      if (error instanceof ApiError) {

        if (error.statusCode == 520) {

          const message = JSON.parse(error.message)

          setError(message.message);

          MOBXui.openGoogleAuthError(message.email, message.authorizeUrl);

        } else {

          setError(error.message);

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
              src={uriAvatar ? uriAvatar : (currentUser?.avatar ? currentUser?.avatar : MOBXuser?.avatar) }
              alt=""
            />
          </div>

          {/* {Емайл} */}
          <span
            className="flex-none font-bold p-4 bg-white text-center rounded-b-md"
          >
            {currentUser?.email}
          </span>

          {/* {Кнопки управления для компьютера} */}
          <div
            className="flex-1 p-4 hidden md:inline-flex items-center justify-center flex-col select-none"
          >
            {accessRules.includes('changeUser/self') &&
              <FButtonRed
                className="hidden md:inline-flex m-4"
                onClick={saveChanges}
                disabled={!(uriAvatar || isInputValidateSurname || isInputValidateFirstName || isInputValidatePatronymic || isInputValidatePositions)}
              >
                Сохранить
              </FButtonRed>}

            {accessRules.includes('deleteUser') &&
            <FButtonRed
              className="hidden md:inline-flex m-4"
              onClick={() => setUserDeleteForm({
                isOpen: true,
                email: currentUser?.email
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
          {accessRules.includes('changeUser') &&
            <div className="form-item">
              <label className="text-xl select-noneselect-none">Должность</label>
              <FSelect
                options={FPositionItemList}
                onChange={positionsChange}
                value={inputPositions}
                defaultValue={currentUser.positions}
                multiple
              />
            </div>}

          {!accessRules.includes('changeUser') && (currentUser?.positions.length > 0) &&
            <div className="form-item select-none">
              <label className="text-xl">Должность</label>
              <ul
                  className='block w-full 
                  border border-gray-300 
                  p-2 bg-gray-100 
                  rounded-md shadow-sm'
              >
                  {FPositionItemList?.reduce((result, value) => {
                    if( currentUser?.positions.includes(value.value) ){
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

          {!accessRules.includes('changeUser') && (currentUser?.positions.length == 0) &&
            <div className="form-item select-none">
              <span className="text-color_C italic break-words">
                <p>Ваш профиль находится на рассмотрении администрации.</p>
                <p>Ожидайте, в ближайшее время Вам будет предоставлен доступ к функционалу платформы.</p>
                <p>(потребуется повторная авторизация)</p>
              </span>
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

            {accessRules.includes('changeUser/self') &&
            <FButtonRed
              onClick={saveChanges}
              disabled={!(uriAvatar || isInputValidateSurname || isInputValidateFirstName || isInputValidatePatronymic || isInputValidatePositions)}
            >
              Сохранить
            </FButtonRed>}

            {accessRules.includes('deleteUser') &&
            <FButtonRed
              onClick={() => setUserDeleteForm({
                isOpen: true,
                email: currentUser?.email
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