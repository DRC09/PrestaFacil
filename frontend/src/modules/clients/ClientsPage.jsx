import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients, deleteClient } from '../../services/api';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, [search]);

  const loadClients = async () => {
    try {
      const res = await getClients({ search: search || undefined });
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      await deleteClient(id);
      loadClients();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Clientes</h1>
          <p className="text-slate-400 mt-1">{clients.length} clientes registrados</p>
        </div>
        <button
          onClick={() => navigate('/clients/new')}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-5xl mb-4">👤</p>
          <p className="text-lg">No hay clientes registrados</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {client.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{client.nombre}</h3>
                    <p className="text-slate-400 text-sm">Doc: {client.documento}</p>
                    {client.telefono && (
                      <p className="text-slate-400 text-sm">📱 {client.telefono}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {client.telefono && (
                    <>
                      <a
                        href={`https://wa.me/57${client.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 text-sm rounded-lg hover:bg-emerald-600/30 transition-colors"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${client.telefono}`}
                        className="px-3 py-1.5 bg-blue-600/20 text-blue-400 text-sm rounded-lg hover:bg-blue-600/30 transition-colors"
                      >
                        Llamar
                      </a>
                    </>
                  )}
                  <button
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="px-3 py-1.5 bg-slate-700/50 text-slate-300 text-sm rounded-lg hover:bg-slate-600/50 transition-colors"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => navigate(`/clients/${client.id}/edit`)}
                    className="px-3 py-1.5 bg-amber-600/20 text-amber-400 text-sm rounded-lg hover:bg-amber-600/30 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="px-3 py-1.5 bg-red-600/20 text-red-400 text-sm rounded-lg hover:bg-red-600/30 transition-colors"
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
