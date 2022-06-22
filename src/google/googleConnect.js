import { google } from 'googleapis';
import mongoServiceModel from "../mongo/models/mongoServiceModel";
import mongoConnect from "../mongo/mongoConnect";
import { ApiError } from "../../middleware/exceptions";

const scope =[
    'https://www.googleapis.com/auth/drive',
]

class OAUTH2Client {

    auth;

    constructor(){

        this.auth = new google.auth.OAuth2(
            process.env.NEXT_PRIVATE_GOOGLE_OAUTH2_CLIENT_ID,
            process.env.NEXT_PRIVATE_GOOGLE_OAUTH2_CLIENT_SECRET,
            process.env.NEXT_PUBLIC_API_URL + '/api/service/oauth2callback'
        );

    }

    async checkAuth(){

        try{

            await mongoConnect();

            const refresh_token = await mongoServiceModel.findOne({key: 'voidProperty'}).lean();

            if( refresh_token?.value ){

                this.auth.setCredentials({ refresh_token: refresh_token.value });

                await this.auth.getAccessToken();

            }else{

                mongoServiceModel.create({
                    key: 'voidProperty',
                    value: 'undifined'
                });

                throw new Error();

            }

        }catch(e){

            const authorizeUrl = this.auth.generateAuthUrl({
                access_type: 'offline',
                scope: scope,
                prompt: 'consent'
              });

            throw ApiError.UnauthorizedGoogleAuth( process.env.NEXT_PRIVATE_GOOGLE_OAUTH2_MAIL, authorizeUrl);

        }

    }

    async setCredentials(code){

        if( !code )
            throw ApiError.BadRequest("Отсутствует код, предоставляющий разрешение");

        const token = await this.auth.getToken(code);

        this.auth.setCredentials({refresh_token: token.tokens.refresh_token});

        await mongoConnect();

        await mongoServiceModel.findOneAndUpdate({key: 'voidProperty'}, {value: token.tokens.refresh_token}).lean();

    }

}

export default new OAUTH2Client();