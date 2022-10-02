import { createContext, useContext } from 'react';
import MOBXui from '../../src/mobx/mobxUI';
import MOBXuser from '../../src/mobx/mobxUser';
import { useEffect, useState } from 'react';
import useSWR from 'swr'
import { fetchAuth } from '../../middleware/requests';
import { useRouter } from 'next/router';
import { FButtonRed } from '../low/FButtonRed';
import { RefreshIcon } from '@heroicons/react/solid';

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

  const router = useRouter();

  var {data, error} = useSWR(`/authorization/refresh?store=${mobxUser?.isAuth == true ? 'update' : 'initialize'}`, fetchAuth, { shouldRetryOnError: false });

  const _mobxUser = mobxUser ?? new MOBXuser();
  const _mobxUI = mobxUI ?? new MOBXui();

  useEffect(() => {

    if (error) {

      console.log(error);

      localStorage.removeItem('token');

    } else if (data) {

      localStorage.setItem('token', data.accessToken);

      _mobxUser.setAuth(true);

      if (mobxUser?.isAuth == true)
        _mobxUser.updateUser(data.user);
      else
        _mobxUser.setUser(data.user);

      if (initialData?.checkAuth && !data.user?.isActivated) {

        router.push('/authorization/activatelink');

      }

    }

  }, [data, error]);

  if (typeof window != 'undefined') {
    if (!mobxUser) mobxUser = _mobxUser;
    if (!mobxUI) mobxUI = _mobxUI;
  }

  return <StoreContext.Provider value={{ MOBXuser: _mobxUser, MOBXui: _mobxUI}}>

    {initialData?.checkAuth && error &&
      <div
        className="fixed z-[1400] w-full bg-white flex flex-col justify-center"
      >
        <div
          className='flex w-full justify-center'>
          <span className="text-black font-bold mr-1">
            Ошибка подключения к базе данных:
          </span>
          <span className="text-color_C italic break-words">
            {error.message}
          </span>
        </div>
        <div className='flex justify-center my-2'>
          <FButtonRed
            className="flex"
            onClick={async(e) => {
              try {
                _mobxUI.setLoading();
                const responce = await fetchAuth(`/authorization/refresh?store=${mobxUser?.isAuth == true ? 'update' : 'initialize'}`);
                localStorage.setItem('token', responce.accessToken);
                _mobxUser.setAuth(true);
                _mobxUser.setUser(responce.user);
                error = null;
              } catch (error) {
                
              }finally{
                _mobxUI.setLoading();
              }
            }}
          >
            <RefreshIcon
              className="h-6 w-6"
            />
            Обновить
          </FButtonRed>

        </div>
      </div>}

    {children}

  </StoreContext.Provider>

}


