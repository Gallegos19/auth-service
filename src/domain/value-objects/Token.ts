export class Token {
  constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('Token cannot be empty');
    }
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Token): boolean {
    return this._value === other._value;
  }
}