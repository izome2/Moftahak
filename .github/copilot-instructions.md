# Moftahak - AI Coding Agent Instructions

## Project Overview
Next.js 16 full-stack application for "مفتاحك" (Moftahak) - a luxury Egyptian real estate and hotel apartment services platform. **Bilingual (Arabic primary, English secondary)** with:
- Public landing page with heavy Framer Motion animations
- NextAuth v5 authentication system (JWT strategy)
- PostgreSQL database via Prisma (User, Consultation, FeasibilityStudy models)
- Admin dashboard for managing users, consultations, and feasibility studies
- **Feasibility Study Editor** - drag-and-drop slide-based study builder with room items libraries
- **Public Study Viewer** - Shareable feasibility study links (`/study/[shareId]`)
- **Vercel Blob Storage** - Avatar uploads via `@vercel/blob`

## Architecture & Key Patterns

### App Structure (Next.js App Router)
**Public Routes:**
- Landing page (`app/page.tsx`): Section imports (`HeroSection`, `AboutSection`, `FeaturesSection`, etc.)
- All interactive components require `'use client'` directive

**Protected Routes** (via `middleware.ts`):
- `/admin/*` - Admin dashboard (ADMIN role only)
  - `admin/users` - User management
  - `admin/consultations` - Consultation requests (can accept → create study)
  - `admin/feasibility` - Feasibility study creator/editor
- `/profile` - User profile settings (authenticated users)

**Public Shareable Routes**:
- `/study/[shareId]` - Read-only feasibility study viewer (no auth required)

**API Routes** (`app/api/`):
- `auth/[...nextauth]` - NextAuth handlers
- `admin/*` - Admin operations (role-checked)
- `user/*` - User profile/avatar management (Vercel Blob upload)
- `feasibility/[id]` - CRUD operations for studies (admin-only)
- `feasibility/[shareId]` - Public study fetch by shareId (no auth)
- `feasibility/airbnb-*` - Airbnb data lookup APIs for study research
- `consultations/*` - Contact form submissions
- All sensitive routes protected by `checkRateLimit()` from `lib/rate-limit.ts`

### Authentication System (NextAuth v5)
**Setup** (`lib/auth.ts`):
- **Strategy**: JWT with Credentials provider
- **Session duration**: 30 days
- **Password**: bcryptjs hashing (10 rounds)
- Custom callbacks extend JWT token with `role`, `firstName`, `lastName`, `image`

**Middleware** (`middleware.ts`):
- Runs on Edge Runtime (uses `getToken()` not `auth()`)
- Protected paths: `/admin/*`, `/profile/*`, matching API routes
- Admin-only enforcement via `token.role !== 'ADMIN'` check

**Validation**: Zod schemas in `lib/validations/auth.ts`:
```typescript
registerSchema // firstName, lastName, email, password (8+ chars, 1 upper, 1 lower, 1 number)
loginSchema    // email, password
updateProfileSchema, changePasswordSchema
```

**Creating Admin**: Run `node scripts/create-admin.js` (default: `admin@moftahak.com` / `Admin@2026`)

### Database (Prisma + PostgreSQL)
**Connection** (`lib/prisma.ts`):
- Uses `@prisma/adapter-pg` with `pg` Pool
- Global singleton pattern prevents connection exhaustion in dev
- Connection string from `process.env.DATABASE_URL`

**Schema** (`prisma/schema.prisma`):
```prisma
model User {
  id            String   @id @default(cuid())
  firstName     String
  lastName      String
  email         String   @unique
  password      String
  role          Role     @default(USER)  // USER | ADMIN
  image         String?  @default("/images/default-avatar.svg")
  emailVerified DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  feasibilityStudies FeasibilityStudy[]
}

model Consultation {
  id          String             @id @default(cuid())
  firstName   String
  lastName    String
  email       String
  phone       String?
  message     String
  bedrooms    Int?               @default(0)
  livingRooms Int?               @default(0)
  kitchens    Int?               @default(0)
  bathrooms   Int?               @default(0)
  status      ConsultationStatus @default(PENDING) // PENDING | ACCEPTED | REJECTED | COMPLETED
  feasibilityStudy   FeasibilityStudy?
  feasibilityStudyId String?           @unique
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}

model FeasibilityStudy {
  id          String      @id @default(cuid())
  title       String
  clientName  String
  clientEmail String?
  slides      Json        // Slide array stored as JSON
  bedrooms    Int         @default(1)
  livingRooms Int         @default(1)
  kitchens    Int         @default(1)
  bathrooms   Int         @default(1)
  totalCost   Float       @default(0)
  status      StudyStatus @default(DRAFT) // DRAFT | SENT | VIEWED
  shareId     String?     @unique          // Public sharing link identifier
  admin       User        @relation(fields: [adminId], references: [id])
  adminId     String
  consultation   Consultation?
  consultationId String?       @unique
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  sentAt      DateTime?
  viewedAt    DateTime?
}
```

**Migration workflow**:
```bash
npx prisma migrate dev --name description  # Create migration
npx prisma db push                          # Quick schema sync (no migration)
npx prisma studio                           # Browse database
```

### Feasibility Study Editor
**Complex Context-Driven Feature** - Full slide-based study creator for real estate feasibility reports.

**Architecture**:
- **Context**: `FeasibilityEditorContext` wraps editor, provides state management
- **Hook**: `useSlides` (696 lines) - manages slide CRUD, room generation, reordering
- **Slide Types**: 13 types (`cover`, `introduction`, `room-setup`, `bedroom`, `kitchen`, `bathroom`, `living-room`, `cost-summary`, `area-study`, `map`, `nearby-apartments`, `statistics`, `footer`)
- **Libraries**: Pre-defined item catalogs in `lib/feasibility/` (bedroom/kitchen/bathroom/living-room items with prices)

**Design System** (`lib/feasibility/design-system.ts`):
- **Colors**: Same brand palette but additional transparency variants
- **Shadows**: 8 predefined levels (`widget`, `widgetHover`, `widgetElevated`, `card`, `soft`, `inner`, `icon`, `popup`)
- **Widget Classes**: Tailwind class combinations for interactive elements
- **Rounded corners**: Feasibility widgets use `rounded-2xl` for softer feel in editor context

**Key Components** (`components/feasibility/`):
- `editor/EditorLayout.tsx` - Main editor container with toolbar, canvas, sidebar
- `editor/EditorCanvas.tsx` - Slide rendering area with zoom
- `editor/EditableTextOverlay.tsx`, `editor/EditableImageOverlay.tsx` - Drag-and-drop text/image widgets
- `slides/SlideManager.tsx` - Sidebar slide thumbnails with reordering (@dnd-kit)
- `slides/RoomSlide.tsx` - Room-specific slide with item selection
- `viewer/` - Read-only study viewer for client-facing links

**Room Item Pattern**:
```typescript
// lib/feasibility/kitchen-items.ts example
export interface KitchenItemDefinition {
  id: string;
  name: string;
  category: KitchenCategory;
  price: number;
  icon: string;
}
export const createKitchenRoomItem = (item, quantity) => ({ ...item, quantity });
```

**Slide Data Flow**:
1. User adds slide via `addSlide(type)` → Hook creates slide from template
2. User updates slide → `updateSlideData(id, partialData)` → Merges into slide's data object
3. Room setup slide generates child slides → `generateRoomSlides({ bedrooms: 2, ... })` → Auto-creates bedroom/kitchen/etc. slides

### Styling Architecture
**Modern Border Radius System**
```javascript
// tailwind.config.js - Rounded corners are allowed
borderRadius: {
  'none': '0',
  'sm': '0.25rem',    // 4px
  DEFAULT: '0.5rem',  // 8px
  'md': '0.625rem',   // 10px
  'lg': '0.75rem',    // 12px
  'xl': '1rem',       // 16px
  '2xl': '1.25rem',   // 20px - used in feasibility editor widgets
  '3xl': '1.5rem',    // 24px
  'full': '9999px',   // circles
}
```

**Custom Color System** (defined in `tailwind.config.js` and `globals.css`):
- Primary: `#edbf8c` (light gold) - used for accents, hover states
- Secondary: `#10302b` (dark green) - used for buttons, text
- Accent: `#ead3b9` (light beige) - page background
- White: `#fdf6ee` (off-white beige tone)

**Background Patterns**: Custom assets in `/public/patterns/`
```javascript
'pattern-vertical-white': "url('/patterns/pattern-vertical-white.png')",
'pattern-vertical-dark': "url('/patterns/pattern-vertical-dark.png')",
// ...horizontal variants
```

### Typography System
**Two custom fonts** loaded via `next/font/local` in `app/fonts.ts`:
- **Bristone** (English): Thin (300), Regular (400), Bold (700) - `.otf` and `.ttf` files
- **Dubai** (Arabic): Light (300), Medium (500), Bold (700) - `.otf` and `.ttf` files

Apply via Tailwind utilities:
```tsx
className="font-bristone"  // English text
className="font-dubai"     // Arabic text (default)
```

CSS variables: `--font-bristone`, `--font-dubai`

### Animation System (Framer Motion)
**Centralized in `lib/animations/`**:
- `config.ts`: Timing constants, easing curves, spring configs
- `variants.ts`: Pre-built Framer Motion variants (fadeIn, fadeInUp, scaleUp, etc.)

**Pattern**: Import variants, apply to `motion` components:
```tsx
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  <motion.h1 variants={fadeInUp}>Title</motion.h1>
</motion.div>
```

**Custom Hooks** for scroll-based animations:
- `useScrollAnimation(ref, options)`: Returns `boolean` when element enters viewport
- `useCounter({ start, end, duration }, isVisible)`: Animated number counter
- `useParallax()`, `useMouseMove()`, `useGyroscope()`: Advanced effects

**Performance**: Components set `will-change: transform, opacity` in CSS for animations

### Component Patterns

**Button Component** (`components/ui/Button.tsx`):
- Variants: `primary`, `secondary`, `outline`, `ghost`
- Sizes: `sm`, `md`, `lg`
- **All buttons have shimmer effect** via `before:` pseudo-element with gradient sweep
- Uses modern border radius system

**Container Component** (`components/ui/Container.tsx`):
- Standardizes max-width and padding across sections

**Card Component** (`components/ui/Card.tsx`):
- Base styling for feature cards, service cards
- Modern rounded corners with shadow styles and beige tones

### Image Management
**IMPORTANT**: Many images are placeholders from Unsplash/Pravatar
```typescript
// next.config.ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'i.pravatar.cc' }
  ]
}
```

**Missing Assets** documented in `public/images/README.md`:
- Hero background, Abdullah profile photo
- 6 service images, 3 video thumbnails
- Logo variants (without text versions)

When adding images, follow the directory structure:
- Logos: `/public/logos/`
- Hero: `/public/images/hero/`
- Services: `/public/images/courses/`

### TypeScript Patterns
- Minimal type definitions in `types/` (simplified structure)
- Prefer inline types for component props
- Use `React.FC<Props>` pattern for section components

### Utility Functions (`lib/utils.ts`)
```typescript
cn(...inputs)           // Merge Tailwind classes (clsx + tailwind-merge)
formatPrice(number)     // Format as EGP currency (Arabic locale)
formatNumber(number)    // Format with Arabic numerals
truncateText(str, max)  // Truncate with ellipsis
```

### Development Workflow

### Commands
```bash
npm run dev    # Start dev server (Next.js 16.1.1)
npm run build  # Production build
npm start      # Start production server
npm run lint   # ESLint (using new flat config)

# Database
npx prisma migrate dev --name description  # Create migration
npx prisma db push                          # Quick schema sync
npx prisma studio                           # Database GUI
node scripts/create-admin.js                # Create admin user
```

### Security Patterns
**Rate Limiting** (`lib/rate-limit.ts`):
```typescript
import { checkRateLimit } from '@/lib/rate-limit';

const { allowed, remaining } = checkRateLimit(ip, {
  windowMs: 15 * 60 * 1000,  // 15 min
  maxRequests: 5              // 5 attempts
});
if (!allowed) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
```

**Security Headers** (`lib/security-headers.ts`):
- Auto-applied: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`
- Usage: `import { addSecurityHeaders } from '@/lib/security-headers'; return addSecurityHeaders(response);`

**API Route Pattern** (with auth + rate limit):
```typescript
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const ip = request.ip || 'unknown';
  const { allowed } = checkRateLimit(ip, { maxRequests: 10 });
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  
  // ... business logic
  
  const response = NextResponse.json({ success: true });
  return addSecurityHeaders(response);
}
```

### Build Configuration
- **Deployment**: Netlify (`netlify.toml` present, uses `@netlify/plugin-nextjs`)
- **Next.js optimizations**:
  - `removeConsole` in production
  - `optimizePackageImports` for lucide-react, react-icons
  - Image optimization (AVIF, WebP formats)
  - Turbopack enabled (empty config to silence warnings)

### ESLint
Uses **ESLint v9 flat config** (`eslint.config.mjs`):
```javascript
import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
```
Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

### Custom Scrollbar
Desktop/tablet users see custom scrollbar (`CustomScrollbar.tsx` in layout)
Mobile uses native scrollbar (hidden on desktop via CSS in `globals.css`)

## Code Conventions

### File Organization
- UI primitives: `components/ui/` (Button, Card, Container, Badge, Input, AnimatedStroke)
- Section components: `components/` root (e.g., `HeroSection.tsx`)
- Animation components: `components/animations/` (e.g., `AnimatedBackground.tsx`)
- Hooks: `hooks/` (prefixed with `use`)
- Utilities: `lib/` (constants, utils, data)
- Types: `types/` (minimal usage)

### Naming Conventions
- Components: PascalCase (e.g., `HeroSection.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useScrollAnimation.ts`)
- Utilities: camelCase (e.g., `utils.ts`)
- Constants: camelCase for objects, UPPER_SNAKE_CASE for primitives

### Import Patterns
Use path aliases (`@/` mapped to root):
```typescript
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations/variants';
```

### Client Component Directive
**Always add `'use client'` at top** of components using:
- React hooks (useState, useEffect, useRef)
- Framer Motion
- Event handlers
- Browser APIs

## SEO & Metadata
Rich metadata in `app/layout.tsx`:
- Bilingual OpenGraph (Arabic primary, English alternate)
- Twitter cards
- Viewport configuration with theme colors
- Keywords focused on Egyptian real estate market
- Canonical URLs and language alternates

## Common Tasks

### Creating Admin-Only API Routes
1. Place in `app/api/admin/[feature]/route.ts`
2. Check role in middleware (auto-protected by path `/api/admin/*`)
3. Add rate limiting for sensitive operations
4. Return JSON with security headers

**Example** (`app/api/admin/users/route.ts`):
```typescript
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const users = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, email: true, role: true }
  });
  
  return NextResponse.json({ users });
}
```

### Adding a Feasibility Slide Type
1. Add type to `SlideType` union in `types/feasibility.ts`
2. Create slide data interface (e.g., `MyNewSlideData`)
3. Add to `SlideData` type union
4. Create template in `useSlides.ts` → `defaultSlideTemplates`
5. Create slide component in `components/feasibility/slides/MyNewSlide.tsx`
6. Import and render in `EditorCanvas.tsx` switch statement

### Handling User Avatars
**Upload**: POST to `/api/user/upload` with FormData
- Saves to Vercel Blob Storage via `@vercel/blob`
- Returns blob URL (e.g., `https://[blob-id].public.blob.vercel-storage.com/[filename]`)
- Updates user record via Prisma with blob URL

**Delete**: DELETE to `/api/user/upload`
- Removes file from Vercel Blob Storage
- Resets to default: `/images/default-avatar.svg`

### Working with Framer Motion Stagger
```tsx
import { staggerContainer, fadeInUp } from '@/lib/animations/variants';

<motion.div variants={staggerContainer} initial="hidden" whileInView="visible">
  {items.map((item, i) => (
    <motion.div key={i} variants={fadeInUp}>
      {item}
    </motion.div>
  ))}
</motion.div>
```
**Note**: Children automatically inherit stagger delays from parent with matching `initial`/`animate` states.

### Adding a New Section
1. Create `components/NewSection.tsx` with `'use client'`
2. Import animation variants from `lib/animations/variants`
3. Use `useScrollAnimation` hook for viewport detection
4. Import in `app/page.tsx` and add to component tree
5. Ensure modern rounded corners (no strict policy)
6. Use brand colors from Tailwind config

### Creating Animated Components
```tsx
'use client';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations/variants';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Component = () => {
  const ref = useRef(null);
  const isInView = useScrollAnimation(ref, { threshold: 0.3, once: true });
  
  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      Content
    </motion.div>
  );
};
```

### Styling with Brand Colors
```tsx
className="bg-primary text-secondary"        // Light gold bg, dark green text
className="bg-secondary text-primary"        // Dark green bg, light gold text  
className="bg-accent text-foreground"        // Light beige bg, dark text
className="bg-pattern-vertical-white"        // Custom pattern background
```

## Dependencies
**Core**: Next.js 16.1.1, React 19.2.3, TypeScript 5
**Auth**: NextAuth v5.0.0-beta.30, bcryptjs
**Database**: Prisma 7.2.0, PostgreSQL (via pg + @prisma/adapter-pg)
**Styling**: Tailwind CSS 4, clsx, tailwind-merge
**Animation**: framer-motion 12.23.26
**Drag-and-Drop**: @dnd-kit (core, sortable, modifiers, utilities)
**Maps**: Leaflet 1.9.4, react-leaflet 5.0.0
**Charts**: recharts 3.6.0
**Icons**: lucide-react, react-icons
**Validation**: zod 4.3.4
**Build**: @netlify/plugin-nextjs

## Performance Considerations
- Images: AVIF/WebP, lazy loading via next/image
- Fonts: Preloaded with `display: swap`
- CSS: Modern border radius system with hardware-accelerated rendering
- Animations: Hardware-accelerated (transform/opacity only)
- Reduced motion: Respected via `prefers-reduced-motion` media query
- Database: Connection pooling with singleton pattern in dev
