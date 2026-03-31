import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: "100vw",
          height: "100vh",
          background: "#020a14",
          color: "#ff0040",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontFamily: "monospace",
          padding: 20,
        }}>
          <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>⚠ ERROR</div>
          <div style={{ fontSize: 14, color: "#ffaa00", marginBottom: 20 }}>
            {this.state.error?.message || "Unknown error occurred"}
          </div>
          <pre style={{ color: "#00d4ff", fontSize: 10, maxWidth: "80%", overflow: "auto" }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
