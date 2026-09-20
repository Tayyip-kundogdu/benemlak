import { api } from './axios';

// ---------- Sabitler (formdaki select'lerde de kullanılıyor) ----------
export const LISTING_TYPES = ['satilik', 'kiralik', 'sezonluk_kiralik', 'konut_projesi'];
export const PROPERTY_TYPES = ['daire', 'villa', 'müstakil_ev', 'arsa', 'isyeri', 'bina'];
export const CURRENCIES = ['TRY', 'USD', 'EUR'];

// ---------- Slug ----------
export const slugify = (text) => {
  if (!text) return '';
  const trMap = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i', 'ö': 'o',
    'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
  };
  return text
    .toString()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m])
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// slug unique olduğu için sonuna kısa bir ek koyuyoruz
const uniqueSlug = (title) =>
  `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;

// ---------- Payload temizleme ----------
const isEmpty = (v) =>
  v === undefined || v === null || v === '' || (typeof v === 'number' && Number.isNaN(v));

const toInt = (v) => {
  if (isEmpty(v)) return undefined;
  const n = Number(String(v).replace(/[^\d.-]/g, '').replace(/\.(?=.*\.)/g, ''));
  return Number.isNaN(n) ? undefined : Math.round(n);
};

const toFloat = (v) => {
  if (isEmpty(v)) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

const toStr = (v) => (isEmpty(v) ? undefined : String(v).trim() || undefined);

const stripEmpty = (obj) => {
  const out = Object.fromEntries(Object.entries(obj).filter(([, v]) => !isEmpty(v)));
  return Object.keys(out).length ? out : undefined;
};

export const buildPropertyPayload = (data, { isUpdate = false } = {}) => {
  const payload = {
    title: toStr(data.title),
    slug: toStr(data.slug) || (data.title ? uniqueSlug(data.title) : undefined),
    description: toStr(data.description),

    price: toInt(data.price),
    currency: data.currency || 'TRY',
    listingType: data.listingType,
    propertyType: data.propertyType,

    city: toStr(data.city),
    district: toStr(data.district),
    neighborhood: toStr(data.neighborhood),
    address: toStr(data.address),
    mapCoordinates:
      !isEmpty(data.mapCoordinates?.lat) && !isEmpty(data.mapCoordinates?.lng)
        ? { lat: Number(data.mapCoordinates.lat), lng: Number(data.mapCoordinates.lng) }
        : undefined,

    roomCount: toStr(data.roomCount),
    grossM2: toInt(data.grossM2),
    netM2: toInt(data.netM2),
    buildingAge: toInt(data.buildingAge),
    floorNumber: toInt(data.floorNumber),
    totalFloors: toInt(data.totalFloors),
    heatingType: toStr(data.heatingType),

    distances: stripEmpty({
      cityCenterKm: toFloat(data.distances?.cityCenterKm),
      seaMeters: toFloat(data.distances?.seaMeters),
      hospitalKm: toFloat(data.distances?.hospitalKm),
      airportKm: toFloat(data.distances?.airportKm),
      publicTransportMeters: toFloat(data.distances?.publicTransportMeters),
    }),

    features: Array.isArray(data.features) ? data.features.filter(Boolean) : [],

    coverImage: toStr(data.coverImage),
    images: Array.isArray(data.images) ? data.images.filter(Boolean) : [],
    isFeatured: Boolean(data.isFeatured),
    isActive: data.isActive === undefined ? true : Boolean(data.isActive),

    categoryId: toStr(data.categoryId),
    // userId GÖNDERME: backend Clerk token'dan alıyor
  };

  // Güncellemede slug verilmediyse mevcut slug'ı bozma
  if (isUpdate && !data.slug) delete payload.slug;

  return Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined));
};

// ---------- Hata mesajı yardımcısı ----------
export const getApiErrorMessage = (error) => {
  const d = error?.response?.data;
  if (!d) return error?.message || 'Bilinmeyen hata';
  if (typeof d === 'string') return d;
  return d.error || d.message || JSON.stringify(d);
};

// ---------- API çağrıları ----------

// 1️⃣ Tüm veya filtrelenmiş ilanlar (Public)
export const getFilteredProperties = async (filters = {}) => {
  const response = await api.get('/properties', { params: filters });
  return response.data;
};

// 2️⃣ Öne çıkan ilanlar (Public)
export const getFeaturedProperties = async (limit = 6) => {
  const response = await api.get('/properties/featured', { params: { limit } });
  return response.data;
};

// 3️⃣ Slug ile ilan detayı (Public)
export const getPropertyBySlug = async (slug) => {
  const response = await api.get(`/properties/slug/${slug}`);
  return response.data;
};

// 4️⃣ ID ile ilan detayı (Public)
export const getPropertyById = async (id) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

// 5️⃣ Yeni ilan oluştur (Protected)
export const createProperty = async (propertyData) => {
  const response = await api.post('/properties', buildPropertyPayload(propertyData));
  return response.data;
};

// 6️⃣ İlan güncelle (Protected)
export const updateProperty = async (id, propertyData) => {
  const response = await api.put(
    `/properties/${id}`,
    buildPropertyPayload(propertyData, { isUpdate: true })
  );
  return response.data;
};

// 7️⃣ İlan sil (Protected)
export const deleteProperty = async (id) => {
  const response = await api.delete(`/properties/${id}`);
  return response.data;
};