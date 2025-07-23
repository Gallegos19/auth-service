import { z } from 'zod';

const UpdateModeratorSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
    .optional(),
  confirmPassword: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  accountStatus: z.enum(['active', 'suspended', 'deactivated']).optional(),
  isVerified: z.boolean().optional()
}).refine((data) => {
  if (data.password && !data.confirmPassword) return false;
  if (data.confirmPassword && !data.password) return false;
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) return false;
  return true;
}, {
  message: "If password is provided, confirmPassword must match",
  path: ["confirmPassword"],
});

export class UpdateModeratorDto {
  constructor(
    public readonly email?: string,
    public readonly password?: string,
    public readonly confirmPassword?: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly accountStatus?: 'active' | 'suspended' | 'deactivated',
    public readonly isVerified?: boolean
  ) {}

  public static fromRequest(body: any): UpdateModeratorDto {
    const validated = UpdateModeratorSchema.parse(body);
    
    return new UpdateModeratorDto(
      validated.email,
      validated.password,
      validated.confirmPassword,
      validated.firstName,
      validated.lastName,
      validated.accountStatus,
      validated.isVerified
    );
  }
}