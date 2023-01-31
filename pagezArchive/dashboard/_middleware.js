import { NextResponse } from 'next/server';
import { catchErrorsMiddleware } from '../../middleware/exceptions';
import { jwtVerify } from 'jose';
import ms from 'ms';
import { FDashboardAccessRules } from '../../components/levelA/AccessRules';
import { intersectArrays } from '../../src/utils/arrayUtils';

function redirect( to, from ){

    const res = NextResponse.rewrite(`${process.env.NEXT_PUBLIC_CLIENT_URL}${to}`);

    res.cookie( "redirectAuth", from , {
        maxAge: ms(process.env.NEXT_PUBLIC_JWT_REDIRECT_AUTH_EXPIRES_IN),
        httpOnly: true,
        path: '/'
    });

    return res;

}

export default catchErrorsMiddleware(async (request, ev) => {
    
    const refreshToken = request.cookies['refreshToken'];

    if (refreshToken) {

        const verified = await jwtVerify(
            refreshToken,
            new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_REFRESH_SECRET)
        ).catch(error => { console.log(error);})

        const userData = verified?.payload;

        if (userData) {

            if (!userData.isActivated) {

                return redirect('/authorization/activatelink', request.nextUrl.pathname);

            }

            const findedRule = FDashboardAccessRules.find( (rule) => request.nextUrl.pathname.search(rule.url) > -1 );

            if( request.nextUrl.pathname != "/dashboard" 
                && findedRule 
                && findedRule.access.length > 0 
                && userData.positions 
                && userData.positions.length > 0
                && intersectArrays( findedRule.access, userData.positions )){

                request.user = userData;

                return NextResponse.next().clearCookie('redirectAuth');

            }

            return NextResponse.rewrite(`${process.env.NEXT_PUBLIC_CLIENT_URL}/dashboard/profile`).clearCookie('redirectAuth');

        }

    }

    console.log('catchErrorsMiddleware redirect to /authorization');
    
    return redirect('/authorization', request.nextUrl.pathname);

})