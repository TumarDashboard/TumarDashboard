import { CalendarIcon, PlusIcon, PencilAltIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, UserGroupIcon } from '@heroicons/react/solid';
import { motion } from "framer-motion";
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from "next/router";

import { useStore } from "../levelA/StoreProvider";
import { ApiError } from "../../middleware/exceptions";
import { FButtonRed } from "../levelE_low/FButtonRed";
import { FButtonWhite } from "../levelE_low/FButtonWhite";

import { createGuardPost, editGuardPost, deleteGuardPost } from '../../src/dtos/dtoGuardPost';
import { FGuardPostDeleteForm } from '../levelD_modal/guardPost/FGuardPostDeleteForm';
import { FGuardPostEditForm } from '../levelD_modal/guardPost/FGuardPostEditForm';
import { FTimesheetPrintForm } from '../levelD_modal/timesheet/FTimesheetPrintForm';
import { FFilterText } from '../levelE_low/FFilterText';
import { FButtonWhiteSmall } from '../levelE_low/FButtonWhiteSmall';
import { FTimesheetTableSelectGuardForm } from '../levelD_modal/timesheetTable/FTimesheetTableSelectGuardForm';
import { FGuardPostSelectGuardForm } from '../levelD_modal/guardPost/FGuardPostSelectGuardForm';
import { FGuardPostShowGuardForm } from '../levelD_modal/guardPost/FGuardPostShowGuardForm';

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
  { value: 'number', label: '№' },
  { value: 'callsign', label: 'Позывной' },
  { value: 'name', label: 'Наименование' },
  { value: 'address', label: 'Адрес' },
  { value: 'manager', label: 'НСО' },
  { value: 'guards', label: 'Охранники' },
];

const constTableHeadControl = { value: 'control' };

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
    case 'number':
      if (a.number && b.number)
        return (a.number - b.number) * invert;
      else return -1;
    case 'callsign':
      return (a.callsign?.localeCompare(b.callsign)) * invert;

    case 'name':
      return (a.name?.localeCompare(b.name)) * invert;

    case 'address':
      return (a.address?.localeCompare(b.address)) * invert;

    case 'manager':
      return (a.manager?.surname.localeCompare(b.manager?.surname) || a.manager?.firstName.localeCompare(b.manager?.firstName)) * invert;

    default:
      break;
  }
}

var filterringTimeout = null;

export default function FFormGuardPosts({ accessRules, userData, guardPosts, guardsData, users }) {
  /*----Использование глобальных данных-------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();

  const [error, setError] = useState('');

  /*----Определение правил доступа------------------------------------------------------------------------------------*/
  const ARcreateGuardPost = accessRules.includes('createGuardPost');
  const AReditGuardPost = accessRules.includes('editGuardPost');
  const AReditGuardPostRate = !accessRules.includes('editGuardPost/editBlock/rate');
  const AReditGuardPostAll = !accessRules.includes('editGuardPost/userCompare/manager');
  const ARdeleteGuardPost = accessRules.includes('deleteGuardPost');
  const ARgetTimesheetPrint = accessRules.includes('getTimesheetPrint');
  const ARchangeTimesheetToday = accessRules.includes('changeTimesheetToday');
  const ARchangeTimesheetTodayAll = !accessRules.includes('changeTimesheetToday/userCompare/guardPostManager');
  // console.log('accessRules %o',accessRules);
  /*----Данные таблицы------------------------------------------------------------------------------------------------*/
  const [tableGuardPosts, setTableGuardPosts] = useState(guardPosts ? [...guardPosts] : []);

  const [renderTableGuardPosts, setRenderTableGuardPosts] = useState(guardPosts ? [...guardPosts] : []);

  const [guards, setGuards] = useState(guardsData.map(guard => {
    guard.label = [guard.surname, guard.firstName, guard.telephone].join(' ');
    guard.lower = guard.label.toLowerCase().replace(/\s/g, '');;
    return guard;
  }));

  /*----Сортировка таблицы--------------------------------------------------------------------------------------------*/
  const [sortingRule, setSortingRule] = useState();

  const sortingTable = (rule) => {

    if (rule == constTableHeadControl.value) {
      setRenderTableGuardPosts(array => {
        return [...array.sort((a, b) => {
          return (a.manager._id === MOBXuser.user.id) * -1;
        })];
      });
    } else {
      const invert = rule == sortingRule ? -1 : 1;
      setRenderTableGuardPosts(array => {
        return [...array.sort((a, b) => sortingTableCallback(a, b, rule, invert))];
      });
    }

    setSortingRule(rule == sortingRule ? '!' + rule : rule);

  }

  /*----Фильтрация таблицы--------------------------------------------------------------------------------------------*/
  const [inputFilterText, setInputFilterText] = useState([]);

  const filteringTable = (text) => {

    const filtersArray = text.toLowerCase().split(' ');

    setRenderTableGuardPosts(

      tableGuardPosts.filter(value => {

        const parametrsArray = [
          value.callsign,
          value.name,
          value.address,
          value.number,
          value.manager?.surname,
          value.manager?.firstName,
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

  /*----Модальное окно Формы редактирования---------------------------------------------------------------------------*/
  const [guardPostEditForm, setGuardPostEditForm] = useState({
    isOpen: false
  });

  /*----Создание физ. поста Формы редактирования----------------------------------------------------------------------*/
  const guardPostAdd = async (event,
    inputGuardPostNumber,
    inputGuardPostCallsign,
    inputGuardPostName,
    inputGuardPostAddress,
    inputGuardPostPhoto,
    inputGuardPostManager,
    inputGuardPostShifts,
    inputGuardPostDescription,
    inputGuardPostRate) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      // Отправляем запрос на сервер
      const responce = await createGuardPost(
        inputGuardPostNumber,
        inputGuardPostCallsign,
        inputGuardPostName,
        inputGuardPostAddress,
        inputGuardPostPhoto,
        inputGuardPostManager,
        inputGuardPostShifts,
        inputGuardPostDescription,
        inputGuardPostRate
      );

      // Обновляем таблицу в памяти
      setTableGuardPosts(array => {
        array.unshift(responce.guardPost);
        return array;
      });

      // Обновляем отображаемую таблицу
      setRenderTableGuardPosts(array => {
        array.unshift(responce.guardPost);
        return array;
      });

      // Закрываем модальное окно
      setGuardPostEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardPostEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----Изменение физ. поста Формы редактирования---------------------------------------------------------------------*/
  const guardPostEdit = async (event,
    inputGuardPostNumber,
    inputGuardPostCallsign,
    inputGuardPostName,
    inputGuardPostAddress,
    inputGuardPostPhoto,
    inputGuardPostManager,
    inputGuardPostShifts,
    inputGuardPostDescription,
    inputGuardPostRate) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      // Отправляем запрос на сервер
      const responce = await editGuardPost(
        guardPostEditForm.guardPost._id,
        inputGuardPostNumber,
        inputGuardPostCallsign,
        inputGuardPostName,
        inputGuardPostAddress,
        inputGuardPostPhoto,
        inputGuardPostManager,
        inputGuardPostShifts,
        inputGuardPostDescription,
        AReditGuardPostRate ? inputGuardPostRate : undefined
      );

      // Обновляем таблицу в памяти
      setTableGuardPosts(array => {
        const index = array.findIndex(element => {
          return element._id == responce.guardPost._id
        });
        if (index)
          array[index] = responce.guardPost;
        return array;
      });

      // Обновляем отображаемую таблицу
      setRenderTableGuardPosts(array => {
        array[guardPostEditForm.index] = responce.guardPost;
        return array;
      });

      // Закрываем модальное окно
      setGuardPostEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardPostEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----Модальное окно Формы удаления-------------------------------------------------------------------------------*/
  const [guardPostDeleteForm, setGuardPostDeleteForm] = useState({
    isOpen: false
  });

  /*----Функция удаления поста Формы удаления-------------------------------------------------------------------------*/
  const guardPostDeleteFormSubmit = async (event, reason) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        // Отправляем запрос на сервер
        const responce = await deleteGuardPost(
          guardPostDeleteForm.guardPostId,
          MOBXuser.user.id,
          reason
        );

        // Обновляем таблицу в памяти
        setTableGuardPosts(array => {
          const result = array.filter(value => {
            return responce.guardPost._id != value._id;
          })
          return result
        });

        // Обновляем отображаемую таблицу
        setRenderTableGuardPosts(array => {
          const result = array.filter(value => {
            return responce.guardPost._id != value._id;
          })
          return result
        });

        // Закрываем модальное окно
        setGuardPostDeleteForm({ isOpen: false });
      }

    } catch (error) {

      errorCallback(error, setGuardPostDeleteForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----Переиспользование функции обработок ошибок--------------------------------------------------------------------*/
  const errorCallback = (error, callback) => {
    if (error instanceof ApiError) {

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

  /*----Модальное окно Формы выгрузки графика рабочих часов-----------------------------------------------------------*/
  const [timesheetPrintForm, setTimesheetPrintForm] = useState({
    isOpen: false
  });

  /*----Модальное окно Формы редактирования Строки охранника----------------------------------------------------------*/
  const [guardPostSelectGuardForm, setGuardPostSelectGuardForm] = useState({
    isOpen: false
  });

  /*----Функция изменения Формы редактирования Строки охранника-------------------------------------------------------*/
  const guardRowEdit = (event,
    inputGuard) => {

    event.preventDefault();

    setError('');

    MOBXui.setLoading();

    try {
      // Обновляем таблицу в памяти
      setTableGuardPosts(array => {
        const index = array.findIndex(element => {
          return element._id == guardPostSelectGuardForm.guardPost._id
        });
        if (index)
          array[index].guardsToday = inputGuard;
        return array;
      });

      // Обновляем отображаемую таблицу
      setRenderTableGuardPosts(array => {
        array[guardPostSelectGuardForm.index].guardsToday = inputGuard;
        return array;
      });

      // Закрываем модальное окно
      setGuardPostSelectGuardForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardPostSelectGuardForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----Модальное окно Формы просмотра Строки охранника---------------------------------------------------------------*/
  const [guardPostShowGuardForm, setGuardPostShowGuardForm] = useState({
    isOpen: false
  });

  /*------------------------------------------------------------------------------------------------------------------*/

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

        {/* Кнопка выгрузки табеля, кнопка создания физ. поста */}
        <div className='flex-1 md:order-last md:ml-2 w-full flex justify-end'>

          {/* Кнопка выгрузки табеля */}
          {ARgetTimesheetPrint && tableGuardPosts?.length > 0 && (<button
            className="bg-color_F h-10 w-10 flex justify-center items-center rounded-full
            hover:bg-color_C active:bg-color_B mr-4"
            onClick={() => {
              setTimesheetPrintForm({
                isOpen: true,
                key: Math.random().toString(36)
              })
            }}
          >
            <CalendarIcon
              className="h-8 w-8 fill-color_C
              hover:fill-color_F"
            />
          </button>)}

          {/* Кнопка создания физ. поста */}
          {ARcreateGuardPost && <button
            className="bg-color_F h-10 w-10 flex justify-center items-center rounded-full
            hover:bg-color_C active:bg-color_B"
            onClick={() => {
              setGuardPostEditForm({
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
          </button>}

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
              if (filterringTimeout) {
                clearTimeout(filterringTimeout);
                filterringTimeout = null;
              }
              filterringTimeout = setTimeout(() => filteringTable(e.target.value), 500);
            }}
            onClear={() => {
              setInputFilterText('');
              setRenderTableGuardPosts([...tableGuardPosts]);
            }}
          />

        </div>

      </div>

      {/* {Таблица физ. постов} */}
      <table className="min-w-full border-collapse block md:table">

        {/* {Заголовок} */}
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
            {(AReditGuardPost || ARdeleteGuardPost || ARchangeTimesheetToday) &&
              <th
                className="block md:table-cell md:border bg-color_B p-2"
                onClick={(e) => sortingTable(constTableHeadControl.value)}
              >
                {sortingRule == constTableHeadControl.value
                  && <ChevronDownIcon className="h-6 w-6 fill-color_F" />}

                {sortingRule == '!' + constTableHeadControl.value
                  && <ChevronUpIcon className="h-6 w-6 fill-color_F" />}
              </th>}

          </tr>
        </thead>

        {/* {Тело} */}
        <tbody className="block md:table-row-group">

          {renderTableGuardPosts.map((guardPost, index) => {
            return (

              <tr
                className="rounded-md md:border-none block md:table-row bg-color_G mb-2 cursor-pointer"
                key={guardPost._id}
                onClick={(event) => {
                  event.stopPropagation();
                  router.push(`/dashboard/guardPosts/${guardPost._id}`)
                }}
              >

                {/* {Позывной мобильного устройства} */}
                <td className="px-1 md:p-2 md:border text-left block md:hidden">
                  <span className="break-all md:break-normal text-xl font-bold">{guardPost.callsign}</span>
                </td>

                {/* {Фото, Номер, Кнопки управления мобильного устройства} */}
                <td className="px-2 md:border text-left block md:table-cell">
                  <div className="flex flex-row items-center justify-start">

                    {/* {Фото} */}
                    {guardPost.photo && <div
                      className="h-8 w-8"
                    >
                      <Image
                        className="rounded-full"
                        width={32}
                        height={32}
                        src={guardPost.photo}
                        alt=""
                      />
                    </div>}

                    {/* {Номер} */}
                    <p className="text-black ml-1 text-xl font-bold">{guardPost.number}</p>

                    {/* {Кнопки управления мобильного устройства} */}
                    {/* {(AReditGuardPost || ARdeleteGuardPost) &&
                      <div className='flex md:hidden'>

                        {((AReditGuardPost && AReditGuardPostAll)
                          || (AReditGuardPost && guardPost.manager._id === MOBXuser.user.id)
                          || (AReditGuardPost && guardPost.manager._id === userData.id)) &&
                          <FButtonRed
                            className="mr-2 flex"
                            onClick={(event) => {
                              event.stopPropagation();
                              setGuardPostEditForm({
                                isOpen: true,
                                index: index,
                                operation: 'Изменить',
                                key: Math.random().toString(36),
                                guardPost: guardPost
                              })
                            }}
                          >
                            <PencilAltIcon
                              className="h-4 w-4"
                            />
                          </FButtonRed>}

                        {ARdeleteGuardPost &&
                          <FButtonWhite
                            className="flex"
                            onClick={(event) => {
                              event.stopPropagation();
                              setGuardPostDeleteForm({
                                isOpen: true,
                                key: Math.random().toString(36),
                                guardPostName: guardPost.name,
                                guardPostId: guardPost._id,
                              })
                            }}
                          >
                            <TrashIcon
                              className="h-4 w-4"
                            />
                          </FButtonWhite>}
                      </div>} */}

                  </div>
                </td>

                {/* {Позывной компьютера} */}
                <td className="px-1 md:p-2 md:border text-left hidden md:table-cell">
                  <span className="break-all md:break-normal font-bold">{guardPost.callsign}</span>
                </td>

                {/* {Наименование} */}
                <td className="px-1 md:p-2 md:border text-left block md:table-cell">
                  {guardPost.name && <span>{guardPost.name}</span>}
                </td>

                {/* {Адрес} */}
                <td className="px-1 md:p-2 md:border text-left block md:table-cell items-center">
                  {guardPost.address && <span><b className='md:hidden'>Адрес</b> {guardPost.address}</span>}
                </td>

                {/* {НСО} */}
                <td className="px-1 md:p-2 md:border text-left block md:table-cell items-center">
                  {guardPost.manager &&
                    <span className="break-all md:break-normal">
                      <b className='md:hidden'>НСО</b> {[guardPost.manager?.surname, guardPost.manager?.firstName].join(' ')}
                    </span>}
                </td>

                {/* {Охранники} */}
                <td 
                  className="px-1 md:p-2 md:border text-left block md:table-cell items-center hover:text-blue-500"
                  onClick={(event) => {
                    if(guardPost.guardsToday && guardPost.guardsToday.length > 0){
                      event.stopPropagation();
                      setGuardPostShowGuardForm({
                        isOpen: true,
                        key: Math.random().toString(36),
                        index: index,
                        guardPost: guardPost,
                        guardsToday: guardPost.guardsToday
                      })
                    }
                  }}
                >

                  {/* {Список охранников} */}
                  {guardPost.guardsToday && guardPost.guardsToday.length > 0 && guardPost.guardsToday.map(element => {
                    return <p
                      key={guardPost._id + element._id}
                      className="truncate max-w-full md:max-w-[150px]"
                    >
                      {element.label}
                    </p>
                  })}
                </td>

                {/* {Кнопки управления компьютера} */}
                {(AReditGuardPost || ARdeleteGuardPost || ARchangeTimesheetToday) &&
                  <td className="p-2 md:border text-left block md:table-cell md:w-1">
                    <div className='flex justify-end space-x-2'>

                      {/* {Кнопка редактирования смены} */}
                      {ARchangeTimesheetToday &&
                        (ARchangeTimesheetTodayAll || guardPost.manager?._id === MOBXuser.user.id || guardPost.manager?._id === userData.id) &&
                        <FButtonWhite
                          className="flex"
                          onClick={(event) => {
                            event.stopPropagation();
                            setGuardPostSelectGuardForm({
                              isOpen: true,
                              key: Math.random().toString(36),
                              index: index,
                              guardPost: guardPost,
                              guardsToday: guardPost.guardsToday
                            })
                          }}
                        >
                          <UserGroupIcon
                            className="h-4 w-4"
                          />
                        </FButtonWhite>}

                      {AReditGuardPost &&
                        (AReditGuardPostAll || guardPost.manager?._id === MOBXuser.user.id || guardPost.manager?._id === userData.id) &&
                        <FButtonRed
                          className="flex"
                          onClick={(event) => {
                            event.stopPropagation();
                            setGuardPostEditForm({
                              isOpen: true,
                              index: index,
                              operation: 'Изменить',
                              key: Math.random().toString(36),
                              guardPost: guardPost
                            })
                          }}
                        >
                          <PencilAltIcon
                            className="h-4 w-4"
                          />
                          <span className='hidden xl:block'>Изменить</span>
                        </FButtonRed>}

                      {ARdeleteGuardPost &&
                        <FButtonWhite
                          className="flex"
                          onClick={(event) => {
                            event.stopPropagation();
                            setGuardPostDeleteForm({
                              isOpen: true,
                              key: Math.random().toString(36),
                              guardPostCallsign: guardPost.callsign,
                              guardPostId: guardPost._id,
                            })
                          }}
                        >
                          <TrashIcon
                            className="h-4 w-4"
                          />
                          <span className='hidden xl:block'>Удалить</span>
                        </FButtonWhite>}

                    </div>
                  </td>}

              </tr>

            )
          })}

        </tbody>

      </table>

      {/* {Форма добавления/редактирования физ. поста} */}
      <FGuardPostEditForm
        accessRules={accessRules}
        form={guardPostEditForm}
        setForm={setGuardPostEditForm}
        submitAdd={guardPostAdd}
        submitEdit={guardPostEdit}
        users={users}
      />

      {/* {Форма удаления физ. поста} */}
      <FGuardPostDeleteForm
        form={guardPostDeleteForm}
        setForm={setGuardPostDeleteForm}
        submit={guardPostDeleteFormSubmit}
      />

      {/* {Форма выгрузки графика рабочих часов} */}
      <FTimesheetPrintForm
        form={timesheetPrintForm}
        setForm={setTimesheetPrintForm}
        MOBXui={MOBXui}
        errorCallback={errorCallback}
        guardPosts={tableGuardPosts}
      />

      {/* {Форма добавления/редактирования строки охранника} */}
      <FGuardPostSelectGuardForm
        accessRules={accessRules}
        form={guardPostSelectGuardForm}
        setForm={setGuardPostSelectGuardForm}
        submitEdit={guardRowEdit}
        setGuards={(guard) => {
          setGuards(array => {
            array.unshift(guard);
            return array;
          });
        }}
        optionGuards={guards}
        users={users}
        guardPosts={guardPosts}
        MOBXui={MOBXui}
        errorCallback={errorCallback}
      />

      {/* {Форма добавления/редактирования строки охранника} */}
      <FGuardPostShowGuardForm
        form={guardPostShowGuardForm}
        setForm={setGuardPostShowGuardForm}
      />
    </motion.div>
  )

};