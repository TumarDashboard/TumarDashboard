// import ms from 'ms';
import checkCors from '../../../../middleware/cors';
import { catchErrorsApi } from '../../../../middleware/exceptions';
import service from '../../../../src/service/timesheetService';
// import { setCookies } from '../../../middleware/cookies';

export default catchErrorsApi( async (req, res) => {

    await checkCors(req,res,{
        methods: ['POST']
      });
      
    const {document, googleDriveFileID} = await service.getTimesheetPrint( req.body );
    
    res.writeHead(200, {
        'Content-Type': 'vnd.ms-excel',
        'googleDriveFileID': googleDriveFileID
    });

    await document.write(res);
        
    return res.end();

})