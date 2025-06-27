import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/enviroment';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email_verified: boolean;
}

export class GoogleOAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      config.oauth.google.clientId,
      config.oauth.google.clientSecret,
      config.oauth.google.redirectUri
    );
  }

  async verifyIdToken(idToken: string): Promise<GoogleUserInfo | null> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: config.oauth.google.clientId
      });

      const payload = ticket.getPayload();
      if (!payload) return null;

      return {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        given_name: payload.given_name!,
        family_name: payload.family_name!,
        picture: payload.picture!,
        email_verified: payload.email_verified!
      };
    } catch (error) {
      console.error('Google OAuth verification failed:', error);
      return null;
    }
  }

  getAuthUrl(state?: string): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      state
    });
  }

  async exchangeCodeForTokens(code: string): Promise<any> {
    try {
      const { tokens } = await this.client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange authorization code');
    }
  }
}