import { ChevronDownIcon, ChevronUpIcon, RectangleGroupIcon } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from 'react';

import { ApiError } from "../../../middleware/exceptions";
import { useStore } from "../../levelA/StoreProvider";

import { recoverProtectedObject } from '../../../src/dtos/dtoProtectedObject';
import { FProtectedObjectRecoverForm } from '../../levelD_modal/protectedObject/FProtectedObjectRecoverForm';
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
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
  { value: 'number', label: '№' },
  { value: 'name', label: 'Наименование' },
  { value: 'address', label: 'Адрес' },
];

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

    case 'name':
      return (a.name?.localeCompare(b.name)) * invert;

    case 'address':
      return (a.address?.localeCompare(b.address)) * invert;

    default:
      break;
  }
}

export default function FFormProtectedObjectsArchive({ accessRules, userData, tableProtectedObjectsArchive, setTableProtectedObjects, setTableProtectedObjectsArchive, guardsData, users }) {
  /*----Использование глобальных данных-------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();

  /*----Определение правил доступа------------------------------------------------------------------------------------*/
  const ARrecoverProtectedObject = accessRules.includes('recoverProtectedObject');

  /*----Данные таблицы------------------------------------------------------------------------------------------------*/
  const [renderTableProtectedObjects, setRenderTableProtectedObjects] = useState(tableProtectedObjectsArchive ? [...tableProtectedObjectsArchive] : []);


  /*----Сортировка таблицы--------------------------------------------------------------------------------------------*/
  const [sortingRule, setSortingRule] = useState();

  const sortingTable = (rule) => {

    // if (rule == constTableHeadControl.value) {
    //   setRenderTableProtectedObjects(array => {
    //     return [...array.sort((a, b) => {
    //       return (a.manager._id === MOBXuser.user.id) * -1;
    //     })];
    //   });
    // } else {
      const invert = rule == sortingRule ? -1 : 1;
      setRenderTableProtectedObjects(array => {
        return [...array.sort((a, b) => sortingTableCallback(a, b, rule, invert))];
      });
    // }

    setSortingRule(rule == sortingRule ? '!' + rule : rule);

  }

  /*----Фильтрация таблицы--------------------------------------------------------------------------------------------*/
  const [inputFilterText, setInputFilterText] = useState([]);
  const filterringTimeout = useRef();

  const filteringTable = (text) => {

    const filtersArray = text.toLowerCase().split(' ');

    setRenderTableProtectedObjects(

      tableProtectedObjectsArchive.filter(value => {

        const parametrsArray = [
          value.number,
          value.name,
          value.address,
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

  /*----Модальное окно Формы восстановления---------------------------------------------------------------------------*/
  const [protectedObjectRecoverForm, setProtectedObjectRecoverForm] = useState({
    isOpen: false
  });

  /*----Функция восстановления поста Формы восстановления-------------------------------------------------------------*/
  const protectedObjectRecoverFormSubmit = async (event) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        // Отправляем запрос на сервер
        const responce = await recoverProtectedObject(
          protectedObjectRecoverForm.protectedObjectId
        );

        // Обновляем таблицу в памяти
        setTableProtectedObjectsArchive(array => {
          const result = array.filter(value => {
            return responce.protectedObject._id != value._id;
          })
          return result
        });

        // Обновляем отображаемую таблицу
        setRenderTableProtectedObjects(array => {
          const result = array.filter(value => {
            return responce.protectedObject._id != value._id;
          })
          return result
        });

        // Обнавляем таблицу пультовой объектов в базе
        setTableProtectedObjects(array => {
          array.unshift(responce.protectedObject);
          return array;
        });

        // Закрываем модальное окно
        setProtectedObjectRecoverForm({ isOpen: false });
      }

    } catch (error) {

      errorCallback(error, setProtectedObjectRecoverForm);

    } finally {

      MOBXui.setLoading();

    }
  }

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

  /*------------------------------------------------------------------------------------------------------------------*/

  useEffect(() => {

    return () => {
      filterringTimeout.current && clearTimeout(filterringTimeout.current);
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
              setRenderTableProtectedObjects([...tableProtectedObjectsArchive]);
            }}
          />

        </div>

      </div>

      {/* {Таблица пультовой объектов} */}
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
            {ARrecoverProtectedObject &&
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

          {renderTableProtectedObjects.map((protectedObject, index) => {
            return (

              <tr
                className={`rounded-md md:border-none block md:table-row bg-color_G mb-2`}
                key={protectedObject._id}
              >

                {/* {Фото, Номер} */}
                <td className="px-2 md:border text-left block md:table-cell">
                  <div className="flex flex-row items-center justify-start">

                    {/* {Фото} */}
                    {protectedObject.photo && <div
                      className="h-8 w-8"
                    >
                      <Image
                        className="rounded-full"
                        width={32}
                        height={32}
                        src={protectedObject.photo}
                        alt=""
                      />
                    </div>}

                    {/* {Номер} */}
                    <p className="text-black ml-1 text-xl font-bold">{protectedObject.number}</p>

                  </div>
                </td>

                {/* {Наименование} */}
                <td className="px-1 md:p-2 md:border text-left block md:table-cell">
                  {protectedObject.name && <span>{protectedObject.name}</span>}
                </td>

                {/* {Адрес} */}
                <td className="px-1 md:p-2 md:border text-left block md:table-cell items-center">
                  {protectedObject.address && <span><b className='md:hidden'>Адрес</b> {protectedObject.address}</span>}
                </td>

                {/* {Кнопки управления компьютера} */}
                {ARrecoverProtectedObject &&
                  <td className="p-2 md:border text-left block md:table-cell md:w-1">
                    <div className='flex justify-end space-x-2'>

                      {/* {Кнопка восстановления пультовой объекта} */}
                      {ARrecoverProtectedObject &&
                        <FButtonWhite
                          className="flex"
                          onClick={(event) => {
                            event.stopPropagation();
                            setProtectedObjectRecoverForm({
                              isOpen: true,
                              key: Math.random().toString(36),
                              protectedObjectNumber: protectedObject.number,
                              protectedObjectReason: protectedObject.reason,
                              protectedObjectUserPerfomed: protectedObject.userPerfomed,
                              protectedObjectId: protectedObject._id,
                            })
                          }}
                        >
                          <RectangleGroupIcon
                            className="h-4 w-4"
                          />
                          <span className='hidden xl:block'>Восстановить</span>
                        </FButtonWhite>}

                    </div>
                  </td>}

              </tr>

            )
          })}

        </tbody>

      </table>

      {/* {Форма восстановления пультовой объекта} */}
      <FProtectedObjectRecoverForm
        form={protectedObjectRecoverForm}
        setForm={setProtectedObjectRecoverForm}
        submit={protectedObjectRecoverFormSubmit}
      />

    </motion.div>
  )

};