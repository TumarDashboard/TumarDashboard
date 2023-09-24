import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';
import useSWRMutation from 'swr/mutation';
import { CreditCardIcon } from '@heroicons/react/24/solid';
import { isUndefined } from 'swr/_internal';

import { FInputProtectedObjectNumber } from "../../levelE_low/FInputProtectedObjectNumber";
import { FTextArea } from "../../levelE_low/FTextArea";
import { FInputImageFile } from "../../levelE_low/FInputImageFile";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FInputTelephone } from '../../levelE_low/FInputTelephone';
import { FSimCardFindForm } from '../simCard/FSimCardFindForm';
import Image from "next/legacy/image";

import { fetchAuthMethod } from "../../../middleware/requests";

export function FProtectedObjectEditForm({ accessRules, form, setForm, submitAdd, submitEdit, users }) {

  /*--Использование глобальных данных--------------------------------------------------------------------*/
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');

  /*--Определение правил доступа-------------------------------------------------------------------------*/
  const AReditProtectedObjectNumber = !accessRules.includes('editProtectedObject/apiBlock/number');
  const AReditProtectedObjectName = !accessRules.includes('editProtectedObject/apiBlock/name');
  const AReditProtectedObjectAddress = !accessRules.includes('editProtectedObject/apiBlock/address');
  const AReditProtectedObjectPhoto = !accessRules.includes('editProtectedObject/apiBlock/photo');
  const AReditProtectedObjectDescription = !accessRules.includes('editProtectedObject/apiBlock/description');
  const AReditProtectedObjectSimCard = !(accessRules.includes('editProtectedObject/apiBlock/sim1') || accessRules.includes('editProtectedObject/apiBlock/sim2'));
  const AReditProtectedObject = AReditProtectedObjectNumber
    || AReditProtectedObjectName
    || AReditProtectedObjectAddress
    || AReditProtectedObjectPhoto
    || AReditProtectedObjectDescription
    || AReditProtectedObjectSimCard;

  /*--Номер пультовой объекта Формы редактирования-------------------------------------------------------*/
  const [inputProtectedObjectNumber, setInputProtectedObjectNumber] = useState('');

  const [isInputValidateProtectedObjectNumber, setInputValidateProtectedObjectNumber] = useState(true);

  const ProtectedObjectNumberChange = (value, validate) => {
    setInputProtectedObjectNumber(value);

    if (value) {
      if (operation == 'Добавить')
        setInputValidateProtectedObjectNumber(validate);
      else
        setInputValidateProtectedObjectNumber(validate && (value != serverData?.protectedObject?.number));
    }
    else
      setInputValidateProtectedObjectNumber(false);
  }

  /*--Наименование Формы редактирования------------------------------------------------------------------*/
  const [inputProtectedObjectName, setInputProtectedObjectName] = useState('');

  /*--Адрес Формы редактирования-------------------------------------------------------------------------*/
  const [inputProtectedObjectAddress, setInputProtectedObjectAddress] = useState('');

  /*--Описание Формы редактирования----------------------------------------------------------------------*/
  const [inputProtectedObjectDescription, setInputProtectedObjectDescription] = useState('');

  /*--Фото Формы редактирования--------------------------------------------------------------------------*/
  const [inputProtectedObjectPhoto, setInputProtectedObjectPhoto] = useState('');

  /*--Сим 1------ Формы редактирования-------------------------------------------------------------------*/
  const [inputProtectedObjectSim1, setInputProtectedObjectSim1] = useState();

  const [isInputValidateProtectedObjectSim1, setInputValidateProtectedObjectSim1] = useState(true);

  const ProtectedObjectSim1Change = (value, validate) => {
    setInputProtectedObjectSim1(value);

    let competitor = isUndefined(inputProtectedObjectSim2) ? serverData?.sim2 : inputProtectedObjectSim2;

    let dublicateSim = competitor ? value == competitor : false;

    setErrorProtectedObjectDublicateSim(dublicateSim);

    if (dublicateSim) {
      setInputValidateProtectedObjectSim1(false);
    } else if (!value || value == '') {
      setInputValidateProtectedObjectSim1(!isUndefined(serverData?.sim1));
    } else if (operation == 'Добавить') {
      setInputValidateProtectedObjectSim1(validate);
    } else {
      setInputValidateProtectedObjectSim1(validate && (value != serverData?.sim1));
    }
  }

  /*--Сим 2------ Формы редактирования-------------------------------------------------------------------*/
  const [inputProtectedObjectSim2, setInputProtectedObjectSim2] = useState();

  const [isInputValidateProtectedObjectSim2, setInputValidateProtectedObjectSim2] = useState(true);

  const ProtectedObjectSim2Change = (value, validate) => {

    setInputProtectedObjectSim2(value);

    let competitor = isUndefined(inputProtectedObjectSim1) ? serverData?.sim1 : inputProtectedObjectSim1;

    let dublicateSim = competitor ? value == competitor : false;

    setErrorProtectedObjectDublicateSim(dublicateSim);

    if (dublicateSim) {
      setInputValidateProtectedObjectSim1(false);
    } else if (!value || value == '') {
      setInputValidateProtectedObjectSim2(!isUndefined(serverData?.sim2));
    } else if (operation == 'Добавить') {
      setInputValidateProtectedObjectSim2(validate);
    } else {
      setInputValidateProtectedObjectSim2(validate && (value != serverData?.sim2));
    }
  }

  /*--Сим 2------ Формы редактирования-------------------------------------------------------------------*/
  const [errorProtectedObjectDublicateSim, setErrorProtectedObjectDublicateSim] = useState();

  /*----Модальное окно Формы поиска симкарты---------------------------------------------------------------------------*/
  const [simCardFindForm, setSimCardFindForm] = useState({
    isOpen: false
  });

  /*----Выбор симкарты Формы поиска симкарты---------------------------------------------------------------------*/
  const submitSimCardFindForm = async (event,
    simCard
  ) => {

    event.preventDefault();

    switch (simCardFindForm.target) {
      case 'sim1':
        ProtectedObjectSim1Change(simCard.msisdn, true);
        break;

      case 'sim2':
        ProtectedObjectSim2Change(simCard.msisdn, true);
        break;

      default:
        break;
    }

    // Закрываем модальное окно
    setSimCardFindForm({ isOpen: false });
  }

  /*--Запрос данных на сервере---------------------------------------------------------------------*/
  const {
    data: serverData,
    isMutating: isMutatingFromServer,
    trigger: triggerFromServer,
    reset: resetServerData
  } = useSWRMutation('/method/modal/getProtectedObjectEditForm', fetchAuthMethod);

  useEffect(() => {
    if (serverData?.protectedObject) {
      setInputProtectedObjectNumber(serverData.protectedObject.number);
      setInputProtectedObjectName(serverData.protectedObject.name);
      setInputProtectedObjectAddress(serverData.protectedObject.address);
      setInputProtectedObjectDescription(serverData.protectedObject.description);
      setInputProtectedObjectSim1(serverData.protectedObject.sim1);
      setInputProtectedObjectSim2(serverData.protectedObject.sim2);
    }else{
      setInputValidateProtectedObjectNumber(operation == 'Добавить');
      setInputValidateProtectedObjectSim1(operation == 'Добавить');
      setInputValidateProtectedObjectSim2(operation == 'Добавить');
    }
    return () => {
      setInputProtectedObjectNumber(null);
      setInputValidateProtectedObjectNumber(false);
      setInputProtectedObjectName(null);
      setInputProtectedObjectAddress(null);
      setInputProtectedObjectDescription(null);
      setInputProtectedObjectPhoto(null);
      setInputProtectedObjectSim1(null);
      setInputValidateProtectedObjectSim1(false);
      setInputProtectedObjectSim2(null);
      setInputValidateProtectedObjectSim2(false);
    }
  }, [serverData]);

  /*--Чистка/Обновление инпутов--------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {

      setError(null);
      
      triggerFromServer({
        _id: form.protectedObject?._id
      });

      setOperation(form.operation);

    }else{
      resetServerData();
    }
  }, [form])

  /*-----------------------------------------------------------------------------------------------------*/
  return (
    <FModalForm
      title={operation == 'Добавить' ? 'Добавить данные пультового объекта' : 'Данные пультового объекта'}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      isModalFormLoading={!serverData || isMutatingFromServer}
      isModalFormError={error}
      className="flex flex-col items-center md:flex-row md:items-stretch p-4 w-full overflow-y-auto max-h-[90vh]"
      widthForm='min-w-min'
    >

      {/* {Панель информации} */}
      <div
        className="flex-initial flex flex-col space-y-4 w-full min-w-max md:max-w-xl bg-white rounded-md"
      >

        {/* {Изображение аватара для мобильного} */}
        {(inputProtectedObjectPhoto || serverData?.protectedObject?.photo) &&
          <div
            className="w-full flex md:hidden items-center justify-center mb-4 select-none"
          >
            <Image
              className="object-cover w-44 h-44 rounded-full"
              width={176}
              height={176}
              src={inputProtectedObjectPhoto ? inputProtectedObjectPhoto : serverData?.protectedObject?.photo}
              alt=""
            />
          </div>
        }

        {/* Номер */}
        <div className='flex w-full form-item items-center min-w-[150px] max-w-[150px]'>

          <label className="text-lg pr-2">Номер</label>

          {AReditProtectedObjectNumber || form.operation == 'Добавить'
            ? <FInputProtectedObjectNumber
              id='guard-post-number'
              placeholder='###'
              value={inputProtectedObjectNumber ? inputProtectedObjectNumber : ''}
              onChange={ProtectedObjectNumberChange}
              key={form.key}
            />
            : <p className="text-black text-xl font-bold">{inputProtectedObjectNumber}</p>}

        </div>

        {/* Наименование */}
        <div className="form-item w-full flex flex-col sm:flex-row">
          <label className="text-lg pr-2">Наименование</label>
          {AReditProtectedObjectName || form.operation == 'Добавить'
            ? <FTextArea
              id='name'
              placeholder='Наименование'
              value={inputProtectedObjectName ? inputProtectedObjectName : ''}
              onChange={setInputProtectedObjectName}
              key={form.key}
            />
            : <p className="text-black text-xl font-bold">{inputProtectedObjectName}</p>}
        </div>

        {/* Адрес */}
        <div className="form-item w-full mt-2 flex flex-col sm:flex-row">
          <label className="text-lg pr-2">Адрес</label>
          {AReditProtectedObjectAddress || form.operation == 'Добавить'
            ? <FTextArea
              id='address'
              placeholder='Адрес'
              value={inputProtectedObjectAddress ? inputProtectedObjectAddress : ''}
              onChange={setInputProtectedObjectAddress}
              key={form.key}
            />
            : <p className="text-black text-xl font-bold">{inputProtectedObjectAddress}</p>}
        </div>

        {/* Фото */}
        {AReditProtectedObjectPhoto || form.operation == 'Добавить' &&
          <div className="form-item flex items-center w-full mt-2">
            <label className="text-lg pr-4">Фото</label>
            <FInputImageFile
              setUri={setInputProtectedObjectPhoto}
              key={form.key}
            />
          </div>}

        {/* Сим карты */}
        <div className="flex flex-col w-full min-w-max">
          <div className="flex flex-col xl:flex-row xl:space-x-4">
            {AReditProtectedObjectSimCard || form.operation == 'Добавить'
              ? (<>
                {/* Сим 1 */}
                <div className="form-item flex items-center w-full mt-2 space-x-2">
                  <label className="text-lg min-w-fit">Сим 1</label>
                  <FInputTelephone
                    placeholder='Номер'
                    value={inputProtectedObjectSim1 && !isUndefined(inputProtectedObjectSim1) ? inputProtectedObjectSim1 : ''}
                    onChange={ProtectedObjectSim1Change}
                    key={form.key}
                  />
                  <FButtonWhite
                    className="flex"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSimCardFindForm({
                        isOpen: true,
                        target: 'sim1',
                        value: isUndefined(inputProtectedObjectSim1) ? (serverData?.sim1 ? serverData.sim1 : '') : inputProtectedObjectSim1,
                      })
                    }}
                  >
                    <CreditCardIcon
                      className="h-6 w-6"
                    />
                  </FButtonWhite>
                </div>

                {/* Сим 2 */}
                <div className="form-item flex items-center w-full mt-2 space-x-2">
                  <label className="text-lg min-w-fit">Сим 2</label>
                  <FInputTelephone
                    placeholder='Номер'
                    value={inputProtectedObjectSim2 && !isUndefined(inputProtectedObjectSim2) ? inputProtectedObjectSim2 : ''}
                    onChange={ProtectedObjectSim2Change}
                    key={form.key}
                  />
                  <FButtonWhite
                    className="flex"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSimCardFindForm({
                        isOpen: true,
                        target: 'sim2',
                        value: isUndefined(inputProtectedObjectSim2) ? (serverData?.sim2 ? serverData.sim2 : '') : inputProtectedObjectSim2,
                      })
                    }}
                  >
                    <CreditCardIcon
                      className="h-6 w-6"
                    />
                  </FButtonWhite>
                </div>
              </>) : (<>
                {/* Сим 1 */}
                <div className="form-item flex items-center w-full mt-2 space-x-2">
                  <label className="text-lg min-w-fit">Сим 1</label>
                  <p className="text-sm p-2 overscroll-contain overflow-auto max-h-60 mx-4 bg-white">
                    value={inputProtectedObjectSim1 && !isUndefined(inputProtectedObjectSim1) ? inputProtectedObjectSim1 : ''}
                  </p>
                </div>

                {/* Сим 2 */}
                <div className="form-item flex items-center w-full mt-2 space-x-2">
                  <label className="text-lg min-w-fit">Сим 2</label>
                  <p className="text-sm p-2 overscroll-contain overflow-auto max-h-60 mx-4 bg-white">
                    value={inputProtectedObjectSim2 && !isUndefined(inputProtectedObjectSim2) ? inputProtectedObjectSim2 : ''}
                  </p>
                </div>
              </>)}

          </div>
        </div>

        {/* Описание */}
        <div className="form-item w-full mt-2">
          <label className="text-lg">Описание</label>
          {AReditProtectedObjectDescription || form.operation == 'Добавить'
            ? <FTextArea
              id='description'
              className={'h-60'}
              placeholder='Описание'
              value={inputProtectedObjectDescription ? inputProtectedObjectDescription : ''}
              onChange={setInputProtectedObjectDescription}
              key={form.key}
            />
            : <div
              className='relative rounded-xl overflow-auto whitespace-pre-line bg-slate-200 text-neutral-800 border-[1px] border-slate-600'
            >
              <p className="text-sm p-2 overscroll-contain overflow-auto max-h-60 mx-4 bg-white">
                {inputProtectedObjectDescription ? inputProtectedObjectDescription : ''}
              </p>
            </div>}
        </div>

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
          {(inputProtectedObjectPhoto || serverData?.protectedObject?.photo) &&
            <Image
              className="object-cover w-44 h-44 rounded-full"
              width={176}
              height={176}
              src={inputProtectedObjectPhoto ? inputProtectedObjectPhoto : serverData?.protectedObject?.photo}
              alt=""
            />
          }
        </div>

        {/* Кнопки */}
        <div
          className="flex flex-col"
        >

          {AReditProtectedObject &&
            <FButtonRed
              className="mb-4"
              disabled={!(form.isOpen && (operation == 'Добавить' ?
                (isInputValidateProtectedObjectNumber
                  && inputProtectedObjectName) :
                (!isMutatingFromServer && (
                  isInputValidateProtectedObjectNumber
                  || (inputProtectedObjectName != form.protectedObject?.name)
                  || (inputProtectedObjectAddress != form.protectedObject?.address)
                  || (inputProtectedObjectDescription != form.protectedObject?.description)
                  || inputProtectedObjectPhoto != null
                  || isInputValidateProtectedObjectSim1
                  || isInputValidateProtectedObjectSim2
                ))
              ))}
              onClick={(e) => operation == 'Добавить' ? submitAdd(e,
                inputProtectedObjectNumber,
                inputProtectedObjectName,
                inputProtectedObjectAddress,
                inputProtectedObjectPhoto,
                inputProtectedObjectDescription,
                inputProtectedObjectSim1,
                inputProtectedObjectSim2,
              ) : submitEdit(e,
                AReditProtectedObjectNumber ? inputProtectedObjectNumber : undefined,
                AReditProtectedObjectName ? inputProtectedObjectName : undefined,
                AReditProtectedObjectAddress ? inputProtectedObjectAddress : undefined,
                AReditProtectedObjectPhoto ? inputProtectedObjectPhoto : undefined,
                AReditProtectedObjectDescription ? inputProtectedObjectDescription : undefined,
                AReditProtectedObjectSimCard ? inputProtectedObjectSim1 : undefined,
                AReditProtectedObjectSimCard ? inputProtectedObjectSim2 : undefined,
              )}
            >
              {operation}
            </FButtonRed>
          }

          <FButtonWhite
            className=""
            onClick={() => setForm({ isOpen: false })}
          >
            Закрыть
          </FButtonWhite>

        </div>
      </div>

      {/* {Форма добавления/редактирования пультовой объекта} */}
      <FSimCardFindForm
        accessRules={accessRules}
        form={simCardFindForm}
        setForm={setSimCardFindForm}
        submit={submitSimCardFindForm}
      />

    </FModalForm>
  )
}