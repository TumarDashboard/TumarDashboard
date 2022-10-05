import { createContext, useContext } from 'react';
import MOBXui from '../../src/mobx/mobxUI';
import MOBXuser from '../../src/mobx/mobxUser';
import { useEffect, useState } from 'react';
import useSWR from 'swr'
import { fetchAuth } from '../../middleware/requests';
import { useRouter } from 'next/router';
import { FButtonRed } from '../low/FButtonRed';
import { RefreshIcon, UserCircleIcon } from '@heroicons/react/solid';
import FNextLink from '../low/FNextLink';

let mobxUser;
let mobxUI;

export const StoreContext = createContext();

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within StoreProvider')
  }

  return context
}

export function StoreProvider({ isFirstMount, children, initialState: initialData }) {

  var { MOBXuser, MOBXui, error } = refreshStore(initialData, mobxUser?.isAuth == true);

  return <StoreContext.Provider value={{MOBXuser, MOBXui}}>

    {initialData?.checkAuth && error &&
      <div
        className="fixed z-[1400] w-full bg-white flex flex-col justify-center"
      >
        <div
          className='flex w-full justify-center mx-2 mt-1'>
          <p className="text-black font-bold mr-1">
            Ошибка доступа к платформе:
          </p>
          <p className="text-color_C italic break-words">
            {error.message}
          </p>
        </div>
        <div className='flex justify-center my-2'>
          <FButtonRed
            className="flex mr-2"
            onClick={async(e) => {
              try {
                MOBXui.setLoading();
                const responce = await fetchAuth(`/authorization/refresh?store=${mobxUser?.isAuth == true ? 'update' : 'initialize'}`);
                localStorage.setItem('token', responce.accessToken);
                _mobxUser.setAuth(true);
                _mobxUser.setUser(responce.user);
                error = null;
              } catch (error) {
                
              }finally{
                MOBXui.setLoading();
              }
            }}
          >
            <RefreshIcon
              className="h-6 w-6"
            />
            Обновить
          </FButtonRed>
          
          <FNextLink
              href="/authorization/login"
              className='text-color_C hover:bg-color_C hover:text-color_G px-3 py-2 rounded-md text-sm font-bold font-font_B'
          >
            <UserCircleIcon className="h-8 w-8" />
          </FNextLink>

        </div>
      </div>}

    {children}

  </StoreContext.Provider>

}

function refreshStore(initialData = null, isAuth) {

  // load MOBXuser

  const router = useRouter();

  const { data, error } = useSWR(`/authorization/refresh?store=${isAuth ? 'update' : 'initialize'}`, fetchAuth, { shouldRetryOnError: false });
  
  const _mobxUser = mobxUser ?? new MOBXuser();
  const _mobxUI = mobxUI ?? new MOBXui();

  useEffect(() => {

    if (error) {
      
      console.log(error);

      localStorage.removeItem('token');

    } else if (data) {

      localStorage.setItem('token', data.accessToken);

      _mobxUser.setAuth(true);
      
      if (isAuth)
        _mobxUser.updateUser(data.user);
      else
        _mobxUser.setUser(data.user);

      if (initialData?.checkAuth && !data.user?.isActivated) {

        router.push('/authorization/activatelink');

      }

    }

  }, [data, error]);

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return {
    MOBXuser: _mobxUser,
    MOBXui: _mobxUI
  }

  // Create the store once in the client
  if (!mobxUser) mobxUser = _mobxUser;
  if (!mobxUI) mobxUI = _mobxUI;

  return {
    MOBXuser: _mobxUser,
    MOBXui: _mobxUI,
    error: error
  }

}