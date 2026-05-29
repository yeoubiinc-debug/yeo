import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = {
  hasError: boolean;
  errorMessage?: string;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    const msg = error instanceof Error ? error.message : String(error);
    return { hasError: true, errorMessage: msg };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("AppErrorBoundary caught:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="glass-strong rounded-2xl p-8 max-w-xl w-full text-center">
          <div className="text-2xl font-bold mb-3">Something went wrong</div>
          <div className="text-muted-foreground mb-4">
            The page failed to load correctly. Reload the page and try again.
          </div>
          {this.state.errorMessage ? (
            <pre className="text-left text-xs bg-muted/40 p-3 rounded-lg overflow-auto">
              {this.state.errorMessage}
            </pre>
          ) : null}
          <button
            className="mt-5 glass-btn-primary px-6 py-3 rounded-lg"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

