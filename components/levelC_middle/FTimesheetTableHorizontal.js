import { ArchiveBoxArrowDownIcon, PencilSquareIcon, PlusIcon, StopIcon, TrashIcon } from '@heroicons/react/24/solid';
import { motion, useDragControls } from "framer-motion";
import Image from "next/legacy/image";
import { useEffect, useRef, useState } from 'react';

import { ApiError } from "../../middleware/exceptions";
import { FButtonRed } from "../levelE_low/FButtonRed";
import { changeTimesheet, getTimesheet } from '../../src/dtos/dtoTimesheet';
import { getCurrentMonth, getDaysFromMonth } from '../../src/utils/dateUtils';
import { FTimesheetTableSelectGuardForm } from '../levelD_modal/timesheetTable/FTimesheetTableSelectGuardForm';
import { FTimesheetTableSelectShiftForm } from '../levelD_modal/timesheetTable/FTimesheetTableSelectShiftForm';
import { FInputMonth } from '../levelE_low/FInputMonth';
import { FSelect } from '../levelE_low/FSelect';

var pointTimeout = null;

const defaultDayShift = 8;

const currentMonth = getCurrentMonth();

export default function FTimesheetTableHorizontal({ accessRules, userData, MOBXuser, MOBXui, errorCallback, guardPost, guardPosts, guardsData, users, usersAll }) {

  /*-------------------------------------------------------------------------------------------------------
      Определение правил доступа
  -------------------------------------------------------------------------------------------------------*/

  let letARchangeTimesheet = accessRules.includes('changeTimesheet');
  let letARchangeTimesheetAll = accessRules.includes('changeTimesheet/userCompare/userCompare');

  const ARchangeTimesheet = ((letARchangeTimesheet && !letARchangeTimesheetAll)
    || (letARchangeTimesheet && guardPost.manager._id === MOBXuser.user.id)
    || (letARchangeTimesheet && guardPost.manager._id === userData.id));

  const ARchangeTimesheetManager = !accessRules.includes('changeTimesheet/editBlock/manager');
  const ARchangeTimesheetRate = !accessRules.includes('changeTimesheet/editBlock/rate');

  /*-------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  -------------------------------------------------------------------------------------------------------*/

  const [guards, setGuards] = useState(guardsData);

  const [error, setError] = useState('');

  const [summGuardPostShifts, setSummGuardPostShifts] = useState(defaultDayShift);

  const [guardPostDataShifts, setGuardPostDataShifts] = useState([defaultDayShift]);

  const [guardCellHandelMemory, setGuardCellHandelMemory] = useState(defaultDayShift);

  const [inputGuardPostManager, setInputGuardPostManager] = useState('EMPTY');

  const [timesheetMonth, setTimesheetMonth] = useState('');

  const [timesheetChanged, setTimesheetChanged] = useState(true);

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

  /*-------------------------------------------------------------------------------------------------------
      Тариф текущего месяца
  -------------------------------------------------------------------------------------------------------*/

  const [inputGuardPostRate, setInputGuardPostRate] = useState(null);

  /*-------------------------------------------------------------------------------------------------------
      Функция Обновленние данных из базы
  -------------------------------------------------------------------------------------------------------*/

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

        const { guardsRow, optionGuards, manager, rate } = await getTimesheet(
          guardPost._id, 
          guardPost.manager ? guardPost.manager._id : undefined, 
          value, );

        // console.log('guardPost.rate %o', rate);

        if (value == currentMonth) {
          setInputGuardPostManager(guardPost.manager ? guardPost.manager._id : 'EMPTY');
          setInputGuardPostRate(guardPost.rate ? guardPost.rate : null)
        } else {
          setInputGuardPostManager(manager);
          setInputGuardPostRate(rate ? rate : null);
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

          guardsRow.sort((a, b) => {
            return a.surname.localeCompare(b.surname) || a.firstName.localeCompare(b.firstName)
          })

          setTimesheetTableBody(guardsRow);

          var shiftsCount = 0;
          var hoursCount = 0;

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

    setTimesheetChanged(false);
    
    setGuardPostDataShifts(array => {
      array.push(event.target.id);
      return array;
    })

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

        array[array.length - 2] += index == -1 ? 1 : (shiftHoursDelete > 0 && shiftHoursAdd <= 0 ? -1 : 0);

        array[array.length - 1] += shiftHoursAdd;
        array[array.length - 1] -= shiftHoursDelete;

        return [...array];
      });
    }

    setTimesheetTableBody(array => {
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

      setTimesheetTableFooter(array => {

        guardRowSelectGuardForm.guard.timesheetDays?.forEach(day => {
          array[day] -= guardRowSelectGuardForm.guard.timesheetShifts[day];
        });

        inputGuard.timesheetDays?.forEach(element => {
          array[day] += inputGuard.timesheetShifts[day];
        });

        return array;
      })

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

      setTimesheetTableFooter(array => {

        deletedGuard.timesheetDays?.forEach(day => {
          array[day] -= deletedGuard.timesheetShifts[day];
        });

        return array;
      })

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

        array[array.length - 2] += index == -1 || isNaN(cellHandleDelete) ? 1 : (shiftHoursDelete > 0 && shiftHoursAdd <= 0 ? -1 : 0);

        array[array.length - 1] += shiftHoursAdd;
        array[array.length - 1] -= shiftHoursDelete;

        return [...array];
      });
    }

    setTimesheetTableHeader(array => [...array]);

  }

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Функция очистки Строк охранников------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  const guardCellsClear = (event) => {

    event.preventDefault();

    setError('');

    setTimesheetChanged(false);

    setTimesheetTableBody(array => {
      array.forEach((guard) => {
        guard.timesheetDays = [];
        guard.timesheetShifts = [];
      })
      return array;
    })

    setTimesheetTableFooter(array => {
      return array.fill(0);
    })

  }

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Функция Сохранения данных таблицы в базу----------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  const timesheetChangeHandle = async (event) => {

    event.preventDefault();

    setError('');

    MOBXui.setLoading();

    try {

      await changeTimesheet(
        guardPost._id,
        guardPost.manager ? guardPost.manager._id : undefined, 
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
        ARchangeTimesheetManager ? inputGuardPostManager : undefined, 
        ARchangeTimesheetRate ? inputGuardPostRate : undefined
      );

      setTimesheetChanged(true);

    } catch (error) {

      if (error instanceof ApiError) {
        console.log('error instanceof ApiError');
        setError(error.message)
      } else {
        console.log('error not instanceof ApiError');
        throw error
      }

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
  ----Инициализация-------------------------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    setError('');

    // setTimesheetChanged(true);

    setGuardPostDataShifts(guardPost.shifts?.length > 0 ? [...new Set(guardPost.shifts)].map(String) : ['8']);

    setGuardCellHandelMemory(guardPost.shifts?.length > 0 ? guardPost.shifts[0] : '8');

    if (timesheetMonth == currentMonth) {

      if (inputGuardPostManager != guardPost.manager?._id) {
        setTimesheetChanged(false);
      }

      setInputGuardPostManager(guardPost.manager ? guardPost.manager._id : 'EMPTY');
      setInputGuardPostRate(guardPost.rate);

    }

    setSummGuardPostShifts(guardPost.shifts?.length > 0 ?
      guardPost.shifts.reduce((result, value) => {
        let shiftHours = parseInt(value);
        if (shiftHours > 0) {
          result += shiftHours;
        }
        return result;
      }, 0) : defaultDayShift);

    if (!timesheetMonth) {
      updateDate(currentMonth);
    }

    return () => {

      setSummGuardPostShifts(defaultDayShift);

      setGuardPostDataShifts([defaultDayShift]);

      setGuardCellHandelMemory(defaultDayShift);

    }

  }, [guardPost]);

  /*----------------------------------------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/

  return (
    <>

      {/* {Таблица графика} */}
      <div
        className='flex-initial flex z-30 min-h-max max-h-screen overflow-x-auto'
        ref={constraintsRef}
      >
        <div
          className='flex-1 w-0'
        >
          <table className="w-full table table-auto border-separate [border-spacing:0]">

            {/* Заголовок таблицы */}
            <thead className="table-header-group z-50 top-0 sticky">

              {/* Заголовки и кнопки управления */}
              <tr
                className="table-row
                relative top-auto left-auto select-none
                "
              >
                {/* Охранник */}
                <th
                  className="bg-color_B p-2 table-cell
                  text-white font-bold text-center 
                  border-r-[1px] border-b-[1px] 
                  left-0 sticky z-50"
                  rowSpan="2">
                  Охранник
                </th>

                {/* Кнопки управления */}
                <th
                  className="bg-color_B table-cell
                  font-bold text-left
                  border-r-[1px] border-b-[1px] pt-4 pb-1.5"
                  colSpan={timesheetTableHeader.length}
                >
                  <div className='flex justify-center space-x-2'>
                    <FInputMonth
                      onChange={updateDate}
                      value={timesheetMonth}
                    // className='flex-initial'
                    />
                    {timesheetMonth && timesheetMonth != currentMonth &&
                      <>
                        {/* НСО */}
                        {ARchangeTimesheet && ARchangeTimesheetManager &&
                          <FSelect
                            options={optionGuardPostManager}
                            onChange={(e) => {
                              setTimesheetChanged(false);
                              setInputGuardPostManager(e?.target?.value)
                            }}
                            className='w-fit'
                            value={inputGuardPostManager ? inputGuardPostManager : 'EMPTY'}
                          />}

                        {!(ARchangeTimesheet && ARchangeTimesheetManager) && inputGuardPostManager && inputGuardPostManager != 'EMPTY' &&
                          <span
                            className="block w-fit text-white font-bold text-center"
                          >
                            НСО {optionGuardPostManager.find(element => element.value == inputGuardPostManager).label}.
                          </span>}

                        {/* Тариф */}
                        {ARchangeTimesheet && ARchangeTimesheetRate &&
                          <input
                            id='guard-post-rate'
                            type="number"
                            name='guard-post-rate'
                            placeholder='Тариф'
                            value={inputGuardPostRate ? inputGuardPostRate : ''}
                            onChange={(e) => {
                              setTimesheetChanged(false);
                              setInputGuardPostRate(parseFloat(e.target.value));
                            }}
                            className="border border-gray-300 block w-32
                            focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
                            rounded-md shadow-sm disabled:bg-gray-100"
                          />}

                        {!(ARchangeTimesheet && ARchangeTimesheetRate) && inputGuardPostRate &&
                          <span
                            className="block w-fit text-white font-bold text-center"
                          >
                            Тариф {inputGuardPostRate}тг.
                          </span>}

                      </>}
                  </div>
                </th>

                {/* Смены */}
                <th
                  className="bg-color_B p-0 px-2 min-w-[35px] table-cell
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

                {/* Часы */}
                <th
                  className="bg-color_B p-0 px-2 min-w-[35px] table-cell
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

              {/* Числа месяца*/}
              <tr className="table-row
              relative left-auto top-auto select-none
              ">

                {timesheetTableHeader.map((value, i) => {
                  return <th
                    key={i}
                    className={`p-2 font-bold text-center table-cell min-w-[35px]
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
                className="table-row-group z-10"
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
                    className={`table-row mb-2 group ${(index & 1) ? "bg-stone-50" : "bg-stone-200"}`}
                  >
                    {/* Инициалы */}
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
                      className={`text-center table-cell border-b-[1px] border-r-[1px] left-0 sticky 
                          group-hover:z-40 group-hover:ring-1 group-hover:rounded-sm group-hover:drop-shadow-lg ring-offset-2 
                          ${(index & 1) ? "bg-stone-50" : "bg-stone-200"}
                          ${currentIndexDrag == index && "drop-shadow-md scale-105 sepia z-40"}
                        `}
                    >
                      <div className={`flex flex-row items-center w-full ${ARchangeTimesheet && 'justify-between'}`}>

                        {/* Аватар */}
                        {guard.uiAvatarsSrc && <div className="w-8 h-8 select-none"><Image
                          className="rounded-full"
                          width={32}
                          height={32}
                          src={guard.uiAvatarsSrc}
                          alt=""
                        /></div>}

                        {/* Инициалы */}
                        <p className="font-semibold text-black ml-1 text-xl font-bold select-none w-max">{[guard.surname, guard.firstName].join(' ')}</p>

                        {/* Кнопки изменения и удаления строки охранников */}

                        {ARchangeTimesheet &&
                          <div className='flex mx-2'>

                            {/* Кнопка изменения строки охранника */}
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
                              <PencilSquareIcon
                                className="h-6 w-6 fill-orange-800"
                              />
                            </button>

                            {/* Кнопка удаления строки охранника */}
                            <button
                              className="flex"
                              onClick={(event) => guardRowDelete(event, guard)}
                            >
                              <TrashIcon
                                className="h-6 w-6"
                              />
                            </button>
                          </div>}

                      </div>
                    </td>

                    {/* Смены */}
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
                      if (ARchangeTimesheet) {
                        return <td
                          key={i}
                          className={`text-center table-cell  border-r-[1px] last:border-r-[0px] select-none 
                        ${value == "сб" || value == "вс" ? "bg-amber-100" : ""}
                        ${(index & 1) ? "border-y-[1px]" : "border-stone-300"}
                        `}
                          onPointerDown={(event) => {
                            pointTimeout = setTimeout(() => {
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
                            if (pointTimeout) {
                              clearTimeout(pointTimeout);
                              guardCellHandle(event, guard, i)
                              pointTimeout = null;
                            }
                          }}
                          onPointerLeave={(event) => {
                            if (pointTimeout) {
                              clearTimeout(pointTimeout);
                              pointTimeout = null;
                            }
                          }}
                          onPointerCancel={(event) => {
                            if (pointTimeout) {
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
                      }else {
                        return <td
                          key={i}
                          className={`text-center table-cell  border-r-[1px] last:border-r-[0px] select-none 
                        ${value == "сб" || value == "вс" ? "bg-amber-100" : ""}
                        ${(index & 1) ? "border-y-[1px]" : "border-stone-300"}
                        `}
                        >
                          {shift}
                        </td>;
                      }
                    })}

                    {/* Колличество смен */}
                    <td className="text-center font-bold table-cell border-b-[1px] border-r-[1px] last:border-r-[0px] select-none">
                      {shiftsCount > 0 ? shiftsCount : null}
                    </td>

                    {/* Колличество часов */}
                    <td className="text-center font-bold table-cell border-b-[1px] border-r-[1px] last:border-r-[0px] select-none">
                      {hoursCount > 0 ? hoursCount : null}
                    </td>
                  </tr>
                })}

              </tbody>}

            {/* Итоги таблицы */}
            {timesheetTableHeader.length > 0 &&
              <tfoot className='table-footer-group select-none'>

                {/* Кнопка добавления охранника и строка итогов */}
                <tr
                  className={`table-row mb-2 group ${(timesheetTableBody.length & 1) ? "bg-stone-50" : "bg-stone-200"}`}
                >

                  {/* Кнопка добавления охранника*/}
                  <td className="bg-color_B p-2 table-cell left-0 sticky border-r-[1px] z-50" rowSpan="2">
                    {ARchangeTimesheet &&
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
                      </button>}
                  </td>

                  {/* Cтрока итогов */}
                  {timesheetTableFooter.map((value, i) => {
                    const isDayOff = i < timesheetTableHeader.length && (timesheetTableHeader[i] == "сб" || timesheetTableHeader[i] == "вс")
                    return <td
                      key={i}
                      className={`text-center text-sm table-cell min-w-[35px]
                    border-b-[1px] border-r-[1px] 
                    ${i >= timesheetTableHeader.length ? "font-bold" : ""}
                    ${value > 0 && i < timesheetTableHeader.length ? (
                          value < summGuardPostShifts ?
                            (isDayOff ? " bg-rose-300 text-orange-900" : " bg-rose-200 text-orange-700")
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

                {/* Информация об ошибках, кнопка очистки и сохранения графика */}
                <tr className="table-row top-auto left-auto relative z-10">

                  {/* Информация об ошибках*/}
                  <td className="bg-color_B p-2 table-cell text-left text-red-700 italic break-words" colSpan={timesheetTableHeader.length - 6}>
                    {error}
                  </td>

                  {/* кнопка очистки и сохранения графика */}
                  <td
                    className="bg-color_B p-2 table-cell right-0 sticky"
                    colSpan={8}
                  >
                    {ARchangeTimesheet &&
                      <div className='flex justify-center'>

                        {/* кнопка очистки*/}
                        <FButtonRed
                          className="flex py-1 mr-2"
                          onClick={guardCellsClear}
                          disabled={timesheetTableFooter.length == 0 || timesheetTableFooter[timesheetTableFooter.length - 1] == 0}
                        >
                          <StopIcon
                            className="h-6 w-6"
                          />
                          <span className='hidden lg:block'>Очистить</span>
                        </FButtonRed>

                        {/* кнопка сохранения графика */}
                        <FButtonRed
                          className="flex py-1"
                          onClick={timesheetChangeHandle}
                          disabled={timesheetChanged}
                        >
                          <ArchiveBoxArrowDownIcon
                            className="h-6 w-6"
                          />
                          Сохранить
                        </FButtonRed>

                      </div>}
                  </td>

                </tr>

              </tfoot>}

          </table>
        </div>
      </div>

      {/* {Форма добавления/редактирования строки охранника} */}
      <FTimesheetTableSelectGuardForm
        accessRules={accessRules}
        form={guardRowSelectGuardForm}
        setForm={setGuardRowSelectGuardForm}
        submitAdd={guardRowAdd}
        submitEdit={guardRowEdit}
        optionGuards={optionGuards}
        setGuards={(guard, guardOption) => {
          setGuards(array => {
            array.unshift(guard);
            return array;
          });
          setOptionGuards(array => {
            array.unshift(guardOption);
            return array;
          });
        }}
        users={users}
        guardPosts={guardPosts}
        MOBXui={MOBXui}
        errorCallback={errorCallback}
      />

      {/* {Форма редактирования ячейки} */}
      <FTimesheetTableSelectShiftForm
        form={guardRowSelectShiftForm}
        setForm={setGuardRowSelectShiftForm}
        submitHandle={guardCellSelectShift}
      />

    </>
  )

};