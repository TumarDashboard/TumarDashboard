import { CalendarIcon, ChevronDownIcon, ChevronUpIcon, PencilSquareIcon, PlusIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from 'react';

import { ApiError } from "../../../middleware/exceptions";
import { useStore } from "../../levelA/StoreProvider";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";

import { createSimCard, deleteSimCard, editSimCard } from '../../../src/dtos/dtoSimCard';
import { FSimCardDeleteForm } from '../../levelD_modal/simCard/FSimCardDeleteForm';
import { FSimCardEditForm } from '../../levelD_modal/simCard/FSimCardEditForm';
import { FSimCardPrintForm } from '../../levelD_modal/simCard/FSimCardPrintForm';
import { FFilterText } from '../../levelE_low/FFilterText';
import { FTooltip } from '../../levelE_low/FTooltip';
import { FSimCardUploadForm } from '../../levelD_modal/simCard/FSimCardUploadForm';

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

    case 'msisdn':
      if (a.msisdn && b.msisdn)
        return (a.msisdn - b.msisdn) * invert;
      else return -1;

    case 'iccid':
      if (a.iccid && b.iccid)
        return (a.iccid - b.iccid) * invert;
      else return -1;

    case 'provider':
      return (a.provider?.localeCompare(b.provider)) * invert;
      
    default:
      break;
  }
}

export default function FFormSimCards({ accessRules, userData, tableSimCards, 
  setTableSimCards, setTableSimCardsArchive }) {
  /*----Использование глобальных данных-------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();

  // const [error, setError] = useState('');

  /*----Определение правил доступа------------------------------------------------------------------------------------*/
  const ARcreateSimCard = accessRules.includes('createSimCard');
  const AReditSimCard = accessRules.includes('editSimCard');
  const ARdeleteSimCard = accessRules.includes('deleteSimCard');
  const ARgetSimCardPrint = accessRules.includes('reportSimCards');
  const ARgetSimCardID = accessRules.includes('simCards(?=.)/');
  const ARloadSimCardData = true;
  // console.log('accessRules %o',accessRules);

  /*----Заголовки таблицы------------------------------------------------------------------------------------------------*/
  const constTableHead = [
    { value: 'msisdn', label: 'Абон. номер' },
    { value: 'iccid', label: 'Серийный номер' },
    { value: 'provider', label: 'Провайдер' },
  ].filter(Boolean);

  /*----Данные таблицы------------------------------------------------------------------------------------------------*/
  const [renderTableSimCards, setRenderTableSimCards] = useState(tableSimCards ? [...tableSimCards] : []);

  /*----Сортировка таблицы--------------------------------------------------------------------------------------------*/
  const [sortingRule, setSortingRule] = useState();

  const sortingTable = (rule) => {

    const invert = rule == sortingRule ? -1 : 1;

    setRenderTableSimCards(array => {
      return [...array.sort((a, b) => sortingTableCallback(a, b, rule, invert))];
    });

    setSortingRule(rule == sortingRule ? '!' + rule : rule);

  }

  /*----Фильтрация таблицы--------------------------------------------------------------------------------------------*/
  const [inputFilterText, setInputFilterText] = useState([]);
  const filterringTimeout = useRef();

  const filteringTable = (text) => {

    const filtersArray = text.toLowerCase().split(' ');

    setRenderTableSimCards(

      tableSimCards.filter(value => {

        const parametrsArray = [
          value.msisdn,
          value.iccid,
          value.provider,
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
  const [simCardEditForm, setSimCardEditForm] = useState({
    isOpen: false
  });

  /*----Создание пультовой объекта Формы редактирования----------------------------------------------------------------------*/
  const simCardAdd = async (event,
    inputSimCardMSISDN,
    inputSimCardICCID,
    inputSimCardProvider
    ) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      // Отправляем запрос на сервер
      const responce = await createSimCard(
        inputSimCardMSISDN,
        inputSimCardICCID,
        inputSimCardProvider
      );

      // Обновляем таблицу в памяти
      setTableSimCards(array => {
        array.unshift(responce.simCard);
        return array;
      });

      // Обновляем отображаемую таблицу
      setRenderTableSimCards(array => {
        array.unshift(responce.simCard);
        return array;
      });

      // Закрываем модальное окно
      setSimCardEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setSimCardEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----Изменение пультовой объекта Формы редактирования---------------------------------------------------------------------*/
  const simCardEdit = async (event,
    inputSimCardMSISDN,
    inputSimCardICCID,
    inputSimCardProvider
    ) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      // Отправляем запрос на сервер
      const responce = await editSimCard(
        simCardEditForm.simCard._id,
        inputSimCardMSISDN,
        inputSimCardICCID,
        inputSimCardProvider
      );

      // Обновляем таблицу в памяти
      setTableSimCards(array => {
        const index = array.findIndex(element => {
          return element._id == responce.simCard._id
        });
        if (index) {
          array[index] = responce.simCard;
        }
        return array;
      });

      // Обновляем отображаемую таблицу
      setRenderTableSimCards(array => {
        array[simCardEditForm.index] = responce.simCard;
        return array;
      });

      // Закрываем модальное окно
      setSimCardEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setSimCardEditForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----Модальное окно Формы удаления-------------------------------------------------------------------------------*/
  const [simCardDeleteForm, setSimCardDeleteForm] = useState({
    isOpen: false
  });

  /*----Функция удаления поста Формы удаления-------------------------------------------------------------------------*/
  const simCardDeleteFormSubmit = async (event, reason) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        // Отправляем запрос на сервер
        const responce = await deleteSimCard(
          simCardDeleteForm.simCardId,
          MOBXuser.user.id,
          reason
        );

        // Обновляем таблицу в памяти
        setTableSimCards(array => {
          const result = array.filter(value => {
            return responce.simCard._id != value._id;
          })
          return result
        });

        // Обновляем отображаемую таблицу
        setRenderTableSimCards(array => {
          const result = array.filter(value => {
            return responce.simCard._id != value._id;
          })
          return result
        });

        // Обнавляем таблицу архива
        setTableSimCardsArchive(array => {
          array.unshift(responce.simCard);
          return array;
        });

        // Закрываем модальное окно
        setSimCardDeleteForm({ isOpen: false });
      }

    } catch (error) {

      errorCallback(error, setSimCardDeleteForm);

    } finally {

      MOBXui.setLoading();

    }
  }

  /*----Модальное окно Формы выгрузки отчётов пультовых объектов-------------------------------------------------------*/
  const [simCardPrintForm, setSimCardPrintForm] = useState({
    isOpen: false
  });

  /*----Модальное окно Формы загрузки данных пультовых объектов--------------------------------------------------------*/
  const [simCardUploadForm, setSimCardUploadForm] = useState({
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
  const getSimCardIDtimeout = useRef();
  const [tooltipReference, setTooltipReference] = useState(null);

  /*------------------------------------------------------------------------------------------------------------------*/
  useEffect(() => {

    return () => {
      filterringTimeout.current && clearTimeout(filterringTimeout.current);
      getSimCardIDtimeout.current && clearInterval(getSimCardIDtimeout.current);

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

        {/* Кнопка выгрузки отчетов, кнопка создания */}
        <div className='flex-1 md:order-last md:ml-2 w-full flex justify-end'>

          {/* Кнопка вызова окна отчётов */}
          {ARgetSimCardPrint && tableSimCards?.length > 0 && (<button
            className="bg-color_F h-10 w-10 flex justify-center items-center rounded-full
            hover:bg-color_C active:bg-color_B mr-2"
            onClick={() => {
              setSimCardPrintForm({
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

          {/* Кнопка загрузки данных */}
          {ARloadSimCardData && <button
            className="bg-color_F h-10 w-10 flex justify-center items-center rounded-full
            hover:bg-color_C active:bg-color_B mr-2"
            onClick={() => {
              setSimCardUploadForm({
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

          {/* Кнопка создания */}
          {ARcreateSimCard && <button
            className="bg-color_F h-10 w-10 flex justify-center items-center rounded-full
            hover:bg-color_C active:bg-color_B"
            onClick={() => {
              setSimCardEditForm({
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
              setRenderTableSimCards([...tableSimCards]);
            }}
          />

        </div>

      </div>

      {/* {Таблица} */}
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
            {(AReditSimCard || ARdeleteSimCard) &&
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

          {renderTableSimCards.map((simCard, index) => {
            return (

              <tr
                className={`rounded-md md:border-none block md:table-row bg-color_G mb-2 ${ARgetSimCardID && 'cursor-pointer'}`}
                key={simCard._id}
                onPointerDown={(event) => {
                  if (ARgetSimCardID) {
                    event.stopPropagation();
                    getSimCardIDtimeout.current && clearTimeout(getSimCardIDtimeout.current);
                    getSimCardIDtimeout.current = setTimeout(() => {
                      router.push(`/dashboard/simCards/${simCard._id}`);
                      getSimCardIDtimeout.current && clearTimeout(getSimCardIDtimeout.current);
                    }, 1000);
                  }
                }}
                onPointerUp={(event) => {
                  getSimCardIDtimeout.current && clearTimeout(getSimCardIDtimeout.current);
                }}
                onPointerLeave={(event) => {
                  getSimCardIDtimeout.current && clearTimeout(getSimCardIDtimeout.current);
                }}
                onPointerCancel={(event) => {
                  getSimCardIDtimeout.current && clearTimeout(getSimCardIDtimeout.current);
                }}
              >

                {/* { Номер} */}
                <td className="px-2 md:border text-left block md:table-cell">
                  <div className="flex flex-row items-center justify-start">

                    {/* {Номер} */}
                    <p className="text-black ml-1 text-xl font-bold">{simCard.msisdn}</p>

                  </div>
                </td>

                {/* {Серийный номер} */}
                <td className="px-1 md:p-2 md:border text-left block md:table-cell">
                  {simCard.iccid && <span>{simCard.iccid}</span>}
                </td>

                {/* {Провайдер} */}
                <td className="px-1 md:p-2 md:border text-left block md:table-cell">
                  {simCard.provider && <span>{simCard.provider}</span>}
                </td>

                {/* {Кнопки управления компьютера} */}
                {(AReditSimCard || ARdeleteSimCard ) &&
                  <td className="p-2 md:border text-left block md:table-cell md:w-1">
                    <div className='flex justify-end space-x-2'>

                      {AReditSimCard &&
                        <FButtonRed
                          className="flex"
                          onPointerEnter={event => setTooltipReference({ target: event.currentTarget, text: `Редактировать сим-карту - ${simCard.iccid}` })}
                          onPointerLeave={() => setTooltipReference(null)}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSimCardEditForm({
                              isOpen: true,
                              index: index,
                              operation: 'Изменить',
                              key: Math.random().toString(36),
                              simCard: simCard
                            })
                          }}
                        >
                          <PencilSquareIcon
                            className="h-4 w-4"
                          />
                        </FButtonRed>}

                      {ARdeleteSimCard &&
                        <FButtonWhite
                          className="flex"
                          onPointerEnter={event => setTooltipReference({ target: event.currentTarget, text: `Удалить сим карту - ${simCard.iccid}` })}
                          onPointerLeave={() => setTooltipReference(null)}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSimCardDeleteForm({
                              isOpen: true,
                              key: Math.random().toString(36),
                              simCardNumber: simCard.iccid,
                              simCardId: simCard._id,
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

      {/* {Форма добавления/редактирования} */}
      <FSimCardEditForm
        accessRules={accessRules}
        form={simCardEditForm}
        setForm={setSimCardEditForm}
        submitAdd={simCardAdd}
        submitEdit={simCardEdit}
      />

      {/* {Форма удаления} */}
      <FSimCardDeleteForm
        form={simCardDeleteForm}
        setForm={setSimCardDeleteForm}
        submit={simCardDeleteFormSubmit}
      />

      {/* {Форма выгрузки отчётов} */}
      <FSimCardPrintForm
        accessRules={accessRules}
        form={simCardPrintForm}
        setForm={setSimCardPrintForm}
        MOBXui={MOBXui}
        MOBXuser={MOBXuser}
        errorCallback={errorCallback}
        simCards={tableSimCards}
      />

      {/* {Форма загрузки данных} */}
      <FSimCardUploadForm
        accessRules={accessRules}
        form={simCardUploadForm}
        setForm={setSimCardUploadForm}
        MOBXui={MOBXui}
        MOBXuser={MOBXuser}
        errorCallback={errorCallback}
        setTableSimCards={setTableSimCards}
        setTableSimCardsArchive={setTableSimCardsArchive}
        setRenderTableSimCards={setRenderTableSimCards}
      />

      {/* {Подсказка таблицы} */}
      <FTooltip
        reference={tooltipReference}
      />
    </motion.div>
  )

};