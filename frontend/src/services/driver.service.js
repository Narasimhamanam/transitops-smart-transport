import api from './api';

export const getDrivers = async (params = {}) => {
  const { data } = await api.get('/drivers', { params });
  return data;
};

export const getDriverById = async (id) => {
  const { data } = await api.get(`/drivers/${id}`);
  return data;
};

export const createDriver = async (payload) => {
  const { data } = await api.post('/drivers', payload);
  return data;
};

export const updateDriver = async (id, payload) => {
  const { data } = await api.put(`/drivers/${id}`, payload);
  return data;
};

export const deleteDriver = async (id) => {
  const { data } = await api.delete(`/drivers/${id}`);
  return data;
};
