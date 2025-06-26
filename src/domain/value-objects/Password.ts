export class Password {
  constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }
  }

  public static createFromPlain(plainPassword: string): Password {
    if (!this.isValidPassword(plainPassword)) {
      throw new Error('Password does not meet security requirements');
    }
    
    // Este será hasheado por el PasswordService
    return new Password(plainPassword);
  }

  public static createFromHash(hashedPassword: string): Password {
    return new Password(hashedPassword);
  }

  private static isValidPassword(password: string): boolean {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Password): boolean {
    return this._value === other._value;
  }
}