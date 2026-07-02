'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-lavender flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-8 max-w-md text-center space-y-4">
            <span className="text-5xl block">😵</span>
            <h2 className="text-xl font-extrabold text-purple-ink">Something went wrong</h2>
            <p className="text-gray-500 text-sm">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-mid text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-dark transition-colors cursor-pointer"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
