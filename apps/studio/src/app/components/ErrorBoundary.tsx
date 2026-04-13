"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[Studio ErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message ?? "An unexpected error occurred.";
      return (
        <div
          className="error-boundary-fallback"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "#1a1a1a",
            color: "#e0e0e0",
            padding: 32,
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: 24, marginBottom: 12, color: "#ff6b6b" }}>
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#aaa",
              maxWidth: 480,
              lineHeight: 1.5,
              marginBottom: 24,
            }}
          >
            {message}
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={this.handleReload}
              style={{
                padding: "10px 20px",
                background: "#4a9eff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Reload Studio
            </button>
            <button
              onClick={this.handleReset}
              style={{
                padding: "10px 20px",
                background: "#333",
                color: "#e0e0e0",
                border: "1px solid #555",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Reset to empty project
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
