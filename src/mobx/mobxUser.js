import { action, observable, runInAction, makeObservable, computed } from 'mobx';
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
            updateUser: action,
            avatar: computed,
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

    updateUser(user){

        Object.keys(user).forEach((key) => {
            this.user[key] = user[key];
        })

    }

    get avatar(){
        return this.user?.uiAvatarsSrc 
            ? this.user?.uiAvatarsSrc 
            : `https://ui-avatars.com/api/?name=${this.user?.surname}+${this.user?.firstName}&size=256&font-size=0.33&length=2`;
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

    async registration(surname, firstName, patronymic, email, password) {
        try {

            const responce = await fetchAuth('/authorization/registration', { surname, firstName, patronymic, email, password });
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

    // loadAuth() {

    //     return new Promise(async (resolve) => {

    //         try {

    //             const responce = await fetchAuth('/authorization/refresh');
    //             localStorage.setItem('token', responce.accessToken);
    //             this.setAuth(true);
    //             this.setUser(responce.user);

    //         } catch {

    //             this.setAuth(false);
    //             this.setUser({});

    //         } finally {

    //             return resolve();

    //         }

    //     })

    // }

}

export const changeUser = async( id, uiAvatarsSrc, surname, firstName, patronymic, positions ) => {
    try {

        return await fetchAuth('/method/changeUser', { id, uiAvatarsSrc, surname, firstName, patronymic, positions });

    } catch (error) {

        throw error;

    }
}