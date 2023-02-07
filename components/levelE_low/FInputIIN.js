import { useState } from 'react'
import { isINNIndividual } from '../../src/utils/dataUtils';

export function FInputIIN({ id, className, onChange, placeholder, ...props }) {

    const [isInputValidate, setInputValidate] = useState(true);

    const handleChange = (e) => {
        let value = e.target.value;
        let isValid = isINNIndividual( value );
        setInputValidate(isNaN(value) || isValid);
        onChange(value, isNaN(value) || isValid);
    }

    return (
        <div
            className='flex relative space-x-2'
        >
            <input
                id={id}
                type="number"
                name={id}
                placeholder={placeholder}
                onChange={handleChange}
                className={`${className} border border-gray-300 block w-full
                    focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
                    rounded-md shadow-sm disabled:bg-gray-100 
                    `}
                {...props}
            />
            {isInputValidate ? null :
                <p className="
                xl:absolute xl:-bottom-4 xl:-left-20 xl:w-max 
                text-color_C text-xs italic ">
                    Неккоректный формат ИИН
                </p>
            }
        </div>
    )

}