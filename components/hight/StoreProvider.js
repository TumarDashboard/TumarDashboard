import { createContext, useContext } from 'react';
import MOBXui from '../../src/mobx/mobxUI';
import MOBXuser from '../../src/mobx/mobxUser';
import { useEffect, useState } from 'react';
import useSWR from 'swr'
import {fetchAuth} from '../../middleware/requests';
import { useRouter } from 'next/router';

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

  const [error, setError]= useState(null);

  const context = refreshStore(initialData, mobxUser?.isAuth == true, setError);

  return <StoreContext.Provider value={context}>
    {error && 
      <div 
      className="fixed z-[1400] w-full bg-white text-color_C italic break-words"
      >
        error
      </div>}
    {children}
  </StoreContext.Provider>

}

function refreshStore(initialData = null, isAuth, setError) {

  // load MOBXuser

  const router = useRouter();

  const { data, error } = useSWR(`/authorization/refresh?store=${isAuth ? 'update' : 'initialize'}`, fetchAuth, { shouldRetryOnError: false });
  
  const _mobxUser = mobxUser ?? new MOBXuser();
  const _mobxUI = mobxUI ?? new MOBXui();

  useEffect(() => {

    if (error) {
      
      console.log(error);

      localStorage.removeItem('token');

      setError(error.message);
      // _mobxUser.setAuth(false);
      // _mobxUser.setUser({});

      // if (initialData?.checkAuth ) {
        
      //   router.push({
      //     pathname: '/authorization/login',
      //     query: { from: router.asPath },
      //   }, undefined, { shallow: true });

      // }

    } else if (data) {

      localStorage.setItem('token', data.accessToken);

      setError(null);

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
    MOBXui: _mobxUI
  }

}
