import { action, observable, makeObservable, runInAction } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';

enableStaticRendering(typeof window === 'undefined')

export default class MOBXui {
    isLoading = false;
    isUpdate = false;
    updateError = null;
    isGoogleAuthError = false;
    googleAuthErrorEmail = '';
    googleAuthAuthorizeUrl = '';

    constructor() {
        makeObservable(this, {
            isLoading: observable,
            isUpdate: observable,
            updateError: observable,
            isGoogleAuthError: observable,
            googleAuthErrorEmail: false,
            googleAuthAuthorizeUrl: false,
            setLoading: action,
            setUpdate: action,
            setUpdateState: action,
            setUpdateError: action,
            openGoogleAuthError: action,
            closeGoogleAuthError: action
        })
    }

    setLoading() {

        if (this.isLoading) {

            setTimeout(() => runInAction(() => {
                this.isLoading = false
            }), 1000);

        } else {

            this.isLoading = true;

        }

    }    
    
    setUpdate() {
        if (this.isUpdate) {

            setTimeout(() => runInAction(() => {
                this.isUpdate = false
            }), 1000);

        } else {

            this.isUpdate = true;
            this.updateError = null;

        }

    }

    setUpdateState(state) {
        this.isUpdate = state;
    }

    setUpdateError(error) {
        this.isUpdate = false
        this.updateError = error;
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