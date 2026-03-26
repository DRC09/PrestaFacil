import { useState, useEffect } from 'react';
import { getDashboard } from '../../services/api';

const formatCOP = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Prestado',
      value: formatCOP(data?.total_prestado || 0),
      icon: '💰',
      gradient: 'from-blue-600 to-blue-400',
      shadow: 'shadow-blue-500/20',
    },
    {
      title: 'Total Recuperado',
      value: formatCOP(data?.total_recuperado || 0),
      icon: '✅',
      gradient: 'from-emerald-600 to-emerald-400',
      shadow: 'shadow-emerald-500/20',
    },
    {
      title: 'Ganancia',
      value: formatCOP(data?.ganancia || 0),
      icon: '📈',
      gradient: 'from-purple-600 to-purple-400',
      shadow: 'shadow-purple-500/20',
    },
    {
      title: 'Deuda Pendiente',
      value: formatCOP(data?.deuda_pendiente || 0),
      icon: '⏳',
      gradient: 'from-amber-600 to-amber-400',
      shadow: 'shadow-amber-500/20',
    },
    {
      title: 'Clientes',
      value: data?.total_clientes || 0,
      icon: '👥',
      gradient: 'from-cyan-600 to-cyan-400',
      shadow: 'shadow-cyan-500/20',
    },
    {
      title: 'Préstamos Activos',
      value: data?.prestamos_activos || 0,
      icon: '📋',
      gradient: 'from-rose-600 to-rose-400',
      shadow: 'shadow-rose-500/20',
    },
    {
      title: 'Préstamos Completados',
      value: data?.prestamos_completados || 0,
      icon: '🏁',
      gradient: 'from-teal-600 to-teal-400',
      shadow: 'shadow-teal-500/20',
    },
    {
      title: 'Cuotas Vencidas',
      value: data?.cuotas_vencidas || 0,
      icon: '🔴',
      gradient: 'from-red-600 to-red-400',
      shadow: 'shadow-red-500/20',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl bg-slate-800/80 border border-slate-700/50 p-6 hover:scale-[1.02] transition-all duration-300 shadow-lg ${card.shadow}`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full -translate-y-6 translate-x-6`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{card.icon}</span>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.gradient}`} />
              </div>
              <p className="text-sm text-slate-400 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
