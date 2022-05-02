import Cors from 'cors'

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
// https://www.npmjs.com/package/cors
export default function checkCors(req, res, options) {

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