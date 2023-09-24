import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getApiMethodAccess } from '../components/levelA/AccessRules';
import { MiddlewareError } from './exceptions';

// This function can be marked `async` if using `await` inside
export async function middlewareApi(request) {

  const authorizationToken = request.headers.get('Authorization');

  if (authorizationToken) {
    const responce = NextResponse.next();

    const accesToken = authorizationToken.split(' ')[1];

    var verified = await jwtVerify(
      accesToken,
      new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_ACCESS_SECRET)
    ).catch(error => { return null })

    if (!verified) {
      
      const refreshToken = request.cookies.get('refreshToken')?.value;

      if (refreshToken) {

        verified = await jwtVerify(
          refreshToken,
          new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_REFRESH_SECRET)
        ).catch(error => { return MiddlewareError.UnauthorizedError() })

        responce.headers.set('checkrefreshtoken', 'true');
      }

    }
    
    const userData = verified?.payload;

    if (userData) {

      responce.headers.set('userDataID', userData.id);
      responce.headers.set('userDataPositions', userData.positions);

      if (!userData.isActivated) {

        return MiddlewareError.UnauthorizedError();

      }

      const apiMethodAccessBlock = await getApiMethodAccess(request, userData);

      if (apiMethodAccessBlock.error) {

        return MiddlewareError.BadRequest(apiMethodAccessBlock.error);

      }

      if (apiMethodAccessBlock.apiBlock) {
        responce.headers.set('apiblock', apiMethodAccessBlock.apiBlock);
      }

      if (apiMethodAccessBlock.userCompare) {
        responce.headers.set('userCompare', apiMethodAccessBlock.userCompare);
      }

      return responce;

    }

  }

  return MiddlewareError.UnauthorizedError();

}
