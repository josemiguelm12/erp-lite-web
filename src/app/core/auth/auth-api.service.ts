import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterTenantRequest
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiBaseUrl}/auth`;

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, request);
  }

  registerTenant(request: RegisterTenantRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, request);
  }

  refreshToken(request: RefreshTokenRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/refresh`, request);
  }
}
