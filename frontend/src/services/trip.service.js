import api from './api';

export const getTrips = async (params = {}) => {
  const { data } = await api.get('/trips', { params });
  return data;
};

export const getTripById = async (id) => {
  const { data } = await api.get(`/trips/${id}`);
  return data;
};

export const createTrip = async (payload) => {
  const { data } = await api.post('/trips', payload);
  return data;
};

export const updateTrip = async (id, payload) => {
  const { data } = await api.put(`/trips/${id}`, payload);
  return data;
};

export const deleteTrip = async (id) => {
  const { data } = await api.delete(`/trips/${id}`);
  return data;
};

export const dispatchTrip = async (id) => {
  const { data } = await api.post(`/trips/${id}/dispatch`);
  return data;
};

export const completeTrip = async (id) => {
  const { data } = await api.post(`/trips/${id}/complete`);
  return data;
};

export const cancelTrip = async (id) => {
  const { data } = await api.post(`/trips/${id}/cancel`);
  return data;
};
