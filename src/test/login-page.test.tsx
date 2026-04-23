import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "@/app/auth/login/page";

// Mock Supabase client
const mockSignInWithPassword = vi.fn().mockResolvedValue({ error: null });
const mockSignUp = vi.fn().mockResolvedValue({ error: null });
const mockSignInWithOAuth = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mockSignInWithPassword.mockClear();
    mockSignUp.mockClear();
    mockSignInWithOAuth.mockClear();
  });

  it("renders the sign-in heading", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders the GitHub sign-in button", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /continue with github/i });
    expect(button).toBeInTheDocument();
  });

  it("renders descriptive copy", () => {
    render(<LoginPage />);
    expect(screen.getByText(/sign in to access your dashboard/i)).toBeInTheDocument();
  });

  it("calls signInWithOAuth with github provider on GitHub button click", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /continue with github/i });
    fireEvent.click(button);
    expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "github" })
    );
  });

  it("toggles between sign in and sign up modes", () => {
    render(<LoginPage />);
    // Initially in sign in mode
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();

    // Click "Sign Up" toggle
    const toggleButton = screen.getByRole("button", { name: /switch to sign up/i });
    fireEvent.click(toggleButton);

    // Now in sign up mode
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
  });

  it("submits email/password sign-in on form submission", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in with email/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });
});
