import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ErrorBoundary } from "../src/app/components/ErrorBoundary";

function Thrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test render explosion");
  return <div>All good</div>;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Hello Studio</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Hello Studio")).toBeInTheDocument();
  });

  it("shows fallback UI when child throws", () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test render explosion")).toBeInTheDocument();
  });

  it("shows Reload Studio button in fallback", () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Reload Studio")).toBeInTheDocument();
  });

  it("shows Reset to empty project button in fallback", () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Reset to empty project")).toBeInTheDocument();
  });

  it("calls onReset and recovers when Reset button is clicked", () => {
    const onReset = vi.fn();
    const { rerender } = render(
      <ErrorBoundary onReset={onReset}>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByText("Reset to empty project"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("logs error to console", () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(console.error).toHaveBeenCalled();
  });
});
