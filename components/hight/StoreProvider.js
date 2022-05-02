import { createContext, useContext } from 'react';
import MOBXui from '../../src/mobx/mobxUI';
import MOBXuser from '../../src/mobx/mobxUser';
import { useEffect } from 'react';
import useSWR from 'swr'
import fetchAuth from '../../middleware/requests';
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

export function StoreProvider({ children, initialState: initialData }) {

  const context = initializeStore( initialData );

  return <StoreContext.Provider value={context}>{children}</StoreContext.Provider>

}

function initializeStore(initialData = null) {

  const _mobxUser = mobxUser ?? new MOBXuser();
  const _mobxUI = mobxUI ?? new MOBXui();

  // load MOBXuser

  const router = useRouter();

  const { data, error } = useSWR( '/authorization/refresh', fetchAuth, {shouldRetryOnError: false} );

  useEffect(() => {

    if (error) {

      localStorage.removeItem('token');
      _mobxUser.setAuth(false);
      _mobxUser.setUser({});

      if (initialData?.checkAuth) {

        router.push('/authorization/login');

      }

    }else if (data) {

      localStorage.setItem('token', data.accessToken);
      _mobxUser.setAuth(true);
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
