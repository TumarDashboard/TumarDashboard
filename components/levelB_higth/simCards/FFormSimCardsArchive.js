import { ChevronDownIcon, ChevronUpIcon, RectangleGroupIcon } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from 'react';

import { ApiError } from "../../../middleware/exceptions";
import { useStore } from "../../levelA/StoreProvider";

import { recoverSimCard } from '../../../src/dtos/dtoSimCard';
import { FSimCardRecoverForm } from '../../levelD_modal/simCard/FSimCardRecoverForm';
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
  { value: 'msisdn', label: 'Абон. номер' },
  { value: 'iccid', label: 'Серийный номер' },
  { value: 'provider', label: 'Провайдер' },
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

export default function FFormSimCardsArchive({ accessRules, userData, tableSimCardsArchive, setTableSimCards, setTableSimCardsArchive, guardsData, users }) {
  /*----Использование глобальных данных-------------------------------------------------------------------------------*/
  const router = useRouter();

  const { MOBXuser, MOBXui } = useStore();

  /*----Определение правил доступа------------------------------------------------------------------------------------*/
  const ARrecoverSimCard = accessRules.includes('recoverSimCard');

  /*----Данные таблицы------------------------------------------------------------------------------------------------*/
  const [renderTableSimCards, setRenderTableSimCards] = useState(tableSimCardsArchive ? [...tableSimCardsArchive] : []);


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

      tableSimCardsArchive.filter(value => {

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

  /*----Модальное окно Формы восстановления---------------------------------------------------------------------------*/
  const [simCardRecoverForm, setSimCardRecoverForm] = useState({
    isOpen: false
  });

  /*----Функция восстановления поста Формы восстановления-------------------------------------------------------------*/
  const simCardRecoverFormSubmit = async (event) => {

    event.preventDefault();

    MOBXui.setLoading();

    try {

      if (MOBXuser.user && MOBXuser.user.id) {

        // Отправляем запрос на сервер
        const responce = await recoverSimCard(
          simCardRecoverForm.formID
        );

        // Обновляем таблицу в памяти
        setTableSimCardsArchive(array => {
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

        // Обнавляем таблицу пультовой объектов в базе
        setTableSimCards(array => {
          array.unshift(responce.simCard);
          return array;
        });

        // Закрываем модальное окно
        setSimCardRecoverForm({ isOpen: false });
      }

    } catch (error) {

      errorCallback(error, setSimCardRecoverForm);

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
              setRenderTableSimCards([...tableSimCardsArchive]);
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
            {ARrecoverSimCard &&
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
                className={`rounded-md md:border-none block md:table-row bg-color_G mb-2`}
                key={simCard._id}
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
                {ARrecoverSimCard &&
                  <td className="p-2 md:border text-left block md:table-cell md:w-1">
                    <div className='flex justify-end space-x-2'>

                      {/* {Кнопка восстановления пультовой объекта} */}
                      {ARrecoverSimCard &&
                        <FButtonWhite
                          className="flex"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSimCardRecoverForm({
                              isOpen: true,
                              key: Math.random().toString(36),
                              formValidate: simCard.msisdn,
                              formReason: simCard.reason,
                              formUserPerformed: simCard.userPerfomed,
                              formID: simCard._id,
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
      <FSimCardRecoverForm
        form={simCardRecoverForm}
        setForm={setSimCardRecoverForm}
        submit={simCardRecoverFormSubmit}
      />

    </motion.div>
  )

};