import { motion } from "framer-motion";
import { useState } from 'react';
import { useRouter } from "next/router";
import { observer } from 'mobx-react-lite'
import Image from "next/legacy/image";
import { useStore } from "../../levelA/StoreProvider";
import { changeUser, changeUserPassword, deleteUser } from "../../../src/dtos/dtoUser";
import { ApiError } from "../../../middleware/exceptions";
import { FUserDeleteForm } from "../../levelD_modal/userHard/FUserDeleteForm";
import { FInputInitials } from "../../levelE_low/FInputInitials";
import { FInputFile } from "../../levelE_low/FInputFile";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FSelect } from "../../levelE_low/FSelect";
import FPositionItemList from "../../levelZ_variable/FPositionItemList";
import { equalArrays } from "../../../src/utils/arrayUtils";
import { FInputPassword } from "../../levelE_low/FInputPassword";

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

const FFormProfileСonfidential = observer(function FFormProfileСonfidential({ userData, accessRules }) {
  /*----------------------------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  ----------------------------------------------------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();

  const [currentUser, setCurrentUser] = useState(userData ? userData : {});

  const [onError, setError] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Определение правил доступа
  -------------------------------------------------------------------------------------------------------*/
  const ARchangeUserPassword = accessRules.includes('changeUserPassword');

  /*-------------------------------------------------------------------------------------------------------
      Данные инпутов
  -------------------------------------------------------------------------------------------------------*/

  // Старый Пароль
  const [inputPasswordOld, setInputPasswordOld] = useState('');
  const [isInputValidatePasswordOld, setInputValidatePasswordOld] = useState(false);
  const passwordOldChange = (password, validate) => {
    setInputPasswordOld(password);
    setInputValidatePasswordOld(validate)
    setInputValidatePasswordNew(password !== inputPasswordNew);
    setError('');
  }

  // Новый Пароль
  const [inputPasswordNew, setInputPasswordNew] = useState('');
  const [isInputValidatePasswordNew, setInputValidatePasswordNew] = useState(false);
  const passwordNewChange = (password, validate) => {
    setInputPasswordNew(password);
    setInputValidatePasswordNew(validate && password !== inputPasswordOld);
    setInputValidatePasswordNewCheck(password === setInputPasswordNewCheck);
    setError('');
  }
  // Проверка нового Пароля
  const [inputPasswordNewCheck, setInputPasswordNewCheck] = useState('');
  const [isInputValidatePasswordNewCheck, setInputValidatePasswordNewCheck] = useState(false);
  const passwordNewCheckChange = (password, validate) => {
    setInputPasswordNewCheck(password)
    setInputValidatePasswordNewCheck(validate && password === inputPasswordNew)
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

        const responce = await changeUserPassword(
          currentUser.id,
          inputPasswordOld,
          inputPasswordNew
        );

        setInputPasswordOld('');
        setInputValidatePasswordOld(false);
        setInputPasswordNew('');
        setInputValidatePasswordNew(false);
        setInputPasswordNewCheck('');
        setInputValidatePasswordNewCheck(false);

        setError(responce.result);
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

        {/* {Панель информации} */}
        <div
          className="flex-initial flex flex-col space-y-4 w-full md:max-w-xl bg-white p-4 rounded-md"
        >

          {/* {Старый пароль} */}
          <div className="form-item">
            <label className="text-xl select-none">Старый пароль</label>
            <FInputPassword
              value={inputPasswordOld}
              onPasswordChange={passwordOldChange}
              placeholder="Введите Старый пароль"
              id="password-old"
              disabled={!ARchangeUserPassword}
            />
          </div>
          
          {/* {Новый пароль} */}
          <div className="form-item">
            <label className="text-xl select-none">Новый пароль</label>
            <FInputPassword
              value={inputPasswordNew}
              onPasswordChange={passwordNewChange}
              placeholder="Введите новый пароль"
              disabled={!ARchangeUserPassword}
            />
            <FInputPassword
              value={inputPasswordNewCheck}
              onPasswordChange={passwordNewCheckChange}
              placeholder="Введите повторно новый пароль"
              id="password-check"
              className='mt-2'
              disabled={!ARchangeUserPassword}
            />
          </div>

          {/* {Ошибки} */}
          <div className="form-item">
            <span className="text-color_C italic break-words">
              {onError}
            </span>
          </div>

          {/* {Кнопки управления для телефона} */}
          <div
            className="form-item self-end flex flex-col space-y-4 select-none"
          >
            {ARchangeUserPassword &&
              <FButtonRed
                onClick={saveChanges}
                disabled={!(isInputValidatePasswordOld && isInputValidatePasswordNew && isInputValidatePasswordNewCheck)}
              >
                Сохранить
              </FButtonRed>}

          </div>

        </div>

      </motion.div>
    )
  else return null;

});

export default FFormProfileСonfidential;