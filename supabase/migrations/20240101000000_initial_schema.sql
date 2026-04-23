-- Initial schema for multi-tenant SaaS
-- Organizations, members, and profiles with row-level security

-- ============================================================================
-- PROFILES (linked to Supabase Auth users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile and profiles of people in their orgs
CREATE POLICY "profiles_select_own_and_org" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.org_members AS my
      JOIN public.org_members AS theirs ON my.org_id = theirs.org_id
      WHERE my.user_id = auth.uid()
        AND theirs.user_id = profiles.id
    )
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Service role can insert (trigger runs as SECURITY DEFINER)
CREATE POLICY "profiles_insert_service" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  plan       TEXT NOT NULL DEFAULT 'free',
  owner_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Members of an org can view it
CREATE POLICY "organizations_select_members" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = organizations.id
        AND org_members.user_id = auth.uid()
    )
  );

-- Only the owner can update their org
CREATE POLICY "organizations_update_owner" ON public.organizations
  FOR UPDATE USING (owner_id = auth.uid());

-- Any authenticated user can create an org (they become owner)
CREATE POLICY "organizations_insert_auth" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Only the owner can delete their org
CREATE POLICY "organizations_delete_owner" ON public.organizations
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================================================
-- ORG_MEMBERS (join table: users <-> organizations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.org_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at  TIMESTAMPTZ,
  UNIQUE (org_id, user_id)
);

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Members can see other members in their orgs
CREATE POLICY "org_members_select" ON public.org_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.org_members AS my
      WHERE my.org_id = org_members.org_id
        AND my.user_id = auth.uid()
    )
  );

-- Owners and admins can invite (insert) members
CREATE POLICY "org_members_insert" ON public.org_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members AS my
      WHERE my.org_id = org_members.org_id
        AND my.user_id = auth.uid()
        AND my.role IN ('owner', 'admin')
    )
    -- Also allow the org creator to add themselves as first member
    OR (
      user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.organizations
        WHERE organizations.id = org_members.org_id
          AND organizations.owner_id = auth.uid()
      )
    )
  );

-- Owners and admins can update member roles
CREATE POLICY "org_members_update" ON public.org_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.org_members AS my
      WHERE my.org_id = org_members.org_id
        AND my.user_id = auth.uid()
        AND my.role IN ('owner', 'admin')
    )
  );

-- Owners and admins can remove members; members can remove themselves
CREATE POLICY "org_members_delete" ON public.org_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.org_members AS my
      WHERE my.org_id = org_members.org_id
        AND my.user_id = auth.uid()
        AND my.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop if exists to make migration idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
