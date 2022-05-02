import { action, observable, makeObservable, runInAction } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';

enableStaticRendering(typeof window === 'undefined')

export default class MOBXui {
    isLoading = false;

    constructor() {
        makeObservable(this, {
            isLoading: observable,
            setLoading: action
        })
    }

    setLoading() {

        if (this.isLoading) {

            setTimeout(() => runInAction(() => this.isLoading = false), 1000);

        } else {

            this.isLoading = true;

        }

    }
}