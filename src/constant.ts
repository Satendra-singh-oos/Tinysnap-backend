export const V1 = "/api/v1";

export const UserLoginType = {
  GOOGLE: "GOOGLE" as const,
  EMAIL_PASSWORD: "EMAIL_PASSWORD" as const,
};
export const UserRolesEnum = {
  ADMIN: "ADMIN" as const,
  USER: "USER" as const,
  INFLUENCER: "INFLUENCER" as const,
};

export const AccountStatusEnum = {
  UNVERIFIED: "UNVERIFIED" as const,
  VERIFIED: "VERIFIED" as const,
  SUSPENDED: "SUSPENDED" as const,
  DEACTIVATED: "DEACTIVATED" as const,
};

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes
