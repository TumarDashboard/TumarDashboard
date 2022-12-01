import { FModalForm } from '../FModalForm';
import { useState, useEffect } from 'react';

import { FInputNumber } from "../../levelE_low/FInputNumber";
import { FTextArea } from "../../levelE_low/FTextArea";
import { FInputFile } from "../../levelE_low/FInputFile";
import { FButtonRed } from "../../levelE_low/FButtonRed";
import { FButtonWhite } from "../../levelE_low/FButtonWhite";
import { FSelect } from "../../levelE_low/FSelect";
import { FSelectShifts } from "../../levelE_low/FSelectShifts";

import { equalArrays } from '../../../src/utils/arrayUtils';
import { FInputText } from '../../levelE_low/FInputText';
import Image from 'next/image';

export function FGuardPostShowGuardForm({ accessRules, form, setForm, submitAdd, submitEdit, users }) {

  /*-----Список охранников-------------------------------------------------------------------------------*/
  const [guardsToday, setGuardsToday] = useState([]);

  /*-----Чистка/Обновление инпутов-----------------------------------------------------------------------*/
  useEffect(() => {
    if (form.error) {
    } else if (form.isOpen) {
      console.log(form.guardsToday);
      setGuardsToday((form.guardsToday && form.guardsToday.length > 0) ? form.guardsToday : [])
    }
  }, [form])

  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title="Просмотр смены"
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full overflow-y-auto max-h-[90vh]"
    >
      {guardsToday.map((element, index)=>{
        return <div
          className='flex w-full h-full'
          key={element._id}
        >
          {/* <Image
            className="object-contain rounded-full"
            src={element.uiAvatarsSrc}
            layout='fill'
            alt=""
          >

          </Image> */}
        </div>
      })}
    </FModalForm>
  )
}