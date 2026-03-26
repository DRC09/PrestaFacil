import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientDetail } from '../../services/api';

const formatCOP = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

const estadoBadge = (estado) => {
  const map = {
    activo: 'bg-blue-500/20 text-blue-400',
    completado: 'bg-emerald-500/20 text-emerald-400',
    cancelado: 'bg-red-500/20 text-red-400',
  };
  return map[estado] || 'bg-slate-500/20 text-slate-400';
};

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      const res = await getClientDetail(id);
      setClient(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;
  }

  if (!client) {
    return <div className="text-center text-slate-400 py-16"><p>Cliente no encontrado</p></div>;
  }

  return (
    <div>
      <button onClick={() => navigate('/clients')} className="text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center gap-2">
        ← Volver a clientes
      </button>

      {/* Client Info Card */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {client.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{client.nombre}</h1>
            <p className="text-slate-400">Doc: {client.documento}</p>
            <div className="flex gap-4 mt-2 flex-wrap">
              {client.telefono && (
                <>
                  <span className="text-slate-400 text-sm">📱 {client.telefono}</span>
                  <a href={`https://wa.me/57${client.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                     className="text-emerald-400 text-sm hover:underline">WhatsApp</a>
                  <a href={`tel:${client.telefono}`} className="text-blue-400 text-sm hover:underline">Llamar</a>
                </>
              )}
            </div>
            {client.direccion && <p className="text-slate-400 text-sm mt-1">📍 {client.direccion}</p>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/clients/${id}/edit`)}
              className="px-4 py-2 bg-amber-600/20 text-amber-400 rounded-xl hover:bg-amber-600/30 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => navigate(`/loans/new?client_id=${id}`)}
              className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-colors"
            >
              + Préstamo
            </button>
          </div>
        </div>
      </div>

      {/* Loans */}
      <h2 className="text-xl font-bold text-white mb-4">Historial de Préstamos ({client.loans?.length || 0})</h2>
      {client.loans?.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <p>No tiene préstamos registrados</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {client.loans?.map((loan) => (
            <div
              key={loan.id}
              onClick={() => navigate(`/loans/${loan.id}`)}
              className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/30 transition-all cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoBadge(loan.estado)}`}>
                      {loan.estado}
                    </span>
                    <span className="text-slate-400 text-sm">{loan.frecuencia}</span>
                  </div>
                  <p className="text-white font-semibold">{formatCOP(loan.monto)} → {formatCOP(loan.total_pagar)}</p>
                  <p className="text-slate-400 text-sm">{loan.numero_cuotas} cuotas · {loan.interes}% interés</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Inicio</p>
                  <p className="text-white">{loan.fecha_inicio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
