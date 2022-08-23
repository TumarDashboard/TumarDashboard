import ms from 'ms';
import userService from "../../../src/service/userService";
import { catchErrorsApi } from '../../../middleware/exceptions';
import { getCookie, setCookies } from '../../../middleware/cookies';

export default catchErrorsApi( async (req, res) => {
    try {
        
        const refreshToken = getCookie("refreshToken", {
            req, 
            res
        });
    
        const {store}=req.query;
        
        const userData = await userService.refresh( refreshToken, store );


        setCookies( "refreshToken", userData.refreshToken, {
            req, 
            res,
            maxAge: ms(process.env.NEXT_PUBLIC_JWT_REFRESH_EXPIRES_IN)/1000,
            httpOnly: true,
            path: '/'
        });
    
        console.log('update tokens');
    
        return res.json(userData);

    } catch (error) {
        console.log(error);
        throw error;
    }

})