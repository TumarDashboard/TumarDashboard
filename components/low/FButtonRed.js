export function FButtonRed({ className, disabled, children, ...props }) {
    return (
        <button
            disabled={disabled}
            className={`${className}
            items-center justify-center px-4 py-2 bg-red-600 
            font-semibold capitalize text-white
            border border-transparent rounded-md 
            hover:bg-red-700 active:bg-red-700 focus:outline-none focus:border-red-700 focus:ring focus:ring-red-200 
            disabled:opacity-25 transition`}
            {...props}
        >
            {children}
        </button>
    )

}