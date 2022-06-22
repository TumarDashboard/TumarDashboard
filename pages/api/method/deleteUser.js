import checkCors from '../../../middleware/cors';
import { catchErrorsApi } from '../../../middleware/exceptions';
import userService from '../../../src/service/userService';

export default catchErrorsApi( async (req, res) => {

    checkCors(req,res,{
        methods: ['POST']
      });

    const token = await userService.deleteUser( req.body );

    return res.json(token);

})