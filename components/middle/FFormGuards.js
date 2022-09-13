import { PlusIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid';
import { motion } from "framer-motion";
import Image from 'next/image';
import { useState } from 'react';

import { useStore } from "../hight/StoreProvider";
import { ApiError } from "../../middleware/exceptions";
import { FButtonRed } from "../low/FButtonRed";
import { FButtonWhite } from "../low/FButtonWhite";

import { createGuard, editGuard, deleteGuard } from '../../src/dtos/dtoGuard';
import { FGuardDeleteForm } from '../modal/FGuardDeleteForm';
import { FGuardEditForm } from '../modal/FGuardEditForm';

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

export default function FFormGuards({ guards, guardPosts, users }) {
  /*-------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  -------------------------------------------------------------------------------------------------------*/
  const { MOBXuser, MOBXui } = useStore();

  const [guardsTable, setGuardsTable] = useState(guards);
  /*-------------------------------------------------------------------------------------------------------
      Модальное окно Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [guardEditForm, setGuardEditForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Создание физ. поста Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const guardAdd = async (event,
    inputGuardSurname,
    inputGuardFirstName,
    inputGuardPatronymic,
    inputGuardUIAvatarsSrc,
    inputGuardTelephone,
    inputGuardManager,
    inputGuardGuardPosts) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      const responce = await createGuard(
        inputGuardSurname,
        inputGuardFirstName,
        inputGuardPatronymic,
        inputGuardUIAvatarsSrc,
        inputGuardTelephone,
        inputGuardManager,
        inputGuardGuardPosts
      );

      setGuardsTable(array => {
        array.unshift(responce.guard);
        return array;
      });

      setGuardEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardEditForm);

    } finally {

      MOBXui.setLoading();

    }

  }

  /*-------------------------------------------------------------------------------------------------------
      Создание физ. поста Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const guardEdit = async (event,
    inputGuardSurname,
    inputGuardFirstName,
    inputGuardPatronymic,
    inputGuardUIAvatarsSrc,
    inputGuardTelephone,
    inputGuardManager,
    inputGuardGuardPosts) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      const responce = await editGuard(
        guardEditForm.guard._id,
        inputGuardSurname,
        inputGuardFirstName,
        inputGuardPatronymic,
        inputGuardUIAvatarsSrc,
        inputGuardTelephone,
        inputGuardManager,
        inputGuardGuardPosts
      );

      setGuardsTable(array => {
        array[guardEditForm.index] = responce.guard;
        return array;
      });

      setGuardEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*-------------------------------------------------------------------------------------------------------
      Модальное окно Формы удаления
  -------------------------------------------------------------------------------------------------------*/
  const [guardDeleteForm, setGuardDeleteForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Функция удаления поста Формы удаления
  -------------------------------------------------------------------------------------------------------*/
  const guardDeleteFormSubmit = async (event, reason) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        const responce = await deleteGuard(
          guardDeleteForm.guardId,
          MOBXuser.user.id,
          reason
        );

        setGuardsTable(array => {
          const result = array.filter(value => {
            return responce.guard._id != value._id;
          })
          return result
        });

        setGuardDeleteForm({
          isOpen: false
        });
      }

    } catch (error) {

      errorCallback(error, setGuardDeleteForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----------------------------------------------------------------------------------------------------------------------------
    Переиспользование функции обработок ошибок
  ----------------------------------------------------------------------------------------------------------------------------*/
  const errorCallback = (error, callback) => {

    if (error instanceof ApiError) {
      if (error.statusCode == 520) {

        callback({ isOpen: false });

        const message = JSON.parse(error.message);

        MOBXui.openGoogleAuthError(message.email, message.authorizeUrl);

      } else {
        callback(form => {
          let formNew = {...form};
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
      className="w-full m-2"
    >

      {/* {Панель управления} */}
      <div
        className="w-full flex pt-2 pb-4 pr-4 justify-end"
      >

        <button
          className="bg-color_F h-10 w-10 flex justify-center items-center rounded-full
          hover:bg-color_C active:bg-color_B"
          onClick={() => {
            setGuardEditForm({
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
        </button>

      </div>

      {/* {Таблица физ. постов} */}
      <table className="min-w-full border-collapse block md:table">

        <thead className="block md:table-header-group">

          <tr className="border md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto  md:relative">

            <th className="bg-color_B p-2 text-white font-bold md:border text-left block md:table-cell">Инициалы</th>
            <th className="bg-color_B p-2 text-white font-bold md:border text-left block md:table-cell">Телефон</th>
            <th className="bg-color_B p-2 text-white font-bold md:border text-left block md:table-cell">НСО</th>
            <th className="bg-color_B p-2 text-white font-bold md:border text-left block md:table-cell"></th>

          </tr>

        </thead>

        <tbody className="block md:table-row-group">

          {guardsTable?.map((guard, index) => {
            return (

              <tr className="rounded-md md:border-none block md:table-row bg-color_G mb-2" key={guard._id}>

                <td className="p-2 md:border text-left block md:table-cell">
                  <div className="flex flex-row items-center justify-between md:justify-start">

                    {guard.uiAvatarsSrc && <Image
                      className="h-8 w-8 rounded-full"
                      width={32}
                      height={32}
                      src={guard.uiAvatarsSrc}
                      alt=""
                    />}

                    <p className="font-semibold text-black ml-1 text-xl font-bold">{[guard.surname, guard.firstName].join(' ')}</p>

                    <div className='flex md:hidden'>
                      <FButtonRed
                        className="mr-2 flex"
                        onClick={() => {
                          setGuardEditForm({
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
                      </FButtonRed>
                      <FButtonWhite
                        className="flex"
                        onClick={() => setGuardDeleteForm({
                          isOpen: true,
                          key: Math.random().toString(36),
                          guardInitials: [guard.surname, guard.firstName].join(' '),
                          guardId: guard._id,
                        })}
                      >
                        <TrashIcon
                          className="h-4 w-4"
                        />
                      </FButtonWhite>
                    </div>

                  </div>
                </td>

                <td className="px-1 md:p-2 md:border text-left block md:table-cell flex flex-row items-center">
                  {guard.telephone?.length > 0 &&
                    <span className="break-all md:break-normal">
                      <b className='md:hidden'>Телефон</b> {guard.telephone}
                    </span>}
                </td>

                <td className="px-1 md:p-2 md:border text-left block md:table-cell flex flex-row items-center">
                  {guard.manager?._id != "EMPTY" &&
                    <span className="break-all md:break-normal">
                      <b className='md:hidden'>НСО</b> {[guard.manager?.surname, guard.manager?.firstName].join(' ')}
                    </span>}
                </td>

                <td className="p-2 md:border text-left hidden md:block md:table-cell w-1">
                  <div className='flex'>

                    <FButtonRed
                      className="mr-2 flex"
                      onClick={() => {
                        setGuardEditForm({
                          isOpen: true,
                          index: index,
                          operation: 'Изменить',
                          key: Math.random().toString(36),
                          guard: guard
                        })
                      }}
                    >
                      <PencilAltIcon
                        className="h-4 w-4"
                      />
                      <span className='hidden lg:block'>Изменить</span>
                    </FButtonRed>

                    <FButtonWhite
                      className="flex"
                      onClick={() => setGuardDeleteForm({
                        isOpen: true,
                        key: Math.random().toString(36),
                        guardInitials: [guard.surname, guard.firstName].join(' '),
                        guardId: guard._id,
                      })}
                    >
                      <TrashIcon
                        className="h-4 w-4"
                      />
                      <span className='hidden lg:block'>Удалить</span>
                    </FButtonWhite>

                  </div>
                </td>

              </tr>

            )
          })}

        </tbody>

      </table>

      {/* {Форма добавления/редактирования физ. поста} */}
      <FGuardEditForm
        form={guardEditForm}
        setForm={setGuardEditForm}
        submitAdd={guardAdd}
        submitEdit={guardEdit}
        guardPosts={guardPosts}
        users={users}
      />

      {/* {Форма удаления физ. поста} */}
      <FGuardDeleteForm
        form={guardDeleteForm}
        setForm={setGuardDeleteForm}
        submit={guardDeleteFormSubmit}
      />

    </motion.div>
  )

};