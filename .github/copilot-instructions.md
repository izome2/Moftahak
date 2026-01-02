# Moftahak - AI Coding Agent Instructions

## Project Overview
Next.js 16 real estate landing page for "مفتاحك" (Moftahak) - a luxury Egyptian property and hotel apartment services platform. **Bilingual (Arabic primary, English secondary)** with heavy Framer Motion animations and custom Tailwind design system.

## Architecture & Key Patterns

### App Structure (Next.js App Router)
- **Single-page landing**: All content in `app/page.tsx` as section imports
- **Section components**: `HeroSection`, `AboutSection`, `FeaturesSection`, `ServicesSection`, `PremiumSection`, `TestimonialsSection`, `ContentSection`, `CTASection`
- **All interactive components require `'use client'`** directive (14/14 components use it)
- No API routes currently (`app/api/` is empty)

### Styling Architecture
**CRITICAL: This project has a ZERO border-radius policy**
```javascript
// tailwind.config.js - ALL borders are sharp corners
borderRadius: {
  'none': '0',
  DEFAULT: '0',  // Even default is 0!
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
- Sharp corners enforced (no border-radius)

**Container Component** (`components/ui/Container.tsx`):
- Standardizes max-width and padding across sections

**Card Component** (`components/ui/Card.tsx`):
- Base styling for feature cards, service cards
- Sharp corners, shadow styles with beige tones

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

## Development Workflow

### Commands
```bash
npm run dev    # Start dev server (Next.js 16.1.1)
npm run build  # Production build
npm start      # Start production server
npm run lint   # ESLint (using new flat config)
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

### Adding a New Section
1. Create `components/NewSection.tsx` with `'use client'`
2. Import animation variants from `lib/animations/variants`
3. Use `useScrollAnimation` hook for viewport detection
4. Import in `app/page.tsx` and add to component tree
5. Ensure sharp corners (no border-radius)
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
**Styling**: Tailwind CSS 4, clsx, tailwind-merge
**Animation**: framer-motion 12.23.26
**Icons**: lucide-react, react-icons
**Build**: @netlify/plugin-nextjs

## Performance Considerations
- Images: AVIF/WebP, lazy loading via next/image
- Fonts: Preloaded with `display: swap`
- CSS: No border-radius (improves render performance)
- Animations: Hardware-accelerated (transform/opacity only)
- Reduced motion: Respected via `prefers-reduced-motion` media query
