import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './app/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './modules/login/LoginPage';
import DashboardPage from './modules/dashboard/DashboardPage';
import ClientsPage from './modules/clients/ClientsPage';
import ClientForm from './modules/clients/ClientForm';
import ClientDetail from './modules/clients/ClientDetail';
import LoansPage from './modules/loans/LoansPage';
import LoanForm from './modules/loans/LoanForm';
import LoanDetail from './modules/loans/LoanDetail';
import CalendarPage from './modules/calendar/CalendarPage';
import UsersPage from './modules/users/UsersPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/new" element={<ClientForm />} />
        <Route path="clients/:id/edit" element={<ClientForm />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="loans" element={<LoansPage />} />
        <Route path="loans/new" element={<LoanForm />} />
        <Route path="loans/:id" element={<LoanDetail />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
