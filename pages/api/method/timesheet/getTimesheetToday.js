// import ms from 'ms';
import checkCors from '../../../../middleware/cors';
import { catchErrorsApi } from '../../../../middleware/exceptions';
import service from '../../../../src/service/timesheetService';
// import { setCookies } from '../../../middleware/cookies';

export default catchErrorsApi( async (req, res) => {

    await checkCors(req,res,{
        methods: ['POST']
      });
      
    const responceAggregateUpdateData = await service.getTimesheetToday( );
    
    return res.json({timesheetToday: responceAggregateUpdateData });

})