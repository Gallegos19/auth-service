import { z } from 'zod';

const RegisterUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  age: z.number().int().min(8).max(120),
  firstName: z.string().optional(),
  lastName: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export class RegisterUserDto {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly confirmPassword: string,
    public readonly age: number,
    public readonly firstName?: string,
    public readonly lastName?: string
  ) {}

  public static fromRequest(body: any): RegisterUserDto {
    const validated = RegisterUserSchema.parse(body);
    
    return new RegisterUserDto(
      validated.email,
      validated.password,
      validated.confirmPassword,
      validated.age,
      validated.firstName,
      validated.lastName
    );
  }
}