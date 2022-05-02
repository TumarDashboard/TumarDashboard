import ms from 'ms';
import userService from "../../../src/auth/service/userService";
import { catchErrorsApi } from '../../../middleware/exceptions';
import { setCookies } from '../../../middleware/cookies';
import checkCors from '../../../middleware/cors';

export default catchErrorsApi( async (req, res) => {

    checkCors(req,res,{
        methods: ['POST']
      })

    const { email, password } = req.body;

    const userData = await userService.login( email, password );

    setCookies( "refreshToken", userData.refreshToken, {
        req, 
        res,
        maxAge: ms(process.env.NEXT_PRIVATE_JWT_REFRESH_EXPIRES_IN)/1000,
        httpOnly: true,
        path: '/'
    });

    return res.json(userData);

})