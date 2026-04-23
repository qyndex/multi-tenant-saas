import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home (landing page)", () => {
  it("renders the main heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /multi-tenant saas/i })
    ).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(<Home />);
    expect(
      screen.getByText(/built with next\.js, supabase, and typescript/i)
    ).toBeInTheDocument();
  });

  it("renders a Sign In link pointing to /auth/login", () => {
    render(<Home />);
    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute("href", "/auth/login");
  });

  it("renders a Sign Up link pointing to /auth/signup", () => {
    render(<Home />);
    const signUpLink = screen.getByRole("link", { name: /sign up/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/auth/signup");
  });

  it("renders both CTA links", () => {
    render(<Home />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
  });
});
