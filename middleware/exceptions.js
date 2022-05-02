export class ApiError extends Error {
    statusCode;
    errors;

    constructor(status, message, errors = []) {

        super(message);

        this.statusCode = status;
        this.errors = errors;

    }

    responceClient(){

        const blob = new Blob(
            [ JSON.stringify({ message: this.message, errors: this.errors } ) ], 
            { type:'application/json' }
            );

        return new Response( blob, { status: this.statusCode } );

    }

    responceServer(){

        return new Response( this.message, { status: this.statusCode } );

    }

    static UnauthorizedError() {
        return new ApiError(401, "Пользователь не авторизован");
    }

    static BadRequest(message, errors = []) {
        return new ApiError( 500, message, errors );
    }

}

export function catchErrorsApi(handler) {
    return async (req, res) => {
        return handler(req, res)
            .catch((error) => {

                if( error instanceof ApiError ){

                    return res.status( error.statusCode ).send( { message: error.message, errors: error.errors });

                }

                return res.status(500).send({ message: `Непредвиденная ошибка: ${error.message || error}`, errors: [] });

            });
    }
}

export function catchErrorsMiddleware(handler) {
    return async (req, ev) => {
        return handler(req, ev)
            .catch((error) => {
                
                if( error instanceof ApiError ){

                    return error.responceClient();

                }else{

                    const blob = new Blob(
                        [JSON.stringify( { message: `Непредвиденная ошибка: ${error.message || error}`, errors: [] } )], 
                        { type:'application/json' }
                        );

                    return new Response( blob, { status: 500 } );

                }

            });
    }
}