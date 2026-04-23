/**
 * Supabase database types for multi-tenant SaaS.
 *
 * Regenerate from live schema:
 *   npx supabase gen types typescript --local > src/types/database.ts
 *
 * These hand-written types match the initial migration and are sufficient
 * until the schema evolves enough to warrant auto-generation.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MemberRole = "owner" | "admin" | "member" | "viewer";
export type OrgPlan = "free" | "pro" | "enterprise";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: OrgPlan;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: OrgPlan;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          plan?: OrgPlan;
          owner_id?: string;
          created_at?: string;
        };
      };
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: MemberRole;
          invited_at: string;
          joined_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: MemberRole;
          invited_at?: string;
          joined_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: MemberRole;
          invited_at?: string;
          joined_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience aliases for common use
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrgMember = Database["public"]["Tables"]["org_members"]["Row"];

// Joined types for UI display
export interface OrgWithRole extends Organization {
  role: MemberRole;
}

export interface MemberWithProfile extends OrgMember {
  profiles: Profile;
}
