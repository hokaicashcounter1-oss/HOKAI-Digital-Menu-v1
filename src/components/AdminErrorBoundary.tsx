import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRefreshData?: () => void;
  onExitAdmin?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class AdminErrorBoundary extends React.Component<Props, State> {
  state: State;
  props: Props;
  setState!: (state: Partial<State> | ((prevState: State) => Partial<State>), callback?: () => void) => void;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AdminErrorBoundary] Uncaught Error in Admin Panel:', error, errorInfo);
    if (typeof this.setState === 'function') {
      this.setState({ errorInfo });
    }
  }

  public handleReset = () => {
    if (typeof this.setState === 'function') {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
    if (this.props.onRefreshData) {
      this.props.onRefreshData();
    }
  };

  public render() {
    if (this.state && this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center p-6 relative">
          <div className="max-w-md w-full bg-[#121212] border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-display tracking-wide text-white">
                Unable to load admin panel. Please try again.
              </h2>
              <p className="text-xs text-white/60 font-sans leading-relaxed">
                An unexpected error occurred while rendering the management interface. All error details have been logged to the browser console.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/60 rounded-xl border border-white/5 text-left text-[11px] font-mono text-red-300/90 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Loading Admin Panel
              </button>

              {this.props.onExitAdmin && (
                <button
                  onClick={this.props.onExitAdmin}
                  className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white/80 font-bold uppercase tracking-wider text-xs rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
                  Return to Public Menu
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
