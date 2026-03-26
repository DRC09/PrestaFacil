import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLoan, payInstallment, unpayInstallment } from '../../services/api';

const formatCOP = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

const estadoStyles = {
  pagada: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: '✅ Pagada' },
  pendiente: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: '⏳ Pendiente' },
  vencida: { bg: 'bg-red-500/20', text: 'text-red-400', label: '🔴 Vencida' },
};

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoan();
  }, [id]);

  const loadLoan = async () => {
    try {
      const res = await getLoan(id);
      setLoan(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (instId) => {
    try {
      await payInstallment(instId);
      loadLoan();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    }
  };

  const handleUnpay = async (instId) => {
    try {
      await unpayInstallment(instId);
      loadLoan();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>;
  }

  if (!loan) {
    return <div className="text-center text-slate-400 py-16"><p>Préstamo no encontrado</p></div>;
  }

  const paid = loan.installments?.filter(i => i.estado === 'pagada').length || 0;
  const total = loan.installments?.length || 0;
  const progress = total > 0 ? (paid / total) * 100 : 0;

  const estadoBadge = (estado) => {
    const map = { activo: 'bg-blue-500/20 text-blue-400', completado: 'bg-emerald-500/20 text-emerald-400', cancelado: 'bg-red-500/20 text-red-400' };
    return map[estado] || 'bg-slate-500/20 text-slate-400';
  };

  return (
    <div>
      <button onClick={() => navigate('/loans')} className="text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center gap-2">
        ← Volver a préstamos
      </button>

      {/* Loan Info */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{loan.client_nombre}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoBadge(loan.estado)}`}>
                {loan.estado}
              </span>
            </div>
            {loan.client_telefono && (
              <div className="flex gap-3">
                <a href={`https://wa.me/57${loan.client_telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                   className="text-emerald-400 text-sm hover:underline">WhatsApp</a>
                <a href={`tel:${loan.client_telefono}`} className="text-blue-400 text-sm hover:underline">Llamar</a>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-700/30 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400">Capital</p>
            <p className="text-lg font-bold text-white">{formatCOP(loan.monto)}</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400">Total a Pagar</p>
            <p className="text-lg font-bold text-emerald-400">{formatCOP(loan.total_pagar)}</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400">Interés</p>
            <p className="text-lg font-bold text-amber-400">{loan.interes}%</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400">Frecuencia</p>
            <p className="text-lg font-bold text-blue-400 capitalize">{loan.frecuencia}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Progreso: {paid}/{total} cuotas</span>
            <span className="text-white font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Installments */}
      <h2 className="text-xl font-bold text-white mb-4">Cuotas ({total})</h2>
      <div className="space-y-3">
        {loan.installments?.map((inst) => {
          const style = estadoStyles[inst.estado] || estadoStyles.pendiente;
          const today = new Date().toISOString().split('T')[0];
          const isOverdue = inst.estado === 'pendiente' && inst.fecha_pago < today;

          return (
            <div
              key={inst.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                inst.estado === 'pagada'
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : isOverdue
                  ? 'bg-red-500/5 border-red-500/20'
                  : 'bg-slate-800/80 border-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-sm font-bold text-white">
                  {inst.numero_cuota}
                </div>
                <div>
                  <p className="text-white font-medium">{formatCOP(inst.valor)}</p>
                  <p className="text-slate-400 text-sm">
                    Vence: {inst.fecha_pago}
                    {inst.fecha_pago_real && <span className="text-emerald-400"> · Pagada: {inst.fecha_pago_real}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                  {isOverdue && inst.estado === 'pendiente' ? '🔴 Vencida' : style.label}
                </span>
                {inst.estado !== 'pagada' ? (
                  <button
                    onClick={() => handlePay(inst.id)}
                    className="px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-xl hover:bg-emerald-600/30 transition-colors text-sm font-medium"
                  >
                    Marcar Pagada
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnpay(inst.id)}
                    className="px-4 py-2 bg-slate-700/50 text-slate-400 rounded-xl hover:bg-slate-600/50 transition-colors text-sm"
                  >
                    Desmarcar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
