import { User as PrismaUser, Role } from '@prisma/client';

export type User = PrismaUser;
export { Role };

export type UserWithoutPassword = Omit<User, 'password'>;
