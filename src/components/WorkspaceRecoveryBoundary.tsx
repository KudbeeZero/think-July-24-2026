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

// @ts-ignore - React error boundary inheritance
export class WorkspaceRecoveryBoundary extends (React.Component as any) {
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
        <div className="fixed inset-0 z-50 bg-[#090d13] text-zinc-100 flex flex-col items-center justify-center p-6 font-mono">
          <div className="max-w-xl w-full bg-[#161b22] border border-red-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Cpu className="w-32 h-32 text-red-500" />
            </div>

            <div className="flex items-center gap-3 mb-4 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-wide uppercase text-zinc-100">
                  Suboxone Terminal Safety Perimeter
                </h1>
                <p className="text-xs text-red-400">WorkspaceRecoveryBoundary Intercept Active</p>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-zinc-800 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 border-b border-zinc-800 pb-1.5">
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Kernel Exception Logged
                </span>
                <span className="text-[10px] text-zinc-500">{new Date().toISOString()}</span>
              </div>
              <pre className="text-xs text-red-300 font-mono overflow-x-auto whitespace-pre-wrap break-words">
                {s.error?.toString() || 'Unknown Kernel Corrupt State'}
              </pre>
              {s.errorInfo && (
                <div className="mt-3 pt-2 border-t border-zinc-800/80">
                  <p className="text-[10px] text-zinc-500 mb-1">Component Stack Trace:</p>
                  <pre className="text-[10px] text-zinc-400 font-mono max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {s.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              The KUD-THINK unbreakable kernel protected state integrity by isolating the corrupted workspace frame. Choose an action to restore state synchronization.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full sm:w-auto flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Workspace State
              </button>
              <button
                onClick={this.handleHardReload}
                className="w-full sm:w-auto flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-700 flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-zinc-400" />
                Hard Kernel Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return p.children;
  }
}
