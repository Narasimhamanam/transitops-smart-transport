import api from './api';

export const getVehicles = async (params = {}) => {
  const { data } = await api.get('/vehicles', { params });
  return data;
};

export const getVehicleById = async (id) => {
  const { data } = await api.get(`/vehicles/${id}`);
  return data;
};

export const createVehicle = async (payload) => {
  const { data } = await api.post('/vehicles', payload);
  return data;
};

export const updateVehicle = async (id, payload) => {
  const { data } = await api.put(`/vehicles/${id}`, payload);
  return data;
};

export const deleteVehicle = async (id) => {
  const { data } = await api.delete(`/vehicles/${id}`);
  return data;
};
