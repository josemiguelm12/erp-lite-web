import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';

import { AuthApiService } from './auth-api.service';
import { AuthSessionService } from './auth-session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthRefreshService {
  private readonly authApi = inject(AuthApiService);
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  private refreshInFlight$?: Observable<string>;

  refreshAccessToken(): Observable<string> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this.authSession.refreshToken();

    if (!refreshToken) {
      this.handleRefreshFailure();

      return throwError(() => new Error('No refresh token available.'));
    }

    this.refreshInFlight$ = this.authApi.refreshToken({ refreshToken }).pipe(
      tap((response) => this.authSession.setSession(response)),
      map((response) => response.accessToken),
      shareReplay(1),
      catchError((error) => {
        this.handleRefreshFailure();
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshInFlight$ = undefined;
      })
    );

    return this.refreshInFlight$;
  }

  private handleRefreshFailure(): void {
    this.authSession.clearSession();
    void this.router.navigateByUrl('/login');
  }
}
