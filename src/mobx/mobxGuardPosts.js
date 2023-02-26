import { action, observable, runInAction, makeObservable, computed } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';
import { removeCookies } from '../../middleware/cookies';
import {fetchAuth} from "../../middleware/requests";
import { useEffect, useState } from 'react';

enableStaticRendering(typeof window === 'undefined')

export default class mobxGuardPosts {

    guardPosts = [];

    constructor() {
        makeObservable(this, {
            guardPosts: observable,
            refreshStore: action,
        })
    }

    refreshStore(){

        const { data, error } = useSWR(`/authorization/refresh?store=${isAuth ? 'update' : 'initialize'}`, fetchAuth, { shouldRetryOnError: false });
        
    }

}