import ms from 'ms';
import { FApiMethodAccessRules, getApiMethodAccesRules } from '../components/levelA/AccessRules';
import userService from "../src/service/userService";
import { intersectArrays } from '../src/utils/arrayUtils';
import { setCookies, removeCookies } from "./cookies";

function redirect( to, from, req, res ){
    
    setCookies( "redirectAuth", from, {
        req, 
        res,
        maxAge: ms(process.env.NEXT_PUBLIC_JWT_REDIRECT_AUTH_EXPIRES_IN)/1000,
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
            
            const {dtoUser, iat, exp} = await userService.checkAuth( refreshToken, 'update' );
            
            if (!dtoUser?.isActivated) {
                return redirect('/authorization/activatelink', resolvedUrl, req, res);
            }

            context.userData = JSON.parse(JSON.stringify(dtoUser));

            context.accessRules = getApiMethodAccesRules( context.userData.positions );
            // context.accessRules = FApiMethodAccessRules.reduce( ( result, value ) => {
            //     if( value.accessForUserSelf ){
            //             result.push(value.url.toString().replace('/\\/api\\/method\\/', '') + 'self');
            //         }
            //     if(intersectArrays( value.access, context.userData.positions )){
            //         result.push( value.url.toString().replace('/\\/api\\/method\\/', '').replace('/', '') );
            //     }
            //     return result;
            // }, []);

            return handler(context);

        } catch (error) {
            console.log(error);
            console.log('catchAuthServer redirect to /authorization/login');
            return redirect('/authorization/login', resolvedUrl, req, res)
        }

    }

}