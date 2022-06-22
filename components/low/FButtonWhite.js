export function FButtonWhite({ className, disabled, children, ...props }) {
    return (
        <button
            disabled={disabled}
            className={`${className}
            items-center justify-center px-4 py-2 bg-white border-red-700
            font-semibold capitalize text-gray-900
            border border-transparent rounded-md 
            hover:bg-red-300 hover:text-color_D active:bg-red-300 focus:outline-none focus:border-red-900 focus:ring focus:ring-red-200 
            disabled:opacity-25 transition`}
            {...props}
        >
            {children}
        </button>
    )

}