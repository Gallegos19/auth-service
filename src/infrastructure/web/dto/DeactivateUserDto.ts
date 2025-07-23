import { z } from 'zod';

const DeactivateUserSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').optional(),
  permanent: z.boolean().default(false)
});

export class DeactivateUserDto {
  constructor(
    public readonly reason?: string,
    public readonly permanent: boolean = false
  ) {}

  public static fromRequest(body: any): DeactivateUserDto {
    const validated = DeactivateUserSchema.parse(body);
    
    return new DeactivateUserDto(
      validated.reason,
      validated.permanent
    );
  }
}