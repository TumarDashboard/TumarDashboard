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

export function FGuardRowEditForm({ form, setForm, submitAdd, submitEdit, optionGuards }) {

  /*-------------------------------------------------------------------------------------------------------
      Операция
  -------------------------------------------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');
  /*-------------------------------------------------------------------------------------------------------
      Менеджер Формы редактирования
  -------------------------------------------------------------------------------------------------------*/

  const [inputGuard, setInputGuard] = useState([]);

  /*-------------------------------------------------------------------------------------------------------
      Чистка/Обновление инпутов
  -------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {
      setOperation(form.operation);
      setInputGuard(form.guard?._id || null);
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
      className="flex flex-col items-start p-4 w-full"
    >

      {/* Охранник */}
      <div className="form-item w-full mt-4 flex items-center">
        <Select
          className="w-full"
          options={optionGuards}
          onChange={setInputGuard}
          value={inputGuard}
          placeholder=''
          key={form.key}
          id={form.key || "long-value-select"}
          instanceId={form.key || "long-value-select"}
          isMulti={operation == 'Добавить'}
        />
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