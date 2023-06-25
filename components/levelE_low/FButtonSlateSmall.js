
export function FButtonSlateSmall({ className, children, ...props }) {
    return (
        <button
            className={`${className}
        items-center justify-center
        font-semibold px-1
        border border-transparent rounded-md focus:outline-none
        disabled:opacity-25 transition text-sm 
        bg-slate-200 hover:bg-slate-400 hover:text-white active:bg-slate-400 focus:border-slate-400 focus:ring focus:ring-slate-100 
        `}
            {...props}
        >
            {children}
        </button>
    )

}