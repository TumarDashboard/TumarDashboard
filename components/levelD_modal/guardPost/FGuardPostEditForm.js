import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';
import useSWRMutation from 'swr/mutation';

import { FInputGuardPostNumber } from "../../levelE_low/FInputGuardPostNumber";
import { FTextArea } from "../../levelE_low/FTextArea";
import { FInputImageFile } from "../../levelE_low/FInputImageFile";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FSelect } from "../../levelE_low/FSelect";
import { FSelectShifts } from "../../levelE_low/FSelectShifts";
import { FInputText } from '../../levelE_low/FInputText';
import Image from "next/legacy/image";

import { equalArrays } from '../../../src/utils/arrayUtils';
import { fetchAuthMethod } from "../../../middleware/requests";

export function FGuardPostEditForm({ accessRules, form, setForm, submitAdd, submitEdit }) {

  /*--Использование глобальных данных--------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');

  /*--Определение правил доступа-------------------------------------------------------------------------*/
  const AReditGuardPostManager = !accessRules.includes('editGuardPost/apiBlock/manager');
  const AReditGuardPostRate = !accessRules.includes('editGuardPost/apiBlock/rate');

  /*--Номер физ. поста Формы редактирования-------------------------------------------------------------*/
  const [inputGuardPostNumber, setInputGuardPostNumber] = useState('');

  const [isInputValidateGuardPostNumber, setInputValidateGuardPostNumber] = useState(true);

  const GuardPostNumberChange = (value, validate) => {
    setInputGuardPostNumber(value);
    if (operation == 'Добавить') {
      if (value)
        setInputValidateGuardPostNumber(validate);
      else
        setInputValidateGuardPostNumber(true);
    } else {
      setInputValidateGuardPostNumber(validate && (value != serverData?.guardPost?.number));
    }
  }

  /*--Краткое Наименование Формы редактирования----------------------------------------------------------*/
  const [inputGuardPostCallsign, setInputGuardPostCallsign] = useState('');

  /*--Наименование Формы редактирования------------------------------------------------------------------*/
  const [inputGuardPostName, setInputGuardPostName] = useState('');

  /*--Адрес Формы редактирования-------------------------------------------------------------------------*/
  const [inputGuardPostAddress, setInputGuardPostAddress] = useState('');

  /*--Описание Формы редактирования----------------------------------------------------------------------*/
  const [inputGuardPostDescription, setInputGuardPostDescription] = useState('');

  /*--Фото Формы редактирования--------------------------------------------------------------------------*/
  const [inputGuardPostPhoto, setInputGuardPostPhoto] = useState('');

  /*--Менеджер Формы редактирования----------------------------------------------------------------------*/
  const [optionsGuardPostManager, setOptionsGuardPostManager] = useState([{ label: 'Отсутствует', value: 'EMPTY' }])

  const [inputGuardPostManager, setInputGuardPostManager] = useState('EMPTY');

  /*--Смены Формы редактирования-------------------------------------------------------------------------*/
  const [inputGuardPostShifts, setInputGuardPostShifts] = useState([]);

  /*--Тариф Формы редактирования-------------------------------------------------------------------------*/
  const [inputGuardPostRate, setInputGuardPostRate] = useState('');

  /*--Запрос данных на сервере---------------------------------------------------------------------------*/
  const {
    data: serverData,
    isMutating: isMutatingFromServer,
    trigger: triggerFromServer,
    reset: resetServerData
  } = useSWRMutation('/method/modal/getGuardPostEditForm', fetchAuthMethod, {
    onError: (e) => setError(e)
  });

  useEffect(() => {
    if (serverData?.guardPost) {
      setInputGuardPostNumber(serverData.guardPost.number);
      setInputGuardPostCallsign(serverData.guardPost.callsign);
      setInputGuardPostName(serverData.guardPost.name);
      setInputGuardPostAddress(serverData.guardPost.address);
      setInputGuardPostDescription(serverData.guardPost.description);
      setInputGuardPostManager(serverData.guardPost.manager || 'EMPTY');
      setInputGuardPostShifts(serverData.guardPost.shifts || []);
      setInputGuardPostRate(serverData.guardPost.rate);
    }else{
      setInputValidateGuardPostNumber(operation == 'Добавить');
    }
    if (serverData?.optionsGuardPostManagers) {
      setOptionsGuardPostManager(serverData.optionsGuardPostManagers);
    }
    return () => {
      setInputGuardPostNumber(null);
      setInputValidateGuardPostNumber(false);
      setInputGuardPostCallsign(null);
      setInputGuardPostName(null);
      setInputGuardPostAddress(null);
      setInputGuardPostDescription(null);
      setInputGuardPostPhoto(null);
      setInputGuardPostManager('EMPTY');
      setInputGuardPostShifts([]);
      setInputGuardPostRate(null);
      setOptionsGuardPostManager([]);
    }
  }, [serverData]);

  /*--Чистка/Обновление инпутов--------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form?.isOpen) {

      setError(null);

      triggerFromServer({
        _id: form.guardPost?._id,
        manager: form.guardPost?.manager?._id
      });

      setOperation(form.operation);

    }else{
      resetServerData();
    }
  }, [form])
  /*-----------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={operation == 'Добавить' ? 'Добавить данные физ. поста' : 'Данные физ. поста'}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      isModalFormLoading={!serverData || isMutatingFromServer}
      isModalFormError={error}
      className="flex flex-col items-center md:flex-row md:items-stretch p-4 w-full overflow-y-auto max-h-[90vh]"
      widthForm='min-w-min'
    >

      {/* {Панель информации} */}
      <div
        className="flex-initial flex flex-col space-y-4 w-full md:max-w-xl bg-white rounded-md"
      >
        {/* {Изображение аватара для мобильного} */}
        {(inputGuardPostPhoto || serverData?.guardPost?.photo) &&
          <div
            className="w-full flex md:hidden items-center justify-center mb-4 select-none"
          >
            <Image
              className="object-cover w-44 h-44 rounded-full"
              width={176}
              height={176}
              src={inputGuardPostPhoto ? inputGuardPostPhoto : serverData?.guardPost?.photo}
              alt=""
            />
          </div>
        }

        {/* Номер и менеджер */}
        <div className='flex flex-col xl:flex-row w-full'>

          {/* Номер */}
          <div className="form-item flex items-center xl:mr-4 min-w-[150px]">
            <label className="text-lg pr-4">Номер</label>
            <FInputGuardPostNumber
              id='guard-post-number'
              placeholder='###'
              value={inputGuardPostNumber ? inputGuardPostNumber : ''}
              onChange={GuardPostNumberChange}
              key={form.key}
            />
          </div>

          {/* Кратко */}
          <div className="form-item flex w-full items-center mt-4 xl:mt-0 xl:mr-4">
            <FInputText
              id='guard-post-callsign'
              placeholder='Кратко'
              value={inputGuardPostCallsign ? inputGuardPostCallsign : ''}
              onChange={setInputGuardPostCallsign}
              className="font-bold"
              key={form.key}
            />
          </div>

          {/* менеджер */}
          {AReditGuardPostManager &&
            <div className="form-item flex min-w-fit items-center mt-4 xl:mt-0">
              <label className="text-lg pr-4">НСО</label>
              <FSelect
                options={optionsGuardPostManager}
                onChange={(e) => { setInputGuardPostManager(e?.target?.value) }}
                value={inputGuardPostManager ? inputGuardPostManager : 'EMPTY'}
                key={form.key}
              />
            </div>}

        </div>

        {/* Наименование */}
        <div className="form-item w-full mt-4">
          <label className="text-lg">Наименование</label>
          <FTextArea
            id='name'
            placeholder='Наименование'
            value={inputGuardPostName ? inputGuardPostName : ''}
            onChange={setInputGuardPostName}
            key={form.key}
          />
        </div>

        {/* Адрес */}
        <div className="form-item w-full mt-4">
          <label className="text-lg">Адрес</label>
          <FTextArea
            id='address'
            placeholder='Адрес'
            value={inputGuardPostAddress ? inputGuardPostAddress : ''}
            onChange={setInputGuardPostAddress}
            key={form.key}
          />
        </div>

        {/* Фото */}
        <div className="form-item flex items-center w-full mt-4">
          <label className="text-lg pr-4">Фото</label>
          <FInputImageFile
            setUri={setInputGuardPostPhoto}
            key={form.key}
          />
        </div>

        {/* Описание */}
        <div className="form-item w-full mt-4">
          <label className="text-lg">Описание</label>
          <FTextArea
            id='description'
            placeholder='Описание'
            value={inputGuardPostDescription ? inputGuardPostDescription : ''}
            onChange={setInputGuardPostDescription}
            key={form.key}
          />
        </div>

        {/* Смены */}
        <div className="form-item flex items-center w-full mt-4">
          <label className="text-lg pr-4">Смены</label>
          <FSelectShifts
            onChange={setInputGuardPostShifts}
            selected={inputGuardPostShifts ? inputGuardPostShifts : []}
            key={form.key}
          />
        </div>

        {/* Тариф */}
        {AReditGuardPostRate &&
          <div className="form-item flex items-center mt-4 ">
            <label className="text-lg pr-4">Тариф</label>
            <input
              id='guard-post-rate'
              type="number"
              name='guard-post-rate'
              placeholder='###'
              value={inputGuardPostRate ? inputGuardPostRate : ''}
              onChange={(e) => { setInputGuardPostRate(e.target.value) }}
              className="border border-gray-300 block w-full
            focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
            rounded-md shadow-sm disabled:bg-gray-100 "
            />
          </div>}

        {/* Статус ошибки */}
        <div className="form-item">
          <span className="text-color_C italic break-words">
            {error}
          </span>
        </div>

      </div>

      {/* {Изображение аватара для компьютера, кнопки управления} */}
      <div
        className="flex flex-col select-none items-end w-full justify-between md:items-center md:w-fit md:p-4 
        md:ml-4 md:border-t-8  md:border-red-700  md:rounded-md  md:bg-color_C"
      >

        {/* {Изображение аватара} */}
        <div
          className="w-full hidden md:flex items-center justify-center mb-4 select-none"
        >
          {(inputGuardPostPhoto || serverData?.guardPost?.photo) &&
            <Image
              className="object-cover w-44 h-44 rounded-full"
              width={176}
              height={176}
              src={inputGuardPostPhoto ? inputGuardPostPhoto : serverData?.guardPost?.photo}
              alt=""
            />
          }
        </div>

        {/* Кнопки */}
        <div
          className="flex flex-col"
        >

          <FButtonRed
            className="mb-4"
            disabled={!(form.isOpen && (operation == 'Добавить' ?
              (isInputValidateGuardPostNumber
                && inputGuardPostCallsign) :
              (isInputValidateGuardPostNumber
                || (inputGuardPostCallsign != '' && inputGuardPostCallsign != serverData?.guardPost?.callsign)
                || (inputGuardPostName != serverData?.guardPost?.name)
                || (inputGuardPostAddress != serverData?.guardPost?.address)
                || (inputGuardPostManager != serverData?.guardPost?.manager)
                || (inputGuardPostDescription != serverData?.guardPost?.description)
                || (!equalArrays(inputGuardPostShifts, serverData?.guardPost?.shifts))
                || (inputGuardPostRate != serverData?.guardPost?.rate)
                || inputGuardPostPhoto != null)
            ))}
            onClick={(e) => operation == 'Добавить' ? submitAdd(e,
              inputGuardPostNumber,
              inputGuardPostCallsign,
              inputGuardPostName,
              inputGuardPostAddress,
              inputGuardPostPhoto,
              inputGuardPostManager,
              inputGuardPostShifts,
              inputGuardPostDescription,
              inputGuardPostRate
            ) : submitEdit(e,
              inputGuardPostNumber,
              inputGuardPostCallsign,
              inputGuardPostName,
              inputGuardPostAddress,
              inputGuardPostPhoto,
              inputGuardPostManager,
              inputGuardPostShifts,
              inputGuardPostDescription,
              inputGuardPostRate
            )}
          >
            {operation}
          </FButtonRed>

          <FButtonWhite
            className=""
            onClick={() => setForm({ isOpen: false })}
          >
            Закрыть
          </FButtonWhite>

        </div>
      </div>

    </FModalForm>
  )
}