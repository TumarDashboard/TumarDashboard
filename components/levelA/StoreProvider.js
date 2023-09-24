import { createContext, useContext } from 'react';
import MOBXui from '../../src/mobx/mobxUI';
import MOBXuser from '../../src/mobx/mobxUser';
import { useEffect, useState } from 'react';
import useSWR from 'swr'
import { fetchAuth } from '../../middleware/requests';
import { useRouter } from 'next/router';
import { FButtonRed } from '../levelE_low/FButtonRed';
import FNextLink from '../levelE_low/FNextLink';

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

  // var { MOBXuser, MOBXui, error } = refreshStore(initialData, mobxUser?.isAuth == true);
  var { MOBXuser, MOBXui } = refreshStore(initialData, mobxUser?.isAuth == true);

  return <StoreContext.Provider 
      value={{MOBXuser, MOBXui}}
    >

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
      
      // console.log(error);

      localStorage.removeItem('token');

    } else if (data && _mobxUser.isLogout) {
      
      // console.log('update user auth, deleted data');
      _mobxUser.setAuth(false);
      _mobxUser.setUser({});
      
      mobxUser = null;

    } else if (data) {
      // console.log('%s done', isAuth ? 'update' : 'initialize');

      localStorage.setItem('token', data.accessToken);

      _mobxUser.setAuth(true);
      
      if (isAuth)
        _mobxUser.updateUser(data.user);
      else
        _mobxUser.setUser(data.user);

      // console.log('update user auth, user isLogout = ', _mobxUser.isLogout);

      if (initialData?.checkAuth && !data.user?.isActivated) {

        router.push('/authorization/activatelink');

      }

    }

  }, [data, error]);

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return {
    MOBXuser: _mobxUser,
    MOBXui: _mobxUI,
    // error: error
  }

  // Create the store once in the client
  if (!mobxUser) mobxUser = _mobxUser;
  if (!mobxUI) mobxUI = _mobxUI;

  return {
    MOBXuser: _mobxUser,
    MOBXui: _mobxUI,
    // error: error
  }

}