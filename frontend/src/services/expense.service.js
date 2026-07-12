import api from './api';

export const getExpenses = async (params = {}) => {
  const { data } = await api.get('/expenses', { params });
  return data;
};

export const getExpenseById = async (id) => {
  const { data } = await api.get(`/expenses/${id}`);
  return data;
};

export const createExpense = async (payload) => {
  const { data } = await api.post('/expenses', payload);
  return data;
};

export const updateExpense = async (id, payload) => {
  const { data } = await api.put(`/expenses/${id}`, payload);
  return data;
};

export const deleteExpense = async (id) => {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
};
