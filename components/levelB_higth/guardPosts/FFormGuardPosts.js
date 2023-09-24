import { CalendarIcon, PlusIcon, PencilSquareIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";
import Image from "next/legacy/image";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from "next/router";
import useSWR from 'swr';
import { fetchAuthMethod } from "../../../middleware/requests";

import { useStore } from "../../levelA/StoreProvider";
import { ApiError } from "../../../middleware/exceptions";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";

import { createGuardPost, editGuardPost, deleteGuardPost } from '../../../src/dtos/dtoGuardPost';
import { FGuardPostDeleteForm } from '../../levelD_modal/guardPost/FGuardPostDeleteForm';
import { FGuardPostEditForm } from '../../levelD_modal/guardPost/FGuardPostEditForm';
import { FGuardPostPrintForm } from '../../levelD_modal/guardPost/FGuardPostPrintForm';
import { FFilterText } from '../../levelE_low/FFilterText';
import { FGuardPostSelectGuardForm } from '../../levelD_modal/guardPost/FGuardPostSelectGuardForm';
import { FGuardPostShowGuardForm } from '../../levelD_modal/guardPost/FGuardPostShowGuardForm';
import { changeTimesheetToday2 } from '../../../src/dtos/dtoTimesheet';
import { FTooltip } from '../../levelE_low/FTooltip';

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

    case 'rate':
      return (a.rate - b.rate) * invert;

    case 'manager':
      return (a.manager?.surname.localeCompare(b.manager?.surname) || a.manager?.firstName.localeCompare(b.manager?.firstName)) * invert;

    default:
      break;
  }
}

export default function FFormGuardPosts({ accessRules, userData, tableGuardPosts, 
  setTableGuardPosts, setTableGuardPostsArchive, guardsData }) {
  /*----Использование глобальных данных-------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();

  // const [error, setError] = useState('');

  /*----Определение правил доступа------------------------------------------------------------------------------------*/
  const ARcreateGuardPost = accessRules.includes('createGuardPost');
  const AReditGuardPost = accessRules.includes('editGuardPost');
  const AReditGuardPostRate = !accessRules.includes('editGuardPost/apiBlock/rate');
  const AReditGuardPostAll = !accessRules.includes('editGuardPost/userCompare/manager');
  const ARdeleteGuardPost = accessRules.includes('deleteGuardPost');
  const ARgetGuardPostPrint = accessRules.includes('getTimesheetPrint')
    || accessRules.includes('getTimesheetPrintForDay')
    || accessRules.includes('getTimesheetPrintForMonthPart')
    || accessRules.includes('getTimesheetPrintForMonthFul')
    || accessRules.includes('reportGuardPosts');
  const ARchangeTimesheetToday = accessRules.includes('changeTimesheetToday');
  const ARchangeTimesheetTodayAll = !accessRules.includes('changeTimesheetToday/userCompare/guardPostManagers');
  const ARgetGuardPostID = accessRules.includes('guardPosts(?=.)/');
  // console.log('accessRules %o',accessRules);

  /*----Заголовки таблицы------------------------------------------------------------------------------------------------*/
  const constTableHead = [
    { value: 'number', label: '№' },
    { value: 'callsign', label: 'Позывной' },
    { value: 'name', label: 'Наименование' },
    { value: 'address', label: 'Адрес' },
    AReditGuardPost && AReditGuardPostRate ? { value: 'rate', label: 'Тариф' } : null,
    { value: 'manager', label: 'НСО' },
    { value: 'guards', label: 'Охранники' },
  ].filter(Boolean);

  /*----Данные таблицы------------------------------------------------------------------------------------------------*/
  const [renderTableGuardPosts, setRenderTableGuardPosts] = useState(tableGuardPosts ? [...tableGuardPosts] : []);

  const [guards, setGuards] = useState(guardsData.map(guard => {
    guard.label = [guard.surname, guard.firstName, ...guard.telephone].join(' ');
    guard.lower = guard.label.toLowerCase().replace(/(\s)|(\()|(\))|(\+)/g, '');
    return guard;
  }));

  /*----Сортировка таблицы--------------------------------------------------------------------------------------------*/
  const [sortingRule, setSortingRule] = useState();

  const sortingTable = (rule) => {

    if (rule == constTableHeadControl.value) {
      setRenderTableGuardPosts(array => {
        return [...array.sort((a, b) => {
          return (a.manager?._id === MOBXuser?.user?.id) * -1;
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
  const filterringTimeout = useRef();

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
        if (index) {
          responce.guardPost.guardsToday = array[index].guardsToday;
          array[index] = responce.guardPost;
        }
        return array;
      });

      // Обновляем отображаемую таблицу
      setRenderTableGuardPosts(array => {
        responce.guardPost.guardsToday = array[guardPostEditForm.index].guardsToday;
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

        // Обнавляем таблицу архива
        setTableGuardPostsArchive(array => {
          array.unshift(responce.guardPost);
          return array;
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

  /*----Модальное окно Формы выгрузки графика рабочих часов-----------------------------------------------------------*/
  const [timesheetPrintForm, setTimesheetPrintForm] = useState({
    isOpen: false
  });

  /*----Модальное окно Формы редактирования Физ. поста----------------------------------------------------------------*/
  const [guardPostSelectGuardForm, setGuardPostSelectGuardForm] = useState({
    isOpen: false
  });

  /*----Перезапуск обновления данных таблицы--------------------------------------------------------------------------*/
  const { 
    data: dataTimesheetToday, 
    error: errorTimesheetToday, 
    isLoading: isLoadingTimesheetToday,
    mutate: mutateTimesheetToday,
  } = useSWR('/method/timesheet/getTimesheetToday', fetchAuthMethod);

  useEffect(()=>{

    // console.log('useSWR %o %o %o', 
    //   dataTimesheetToday, 
    //   errorTimesheetToday, 
    //   isLoadingTimesheetToday);

    MOBXui.setUpdateState(isLoadingTimesheetToday);
    if(errorTimesheetToday){
      MOBXui.setUpdateError(errorTimesheetToday.message);
    }else if(dataTimesheetToday ){

      // Обновляем таблицу в памяти
      setTableGuardPosts(array => {

        const result = array.map(element => {

          let findA = dataTimesheetToday.timesheetToday.find(value => value._id == element._id);

          if (findA && findA.today && findA.today.length > 0) {
            let guardsToday = guards.filter(guard => findA.today.includes(guard._id));
            element.guardsToday = guardsToday;
          } else {
            element.guardsToday = [];
          }

          return element;
        });

        return result;
      });

      // Обновляем отображаемую таблицу
      setRenderTableGuardPosts(array => {
        return [...array];
      });

    }

  }, [dataTimesheetToday, errorTimesheetToday, isLoadingTimesheetToday])

  /*----Функция изменения охранника за текущую смену Физ. поста-------------------------------------------------------*/
  const guardRowEdit2 = (event,
    inputGuard) => {

    event.preventDefault();

    try {

      const guardsToday = inputGuard.map(element => element._id);

      mutateTimesheetToday(
        changeTimesheetToday2(
          guardPostSelectGuardForm.guardPost._id, 
          guardPostSelectGuardForm.guardPost?.manager?._id, 
          guardsToday),
        {
          optimisticData: data=>({
            timesheetToday: data.timesheetToday.map(element=>element._id===guardPostSelectGuardForm.guardPost._id ? {
              ...element,
              today: guardsToday
            } : element)
          }),
          rollbackOnError: true,
          populateCache: true,
          revalidate: false
        }
      )

      // Закрываем модальное окно
      setGuardPostSelectGuardForm({ isOpen: false });
    } catch (error) {

      MOBXui.setUpdateError(error.message);

    } finally {

    }
  }

  /*----Модальное окно Формы просмотра Строки охранника---------------------------------------------------------------*/
  const [guardPostShowGuardForm, setGuardPostShowGuardForm] = useState({
    isOpen: false
  });

  /*----Переиспользование функции обработок ошибок--------------------------------------------------------------------*/
  const errorCallback = (error, callback) => {
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

    } else
      throw error

  }

  /*----Референс подсказки--------------------------------------------------------------------------------------------*/
  const getGuardPostIDtimeout = useRef();
  const [tooltipReference, setTooltipReference] = useState(null);

  /*------------------------------------------------------------------------------------------------------------------*/
  useEffect(() => {

    return () => {
      filterringTimeout.current && clearTimeout(filterringTimeout.current);
      getGuardPostIDtimeout.current && clearInterval(getGuardPostIDtimeout.current);

      MOBXui.setUpdateState(false);
    }
  }, []);

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
          {ARgetGuardPostPrint && tableGuardPosts?.length > 0 && (<button
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
              filterringTimeout.current && clearTimeout(filterringTimeout.current);
              filterringTimeout.current = setTimeout(() => filteringTable(e.target.value), 500);
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
                className={`rounded-md md:border-none block md:table-row bg-color_G mb-2 ${ARgetGuardPostID && 'cursor-pointer'}`}
                key={guardPost._id}
                onPointerDown={(event) => {
                  if (ARgetGuardPostID) {
                    event.stopPropagation();
                    getGuardPostIDtimeout.current && clearTimeout(getGuardPostIDtimeout.current);
                    getGuardPostIDtimeout.current = setTimeout(() => {
                      router.push(`/dashboard/guardPosts/${guardPost._id}`);
                      getGuardPostIDtimeout.current && clearTimeout(getGuardPostIDtimeout.current);
                    }, 1000);
                  }
                }}
                onPointerUp={(event) => {
                  getGuardPostIDtimeout.current && clearTimeout(getGuardPostIDtimeout.current);
                }}
                onPointerLeave={(event) => {
                  getGuardPostIDtimeout.current && clearTimeout(getGuardPostIDtimeout.current);
                }}
                onPointerCancel={(event) => {
                  getGuardPostIDtimeout.current && clearTimeout(getGuardPostIDtimeout.current);
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

                {/* {Тариф} */}
                {AReditGuardPost && AReditGuardPostRate && <td className="px-1 md:p-2 md:border text-left block md:table-cell items-center">
                  {guardPost.rate &&
                    <span className="break-all md:break-normal">
                      <b className='md:hidden'>Тариф</b> {guardPost.rate}
                    </span>}
                </td>}

                {/* {НСО} */}
                <td className="px-1 md:p-2 md:border text-left block md:table-cell items-center">
                  {guardPost.manager &&
                    <span className="break-all md:break-normal">
                      <b className='md:hidden'>НСО</b> {[guardPost.manager?.surname, guardPost.manager?.firstName].join(' ')}
                    </span>}
                </td>

                {/* {Охранники} */}
                <td
                  className="px-1 md:p-2 md:border text-left block md:table-cell items-center hover:text-blue-500 cursor-pointer"
                  onClick={(event) => {
                    if (guardPost.guardsToday && guardPost.guardsToday.length > 0) {
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
                  {guardPost.guardsToday && guardPost.guardsToday.length > 0 &&
                    <div
                      className='block p-2 md:p-0 bg-slate-200 md:bg-inherit rounded-md border-[1px] md:border-0 border-slate-600 text-neutral-800'
                    >{
                      guardPost.guardsToday.map(element => {
                        return <p
                          key={guardPost._id + element._id}
                          className="truncate max-w-full md:max-w-[150px]"
                        >
                          {element.label}
                        </p>
                      }) }
                  </div>}
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
                          onPointerEnter={event => setTooltipReference({ target: event.currentTarget, text: `Редактировать смену - ${[guardPost.callsign, guardPost.number].join(' ')}` })}
                          onPointerLeave={() => setTooltipReference(null)}
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
                          onPointerEnter={event => setTooltipReference({ target: event.currentTarget, text: `Редактировать физ. пост - ${[guardPost.callsign, guardPost.number].join(' ')}` })}
                          onPointerLeave={() => setTooltipReference(null)}
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
                          <PencilSquareIcon
                            className="h-4 w-4"
                          />
                          {/* <span className='hidden xl:block'>Изменить</span> */}
                        </FButtonRed>}

                      {ARdeleteGuardPost &&
                        <FButtonWhite
                          className="flex"
                          onPointerEnter={event => setTooltipReference({ target: event.currentTarget, text: `Удалить физ. пост - ${[guardPost.callsign, guardPost.number].join(' ')}` })}
                          onPointerLeave={() => setTooltipReference(null)}
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
                          {/* <span className='hidden xl:block'>Удалить</span> */}
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
        // users={users}
      />

      {/* {Форма удаления физ. поста} */}
      <FGuardPostDeleteForm
        form={guardPostDeleteForm}
        setForm={setGuardPostDeleteForm}
        submit={guardPostDeleteFormSubmit}
      />

      {/* {Форма выгрузки графика рабочих часов} */}
      <FGuardPostPrintForm
        accessRules={accessRules}
        form={timesheetPrintForm}
        setForm={setTimesheetPrintForm}
        MOBXui={MOBXui}
        MOBXuser={MOBXuser}
        errorCallback={errorCallback}
        guardPosts={tableGuardPosts}
      />

      {/* {Форма добавления/редактирования строки охранника} */}
      <FGuardPostSelectGuardForm
        accessRules={accessRules}
        form={guardPostSelectGuardForm}
        setForm={setGuardPostSelectGuardForm}
        submitEdit={guardRowEdit2}
        setGuards={(guard) => {
          setGuards(array => {
            array.unshift(guard);
            return array;
          });
        }}
        optionGuards={guards}
        MOBXui={MOBXui}
        errorCallback={errorCallback}
      />

      {/* {Форма добавления/редактирования строки охранника} */}
      <FGuardPostShowGuardForm
        form={guardPostShowGuardForm}
        setForm={setGuardPostShowGuardForm}
      />

      {/* {Подсказка таблицы} */}
      <FTooltip
        reference={tooltipReference}
      />
    </motion.div>
  )

};