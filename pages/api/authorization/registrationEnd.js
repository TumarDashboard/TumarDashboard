import ms from 'ms';
import userService from "../../../src/service/userService";
import { catchErrorsApi } from '../../../middleware/exceptions';
import { setCookies } from '../../../middleware/cookies';
import checkCors from '../../../middleware/cors';

export default catchErrorsApi( async (req, res) => {

    await checkCors(req,res,{
        methods: ['POST']
      })

    const { activatelink, password } = req.body;

    const userData = await userService.registrationEnd( activatelink, password );

    setCookies( "refreshToken", userData.refreshToken, {
        req, 
        res,
        maxAge: ms(process.env.NEXT_PUBLIC_JWT_REFRESH_EXPIRES_IN)/1000,
        httpOnly: true,
        path: '/'
    });

    return res.json(userData);

})