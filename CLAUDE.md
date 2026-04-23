# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-tenant SaaS platform with organization management, team roles, and Stripe billing.

Built with Next.js 14, React 18, TypeScript 5.9, Supabase (auth + PostgreSQL + RLS), Prisma (optional ORM), and Tailwind CSS.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local Supabase (requires Docker + Supabase CLI)
npx supabase start

# 3. Copy env vars (fill in values from `supabase status` output)
cp .env.example .env.local
# Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from supabase status

# 4. Apply migrations and seed data
npx supabase db reset   # runs migrations + seed.sql

# 5. Start dev server
npm run dev              # http://localhost:3000

# Demo login (after seeding):
#   Email: alice@example.com  Password: password123
#   Email: bob@example.com    Password: password123
```

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npx tsc --noEmit         # Type check
npm run lint             # ESLint

# Supabase
npx supabase start       # Start local Supabase (Docker required)
npx supabase stop        # Stop local Supabase
npx supabase db reset    # Reset DB, apply migrations, run seed.sql
npx supabase status      # Show local Supabase URLs and keys

# Prisma (optional — for Prisma-based workflows)
npx prisma generate      # Generate Prisma client from schema
npx prisma db push       # Push schema to database
```

## Architecture

```
src/
  app/                     # Next.js App Router pages and layouts
    auth/
      login/page.tsx       # Email/password + GitHub OAuth login (Supabase Auth)
      signup/page.tsx       # Redirects to login with signup mode
      callback/route.ts    # OAuth callback handler
    dashboard/page.tsx     # Org dashboard with real Supabase queries
    settings/page.tsx      # Profile, org settings, create org
    page.tsx               # Landing page
    layout.tsx             # Root layout
  components/
    create-org-form.tsx    # Create new organization form
    member-list.tsx        # Team member list with roles
    org-settings-form.tsx  # Edit organization settings
    org-switcher.tsx       # Switch between organizations
    profile-form.tsx       # Edit user profile
    sign-out-button.tsx    # Sign-out button
  lib/
    auth.ts                # requireAuth() / getOptionalUser() helpers
    prisma.ts              # Prisma client singleton (optional)
    supabase/
      client.ts            # Browser-side Supabase client
      server.ts            # Server-side Supabase client (cookies)
      middleware.ts         # Middleware Supabase client (token refresh)
  types/
    database.ts            # TypeScript types matching Supabase schema
  middleware.ts            # Route protection + auth token refresh

supabase/
  migrations/              # SQL migrations (applied in order)
    20240101000000_initial_schema.sql
  seed.sql                 # Demo data (2 orgs, 5 users)
  config.toml              # Local Supabase config

prisma/
  schema.prisma            # Prisma schema (optional, mirrors Supabase)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (from `supabase status` or dashboard) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (public, safe for client) |
| `DATABASE_URL` | No | Direct PostgreSQL URL (for Prisma, optional) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (for billing) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (client-side) |

## Database Schema

Three core tables with row-level security:

- **profiles** — User profiles (auto-created on signup via trigger, linked to `auth.users`)
- **organizations** — Orgs with name, slug, plan, owner
- **org_members** — Join table with roles: `owner`, `admin`, `member`, `viewer`

All tables have RLS policies enforcing org-level isolation:
- Users can only see orgs they belong to
- Only owners can update/delete orgs
- Only owners/admins can manage members
- Members can remove themselves

## Auth Flow

1. User visits `/auth/login` — email/password or GitHub OAuth
2. Supabase Auth creates session, trigger auto-creates profile
3. Middleware refreshes tokens and protects `/dashboard` and `/settings`
4. Server Components use `createServerSupabaseClient()` for queries (respects RLS)
5. Client Components use `createClient()` for mutations

## Rules

- TypeScript strict mode — no `any` types
- All components must have proper TypeScript interfaces
- Use Tailwind utility classes — no custom CSS files
- ARIA labels on all interactive elements
- Error + loading states on all data-fetching components
- Use `next/image` for all images, `next/link` for navigation
- All Supabase queries respect RLS — never bypass with service role in client code
- Database types in `src/types/database.ts` — keep in sync with migrations
