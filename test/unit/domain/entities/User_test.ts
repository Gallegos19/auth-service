import { User } from '../../../src/domain/entities/User';
import { Email } from '../../../src/domain/value-objects/Email';
import { Password } from '../../../src/domain/value-objects/Password';
import { Age } from '../../../src/domain/value-objects/Age';

describe('User Entity', () => {
  const validEmail = new Email('test@example.com');
  const validPassword = Password.createFromHash('hashedPassword123');

  describe('User Creation', () => {
    it('should create adult user successfully', () => {
      const age = new Age(25);
      const { user, event } = User.create(validEmail, validPassword, age, 'John', 'Doe');

      expect(user.getEmail().value).toBe('test@example.com');
      expect(user.getRole()).toBe('user');
      expect(user.needsParentalConsent()).toBe(false);
      expect(user.canLogin()).toBe(false); // Not verified initially
      expect(event.userId).toBe(user.getId().value);
      expect(event.needsParentalConsent).toBe(false);
    });

    it('should create minor user requiring parental consent', () => {
      const age = new Age(12);
      const { user, event } = User.create(validEmail, validPassword, age);

      expect(user.getRole()).toBe('user_minor');
      expect(user.needsParentalConsent()).toBe(true);
      expect(event.needsParentalConsent).toBe(true);
    });

    it('should create teen user not requiring parental consent', () => {
      const age = new Age(15);
      const { user, event } = User.create(validEmail, validPassword, age);

      expect(user.getRole()).toBe('user_minor');
      expect(user.needsParentalConsent()).toBe(false);
      expect(event.needsParentalConsent).toBe(false);
    });

    it('should allow login after verification', () => {
      const age = new Age(20);
      const { user } = User.create(validEmail, validPassword, age);

      expect(user.canLogin()).toBe(false);

      user.verifyEmail();
      expect(user.canLogin()).toBe(true);
      expect(user.getIsVerified()).toBe(true);
      expect(user.getAccountStatus()).toBe('active');
    });
  });

  describe('User State Management', () => {
    it('should suspend user account', () => {
      const age = new Age(25);
      const { user } = User.create(validEmail, validPassword, age);
      
      user.verifyEmail();
      expect(user.canLogin()).toBe(true);

      user.suspend();
      expect(user.canLogin()).toBe(false);
      expect(user.getAccountStatus()).toBe('suspended');
    });

    it('should not activate unverified user', () => {
      const age = new Age(25);
      const { user } = User.create(validEmail, validPassword, age);

      expect(() => user.activate()).toThrow('User must be verified before activation');
    });
  });
});
