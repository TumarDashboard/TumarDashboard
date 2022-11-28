import { useState } from 'react'

const minlength = process.env.NEXT_PUBLIC_MIN_LENGTH_INITIALS;
const maxlength = process.env.NEXT_PUBLIC_MAX_LENGTH_INITIALS;

export function inputInitialsValidate(value) {
    if (value)
        return (value.length >= minlength)
            && (value.length <= maxlength)
            && (/[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ]/.test(value))
            && (/^[аАәӘбБвВгГғҒдДеЕёЁжЖзЗиИйЙкКқҚлЛмМнНңҢоОөӨпПрРсСтТуУұҰүҮфФхХһҺцЦчЧшШщЩъЪыЫіІїЇьЬэЭюЮяЯ]+$/.test(value));
    return null;
}

export function FInputInitials({ id, className, onChange, placeholder, ...props }) {

    const [isInputValidate, setInputValidate] = useState(true);

    const handleChange = (e) => {

        let value = e.target.value.trim();

        let isValid = inputInitialsValidate(value);

        setInputValidate(value == "" || isValid);
        onChange(value, isValid);

    }

    return (
        <>
            <input
                id={id}
                type="text"
                // autoComplete={id}
                name={id}
                placeholder={placeholder}
                onChange={handleChange}
                minLength={minlength}
                maxLength={maxlength}
                className={`${className} border border-gray-300 block w-full
                    focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
                    rounded-md shadow-sm disabled:bg-gray-100`}
                {...props}
            />
            {isInputValidate ? null :
                <p className="text-color_C text-xs italic">
                    Должно содержаться от {minlength} до {maxlength} символов, где должны использоваться только буквы русского и казахского алфавитов
                </p>
            }
        </>
    )

}