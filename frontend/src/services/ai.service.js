import api from './api';

export const getAIInsights = async () => {
  const { data } = await api.get('/ai/insights');
  return data;
};
