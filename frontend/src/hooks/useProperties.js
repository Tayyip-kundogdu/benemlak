import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFilteredProperties,
  getPropertyBySlug,
  getPropertyById,
  getFeaturedProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../api/properties';

// Query Keys Constants
export const PROPERTY_KEYS = {
  all: ['properties'],
  lists: () => [...PROPERTY_KEYS.all, 'list'],
  list: (filters) => [...PROPERTY_KEYS.lists(), filters],
  featured: (limit) => [...PROPERTY_KEYS.all, 'featured', limit],
  details: () => [...PROPERTY_KEYS.all, 'detail'],
  detail: (slugOrId) => [...PROPERTY_KEYS.details(), slugOrId],
};

// 1. Tüm veya filtrelenmiş ilanları getiren Hook (getFilteredProperties ile uyumlu)
export const useProperties = (filters = {}) => {
  return useQuery({
    queryKey: PROPERTY_KEYS.list(filters),
    queryFn: () => getFilteredProperties(filters),
    staleTime: 1000 * 60 * 5, // 5 dakika cache taze tutulur
  });
};

// 2. Öne çıkan ilanları getiren Hook
export const useFeaturedProperties = (limit = 6) => {
  return useQuery({
    queryKey: PROPERTY_KEYS.featured(limit),
    queryFn: () => getFeaturedProperties(limit),
    staleTime: 1000 * 60 * 5,
  });
};

// 3. Tek bir ilanın detayını Slug ile getiren Hook
export const usePropertyDetailBySlug = (slug) => {
  return useQuery({
    queryKey: PROPERTY_KEYS.detail(slug),
    queryFn: () => getPropertyBySlug(slug),
    enabled: !!slug,
  });
};

// 4. Tek bir ilanın detayını ID ile getiren Hook
export const usePropertyDetailById = (id) => {
  return useQuery({
    queryKey: PROPERTY_KEYS.detail(id),
    queryFn: () => getPropertyById(id),
    enabled: !!id,
  });
};

// 5. Yeni ilan ekleme Mutation Hook'u (Protected - Danışman)
export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyData) => createProperty(propertyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
    },
  });
};

// 6. İlan güncelleme Mutation Hook'u (Protected - Danışman)
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProperty(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(id) });
    },
  });
};

// 7. İlan silme Mutation Hook'u (Protected - Danışman)
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
    },
  });
};