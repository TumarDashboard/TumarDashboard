import { motion } from "framer-motion";
import Image from 'next/image';
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, XIcon } from '@heroicons/react/solid';

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
  { value: 'login', label: 'Логин' },
  { value: 'positions', label: 'Должность' },
  { value: 'email', label: 'Почта' },
  { value: 'status', label: 'Статус' },
];

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
    case 'login':
      return (a.surname.localeCompare(b.surname) || a.firstName.localeCompare(b.firstName)) * invert;

    case 'positions':
      return (JSON.stringify(a.positionsText).localeCompare(JSON.stringify(b.positionsText))) * invert;

    case 'email':
      return (a.email.localeCompare(b.email)) * invert;

    case 'status':
      return (a.isActivated == b.isActivated) * invert;

    default:
      break;
  }
}

var filterringTimeout = null;

export default function FFormUsers({ users }) {

  /*-------------------------------------------------------------------------------------------------------
      Данные таблицы
  -------------------------------------------------------------------------------------------------------*/
  var tableUsers = users ? users : [];

  const [renderTableUsers, setRenderTableUsers] = useState(users ? users : []);

  /*-------------------------------------------------------------------------------------------------------
      Сортировка таблицы
  -------------------------------------------------------------------------------------------------------*/
  const [sortingRule, setSortingRule] = useState();

  const sortingTable = (rule) => {

    const invert = rule == sortingRule ? -1 : 1;

    setRenderTableUsers(array => {
      return [...array.sort((a, b) => sortingTableCallback(a, b, rule, invert))];
    });

    setSortingRule(rule == sortingRule ? '!' + rule : rule);

  }

  /*-------------------------------------------------------------------------------------------------------
      Фильтрация таблицы
  -------------------------------------------------------------------------------------------------------*/
  const [inputFilterText, setInputFilterText] = useState([]);

  const filteringTable = (text) => {
    
    const filtersArray = text.toLowerCase().split(' ');

    setRenderTableUsers(

      tableUsers.filter(value => {

        const parametrsArray = [
          value.surname,
          value.firstName,
          value.patronymic,
          value.email,
          ...value.positionsText,
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

  /*----------------------------------------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------*/

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

        {/* {Кнопка добавления} */}
        <div
          className='flex-1 md:order-last md:ml-2 w-full flex justify-end'
        >

          {/* {Кнопка добавления} */}
          <button
            className="bg-color_F h-10 w-10 flex justify-center items-center rounded-full
          hover:bg-color_C active:bg-color_B"
            onClick={() => { }}
          >
            <PlusIcon
              className="h-8 w-8 fill-color_C
            hover:fill-color_F"
            />
          </button>

        </div>

        {/* Фильтр, кнопка чистки фильтра */}
        <div
          className='flex-0 w-full flex space-x-2'
        >
          {/* Фильтр */}
          <input
            type="text"
            placeholder="Фильтр"
            value={inputFilterText}
            onChange={(e)=>{
              setInputFilterText(e.target.value);
              if( filterringTimeout ){
                clearTimeout( filterringTimeout );
                filterringTimeout = null;
              }
              filterringTimeout = setTimeout(()=>filteringTable(e.target.value), 500);
            }}
            className="flex-1 w-full p-1
          border border-gray-300 rounded-md"
          />

          {/* Кнопка чистки фильтра */}
          <button
            className="bg-color_B h-8 w-8 flex justify-center items-center rounded-md
          hover:bg-color_C active:bg-color_B disabled:opacity-25"
            onClick={() => {
              setInputFilterText('');
              setRenderTableUsers(tableUsers);
            }}
            disabled={inputFilterText.length == 0}
          >
            <XIcon
              className="h-8 w-8 fill-color_F
            hover:fill-color_G"
            />
          </button>

        </div>

      </div>

      {/* {Таблица пользователей} */}
      <table className="min-w-full border-collapse block md:table">

        {/* {Заголовок таблицы} */}
        <thead className="block md:table-header-group select-none">

          <tr 
            className="border md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative"
          >
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
          </tr>

        </thead>

        {/* {Тело таблицы} */}
        <tbody className="block md:table-row-group">

          {renderTableUsers.length > 0 && renderTableUsers.map((user) => {
            return (

              <tr 
                className="rounded-md md:border-none block md:table-row bg-color_G mb-2 cursor-pointer" 
                key={user._id}
              >

                {/* {Аватар, инициалы} */}
                <td className="p-2 md:border text-left block md:table-cell">
                  <div
                    className=" flex flex-row items-center"
                  >

                    {/* {Аватар} */}
                    <Image
                      className="h-8 w-8 rounded-full"
                      width={32}
                      height={32}
                      src={user.uiAvatarsSrc}
                      alt=""
                    />

                    {/* {инициалы} */}
                    <p className="font-semibold text-black ml-1">{[user.surname, user.firstName, user.patronymic].join(' ')}</p>

                  </div>
                </td>

                {/* {Должность} */}
                <td className="p-2 md:border text-left block md:table-cell">
                  {user.positionsText &&
                    <><span className="inline-block w-1/3 md:hidden font-bold">Должность</span>
                      {user.positionsText.map(positionText => <p key={`${user._id}${positionText}`}>{positionText}</p>)}</>
                  }
                </td>

                {/* {Почта} */}
                <td className="p-2 md:border text-left block md:table-cell">
                  <span className="inline-block w-1/3 md:hidden font-bold">Почта</span>{user.email}
                </td>

                {/* {Статус} */}
                <td className="p-2 md:border text-left block md:table-cell">
                  <span className="inline-block w-1/3 md:hidden font-bold">Статус</span>
                  <span className={`px-2 py-1 font-semibold leading-tight rounded-sm 
                    ${user.isActivated ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'}`}>
                    {user.isActivated ? 'Активирован' : 'Не активирован'}
                  </span>
                </td>

              </tr>

            )
          })}

        </tbody>

      </table>

    </motion.div>
  );

};