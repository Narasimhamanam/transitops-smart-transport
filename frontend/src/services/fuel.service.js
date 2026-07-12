import api from './api';

export const getFuelLogs = async (params = {}) => {
  const { data } = await api.get('/fuel-logs', { params });
  return data;
};

export const getFuelLogById = async (id) => {
  const { data } = await api.get(`/fuel-logs/${id}`);
  return data;
};

export const createFuelLog = async (payload) => {
  const { data } = await api.post('/fuel-logs', payload);
  return data;
};

export const updateFuelLog = async (id, payload) => {
  const { data } = await api.put(`/fuel-logs/${id}`, payload);
  return data;
};

export const deleteFuelLog = async (id) => {
  const { data } = await api.delete(`/fuel-logs/${id}`);
  return data;
};
