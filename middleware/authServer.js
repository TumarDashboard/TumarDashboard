import ms from 'ms';
import userService from "../src/auth/service/userService";
import { setCookies, removeCookies } from "./cookies";

function redirect( to, from, req, res ){
    
    setCookies( "redirectAuth", from, {
        req, 
        res,
        maxAge: ms(process.env.NEXT_PRIVATE_JWT_REDIRECT_AUTH_EXPIRES_IN)/1000,
        httpOnly: true,
        path: '/'
    });

    return {
        redirect: {
            destination: to,
            permanent: false,
        }
    }
}

export default function catchAuthServer(handler) {

    return async (context) => {

        const { req, res, resolvedUrl } = context;

        try {

            removeCookies( "redirectAuth", {req, res, path: '/'});
    
            const refreshToken = req.cookies['refreshToken'];

            const userData = await userService.checkAuth( refreshToken );
            
            if (!userData?.isActivated) {
                return redirect('/authorization/activatelink', resolvedUrl, req, res);
            }

            return handler(context);

        } catch (error) {
            return redirect('/authorization/login', resolvedUrl, req, res)
        }

    }

}