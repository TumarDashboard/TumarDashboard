import { PencilAltIcon, ReplyIcon, TrashIcon } from '@heroicons/react/solid';
import { motion } from "framer-motion";
import Image from 'next/image';
import { useRouter } from "next/router";
import { useState } from 'react';

import { ApiError } from "../../middleware/exceptions";
import { useStore } from "../levelA/StoreProvider";
import { FButtonRed } from "../levelE_low/FButtonRed";
import { FButtonWhite } from "../levelE_low/FButtonWhite";

import { deleteGuardPost, editGuardPost } from '../../src/dtos/dtoGuardPost';
import FTimesheetHorizontal from '../levelC_middle/FTimesheetTableHorizontal';
import { FGuardPostDeleteForm } from '../levelD_modal/guardPost/FGuardPostDeleteForm';
import { FGuardPostEditForm } from '../levelD_modal/guardPost/FGuardPostEditForm';

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

export default function FFormGuardPostID({ accessRules, userData, guardPost, guardPosts, guardsData, users, usersAll }) {

  /*-------------------------------------------------------------------------------------------------------
      Определение правил доступа
  -------------------------------------------------------------------------------------------------------*/
  const AReditGuardPost = accessRules.includes('editGuardPost');
  const AReditGuardPostRate = !accessRules.includes('editGuardPost/editBlock/rate');
  const AReditGuardPostAll = !accessRules.includes('editGuardPost/userCompare/manager');
  const ARdeleteGuardPost = accessRules.includes('deleteGuardPost');
  const ARgetTimesheet = accessRules.includes('getTimesheet');
  const ARgetTimesheetAll = !accessRules.includes('getTimesheet/userCompare/manager');
  /*-------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  -------------------------------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();
  const [guardPostData, setGuardPostData] = useState(guardPost);

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
        AReditGuardPostRate ? inputGuardPostRate : undefined
      );

      setGuardPostData(responce.guardPost);

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

          {/* {Кнопка перехода назад к выбору физ. постов} */}
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

          {/* {Фото и номер объекта} */}
          <div className="flex flex-row items-center justify-between md:justify-start bg-white mx-2 p-4 rounded-t-md border-t-8 border-red-700">

            {/* {Фото объекта} */}
            {guardPostData.photo && <Image
              className="h-8 w-8 rounded-full"
              width={32}
              height={32}
              src={guardPostData.photo}
              alt=""
            />}

            {/* {Номер объекта} */}
            {guardPostData.number && <p
              className="text-black ml-1 text-xl font-bold">
              {guardPostData.number}
            </p>}

          </div>

          {/* {Кнопки управления физ. постом} */}
          <div className='flex'>

            {/* {Кнопка редактирования} */}
            {((AReditGuardPost && AReditGuardPostAll)
              || (AReditGuardPost && guardPost.manager._id === MOBXuser.user.id)
              || (AReditGuardPost && guardPost.manager._id === userData.id)) &&
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
              </FButtonRed>}

            {/* {Кнопка удаления} */}
            {ARdeleteGuardPost &&
              <FButtonWhite
                className="flex"
                onClick={(event) => {
                  event.stopPropagation();
                  setGuardPostDeleteForm({
                    isOpen: true,
                    key: Math.random().toString(36),
                    guardPostCallsign: guardPostData.callsign,
                    guardPostId: guardPostData._id,
                  })
                }}
              >
                <TrashIcon
                  className="h-4 w-4"
                />
              </FButtonWhite>}

          </div>

        </div>

        {/* {Панель информации} */}
        <div className='w-full flex flex-col bg-white p-2 rounded-md'>

          {/* Менеджер и Смены*/}
          <div className='flex flex-col md:flex-row w-full flex-wrap'>

            {/* Позывной */}
            {guardPostData.callsign &&
              <div className='form-item items-center'>
                <span className="break-all md:break-normal font-bold">{guardPostData.name}</span>
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

          {/* Менеджер */}
          {guardPostData.manager &&
            <div className='form-item w-full items-center'>
              <span className='break-all md:break-normal'><b className=''>НСО:</b> {[guardPostData.manager?.surname, guardPostData.manager?.firstName].join(' ')}</span>
            </div>}

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

        </div>

      </div>

      {/* {Таблица графика} */}
      {((ARgetTimesheet && ARgetTimesheetAll)
        || (ARgetTimesheet && guardPost.manager._id === MOBXuser.user.id)
        || (ARgetTimesheet && guardPost.manager._id === userData.id)) &&
        <FTimesheetHorizontal
          accessRules={accessRules}
          userData={MOBXuser}
          MOBXuser={MOBXuser}
          MOBXui={MOBXui}
          errorCallback={errorCallback}
          guardPost={guardPostData}
          guardPosts={guardPosts}
          guardsData={guardsData}
          users={users}
          usersAll={usersAll}
        />}

      {/* {Форма добавления/редактирования физ. поста} */}
      <FGuardPostEditForm
        accessRules={accessRules}
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