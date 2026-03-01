import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import { isEmail, isPhone, normalizePhone } from './validations/auth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('البريد الإلكتروني/رقم الهاتف وكلمة المرور مطلوبان');
        }

        const identifier = credentials.identifier as string;
        const password = credentials.password as string;

        // Find user by email or phone
        let user;
        
        if (isEmail(identifier)) {
          // Search by email
          user = await prisma.user.findUnique({
            where: { email: identifier },
          });
        } else if (isPhone(identifier)) {
          // Normalize phone number to match database format
          const normalizedPhoneNumber = normalizePhone(identifier);
          user = await prisma.user.findUnique({
            where: { phone: normalizedPhoneNumber },
          });
        } else {
          throw new Error('البريد الإلكتروني أو رقم الهاتف غير صالح');
        }

        if (!user) {
          throw new Error('البيانات غير صحيحة');
        }

        // Verify password
        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('البيانات غير صحيحة');
        }

        // Return user without password
        return {
          id: user.id,
          email: user.email || undefined,
          phone: user.phone || undefined,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.image = user.image;
        token.phone = user.phone;
        token.email = user.email; // Store email from user
      }

      // Update session
      if (trigger === 'update' && session) {
        token.firstName = session.firstName || token.firstName;
        token.lastName = session.lastName || token.lastName;
        token.image = session.image || token.image;
      }

      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'ADMIN';
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.image = token.image as string | null;
        session.user.phone = token.phone as string | undefined;
        session.user.email = (token.email as string) || session.user.email; // Use email from token with fallback
      }
      return session;
    },
  },

  pages: {
    signIn: '/', // Redirect to home page (modal will open)
    error: '/', // Error page
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  trustHost: true,
});
