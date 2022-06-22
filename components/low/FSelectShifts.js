
import { useState } from 'react';
import { XIcon, ChevronDownIcon } from '@heroicons/react/solid';

const maxlength = process.env.NEXT_PUBLIC_MAX_COUNT_SHIFTS;

export function FSelectShifts({ selected, onChange }) {

    const [isTogle, setTogle] = useState(false);

    const [isMaxSelected, setMaxSelected] = useState(false);

    const addSelected = (e) => {
        if (!selected || selected.length < maxlength) {
            onChange(arr => [...arr, e.target.value]);
        } else {
            setMaxSelected(true);
            setTimeout(() => { setMaxSelected(false) }, 2000)
        }
    }

    const deleteSelected = (i) => {
        onChange(selected.filter((_, index) => index !== i));
    }

    const list = [];

    for (let i = 1; i < 25; i++) {
        list.push(
            <li
                key={i}
                className="text-center select-none font-bold hover:bg-red-600 hover:text-color_G py-1 rounded-md hover:scale-125"
                onMouseDown={addSelected}
                value={i}
            >
                {i}
            </li>
        )
    }

    return (
        <div
            className="w-full relative"
        >

            {isTogle &&
                <div
                    className='absolute w-full h-full z-10'
                >
                    <div
                        className='flex w-full h-full items-center justify-center bg-color_G'>

                        <ul
                            className='grid grid-cols-6 lg:grid-cols-12 w-full h-fit bg-color_G rounded-md content-center'
                        >
                            {list}
                        </ul>

                    </div>
                </div>
            }

            <div
                className="border border-gray-300 block w-full 
                hover:border-orange-300 hover:outline-none hover:ring hover:ring-orange-200 hover:ring-opacity-50 
                rounded-md shadow-sm
                flex"
                onClick={() => setTogle(!isTogle)}
                onBlur={() => setTogle(false)}
                tabIndex="0"
            >
                <div
                    className='flex flex-wrap flex-1'
                >

                    {selected?.map((value, i) => {
                        return <button
                            key={i}
                            className='flex items-center justify-center pl-2 m-1 bg-red-600 select-none
                            font-semibold capitalize text-white text-lg hover:text-red-400
                            border border-transparent rounded-md hover:scale-110
                            hover:bg-red-700 active:bg-red-700 focus:outline-none focus:border-red-700 focus:ring focus:ring-red-200
                            group'
                            onClick={(e) => {
                                deleteSelected(i);
                                e.stopPropagation();
                            }}
                        >
                            <span>{value}</span>

                            <XIcon
                                className="ml-auto fill-white mx-1 group-hover:fill-red-400 group-hover:scale-110 w-4 h-4 cursor-pointer"
                                viewBox="0 0 18 18"
                            />

                        </button>
                    })}

                </div>

                <div
                    className='flex items-center justify-center px-2 h-10'
                >

                    <ChevronDownIcon
                        className="fill-gray-600 w-5 h-5"
                        viewBox="0 0 18 18"
                    />

                </div>

            </div>

            {isMaxSelected &&
                <p className="text-color_C text-xs italic">
                    Максимальное количество смен {maxlength}
                </p>
            }

        </div>
    )

}