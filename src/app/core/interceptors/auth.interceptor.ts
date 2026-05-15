import {
  HttpContextToken,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthRefreshService } from '../auth/auth-refresh.service';
import { AuthSessionService } from '../auth/auth-session.service';

const RETRY_ONCE = new HttpContextToken<boolean>(() => false);
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authSession = inject(AuthSessionService);
  const authRefreshService = inject(AuthRefreshService);
  const isPublicRequest = isPublicAuthRequest(req);
  const token = authSession.accessToken();
  const request = !isPublicRequest && token ? addBearerToken(req, token) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;
      const shouldRefresh =
        isUnauthorized &&
        !isPublicRequest &&
        !request.context.get(RETRY_ONCE) &&
        !!authSession.refreshToken();

      if (!shouldRefresh) {
        return throwError(() => error);
      }

      return authRefreshService.refreshAccessToken().pipe(
        switchMap((newToken) =>
          next(
            addBearerToken(req, newToken).clone({
              context: req.context.set(RETRY_ONCE, true)
            })
          )
        ),
        catchError((refreshError) => throwError(() => refreshError))
      );
    })
  );
};

function isPublicAuthRequest(req: HttpRequest<unknown>): boolean {
  return PUBLIC_AUTH_PATHS.some((path) => req.url.includes(path));
}

function addBearerToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}
