import ms from 'ms';
import userService from "../../../src/auth/service/userService";
import { catchErrorsApi } from '../../../middleware/exceptions';
import { getCookie, setCookies } from '../../../middleware/cookies';

export default catchErrorsApi( async (req, res) => {

    const refreshToken = getCookie("refreshToken", {
        req, 
        res
    });

    const userData = await userService.refresh( refreshToken );

    setCookies( "refreshToken", userData.refreshToken, {
        req, 
        res,
        maxAge: ms(process.env.NEXT_PRIVATE_JWT_REFRESH_EXPIRES_IN)/1000,
        httpOnly: true,
        path: '/'
    });

    return res.json(userData);

})