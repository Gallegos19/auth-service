export interface RefreshTokenCommand {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly sessionRepository: IUserSessionRepository,
    private readonly tokenService: TokenServicePort
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResponse> {
    // Validar refresh token
    const payload = await this.tokenService.validateRefreshToken(command.refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    // Buscar sesión
    const session = await this.sessionRepository.findByRefreshToken(
      new Token(command.refreshToken)
    );

    if (!session || !session.isValid()) {
      throw new Error('Session not found or expired');
    }

    // Generar nuevos tokens
    const newAccessToken = await this.tokenService.generateAccessToken(payload);
    const newRefreshToken = await this.tokenService.generateRefreshToken(payload);

    // Actualizar sesión con nuevos tokens
    const updatedSession = session.updateTokens(
      new Token(newAccessToken),
      new Token(newRefreshToken)
    );

    await this.sessionRepository.save(updatedSession);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600
    };
  }
}