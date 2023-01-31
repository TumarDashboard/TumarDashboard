import { middlewareApi } from './middleware/middlewareApi';
import { middlewareDashboard } from './middleware/middlewareDashboard';

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/api/method/:path*',
    '/dashboard/:path*',
  ],
}

// This function can be marked `async` if using `await` inside
export async function middleware(request) {

  if (request.nextUrl.pathname.startsWith('/dashboard')) {

    return await middlewareDashboard(request);

  }
  if (request.nextUrl.pathname.startsWith('/api')) {

    return await middlewareApi(request);

  }
}
