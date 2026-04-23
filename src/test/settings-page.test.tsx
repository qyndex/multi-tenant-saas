import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SettingsPage from "@/app/settings/page";

describe("SettingsPage", () => {
  it("renders the Organization Settings heading", () => {
    render(<SettingsPage />);
    expect(
      screen.getByRole("heading", { name: /organization settings/i })
    ).toBeInTheDocument();
  });

  it("renders the Org Name label and text input", () => {
    render(<SettingsPage />);
    expect(screen.getByText(/org name/i)).toBeInTheDocument();
    // The input is unlabelled with htmlFor in source — check it is present
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("updates org name input as user types", () => {
    render(<SettingsPage />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Acme Corp" } });
    expect(input).toHaveValue("Acme Corp");
  });

  it("renders the Billing section", () => {
    render(<SettingsPage />);
    expect(screen.getByRole("heading", { name: /billing/i })).toBeInTheDocument();
  });

  it("renders the Stripe portal description", () => {
    render(<SettingsPage />);
    expect(
      screen.getByText(/manage subscription via stripe portal/i)
    ).toBeInTheDocument();
  });

  it("clears the org name input on second render", () => {
    const { unmount } = render(<SettingsPage />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Old Name" } });
    unmount();
    render(<SettingsPage />);
    const freshInput = screen.getByRole("textbox");
    // State is local — fresh render resets to empty
    expect(freshInput).toHaveValue("");
  });
});
