import React from 'react';

// Catches render errors in the route tree so a single page crash
// does not blank out the whole app.
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('Route crashed:', error, info);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black flex items-center justify-center p-8 font-mono">
                    <div className="max-w-md w-full border border-red-500/30 bg-red-950/10 p-8 text-center">
                        <div className="text-red-500 text-xs uppercase tracking-[0.3em] mb-4">System Error</div>
                        <h1 className="text-white font-black text-2xl mb-3">Something went wrong</h1>
                        <p className="text-gray-500 text-sm mb-6 break-words">
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="px-6 py-3 bg-cyan-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors rounded-md"
                        >
                            Reload System
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
