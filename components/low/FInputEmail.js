import { useState } from 'react'
import * as Yup from 'yup';

const minlength = process.env.NEXT_PUBLIC_MIN_LENGTH_EMAIL;
const maxlength = process.env.NEXT_PUBLIC_MAX_LENGTH_EMAIL;

const validationSchema = Yup.object().shape({
    value: Yup.string()
        .required('не указан')
        .email('указан не корректно')
        .min(minlength, `должен содержать от ${minlength} до ${maxlength} символов`)
        .max(maxlength, `должен содержать от ${minlength} до ${maxlength} символов`)
});

export function FInputEmail({ onEmailChange, ...props }) {

    const [inputError, setInputError] = useState('');

    const handleChange = async (e) => {

        let value = e.target.value;

        var error = '';

        const isValid = value && !!await validationSchema.validate({ value }, { abortEarly: false }).catch((e) => {

            error = `Электронный адрес ${e.errors.join(", и ")}`;

        });

        setInputError(error);

        onEmailChange(value, isValid);
    }

    return (
        <>
            <input
                id="email"
                type="text"
                name="email"
                placeholder="Адрес электронной почты"
                onChange={handleChange}
                minLength={minlength}
                maxLength={maxlength}
                className="border border-gray-300 block w-full
                    focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
                    rounded-md shadow-sm disabled:bg-gray-100"
                {...props}
            />
            {inputError == '' ? null :
                <p className="text-color_C text-xs italic">
                    {inputError}
                </p>}
        </>
    )

}