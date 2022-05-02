import { action, observable, runInAction, makeObservable } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';
// import useSWR from 'swr';
import fetchAuth from "../../middleware/requests";

enableStaticRendering(typeof window === 'undefined')

export default class MOBXuser {
    user = {};
    isAuth = false;

    constructor() {
        makeObservable(this, {
            user: observable,
            isAuth: observable,
            setAuth: action,
            setUser: action,
            login: action,
            registration: action,
            logout: action
        })
    }

    setAuth(bool) {
        this.isAuth = bool;
    }

    setUser(user) {
        this.user = user;
    }

    async login(email, password) {
        try {

            const responce = await fetchAuth('/authorization/login', { email, password });
            localStorage.setItem('token', responce.accessToken);
            this.setAuth(true);
            this.setUser(responce.user);

        } catch (error) {

            this.setAuth(false);
            this.setUser({});

            throw error;
        }
    }

    async registration(login, email, password) {
        try {

            const responce = await fetchAuth('/authorization/registration', { login, email, password });
            localStorage.setItem('token', responce.accessToken);
            this.setAuth(true);
            this.setUser(responce.user);

        } catch (error) {

            this.setAuth(false);
            this.setUser({});

            throw error;

        }
    }

    async logout() {
        try {

            await fetchAuth('/authorization/logout');
            localStorage.removeItem('token');

        } catch (error) {

            console.log(error);

        } finally {

            this.setAuth(false);
            this.setUser({});

        }
    }

    loadAuth() {

        return new Promise(async (resolve) => {

            try {
                const responce = await fetchAuth('/authorization/refresh');
                localStorage.setItem('token', responce.accessToken);
                this.setAuth(true);
                this.setUser(responce.user);
            } catch {
                this.setAuth(false);
                this.setUser({});
            } finally {
                return resolve();
            }

        })

    }

}