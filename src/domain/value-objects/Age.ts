export class Age {
  constructor(private readonly _value: number) {
    if (_value < 0 || _value > 120) {
      throw new Error('Invalid age');
    }
  }

  public get value(): number {
    return this._value;
  }

  public isMinor(): boolean {
    return this._value < 18;
  }

  public requiresParentalConsent(): boolean {
    return this._value < 13;
  }

  public canRegisterAlone(): boolean {
    return this._value >= 13;
  }
}
