import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "@/app/auth/login/page";

// Mock next-auth/react
const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mockSignIn.mockClear();
  });

  it("renders the sign-in heading", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
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

  it("calls signIn with github provider and dashboard callback on button click", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /continue with github/i });
    fireEvent.click(button);
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith("github", { callbackUrl: "/dashboard" });
  });

  it("button has accessible name without relying solely on color", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /continue with github/i });
    // button text is sufficient — no aria-label needed, but verify it's a button role
    expect(button.tagName).toBe("BUTTON");
  });
});
