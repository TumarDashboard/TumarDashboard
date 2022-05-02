import { NextResponse } from 'next/server';
import { catchErrorsMiddleware } from '../../middleware/exceptions';
import { jwtVerify } from 'jose';
import ms from 'ms';

function redirect( to, from ){

    const res = NextResponse.rewrite(`${process.env.NEXT_PUBLIC_CLIENT_URL}${to}`);

    res.cookie( "redirectAuth", from , {
        maxAge: ms(process.env.NEXT_PRIVATE_JWT_REDIRECT_AUTH_EXPIRES_IN),
        httpOnly: true,
        path: '/'
    });

    return res;

}

export default catchErrorsMiddleware(async (req, ev) => {
    const refreshToken = req.cookies['refreshToken'];
    
    if (refreshToken) {

        const verified = await jwtVerify(
            refreshToken,
            new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_REFRESH_SECRET)
        ).catch(error => { })

        const userData = verified?.payload;

        if (userData) {

            if (!userData.isActivated) {
                return redirect('/authorization/activatelink', req.nextUrl.pathname);
            }
            
            if (req.nextUrl.pathname == "/dashboard")
                return NextResponse.rewrite(`${process.env.NEXT_PUBLIC_CLIENT_URL}/dashboard/profile`).clearCookie('redirectAuth');
            else {
                return NextResponse.next().clearCookie('redirectAuth');
            }

        }

    }

    return redirect('/authorization/login', req.nextUrl.pathname);

})