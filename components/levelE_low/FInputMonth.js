
export function FInputMonth({ onChange, className, ...props }) {

    return (
        <input
            type="month"
            id="start"
            name="start"
            min="2022-01"
            max="2022-12"
            onChange={(e) => onChange(e.target.value)}
            {...props}
            className={`${className} border border-gray-300 p-0
                    focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
                    rounded-md shadow-sm disabled:bg-gray-100 open:bg-black
                    text-black font-bold text-center`}
        />
    )

}