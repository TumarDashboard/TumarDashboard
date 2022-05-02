import { ApiError, catchErrorsApi } from '../../../../middleware/exceptions';

export default catchErrorsApi( async (req, res) => {

    throw ApiError.BadRequest('Неккоректная ссылка активации');

})