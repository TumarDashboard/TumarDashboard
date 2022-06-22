export function FSelect({ options, value, defaultValue, ...props }) {
    return (
        <select
            className="border border-gray-300 block w-full 
            focus:border-orange-300 focus:outline-none focus:ring focus:ring-orange-200 focus:ring-opacity-50 
            rounded-md shadow-sm"
            value={value}
            {...props}
        >
            {options?.map((option, i) => {
                if (defaultValue?.includes(option.code))
                    return <option key={option.text + option.code + i} className="bg-blue-200 right-0" value={option.code}>{option.text}</option>
                else
                    return <option key={option.text + option.code + i} className="" value={option.code}>{option.text}</option>
            })}
        </select>
    )

}