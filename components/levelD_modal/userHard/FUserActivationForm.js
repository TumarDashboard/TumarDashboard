import React from "react";
import { FModalForm } from '../FModalForm'
import { useState, useEffect } from 'react';;

import { getDateStamp } from "../../../src/utils/dateUtils";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FButtonYellow } from "../../levelE_low/FButtonYellow";

export function FUserActivationForm({ form, setForm, submit }) {
  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/
  
  return (
    <FModalForm
      title={"Активация аккаунта"}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[90vh]"
    >
      
      <div className="text-justify">
        <p>Раз Вы используете данную функцию, значит:</p>
        <ul className="list-disc list-inside text-left">
          <li>либо для пользователя затруднён доступ к почте, указанной при регистрации</li>
          <li>либо указанной почты вовсе не  существует</li>
        </ul>
      </div>

      <div className="text-justify mt-4">
        <p>В любом случае, после активации аккаунта, пользователь действительно сможет зайти под указанной
        почтой <b>{form?.email}</b>, и пароль будет соответствовать следующему шаблону:</p>
        <ul className="list-disc list-inside text-left">
          <li>либо указанному пользователю при самостоятельной регистрации</li>
          <li>либо паролю для нового пользователя, выданному автоматически при созданнии сотрудником компании: 
              { form?.createdAt 
                 ? <b className="text-blue-700"> State{getDateStamp(new Date(form?.createdAt))}</b>
                : <p className="text-blue-700"> State<b>ГодМесяцДата</b>, где ГодМесяцДата - дата создания пользователя</p>
              }
          </li>
        </ul>
      </div>

      {/* Статус ошибки */}
      <div className="form-item">
        <span className="text-color_C italic break-words">
          {form.error}
        </span>
      </div>

      <div className="ml-auto mt-4">

        <FButtonYellow
          className=""
          onClick={submit}
        >
          Активировать
        </FButtonYellow>

        <FButtonWhite
          className="ml-4"
          onClick={() => setForm({ isOpen: false })}
        >
          Закрыть
        </FButtonWhite>

      </div>

    </FModalForm>
  )
}