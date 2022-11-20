import ms from 'ms';
import checkCors from '../../../../middleware/cors';
import { catchErrorsApi } from '../../../../middleware/exceptions';
import userService from '../../../../src/service/userService';
import { setCookies } from '../../../../middleware/cookies';

export default catchErrorsApi( async (req, res) => {

    await checkCors(req,res,{
        methods: ['POST']
      });
    
    await userService.changeUserPassword( req.body );

    return res.json({result: 'Пароль успешно изменён'});

})