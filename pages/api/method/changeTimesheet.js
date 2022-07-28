// import ms from 'ms';
import checkCors from '../../../middleware/cors';
import { catchErrorsApi } from '../../../middleware/exceptions';
import service from '../../../src/service/timesheetService';
// import { setCookies } from '../../../middleware/cookies';

export default catchErrorsApi( async (req, res) => {

    checkCors(req,res,{
        methods: ['POST']
      });
      
    const data = await service.changeTimesheet( req.body );
    console.log(data);
    return res.json(data);

})