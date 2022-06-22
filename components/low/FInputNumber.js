import { useState } from 'react'

const minlength = process.env.NEXT_PUBLIC_MIN_LENGTH_NUMBER_INPUT;
const maxlength = process.env.NEXT_PUBLIC_MAX_LENGTH_NUMBER_INPUT;

export function FInputNumber({ id, className, onChange, placeholder, ...props }) {

    const [isInputValidate, setInputValidate] = useState(true);

    const handleChange = (e) => {
        let value = parseInt( e.target.value );
        let isValid = minlength <= value &&  value <= maxlength;
        setInputValidate(isNaN(value) || isValid);
        onChange(value, isNaN(value) || isValid);
    }

    return (
        <div
            className='flex flex-col'
        >
            <input
                id={id}
                type="number"
                name={id}
                placeholder={placeholder}
                onChange={handleChange}
                className={`${className} border border-gray-300 block w-full
                    focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
                    rounded-md shadow-sm disabled:bg-gray-100`}
                {...props}
            />
            {isInputValidate ? null :
                <p className="text-color_C text-xs italic">
                    Кол-во цифр должно быть в диапозоне от {minlength} до {maxlength}
                </p>
            }
        </div>
    )

}