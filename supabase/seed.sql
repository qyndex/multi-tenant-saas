-- Seed data for multi-tenant SaaS demo
-- Creates 2 organizations, 5 users/profiles, and membership records
--
-- NOTE: In production, profiles are auto-created by the on_auth_user_created trigger.
-- This seed inserts directly for local development with `supabase db reset`.
-- The auth.users rows are created by Supabase seed support; profiles are inserted manually.

-- ============================================================================
-- DEMO USERS (inserted into auth.users via Supabase's raw_user_meta_data)
-- Passwords are all "password123" — local dev only.
-- ============================================================================

-- User 1: Alice (owner of Acme Corp)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'alice@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Alice Johnson", "avatar_url": "https://api.dicebear.com/7.x/initials/svg?seed=AJ"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- User 2: Bob (admin at Acme Corp)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'bob@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Bob Smith", "avatar_url": "https://api.dicebear.com/7.x/initials/svg?seed=BS"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- User 3: Carol (member at Acme Corp + owner of Globex)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES (
  'c3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'carol@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Carol Williams", "avatar_url": "https://api.dicebear.com/7.x/initials/svg?seed=CW"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- User 4: Dave (member at Globex)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES (
  'd4444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'dave@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Dave Brown", "avatar_url": "https://api.dicebear.com/7.x/initials/svg?seed=DB"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- User 5: Eve (viewer at both orgs)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES (
  'e5555555-5555-5555-5555-555555555555',
  '00000000-0000-0000-0000-000000000000',
  'eve@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Eve Davis", "avatar_url": "https://api.dicebear.com/7.x/initials/svg?seed=ED"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PROFILES (normally auto-created by trigger, but seed needs explicit inserts)
-- ============================================================================

INSERT INTO public.profiles (id, email, full_name, avatar_url) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'alice@example.com', 'Alice Johnson', 'https://api.dicebear.com/7.x/initials/svg?seed=AJ'),
  ('b2222222-2222-2222-2222-222222222222', 'bob@example.com',   'Bob Smith',     'https://api.dicebear.com/7.x/initials/svg?seed=BS'),
  ('c3333333-3333-3333-3333-333333333333', 'carol@example.com', 'Carol Williams','https://api.dicebear.com/7.x/initials/svg?seed=CW'),
  ('d4444444-4444-4444-4444-444444444444', 'dave@example.com',  'Dave Brown',    'https://api.dicebear.com/7.x/initials/svg?seed=DB'),
  ('e5555555-5555-5555-5555-555555555555', 'eve@example.com',   'Eve Davis',     'https://api.dicebear.com/7.x/initials/svg?seed=ED')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

INSERT INTO public.organizations (id, name, slug, plan, owner_id) VALUES
  ('org-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Acme Corp',       'acme-corp',   'pro',  'a1111111-1111-1111-1111-111111111111'),
  ('org-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Globex Industries','globex-ind',  'free', 'c3333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ORG MEMBERS
-- ============================================================================

INSERT INTO public.org_members (org_id, user_id, role, joined_at) VALUES
  -- Acme Corp members
  ('org-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a1111111-1111-1111-1111-111111111111', 'owner',  now()),
  ('org-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'b2222222-2222-2222-2222-222222222222', 'admin',  now()),
  ('org-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c3333333-3333-3333-3333-333333333333', 'member', now()),
  ('org-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e5555555-5555-5555-5555-555555555555', 'viewer', now()),
  -- Globex Industries members
  ('org-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c3333333-3333-3333-3333-333333333333', 'owner',  now()),
  ('org-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'd4444444-4444-4444-4444-444444444444', 'member', now()),
  ('org-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'e5555555-5555-5555-5555-555555555555', 'viewer', now())
ON CONFLICT (org_id, user_id) DO NOTHING;
