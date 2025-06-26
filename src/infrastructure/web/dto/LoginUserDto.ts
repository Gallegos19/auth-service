import { z } from 'zod';

const LoginUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export class LoginUserDto {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}

  public static fromRequest(body: any): LoginUserDto {
    const validated = LoginUserSchema.parse(body);
    
    return new LoginUserDto(
      validated.email,
      validated.password
    );
  }
}