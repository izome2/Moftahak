import 'next-auth';
import { DefaultSession } from 'next-auth';

export type AppRole = 'USER' | 'ADMIN' | 'GENERAL_MANAGER' | 'OPS_MANAGER' | 'BOOKING_MANAGER' | 'INVESTOR';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      firstName: string;
      lastName: string;
      image?: string | null;
      phone?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: AppRole;
    firstName: string;
    lastName: string;
    image?: string | null;
    phone?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: AppRole;
    firstName: string;
    lastName: string;
    image?: string | null;
    phone?: string;
  }
}
