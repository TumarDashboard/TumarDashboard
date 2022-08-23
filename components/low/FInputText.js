export function FInputText({ id, className, onChange, placeholder, ...props }) {

    return (
        <input
            id={id}
            type="text"
            // autoComplete={id}
            name={id}
            placeholder={placeholder}
            onChange={(e)=>onChange(e.target.value)}
            className={`${className} border border-gray-300 block w-full
                focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
                rounded-md shadow-sm disabled:bg-gray-100`}
            {...props}
        />
    )

}