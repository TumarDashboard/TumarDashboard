import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';
import { PhoneIcon, UserIcon } from '@heroicons/react/24/solid';

import { FInputNumber } from "../../levelE_low/FInputNumber";
import { FTextArea } from "../../levelE_low/FTextArea";
import { FInputFile } from "../../levelE_low/FInputFile";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FSelect } from "../../levelE_low/FSelect";
import { FSelectShifts } from "../../levelE_low/FSelectShifts";

import { equalArrays } from '../../../src/utils/arrayUtils';
import { FInputText } from '../../levelE_low/FInputText';
import Image from "next/legacy/image";

export function FGuardPostShowGuardForm({ accessRules, form, setForm, submitAdd, submitEdit, users }) {

  /*-----Список охранников-------------------------------------------------------------------------------*/
  const [guardsToday, setGuardsToday] = useState([]);

  /*-----Чистка/Обновление инпутов-----------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
    } else if (form.isOpen) {
      console.log(form);
      setGuardsToday((form.guardsToday && form.guardsToday.length > 0) ? form.guardsToday : [])
    }
  }, [form])

  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title={[ 
        'Просмотр смены',
        form.guardPost?.number ? ': ' + form.guardPost?.number : null,
        form.guardPost?.callsign ? ' - ' + form.guardPost?.callsign : null
      ].filter(Boolean).join('')}
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col p-4 w-full overflow-y-auto max-h-[90vh] space-y-4"
      widthForm=' lg:w-1/2 2xl:w-1/3 fl:w-1/4'
    >
      {guardsToday.map((element, index) => {
        const isOdd = index & 1;
        return <div
          className='flex flex-col md:flex-row w-full items-center 
         shadow-md rounded-2xl md:shadow-none md:rounded-none'
          key={element._id}
        >

          <div
            className={`flex-1 flex items-center 
            ${isOdd ? 'md:justify-end': 'md:order-1'}`}
          >
            <div
              className={`p-2 md:border-2 md:shadow-neutral-500 md:shadow-md
              ${isOdd ? 'md:border-r-0 md:rounded-l-2xl': 'md:border-l-0 md:rounded-r-2xl'}`}
            >

              <div className="form-item flex items-center">
                <UserIcon className='h-8 w-8' />
                <span className="text-3xl subpixel-antialiased">
                  {[element.surname, element.firstName].join(' ')}
                </span>
              </div>

              {element.telephone.length > 0 &&
                <div className="form-item flex items-center ">
                  <PhoneIcon className='h-8 w-8' />
                  <a
                    className="text-3xl subpixel-antialiased"
                    href={`tel:${element.telephone}`}
                  >
                    {element.telephone}
                  </a>
                </div>}

            </div>

          </div>

          <div
            className={`relative h-64 w-64 
            md:border-2 rounded-3xl shadow-neutral-500 shadow-md 
            ${isOdd ? 'md:order-0': ''}`}
          >
            <Image
              className="rounded-3xl object-cover"
              src={element.uiAvatarsSrc}
              layout='fill'
              alt=""
            >

            </Image>
          </div>

        </div>
      })}
    </FModalForm>
  )
}