import ms from 'ms';
import checkCors from '../../../middleware/cors';
import { catchErrorsApi } from '../../../middleware/exceptions';
import userService from '../../../src/service/userService';
import { setCookies } from '../../../middleware/cookies';

export default catchErrorsApi( async (req, res) => {

    await checkCors(req,res,{
        methods: ['POST']
      });
    
    const userData = await userService.changeUser( req.body );

    setCookies( "refreshToken", userData.refreshToken, {
        req, 
        res,
        maxAge: ms(process.env.NEXT_PUBLIC_JWT_REFRESH_EXPIRES_IN)/1000,
        httpOnly: true,
        path: '/'
    });

    return res.json(userData);

})