import { User as PrismaUser, Role } from '@/generated/prisma';

export type User = PrismaUser;
export { Role };

export type UserWithoutPassword = Omit<User, 'password'>;
