import { action, observable, makeObservable, runInAction } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';

enableStaticRendering(typeof window === 'undefined')

export default class MOBXui {
    isLoading = false;
    isGoogleAuthError = false;
    googleAuthErrorEmail = '';
    googleAuthAuthorizeUrl = '';

    constructor() {
        makeObservable(this, {
            isLoading: observable,
            isGoogleAuthError: observable,
            googleAuthErrorEmail: false,
            googleAuthAuthorizeUrl: false,
            setLoading: action,
            openGoogleAuthError: action,
            closeGoogleAuthError: action
        })
    }

    setLoading() {

        if (this.isLoading) {

            setTimeout(() => runInAction(() => this.isLoading = false), 1000);

        } else {

            this.isLoading = true;

        }

    }

    openGoogleAuthError(email, authorizeUrl) {
        this.googleAuthErrorEmail = email;
        this.googleAuthAuthorizeUrl = authorizeUrl;
        this.isGoogleAuthError = true;
    }
    
    closeGoogleAuthError(){
        this.isGoogleAuthError = false;
    }
}