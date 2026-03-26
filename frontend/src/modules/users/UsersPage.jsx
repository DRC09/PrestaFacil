import { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from '../../services/api';
import { useAuth } from '../../app/AuthContext';

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'trabajador' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createUser(form);
      setForm({ username: '', email: '', password: '', role: 'trabajador' });
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear usuario');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar');
    }
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-5xl mb-4">🔒</p>
        <p className="text-lg">Solo los administradores pueden gestionar usuarios</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Usuarios</h1>
          <p className="text-slate-400 mt-1">{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Crear Usuario</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <input type="text" name="username" value={form.username} onChange={handleChange} required placeholder="Nombre de usuario"
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Email"
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Contraseña"
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
            <select name="role" value={form.role} onChange={handleChange}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
              <option value="trabajador">Trabajador</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="sm:col-span-2 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25">
              Crear Usuario
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                  {u.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{u.username}</h3>
                  <p className="text-slate-400 text-sm">{u.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {u.role}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => handleDelete(u.id)}
                  className="px-4 py-2 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 transition-colors text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
