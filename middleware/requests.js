import { ApiError } from "./exceptions";

const fetchAuth = (url, data = {}, method = 'POST') =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${url}`, {
        method: method, // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage?.getItem('token')}`,
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).then(async response => {

        const body = await response.json();
        if (!response.ok)
            throw new ApiError(response.status, body.message);
        return body;

    })

    export default fetchAuth