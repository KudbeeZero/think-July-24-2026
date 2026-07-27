import React, { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, RotateCcw, AlertTriangle, Cpu } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class WorkspaceRecoveryBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[WorkspaceRecoveryBoundary] Catastrophic state intercept:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleHardReload = () => {
    window.location.reload();
  };

  render() {
    const s = this.state as State;
    const p = this.props as Props;

    if (s.hasError) {
      return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-6 font-mono text-emerald-500">
          <div className="w-full max-w-lg bg-zinc-950 border border-emerald-900 rounded-lg p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="flex items-center gap-3 border-b border-emerald-900 pb-4 mb-4">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
                TERMINAL SAFETY PERIMETER: INTERCEPT ACTIVE
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="text-[10px] text-emerald-700">
                [KERNEL_EXCEPTION_LOGGED] {new Date().toISOString()}
              </div>
              <div className="text-xs bg-black p-3 rounded border border-emerald-900 overflow-x-auto">
                <span className="text-red-500 font-bold">ERROR:</span> {s.error?.toString()}
              </div>
              
              <p className="text-xs text-emerald-400 leading-relaxed">
                The KUD-THINK unbreakable kernel has protected state integrity by isolating 
                the corrupted workspace frame.
              </p>
            </div>

            <button
              onClick={this.handleRetry}
              className="mt-6 w-full py-2 bg-emerald-900/30 border border-emerald-700 hover:bg-emerald-800/40 text-emerald-400 text-xs uppercase tracking-wider font-bold transition-colors"
            >
              Initialize Workspace Recovery
            </button>
          </div>
        </div>
      );
    }

    return p.children;
  }
}
