import userService from "../../../src/auth/service/userService";
import { catchErrorsApi } from '../../../middleware/exceptions';

export default catchErrorsApi( async (req, res) => {
    
    const users = await userService.getAllUsers();
    
    return res.json(users);

})