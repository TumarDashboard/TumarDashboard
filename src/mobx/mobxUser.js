import { action, observable, runInAction, makeObservable, computed } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';
import { FApiMethodAccessRules } from '../../components/hight/AccessRules';
import { removeCookies } from '../../middleware/cookies';
import {fetchAuth} from "../../middleware/requests";
import { intersectArrays } from '../utils/arrayUtils';

enableStaticRendering(typeof window === 'undefined')

export default class MOBXuser {
    user = {};
    isAuth = false;
    accessRules = [];

    constructor() {
        makeObservable(this, {
            user: observable,
            isAuth: observable,
            accessRules: observable,
            setAuth: action,
            setUser: action,
            updateUser: action,
            avatar: computed,
            positions: computed,
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
        this.setAccessRules(this.user?.positions);
    }

    updateUser(user){

        Object.keys(user).forEach((key) => {
            if(user[key] && user[key] != '')
                this.user[key] = user[key];
        })

        this.setAccessRules(this.user?.positions);

    }

    setAccessRules( positions = [] ){
        this.accessRules = FApiMethodAccessRules.reduce( ( result, value ) => {
            if( value.accessForUserSelf ){
                    result.push(value.url.toString().replace('/\\/api\\/method\\/', '') + 'self');
                }
            if(intersectArrays( value.access, positions )){
                result.push( value.url.toString().replace('/\\/api\\/method\\/', '').replace('/', '') );
            }
            return result;
        }, []);
    }

    get avatar(){
        return this.user?.uiAvatarsSrc 
            ? this.user?.uiAvatarsSrc 
            : `https://ui-avatars.com/api/?name=${this.user?.surname}+${this.user?.firstName}&size=256&font-size=0.33&length=2`;
    }

    get positions(){
        return this.user?.positions ? this.user?.positions : [];
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

            removeCookies( "refreshToken", { path: '/'});

        } catch (error) {

            console.log(error);

        } finally {

            this.setAuth(false);
            this.setUser({});

        }
    }    
    
    async delete( reason ) {
        try {

            deleteUser( this.user.id, reason )
            
            localStorage.removeItem('token');

            removeCookies( "refreshToken", {req, res, path: '/'});

        } catch (error) {

            console.log(error);

        } finally {

            this.setAuth(false);
            this.setUser({});

        }
    }

}