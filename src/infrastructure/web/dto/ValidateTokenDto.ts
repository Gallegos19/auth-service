import { z } from 'zod';

const ValidateTokenSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

export class ValidateTokenDto {
  constructor(public readonly token: string) {}

  public static fromRequest(body: any): ValidateTokenDto {
    const validated = ValidateTokenSchema.parse(body);
    return new ValidateTokenDto(validated.token);
  }
}