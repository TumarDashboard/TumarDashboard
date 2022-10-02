import { ApiError } from "./exceptions";

export async function fetchAuth(url, data = {}, method = 'POST'){
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${url}`, {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage?.getItem('token')}`,
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    if( response.ok ){
        return await response.json();
    }else{
        var text = await response.text(); 
        try {
            const data = JSON.parse(text);
            var text = data.message;
        } catch (error) {}
        throw new ApiError(response.status, text);
    }
}

export async function fetchAuthMethod( url, data ){
    try {
        return await fetchAuth(url, data);
    } catch {

        localStorage.removeItem('token');

        const authData = await fetchAuth("/authorization/refresh?store=update");

        localStorage.setItem('token', authData.accessToken);

        return await fetchAuth(url, data);

    }
}

// Подгрузка файла

export async function fetchAuthFile(url, data = {}, method = 'POST'){
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${url}`, {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage?.getItem('token')}`,
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    if (response.ok){
        return response;
    }else{
        var text = await response.text(); 
        try {
            const data = JSON.parse(text);
            var text = data.message;
        } catch (error) {}
        throw new ApiError(response.status, text);
    }

}

export async function fetchAuthFileMethod( url, data ){
    try {
        return await fetchAuthFile(url, data);
    } catch {

        localStorage.removeItem('token');

        const authData = await fetchAuth("/authorization/refresh?store=update");

        localStorage.setItem('token', authData.accessToken);

        return await fetchAuthFile(url, data);

    }
}