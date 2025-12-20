import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-genesis-soft p-8">
      <div className="max-w-md text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-genesis-dark mb-2">
          Algo deu errado
        </h1>
        <p className="text-genesis-medium mb-6">
          {error.message || 'Erro inesperado na aplicação.'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="inline-flex items-center gap-2 px-6 py-3 bg-genesis-dark text-white rounded-xl font-medium hover:bg-black transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
