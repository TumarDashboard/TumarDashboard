import React from "react";
import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';

import { FTextArea } from "../../levelE_low/FTextArea";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";

export function FSimCardRecoverForm({ form, setForm, submit }) {

  /*-------------------------------------------------------------------------------------------------------
      Статусы инпутов Формы удаления
  -------------------------------------------------------------------------------------------------------*/
  const [inputValidate, setInputValidate] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Чистка инпутов
  -------------------------------------------------------------------------------------------------------*/
  useEffect(()=>{
    if(form.isOpen){
      setInputValidate('');
      console.log(form);
    }
  }, [form]);

  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={"Восстановление пультового объекта"}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[90vh]"
    >

      {form?.simCardUserPerfomed && <span className="mb-2">
        Пользователь, удаливший пультовой объект: <b>{[
          form.simCardUserPerfomed.surname ? form.simCardUserPerfomed.surname : null,
          form.simCardUserPerfomed.firstName ? form.simCardUserPerfomed.firstName : null
          ].filter(Boolean).join(' ')}</b>
      </span>}

      {form?.simCardReason && <span className="mb-2">
        Причина удаления: <b>{form.simCardReason}</b>
      </span>}

      <span>
        Для подтверждения действия введите <b>{form.simCardNumber}</b> в поле ниже:
      </span>

      <input
        id="text"
        type="text"
        name="text"
        placeholder="Введите подтверждение"
        value={inputValidate}
        onChange={(e) => setInputValidate(e.target.value)}
        className="border border-gray-300 block w-full
                    focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
                    rounded-md shadow-sm disabled:bg-gray-100"
      />

      {/* Статус ошибки */}
      <div className="form-item">
        <span className="text-color_C italic break-words">
          {form.error}
        </span>
      </div>

      <div className="ml-auto mt-4">

        <FButtonRed
          className=""
          disabled={inputValidate.localeCompare(form.simCardNumber, undefined, { sensitivity: 'base', ignorePunctuation: true })}
          onClick={(e)=>submit( e )}
        >
          Восстановить
        </FButtonRed>

        <FButtonWhite
          className="ml-4"
          onClick={() => setForm({isOpen:false})}
        >
          Закрыть
        </FButtonWhite>

      </div>

    </FModalForm>
  )
}