import { z } from 'zod';

const UpdateUserRoleSchema = z.object({
  newRole: z.enum(['user', 'user_minor', 'moderator', 'administrator'], {
    errorMap: () => ({ message: 'Role must be one of: user, user_minor, moderator, administrator' })
  })
});

export class UpdateUserRoleDto {
  constructor(
    public readonly newRole: 'user' | 'user_minor' | 'moderator' | 'administrator'
  ) {}

  public static fromRequest(body: any): UpdateUserRoleDto {
    const validated = UpdateUserRoleSchema.parse(body);
    
    return new UpdateUserRoleDto(validated.newRole);
  }
}