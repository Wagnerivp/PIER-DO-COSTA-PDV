// @ts-nocheck
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleResetData = () => {
      localStorage.removeItem('pier_pdv_data');
      window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Ocorreu um erro no aplicativo</h1>
          <div className="bg-black/50 p-6 rounded-lg max-w-2xl w-full text-left overflow-auto border border-red-500/20 mb-8">
              <p className="text-red-400 font-mono mb-4">{this.state.error && this.state.error.toString()}</p>
              <pre className="text-slate-400 text-xs font-mono whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack}
              </pre>
          </div>
          <p className="mb-8 text-slate-300">Se o problema persistir, você pode tentar limpar os dados locais do aplicativo (isso apagará o progresso não salvo).</p>
          <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-pier-neon text-pier-900 px-6 py-3 rounded-lg font-bold"
              >
                Recarregar Página
              </button>
              <button
                onClick={this.handleResetData}
                className="bg-red-500/20 text-red-400 border border-red-500/50 px-6 py-3 rounded-lg font-bold hover:bg-red-500 hover:text-white"
              >
                Limpar Dados Locais
              </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
