import { motion } from "framer-motion";
import Image from "next/legacy/image";
import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, PencilSquareIcon, TrashIcon, ShieldCheckIcon, LockClosedIcon, RectangleGroupIcon } from '@heroicons/react/24/solid';
import { NoSymbolIcon } from '@heroicons/react/24/outline';
import { FFilterText } from "../../levelE_low/FFilterText";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FUserEditForm } from "../../levelD_modal/userHard/FUserEditForm";
import { FUserDeleteForm } from "../../levelD_modal/userHard/FUserDeleteForm";
import { ApiError } from "../../../middleware/exceptions";
import { useStore } from "../../levelA/StoreProvider";
import { createUserHard, editUserHard, deleteUserHard, activateUserHard, resetUserPasswordHard, recoverUserHard } from "../../../src/dtos/dtoUser";
import { FButtonYellow } from "../../levelE_low/FButtonYellow";
import { FUserActivationForm } from "../../levelD_modal/userHard/FUserActivationForm";
// import { Tooltip, TooltipWrapper } from 'react-tooltip';
// import 'react-tooltip/dist/react-tooltip.css';
import { FUserResetPasswordForm } from "../../levelD_modal/userHard/FUserResetPasswordForm";
import { usePopper } from 'react-popper';
import { FTooltip } from "../../levelE_low/FTooltip";
import { FUserRecoverForm } from "../../levelD_modal/userHard/FUserRecoverForm";

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

const constTableHead = [
  { value: 'login', label: 'Логин' },
  { value: 'positions', label: 'Должность' },
  { value: 'email', label: 'Почта' },
  // { value: 'status', label: 'Статус' },
];

const sortingTableCallback = (a, b, rule, invert) => {
  // equal items sort equally
  if (a[rule] === b[rule]) {
    return 0;
  }

  // nulls sort after anything else
  if (a[rule] === null || a[rule] === undefined) {
    return 1 * invert;
  }
  if (b[rule] === null || b[rule] === undefined) {
    return -1 * invert;
  }

  switch (rule) {
    case 'login':
      return (a.surname.localeCompare(b.surname) || a.firstName.localeCompare(b.firstName)) * invert;

    case 'positions':
      return (JSON.stringify(a.positionsText).localeCompare(JSON.stringify(b.positionsText))) * invert;

    case 'email':
      return (a.email.localeCompare(b.email)) * invert;

    // case 'status':
    //   return (a.isActivated == b.isActivated) * invert;

    default:
      break;
  }
}

export default function FFormUsersArchive({ accessRules, tableUsersArchive, setTableUsers, setTableUsersArchive }) {
  /*--Использование глобальных данных--------------------------------------------------------------------*/
  const { MOBXuser, MOBXui } = useStore();

  /*--Определение правил доступа-------------------------------------------------------------------------*/
  // const ARcreateUserHard = false;//accessRules.includes('createUserHard');
  // const AReditUserHard = false;//accessRules.includes('editUserHard');
  // const ARdeleteUserHard = false;//accessRules.includes('deleteUserHard');
  // const ARactivateUserHard = false;//accessRules.includes('activateUserHard');
  // const ARresetUserPasswordHard = false;//accessRules.includes('resetUserPasswordHard');
  const ARrecoverUserHard = accessRules.includes('recoverUserHard');

  /*--Данные таблицы-------------------------------------------------------------------------------------*/
  const [renderTableUsers, setRenderTableUsers] = useState(tableUsersArchive ? [...tableUsersArchive] : []);

  /*--Сортировка таблицы---------------------------------------------------------------------------------*/
  const [sortingRule, setSortingRule] = useState();

  const sortingTable = (rule) => {

    const invert = rule == sortingRule ? -1 : 1;

    setRenderTableUsers(array => {
      return [...array.sort((a, b) => sortingTableCallback(a, b, rule, invert))];
    });

    setSortingRule(rule == sortingRule ? '!' + rule : rule);

  }

  /*--Фильтрация таблицы---------------------------------------------------------------------------------*/
  const [inputFilterText, setInputFilterText] = useState([]);
  const filterringTimeout = useRef();

  const filteringTable = (text) => {

    const filtersArray = text.toLowerCase().split(' ');

    setRenderTableUsers(

      tableUsersArchive.filter(value => {

        const parametrsArray = [
          value.surname,
          value.firstName,
          value.patronymic,
          value.email,
          ...value.positionsText,
        ].filter(Boolean);

        for (const parametr of parametrsArray) {
          const lowerParametr = parametr.toLowerCase();
          for (const filter of filtersArray) {
            if (lowerParametr.includes(filter)) {
              return true;
            }
          }
        }

        return false;

      })

    );

    setSortingRule(null);

  }

  /*---Модальное окно Формы редактирования---------------------------------------------------------------*/
  // const [userEditForm, setUserEditForm] = useState({
  //   isOpen: false
  // });

  /*---Создание Формой редактирования--------------------------------------------------------------------*/
  // const userAdd = async (event,
  //   inputUserAvatarSrc,
  //   inputUserEmail,
  //   inputUserSurname,
  //   inputUserFirstName,
  //   inputUserPatronymic,
  //   inputUserPositions,
  // ) => {

  //   event.preventDefault();

  //   MOBXui.setLoading();

  //   try {
  //     // Отправляем запрос на сервер

  //     if (MOBXuser.user && MOBXuser.user.id) {
  //       const responce = await createUserHard(
  //         MOBXuser.user.id,
  //         inputUserAvatarSrc,
  //         inputUserEmail,
  //         inputUserSurname,
  //         inputUserFirstName,
  //         inputUserPatronymic,
  //         inputUserPositions,
  //       );
  //       console.log(responce.user);
  //       // Обновляем таблицу в памяти
  //       setTableUsers(array => {
  //         array.unshift(responce.user);
  //         return array;
  //       });

  //       // Обновляем отображаемую таблицу
  //       setRenderTableUsers(array => {
  //         array.unshift(responce.user);
  //         return array;
  //       });

  //       // Закрываем модальное окно
  //       setUserEditForm({ isOpen: false });
  //     }
  //   } catch (error) {

  //     errorCallback(error, setUserEditForm);

  //   } finally {

  //     MOBXui.setLoading();

  //   }
  // }

  /*---Изменение Формой редактирования-------------------------------------------------------------------*/
  // const userEdit = async (event,
  //   inputUserAvatarSrc,
  //   inputUserEmail,
  //   inputUserSurname,
  //   inputUserFirstName,
  //   inputUserPatronymic,
  //   inputUserPositions,
  // ) => {

  //   event.preventDefault();

  //   MOBXui.setLoading();

  //   try {

  //     if (MOBXuser.user && MOBXuser.user.id) {
  //       // Отправляем запрос на сервер
  //       const responce = await editUserHard(
  //         MOBXuser.user.id,
  //         userEditForm.user._id,
  //         inputUserAvatarSrc,
  //         inputUserEmail,
  //         inputUserSurname,
  //         inputUserFirstName,
  //         inputUserPatronymic,
  //         inputUserPositions,
  //       );

  //       // Обновляем таблицу в памяти
  //       setTableUsers(array => {
  //         const index = array.findIndex(element => {
  //           return element._id == responce.user._id
  //         });
  //         if (index)
  //           array[index] = responce.user;
  //         return array;
  //       });

  //       // Обновляем отображаемую таблицу
  //       setRenderTableUsers(array => {
  //         array[userEditForm.index] = responce.user;
  //         return array;
  //       });

  //       // Закрываем модальное окно
  //       setUserEditForm({ isOpen: false });
  //     }
  //   } catch (error) {

  //     errorCallback(error, setUserEditForm);

  //   } finally {

  //     MOBXui.setLoading();

  //   }
  // }

  /*---Модальное окно Формы удаления---------------------------------------------------------------------*/
  // const [userDeleteForm, setUserDeleteForm] = useState({
  //   isOpen: false
  // });

  /*---Функция удаления Формы удаления-------------------------------------------------------------------*/
  // const userDeleteFormSubmit = async (event, reason) => {

  //   event.preventDefault();

  //   MOBXui.setLoading();

  //   try {

  //     if (MOBXuser.user && MOBXuser.user.id) {

  //       // Отправляем запрос на сервер
  //       const responce = await deleteUserHard(
  //         MOBXuser.user.id,
  //         userDeleteForm.userId,
  //         reason
  //       );

  //       // Обновляем таблицу в памяти
  //       setTableUsers(array => {
  //         const result = array.filter(value => {
  //           return responce.user.id != value._id;
  //         })
  //         return result
  //       });

  //       // Обновляем отображаемую таблицу
  //       setRenderTableUsers(array => {
  //         const result = array.filter(value => {
  //           return responce.user.id != value._id;
  //         })
  //         return result
  //       });

  //       // Обнавляем таблицу архива
  //       setTableUsersArchive(array => {
  //         array.unshift(responce.user);
  //         return array;
  //       });

  //       // Закрываем модальное окно
  //       setUserDeleteForm({ isOpen: false });
  //     }

  //   } catch (error) {

  //     errorCallback(error, setUserDeleteForm);

  //   } finally {

  //     MOBXui.setLoading();

  //   }
  // }

  /*---Модальное окно Формы активации--------------------------------------------------------------------*/
  // const [userActivationForm, setUserActivationForm] = useState({
  //   isOpen: false
  // });

  /*---Функция активации Формы активации-----------------------------------------------------------------*/
  // const userActivationFormSubmit = async (event) => {

  //   event.preventDefault();

  //   MOBXui.setLoading();

  //   try {

  //     if (MOBXuser.user && MOBXuser.user.id) {

  //       // Отправляем запрос на сервер
  //       await activateUserHard(
  //         MOBXuser.user.id,
  //         userActivationForm.userId
  //       );

  //       // Обновляем таблицу в памяти
  //       setTableUsers(array => {
  //         const index = array.findIndex(element => {
  //           return element._id == userActivationForm.userId
  //         });
  //         if (index)
  //           array[index].isActivated = true;
  //         return array;
  //       });

  //       // Обновляем отображаемую таблицу
  //       setRenderTableUsers(array => {
  //         array[userActivationForm.index].isActivated = true;
  //         return array;
  //       });

  //       // Закрываем модальное окно
  //       setUserActivationForm({ isOpen: false });
  //     }

  //   } catch (error) {

  //     errorCallback(error, setUserActivationForm);

  //   } finally {

  //     MOBXui.setLoading();

  //   }
  // }

  /*---Модальное окно Формы сброса пароля----------------------------------------------------------------*/
  // const [userResetPasswordForm, setUserResetPasswordForm] = useState({
  //   isOpen: false
  // });

  /*--Функция сброса пароля Формы сброса пароля----------------------------------------------------------*/
  // const userResetPasswordFormSubmit = async (event) => {

  //   event.preventDefault();

  //   MOBXui.setLoading();

  //   try {

  //     if (MOBXuser.user && MOBXuser.user.id) {

  //       // Отправляем запрос на сервер
  //       await resetUserPasswordHard(
  //         MOBXuser.user.id,
  //         userResetPasswordForm.userId
  //       );

  //       // Закрываем модальное окно
  //       setUserResetPasswordForm({ isOpen: false });
  //     }

  //   } catch (error) {

  //     errorCallback(error, setUserResetPasswordForm);

  //   } finally {

  //     MOBXui.setLoading();

  //   }
  // }


  /*----Модальное окно Формы восстановления-------------------------------------------------------------------------------*/
  const [userRecoverForm, setUserRecoverForm] = useState({
    isOpen: false
  });

  /*----Функция восстановления поста Формы восстановления-------------------------------------------------------------*/
  const userRecoverFormSubmit = async (event) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        // Отправляем запрос на сервер
        const responce = await recoverUserHard(
          userRecoverForm.userId
        );

        // Обновляем таблицу в памяти
        setTableUsersArchive(array => {
          const result = array.filter(value => {
            return responce.user.id != value.id;
          })
          return result
        });

        // Обновляем отображаемую таблицу
        setRenderTableUsers(array => {
          const result = array.filter(value => {
            return responce.user.id != value.id;
          })
          return result
        });

        // Обнавляем таблицу физ. постов в базе
        setTableUsers(array => {
          array.unshift(responce.user);
          return array;
        });

        // Закрываем модальное окно
        setUserRecoverForm({ isOpen: false });
      }

    } catch (error) {
      console.log();

      errorCallback(error, setUserRecoverForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*---Переиспользование функции обработок ошибок-----------------------------------------------------------------------------*/
  const   errorCallback = (error, callback) => {
    if (error.statusCode == 404)
      throw error
    else if (error instanceof ApiError) {

      if (error.statusCode == 520) {

        // callback({ isOpen: false });
        const message = JSON.parse(error.message);

        MOBXui.openGoogleAuthError(message.email, message.authorizeUrl);

      } else {
        callback(form => {
          let formNew = { ...form };
          formNew.error = error.message;
          return formNew;
        });
      }

    } else {
      throw error
    }
  }

  /*---Референс подсказки-----------------------------------------------------------------------------------------------------*/
  // const [tooltipReference, setTooltipReference] = useState(null);

  /*--------------------------------------------------------------------------------------------------------------------------*/
  useEffect(()=>{
    return ()=>{
      filterringTimeout.current && clearTimeout(filterringTimeout.current);
    }
  }, []);

  /*--------------------------------------------------------------------------------------------------------------------------*/

  return (
    <motion.div
      variants={inputs}
      className="w-full m-2"
    >
      {/* {Панель управления} */}
      <div
        className="w-full flex flex-col md:flex-row items-center space-y-2
        pt-2 pb-4"
      >

        {/* {Кнопка добавления} */}
        <div className='flex-1 md:order-last md:ml-2 w-full flex justify-end'>

          {/* {Кнопка добавления} */}
          {/* {ARcreateUserHard && <button
            className="bg-color_F h-10 w-10 flex justify-center items-center rounded-full
            hover:bg-color_C active:bg-color_B"
            onClick={() => {
              setUserEditForm({
                isOpen: true,
                operation: 'Добавить',
                key: Math.random().toString(36)
              })
            }}
          >
            <PlusIcon
              className="h-8 w-8 fill-color_C
            hover:fill-color_F"
            />
          </button>} */}

        </div>

        {/* Фильтр, кнопка чистки фильтра */}
        <div
          className='flex-0 w-full flex'
        >
          {/* Фильтр */}
          <FFilterText
            value={inputFilterText}
            onChange={(e) => {
              setInputFilterText(e.target.value);
              filterringTimeout.current && clearTimeout(filterringTimeout.current);
              filterringTimeout.current = setTimeout(() => filteringTable(e.target.value), 500);
            }}
            onClear={() => {
              setInputFilterText('');
              setRenderTableUsers([...tableUsersArchive]);
            }}
          />

        </div>

      </div>

      {/* {Таблица пользователей} */}
      <table className="min-w-full border-collapse block md:table">

        {/* {Заголовок таблицы} */}
        <thead className="block md:table-header-group select-none">
          <tr className="border md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative">

            {/* Сортируемые заголовки */}
            {constTableHead.map((value, index) => {
              return <th
                key={value.value + value.label}
                className="block md:table-cell md:border bg-color_B p-2"
                onClick={(e) => sortingTable(value.value)}
              >
                <div
                  className="flex w-full text-white font-bold text-left items-center justify-between"
                >
                  <span>{value.label}</span>

                  {sortingRule == value.value
                    && <ChevronDownIcon className="h-6 w-6 fill-color_F" />}

                  {sortingRule == '!' + value.value
                    && <ChevronUpIcon className="h-6 w-6 fill-color_F" />}

                </div>
              </th>
            })}

            {/* Заголовок управления*/}
            {/* {(AReditUserHard || ARdeleteUserHard || ARactivateUserHard || ARresetUserPasswordHard) && */}
            {ARrecoverUserHard &&
              <th className="block md:table-cell md:border bg-color_B p-2" />}

          </tr>
        </thead>

        {/* {Тело таблицы} */}
        <tbody className="block md:table-row-group">

          {renderTableUsers.length > 0 && renderTableUsers.map((user, index) => {
            return (

              <tr
                className="rounded-md md:border-none block md:table-row bg-color_G mb-2 cursor-pointer"
                key={user._id}
              >

                {/* {Аватар, инициалы} */}
                <td className="p-2 md:border text-left block md:table-cell">

                  {/* {Аватар, инициалы */}
                  <div
                    className=" flex flex-row items-center"
                  >

                    {/* {Аватар} */}
                    {user.uiAvatarsSrc && <Image
                      className="h-8 w-8 rounded-full"
                      width={32}
                      height={32}
                      src={user.uiAvatarsSrc}
                      alt=""
                    />}

                    {/* {инициалы} */}
                    <p className="font-semibold text-black ml-1">{[user.surname, user.firstName, user.patronymic].join(' ')}</p>

                  </div>
                </td>

                {/* {Должность} */}
                <td className="p-2 md:border text-left block md:table-cell">
                  {user.positionsText &&
                    <><span className="inline-block w-1/3 md:hidden font-bold">Должность</span>
                      {user.positionsText.map(positionText => <p key={`${user._id}${positionText}`}>{positionText}</p>)}</>
                  }
                </td>

                {/* {Почта} */}
                <td className="p-2 md:border text-left block md:table-cell">
                  <span className="inline-block w-1/3 md:hidden font-bold">Почта</span>{user.email}
                </td>

                {/* {Кнопки управления компьютера} */}
                {/* {(AReditUserHard || ARdeleteUserHard || ARactivateUserHard || ARresetUserPasswordHard) && */}
                {ARrecoverUserHard &&
                  <td className="p-2 md:border text-left block md:table-cell md:w-1">
                    <div className='flex justify-end space-x-2'>

                      {/* {Кнопка активации} */}
                      {/* {ARactivateUserHard && !user.isActivated &&
                        <FButtonYellow
                          className="flex"
                          onPointerEnter={event => setTooltipReference({ target: event.currentTarget, text: `Активировать учётную запись - ${[user.surname, user.firstName, user.patronymic].join(' ')}` })}
                          onPointerLeave={() => setTooltipReference(null)}
                          onClick={(event) => {
                            event.stopPropagation();

                            setUserActivationForm({
                              isOpen: true,
                              index: index,
                              email: user.email,
                              userId: user._id,
                              createdAt: user.createdAt
                            })
                          }}
                        >
                          <ShieldCheckIcon
                            className="h-4 w-4"
                          />
                        </FButtonYellow>
                      }  */}

                      {/* {Кнопка редактирования} */}
                      {/* {AReditUserHard &&
                        <FButtonRed
                          className="flex"
                          onPointerEnter={event => setTooltipReference({ target: event.currentTarget, text: `Изменить данные - ${[user.surname, user.firstName, user.patronymic].join(' ')}` })}
                          onPointerLeave={() => setTooltipReference(null)}
                          onClick={(event) => {
                            event.stopPropagation();
                            setUserEditForm({
                              isOpen: true,
                              index: index,
                              operation: 'Изменить',
                              key: Math.random().toString(36),
                              user: user
                            })
                          }}
                        >
                          <PencilSquareIcon
                            className="h-4 w-4"
                          />
                        </FButtonRed>
                      } */}

                      {/* {Кнопка удаления} */}
                      {/* {ARdeleteUserHard &&
                        <FButtonWhite
                          className="flex"
                          onPointerEnter={event => setTooltipReference({ target: event.currentTarget, text: `Удалить данные - ${[user.surname, user.firstName, user.patronymic].join(' ')}` })}
                          onPointerLeave={() => setTooltipReference(null)}
                          onClick={(event) => {
                            event.stopPropagation();
                            setUserDeleteForm({
                              isOpen: true,
                              key: Math.random().toString(36),
                              email: user.email,
                              userId: user._id,
                            })
                          }}
                        >
                          <TrashIcon
                            className="h-4 w-4"
                          />
                        </FButtonWhite>
                      } */}

                      {/* {Кнопка сброса пароля} */}
                      {/* {ARresetUserPasswordHard &&
                        <FButtonRed
                          className="flex"
                          onPointerEnter={event => setTooltipReference({ target: event.currentTarget, text: `Сбросить пароль - ${[user.surname, user.firstName, user.patronymic].join(' ')}` })}
                          onPointerLeave={() => setTooltipReference(null)}
                          onClick={(event) => {
                            event.stopPropagation();

                            setUserResetPasswordForm({
                              isOpen: true,
                              index: index,
                              email: user.email,
                              userId: user._id,
                              createdAt: user.createdAt
                            })
                          }}
                        >
                          <NoSymbolIcon
                            className="absolute h-8 w-8 stroke-1"
                          />
                          <LockClosedIcon
                            className="h-4 w-4"
                          />
                        </FButtonRed>
                      } */}

                      {/* {Кнопка восстановления} */}
                      {ARrecoverUserHard &&
                        <FButtonWhite
                          className="flex"
                          // onPointerEnter={event => setTooltipReference({ target: event.currentTarget, text: `Восстановить - ${[user.surname, user.firstName, user.patronymic].join(' ')}` })}
                          // onPointerLeave={() => setTooltipReference(null)}
                          onClick={(event) => {
                            event.stopPropagation();
                            setUserRecoverForm({
                              isOpen: true,
                              key: Math.random().toString(36),
                              userInitials: [user.surname, user.firstName].join(' '),
                              userReason: user.reason,
                              userUserPerfomed: user.userPerfomed,
                              userId: user._id,
                            })
                          }}
                        >
                          <RectangleGroupIcon
                            className="h-4 w-4"
                          />
                          <span className='hidden xl:block'>Восстановить</span>
                        </FButtonWhite>}

                    </div>
                  </td>}

              </tr>

            )
          })}

        </tbody>

      </table>

      {/* {Форма добавления/редактирования} */}
      {/* <FUserEditForm
        form={userEditForm}
        setForm={setUserEditForm}
        submitAdd={userAdd}
        submitEdit={userEdit}
      /> */}

      {/* {Форма удаления} */}
      {/* <FUserDeleteForm
        form={userDeleteForm}
        setForm={setUserDeleteForm}
        submit={userDeleteFormSubmit}
      /> */}

      {/* {Форма активации} */}
      {/* <FUserActivationForm
        form={userActivationForm}
        setForm={setUserActivationForm}
        submit={userActivationFormSubmit}
      /> */}

      {/* {Форма активации} */}
      {/* <FUserResetPasswordForm
        form={userResetPasswordForm}
        setForm={setUserResetPasswordForm}
        submit={userResetPasswordFormSubmit}
      /> */}

      {/* {Форма восстановления} */}
      <FUserRecoverForm
        form={userRecoverForm}
        setForm={setUserRecoverForm}
        submit={userRecoverFormSubmit}
      />

      {/* {Подсказка таблицы} */}
      {/* <FTooltip
        reference={tooltipReference} 
      /> */}

    </motion.div>
  );

};