import { PlusIcon, PencilSquareIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";
import Image from "next/legacy/image";
import { useState, useRef, useEffect } from 'react';

import { useStore } from "../../levelA/StoreProvider";
import { ApiError } from "../../../middleware/exceptions";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";

import { createGuard, editGuard, deleteGuard } from '../../../src/dtos/dtoGuard';
import { FGuardDeleteForm } from '../../levelD_modal/guard/FGuardDeleteForm';
import { FGuardEditForm } from '../../levelD_modal/guard/FGuardEditForm';
import { FFilterText } from '../../levelE_low/FFilterText';

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
  { value: 'surname', label: 'Инициалы' },
  { value: 'telephone', label: 'Телефон' },
  // { value: 'manager', label: 'НСО' },
];

const sortingTableCallback = (a, b, rule, invert) => {
  // equal items sort equally
  if (a[rule] === b[rule]) {
    return 0;
  }

  // nulls sort after anything else
  if (a[rule] === null || a[rule] === undefined || a[rule].length === 0 || a[rule]._id === 'EMPTY') {
    return 1 * invert;
  }
  if (b[rule] === null || b[rule] === undefined || b[rule].length === 0 || b[rule]._id === 'EMPTY') {
    return -1 * invert;
  }

  switch (rule) {

    case 'surname':
      return (a.surname.localeCompare(b.surname) || a.firstName.localeCompare(b.firstName)) * invert;

    case 'telephone':
      return (a.telephone[0].localeCompare(b.telephone[0])) * invert;

    // case 'manager':
    //   return (a.manager.surname.localeCompare(b.manager.surname) || a.manager.firstName.localeCompare(b.manager.firstName)) * invert;

    case 'control':
      return false;

    default:
      break;
  }
}

export default function FFormGuards({ accessRules, tableGuards, setTableGuards, setTableGuardsArchive, guardPosts, users }) {
  /*-------------------------------------------------------------------------------------------------------
      Использование глобальных данных
  -------------------------------------------------------------------------------------------------------*/
  const { MOBXuser, MOBXui } = useStore();

  /*-------------------------------------------------------------------------------------------------------
      Определение правил доступа
  -------------------------------------------------------------------------------------------------------*/
  const ARcreateGuard = accessRules.includes('createGuard');
  const AReditGuard = accessRules.includes('editGuard');
  const ARdeleteGuard = accessRules.includes('deleteGuard');

  /*--Данные таблицы-------------------------------------------------------------------------------------*/
  const [renderTableGuards, setRenderTableGuards] = useState(tableGuards ? [...tableGuards] : []);

  /*--Сортировка таблицы---------------------------------------------------------------------------------*/
  const [sortingRule, setSortingRule] = useState();

  const sortingTable = (rule) => {

    const invert = rule == sortingRule ? -1 : 1;

    setRenderTableGuards(array => {
      return [...array.sort((a, b) => sortingTableCallback(a, b, rule, invert))];
    });

    setSortingRule(rule == sortingRule ? '!' + rule : rule);

  }

  /*--Фильтрация таблицы---------------------------------------------------------------------------------*/
  const [inputFilterText, setInputFilterText] = useState([]);
  const filterringTimeout = useRef();

  const filteringTable = (text) => {

    const filtersArray = text.toLowerCase().split(' ');

    setRenderTableGuards(

      tableGuards.filter(value => {

        const parametrsArray = [
          value.surname,
          value.firstName,
          value.patronymic,
          ...value.telephone,
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

  /*--Модальное окно Формы редактирования----------------------------------------------------------------*/
  const [guardEditForm, setGuardEditForm] = useState({
    isOpen: false
  });

  /*--Добавление охранника Формой редактирования---------------------------------------------------------*/
  const guardAdd = async (event,
    inputGuardSurname,
    inputGuardFirstName,
    inputGuardPatronymic,
    inputGuardUIAvatarsSrc,
    inputGuardTelephone,
    inputGuardIIN,
    inputGuardGuardPosts) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      // Отправляем запрос на сервер
      const responce = await createGuard(
        inputGuardSurname,
        inputGuardFirstName,
        inputGuardPatronymic,
        inputGuardUIAvatarsSrc,
        inputGuardTelephone,
        inputGuardIIN,
        inputGuardGuardPosts
      );

      // Обновляем таблицу в памяти
      setTableGuards(array => {
        array.unshift(responce.guard);
        return array;
      });

      // Обновляем отображаемую таблицу
      setRenderTableGuards(array => {
        array.unshift(responce.guard);
        return array;
      });

      // Закрываем модальное окно
      setGuardEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardEditForm);

    } finally {

      MOBXui.setLoading();

    }

  }

  /*--Изменение охранника Формой редактирования----------------------------------------------------------*/
  const guardEdit = async (event,
    inputGuardSurname,
    inputGuardFirstName,
    inputGuardPatronymic,
    inputGuardUIAvatarsSrc,
    inputGuardTelephone,
    inputGuardIIN,
    inputGuardGuardPosts) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {
      // console.log('inputGuardIIN', inputGuardIIN);
      // Отправляем запрос на сервер
      const responce = await editGuard(
        guardEditForm.guard._id,
        inputGuardSurname,
        inputGuardFirstName,
        inputGuardPatronymic,
        inputGuardUIAvatarsSrc,
        inputGuardTelephone,
        inputGuardIIN,
        inputGuardGuardPosts
      );

      // Обновляем таблицу в памяти
      setTableGuards(array => {
        const index = array.findIndex(element => {
          return element._id == responce.guard._id
        });

        if (index)
          array[index] = responce.guard;
        return array;
      });

      // Обновляем отображаемую таблицу
      setRenderTableGuards(array => {
        array[guardEditForm.index] = responce.guard;
        return array;
      });

      // Закрываем модальное окно
      setGuardEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*--Модальное окно Формы удаления----------------------------------------------------------------------*/
  const [guardDeleteForm, setGuardDeleteForm] = useState({
    isOpen: false
  });

  /*--Функция удаления поста Формы удаления--------------------------------------------------------------*/
  const guardDeleteFormSubmit = async (event, reason) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        // Отправляем запрос на сервер
        const responce = await deleteGuard(
          guardDeleteForm.guardId,
          MOBXuser.user.id,
          reason
        );

        // Обновляем таблицу в памяти
        setTableGuards(array => {
          const result = array.filter(value => {
            return responce.guard._id != value._id;
          })
          return result
        });

        // Обновляем отображаемую таблицу
        setRenderTableGuards(array => {
          const result = array.filter(value => {
            return responce.guard._id != value._id;
          })
          return result
        });

        // Обнавляем таблицу архива
        setTableGuardsArchive(array => {
          array.unshift(responce.guard);
          return array;
        });

        // Закрываем модальное окно
        setGuardDeleteForm({ isOpen: false });
      }

    } catch (error) {

      errorCallback(error, setGuardDeleteForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*--Переиспользование функции обработок ошибок---------------------------------------------------------*/
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

  /*-----------------------------------------------------------------------------------------------------*/
  useEffect(()=>{
    return ()=>{
      filterringTimeout.current && clearTimeout(filterringTimeout.current);
    }
  }, []);

  /*-----------------------------------------------------------------------------------------------------*/

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

        {/* Кнопка создания охранника */}
        <div className='flex-1 md:order-last md:ml-2 w-full flex justify-end'>

          {/* Кнопка создания охранника */}
          {ARcreateGuard && <button
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
              setRenderTableGuards([...tableGuards]);
            }}
          />

        </div>

      </div>

      {/* {Таблица охранников} */}
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
            {(AReditGuard || ARdeleteGuard) &&
              <th className="block md:table-cell md:border bg-color_B p-2" />}

          </tr>
        </thead>

        {/* {Тело таблицы} */}
        <tbody className="block md:table-row-group">

          {renderTableGuards?.map((guard, index) => {
            return (

              <tr className="rounded-md md:border-none block md:table-row bg-color_G mb-2" key={guard._id}>

                {/* {Аватар, инициалы, кнопки управления мобильного телефона} */}
                <td className="p-2 md:border text-left block md:table-cell">
                  <div className="flex flex-row items-center justify-between md:justify-start">

                    {/* {Аватар} */}
                    {guard.uiAvatarsSrc && <Image
                      className="h-8 w-8 rounded-full"
                      width={32}
                      height={32}
                      src={guard.uiAvatarsSrc}
                      alt=""
                    />}

                    {/* {Инициалы} */}
                    <p className="text-black ml-1 text-xl font-bold">{[guard.surname, guard.firstName].join(' ')}</p>

                  </div>
                </td>

                {/* {Телефон} */}
                <td className="px-1 md:p-2 md:border text-left md:table-cell flex flex-row items-center">
                  {guard.telephone?.length > 0 &&
                    <span className="break-all md:break-normal">
                      <b className='md:hidden'>Телефон</b> {guard.telephone}
                    </span>}
                </td>

                {/* {Кнопки управления компьютера} */}
                {(AReditGuard || ARdeleteGuard) &&
                  <td className="p-2 md:border text-left block md:table-cell md:w-1">
                    <div className='flex justify-end space-x-2'>

                      {AReditGuard &&
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
                          <PencilSquareIcon
                            className="h-4 w-4"
                          />
                          <span className='hidden lg:block'>Изменить</span>
                        </FButtonRed>}

                      {ARdeleteGuard &&
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
                        </FButtonWhite>}

                    </div>
                  </td>}

              </tr>

            )
          })}

        </tbody>

      </table>

      {/* {Форма добавления/редактирования охранника} */}
      <FGuardEditForm
        form={guardEditForm}
        setForm={setGuardEditForm}
        submitAdd={guardAdd}
        submitEdit={guardEdit}
        guardPosts={guardPosts}
        users={users}
      />

      {/* {Форма удаления охранника} */}
      <FGuardDeleteForm
        form={guardDeleteForm}
        setForm={setGuardDeleteForm}
        submit={guardDeleteFormSubmit}
      />

    </motion.div>
  )

};