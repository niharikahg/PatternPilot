import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WorkspaceGuide } from "./WorkspaceGuide";

describe("first-visit workspace guide", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("remembers dismissal on this device and can be reopened", () => {
    const first = render(<WorkspaceGuide onTryExample={vi.fn()} />);
    expect(screen.getByRole("region", { name: "Quick start guide" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss guide" }));
    expect(localStorage.getItem("patternpilot-workspace-guide-v1")).toBe("dismissed");
    first.unmount();
    render(<WorkspaceGuide onTryExample={vi.fn()} />);
    expect(screen.queryByRole("region", { name: "Quick start guide" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Quick guide" }));
    expect(screen.getByRole("region", { name: "Quick start guide" })).toBeInTheDocument();
  });

  it("lets a first-time visitor start with an example without generating automatically", () => {
    const choose = vi.fn();
    render(<WorkspaceGuide onTryExample={choose} />);
    fireEvent.click(screen.getByRole("button", { name: "Try Two Sum" }));
    expect(choose).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("patternpilot-workspace-guide-v1")).toBe("dismissed");
  });
});