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
      phone?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'USER' | 'ADMIN';
    firstName: string;
    lastName: string;
    image?: string | null;
    phone?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'USER' | 'ADMIN';
    firstName: string;
    lastName: string;
    image?: string | null;
    phone?: string;
  }
}
