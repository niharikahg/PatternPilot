import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThinkingScene } from "./ThinkingScene";

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Waiting question progression", () => {
  it("does not advance by timer or navigation until the current question is answered", () => {
    vi.useFakeTimers();
    render(<ThinkingScene />);
    const next = screen.getByRole("button", { name: "Next tip" });
    const previous = screen.getByRole("button", { name: "Previous tip" });
    const options = screen.getAllByRole("button", { pressed: false });
    const firstOption = options[0];
    if (!firstOption) throw new Error("Expected an answer option");
    expect(next).toBeDisabled();
    expect(previous).toBeDisabled();
    act(() => { vi.advanceTimersByTime(60000); });
    expect(screen.getAllByRole("button", { pressed: false })[0]).toBe(options[0]);
    fireEvent.click(next);
    expect(next).toBeDisabled();
    fireEvent.click(firstOption);
    expect(next).toBeEnabled();
    expect(previous).toBeEnabled();
    fireEvent.click(next);
    expect(next).toBeDisabled();
    expect(screen.getAllByRole("button", { pressed: false })[0]).not.toBe(options[0]);
    act(() => { vi.advanceTimersByTime(60000); });
    expect(next).toBeDisabled();
  });
});