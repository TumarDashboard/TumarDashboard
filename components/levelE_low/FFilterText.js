import { XMarkIcon } from '@heroicons/react/20/solid';

export function FFilterText({ value, onChange, onClear, ...props }) {

    return (
      <div className='relative w-full'>
          {/* Фильтр */}
          <input
            type="text"
            placeholder="Фильтр"
            value={value}
            onChange={onChange}
            className="flex-1 w-full p-1 border border-gray-300 rounded-md mr-2"
            {...props }
          />

          {/* Кнопка чистки фильтра */}
          <button
            className="bg-color_B h-5 w-5 
            flex justify-center items-center rounded-md
            absolute indent-5
            right-5 top-1/2 translate-x-1/2 -translate-y-1/2
            fill-color_D hover:fill-color_C hover:ring hover:ring-red-200
            hover:bg-color_C active:bg-color_B disabled:opacity-25"
            onClick={onClear}
            disabled={value.length === 0}
          >
            <XMarkIcon
              className="h-5 w-5 fill-color_F
            hover:fill-color_G"
            />
          </button>

      </div>
    )

}