import { XIcon } from '@heroicons/react/solid';
import { FModalForm } from './FModalForm';
import { useState, useEffect } from 'react';
import { FInputFile } from "../low/FInputFile";
import { FButtonRed } from "../low/FButtonRed";
import { FButtonWhite } from "../low/FButtonWhite";
import { FSelect } from "../low/FSelect";

import { equalArrays } from '../../src/utils/arrayUtils';
import { FInputInitials } from '../low/FInputInitials';
import { FInputTelephone } from '../low/FInputTelephone';
import Select from 'react-select';
import { useId } from 'react';
import { FInputText } from '../low/FInputText';
import { array } from 'yup';

export function FGuardRowEditFormSecond({ form, setForm, submitAdd, submitEdit, optionGuards }) {

  /*-------------------------------------------------------------------------------------------------------
      Операция
  -------------------------------------------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Данные для работы Формы редактирования
  -------------------------------------------------------------------------------------------------------*/

  const [optionsForWork, setOptionsForWork] = useState([]);

  /*-------------------------------------------------------------------------------------------------------
      Фильтр Формы редактирования
  -------------------------------------------------------------------------------------------------------*/

  const [inputFilter, setInputFilter] = useState([]);   

  const filterChange = (e) => {
    var text = e.target.value.toLowerCase();
    if( text ){
      setInputFilter(optionsForWork.filter((value) => { return value.lower?.includes(text) }))
    }else{
      setInputFilter(optionsForWork)
    }
  }

  /*-------------------------------------------------------------------------------------------------------
      Выбранные данные для работы Формы редактирования
  -------------------------------------------------------------------------------------------------------*/

  const [inputGuard, setInputGuard] = useState([]);   

  const selectOption = (value) => {

    setInputGuard(array => {
      array.push(value);
      return array;
    });

    setInputFilter(array => {
      return array.filter(element => value.value != element.value)});

    setOptionsForWork(array => {
      return array.filter(element => value.value != element.value)});

  }  
  
  const unSelectOption = (value) => {

    setInputGuard(array => {
      return array.filter(element => value.value != element.value)});

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
      Чистка/Обновление инпутов
  -------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {
      setOperation(form.operation);
      setInputGuard(form.guard || []);
      const options = optionGuards.map((value)=>{ 
        const newValue = value; 
        newValue.lower = value.label.toLowerCase(); 
        return newValue;
      });
      setOptionsForWork(options);
      setInputFilter(options);
      setError(null);
    }
  }, [form])
  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={`${operation} охранника`}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full max-h-[90vh] overflow-y-auto"
    >

    {/* Выбранные охранники */}
    {inputGuard && inputGuard.length > 0 && <div className="form-item w-full flex flex-wrap mb-1">
      {inputGuard.map((value, i)=>{
        return <button
            key={"key"+i+value.value} 
            className='flex items-center justify-center 
            border rounded-md px-2 m-1 bg-red-600 text-white 
            hover:bg-red-700 hover:text-color_F active:bg-red-700 focus:outline-none focus:border-red-700 focus:ring focus:ring-red-200'
            onClick={(event) => {
              event.stopPropagation();
              unSelectOption(value)
            }}
          >
            <span className='w-fit'>{value.label}</span>
            <XIcon
              className='w-4 h-4'
            />
          </button>
      })}
    </div>}

      {/* Статус ошибки */}
      <div className="form-item w-full">
        <input
          type="text"
          placeholder="Фильтр"
          onChange={filterChange}
          className="w-full p-1
          border border-gray-300 rounded-md"
        />
      </div>

      {/* Охранник */}
      <div className="form-item w-full mt-2 flex flex-col items-center overflow-y-auto border rounded-md">
        {inputFilter && inputFilter.length > 0 && inputFilter.map((value, i)=>{
          return <button
              key={"key"+i+value.value} 
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
          disabled={!(form.isOpen && (operation == 'Добавить' ?
          (inputGuard != "EMPTY") :
          ((inputGuard != "EMPTY")
            || (inputGuard != form.guard?._id)
        )))}
          onClick={(e) => operation == 'Добавить' 
          ? submitAdd(e,inputGuard.map(element=>element.value))
          : submitEdit(e,inputGuard.value)}
        >
          {operation}
        </FButtonRed>

        <FButtonWhite
          className="ml-4"
          onClick={() => setForm({ isOpen: false })}
        >
          Закрыть
        </FButtonWhite>

      </div>

    </FModalForm >
  )
}