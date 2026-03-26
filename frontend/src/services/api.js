import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => {
  const formData = new URLSearchParams();
  formData.append('username', data.username);
  formData.append('password', data.password);
  return api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

// Users
export const getUsers = () => api.get('/users/');
export const createUser = (data) => api.post('/users/', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Clients
export const getClients = (params) => api.get('/clients/', { params });
export const getClient = (id) => api.get(`/clients/${id}`);
export const getClientDetail = (id) => api.get(`/clients/${id}/detail`);
export const createClient = (data) => api.post('/clients/', data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);

// Loans
export const getLoans = (params) => api.get('/loans/', { params });
export const getLoan = (id) => api.get(`/loans/${id}`);
export const createLoan = (data) => api.post('/loans/', data);
export const updateLoanStatus = (id, data) => api.put(`/loans/${id}/status`, data);
export const deleteLoan = (id) => api.delete(`/loans/${id}`);

// Installments
export const getInstallmentsByLoan = (loanId) => api.get(`/installments/loan/${loanId}`);
export const payInstallment = (id) => api.put(`/installments/${id}/pay`);
export const unpayInstallment = (id) => api.put(`/installments/${id}/unpay`);
export const getCalendarInstallments = (startDate, endDate) =>
  api.get('/installments/calendar', { params: { start_date: startDate, end_date: endDate } });
export const updateOverdue = () => api.post('/installments/update-overdue');

// Dashboard
export const getDashboard = () => api.get('/dashboard/');

export default api;
