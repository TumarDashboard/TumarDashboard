import { FModalForm } from './FModalForm';
import { useState, useEffect } from 'react';
import { FInputFile } from "../low/FInputFile";
import { FButtonRed } from "../low/FButtonRed";
import { FButtonWhite } from "../low/FButtonWhite";
import { FSelect } from "../low/FSelect";

import { equalArrays } from '../../src/utils/arrayUtils';
import { FInputText } from '../low/FInputText';
import { FInputTelephone } from '../low/FInputTelephone';

export function FGuardRowEditForm({ form, setForm, submitAdd, submitEdit, optionGuards }) {

  /*-------------------------------------------------------------------------------------------------------
      Операция
  -------------------------------------------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');
  /*-------------------------------------------------------------------------------------------------------
      Менеджер Формы редактирования
  -------------------------------------------------------------------------------------------------------*/

  const [inputGuard, setInputGuard] = useState('EMPTY');

  /*-------------------------------------------------------------------------------------------------------
      Чистка/Обновление инпутов
  -------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {
      setOperation(form.operation);
      setInputGuard(form.guard?._id || 'EMPTY');
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
    >

      {/* Охранник */}
      <div className="form-item w-full mt-4 flex items-center">
        <label className="text-lg pr-4">Охранник</label>
        <FSelect
          options={optionGuards}
          onChange={(e) => { setInputGuard(e?.target?.value) }}
          value={inputGuard ? inputGuard : 'EMPTY'}
          key={form.key}
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
          ? submitAdd(e,inputGuard)
          : submitEdit(e,inputGuard)}
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