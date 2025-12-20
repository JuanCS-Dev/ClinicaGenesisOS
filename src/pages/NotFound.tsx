import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-genesis-soft p-8">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-genesis-dark/10 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-genesis-dark mb-2">
          Pagina nao encontrada
        </h2>
        <p className="text-genesis-medium mb-8">
          A pagina que voce procura nao existe ou foi movida.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 text-genesis-dark hover:bg-white rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-genesis-dark text-white rounded-xl font-medium hover:bg-black transition-colors"
          >
            <Home className="w-4 h-4" /> Ir para Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
