import { api } from './axios';

// Route'un /categories olduğunu varsaydım, categoryRoutes'a göre ayarla
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};