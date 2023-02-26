import React from "react";
import { FModalForm } from '../FModalForm'
import { useState, useEffect } from 'react';;

import { getDateStamp } from "../../../src/utils/dateUtils";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FButtonYellow } from "../../levelE_low/FButtonYellow";
import { FButtonRed } from "../../levelE_low/FButtonRed";

export function FUserResetPasswordForm({ form, setForm, submit }) {
  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/
  
  return (
    
    <FModalForm
      title={"Сброс пароля для аккаунта"}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[90vh]"
    >

      <div className="text-justify">
        <p>Функция сброса пароля выполнит следующие операции:</p>
        <ul className="list-disc list-inside text-left">
          <li>Будет автоматически установлен следующий пароль:
            {form?.createdAt
              ? <b className="text-blue-700"> State{getDateStamp(new Date(form?.createdAt))}</b>
              : <p className="text-blue-700"> State<b>ГодМесяцДата</b>, где ГодМесяцДата - дата текущая дата</p>
            }
          </li>
          <li>На почту аккаунта <b>{form?.email}</b> будет отправлена ссылка для восстановления пароля,
            где пользователь сможет установить пароль самостоятельно</li>
        </ul>
      </div>

      {/* Статус ошибки */}
      <div className="form-item">
        <span className="text-color_C italic break-words">
          {form.error}
        </span>
      </div>

      <div className="ml-auto mt-4">

        <FButtonRed
          className=""
          onClick={submit}
        >
          Сбросить пароль
        </FButtonRed>

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