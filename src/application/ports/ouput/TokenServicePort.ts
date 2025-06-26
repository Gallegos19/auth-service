export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenServicePort {
  generateAccessToken(payload: TokenPayload): Promise<string>;
  generateRefreshToken(payload: TokenPayload): Promise<string>;
  validateToken(token: string): Promise<TokenPayload | null>;
  validateRefreshToken(token: string): Promise<TokenPayload | null>;
  revokeToken(token: string): Promise<void>;
}