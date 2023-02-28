import { useState } from 'react'

const minlength = process.env.NEXT_PUBLIC_MIN_LENGTH_TELEPHONE_INPUT;
const maxlength = process.env.NEXT_PUBLIC_MAX_LENGTH_TELEPHONE_INPUT;
const regexTel = /^(([+]{1}[7]{1})|[78]{1})(([(]{1}([0-9]{3})[)]{1})|([0-9]{3}))[-\s]{0,1}([0-9]{3})[-\s]{0,1}([0-9]{2})[-\s]{0,1}([0-9]{2})$/;

export function FInputTelephone({ className, onChange, placeholder, ...props }) {

    const [isInputValidate, setInputValidate] = useState(true);

    const handleChange = (e) => {

        let value = e.target.value;
        let isValid = (value.length >= minlength)
            && (value.length <= maxlength)
            && (regexTel.test(value));
        
        if( isValid ){
            let reg = regexTel.exec(value);
            value = `+7(${reg[5]||reg[6]})${reg[7]} ${reg[8]} ${reg[9]}`;
        }

        setInputValidate(value == "" || isValid);
        onChange(value, isValid);
    }

    return (
        <>
            <input
                id="telNo"
                type="tel"
                name="telNo"
                placeholder={placeholder}
                pattern="(([+]{1}[7]{1})|[78]{1})(([(]{1}[0-9]{3}[)]{1})|[0-9]{3})[-\s]{0,1}[0-9]{3}[-\s]{0,1}[0-9]{2}[-\s]{0,1}[0-9]{2}"
                minLength={minlength}
                maxLength={maxlength}
                onChange={handleChange}
                className={`${className} border border-gray-300 block w-full
                    focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
                    rounded-md shadow-sm disabled:bg-gray-100`}
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