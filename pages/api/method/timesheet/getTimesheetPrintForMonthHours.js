import checkCors from '../../../../middleware/cors';
import { catchErrorsApi } from '../../../../middleware/exceptions';
import service from '../../../../src/service/timesheetService';

export default catchErrorsApi( async (req, res) => {

    await checkCors(req,res,{
        methods: ['POST']
      });
      
    const {document, googleDriveFileID} = await service.getTimesheetPrintForMonthHours( req.body );
    
    res.writeHead(200, {
        'Content-Type': 'vnd.ms-excel',
        'googleDriveFileID': googleDriveFileID,
    });

    await document.write(res);
        
    return res.end();

})
