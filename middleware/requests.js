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
    const body = await response.json();
    if (!response.ok)
        throw new ApiError(response.status, body.message);
    return body;
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