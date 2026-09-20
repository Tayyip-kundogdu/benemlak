import { api } from './axios';

// 1️⃣ Ziyaretçilerin İletişim / Teklif Formu Göndermesi (Public)
export const createLead = async (leadData) => {
  const response = await api.post('/leads', leadData);
  return response.data;
};

// 2️⃣ Danışman Paneli İçin Tüm Müşteri Taleplerini Getir (Protected - Admin)
export const getLeads = async (params = {}) => {
  const response = await api.get('/leads', { params });
  return response.data;
};

// 3️⃣ Talebin Durumunu Güncelle ('new' -> 'contacted' -> 'closed') (Protected - Admin)
export const updateLeadStatus = async (id, status) => {
  const response = await api.patch(`/leads/${id}/status`, { status });
  return response.data;
};

// 4️⃣ Talebi / Mesajı Sil (Protected - Admin)
export const deleteLead = async (id) => {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
};