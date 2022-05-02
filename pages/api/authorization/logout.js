import userService from "../../../src/auth/service/userService";
import { catchErrorsApi } from '../../../middleware/exceptions';
import { getCookie, removeCookies } from '../../../middleware/cookies';
import checkCors from "../../../middleware/cors";

export default catchErrorsApi( async (req, res) => {

    checkCors(req,res,{
        methods: ['POST']
      })

    const refreshToken = getCookie("refreshToken", {
        req, 
        res
    });

    const token = await userService.logout( refreshToken );

    removeCookies( "refreshToken", {req, res, path: '/'});
    
    return res.json(token);

})