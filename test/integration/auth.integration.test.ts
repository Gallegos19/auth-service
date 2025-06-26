import request from 'supertest';
import { app } from '../../src/main';
import { PrismaClient } from '@prisma/client';
import { container } from '../../src/infrastructure/config/container';
import { it } from 'node:test';

describe('Auth Integration Tests', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = container.get<PrismaClient>('PrismaClient');
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Limpiar base de datos de test
    await prisma.userSession.deleteMany();
    await prisma.parentalConsent.deleteMany();
    await prisma.passwordReset.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    it('should register adult user successfully', async () => {
      const userData = {
        email: 'adult@test.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        age: 25,
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.requiresParentalConsent).toBe(false);
    });

    it('should register minor user requiring parental consent', async () => {
      const userData = {
        email: 'minor@test.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        age: 12,
        firstName: 'Jane',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.requiresParentalConsent).toBe(true);
    });

    it('should fail with weak password', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'weak',
        confirmPassword: 'weak',
        age: 20
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        age: 25
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    let registeredUser: any;

    beforeEach(async () => {
      // Register and verify a user for login tests
      const userData = {
        email: 'login@test.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        age: 25
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      registeredUser = registerResponse.body.data;

      // Manually verify the user for testing
      await prisma.user.update({
        where: { id: registeredUser.userId },
        data: { 
          is_verified: true,
          account_status: 'active'
        }
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it('should fail with invalid credentials', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should fail with non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/validate-token', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create verified user and get token
      const userData = {
        email: 'validate@test.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        age: 25
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      await prisma.user.update({
        where: { id: registerResponse.body.data.userId },
        data: { 
          is_verified: true,
          account_status: 'active'
        }
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should validate valid token', async () => {
      const response = await request(app)
        .post('/api/auth/validate-token')
        .send({ token: accessToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.isValid).toBe(true);
      expect(response.body.user.email).toBe('validate@test.com');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/validate-token')
        .send({ token: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.isValid).toBe(false);
    });

    it('should reject empty token', async () => {
      const response = await request(app)
        .post('/api/auth/validate-token')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Setup authenticated user
      const userData = {
        email: 'logout@test.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        age: 25
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      await prisma.user.update({
        where: { id: registerResponse.body.data.userId },
        data: { 
          is_verified: true,
          account_status: 'active'
        }
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify token is now invalid
      const validateResponse = await request(app)
        .post('/api/auth/validate-token')
        .send({ token: accessToken })
        .expect(401);

      expect(validateResponse.body.isValid).toBe(false);
    });
  });
});