import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppFallback extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">App Error</h1>
            <p className="text-gray-700 mb-4">
              Something went wrong while loading the application.
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-gray-600">
                Error Details
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 