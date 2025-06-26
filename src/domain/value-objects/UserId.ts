export class UserId {
  constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
    
    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(_value)) {
      throw new Error('UserId must be a valid UUID');
    }
  }

  public static generate(): UserId {
    return new UserId(crypto.randomUUID());
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: UserId): boolean {
    return this._value === other._value;
  }
}