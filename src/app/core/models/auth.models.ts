export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterTenantRequest {
  name: string;
  slug?: string | null;
  ownerFullName: string;
  ownerEmail: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  userId: string;
  tenantId: string;
  tenantName: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}
