import { ArchiveIcon, PlusIcon, ReplyIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid';
import { motion } from "framer-motion";
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from "next/router";

import { useStore } from "../hight/StoreProvider";
import { ApiError } from "../../middleware/exceptions";
import { FButtonRed } from "../low/FButtonRed";
import { FButtonWhite } from "../low/FButtonWhite";

import { editGuardPost, deleteGuardPost } from '../../src/dtos/dtoGuardPost';
import { changeTimesheet, getTimesheet } from '../../src/dtos/dtoTimesheet';
import { FGuardPostDeleteForm } from '../modal/FGuardPostDeleteForm';
import { FGuardPostEditForm } from '../modal/FGuardPostEditForm';
import { FGuardRowEditForm } from '../modal/FGuardRowEditForm';
import { FInputMonth } from '../low/FInputMonth';
import { FSelect } from '../low/FSelect';
import { array } from 'yup';
import { getCurrentMonth } from '../../src/utils/dateUtils';

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

export default function FFormGuardPostID({ guardPost, guards, users }) {
  /*-------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  -------------------------------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();

  const [guardPostData, setGuardPostData] = useState(guardPost);

  const [error, setError] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      График
  -------------------------------------------------------------------------------------------------------*/

  const [timesheetTableBody, setTimesheetTableBody] = useState([]);

  /*-------------------------------------------------------------------------------------------------------
      Выбор месяца
  -------------------------------------------------------------------------------------------------------*/

  const [timesheetMonth, setTimesheetMonth] = useState('');

  const [timesheetTableHeader, setTimesheetTableHeader] = useState([]);

  const updateDate = async(value)=>{
    setError('');

    if(!timesheetChanged && (confirm('Внесённые изменения не сохраняться!')==false)){
      console.log('returned');
      return;
    }
    console.log('accepted');

    setTimesheetChanged(true);

    MOBXui.setLoading();

    setTimesheetMonth(value);

    try {

      if (value) {

        const date = new Date(value);
        const daysCount = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

        setTimesheetTableHeader([...Array(daysCount).keys()]);

        const {guardsRow, optionGuards} = await getTimesheet(guardPost._id, value);

        if( guardsRow && guardsRow.length >0 && optionGuards && optionGuards.length >0){

          setOptionGuards([{
                text: 'Отсутствует', code: 'EMPTY'
              }, ...guards?.reduce((result, guard) => {

                if( !optionGuards.includes(guard._id) ){
                  result.push({
                    text: [guard.surname, guard.firstName].join(' '),
                    code: guard._id,
                  })
                }

                return result;
              }, [])]);
          
          setTimesheetTableBody(guardsRow);
          
          return;

        }

      } else {
        setTimesheetTableHeader([]);
      }  

      if (timesheetTableBody.length>0) {
        setOptionGuards(array => {
          return array.concat(timesheetTableBody.map(value=>{
            return {
            text: [value.surname, value.firstName].join(' '),
            code: value._id,
        }}))});
      }else{
        setOptionGuards([{
          text: 'Отсутствует', code: 'EMPTY'
        }, ...guards?.map(guard => ({
              text: [guard.surname, guard.firstName].join(' '),
              code: guard._id,
        }))]);
      }

      setTimesheetTableBody([]);

    } catch (error) {

      errorCallback(error, setGuardPostEditForm);

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
  const [guardRowEditForm, setGuardRowEditForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Функция изменения Формы редактирования Строки охранника
  -------------------------------------------------------------------------------------------------------*/
  const guardRowAdd = (event,
    inputGuard) => {

    event.preventDefault();

    setError('');

    setTimesheetChanged(false);

    MOBXui.setLoading();

    try {

      setOptionGuards(array => {
        return array.filter(value => !inputGuard.includes(value.code));
      })

      setTimesheetTableBody(array => {
        return array.concat(guards?.filter(element => inputGuard.includes(element._id)));
      });

      setGuardRowEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardRowEditForm);

    } finally {

      MOBXui.setLoading();

    }
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
        return array.map(value => {
          if (value.code == inputGuard) {
            return {
              text: [guardRowEditForm.guard.surname, guardRowEditForm.guard.firstName].join(' '),
              code: guardRowEditForm.guard._id,
            }
          }
          return value;
        });
      });

      setTimesheetTableBody(array => {
        var index = array.indexOf(guardRowEditForm.guard);
        if (index !== -1) {
          array[index] = guards?.find(element => inputGuard === element._id);
        }
        return array;
      });

      setGuardRowEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardRowEditForm);

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
        array.push({
          text: [deletedGuard.surname, deletedGuard.firstName].join(' '),
          code: deletedGuard._id,
        });
        return array;
      });

      setTimesheetTableBody(array => {
        const result = array.filter(value => {
          return deletedGuard._id != value._id;
        })
        return result
      });

      setGuardRowEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardRowEditForm);

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
    if (index == -1) {

      const shift = guardPostData.shifts?.length > 0 ? guardPostData.shifts[0] : "8";

      guard.timesheetShifts.push(shift);

      guard.timesheetDays.push(day);

    } else {

      const shift = guard.timesheetShifts[index];

      const indexShift = guardPostData.shifts?.length > 0 ? guardPostData.shifts.lastIndexOf(shift) : -1;

      if (indexShift >= 0 && indexShift + 1 < guardPostData.shifts?.length) {
        guard.timesheetShifts[index] = guardPostData.shifts[indexShift + 1];
      } else {
        guard.timesheetShifts.splice(index, 1);
        guard.timesheetDays.splice(index, 1);
      }
    }

    setTimesheetTableHeader(array => [...array]);

  }

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Функция клика по Строке охранника-----------------------------------------------------------------------------------------
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
        timesheetTableBody.reduce((result, guardRow)=>{
          if( guardRow.timesheetShifts && guardRow.timesheetShifts.length>0 ){
            result.push({
              _id: guardRow._id,
              timesheetShifts: guardRow.timesheetShifts,
              timesheetDays: guardRow.timesheetDays
            })
          }
          return result;
        }, [])
      );

      setTimesheetChanged(true);

    } catch (error) {

      errorCallback(error, setGuardPostEditForm);

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
    inputGuardPostName,
    inputGuardPostAddress,
    inputGuardPostPhoto,
    inputGuardPostManager,
    inputGuardPostShifts,
    inputGuardPostDescription) => {

    event.preventDefault();

    setError('');

    MOBXui.setLoading();

    try {

      const responce = await editGuardPost(
        guardPostEditForm.guardPost._id,
        inputGuardPostNumber,
        inputGuardPostName,
        inputGuardPostAddress,
        inputGuardPostPhoto,
        inputGuardPostManager,
        inputGuardPostShifts,
        inputGuardPostDescription
      );

      setGuardPostData(responce.guardPost);

      setGuardPostEditForm({ isOpen: false });

      setTimesheetChanged(false);

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
      updateDate(getCurrentMonth());
    }
  }, []);

  /*----------------------------------------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/

  return (
    <motion.div
      variants={inputs}
      className="w-full h-full flex flex-col"
    >
      <div className="p-2">
        
        {/* {Панель управления} */}
        <div className="w-full flex pt-2 justify-between items-center">

          <button
            className="bg-color_F h-10 w-10 flex justify-center items-center rounded-full
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

          <div className="flex flex-row items-center justify-between md:justify-start bg-white p-4 rounded-t-md border-t-8 border-red-700">
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
                <span className='break-all md:break-normal'><b className=''>НСО</b> {[guardPostData.manager?.surname, guardPostData.manager?.firstName].join(' ')}</span>
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

          {/* Статус ошибки */}
          {error && <div className="">
            <span className="text-color_C italic break-words">
              {error}
            </span>
          </div>}

        </div>

      </div>

      {/* {Таблица физ. постов} */}
      <div
        className='flex-initial flex overflow-auto z-30 min-h-max max-h-screen'
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
                md:relative md:top-auto md:left-auto
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
                  text-white font-bold text-left
                  border-r-[1px] border-b-[1px] pt-4 pb-1.5"
                  colSpan={timesheetTableHeader.length}
                >
                  <div className='flex justify-center'>
                    <FInputMonth
                      onChange={updateDate}
                      value={timesheetMonth}
                    />
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
              md:relative md:left-auto md:top-auto
              ">

                {timesheetTableHeader.map((value, i) => {
                  return <th
                    key={i}
                    className="bg-color_B p-2 text-white font-bold text-center block md:table-cell min-w-[35px]
                    border-b-[1px] border-r-[1px]">
                    {i + 1}
                  </th>;
                })}

              </tr>

            </thead>

            {/* Тело таблицы */}
            {timesheetTableBody.length > 0 &&
              <tbody className="block md:table-row-group z-10">
                {timesheetTableBody.map((guard, i) => {
                  var shiftsCount = 0;
                  var hoursCount = 0;
                  return <tr
                    key={guard._id}
                    className={`block md:table-row mb-2 ${( i & 1 ) ? "bg-stone-50" : "bg-stone-100"}`}
                  >
                    <td className={`text-center block md:table-cell border-b-[1px] border-r-[1px] left-0 sticky ${( i & 1 ) ? "bg-stone-50" : "bg-stone-100"}`}>
                      <div className="flex flex-row items-center justify-between w-full">

                        {guard.uiAvatarsSrc && <Image
                          className="h-8 w-8 rounded-full"
                          width={32}
                          height={32}
                          src={guard.uiAvatarsSrc}
                          alt=""
                        />}

                        <p className="font-semibold text-black ml-1 text-xl font-bold select-none">{[guard.surname, guard.firstName].join(' ')}</p>

                        <div className='flex mr-2'>
                          <button
                            className="flex disabled:opacity-25"
                            disabled={optionGuards.length <= 1}
                            onClick={() => {
                              setGuardRowEditForm({
                                isOpen: true,
                                operation: 'Изменить',
                                key: Math.random().toString(36),
                                guard: guard
                              })
                            }}
                          >
                            <PencilAltIcon
                              className="h-4 w-4"
                            />
                          </button>
                          <button
                            className="flex"
                            onClick={(event) => guardRowDelete(event, guard)}
                          >
                            <TrashIcon
                              className="h-4 w-4"
                            />
                          </button>
                        </div>

                      </div>
                    </td>
                    {timesheetTableHeader.map((value, i) => {
                      const index = guard.timesheetDays?.indexOf(value);
                      const shift = index >= 0 ? guard.timesheetShifts[index] : '';
                      shiftsCount += index >= 0 ? 1 : 0;
                      hoursCount += index >= 0 ? parseInt(shift) : 0;
                      return <td
                        key={i}
                        className="text-center block md:table-cell border-b-[1px] border-r-[1px] last:border-r-[0px] select-none"
                        onClick={(event) => {
                          guardCellHandle(event, guard, value)
                        }}
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
            {timesheetTableHeader.length > 0 &&
              <tfoot className='block md:table-footer-group'>
                <tr className="block md:table-row absolute -top-full md:top-auto -left-full 
                md:left-auto md:relative z-10">
                  <td className="bg-color_B p-2 block md:table-cell left-0 sticky border-r-[1px]">
                    <button
                      className='flex items-center justify-center align-middle text-white text-center w-full disabled:opacity-25'
                      onClick={(event) => {
                        event.stopPropagation();
                        setGuardRowEditForm({
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
                  <td className="bg-color_B p-2 text-white font-bold text-left block md:table-cell" colSpan={timesheetTableHeader.length-3}>            
                    <span className="text-color_C italic break-words">
                      {error}
                    </span>
                  </td>
                  <td 
                    className="bg-color_B p-2 block md:table-cell right-0 sticky" 
                    colSpan={5}
                  >
                    <div className='flex justify-center'>
                    <FButtonRed
                      className="flex"
                      onClick={timesheetChangeHandle}
                      disabled={timesheetChanged}
                    >
                      <ArchiveIcon
                        className="h-4 w-4"
                      />
                      Сохранить
                    </FButtonRed>

                    </div>
                  </td>
                </tr>
              </tfoot>}

          </table>

        </div>
      </div>

      {/* {Форма добавления/редактирования строки охранника} */}
      <FGuardRowEditForm
        form={guardRowEditForm}
        setForm={setGuardRowEditForm}
        submitAdd={guardRowAdd}
        submitEdit={guardRowEdit}
        optionGuards={optionGuards}
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