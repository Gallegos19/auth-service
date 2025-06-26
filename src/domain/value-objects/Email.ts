export class Email {
  constructor(private readonly _value: string) {
    if (!this.isValidEmail(_value)) {
      throw new Error('Invalid email format');
    }
  }

  public get value(): string {
    return this._value;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public equals(other: Email): boolean {
    return this._value === other._value;
  }
}

