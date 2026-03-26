import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoans, deleteLoan } from '../../services/api';

const formatCOP = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

const estadoBadge = (estado) => {
  const map = {
    activo: 'bg-blue-500/20 text-blue-400',
    completado: 'bg-emerald-500/20 text-emerald-400',
    cancelado: 'bg-red-500/20 text-red-400',
  };
  return map[estado] || 'bg-slate-500/20 text-slate-400';
};

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLoans();
  }, [filter]);

  const loadLoans = async () => {
    try {
      const res = await getLoans({ estado: filter || undefined });
      setLoans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este préstamo y todas sus cuotas?')) return;
    try {
      await deleteLoan(id);
      loadLoans();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Préstamos</h1>
          <p className="text-slate-400 mt-1">{loans.length} préstamos</p>
        </div>
        <button
          onClick={() => navigate('/loans/new')}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
        >
          + Nuevo Préstamo
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'activo', 'completado', 'cancelado'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700/50 hover:border-slate-600/50'
            }`}
          >
            {f === '' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-5xl mb-4">💰</p>
          <p className="text-lg">No hay préstamos registrados</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoBadge(loan.estado)}`}>
                      {loan.estado}
                    </span>
                    <span className="text-slate-400 text-sm capitalize">{loan.frecuencia}</span>
                  </div>
                  <p className="text-white font-semibold text-lg mb-1">
                    {loan.client_nombre || `Cliente #${loan.client_id}`}
                  </p>
                  <p className="text-slate-300">
                    Capital: {formatCOP(loan.monto)} → Total: {formatCOP(loan.total_pagar)}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    {loan.numero_cuotas} cuotas · {loan.interes}% interés · Inicio: {loan.fecha_inicio}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/loans/${loan.id}`)}
                    className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 transition-colors text-sm"
                  >
                    Ver Cuotas
                  </button>
                  <button
                    onClick={() => handleDelete(loan.id)}
                    className="px-4 py-2 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 transition-colors text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
