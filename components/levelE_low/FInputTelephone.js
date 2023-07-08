import { useState } from 'react';
import { HTMLpattern, getFormatedTelephoneNumberAndProvider, isNumberMSISDN } from '../levelZ_variable/FProviderItemList';

const minlength = process.env.NEXT_PUBLIC_MIN_LENGTH_TELEPHONE_INPUT;
const maxlength = process.env.NEXT_PUBLIC_MAX_LENGTH_TELEPHONE_INPUT;

export function FInputTelephone({ className, onChange, placeholder, ...props }) {

    const [isInputValidate, setInputValidate] = useState(true);

    const handleChange = (e) => {
        let value = e.target.value;
        let isValid = (value.length >= minlength)
            && (value.length <= maxlength)
            && isNumberMSISDN(value);

        let provider;

        if( isValid ){
            [value, provider] = getFormatedTelephoneNumberAndProvider(value);
        }

        setInputValidate(value == "" || isValid);
        onChange(value, isValid, provider);
    }

    return (
        <>
            <input
                id="telNo"
                type="tel"
                name="telNo"
                placeholder={placeholder}
                pattern={HTMLpattern}
                minLength={minlength}
                maxLength={maxlength}
                onChange={handleChange}
                className={`${className} border border-gray-300 block
                    focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
                    rounded-md shadow-sm disabled:bg-gray-100 min-w-[150px]`}
                {...props}
            />
            {isInputValidate ? null :
                <p className="text-color_C text-xs italic">
                    Допустимый формат номера +77007007070
                </p>
            }
        </>
    )

}