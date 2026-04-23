import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileForm } from "@/components/profile-form";
import { CreateOrgForm } from "@/components/create-org-form";

// Mock Supabase client
const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
const mockInsert = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({ data: { id: "new-org-id", slug: "test-org" }, error: null }),
  }),
});
const mockGetUser = vi.fn().mockResolvedValue({
  data: { user: { id: "user-123" } },
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === "profiles") return { update: mockUpdate };
      if (table === "organizations") return { insert: mockInsert };
      if (table === "org_members") return { insert: vi.fn().mockResolvedValue({ error: null }) };
      return {};
    },
  }),
}));

describe("ProfileForm", () => {
  const mockProfile = {
    id: "user-123",
    email: "test@example.com",
    full_name: "Test User",
    avatar_url: null,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    mockUpdate.mockClear();
  });

  it("renders the profile heading", () => {
    render(<ProfileForm profile={mockProfile} />);
    expect(screen.getByRole("heading", { name: /profile/i })).toBeInTheDocument();
  });

  it("renders the email as read-only", () => {
    render(<ProfileForm profile={mockProfile} />);
    const emailInput = screen.getByLabelText(/email.*read-only/i);
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("renders the full name input with current value", () => {
    render(<ProfileForm profile={mockProfile} />);
    const nameInput = screen.getByLabelText(/full name/i);
    expect(nameInput).toHaveValue("Test User");
  });

  it("allows editing the full name", () => {
    render(<ProfileForm profile={mockProfile} />);
    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });
    expect(nameInput).toHaveValue("Updated Name");
  });

  it("renders the save button", () => {
    render(<ProfileForm profile={mockProfile} />);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });
});

describe("CreateOrgForm", () => {
  beforeEach(() => {
    mockInsert.mockClear();
    mockGetUser.mockClear();
  });

  it("renders the create org heading", () => {
    render(<CreateOrgForm />);
    expect(screen.getByRole("heading", { name: /create organization/i })).toBeInTheDocument();
  });

  it("renders name and slug inputs", () => {
    render(<CreateOrgForm />);
    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organization slug/i)).toBeInTheDocument();
  });

  it("auto-generates slug from name", () => {
    render(<CreateOrgForm />);
    const nameInput = screen.getByLabelText(/organization name/i);
    const slugInput = screen.getByLabelText(/organization slug/i);

    fireEvent.change(nameInput, { target: { value: "My Cool Org" } });
    expect(slugInput).toHaveValue("my-cool-org");
  });

  it("disables create button when fields are empty", () => {
    render(<CreateOrgForm />);
    const createButton = screen.getByRole("button", { name: /create organization/i });
    expect(createButton).toBeDisabled();
  });

  it("enables create button when fields are filled", () => {
    render(<CreateOrgForm />);
    const nameInput = screen.getByLabelText(/organization name/i);
    fireEvent.change(nameInput, { target: { value: "Test Org" } });

    const createButton = screen.getByRole("button", { name: /create organization/i });
    expect(createButton).not.toBeDisabled();
  });
});
