import { z } from 'zod';

const GetUsersByRoleSchema = z.object({
  role: z.enum(['user', 'user_minor', 'moderator', 'administrator'], {
    errorMap: () => ({ message: 'Role must be one of: user, user_minor, moderator, administrator' })
  }),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10)
});

export class GetUsersByRoleDto {
  constructor(
    public readonly role: 'user' | 'user_minor' | 'moderator' | 'administrator',
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}

  public static fromQuery(query: any): GetUsersByRoleDto {
    const validated = GetUsersByRoleSchema.parse({
      role: query.role,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10
    });
    
    return new GetUsersByRoleDto(validated.role, validated.page, validated.limit);
  }
}