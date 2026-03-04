import 'next-auth';
import { DefaultSession } from 'next-auth';
import type { AppRole } from './next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      firstName: string;
      lastName: string;
      image?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: AppRole;
    firstName: string;
    lastName: string;
    image?: string | null;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: AppRole;
    firstName?: string;
    lastName?: string;
    image?: string | null;
  }
}
