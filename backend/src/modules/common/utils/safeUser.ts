import { Prisma, User } from '@prisma/client';

// Campos de usuário que podem sair da API (nunca a senha nem o hash do refresh token)
export const SAFE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  phone: true,
  userType: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Omit<User, 'password' | 'refreshTokenHash'>;

export function toSafeUser(user: User | SafeUser | null): SafeUser | null {
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, refreshTokenHash, ...safe } = user as User;
  return safe;
}
