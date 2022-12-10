import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import FNextLink from '../levelE_low/FNextLink';
import Image from "next/legacy/image";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function FNavbarProfile({ uiAvatarsSrc, logout }) {
  return (
    <Disclosure as="nav" className="bg-color_A">
      {({ open }) => (
        <Menu as="div" className="ml-3 relative items-center content-center">
          <Menu.Button
            className="bg-color_A flex text-sm rounded-full 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-color_A focus:ring-white">
            <span className="sr-only">Open user menu</span>
            <Image
              className="h-8 w-8 rounded-full"
              width={32} 
              height={32}
              src={uiAvatarsSrc}
              alt=""
            />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg py-1 
            bg-white ring-1 ring-black ring-opacity-5 focus:outline-none text-center">
              <Menu.Item>
                {({ active }) => (
                  <FNextLink
                    href="/dashboard/profile"
                    className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                  >
                    Аккаунт
                  </FNextLink>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    className={classNames(active ? 'bg-gray-100' : '', 'text-center w-full block px-4 py-2 text-sm text-gray-700')}
                  >
                    Выход
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      )}

    </Disclosure>
  );
};
