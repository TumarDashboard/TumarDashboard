export function FSelect({ options, value, ...props }) {

    return (
        <select
            className="border border-gray-300 block w-full 
            focus:border-orange-300 focus:outline-none focus:ring focus:ring-orange-200 focus:ring-opacity-50 
            rounded-md shadow-sm"
            {...props}
        >
            {options.map((text, i) => {
                if (value.includes(text))
                    return <option key={text + i} className="bg-blue-200">{text}</option>
                else
                    return <option key={text + i}>{text}</option>
            })}
        </select>
    )

}