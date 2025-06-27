import { Token } from '../../domain/value-objects/Token';

export interface TokenBlacklistService {
  addToBlacklist(token: Token, expiresAt: Date): Promise<void>;
  isBlacklisted(token: Token): Promise<boolean>;
  cleanup(): Promise<number>;
}

export class RedisTokenBlacklistService implements TokenBlacklistService {
  constructor(
    private readonly redisClient: any // Redis client
  ) {}

  async addToBlacklist(token: Token, expiresAt: Date): Promise<void> {
    const ttl = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    if (ttl > 0) {
      await this.redisClient.setex(`blacklist:${token.value}`, ttl, '1');
    }
  }

  async isBlacklisted(token: Token): Promise<boolean> {
    const result = await this.redisClient.get(`blacklist:${token.value}`);
    return result === '1';
  }

  async cleanup(): Promise<number> {
    // Redis TTL handles cleanup automatically
    return 0;
  }
}

export class InMemoryTokenBlacklistService implements TokenBlacklistService {
  private blacklist = new Map<string, Date>();

  async addToBlacklist(token: Token, expiresAt: Date): Promise<void> {
    this.blacklist.set(token.value, expiresAt);
  }

  async isBlacklisted(token: Token): Promise<boolean> {
    const expiresAt = this.blacklist.get(token.value);
    if (!expiresAt) return false;
    
    if (new Date() > expiresAt) {
      this.blacklist.delete(token.value);
      return false;
    }
    
    return true;
  }

  async cleanup(): Promise<number> {
    const now = new Date();
    let cleaned = 0;
    
    for (const [token, expiresAt] of this.blacklist.entries()) {
      if (now > expiresAt) {
        this.blacklist.delete(token);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}