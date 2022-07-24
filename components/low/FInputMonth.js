
export function FInputMonth({ id, className, onChange, placeholder, ...props }) {

    return (
        // <input type="month" id="start" name="start" min="2018-03" value="2018-05"/>
        <input
            id={id}
            type="month"
            name={id}
            placeholder={placeholder}
            onChange={(e)=>onChange(e.target.value)}
            className={`${className} border border-gray-300 block
                    focus:border-red-300 focus:outline-none focus:ring focus:ring-red-200 focus:ring-opacity-50 
                    rounded-md shadow-sm disabled:bg-gray-100 open:bg-black`}
            {...props}
        />
    )

}