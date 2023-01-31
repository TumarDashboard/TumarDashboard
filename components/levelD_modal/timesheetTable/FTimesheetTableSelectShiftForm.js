import { FModalForm } from '../FModalForm';

import FShiftItemList from '../../levelZ_variable/FShiftsItemList';

export function FTimesheetTableSelectShiftForm({ form, setForm, submitHandle }) {

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