import Cors from 'cors'
import userService from '../src/service/userService';

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
// https://www.npmjs.com/package/cors
export default async function checkCors(req, res, options) {
    // console.log('-------start checkCors------');

    const headers = res.getHeaders();

    if( headers['checkrefreshtoken'] ){

        const refreshToken = req.cookies['refreshToken'];

        const {dtoUser, iat, exp} = await userService.checkAuth( refreshToken, 'update' );
        
        if (!dtoUser?.isActivated) {
            return redirect('/authorization/activatelink', resolvedUrl, req, res);
        }
        
    }
    
    if( req.body ){

        headers['apiblock'] && ( req.body.apiBlock = headers['apiblock'] );

        headers['usercompare'] && ( req.body.userCompare = headers['usercompare'] );

        headers['userdataid'] && ( req.body.userDataID = headers['userdataid'] );

        headers['userdatapositions'] && ( req.body.userDataPositions = headers['userdatapositions'] );

    }

    // console.log('-------end checkCors------');

    // Initializing the cors middleware
    const middleware = Cors(options)

    return new Promise((resolve, reject) => {

        middleware(req, res, (result) => {

            if (result instanceof Error) {

                return reject(result)

            }

            return resolve(result)

        })

    })

}