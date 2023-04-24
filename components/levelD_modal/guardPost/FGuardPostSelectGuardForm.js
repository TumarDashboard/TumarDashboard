import { XMarkIcon, PlusIcon } from '@heroicons/react/20/solid';
import { FModalForm } from '../FModalForm';
import { useState, useEffect, useRef } from 'react';
import { FInputFile } from "../../levelE_low/FInputFile";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FSelect } from "../../levelE_low/FSelect";

import { equalArrays } from '../../../src/utils/arrayUtils';
import { FInputInitials } from '../../levelE_low/FInputInitials';
import { FInputTelephone } from '../../levelE_low/FInputTelephone';
import Select from 'react-select';
import { useId } from 'react';
import { FInputText } from '../../levelE_low/FInputText';
import { array } from 'yup';
import { FGuardEditForm } from '../guard/FGuardEditForm';
import { createGuard } from '../../../src/dtos/dtoGuard';
import { FFilterText } from '../../levelE_low/FFilterText';
import { motion } from "framer-motion";

export function FGuardPostSelectGuardForm({ accessRules, form, setForm, submitEdit, optionGuards, 
  setGuards, MOBXui, errorCallback }) {

  /*----Определение правил доступа------------------------------------------------------------------------------------*/
  const ARcreateGuard = accessRules.includes('createGuard');

  /*-------------------------------------------------------------------------------------------------------
      Операция
  -------------------------------------------------------------------------------------------------------*/
  const [error, setError] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Данные для работы Формы редактирования
  -------------------------------------------------------------------------------------------------------*/

  const [optionsForWork, setOptionsForWork] = useState([]);

  /*-------------------------------------------------------------------------------------------------------
      Фильтр Формы редактирования
  -------------------------------------------------------------------------------------------------------*/

  const [inputFilter, setInputFilter] = useState([]);
  const [inputFilterText, setInputFilterText] = useState([]);
  const filterringTimeout = useRef();

  const filterChange = (text) => {
    var text = text.toLowerCase().replace(/\s/g, '');
    if (text) {
      setInputFilter(optionsForWork.filter((value) => { return value.lower?.includes(text) }));
    } else {
      setInputFilter(optionsForWork)
    }
  }

  /*-------------------------------------------------------------------------------------------------------
      Выбранные данные для работы Формы редактирования
  -------------------------------------------------------------------------------------------------------*/

  const [inputGuard, setInputGuard] = useState([]);

  const selectOption = (newValue) => {
    
    setInputFilter(array => {
      return array.filter(element => newValue._id != element._id)
    });

    setOptionsForWork(array => {
      return array.filter(element => newValue._id != element._id)
    });

    setInputGuard(array => {
      array.push(newValue);
      return array;
    });

  }

  const unSelectOption = (value) => {
    setInputGuard(array => {
      return array.filter(element => value._id != element._id)
    });

    setInputFilter(array => {
      array.unshift(value);
      return array;
    });

    setOptionsForWork(array => {
      array.unshift(value);
      return array;
    });

  }

  /*-------------------------------------------------------------------------------------------------------
      Модальное окно Формы редактирования
  -------------------------------------------------------------------------------------------------------*/
  const [guardEditForm, setGuardEditForm] = useState({
    isOpen: false
  });

  /*-------------------------------------------------------------------------------------------------------
      Добавление охранника Формой редактирования
  -------------------------------------------------------------------------------------------------------*/
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

      const responce = await createGuard(
        inputGuardSurname,
        inputGuardFirstName,
        inputGuardPatronymic,
        inputGuardUIAvatarsSrc,
        inputGuardTelephone,
        inputGuardIIN,
        inputGuardGuardPosts
      );

      responce.guard.label = [responce.guard.surname, responce.guard.firstName, responce.guard.telephone].join(' ');
      responce.guard.lower = responce.guard.label.toLowerCase().replace(/\s/g, '');

      setGuards(responce.guard);

      selectOption(responce.guard);

      setGuardEditForm({ isOpen: false });

    } catch (error) {

      errorCallback(error, setGuardEditForm);

    } finally {

      MOBXui.setLoading();

    }

  }

  /*-------------------------------------------------------------------------------------------------------
      Чистка/Обновление инпутов
  -------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    document.body.classList.remove("overscroll-y-contain");
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {
      setInputGuard(form.guardsToday ? [...form.guardsToday] : []);
      const guards = (form.guardsToday && form.guardsToday.length > 0) ? optionGuards.filter(guard=>{
        for (const guardToday of form.guardsToday) {
          if( guard._id == guardToday._id ) return false
        }
        return true;
      }) : optionGuards ;
      setOptionsForWork([...guards]);
      setInputFilter([...guards]);
      setInputFilterText('');
      setError(null);
      document.body.classList.add("overscroll-y-contain");
    }
    return ()=>{
      filterringTimeout.current && clearTimeout(filterringTimeout.current);
    }
  }, [form])
  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={'Редактирование смены'}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full max-h-[70vh] overflow-y-auto"
    >

      {/* Выбранные охранники - множество*/}
      {inputGuard && inputGuard.length > 0 && <div className="form-item w-full flex flex-wrap mb-1">
        {inputGuard.map((value, i) => {
          return <button
            key={"key" + i + value._id}
            className='flex items-center justify-center 
              border rounded-md px-2 m-1 bg-red-600 text-white 
              hover:bg-red-700 hover:text-color_F active:bg-red-700 focus:outline-none focus:border-red-700 focus:ring focus:ring-red-200'
            onClick={(event) => {
              event.stopPropagation();
              unSelectOption(value)
            }}
          >
            <span className='w-fit'>{value.label}</span>
            <XMarkIcon
              className='w-4 h-4'
            />
          </button>
        })}
      </div>}

      {/* Фильтр и Кнопка вызова Формы добавления охранника */}
      <div className="flex w-full space-x-2">

        {/* Фильтр */}
        <div className="flex-1 form-item flex">
          {/* Фильтр */}
          <FFilterText
            value={inputFilterText}
            onChange={(e)=>{
              setInputFilterText(e.target.value);
              filterringTimeout.current && clearTimeout(filterringTimeout.current);
              filterringTimeout.current = setTimeout(() => filterChange(e.target.value), 500);
            }}
            onClear={() => {
              setInputFilterText('');
              setInputFilter(optionsForWork)
            }}
          />
        </div>

        {/* Кнопка вызова Формы добавления охранника */}
        {ARcreateGuard &&
        <div className="form-item">
          <button
            className="bg-color_B h-8 w-8 flex justify-center items-center rounded-md
            hover:bg-color_C active:bg-color_B"
            onClick={() => {
              setGuardEditForm({
                isOpen: true,
                operation: 'Добавить',
                guard: {
                  surname: inputFilterText
                },
                key: Math.random().toString(36)
              })
            }}
          >
            <PlusIcon
              className="h-8 w-8 fill-color_F
              hover:fill-color_G"
            />
          </button>
        </div>}

      </div>

      {/* Охранники */}
      <div
        className="form-item w-full mt-2 flex flex-col items-center min-h-[48px] overflow-y-auto border rounded-md"
      >
        {inputFilter && inputFilter.length > 0 && inputFilter.map((value, i) => {
          return <button
            key={"key" + i + value._id}
            className='w-full 
              hover:bg-color_C hover:text-color_G active:bg-color_C'
            onClick={(event) => {
              event.stopPropagation();
              selectOption(value)
            }}
          >
            {value.label}
          </button>
        })}
        {inputFilter.length == 0 && <span>Нет данных</span>}
      </div>

      {/* Статус ошибки */}
      <div className="form-item">
        <span className="text-color_C italic break-words">
          {error}
        </span>
      </div>

      {/* Кнопки */}
      <div className="ml-auto mt-4">

        <FButtonRed
          className=""
          disabled={!(form.isOpen && !equalArrays( form.guardsToday, inputGuard))}
          onClick={(e) => submitEdit(e, inputGuard)}
        >
          Изменить
        </FButtonRed>

        <FButtonWhite
          className="ml-4"
          onClick={() => setForm({ isOpen: false })}
        >
          Закрыть
        </FButtonWhite>

      </div>

      {/* {Форма добавления/редактирования физ. поста} */}
      <FGuardEditForm
        form={guardEditForm}
        setForm={setGuardEditForm}
        submitAdd={guardAdd}
      />

    </FModalForm >
  )
}