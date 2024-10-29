// Define the profile interface for Google OAuth
export interface GoogleProfile {
  _json: {
    iss: string;
    azp?: string;
    aud: string;
    sub: string;
    at_hash?: string;
    iat: number;
    exp: number;
    email?: string;
    email_verified?: boolean;
    given_name?: string;
    family_name?: string;
    name?: string;
    hd?: string;
    locale?: string;
    nonce?: string;
    picture?: string;
    profile?: string;
  };
}

// Define the User interface based on your schema
export interface User {
  id?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  password?: string;
  role?: string;
  loginType?: string;
  isEmailVerified?: boolean;
  accountStatus?: string;
}
