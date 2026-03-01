import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'ADMIN';
      firstName: string;
      lastName: string;
      image?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'USER' | 'ADMIN';
    firstName: string;
    lastName: string;
    image?: string | null;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: 'USER' | 'ADMIN';
    firstName?: string;
    lastName?: string;
    image?: string | null;
  }
}
