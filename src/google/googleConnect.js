import { google } from 'googleapis';

const OAUTH2Client = new google.auth.OAuth2(
    process.env.NEXT_PRIVATE_GOOGLE_OAUTH2_CLIENT_ID,
    process.env.NEXT_PRIVATE_GOOGLE_OAUTH2_CLIENT_SECRET,
    process.env.NEXT_PRIVATE_GOOGLE_OAUTH2_REDIRECT_URIS
);

OAUTH2Client.setCredentials({ refresh_token: process.env.NEXT_PRIVATE_GOOGLE_OAUTH2_REFRESH_TOKEN });

export default OAUTH2Client;