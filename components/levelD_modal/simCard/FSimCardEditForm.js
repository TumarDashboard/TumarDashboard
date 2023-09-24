import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';
import useSWRMutation from 'swr/mutation';

import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FInputTelephone } from '../../levelE_low/FInputTelephone';
import { FInputICCID } from '../../levelE_low/FInputICCID';
import Image from "next/legacy/image";

import { fetchAuthMethod } from "../../../middleware/requests";
import { getDateStamp } from '../../../src/utils/dateUtils';

export function FSimCardEditForm({ accessRules, form, setForm, submitAdd, submitEdit }) {

  /*--Использование глобальных данных--------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');

  /*--Определение правил доступа-------------------------------------------------------------------------*/
  // const AReditSimCardManager = !accessRules.includes('editSimCard/apiBlock/manager');
  // const AReditSimCardRate = !accessRules.includes('editSimCard/apiBlock/rate');

  /*--Абонентский номер------ Формы редактирования-------------------------------------------------------*/
  const [inputSimCardMSISDN, setInputSimCardMSISDN] = useState('');

  const [isInputValidateSimCardMSISDN, setInputValidateSimCardMSISDN] = useState(true);

  const SimCardMSISDNChange = (value, validate, provider) => {
    setInputSimCardMSISDN(value);

    setInputSimCardProvider(provider);

    if (operation == 'Добавить') {
      if (value)
        setInputValidateSimCardMSISDN(validate);
      else
        setInputValidateSimCardMSISDN(true);
    } else {
      setInputValidateSimCardMSISDN(validate && (value != serverData?.simCard?.msisdn));
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
      setInputValidateSimCardICCID(validate && (value != serverData?.simCard?.iccid));
    }
  }

  /*--Провайдер Формы редактирования-------------------------------------------------------------------------*/
  const [inputSimCardProvider, setInputSimCardProvider] = useState();

  /*--История Формы редактирования-------------------------------------------------------------------------*/
  const [inputSimCardProtectedObjects, setInputSimCardProtectedObjects] = useState(null);

  /*--Запрос данных на сервере---------------------------------------------------------------------*/
  const {
    data: serverData,
    isMutating: isMutatingFromServer,
    trigger: triggerFromServer,
    reset: resetServerData
  } = useSWRMutation('/method/modal/getSimCardEditForm', fetchAuthMethod);

  useEffect(() => {
    if (serverData?.simCard) {
      console.log(serverData.simCard);
      setInputSimCardMSISDN(serverData.simCard.msisdn);
      setInputSimCardICCID(serverData.simCard.iccid);
      setInputSimCardProvider(serverData.simCard.provider);
      setInputSimCardProtectedObjects(serverData.simCard.protectedObjects);
    } else {
      setInputValidateSimCardMSISDN(operation == 'Добавить');
      setInputValidateSimCardICCID(operation == 'Добавить');
    }
    return () => {
      setInputSimCardMSISDN(null);
      setInputValidateSimCardMSISDN(false);
      setInputSimCardICCID(null);
      setInputValidateSimCardICCID(false);
      setInputSimCardProvider(null);
      setInputSimCardProtectedObjects(null)
    }
  }, [serverData]);

  /*--Чистка/Обновление инпутов--------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {

      setOperation(form.operation);

      triggerFromServer({
        _id: form.simCard?._id
      });

      setError(null);

    } else {
      resetServerData();
    }
  }, [form])

  /*-----------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm

      title={operation == 'Добавить' ? 'Добавить данные сим-карты' : 'Данные сим-карты'}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      isModalFormLoading={!serverData || isMutatingFromServer}
      isModalFormError={error}
      // className="flex flex-col items-center md:flex-row md:items-stretch p-4 w-full overflow-y-auto max-h-[90vh]"
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[90vh]"
      widthForm='min-w-min'
    >

      {/* Абон. номер */}
      <div className="form-item flex items-center">
        <label className="text-lg flex-none pr-2">Абон. номер</label>
        <FInputTelephone
          placeholder='Телефон'
          value={inputSimCardMSISDN ? inputSimCardMSISDN : ''}
          onChange={SimCardMSISDNChange}
          key={form.key}
        />
      </div>

      {/* Серийный номер */}
      <div className="form-item flex flex-col md:flex-row items-start mt-4 w-full">
        <label className="text-lg flex-none pr-2">Серийный номер</label>
        <FInputICCID
          placeholder='Серийный номер'
          value={inputSimCardICCID ? inputSimCardICCID : ''}
          onChange={SimCardICCIDChange}
          key={form.key}
        />
      </div>

      {/* Провайдер */}
      {inputSimCardProvider &&
        <div className="form-item w-full mt-4">
          <label className="text-lg">Провайдер <b>{inputSimCardProvider}</b></label>
        </div>}

      {/* История расположения */}
      {inputSimCardProtectedObjects?.length > 0 && <>
        <label className='text-lg md:hidden'>Использовалась на объектах: </label>
        <table className="min-w-full border-collapse block md:table text-sm mt-1">
          <thead className="block md:table-header-group select-none">
            <tr className="border md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative
            font-bold text-left">
              <th className="block md:border-r md:table-cell py-1 px-2">Использовалась на объектах:</th>
              <th className="block md:border-r md:table-cell py-1 px-2">Установлена:</th>
              <th className="block md:table-cell py-1 px-2">Снята:</th>
            </tr>
          </thead>

          <tbody className="block md:table-row-group">
            {inputSimCardProtectedObjects.map((value, index) => {

              const bodyRowFillColor = index & 1 ? 'bg-white' : 'bg-slate-100';

              return <tr className={`rounded-md md:border-none block md:table-row mt-1 ${bodyRowFillColor}`}
              >

                <td className="md:border-r pr-1 text-left block md:table-cell">
                  {value.protectedObject &&
                    <span >
                      Объект №{[
                        value.protectedObject?.number,
                        value.protectedObject?.name,
                        value.protectedObject?.address
                      ].filter(Boolean).join(', ')}
                    </span>}
                </td>

                <td className="md:border-r px-1 text-left block md:table-cell">
                  {value.mounted && <span><b className='md:hidden'>Установлена: </b>{(new Date(value.mounted)).toLocaleDateString()}</span>}
                </td>

                <td className="text-left px-1 block md:table-cell">
                  {value.unmounted && <span><b className='md:hidden'>Снята: </b>{(new Date(value.unmounted)).toLocaleDateString()}</span>}
                </td>

              </tr>
            })}
          </tbody>

        </table></>}

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
              && isInputValidateSimCardICCID) :
            (isInputValidateSimCardMSISDN
              || isInputValidateSimCardICCID
              || (inputSimCardProvider != serverData?.simCard?.provider)
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