import api from './api';

export const getMaintenances = async (params = {}) => {
  const { data } = await api.get('/maintenances', { params });
  return data;
};

export const getMaintenanceById = async (id) => {
  const { data } = await api.get(`/maintenances/${id}`);
  return data;
};

export const createMaintenance = async (payload) => {
  const { data } = await api.post('/maintenances', payload);
  return data;
};

export const updateMaintenance = async (id, payload) => {
  const { data } = await api.put(`/maintenances/${id}`, payload);
  return data;
};

export const deleteMaintenance = async (id) => {
  const { data } = await api.delete(`/maintenances/${id}`);
  return data;
};
