import { PlusIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid';
import { motion } from "framer-motion";
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from "next/router";

import { useStore } from "../hight/StoreProvider";
import { ApiError } from "../../middleware/exceptions";
import { FButtonRed } from "../low/FButtonRed";
import { FButtonWhite } from "../low/FButtonWhite";

import { createGuardPost, editGuardPost, deleteGuardPost } from '../../src/dtos/dtoGuardPost';
import { FGuardPostDeleteForm } from '../modal/FGuardPostDeleteForm';
import { FGuardPostEditForm } from '../modal/FGuardPostEditForm';

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

export default function FFormGuardPosts({ guardPosts, users }) {
  /*-------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  -------------------------------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();

  const [guardPostsTable, setGuardPostsTable] = useState(guardPosts);

  /*-------------------------------------------------------------------------------------------------------
      Модальное окно Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [guardPostEditForm, setGuardPostEditForm] = useState({
    isOpen: false
  });
  /*-------------------------------------------------------------------------------------------------------
      Создание физ. поста Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const guardPostAdd = async (event,
    inputGuardPostNumber,
    inputGuardPostName,
    inputGuardPostAddress,
    inputGuardPostPhoto,
    inputGuardPostManager,
    inputGuardPostShifts,
    inputGuardPostDescription) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      const responce = await createGuardPost(
        inputGuardPostNumber,
        inputGuardPostName,
        inputGuardPostAddress,
        inputGuardPostPhoto,
        inputGuardPostManager,
        inputGuardPostShifts,
        inputGuardPostDescription
      );

      setGuardPostsTable(array => {
        array.push(responce.guardPost);
        array.sort((a, b) => {
          return (a.number === undefined || a.number === null) - (b.number === undefined || b.number === null) ||
            a.number - b.number ||
            a.address.localeCompare(b.address)
        })
        return array;
      });

      setGuardPostEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardPostEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*-------------------------------------------------------------------------------------------------------
      Изменение физ. поста Формы редактирования
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

      setGuardPostsTable(array => {
        var index = array.indexOf(guardPostEditForm.guardPost);
        if (index !== -1) {
          array[index] = responce.guardPost;
        }
        array.sort((a, b) => {
          return (a.number === undefined || a.number === null) - (b.number === undefined || b.number === null) ||
            a.number - b.number ||
            a.address.localeCompare(b.address)
        })
        return array;
      });

      setGuardPostEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardPostEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*-------------------------------------------------------------------------------------------------------
      Модальное окно Формы удаления
  -------------------------------------------------------------------------------------------------------*/
  const [guardPostDeleteForm, setGuardPostDeleteForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Функция удаления поста Формы удаления
  -------------------------------------------------------------------------------------------------------*/
  const guardPostDeleteFormSubmit = async (event, reason) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        const responce = await deleteGuardPost(
          guardPostDeleteForm.guardPostId,
          MOBXuser.user.id,
          reason
        );

        setGuardPostsTable(array => {
          const result = array.filter(value => {
            return responce.guardPost._id != value._id;
          })
          return result
        });

        setGuardPostDeleteForm({
          isOpen: false
        });
      }

    } catch (error) {

      errorCallback(error, setGuardPostDeleteForm);

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
        </button>

      </div>

      {/* {Таблица физ. постов} */}
      <table className="min-w-full border-collapse block md:table">

        <thead className="block md:table-header-group">

          <tr className="border md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto  md:relative">

            <th className="bg-color_B p-2 text-white font-bold md:border text-left block md:table-cell">Номер</th>
            <th className="bg-color_B p-2 text-white font-bold md:border text-left block md:table-cell">Наименование</th>
            <th className="bg-color_B p-2 text-white font-bold md:border text-left block md:table-cell">Адрес</th>
            <th className="bg-color_B p-2 text-white font-bold md:border text-left block md:table-cell">НСО</th>
            <th className="bg-color_B p-2 text-white font-bold md:border text-left block md:table-cell"></th>

          </tr>

        </thead>

        <tbody className="block md:table-row-group">

          {guardPostsTable?.map((guardPost) => {
            return (

              <tr 
              className="rounded-md md:border-none block md:table-row bg-color_G mb-2 cursor-pointer" 
              key={guardPost._id}
              onClick={(event) => {
                event.stopPropagation();
                router.push({
                  pathname: '/dashboard/guardPosts/[guardPostID]',
                  query: { guardPostID: guardPost._id },
                })
              }}
              >

                <td className="p-2 md:border text-left block md:table-cell">
                  <div className="flex flex-row items-center justify-between md:justify-start">
                    {guardPost.photo && <Image
                      className="h-8 w-8 rounded-full"
                      width={32}
                      height={32}
                      src={guardPost.photo}
                      alt=""
                    />}
                    <p className="font-semibold text-black ml-1 text-xl font-bold">{guardPost.number}</p>
                    <div className='flex md:hidden'>

                      <FButtonRed
                        className="mr-2 flex"
                        onClick={(event) => {
                          event.stopPropagation();
                          setGuardPostEditForm({
                            isOpen: true,
                            operation: 'Изменить',
                            key: Math.random().toString(36),
                            guardPost: guardPost
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
                            guardPostName: guardPost.name,
                            guardPostId: guardPost._id,
                          })
                        }}
                      >
                        <TrashIcon
                          className="h-4 w-4"
                        />
                      </FButtonWhite>

                    </div>
                  </div>
                </td>

                <td className="px-1 md:p-2 md:border text-left block md:table-cell">
                  <span className="break-all md:break-words">{guardPost.name}</span>
                </td>

                <td className="px-1 md:p-2 md:border text-left block md:table-cell flex flex-row items-center">
                  <span className="break-all md:break-normal"><b className='md:hidden'>Адрес</b> {guardPost.address}</span>
                </td>

                <td className="px-1 md:p-2 md:border text-left block md:table-cell flex flex-row items-center">
                  {guardPost.manager &&
                    <span className="break-all md:break-normal">
                      <b className='md:hidden'>НСО</b> {[guardPost.manager?.surname, guardPost.manager?.firstName].join(' ')}
                    </span>}
                </td>

                <td className="p-2 md:border text-left hidden md:table-cell w-1">
                  <div className='flex'>

                    <FButtonRed
                      className="mr-2 flex"
                      onClick={(event) => {
                        event.stopPropagation();
                        setGuardPostEditForm({
                          isOpen: true,
                          operation: 'Изменить',
                          key: Math.random().toString(36),
                          guardPost: guardPost
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
      <FGuardPostEditForm
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

    </motion.div>
  )

};