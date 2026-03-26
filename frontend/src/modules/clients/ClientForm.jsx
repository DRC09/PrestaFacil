import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClient, createClient, updateClient } from '../../services/api';

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    direccion: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      const res = await getClient(id);
      setForm({
        nombre: res.data.nombre || '',
        documento: res.data.documento || '',
        telefono: res.data.telefono || '',
        direccion: res.data.direccion || '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await updateClient(id, form);
      } else {
        await createClient(form);
      }
      navigate('/clients');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">
        {isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Nombre completo *</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="Nombre del cliente"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Documento *</label>
          <input
            type="text"
            name="documento"
            value={form.documento}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="Cédula o NIT"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="3001234567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Dirección</label>
          <input
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="Dirección del cliente"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Cliente'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="px-6 py-3 bg-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/50 transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
