import { computed, Injectable, signal } from '@angular/core';

import { AuthResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {
  private readonly sessionState = signal<AuthResponse | null>(null);

  readonly authResponse = computed(() => this.sessionState());
  readonly currentUser = computed(() => {
    const session = this.sessionState();

    if (!session) {
      return null;
    }

    return {
      userId: session.userId,
      tenantId: session.tenantId,
      tenantName: session.tenantName,
      fullName: session.fullName,
      email: session.email,
      roles: session.roles,
      permissions: session.permissions
    };
  });
  readonly isAuthenticated = computed(() => !!this.sessionState()?.accessToken);
  readonly accessToken = computed(() => this.sessionState()?.accessToken ?? null);
  readonly refreshToken = computed(() => this.sessionState()?.refreshToken ?? null);
  readonly tenantName = computed(() => this.sessionState()?.tenantName ?? null);
  readonly permissions = computed(() => this.sessionState()?.permissions ?? []);

  setSession(response: AuthResponse): void {
    this.sessionState.set(response);
  }

  clearSession(): void {
    this.sessionState.set(null);
  }
}
