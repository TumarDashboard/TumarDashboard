import ms from 'ms';
import userService from "../../../../src/auth/service/userService";
import { catchErrorsApi } from '../../../../middleware/exceptions';
import checkCors from "../../../../middleware/cors";
import { setCookies, getCookie } from '../../../../middleware/cookies';

export default catchErrorsApi(async (req, res) => {

  checkCors(req, res, {
    methods: ['GET']
  });

  const { link } = req.query;

  const userData = await userService.activate(link);

  setCookies("refreshToken", userData.refreshToken, {
    req,
    res,
    maxAge: ms(process.env.NEXT_PRIVATE_JWT_REFRESH_EXPIRES_IN) / 1000,
    httpOnly: true,
    path: '/'
  });

  const redirectAuth = getCookie("redirectAuth", {
    req,
    res
  });

  return res.redirect(`${process.env.NEXT_PUBLIC_CLIENT_URL}${redirectAuth ? redirectAuth : '/dashboard/profile'}`);

})