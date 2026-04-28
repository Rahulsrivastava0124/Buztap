import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Keep console logs for debugging crash context in dev/prod logs.
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onReset === "function") {
      this.props.onReset();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            Something went wrong
          </p>
          <h2 className="mt-2 text-xl font-bold text-ink">
            Unable to load menu page
          </h2>
          <p className="mt-2 text-sm text-muted leading-6">
            The restaurant menu hit an unexpected issue. Please retry.
          </p>

          {this.state.error?.message ? (
            <p className="mt-3 text-xs text-error wrap-break-word">
              Error: {this.state.error.message}
            </p>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="flex-1 px-3 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-paper"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 px-3 py-2 rounded-lg bg-saffron text-white text-sm font-semibold hover:bg-saffron2"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
