import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-[#111] border border-red-500/20 rounded-2xl p-8 text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 bg-red-500/10 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
                            <p className="text-gray-400 text-sm">
                                We apologize for the inconvenience. Please try refreshing the page.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="text-left bg-black/50 p-4 rounded-lg border border-white/5 overflow-auto max-h-32">
                                <p className="text-red-400 font-mono text-xs break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
