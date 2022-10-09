import { NextResponse } from 'next/server';
import { ApiError, catchErrorsMiddleware } from '../../../middleware/exceptions';
import { jwtVerify } from 'jose';

export default catchErrorsMiddleware( async (req, ev) => {

    const authorizationToken = req.headers.get('Authorization');

    if( authorizationToken ){

        const accesToken = authorizationToken.split(' ')[1];
        
        var verified = await jwtVerify(
            accesToken,
            new TextEncoder().encode( process.env.NEXT_PRIVATE_JWT_ACCESS_SECRET )
            ).catch(error=>{return null})

        if( !verified ){

            const refreshToken = req.cookies['refreshToken'];

            if (refreshToken) {
        
                verified = await jwtVerify(
                    refreshToken,
                    new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_REFRESH_SECRET)
                ).catch(error => { throw ApiError.UnauthorizedError() })
        
            }

        }

        const userData = verified.payload;

        if( userData ){

            req.user = userData;

            return NextResponse.next();

        }

    }

    throw ApiError.UnauthorizedError();

})