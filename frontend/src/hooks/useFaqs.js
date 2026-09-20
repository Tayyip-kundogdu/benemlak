import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getActiveFaqs,
  getAllFaqs, // 1. Bütün SSS'leri getiren API fonksiyonu eklendi
  createFaq,
  updateFaq,
  deleteFaq,
} from '../api/faqs';

// Query Keys Constants
export const FAQ_KEYS = {
  all: ['faqs'],
  lists: () => [...FAQ_KEYS.all, 'list'],
  list: (filters) => [...FAQ_KEYS.lists(), filters],
  adminLists: () => [...FAQ_KEYS.all, 'admin-list'],
  adminList: (filters) => [...FAQ_KEYS.adminLists(), filters],
};

// 1. Ziyaretçiler İçin: SSS listesini getiren Hook (Sadece aktif olanlar)
export const useFaqs = (filters = {}) => {
  return useQuery({
    queryKey: FAQ_KEYS.list(filters),
    queryFn: () => getActiveFaqs(),
    staleTime: 1000 * 60 * 10, // SSS verileri 10 dakika taze tutulur
  });
};

// 2. Admin Paneli İçin: Tüm SSS listesini getiren Hook (Aktif + Pasif hepsi)
export const useAdminFaqs = (filters = {}) => {
  return useQuery({
    queryKey: FAQ_KEYS.adminList(filters),
    queryFn: () => getAllFaqs(),
  });
};

// 3. Yeni SSS ekleme Mutation Hook'u (Protected - Sadece Danışman)
export const useCreateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (faqData) => createFaq(faqData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAQ_KEYS.all });
    },
  });
};

// 4. SSS güncelleme Mutation Hook'u (Protected - Sadece Danışman)
export const useUpdateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateFaq(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAQ_KEYS.all });
    },
  });
};

// 5. SSS silme Mutation Hook'u (Protected - Sadece Danışman)
export const useDeleteFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAQ_KEYS.all });
    },
  });
};