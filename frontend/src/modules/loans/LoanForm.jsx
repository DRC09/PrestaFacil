import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getClients, createLoan } from '../../services/api';

export default function LoanForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client_id');

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    client_id: preselectedClientId || '',
    monto: '',
    interes: '',
    numero_cuotas: '',
    frecuencia: 'diario',
    fecha_inicio: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const res = await getClients({});
      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calcTotal = () => {
    const monto = parseFloat(form.monto) || 0;
    const interes = parseFloat(form.interes) || 0;
    return monto + (monto * interes / 100);
  };

  const calcCuota = () => {
    const total = calcTotal();
    const cuotas = parseInt(form.numero_cuotas) || 1;
    return total / cuotas;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        client_id: parseInt(form.client_id),
        monto: parseFloat(form.monto),
        interes: parseFloat(form.interes),
        numero_cuotas: parseInt(form.numero_cuotas),
        frecuencia: form.frecuencia,
        fecha_inicio: form.fecha_inicio,
      };
      await createLoan(payload);
      navigate('/loans');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear préstamo');
    } finally {
      setLoading(false);
    }
  };

  const formatCOP = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Nuevo Préstamo</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Cliente *</label>
          <select
            name="client_id"
            value={form.client_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          >
            <option value="">Seleccionar cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} - {c.documento}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Monto (COP) *</label>
            <input
              type="number"
              name="monto"
              value={form.monto}
              onChange={handleChange}
              required
              min="1000"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="100000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Interés (%) *</label>
            <input
              type="number"
              name="interes"
              value={form.interes}
              onChange={handleChange}
              required
              min="0"
              step="0.1"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Número de Cuotas *</label>
            <input
              type="number"
              name="numero_cuotas"
              value={form.numero_cuotas}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Frecuencia *</label>
            <select
              name="frecuencia"
              value={form.frecuencia}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Fecha de Inicio *</label>
          <input
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>

        {/* Preview */}
        {form.monto && form.interes && form.numero_cuotas && (
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">📊 Resumen del Préstamo</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-400">Capital</p>
                <p className="text-lg font-bold text-white">{formatCOP(parseFloat(form.monto) || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total a Pagar</p>
                <p className="text-lg font-bold text-emerald-400">{formatCOP(calcTotal())}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Valor Cuota</p>
                <p className="text-lg font-bold text-blue-400">{formatCOP(calcCuota())}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Préstamo'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/loans')}
            className="px-6 py-3 bg-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/50 transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
