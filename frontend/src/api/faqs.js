import { api } from './axios';

// Ziyaretçiler için aktif SSS sorularını getir (Public)
export const getActiveFaqs = async () => {
  const response = await api.get('/faqs');
  return response.data;
};

// Yeni SSS sorusu oluştur (Danışman Yetkisi Gerektirir)
// Payload: { question, answer, order?, isActive? }
export const createFaq = async (faqData) => {
  const response = await api.post('/faqs', faqData);
  return response.data;
};

// Mevcut SSS sorusunu güncelle (Danışman Yetkisi Gerektirir)
export const updateFaq = async (id, faqData) => {
  const response = await api.put(`/faqs/${id}`, faqData);
  return response.data;
};

// SSS sorusunu sil (Danışman Yetkisi Gerektirir)
export const deleteFaq = async (id) => {
  const response = await api.delete(`/faqs/${id}`);
  return response.data;
};