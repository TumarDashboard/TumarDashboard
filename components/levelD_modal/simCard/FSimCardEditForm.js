import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';

import { FInputSimCardNumber } from "../../levelE_low/FInputSimCardNumber";
import { FTextArea } from "../../levelE_low/FTextArea";
import { FInputImageFile } from "../../levelE_low/FInputImageFile";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FSelect } from "../../levelE_low/FSelect";
import { FSelectShifts } from "../../levelE_low/FSelectShifts";
import useSWRMutation from 'swr/mutation';
import { fetchAuthMethod } from "../../../middleware/requests";

import { equalArrays } from '../../../src/utils/arrayUtils';
import { FInputText } from '../../levelE_low/FInputText';
import { FInputIIN } from '../../levelE_low/FInputIIN';
import { FInputTelephone } from '../../levelE_low/FInputTelephone';

export function FSimCardEditForm({ accessRules, form, setForm, submitAdd, submitEdit, users }) {

  /*--Использование глобальных данных--------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');

  /*--Определение правил доступа-------------------------------------------------------------------------*/
  // const AReditSimCardManager = !accessRules.includes('editSimCard/editBlock/manager');
  // const AReditSimCardRate = !accessRules.includes('editSimCard/editBlock/rate');

  /*--Абонентский номер------ Формы редактирования-------------------------------------------------------*/
  const [inputSimCardMSISDN, setInputSimCardMSISDN] = useState('');

  const [isInputValidateSimCardMSISDN, setInputValidateSimCardMSISDN] = useState(true);

  const SimCardMSISDNChange = (value, validate) => {
    setInputSimCardMSISDN(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateSimCardMSISDN(validate);
      else
        setInputValidateSimCardMSISDN(true);
    } else {
      setInputValidateSimCardMSISDN(validate && (value != form.simCard?.number));
    }
  }

  /*--Серийный номер Формы редактирования------------------------------------------------------------------*/
  const [inputSimCardICCID, setInputSimCardICCID] = useState('');

  const [isInputValidateSimCardICCID, setInputValidateSimCardICCID] = useState(true);

  const SimCardICCIDChange = (value, validate) => {
    setInputSimCardICCID(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateSimCardICCID(validate);
      else
        setInputValidateSimCardICCID(true);
    } else {
      setInputValidateSimCardICCID(validate && (value != form.guard?.IIN));
    }
  }

  /*--Провайдер Формы редактирования-------------------------------------------------------------------------*/
  const [inputSimCardProvider, setInputSimCardProvider] = useState('');

  /*-------------------------------------------------------------------------------------------------------
      Чистка/Обновление инпутов
  -------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {

      setOperation(form.operation);
      setInputSimCardMSISDN(form.simCard?.msisdn);
      setInputValidateSimCardMSISDN(form.operation == 'Добавить');
      setInputSimCardICCID(form.simCard?.iccid);
      setInputValidateSimCardICCID(form.operation == 'Добавить');
      setInputSimCardProvider(form.simCard?.provider);
      setError(null);
    }
  }, [form])

  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={`${operation} пультовой объект`}
      widthForm='w-full lg:w-1/2 mx-6'
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[90vh]"
    >
      {/* Абон. номер */}
      <div className='flex flex-col xl:flex-row w-full'>

        {/* Абон. номер */}
        <div className="form-item flex items-center xl:mr-4 min-w-[150px]">
          <label className="text-lg pr-4">Абон. номер</label>
          <FInputTelephone
            placeholder='Телефон'
            value={inputSimCardMSISDN ? inputSimCardMSISDN : ''}
            onChange={SimCardMSISDNChange}
            key={form.key}
          />
        </div>

      </div>

      {/* Серийный номер */}
      <div className="form-item w-full mt-4">
        <label className="text-lg">Серийный номер</label>
        <FInputIIN
          placeholder='ИИН'
          value={inputSimCardICCID ? inputSimCardICCID : ''}
          onChange={SimCardICCIDChange}
          key={form.key}
        />
      </div>

      {/* Провайдер */}
      <div className="form-item w-full mt-4">
        <label className="text-lg">Провайдер</label>
        <FTextArea
          id='address'
          placeholder='Адрес'
          value={inputSimCardProvider ? inputSimCardProvider : ''}
          onChange={setInputSimCardProvider}
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
            (isInputValidateSimCardMSISDN
              && inputSimCardICCID) :
            (isInputValidateSimCardMSISDN
              || (inputSimCardICCID != form.simCard?.name)
              || (inputSimCardProvider != form.simCard?.address)
            )
          ))}
          onClick={(e) => operation == 'Добавить' ? submitAdd(e,
            inputSimCardMSISDN,
            inputSimCardICCID,
            inputSimCardProvider,
          ) : submitEdit(e,
            inputSimCardMSISDN,
            inputSimCardICCID,
            inputSimCardProvider,
          )}
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
    </FModalForm>
  )
}