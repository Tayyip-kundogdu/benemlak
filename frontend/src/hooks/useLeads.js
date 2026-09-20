import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createLead,
  getLeads,
  updateLeadStatus,
  deleteLead,
} from '../api/leads';

// Query Keys Constants
export const LEAD_KEYS = {
  all: ['leads'],
  lists: () => [...LEAD_KEYS.all, 'list'],
  list: (filters) => [...LEAD_KEYS.lists(), filters],
};

// 1. Ziyaretçi iletişim / teklif formu gönderme Hook'u (Public)
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadData) => createLead(leadData),
    onSuccess: () => {
      // Danışman paneli açık ise yeni gelen mesajı anında listeye yansıt
      queryClient.invalidateQueries({ queryKey: LEAD_KEYS.all });
    },
  });
};

// 2. Danışman paneli için tüm müşteri taleplerini getiren Hook (Protected - Admin)
export const useLeads = (filters = {}) => {
  return useQuery({
    queryKey: LEAD_KEYS.list(filters),
    queryFn: () => getLeads(filters),
    staleTime: 1000 * 60 * 2, // 2 dakika boyunca taze kabul edilir
  });
};

// 3. Lead durumunu ('new', 'contacted', 'closed') güncelleme Mutation Hook'u (Protected - Admin)
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAD_KEYS.all });
    },
  });
};

// 4. Lead silme Mutation Hook'u (Protected - Admin)
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAD_KEYS.all });
    },
  });
};