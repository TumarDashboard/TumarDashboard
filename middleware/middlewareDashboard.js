import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose';
import ms from 'ms';
import { FDashboardAccessRules, FApiMethodAccessRules } from '../components/levelA/AccessRules';
import { intersectArraysPositions } from '../src/utils/arrayUtils';

function redirect(to, from) {

    const result = NextResponse.redirect(`${process.env.NEXT_PUBLIC_CLIENT_URL}${to}`);

    result.cookies.set("redirectAuth", from, {
        maxAge: ms(process.env.NEXT_PUBLIC_JWT_REDIRECT_AUTH_EXPIRES_IN),
        httpOnly: true,
        path: '/'
    });

    return result;
}

function next() {

    const result = NextResponse.next();

    result.cookies.delete('redirectAuth');

    return result;
}

function rewrite(to) {

    const result = NextResponse.rewrite(`${process.env.NEXT_PUBLIC_CLIENT_URL}${to}`);

    result.cookies.delete('redirectAuth');

    return result;
}

// This function can be marked `async` if using `await` inside
export async function middlewareDashboard(request) {

    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (refreshToken) {

        const verified = await jwtVerify(
            refreshToken,
            new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_REFRESH_SECRET)
        ).catch(error => { console.log(error); })

        const userData = verified?.payload;

        if (userData) {

            if (!userData.isActivated) {

                return redirect('/authorization/activatelink', request.nextUrl.pathname);

            }

            const findedRule = FApiMethodAccessRules.find((rule) => request.nextUrl.pathname.search(rule.url) > -1);

            if (request.nextUrl.pathname != "/dashboard"
                && findedRule
                && findedRule.access.length > 0
                && userData.positions
                && userData.positions.length > 0
                && intersectArraysPositions(findedRule.access, userData.positions)) {

                return next();

            }

            return rewrite('/dashboard/profile');

        }
    }

    console.log('middlewareDashboard redirect %s to /authorization', request.nextUrl.pathname);

    return redirect('/authorization', request.nextUrl.pathname);

}
