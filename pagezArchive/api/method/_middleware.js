import { NextResponse } from 'next/server';
import { ApiError, catchErrorsMiddleware } from '../../../middleware/exceptions';
import { jwtVerify } from 'jose';
import { FApiMethodAccessRules, getApiMethodAccess } from '../../../components/levelA/AccessRules';
import { equalArrays, intersectArrays } from '../../../src/utils/arrayUtils';

export default catchErrorsMiddleware( async (req, ev) => {

    const authorizationToken = req.headers.get('Authorization');

    if( authorizationToken ){

        const responce = NextResponse.next();

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

                responce.headers.set('checkrefreshtoken', 'true');
            }

        }

        const userData = verified.payload;

        if( userData ){

            if (!userData.isActivated) {

                throw ApiError.UnauthorizedError();

            }

            const apiMethodAccessBlock = await getApiMethodAccess( req, userData );

            if ( apiMethodAccessBlock ){

                throw ApiError.BadRequest( apiMethodAccessBlock );

            }

            return responce;

        }

    }

    throw ApiError.UnauthorizedError();

})