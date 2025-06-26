// tests/integration/LoginUserUseCase.test.ts
import { LoginUserUseCase } from '../../src/application/use-cases/LoginUserUseCase';
import { testContainer } from '../helpers/testContainer';

describe('LoginUserUseCase Integration', () => {
  let useCase: LoginUserUseCase;

  beforeEach(() => {
    useCase = testContainer.get<LoginUserUseCase>('LoginUserUseCase');
  });

  it('should login user with valid credentials', async () => {
    // Arrange: Crear usuario en BD de test
    await createTestUser({
      email: 'test@example.com',
      password: 'password123',
      age: 25,
      isVerified: true
    });

    // Act
    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
      ipAddress: '127.0.0.1'
    });

    // Assert
    expect(result.accessToken).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.role).toBe('user');
  });

  it('should fail with invalid credentials', async () => {
    await expect(useCase.execute({
      email: 'test@example.com',
      password: 'wrongpassword',
      ipAddress: '127.0.0.1'
    })).rejects.toThrow('Invalid credentials');
  });
});