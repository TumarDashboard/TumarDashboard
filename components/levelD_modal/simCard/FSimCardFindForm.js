import { useEffect, useRef, useState } from 'react';
import { FModalForm } from '../FModalForm';

import useSWRMutation from 'swr/mutation';
import { fetchAuthMethod } from "../../../middleware/requests";
import { FButtonRed } from "../../levelE_low/FButtonRed";

import { FFilterText } from '../../levelE_low/FFilterText';

export function FSimCardFindForm({ accessRules, form, setForm, submit }) {

  /*--Использование глобальных данных--------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');

  /*--Определение правил доступа-------------------------------------------------------------------------*/
  // const AReditSimCardManager = !accessRules.includes('editSimCard/apiBlock/manager');
  // const AReditSimCardRate = !accessRules.includes('editSimCard/apiBlock/rate');

  /*--Запрос данных на сервере---------------------------------------------------------------------*/
  const {
    data: serverData,
    isMutating: isMutatingFromServer,
    trigger: triggerFromServer,
    reset: resetServerData,
    error: error
  } = useSWRMutation('/method/modal/getSimCardFindForm', fetchAuthMethod,{
    throwOnError: false
  });

  /*----Фильтрация таблицы-------------------------------------------------------------------------------*/
  const [inputFilterText, setInputFilterText] = useState([]);
  const filterringTimeout = useRef();

  const filteringTable = (text) => {

    const filter = text?.toLowerCase().replaceAll(/[^\w]/g, '');

    if(filter && filter.length > 3)
      triggerFromServer(filter);

  }

  /*--Выбранные данные-----------------------------------------------------------------------------------*/
  
  const [inputChecked, setInputChecked] = useState();

  const [inputSelected, setInputSelected] = useState();

  /*--Чистка/Обновление инпутов--------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {

      setOperation(form.operation);
      setInputFilterText(form.value);
      filteringTable(form.value);

    } else {
      setInputChecked(null);
      setInputSelected(null);
      resetServerData();
    }
    return () => {
      filterringTimeout.current && clearTimeout(filterringTimeout.current);
    }
  }, [form])

  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={'Поиск сим-карты'}
      widthForm='w-full lg:w-1/2 mx-6'
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[90vh]"
    >

      {/* Выбранный элемент */}
      {inputSelected &&
      <div className="form-item flex items-center">
        <label className="text-lg flex-none pr-2">Выбрано:</label>
        <p><b>{inputSelected.msisdn}</b> | {inputSelected.iccid}</p>
      </div>}

      {/* Фильтр и кнопка выбора */}
      <div className="form-item flex items-center w-full space-x-2">

        {/* Фильтр */}
        <FFilterText
          value={inputFilterText ? inputFilterText : ''}
          onChange={(e) => {
            setInputFilterText(e.target.value);
            filterringTimeout.current && clearTimeout(filterringTimeout.current);
            filterringTimeout.current = setTimeout(() => filteringTable(e.target.value), 500);
          }}
          onClear={() => {
            setInputFilterText('');
          }}
          key={form.key}
        />

        {/* Кнопка выбора */}
        <FButtonRed
          className=""
          disabled={inputChecked == null}
          onClick={(e) => submit(e, inputSelected)}
        >
          Выбрать
        </FButtonRed>

      </div>

      {/* Таблица данных сервера */}
      {serverData?.length>0 && 
      <fieldset className="form-item w-full mt-4">
        {serverData.map((element, index)=>{

          const bodyRowFillColor = index & 1 ? 'bg-white' : 'bg-slate-100';

          return <div
            className={`flex w-full items-center hover:bg-slate-200 rounded-xl ${bodyRowFillColor}`}
            key={element._id}
          >
            <input 
              type="radio"
              id={"radio"+element._id}
              className='mx-4'
              onChange={(e)=>{
                setInputChecked(index);
                setInputSelected(element);
              }}
              checked={inputChecked==index}
            />
            <label
              htmlFor={"radio"+element._id}
              className="flex w-full justify-around text-xs flex-col sm:flex-row my-1"
            >
              <b>{element.msisdn}</b>
              <p>{element.iccid}</p>
            </label>
          </div>
        })}
      </fieldset>}

      {/* Статус ошибки */}
      <div className="form-item">
        <span className="text-color_C italic break-words">
          {error?.message}
        </span>
      </div>

    </FModalForm>
  )
}