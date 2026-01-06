import { User as PrismaUser } from '@prisma/client';

// User without password
export type SafeUser = Omit<PrismaUser, 'password'>;

// Auth response
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: SafeUser;
  error?: string;
}

// Session user (for NextAuth)
export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  image?: string | null;
}
