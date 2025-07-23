import { z } from 'zod';

const CreateAdministratorSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
  age: z.number().int().min(18, 'Administrators must be at least 18 years old'),
  firstName: z.string().optional(),
  lastName: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export class CreateAdministratorDto {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly confirmPassword: string,
    public readonly age: number,
    public readonly firstName?: string,
    public readonly lastName?: string
  ) {}

  public static fromRequest(body: any): CreateAdministratorDto {
    const validated = CreateAdministratorSchema.parse(body);
    
    return new CreateAdministratorDto(
      validated.email,
      validated.password,
      validated.confirmPassword,
      validated.age,
      validated.firstName,
      validated.lastName
    );
  }
}