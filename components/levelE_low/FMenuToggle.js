import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function FMenuToggle({ toggle, open, ...props }) {

  return <div
  {...props}
  >
    <button
      className="p-1 rounded-md bg-color_A hover:bg-color_C text-color_C hover:text-color_A focus:outline-none focus:ring-1 focus:ring-inset focus:ring-color_C"
      onClick={toggle}
    >
      <span className="sr-only">Open main menu</span>
      {open == 'visible' ? 
        <XMarkIcon className="block h-8 w-8" aria-hidden="true" />
       : 
        <Bars3Icon className="block h-8 w-8" aria-hidden="true" />
      }
    </button>
  </div>
};
