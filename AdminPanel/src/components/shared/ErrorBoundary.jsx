import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * ErrorBoundary — catches render errors in any child tree and shows a
 * styled fallback instead of a blank page.
 *
 * Usage:
 *   <ErrorBoundary label="Finance">
 *     <FinanceTab />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error, info) {
    // Log to console in development; swap for a real logger in production
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, errorMessage: null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const label = this.props.label ?? "This section";

    return (
      <div className="flex flex-col items-center justify-center min-h-48 gap-4 p-8 bg-red-50 border border-red-100 rounded-xl text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <div>
          <p className="font-bold text-red-700 text-sm">
            {label} failed to render
          </p>
          <p className="text-xs text-red-500 mt-1 max-w-xs">
            {this.state.errorMessage}
          </p>
        </div>
        <button
          onClick={() => this.handleReset()}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          <RefreshCw size={13} /> Try again
        </button>
      </div>
    );
  }
}
