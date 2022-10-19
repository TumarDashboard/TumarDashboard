import { XIcon } from '@heroicons/react/solid';

export function FFilterText({ value, onChange, onClear, ...props }) {

    return (
        <>
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
            className="bg-color_B h-8 w-8 flex justify-center items-center rounded-md
            hover:bg-color_C active:bg-color_B disabled:opacity-25"
            onClick={onClear}
            disabled={value.length === 0}
          >
            <XIcon
              className="h-8 w-8 fill-color_F
            hover:fill-color_G"
            />
          </button>

        </>
    )

}