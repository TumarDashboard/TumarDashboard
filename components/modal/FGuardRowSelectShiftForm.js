import { XIcon, PlusIcon } from '@heroicons/react/solid';
import { FModalForm } from './FModalForm';
import { useState, useEffect } from 'react';
import { FInputFile } from "../low/FInputFile";
import { FButtonRed } from "../low/FButtonRed";
import { FButtonWhite } from "../low/FButtonWhite";
import { FSelect } from "../low/FSelect";

import { equalArrays } from '../../src/utils/arrayUtils';
import { FInputInitials } from '../low/FInputInitials';
import { FInputTelephone } from '../low/FInputTelephone';
import Select from 'react-select';
import { useId } from 'react';
import { FInputText } from '../low/FInputText';
import { array } from 'yup';
import { FGuardEditForm } from './FGuardEditForm';
import { createGuard } from '../../src/dtos/dtoGuard';
import { FSelectShifts } from '../low/FSelectShifts';
import FShiftItemList from '../variable/FShiftsItemList';

export function FGuardRowSelectShiftForm({ form, setForm, submitHandle }) {

  const list = FShiftItemList.map((value, index) => {
    return <li
      key={index}
      className="text-center select-none font-bold hover:bg-red-600 hover:text-color_G py-1 rounded-md hover:scale-125"
      onPointerDown={submitHandle}
      id={value}
    >
      {value}
    </li>
  });

  /*-------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------*/

  return (
    <FModalForm
      title='Выбор смены'
      isModalFormOpen={form.isOpen}
      setIsModalFormOpen={setForm}
      className="flex flex-col items-start p-4 w-full max-h-[70vh] overflow-y-auto"
    >

      {/* Смены */}
      <div className="form-item flex items-center w-full h-full justify-center bg-color_G">

        <ul
          className='grid grid-cols-6 lg:grid-cols-12 w-full h-fit bg-color_G rounded-md content-center'
        >
          {list}
        </ul>

      </div>

    </FModalForm >
  )
}