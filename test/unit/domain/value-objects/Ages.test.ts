import { Age } from '../../../src/domain/value-objects/Age';

describe('Age Value Object', () => {
  it('should create valid age', () => {
    const age = new Age(25);
    expect(age.value).toBe(25);
  });

  it('should reject negative age', () => {
    expect(() => new Age(-1)).toThrow('Invalid age');
  });

  it('should reject age over 120', () => {
    expect(() => new Age(121)).toThrow('Invalid age');
  });

  it('should correctly identify minors', () => {
    expect(new Age(17).isMinor()).toBe(true);
    expect(new Age(18).isMinor()).toBe(false);
  });

  it('should correctly identify parental consent requirement', () => {
    expect(new Age(12).requiresParentalConsent()).toBe(true);
    expect(new Age(13).requiresParentalConsent()).toBe(false);
  });

  it('should correctly identify registration eligibility', () => {
    expect(new Age(12).canRegisterAlone()).toBe(false);
    expect(new Age(13).canRegisterAlone()).toBe(true);
  });
});