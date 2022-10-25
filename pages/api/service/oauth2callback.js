import ms from 'ms';
import userService from "../../../src/service/userService";
import { catchErrorsApi } from '../../../middleware/exceptions';
import { setCookies, getCookie } from '../../../middleware/cookies';
import checkCors from '../../../middleware/cors';
import OAUTH2Client from '../../../src/google/googleConnect'

export default catchErrorsApi( async (req, res) => {

    await checkCors(req,res,{
        methods: ['POST']
      })

    const tokenInfo = await OAUTH2Client.setCredentials(req.query.code);

    // console.log(tokenInfo);

    const redirectAuth = getCookie("redirectAuth", {
      req,
      res
    });

    return res.redirect(`${process.env.NEXT_PUBLIC_CLIENT_URL}${redirectAuth ? redirectAuth : '/'}`);

})