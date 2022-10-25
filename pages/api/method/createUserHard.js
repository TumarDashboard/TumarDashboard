// import ms from 'ms';
import checkCors from '../../../middleware/cors';
import { catchErrorsApi } from '../../../middleware/exceptions';
import service from '../../../src/service/userService';
// import { setCookies } from '../../../middleware/cookies';

export default catchErrorsApi( async (req, res) => {

    await checkCors(req,res,{
        methods: ['POST']
      });

    const data = await service.createUserHard( req.body );

    return res.json(data);

})