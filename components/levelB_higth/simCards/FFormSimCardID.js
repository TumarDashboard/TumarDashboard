import { PencilSquareIcon, ArrowUturnLeftIcon, TrashIcon } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useState } from 'react';

import { ApiError } from "../../../middleware/exceptions";
import { useStore } from "../../levelA/StoreProvider";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";

import { deleteSimCard, editSimCard } from '../../../src/dtos/dtoSimCard';
import FTimesheetHorizontal from '../../levelC_middle/FTimesheetTableHorizontal';
import { FSimCardDeleteForm } from '../../levelD_modal/simCard/FSimCardDeleteForm';
import { FSimCardEditForm } from '../../levelD_modal/simCard/FSimCardEditForm';

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

export default function FFormSimCardID({ accessRules, userData, simCard, guardsData, users, usersAll }) {

  /*-------------------------------------------------------------------------------------------------------
      Определение правил доступа
  -------------------------------------------------------------------------------------------------------*/
  const AReditSimCard = accessRules.includes('editSimCard');
  const ARdeleteSimCard = accessRules.includes('deleteSimCard');
  /*-------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  -------------------------------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();
  const [simCardData, setSimCardData] = useState(simCard);

  /*----------------------------------------------------------------------------------------------------------------------------
  ----Модальное окно Формы редактирования Физ. поста----------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/
  const [simCardEditForm, setSimCardEditForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Функция изменения Формы редактирования Физ. поста
  -------------------------------------------------------------------------------------------------------*/
  const simCardEdit = async (event,
    inputSimCardMSISDN,
    inputSimCardICCID,
    inputSimCardProvider
    ) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      const responce = await editSimCard(
        simCardEditForm.simCard._id,
        inputSimCardMSISDN,
        inputSimCardICCID,
        inputSimCardProvider
      );

      setSimCardData(responce.simCard);

      setSimCardEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setSimCardEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*-------------------------------------------------------------------------------------------------------
      Модальное окно Формы удаления Физ. поста
  -------------------------------------------------------------------------------------------------------*/
  const [simCardDeleteForm, setSimCardDeleteForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Функция удаления Формы удаления Физ. поста
  -------------------------------------------------------------------------------------------------------*/
  const simCardDeleteFormSubmit = async (event, reason) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        await deleteSimCard(
          simCardDeleteForm.simCardId,
          MOBXuser.user.id,
          reason
        );

        setSimCardDeleteForm({
          isOpen: false
        });

        router.push('/dashboard/simCards');

      }

    } catch (error) {

      errorCallback(error, setSimCardDeleteForm);

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
              router.push('/dashboard/simCards');
            }}
          >
            <ArrowUturnLeftIcon
              className="h-8 w-8 fill-color_C
            hover:fill-color_F"
            />
          </button>

          {/* {Абон. номер} */}
          <div className="flex flex-row items-center justify-between md:justify-start bg-white mx-2 p-4 rounded-t-md border-t-8 border-red-700">

            {/* {Номер объекта} */}
            {simCardData.msisdn && <p
              className="text-black ml-1 text-xl font-bold">
              {simCardData.msisdn}
            </p>}

          </div>

          {/* {Кнопки управления} */}
          <div className='flex'>

            {/* {Кнопка редактирования} */}
            {AReditSimCard &&
              <FButtonRed
                className="mr-2 flex"
                onClick={(event) => {
                  event.stopPropagation();
                  setSimCardEditForm({
                    isOpen: true,
                    operation: 'Изменить',
                    key: Math.random().toString(36),
                    simCard: simCardData
                  })
                }}
              >
                <PencilSquareIcon
                  className="h-4 w-4"
                />
              </FButtonRed>}

            {/* {Кнопка удаления} */}
            {ARdeleteSimCard &&
              <FButtonWhite
                className="flex"
                onClick={(event) => {
                  event.stopPropagation();
                  setSimCardDeleteForm({
                    isOpen: true,
                    key: Math.random().toString(36),
                    simCardNumber: simCardData.msisdn,
                    simCardId: simCardData._id,
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

          {/* Абонентский номер */}
          {simCardData.msisdn &&
            <div className='form-item w-full items-center'>
              <span className="break-all md:break-normal"><b className='hidden md:inline-block'>Абонентский номер</b> {simCardData.msisdn}</span>
            </div>}

          {/* Серийный номер */}
          {simCardData.iccid &&
            <div className='form-item w-full items-center'>
              <span className="break-all md:break-normal"><b className='hidden md:inline-block'>Серийный номер</b> {simCardData.iccid}</span>
            </div>}

          {/* Провайдер */}
          {simCardData.iccid &&
            <div className='form-item w-full items-center'>
              <span className="break-all md:break-normal"><b className='hidden md:inline-block'>Провайдер</b> {simCardData.provider}</span>
            </div>}

          {/* Описание */}
          {/* {simCardData.description &&
            <div className='form-item w-full items-center p-2 bg-slate-200 rounded-md border-[1px] border-slate-600 text-neutral-800'>
              <p className="whitespace-pre-line">{simCardData.description}</p>
            </div>} */}

        </div>

      </div>

      {/* {Форма добавления/редактирования пультовой объекта} */}
      <FSimCardEditForm
        accessRules={accessRules}
        form={simCardEditForm}
        setForm={setSimCardEditForm}
        submitEdit={simCardEdit}
        users={users}
      />

      {/* {Форма удаления пультовой объекта} */}
      <FSimCardDeleteForm
        form={simCardDeleteForm}
        setForm={setSimCardDeleteForm}
        submit={simCardDeleteFormSubmit}
      />

    </motion.div>
  )

};