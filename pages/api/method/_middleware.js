import { NextResponse } from 'next/server';
import { ApiError, catchErrorsMiddleware } from '../../../middleware/exceptions';
import { jwtVerify } from 'jose';
import { FApiMethodAccessRules } from '../../../components/hight/AccessRules';
import { equalArrays, intersectArrays } from '../../../src/utils/arrayUtils';

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

            if (!userData.isActivated) {

                throw ApiError.UnauthorizedError();

            }

            const findedRule = FApiMethodAccessRules.find( (rule) => req.nextUrl.pathname.search(rule.url) > -1 );

            if( !findedRule ){
                throw ApiError.BadRequest('Отсутствует право доступа');
            }

            if( findedRule.accessForUserSelf ){

                const requestJson = await req.json();

                if( requestJson.id == userData.id 
                    && equalArrays(requestJson.positions, userData.positions)
                ){

                    req.user = userData;
    
                    return NextResponse.next();

                }
            }

            if( findedRule.access.length > 0 
                        && userData.positions 
                        && userData.positions.length > 0
                        && intersectArrays( findedRule.access, userData.positions ) 
            ){

                req.user = userData;

                return NextResponse.next();

            }

            throw ApiError.BadRequest('Отсутствует право доступа');

        }

    }

    throw ApiError.UnauthorizedError();

})