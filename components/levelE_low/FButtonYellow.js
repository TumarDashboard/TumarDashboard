export function FButtonYellow({ className, disabled, children, ...props }) {
    return (
        <button
            disabled={disabled}
            className={`${className}
            items-center justify-center px-4 py-2 bg-yellow-400 
            font-semibold capitalize text-black
            border border-transparent rounded-md 
            hover:bg-yellow-700 hover:text-white active:bg-yellow-700 focus:outline-none focus:border-yellow-700 focus:ring focus:ring-yellow-200 
            disabled:opacity-25 transition`}
            {...props}
        >
            {children}
        </button>
    )

}