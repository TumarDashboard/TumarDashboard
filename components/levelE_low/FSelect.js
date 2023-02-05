export function FSelect({ options, value, className, defaultValue, ...props }) {
    const { disabled } = props;
    if (disabled) {
        return (
            <ul
                className={`border border-gray-300 block w-full 
                focus:border-orange-300 focus:outline-none focus:ring focus:ring-orange-200 focus:ring-opacity-50
                rounded-md shadow-sm ${className}`}
                {...props}
            >
                {options?.map((option, i) => {
                    return <li
                        key={option.label + option.value + i}
                        className={`${defaultValue?.includes(option.value) ? "bg-blue-200 right-0" : null}`}
                        value={option.value}>
                        {option.label}
                    </li>
                })}
            </ul>
        )
    }else{
        return (
            <select
                className={`border border-gray-300 block w-full 
                focus:border-orange-300 focus:outline-none focus:ring focus:ring-orange-200 focus:ring-opacity-50
                rounded-md shadow-sm ${className}`}
                value={value}
                {...props}
            >
                {options?.map((option, i) => {
                    return <option
                        key={option.label + option.value + i}
                        className={`${defaultValue?.includes(option.value) ? "bg-blue-200 right-0" : null}`}
                        value={option.value}>
                        {option.label}
                    </option>
                })}
            </select>
        )
    }

}