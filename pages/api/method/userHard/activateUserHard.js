// import ms from 'ms';
import checkCors from '../../../../middleware/cors';
import { catchErrorsApi } from '../../../../middleware/exceptions';
import service from '../../../../src/service/userService';
// import loadGuardsDataFromExcel from '../../../temp/loadGuardsDataFromExcel';
// import { setCookies } from '../../../middleware/cookies';

export default catchErrorsApi( async (req, res) => {

    await checkCors(req,res,{
        methods: ['POST']
      });

    await service.activateUserHard( req.body );

    return res.json({result: 'Пользователь успешно активирован'});

})