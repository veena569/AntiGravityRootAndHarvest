export type Role = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN" | "WAREHOUSE" | "SUPPORT" | "DELIVERY";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface OtpRequest {
  phone?: string;
  email?: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  referenceId?: string; // Optional reference ID for verification tying
}
