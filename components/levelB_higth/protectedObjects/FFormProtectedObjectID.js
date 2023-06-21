import { PencilSquareIcon, ArrowUturnLeftIcon, TrashIcon } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useState } from 'react';

import { ApiError } from "../../../middleware/exceptions";
import { useStore } from "../../levelA/StoreProvider";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";

import { deleteProtectedObject, editProtectedObject } from '../../../src/dtos/dtoProtectedObject';
import FTimesheetHorizontal from '../../levelC_middle/FTimesheetTableHorizontal';
import { FProtectedObjectDeleteForm } from '../../levelD_modal/protectedObject/FProtectedObjectDeleteForm';
import { FProtectedObjectEditForm } from '../../levelD_modal/protectedObject/FProtectedObjectEditForm';

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

export default function FFormProtectedObjectID({ accessRules, userData, protectedObject, guardsData, users, usersAll }) {

  /*-------------------------------------------------------------------------------------------------------
      Определение правил доступа
  -------------------------------------------------------------------------------------------------------*/
  const AReditProtectedObject = accessRules.includes('editProtectedObject');
  const ARdeleteProtectedObject = accessRules.includes('deleteProtectedObject');
  /*-------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  -------------------------------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();
  const [protectedObjectData, setProtectedObjectData] = useState(protectedObject);

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Модальное окно Формы редактирования Физ. поста----------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  const [protectedObjectEditForm, setProtectedObjectEditForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Функция изменения Формы редактирования Физ. поста
  -------------------------------------------------------------------------------------------------------*/
  const protectedObjectEdit = async (event,
    inputProtectedObjectNumber,
    inputProtectedObjectName,
    inputProtectedObjectAddress,
    inputProtectedObjectPhoto,
    inputProtectedObjectDescription
    ) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      const responce = await editProtectedObject(
        protectedObjectEditForm.protectedObject._id,
        inputProtectedObjectNumber,
        inputProtectedObjectName,
        inputProtectedObjectAddress,
        inputProtectedObjectPhoto,
        inputProtectedObjectDescription
      );

      setProtectedObjectData(responce.protectedObject);

      setProtectedObjectEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setProtectedObjectEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*-------------------------------------------------------------------------------------------------------
      Модальное окно Формы удаления Физ. поста
  -------------------------------------------------------------------------------------------------------*/
  const [protectedObjectDeleteForm, setProtectedObjectDeleteForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Функция удаления Формы удаления Физ. поста
  -------------------------------------------------------------------------------------------------------*/
  const protectedObjectDeleteFormSubmit = async (event, reason) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        await deleteProtectedObject(
          protectedObjectDeleteForm.protectedObjectId,
          MOBXuser.user.id,
          reason
        );

        setProtectedObjectDeleteForm({
          isOpen: false
        });

        router.push('/dashboard/protectedObjects');

      }

    } catch (error) {

      errorCallback(error, setProtectedObjectDeleteForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Переиспользование функции обработок ошибок--------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
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

          {/* {Кнопка перехода назад к выбору пультовой объектов} */}
          <button
            className="bg-slate-300 h-10 w-10 flex justify-center items-center rounded-lg
              hover:bg-color_C active:bg-color_B"
            onClick={(event) => {
              event.stopPropagation();
              router.push('/dashboard/protectedObjects');
            }}
          >
            <ArrowUturnLeftIcon
              className="h-8 w-8 fill-color_C
            hover:fill-color_F"
            />
          </button>

          {/* {Фото и номер объекта} */}
          <div className="flex flex-row items-center justify-between md:justify-start bg-white mx-2 p-4 rounded-t-md border-t-8 border-red-700">

            {/* {Фото объекта} */}
            {protectedObjectData.photo && <Image
              className="h-8 w-8 rounded-full"
              width={32}
              height={32}
              src={protectedObjectData.photo}
              alt=""
            />}

            {/* {Номер объекта} */}
            {protectedObjectData.number && <p
              className="text-black ml-1 text-xl font-bold">
              {protectedObjectData.number}
            </p>}

          </div>

          {/* {Кнопки управления пультовой объектом} */}
          <div className='flex'>

            {/* {Кнопка редактирования} */}
            {AReditProtectedObject &&
              <FButtonRed
                className="mr-2 flex"
                onClick={(event) => {
                  event.stopPropagation();
                  setProtectedObjectEditForm({
                    isOpen: true,
                    operation: 'Изменить',
                    key: Math.random().toString(36),
                    protectedObject: protectedObjectData
                  })
                }}
              >
                <PencilSquareIcon
                  className="h-4 w-4"
                />
              </FButtonRed>}

            {/* {Кнопка удаления} */}
            {ARdeleteProtectedObject &&
              <FButtonWhite
                className="flex"
                onClick={(event) => {
                  event.stopPropagation();
                  setProtectedObjectDeleteForm({
                    isOpen: true,
                    key: Math.random().toString(36),
                    protectedObjectNumber: protectedObjectData.number,
                    protectedObjectId: protectedObjectData._id,
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

          {/* Наименование */}
          {protectedObjectData.name &&
            <div className='form-item w-full items-center'>
              <span className="break-all md:break-normal"><b className='hidden md:inline-block'>Наименование</b> {protectedObjectData.name}</span>
            </div>}

          {/* Адрес */}
          {protectedObjectData.address &&
            <div className='form-item w-full items-center'>
              <span className="break-all md:break-normal"><b className='hidden md:inline-block'>Адрес</b> {protectedObjectData.address}</span>
            </div>}

          {/* Описание */}
          {protectedObjectData.description &&
            <div className='form-item w-full items-center p-2 bg-slate-200 rounded-md border-[1px] border-slate-600 text-neutral-800'>
              <span className="break-all md:break-normal">{protectedObjectData.description}</span>
            </div>}

        </div>

      </div>

      {/* {Форма добавления/редактирования пультовой объекта} */}
      <FProtectedObjectEditForm
        accessRules={accessRules}
        form={protectedObjectEditForm}
        setForm={setProtectedObjectEditForm}
        submitEdit={protectedObjectEdit}
        users={users}
      />

      {/* {Форма удаления пультовой объекта} */}
      <FProtectedObjectDeleteForm
        form={protectedObjectDeleteForm}
        setForm={setProtectedObjectDeleteForm}
        submit={protectedObjectDeleteFormSubmit}
      />

    </motion.div>
  )

};