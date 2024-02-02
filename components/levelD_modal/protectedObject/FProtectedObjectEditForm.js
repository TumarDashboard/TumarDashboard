import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';

import { FInputProtectedObjectNumber } from "../../levelE_low/FInputProtectedObjectNumber";
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
import { FInputTelephone } from '../../levelE_low/FInputTelephone';
import { CreditCardIcon } from '@heroicons/react/24/solid';
import { FSimCardFindForm } from '../simCard/FSimCardFindForm';
import { isUndefined } from 'swr/_internal';

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
        setInputValidateProtectedObjectNumber(validate && (value != form.protectedObject?.number));
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
    
    let dublicateSim =  competitor ? value == competitor : false ;

    setErrorProtectedObjectDublicateSim( dublicateSim );

    if (dublicateSim){
      setInputValidateProtectedObjectSim1( false );
    }else if (!value || value==''){
      setInputValidateProtectedObjectSim1( !isUndefined(serverData?.sim1) );
    }else if (operation == 'Добавить') {
      setInputValidateProtectedObjectSim1( validate );
    } else {
      setInputValidateProtectedObjectSim1( validate && (value != serverData?.sim1) );
    }
  }

  /*--Сим 2------ Формы редактирования-------------------------------------------------------------------*/
  const [inputProtectedObjectSim2, setInputProtectedObjectSim2] = useState();

  const [isInputValidateProtectedObjectSim2, setInputValidateProtectedObjectSim2] = useState(true);

  const ProtectedObjectSim2Change = (value, validate) => {

    setInputProtectedObjectSim2(value);

    let competitor = isUndefined(inputProtectedObjectSim1) ? serverData?.sim1 : inputProtectedObjectSim1;
    
    let dublicateSim =  competitor ? value == competitor : false ;

    setErrorProtectedObjectDublicateSim( dublicateSim );
    
    if (dublicateSim){
      setInputValidateProtectedObjectSim1( false );
    }else if (!value || value==''){
      setInputValidateProtectedObjectSim2( !isUndefined(serverData?.sim2) );
    }else if (operation == 'Добавить') {
      setInputValidateProtectedObjectSim2( validate );
    } else {
      setInputValidateProtectedObjectSim2( validate && (value != serverData?.sim2) );
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

  /*-------------------------------------------------------------------------------------------------------
      Чистка/Обновление инпутов
  -------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
      setError(form.error);
    } else if (form.isOpen) {

      if (form.operation != 'Добавить')
        triggerFromServer(form.protectedObject?._id);

      setOperation(form.operation);
      setInputProtectedObjectNumber(form.protectedObject?.number);
      setInputValidateProtectedObjectNumber(form.operation == 'Добавить');
      setInputProtectedObjectName(form.protectedObject?.name);
      setInputProtectedObjectAddress(form.protectedObject?.address);
      setInputProtectedObjectDescription(form.protectedObject?.description);
      setInputProtectedObjectPhoto(null);

      // setInputProtectedObjectSim1(form.protectedObject?.sim1);
      // setInputValidateProtectedObjectSim1(form.operation == 'Добавить');
      // setInputProtectedObjectSim2(form.protectedObject?.sim2);
      // setInputValidateProtectedObjectSim2(form.operation == 'Добавить');

      setInputProtectedObjectSim1();
      setInputValidateProtectedObjectSim1(false);
      setInputProtectedObjectSim2();
      setInputValidateProtectedObjectSim2(false);

      setError(null);
    } else {
      resetServerData();
    }
  }, [form])

  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={operation == 'Добавить' ? 'Добавить пультовой объект' : 'Данные пультового объекта'}
      widthForm='w-full lg:w-1/2 mx-6'
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[90vh]"
    >
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
      <div className="form-item w-full mt-2 flex flex-col sm:flex-row">
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

      {/* Описание и Сим карты */}
      {form.operation == 'Добавить' || (serverData && !isMutatingFromServer) ?

        <div className="flex flex-col w-full">

          {/* Сим карты */}
          {(form.operation == 'Добавить' || AReditProtectedObjectSimCard) &&
            <div className="flex flex-col xl:flex-row xl:space-x-4">

              {/* Сим 1 */}
              <div className="form-item flex items-center w-full mt-2 space-x-2">
                <label className="text-lg min-w-fit">Сим 1</label>
                <FInputTelephone
                  placeholder='Номер'
                  value={isUndefined(inputProtectedObjectSim1) ? (serverData?.sim1 ? serverData.sim1 : '') : inputProtectedObjectSim1 }
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
                  value={isUndefined(inputProtectedObjectSim2) ? (serverData?.sim2 ? serverData.sim2 : '') : inputProtectedObjectSim2 }
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

              {/* Статус ошибки */}
              {errorProtectedObjectDublicateSim &&
              <div className="form-item">
                <span className="text-color_C italic break-words">
                  Дублирование сим-карт
                </span>
              </div>}
              
            </div>}

          {/* Описание */}
          <div className="form-item w-full mt-2">
            <label className="text-lg">Описание</label>
            {AReditProtectedObjectDescription || form.operation == 'Добавить'
              ? <FTextArea
                id='description'
                className={'h-60'}
                placeholder='Описание'
                value={inputProtectedObjectDescription ? inputProtectedObjectDescription : serverData ? serverData.description : ''}
                onChange={setInputProtectedObjectDescription}
                key={form.key}
              />
              : <div
                className='relative rounded-xl overflow-auto whitespace-pre-line bg-slate-200 text-neutral-800 border-[1px] border-slate-600'
              >
                <p
                  className="text-sm p-2 
                  overscroll-contain overflow-auto max-h-60 mx-4 bg-white"
                >
                  {serverData ? serverData.description : ''}
                </p>
              </div>}
          </div>

        </div>
        :
        <div className="form-item w-full mt-4 flex justify-center h-60">
          <svg fill='none' className="w-52 h-52 animate-spin" viewBox="0 0 32 32" xmlns='http://www.w3.org/2000/svg'>
            <path clipRule='evenodd'
              d='M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z'
              fill='currentColor' fillRule='evenodd' />
          </svg>
        </div>
      }

      {/* Статус ошибки */}
      <div className="form-item">
        <span className="text-color_C italic break-words">
          {error}
        </span>
      </div>

      {/* Кнопки */}
      {AReditProtectedObject &&
        <div className="ml-auto mt-4">

          <FButtonRed
            className=""
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

          <FButtonWhite
            className="ml-4"
            onClick={() => setForm({ isOpen: false })}
          >
            Закрыть
          </FButtonWhite>

        </div>}

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