// import ms from 'ms';
import checkCors from '../../../../middleware/cors';
import { catchErrorsApi } from '../../../../middleware/exceptions';
import service from '../../../../src/service/modalService';
// import { setCookies } from '../../../middleware/cookies';

export default catchErrorsApi( async (req, res) => {

    await checkCors(req,res,{
        methods: ['POST']
      });

    const data = await service.getProtectedObjectEditForm( req.body );

    return res.json(data);

})