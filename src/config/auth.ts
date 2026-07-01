export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || "fallback_root_harvest_super_secret_key_2026",
    accessExpiration: "15m", // 15 minutes
    refreshExpiration: "7d", // 7 days
    issuer: "root-and-harvest",
    audience: "root-and-harvest-client"
  },
  otp: {
    length: 6,
    expiryMinutes: 10,
    maxAttempts: 3
  },
  cookies: {
    accessToken: "rh_access_token",
    refreshToken: "rh_refresh_token"
  }
};
