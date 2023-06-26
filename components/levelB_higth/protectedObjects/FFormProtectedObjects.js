import { CalendarIcon, ChevronDownIcon, ChevronUpIcon, PencilSquareIcon, PlusIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from 'react';

import { ApiError } from "../../../middleware/exceptions";
import { useStore } from "../../levelA/StoreProvider";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";

import { createProtectedObject, deleteProtectedObject, editProtectedObject } from '../../../src/dtos/dtoProtectedObject';
import { FProtectedObjectDeleteForm } from '../../levelD_modal/protectedObject/FProtectedObjectDeleteForm';
import { FProtectedObjectEditForm } from '../../levelD_modal/protectedObject/FProtectedObjectEditForm';
import { FProtectedObjectPrintForm } from '../../levelD_modal/protectedObject/FProtectedObjectPrintForm';
import { FFilterText } from '../../levelE_low/FFilterText';
import { FTooltip } from '../../levelE_low/FTooltip';
import { FProtectedObjectUploadForm } from '../../levelD_modal/protectedObject/FProtectedObjectUploadForm';

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

export default function FFormProtectedObjects({ accessRules, userData, tableProtectedObjects, 
  setTableProtectedObjects, setTableProtectedObjectsArchive }) {
  /*----Использование глобальных данных-------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();

  // const [error, setError] = useState('');

  /*----Определение правил доступа------------------------------------------------------------------------------------*/
  const ARcreateProtectedObject = accessRules.includes('createProtectedObject');
  const AReditProtectedObject = accessRules.includes('editProtectedObject');
  const ARdeleteProtectedObject = accessRules.includes('deleteProtectedObject');
  const ARgetProtectedObjectPrint = accessRules.includes('reportProtectedObjects');
  const ARgetProtectedObjectID = accessRules.includes('protectedObjects(?=.)/');
  const ARloadProtectedObjectData = true;
  // console.log('accessRules %o',accessRules);

  /*----Заголовки таблицы------------------------------------------------------------------------------------------------*/
  const constTableHead = [
    { value: 'number', label: '№' },
    { value: 'name', label: 'Наименование' },
    { value: 'address', label: 'Адрес' },
  ].filter(Boolean);

  /*----Данные таблицы------------------------------------------------------------------------------------------------*/
  const [renderTableProtectedObjects, setRenderTableProtectedObjects] = useState(tableProtectedObjects ? [...tableProtectedObjects] : []);

  /*----Сортировка таблицы--------------------------------------------------------------------------------------------*/
  const [sortingRule, setSortingRule] = useState();

  const sortingTable = (rule) => {

    // if (rule == constTableHeadControl.value) {
    //   setRenderTableProtectedObjects(array => {
    //     return [...array.sort((a, b) => {
    //       return (a.manager?._id === MOBXuser?.user?.id) * -1;
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

      tableProtectedObjects.filter(value => {

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

  /*----Модальное окно Формы редактирования---------------------------------------------------------------------------*/
  const [protectedObjectEditForm, setProtectedObjectEditForm] = useState({
    isOpen: false
  });

  /*----Создание пультовой объекта Формы редактирования----------------------------------------------------------------------*/
  const protectedObjectAdd = async (event,
    inputProtectedObjectNumber,
    inputProtectedObjectName,
    inputProtectedObjectAddress,
    inputProtectedObjectPhoto,
    inputProtectedObjectDescription
    ) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      // Отправляем запрос на сервер
      const responce = await createProtectedObject(
        inputProtectedObjectNumber,
        inputProtectedObjectName,
        inputProtectedObjectAddress,
        inputProtectedObjectPhoto,
        inputProtectedObjectDescription
      );

      // Обновляем таблицу в памяти
      setTableProtectedObjects(array => {
        array.unshift(responce.protectedObject);
        return array;
      });

      // Обновляем отображаемую таблицу
      setRenderTableProtectedObjects(array => {
        array.unshift(responce.protectedObject);
        return array;
      });

      // Закрываем модальное окно
      setProtectedObjectEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setProtectedObjectEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----Изменение пультовой объекта Формы редактирования---------------------------------------------------------------------*/
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

      // Отправляем запрос на сервер
      const responce = await editProtectedObject(
        protectedObjectEditForm.protectedObject._id,
        inputProtectedObjectNumber,
        inputProtectedObjectName,
        inputProtectedObjectAddress,
        inputProtectedObjectPhoto,
        inputProtectedObjectDescription
      );

      // Обновляем таблицу в памяти
      setTableProtectedObjects(array => {
        const index = array.findIndex(element => {
          return element._id == responce.protectedObject._id
        });
        if (index) {
          responce.protectedObject.guardsToday = array[index].guardsToday;
          array[index] = responce.protectedObject;
        }
        return array;
      });

      // Обновляем отображаемую таблицу
      setRenderTableProtectedObjects(array => {
        responce.protectedObject.guardsToday = array[protectedObjectEditForm.index].guardsToday;
        array[protectedObjectEditForm.index] = responce.protectedObject;
        return array;
      });

      // Закрываем модальное окно
      setProtectedObjectEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setProtectedObjectEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----Модальное окно Формы удаления-------------------------------------------------------------------------------*/
  const [protectedObjectDeleteForm, setProtectedObjectDeleteForm] = useState({
    isOpen: false
  });

  /*----Функция удаления поста Формы удаления-------------------------------------------------------------------------*/
  const protectedObjectDeleteFormSubmit = async (event, reason) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        // Отправляем запрос на сервер
        const responce = await deleteProtectedObject(
          protectedObjectDeleteForm.protectedObjectId,
          MOBXuser.user.id,
          reason
        );

        // Обновляем таблицу в памяти
        setTableProtectedObjects(array => {
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

        // Обнавляем таблицу архива
        setTableProtectedObjectsArchive(array => {
          array.unshift(responce.protectedObject);
          return array;
        });

        // Закрываем модальное окно
        setProtectedObjectDeleteForm({ isOpen: false });
      }

    } catch (error) {

      errorCallback(error, setProtectedObjectDeleteForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----Модальное окно Формы выгрузки отчётов пультовых объектов-------------------------------------------------------*/
  const [protectedObjectPrintForm, setProtectedObjectPrintForm] = useState({
    isOpen: false
  });

  /*----Модальное окно Формы загрузки данных пультовых объектов--------------------------------------------------------*/
  const [protectedObjectUploadForm, setProtectedObjectUploadForm] = useState({
    isOpen: false
  });

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

  /*----Референс подсказки--------------------------------------------------------------------------------------------*/
  const getProtectedObjectIDtimeout = useRef();
  const [tooltipReference, setTooltipReference] = useState(null);

  /*------------------------------------------------------------------------------------------------------------------*/
  useEffect(() => {

    return () => {
      filterringTimeout.current && clearTimeout(filterringTimeout.current);
      getProtectedObjectIDtimeout.current && clearInterval(getProtectedObjectIDtimeout.current);

      MOBXui.setUpdateState(false);
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

        {/* Кнопка выгрузки табеля, кнопка создания пультовой объекта */}
        <div className='flex-1 md:order-last md:ml-2 w-full flex justify-end'>

          {/* Кнопка вызова окна отчётов */}
          {ARgetProtectedObjectPrint && tableProtectedObjects?.length > 0 && (<button
            className="bg-color_F h-10 w-10 flex justify-center items-center rounded-full
            hover:bg-color_C active:bg-color_B mr-2"
            onClick={() => {
              setProtectedObjectPrintForm({
                isOpen: true,
                key: Math.random().toString(36)
              })
            }}
          >
            <CalendarIcon
              className="h-8 w-8 fill-color_C
              hover:fill-color_F"
            />
          </button>)}

          {/* Кнопка создания пультового объекта */}
          {ARloadProtectedObjectData && <button
            className="bg-color_F h-10 w-10 flex justify-center items-center rounded-full
            hover:bg-color_C active:bg-color_B mr-2"
            onClick={() => {
              setProtectedObjectUploadForm({
                isOpen: true,
                key: Math.random().toString(36)
              })
            }}
          >
            <CloudArrowUpIcon
              className="h-8 w-8 fill-color_C
              hover:fill-color_F"
            />
          </button>}

          {/* Кнопка создания пультового объекта */}
          {ARcreateProtectedObject && <button
            className="bg-color_F h-10 w-10 flex justify-center items-center rounded-full
            hover:bg-color_C active:bg-color_B"
            onClick={() => {
              setProtectedObjectEditForm({
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
              setRenderTableProtectedObjects([...tableProtectedObjects]);
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
            {(AReditProtectedObject || ARdeleteProtectedObject) &&
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
                className={`rounded-md md:border-none block md:table-row bg-color_G mb-2 ${ARgetProtectedObjectID && 'cursor-pointer'}`}
                key={protectedObject._id}
                onPointerDown={(event) => {
                  if (ARgetProtectedObjectID) {
                    event.stopPropagation();
                    getProtectedObjectIDtimeout.current && clearTimeout(getProtectedObjectIDtimeout.current);
                    getProtectedObjectIDtimeout.current = setTimeout(() => {
                      router.push(`/dashboard/protectedObjects/${protectedObject._id}`);
                      getProtectedObjectIDtimeout.current && clearTimeout(getProtectedObjectIDtimeout.current);
                    }, 1000);
                  }
                }}
                onPointerUp={(event) => {
                  getProtectedObjectIDtimeout.current && clearTimeout(getProtectedObjectIDtimeout.current);
                }}
                onPointerLeave={(event) => {
                  getProtectedObjectIDtimeout.current && clearTimeout(getProtectedObjectIDtimeout.current);
                }}
                onPointerCancel={(event) => {
                  getProtectedObjectIDtimeout.current && clearTimeout(getProtectedObjectIDtimeout.current);
                }}
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
                {(AReditProtectedObject || ARdeleteProtectedObject ) &&
                  <td className="p-2 md:border text-left block md:table-cell md:w-1">
                    <div className='flex justify-end space-x-2'>

                      {AReditProtectedObject &&
                        <FButtonRed
                          className="flex"
                          onPointerEnter={event => setTooltipReference({ target: event.currentTarget, text: `Редактировать пультовой объект - ${[protectedObject.number, protectedObject.name].join(' ')}` })}
                          onPointerLeave={() => setTooltipReference(null)}
                          onClick={(event) => {
                            event.stopPropagation();
                            setProtectedObjectEditForm({
                              isOpen: true,
                              index: index,
                              operation: 'Изменить',
                              key: Math.random().toString(36),
                              protectedObject: protectedObject
                            })
                          }}
                        >
                          <PencilSquareIcon
                            className="h-4 w-4"
                          />
                        </FButtonRed>}

                      {ARdeleteProtectedObject &&
                        <FButtonWhite
                          className="flex"
                          onPointerEnter={event => setTooltipReference({ target: event.currentTarget, text: `Удалить пультовой объект - ${[protectedObject.number, protectedObject.name].join(' ')}` })}
                          onPointerLeave={() => setTooltipReference(null)}
                          onClick={(event) => {
                            event.stopPropagation();
                            setProtectedObjectDeleteForm({
                              isOpen: true,
                              key: Math.random().toString(36),
                              protectedObjectNumber: protectedObject.number,
                              protectedObjectId: protectedObject._id,
                            })
                          }}
                        >
                          <TrashIcon
                            className="h-4 w-4"
                          />
                        </FButtonWhite>}

                    </div>
                  </td>}

              </tr>

            )
          })}

        </tbody>

      </table>

      {/* {Форма добавления/редактирования пультовой объекта} */}
      <FProtectedObjectEditForm
        accessRules={accessRules}
        form={protectedObjectEditForm}
        setForm={setProtectedObjectEditForm}
        submitAdd={protectedObjectAdd}
        submitEdit={protectedObjectEdit}
      />

      {/* {Форма удаления пультовой объекта} */}
      <FProtectedObjectDeleteForm
        form={protectedObjectDeleteForm}
        setForm={setProtectedObjectDeleteForm}
        submit={protectedObjectDeleteFormSubmit}
      />

      {/* {Форма выгрузки отчётов пультовых объектов} */}
      <FProtectedObjectPrintForm
        accessRules={accessRules}
        form={protectedObjectPrintForm}
        setForm={setProtectedObjectPrintForm}
        MOBXui={MOBXui}
        MOBXuser={MOBXuser}
        errorCallback={errorCallback}
        protectedObjects={tableProtectedObjects}
      />

      {/* {Форма загрузки данных пультовых объектов} */}
      <FProtectedObjectUploadForm
        accessRules={accessRules}
        form={protectedObjectUploadForm}
        setForm={setProtectedObjectUploadForm}
        MOBXui={MOBXui}
        MOBXuser={MOBXuser}
        errorCallback={errorCallback}
        setTableProtectedObjects={setTableProtectedObjects}
        setTableProtectedObjectsArchive={setTableProtectedObjectsArchive}
        setRenderTableProtectedObjects={setRenderTableProtectedObjects}
      />

      {/* {Подсказка таблицы} */}
      <FTooltip
        reference={tooltipReference}
      />
    </motion.div>
  )

};