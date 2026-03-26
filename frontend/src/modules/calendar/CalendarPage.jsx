import { useState, useEffect } from 'react';
import { getCalendarInstallments } from '../../services/api';

const formatCOP = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [installments, setInstallments] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstallments();
  }, [currentDate]);

  const loadInstallments = async () => {
    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    try {
      const res = await getCalendarInstallments(startDate, endDate);
      setInstallments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getInstallmentsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return installments.filter((i) => i.fecha_pago === dateStr);
  };

  const getDayColor = (day) => {
    const dayInstallments = getInstallmentsForDay(day);
    if (dayInstallments.length === 0) return '';
    const hasOverdue = dayInstallments.some((i) => i.estado === 'vencida' || (i.estado === 'pendiente' && i.fecha_pago < today));
    const allPaid = dayInstallments.every((i) => i.estado === 'pagada');
    if (allPaid) return 'bg-emerald-500/20 border-emerald-500/40';
    if (hasOverdue) return 'bg-red-500/20 border-red-500/40';
    return 'bg-amber-500/20 border-amber-500/40';
  };

  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedInstallments = selectedDay ? getInstallmentsForDay(selectedDay) : [];

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Calendario de Cuotas</h1>
        <p className="text-slate-400 mt-1">Vista mensual de pagos programados</p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-emerald-500/30 border border-emerald-500/50" />
          <span className="text-sm text-slate-400">Pagada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-amber-500/30 border border-amber-500/50" />
          <span className="text-sm text-slate-400">Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-red-500/30 border border-red-500/50" />
          <span className="text-sm text-slate-400">Vencida</span>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50">
            ← Anterior
          </button>
          <h2 className="text-xl font-bold text-white">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50">
            Siguiente →
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : (
          <>
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;
                const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const color = getDayColor(day);
                const isToday = dayStr === today;
                const dayInsts = getInstallmentsForDay(day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                    className={`relative p-2 h-16 sm:h-20 rounded-xl border text-sm transition-all hover:scale-105 ${
                      color || 'border-slate-700/30 hover:border-slate-600/50'
                    } ${isToday ? 'ring-2 ring-blue-500/50' : ''} ${selectedDay === day ? 'ring-2 ring-white/50' : ''}`}
                  >
                    <span className={`font-medium ${isToday ? 'text-blue-400' : 'text-white'}`}>{day}</span>
                    {dayInsts.length > 0 && (
                      <span className="absolute bottom-1 right-1 text-xs text-slate-400">{dayInsts.length}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Selected day detail */}
      {selectedDay && selectedInstallments.length > 0 && (
        <div className="mt-6 bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Cuotas del {selectedDay} de {MONTHS[month]}
          </h3>
          <div className="space-y-3">
            {selectedInstallments.map((inst) => {
              const isOverdue = inst.estado === 'pendiente' && inst.fecha_pago < today;
              return (
                <div key={inst.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-700/30">
                  <div>
                    <p className="text-white font-medium">{inst.client_nombre}</p>
                    <p className="text-slate-400 text-sm">Cuota #{inst.numero_cuota} · {formatCOP(inst.valor)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    inst.estado === 'pagada' ? 'bg-emerald-500/20 text-emerald-400' :
                    isOverdue ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {inst.estado === 'pagada' ? '✅ Pagada' : isOverdue ? '🔴 Vencida' : '⏳ Pendiente'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
