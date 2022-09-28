import { ArchiveIcon, PlusIcon, ReplyIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid';
import { motion, useDragControls } from "framer-motion";
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/router";

import { useStore } from "../hight/StoreProvider";
import { ApiError } from "../../middleware/exceptions";
import { FButtonRed } from "../low/FButtonRed";
import { FButtonWhite } from "../low/FButtonWhite";

import { editGuardPost, deleteGuardPost } from '../../src/dtos/dtoGuardPost';
import { changeTimesheet, getTimesheet } from '../../src/dtos/dtoTimesheet';
import { FGuardPostDeleteForm } from '../modal/FGuardPostDeleteForm';
import { FGuardPostEditForm } from '../modal/FGuardPostEditForm';
import { FInputMonth } from '../low/FInputMonth';
import { FSelect } from '../low/FSelect';
import { array } from 'yup';
import { getCurrentMonth, getDaysFromMonth } from '../../src/utils/dateUtils';
import { FGuardRowSelectGuardForm } from '../modal/FGuardRowSelectGuardForm';
import { FModalForm } from '../modal/FModalForm';
import { FGuardRowSelectShiftForm } from '../modal/FGuardRowSelectShiftForm';

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

var isDrag = false;

const defaultDayShift = 8;

var pointTimeout = null;

export default function FFormGuardPostID({ guardPost, guardPosts, guardsData, users, usersAll }) {
  /*-------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  -------------------------------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();

  const [guardPostData, setGuardPostData] = useState(guardPost);

  const [summGuardPostShifts, setSummGuardPostShifts] = useState(guardPost.shifts?.length > 0 ?
    guardPost.shifts.reduce((result, value) => {
      let shiftHours = parseInt(value);
      if (shiftHours > 0) {
        result += shiftHours;
      }
      return result;
    }, 0) : defaultDayShift);

  const [guards, setGuards] = useState(guardsData);

  const [guardPostDataShifts, setGuardPostDataShifts] = useState(guardPost?.shifts?.length > 0 ? [...new Set(guardPost.shifts)].map(String) : [defaultDayShift]);

  const [guardCellHandelMemory, setGuardCellHandelMemory] = useState(guardPost?.shifts?.length > 0 ? guardPost.shifts[0] : defaultDayShift);

  const [error, setError] = useState('');
  /*-------------------------------------------------------------------------------------------------------
      График
  -------------------------------------------------------------------------------------------------------*/

  const [timesheetTableBody, setTimesheetTableBody] = useState([]);

  /*-------------------------------------------------------------------------------------------------------
      Менеджер текущего месяца
  -------------------------------------------------------------------------------------------------------*/
  const optionGuardPostManager = [{
    label: 'Отсутствует', value: 'EMPTY'
  }, ...usersAll?.map((user) => {
    return {
      label: [user.surname, user.firstName].join(' '),
      value: user._id
    }
  })]

  const [inputGuardPostManager, setInputGuardPostManager] = useState('EMPTY');

  /*-------------------------------------------------------------------------------------------------------
      Функция Обновленние данных из базы
  -------------------------------------------------------------------------------------------------------*/

  const currentMonth = getCurrentMonth();

  const [timesheetMonth, setTimesheetMonth] = useState('');

  const [timesheetTableHeader, setTimesheetTableHeader] = useState([]);

  const [timesheetTableFooter, setTimesheetTableFooter] = useState([]);

  const updateDate = async (value) => {

    setError('');

    if (!timesheetChanged && (confirm('Внесённые изменения не сохраняться!') == false)) {
      return;
    }

    setTimesheetChanged(true);

    MOBXui.setLoading();

    setTimesheetMonth(value);

    try {

      if (value) {

        const daysFromMonth = getDaysFromMonth(value);

        setTimesheetTableHeader(daysFromMonth);

        const { guardsRow, optionGuards, manager } = await getTimesheet(guardPost._id, value);

        if (value == currentMonth) {
          setInputGuardPostManager(guardPost.manager ? guardPost.manager._id : 'EMPTY')
        } else {
          setInputGuardPostManager(manager)
        }

        const tableFooter = new Array(daysFromMonth.length + 2).fill(0);

        if (guardsRow && guardsRow.length > 0 && optionGuards && optionGuards.length > 0) {

          setOptionGuards(guards?.reduce((result, guard) => {
            const text = [guard.surname, guard.firstName].join(' ');
            if (!optionGuards.includes(guard._id)) {
              result.push({
                label: text,
                value: guard._id,
                lower: text.toLowerCase()
              })
            }

            return result;
          }, []));
          
          guardsRow.sort((a, b)=>{
            return a.surname.localeCompare(b.surname) || a.firstName.localeCompare(b.firstName)
          })

          setTimesheetTableBody(guardsRow);

          const shiftsCount = 0;
          const hoursCount = 0;

          for (const guard of guardsRow) {
            for (let i = 0; i < guard.timesheetDays.length; i++) {
              let shiftHours = parseInt(guard.timesheetShifts[i]);
              if (shiftHours >= 0) {
                shiftsCount++;
                hoursCount += shiftHours;
                tableFooter[guard.timesheetDays[i]] += shiftHours;
              }
            }
          }

          tableFooter[daysFromMonth.length] = shiftsCount;
          tableFooter[daysFromMonth.length + 1] = hoursCount;

          setTimesheetTableFooter(tableFooter);

          return;

        }

        setTimesheetTableFooter(tableFooter);

      } else {
        setTimesheetTableHeader([]);
        setTimesheetTableFooter([]);
      }

      if (timesheetTableBody.length > 0) {
        setOptionGuards(array => {
          return timesheetTableBody.map(guard => {
            const text = [guard.surname, guard.firstName].join(' ');
            return {
              label: text,
              value: guard._id,
              lower: text.toLowerCase()
            }
          }).concat(array)
        });
      } else {
        setOptionGuards(guards?.map(guard => {
          const text = [guard.surname, guard.firstName].join(' ');
          return {
            label: text,
            value: guard._id,
            lower: text.toLowerCase()
          }
        }));
      }

      setTimesheetTableBody([]);

    } catch (error) {

      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        throw error
      }

    } finally {

      MOBXui.setLoading();

    }
  }

  /*-------------------------------------------------------------------------------------------------------
      Список охранников
  -------------------------------------------------------------------------------------------------------*/
  const [optionGuards, setOptionGuards] = useState([]);

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Модальное окно Формы редактирования Строки охранника----------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  const [guardRowSelectGuardForm, setGuardRowSelectGuardForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Функция добавления Формы редактирования Строки охранника
  -------------------------------------------------------------------------------------------------------*/
  const guardRowAdd = (event,
    inputGuard) => {

    event.preventDefault();

    setError('');

    setTimesheetChanged(false);

    MOBXui.setLoading();

    try {

      setOptionGuards(array => {
        return array.filter(element => !inputGuard.includes(element.value));
      })

      setTimesheetTableBody(array => {
        return array.concat(guards?.filter(element => inputGuard.includes(element._id)));
      });

      setGuardRowSelectGuardForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardRowSelectGuardForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Модальное окно Формы редактирования Смены охранника-----------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  const [guardRowSelectShiftForm, setGuardRowSelectShiftForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Функция добавления Формы редактирования Строки охранника
  -------------------------------------------------------------------------------------------------------*/
  const guardCellSelectShift = (event) => {

    // event.preventDefault();
    
    console.log(event.target.id);

    const guard = guardRowSelectShiftForm.guard;
    const day = guardRowSelectShiftForm.day;

    if (!guard.timesheetDays) {
      guard.timesheetDays = [];
      guard.timesheetShifts = [];
    }

    const index = guard.timesheetDays.indexOf(day);

    var cellHandleAdd = 0;
    var cellHandleDelete = 0;

    if (index == -1) {

      guard.timesheetShifts.push(event.target.id);
      guard.timesheetDays.push(day);
      cellHandleAdd = event.target.id;

    } else {

        cellHandleAdd = event.target.id;
        cellHandleDelete = guard.timesheetShifts[index];
        guard.timesheetShifts[index] = event.target.id;

    }

    var shiftHoursAdd = parseInt(cellHandleAdd);
    shiftHoursAdd = shiftHoursAdd ? shiftHoursAdd : 0;
    var shiftHoursDelete = parseInt(cellHandleDelete);
    shiftHoursDelete = shiftHoursDelete ? shiftHoursDelete : 0;
    
    if (shiftHoursAdd > 0 || shiftHoursDelete > 0) {
      setTimesheetTableFooter(array => {
        array[day] += shiftHoursAdd;
        array[day] -= shiftHoursDelete;

        array[array.length-2] += index == -1 ? 1 : ( shiftHoursDelete > 0 && shiftHoursAdd <= 0 ? -1 : 0 );

        array[array.length-1] += shiftHoursAdd;
        array[array.length-1] -= shiftHoursDelete;

        return [...array];
      });
    }

    setTimesheetTableBody( array => {
      array[guardRowSelectShiftForm.index] = guard;
      return array;
    })
    // setTimesheetTableHeader(array => [...array]);

    setGuardRowSelectShiftForm({ isOpen: false });
    
  }

  /*-------------------------------------------------------------------------------------------------------
      Функция изменения Формы редактирования Строки охранника
  -------------------------------------------------------------------------------------------------------*/
  const guardRowEdit = (event,
    inputGuard) => {

    event.preventDefault();

    setError('');

    setTimesheetChanged(false);

    MOBXui.setLoading();

    try {

      setOptionGuards(array => {
        const text = [guardRowSelectGuardForm.guard.surname, guardRowSelectGuardForm.guard.firstName].join(' ');
        array.unshift({
          label: text,
          value: guardRowSelectGuardForm.guard._id,
          lower: text.toLowerCase()
        });
        return array.filter(element => inputGuard != element.value)
      });

      setTimesheetTableBody(array => {
        array[guardRowSelectGuardForm.index] = guards?.find(element => inputGuard === element._id);
        return array;
      });

      setGuardRowSelectGuardForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardRowSelectGuardForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*-------------------------------------------------------------------------------------------------------
      Функция удаления Строки охранника
  -------------------------------------------------------------------------------------------------------*/
  const guardRowDelete = (event,
    deletedGuard) => {

    event.preventDefault();

    setError('');

    setTimesheetChanged(false);

    MOBXui.setLoading();

    try {

      setOptionGuards(array => {
        const text = [deletedGuard.surname, deletedGuard.firstName].join(' ');
        array.unshift({
          label: text,
          value: deletedGuard._id,
          lower: text.toLowerCase()
        });
        return array;
      });

      setTimesheetTableBody(array => {
        const result = array.filter(value => {
          return deletedGuard._id != value._id;
        })
        return result
      });

      setGuardRowSelectGuardForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardRowSelectGuardForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Функция клика по Строке охранника-----------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  const guardCellHandle = (event, guard, day) => {

    event.preventDefault();

    setError('');

    setTimesheetChanged(false);

    if (!guard.timesheetDays) {
      guard.timesheetDays = [];
      guard.timesheetShifts = [];
    }

    const index = guard.timesheetDays.indexOf(day);

    var cellHandleAdd = 0;
    var cellHandleDelete = 0;

    if (index == -1) {

      guard.timesheetShifts.push(guardCellHandelMemory);
      guard.timesheetDays.push(day);
      cellHandleAdd = guardCellHandelMemory;

    } else {

      const shift = guard.timesheetShifts[index];
      const indexShift = guardPostDataShifts.lastIndexOf(shift);

      if (indexShift + 1 < guardPostDataShifts.length) {

        cellHandleAdd = guardPostDataShifts[indexShift + 1];
        cellHandleDelete = guard.timesheetShifts[index];
        setGuardCellHandelMemory(cellHandleAdd);
        guard.timesheetShifts[index] = cellHandleAdd;

      } else {

        setGuardCellHandelMemory(guardPostDataShifts[0]);
        guard.timesheetDays.splice(index, 1);
        cellHandleDelete = guard.timesheetShifts.splice(index, 1)[0];

      }
    }

    var shiftHoursAdd = parseInt(cellHandleAdd);
    shiftHoursAdd = shiftHoursAdd ? shiftHoursAdd : 0;
    var shiftHoursDelete = parseInt(cellHandleDelete);
    shiftHoursDelete = shiftHoursDelete ? shiftHoursDelete : 0;

    if (shiftHoursAdd > 0 || shiftHoursDelete > 0) {
      setTimesheetTableFooter(array => {

        array[day] += shiftHoursAdd;
        array[day] -= shiftHoursDelete;

        array[array.length-2] += index == -1 || isNaN(cellHandleDelete) ? 1 : ( shiftHoursDelete > 0 && shiftHoursAdd <= 0 ? -1 : 0 );

        array[array.length-1] += shiftHoursAdd;
        array[array.length-1] -= shiftHoursDelete;

        return [...array];
      });
    }

    setTimesheetTableHeader(array => [...array]);

  }

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Функция Сохранения данных таблицы в базу----------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  const [timesheetChanged, setTimesheetChanged] = useState(true);

  const timesheetChangeHandle = async (event) => {

    event.preventDefault();

    setError('');

    MOBXui.setLoading();

    try {

      await changeTimesheet(
        guardPost._id,
        timesheetMonth,
        timesheetTableBody.reduce((result, guardRow) => {
          if (guardRow.timesheetShifts && guardRow.timesheetShifts.length > 0) {
            result.push({
              _id: guardRow._id,
              timesheetShifts: guardRow.timesheetShifts,
              timesheetDays: guardRow.timesheetDays
            })
          }
          return result;
        }, []),
        inputGuardPostManager,
      );

      setTimesheetChanged(true);

    } catch (error) {
      
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        throw error
      }

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Модальное окно Формы редактирования Физ. поста----------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  const [guardPostEditForm, setGuardPostEditForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Функция изменения Формы редактирования Физ. поста
  -------------------------------------------------------------------------------------------------------*/
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

    setError('');

    MOBXui.setLoading();

    try {

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
        inputGuardPostRate
      );

      if (responce.guardPost?.manager._id != guardPostData.manager._id) {
        setTimesheetChanged(false);
      }

      setGuardPostData(responce.guardPost);

      setGuardPostDataShifts(responce.guardPost?.shifts?.length > 0 ? [...new Set(responce.guardPost.shifts)].map(String) : ['8']);

      setGuardCellHandelMemory(responce.guardPost?.shifts?.length > 0 ? responce.guardPost.shifts[0] : '8');

      if (timesheetMonth == currentMonth) {
        setInputGuardPostManager(responce.guardPost.manager ? responce.guardPost.manager._id : 'EMPTY');
      }

      setSummGuardPostShifts(responce.guardPost.shifts?.length > 0 ?
        responce.guardPost.shifts.reduce((result, value) => {
          let shiftHours = parseInt(value);
          if (shiftHours > 0) {
            result += shiftHours;
          }
          return result;
        }, 0) : defaultDayShift);

      setGuardPostEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardPostEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*-------------------------------------------------------------------------------------------------------
      Модальное окно Формы удаления Физ. поста
  -------------------------------------------------------------------------------------------------------*/
  const [guardPostDeleteForm, setGuardPostDeleteForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Функция удаления Формы удаления Физ. поста
  -------------------------------------------------------------------------------------------------------*/
  const guardPostDeleteFormSubmit = async (event, reason) => {

    event.preventDefault();

    setError('');

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        await deleteGuardPost(
          guardPostDeleteForm.guardPostId,
          MOBXuser.user.id,
          reason
        );

        setGuardPostDeleteForm({
          isOpen: false
        });

        router.push('/dashboard/guardPosts');

      }

    } catch (error) {

      errorCallback(error, setGuardPostDeleteForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Параметры передвижения строк таблицы--------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  const [currentIndexDrag, setCurrentIndexDrag] = useState(-1);
  const [currentOffset, setCurrentOffset] = useState(-1);
  const [currentMove, setCurrentMove] = useState(-1);
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Переиспользование функции обработок ошибок--------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  const errorCallback = (error, callback) => {
    if (error instanceof ApiError) {

      if (error.statusCode == 520) {

        callback({ isOpen: false });

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

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Инициализация-------------------------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    setError('');
    setTimesheetChanged(true);
    if (!timesheetMonth) {
      updateDate(currentMonth);
    }
  }, []);

  /*----------------------------------------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/

  return (
    <motion.div
      variants={inputs}
      className="w-full h-full flex flex-col"
    >
      {/* {Данные физ поста} */}
      <div className="p-2">

        {/* {Панель управления} */}
        <div className="w-full flex pt-2 justify-between items-center">

          <button
            className="bg-slate-300 h-10 w-10 flex justify-center items-center rounded-lg
          hover:bg-color_C active:bg-color_B"
            onClick={(event) => {
              event.stopPropagation();
              router.push('/dashboard/guardPosts');
            }}
          >
            <ReplyIcon
              className="h-8 w-8 fill-color_C
            hover:fill-color_F"
            />
          </button>

          <div className="flex flex-row items-center justify-between md:justify-start bg-white mx-2 p-4 rounded-t-md border-t-8 border-red-700">
            {guardPostData.photo && <Image
              className="h-8 w-8 rounded-full"
              width={32}
              height={32}
              src={guardPostData.photo}
              alt=""
            />}
            <p className="text-black ml-1 text-xl font-bold">{[guardPostData.number, guardPostData.callsign].filter(Boolean).join(' ')}</p>
          </div>

          <div className='flex'>

            <FButtonRed
              className="mr-2 flex"
              onClick={(event) => {
                event.stopPropagation();
                setGuardPostEditForm({
                  isOpen: true,
                  operation: 'Изменить',
                  key: Math.random().toString(36),
                  guardPost: guardPostData
                })
              }}
            >
              <PencilAltIcon
                className="h-4 w-4"
              />
            </FButtonRed>

            <FButtonWhite
              className="flex"
              onClick={(event) => {
                event.stopPropagation();
                setGuardPostDeleteForm({
                  isOpen: true,
                  key: Math.random().toString(36),
                  guardPostName: guardPostData.name,
                  guardPostId: guardPostData._id,
                })
              }}
            >
              <TrashIcon
                className="h-4 w-4"
              />
            </FButtonWhite>

          </div>

        </div>

        {/* {Панель информации} */}
        <div className='w-full flex flex-col bg-white p-2 rounded-md'>

          <div className='flex flex-col md:flex-row w-full flex-wrap'>
            {/* Менеджер */}
            {guardPostData.manager &&
              <div className='form-item items-center'>
                <span className='break-all md:break-normal'><b className=''>НСО:</b> {[guardPostData.manager?.surname, guardPostData.manager?.firstName].join(' ')}</span>
              </div>}

            {/* Смены */}
            {guardPostData.shifts && (guardPostData.shifts.length > 0) &&
              <div className="form-item flex items-center ml-auto">
                <b className='pr-1'>Смены</b>
                {guardPostData.shifts?.map((value, i) => {
                  return <span
                    key={i}
                    className='flex items-center justify-center px-2 bg-red-600 select-none
                    font-semibold capitalize text-white text-lg
                    border border-transparent rounded-md'
                  >{value}</span>
                })}
              </div>}
          </div>

          {/* Наименование */}
          {guardPostData.name &&
            <div className='form-item w-full items-center'>
              <span className="break-all md:break-normal"><b className='hidden md:inline-block'>Наименование</b> {guardPostData.name}</span>
            </div>}

          {/* Адрес */}
          {guardPostData.address &&
            <div className='form-item w-full items-center'>
              <span className="break-all md:break-normal"><b className='hidden md:inline-block'>Адрес</b> {guardPostData.address}</span>
            </div>}

          {/* Описание */}
          {guardPostData.description &&
            <div className='form-item w-full items-center p-2 bg-slate-200 rounded-md border-[1px] border-slate-600 text-neutral-800'>
              <span className="break-all md:break-normal">{guardPostData.description}</span>
            </div>}

          {/* Тариф */}
          {guardPostData.rate &&
            <div className='form-item w-full items-center'>
              <span className="break-all md:break-normal"><b className='inline-block'>Тариф:</b> {guardPostData.rate}</span>
            </div>}

          {/* Статус ошибки */}
          {/* {error && <div className="">
            <span className="text-color_C italic break-words">
              {error}
            </span>
          </div>} */}

        </div>

      </div>

      {/* {График} */}
      <div
        className='flex-initial flex z-30 min-h-max max-h-screen overflow-x-auto '
        ref={constraintsRef}
      >
        <div
          className='flex-1 w-0'
        >
          <table className="w-full block md:table table-auto border-separate [border-spacing:0]">

            {/* Заголовок таблицы */}
            <thead className="block md:table-header-group z-50 top-0 sticky">

              <tr
                className="block md:table-row 
                absolute -top-full -left-full 
                md:relative md:top-auto md:left-auto select-none
                "
              >
                <th
                  className="bg-color_B p-2 block md:table-cell
                  text-white font-bold text-center 
                  border-r-[1px] border-b-[1px] 
                  left-0 sticky z-50"
                  rowSpan="2">
                  Охранник
                </th>
                <th
                  className="bg-color_B block md:table-cell
                  font-bold text-left
                  border-r-[1px] border-b-[1px] pt-4 pb-1.5"
                  colSpan={timesheetTableHeader.length}
                >
                  <div className='flex justify-center'>
                    <FInputMonth
                      onChange={updateDate}
                      value={timesheetMonth}
                    />
                    {timesheetMonth && timesheetMonth != currentMonth &&
                      <FSelect
                        className="ml-4 w-max"
                        options={optionGuardPostManager}
                        onChange={(e) => { setInputGuardPostManager(e?.target?.value) }}
                        value={inputGuardPostManager ? inputGuardPostManager : 'EMPTY'}
                      />
                    }
                  </div>
                </th>
                <th
                  className="bg-color_B p-0 px-2 min-w-[35px] block md:table-cell
                  text-white font-bold text-center text-sm
                  border-r-[1px] border-b-[1px] 
                  left-0 sticky z-50"
                  rowSpan="2">
                  <p>с</p>
                  <p>м</p>
                  <p>е</p>
                  <p>н</p>
                  <p>ы</p>
                </th>
                <th
                  className="bg-color_B p-0 px-2 min-w-[35px] block md:table-cell
                  text-white font-bold text-center text-sm
                  border-b-[1px] 
                  left-0 sticky z-50"
                  rowSpan="2">
                  <p>ч</p>
                  <p>а</p>
                  <p>с</p>
                  <p>ы</p>
                </th>
              </tr>

              <tr className="block md:table-row 
              absolute -top-full -left-full 
              md:relative md:left-auto md:top-auto select-none
              ">

                {timesheetTableHeader.map((value, i) => {
                  return <th
                    key={i}
                    className={`p-2 font-bold text-center block md:table-cell min-w-[35px]
                    border-b-[1px] border-r-[1px] ${value == "сб" || value == "вс" ? "bg-amber-100 text-orange-900" : "bg-stone-50 text-orange-700"}
                    ${currentMove == i ? 'saturate-200 drop-shadow-lg ring-1 rounded-sm ring-offset-2' : ''}
                    `}>
                    <p className='text-sm'>{value}</p>
                    <p>{i + 1}</p>
                  </th>;
                })}

              </tr>

            </thead>

            {/* Тело таблицы */}
            {timesheetTableBody.length > 0 &&
              <tbody
                className="block md:table-row-group z-10"
                onPointerLeave={event => {
                  setCurrentMove(-1);
                }}
              >

                {/* Значок перемещения строки */}
                <tr>
                  <motion.td
                    drag="y"
                    dragControls={dragControls}
                    dragConstraints={constraintsRef}
                    onPointerUp={event => {
                      constraintsRef.current.style.touchAction = '';
                      setCurrentIndexDrag(-1);
                      setCurrentOffset(0);
                    }}
                    onDragEnd={(event, info) => {
                      constraintsRef.current.style.touchAction = '';
                      setCurrentIndexDrag(-1);
                      setCurrentOffset(0);
                    }}
                    onDrag={(event, info) => {
                      // event.preventDefault();
                      if (currentIndexDrag > -1 && Math.abs(info.offset.y - currentOffset) > 32) {
                        if (info.offset.y < currentOffset && currentIndexDrag > 0) {
                          setCurrentOffset(info.offset.y);
                          setTimesheetTableBody(array => {
                            const currentElement = array[currentIndexDrag];
                            array[currentIndexDrag] = array[currentIndexDrag - 1];
                            array[currentIndexDrag - 1] = currentElement;
                            setCurrentIndexDrag(currentIndexDrag - 1);
                            return array;
                          })
                        } else if (info.offset.y > currentOffset && currentIndexDrag + 1 < timesheetTableBody.length) {
                          setCurrentOffset(info.offset.y);
                          setTimesheetTableBody(array => {
                            const currentElement = array[currentIndexDrag];
                            array[currentIndexDrag] = array[currentIndexDrag + 1];
                            array[currentIndexDrag + 1] = currentElement;
                            setCurrentIndexDrag(currentIndexDrag + 1);
                            return array;
                          })
                        }
                      }
                    }}
                    className={`text-center z-50 fixed opacity-50
                  `}
                  >
                    {currentIndexDrag >= 0 && <div className="flex flex-row items-center justify-between w-full">

                      {timesheetTableBody[currentIndexDrag].uiAvatarsSrc && <div className="w-8 h-8"><Image
                        className="rounded-full"
                        width={32}
                        height={32}
                        src={timesheetTableBody[currentIndexDrag].uiAvatarsSrc}
                        alt=""
                      /></div>}

                      <p className="font-semibold text-black ml-1 text-xl font-bold select-none w-max">{[timesheetTableBody[currentIndexDrag].surname, timesheetTableBody[currentIndexDrag].firstName].join(' ')}</p>

                    </div>}
                  </motion.td>
                </tr>

                {/* Список строк */}
                {timesheetTableBody.map((guard, index) => {
                  var shiftsCount = 0;
                  var hoursCount = 0;
                  return <tr
                    key={guard._id}
                    className={`block md:table-row mb-2 group ${(index & 1) ? "bg-stone-50" : "bg-stone-200"}`}
                  >
                    <td
                      onPointerDown={event => {
                        constraintsRef.current.style.touchAction = 'none';
                        setCurrentOffset(0);
                        setCurrentIndexDrag(index);
                        dragControls.start(event, { snapToCursor: true })
                      }}
                      onPointerUp={event => {
                        constraintsRef.current.style.touchAction = '';
                        setCurrentIndexDrag(-1);
                        setCurrentOffset(0);
                      }}
                      onPointerCancel={event => {
                        constraintsRef.current.style.touchAction = '';
                        setCurrentIndexDrag(-1);
                        setCurrentOffset(0);
                      }}
                      className={`text-center block md:table-cell border-b-[1px] border-r-[1px] left-0 sticky 
                          group-hover:z-40 group-hover:ring-1 group-hover:rounded-sm group-hover:drop-shadow-lg ring-offset-2 
                          ${(index & 1) ? "bg-stone-50" : "bg-stone-200"}
                          ${currentIndexDrag == index && "drop-shadow-md scale-105 sepia z-40"}
                        `}
                    >
                      <div className="flex flex-row items-center justify-between w-full">

                        {guard.uiAvatarsSrc && <div className="w-8 h-8 select-none"><Image
                          className="rounded-full"
                          width={32}
                          height={32}
                          src={guard.uiAvatarsSrc}
                          alt=""
                        /></div>}

                        <p className="font-semibold text-black ml-1 text-xl font-bold select-none w-max">{[guard.surname, guard.firstName].join(' ')}</p>

                        <div className='flex mx-2'>
                          <button
                            className="flex disabled:opacity-25 mr-2"
                            disabled={optionGuards.length <= 1}
                            onClick={() => {
                              setGuardRowSelectGuardForm({
                                isOpen: true,
                                index: index,
                                operation: 'Изменить',
                                key: Math.random().toString(36),
                                guard: guard
                              })
                            }}
                          >
                            <PencilAltIcon
                              className="h-6 w-6 fill-orange-800"
                            />
                          </button>
                          <button
                            className="flex"
                            onClick={(event) => guardRowDelete(event, guard)}
                          >
                            <TrashIcon
                              className="h-6 w-6"
                            />
                          </button>
                        </div>

                      </div>
                    </td>
                    {timesheetTableHeader.map((value, i) => {
                      const indexInTimesheetDays = guard.timesheetDays?.indexOf(i);
                      var shift;
                      if (indexInTimesheetDays >= 0) {
                        shift = guard.timesheetShifts[indexInTimesheetDays];
                        let shiftHours = parseInt(shift);
                        if (shiftHours >= 0) {
                          shiftsCount++;
                          hoursCount += shiftHours;
                        }
                      }
                      return <td
                        key={i}
                        className={`text-center block md:table-cell  border-r-[1px] last:border-r-[0px] select-none 
                        ${value == "сб" || value == "вс" ? "bg-amber-100" : ""}
                        ${(index & 1) ? "border-y-[1px]" : "border-stone-300"}
                        `}
                        onPointerDown={(event) => {
                          pointTimeout = setTimeout(()=>{
                            setGuardRowSelectShiftForm({
                              isOpen: true,
                              guard: guard,
                              index: index,
                              day: i
                            })
                            pointTimeout = null;
                          }, 1000);
                        }}                        
                        onPointerUp={(event) => {  
                          if (pointTimeout){
                            clearTimeout(pointTimeout);
                            guardCellHandle(event, guard, i)
                            pointTimeout = null;
                          }
                        }}
                        onPointerLeave={(event) => {  
                          if (pointTimeout){
                            clearTimeout(pointTimeout);
                            pointTimeout = null;
                          }
                        }}
                        onPointerCancel={(event) => {  
                          if (pointTimeout){
                            clearTimeout(pointTimeout);
                            pointTimeout = null;
                          }
                        }}
                        onPointerMove={event => {
                          setCurrentMove(i);
                        }
                        }
                      >
                        {shift}
                      </td>;
                    })}
                    <td className="text-center font-bold block md:table-cell border-b-[1px] border-r-[1px] last:border-r-[0px] select-none">
                      {shiftsCount > 0 ? shiftsCount : null}
                    </td>
                    <td className="text-center font-bold block md:table-cell border-b-[1px] border-r-[1px] last:border-r-[0px] select-none">
                      {hoursCount > 0 ? hoursCount : null}
                    </td>
                  </tr>
                })}

              </tbody>}

            {/* Итоги таблицы */}
            <tfoot className='block md:table-footer-group select-none'>

              <tr
                className={`block md:table-row mb-2 group ${(timesheetTableBody.length & 1) ? "bg-stone-50" : "bg-stone-200"}`}
              >

                <td className="bg-color_B p-2 block md:table-cell left-0 sticky border-r-[1px] z-50" rowSpan="2">
                  <button
                    className='flex items-center justify-center align-middle text-white text-center w-full disabled:opacity-25'
                    onClick={(event) => {
                      event.stopPropagation();
                      setGuardRowSelectGuardForm({
                        isOpen: true,
                        operation: 'Добавить',
                        key: Math.random().toString(36)
                      })
                    }}
                    disabled={optionGuards.length <= 1}
                  >
                    <PlusIcon className='w-4 h-4' />
                    <span>Добавить</span>
                  </button>
                </td>

                {timesheetTableFooter.map((value, i) => {
                  const isDayOff = i < timesheetTableHeader.length && (timesheetTableHeader[i] == "сб" || timesheetTableHeader[i] == "вс")
                  return <td
                    key={i}
                    className={`text-center text-sm block md:table-cell min-w-[35px]
                      border-b-[1px] border-r-[1px] 
                      ${i >= timesheetTableHeader.length ? "font-bold" : ""}
                      ${value > 0 && i < timesheetTableHeader.length ? (
                        value < summGuardPostShifts ?
                          ( isDayOff ? " bg-rose-300 text-orange-900" : " bg-rose-200 text-orange-700" )
                          : (
                            value > summGuardPostShifts ?
                              (isDayOff ? " bg-orange-300 text-rose-900" : " bg-orange-200 text-rose-700")
                              :
                              (isDayOff ? " bg-emerald-300 text-orange-900" : " bg-emerald-200 text-orange-700")
                          )
                      ) : (
                        isDayOff ? " bg-amber-100 text-orange-900" : " bg-stone-50 text-orange-700"
                      )}`}>
                    <p>{value > 0 ? value : ''}</p>
                  </td>;
                })}

              </tr>

              <tr className="block md:table-row absolute -top-full md:top-auto -left-full 
                md:left-auto md:relative z-10">

                <td className="bg-color_B p-2 block md:table-cell text-left text-red-700 italic break-words" colSpan={timesheetTableHeader.length - 3}>
                  {/* <span className=""> */}
                    {error}
                  {/* </span> */}
                </td>

                <td
                  className="bg-color_B p-2 block md:table-cell right-0 sticky"
                  colSpan={5}
                >
                  <div className='flex justify-center'>
                    <FButtonRed
                      className="flex py-1"
                      onClick={timesheetChangeHandle}
                      disabled={timesheetChanged}
                    >
                      <ArchiveIcon
                        className="h-6 w-6"
                      />
                      Сохранить
                    </FButtonRed>

                  </div>
                </td>

              </tr>

            </tfoot>

          </table>
        </div>
      </div>

      {/* {Форма добавления/редактирования строки охранника} */}
      <FGuardRowSelectGuardForm
        form={guardRowSelectGuardForm}
        setForm={setGuardRowSelectGuardForm}
        submitAdd={guardRowAdd}
        submitEdit={guardRowEdit}
        optionGuards={optionGuards}
        setGuards={setGuards}
        users={users}
        guardPosts={guardPosts}
        MOBXui={MOBXui}
        errorCallback={errorCallback}
      />

      {/* {Форма редактирования ячейки} */}
      <FGuardRowSelectShiftForm
        form={guardRowSelectShiftForm}
        setForm={setGuardRowSelectShiftForm}
        submitHandle={guardCellSelectShift}
      />

      {/* {Форма добавления/редактирования физ. поста} */}
      <FGuardPostEditForm
        form={guardPostEditForm}
        setForm={setGuardPostEditForm}
        submitEdit={guardPostEdit}
        users={users}
      />

      {/* {Форма удаления физ. поста} */}
      <FGuardPostDeleteForm
        form={guardPostDeleteForm}
        setForm={setGuardPostDeleteForm}
        submit={guardPostDeleteFormSubmit}
      />

    </motion.div>
  )

};