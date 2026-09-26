import { api } from './axios';

// ---------- Sabitler ----------
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
  // Eğer gönderilen veri FormData ise temizlemeyi yapma, doğrudan FormData'yı döndür!
  if (data instanceof FormData) {
    return data;
  }

  const payload = {
    title: toStr(data.title),
    slug: toStr(data.slug) || (data.title ? uniqueSlug(data.title) : undefined),
    description: toStr(data.description),

    price: toInt(data.price),
    currency: data.currency || (isUpdate ? undefined : 'TRY'),
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

    features: Array.isArray(data.features)
      ? data.features.filter(Boolean)
      : isUpdate ? undefined : [],

    coverImage: toStr(data.coverImage),
    images: Array.isArray(data.images)
      ? data.images.filter(Boolean)
      : isUpdate ? undefined : [],
    isFeatured: Boolean(data.isFeatured),
    isActive:
      data.isActive === undefined
        ? (isUpdate ? undefined : true)
        : Boolean(data.isActive),

    categoryId: toStr(data.categoryId),
  };

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

const normalizeProperty = (item) => {
  if (!item) return item;

  let type = item.listingType;
  if (item.listingType === 'satilik') type = 'sale';
  if (item.listingType === 'kiralik') type = 'rent';

  const images = (Array.isArray(item.images) && item.images.length > 0)
    ? item.images
    : (item.coverImage ? [item.coverImage] : []);

  return {
    ...item,
    type,
    bedroomCount: item.roomCount,
    rooms: item.roomCount,
    areaNet: item.netM2,
    area: item.netM2,
    heating: item.heatingType,
    images,
  };
};

const normalizeResponse = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(normalizeProperty);
  }
  return normalizeProperty(data);
};

// 1️⃣ Tüm veya filtrelenmiş ilanlar (Public)
export const getFilteredProperties = async (filters = {}) => {
  const response = await api.get('/properties', { params: filters });
  return normalizeResponse(response.data);
};

// 2️⃣ Öne çıkan ilanlar (Public)
export const getFeaturedProperties = async (limit = 6) => {
  const response = await api.get('/properties/featured', { params: { limit } });
  return normalizeResponse(response.data);
};

// 3️⃣ Slug ile ilan detayı (Public)
export const getPropertyBySlug = async (slug) => {
  const response = await api.get(`/properties/slug/${slug}`);
  return normalizeResponse(response.data);
};

// 4️⃣ ID ile ilan detayı (Public)
export const getPropertyById = async (id) => {
  const response = await api.get(`/properties/${id}`);
  return normalizeResponse(response.data);
};

// 🟢 5️⃣ Yeni ilan oluştur (FormData Desteği Eklendi)
export const createProperty = async (propertyData) => {
  const payload = propertyData instanceof FormData 
    ? propertyData 
    : buildPropertyPayload(propertyData);

  const response = await api.post('/properties', payload);
  return normalizeResponse(response.data);
};

// 🟢 6️⃣ İlan güncelle (FormData Desteği Eklendi)
export const updateProperty = async (id, propertyData) => {
  const payload = propertyData instanceof FormData 
    ? propertyData 
    : buildPropertyPayload(propertyData, { isUpdate: true });

  const response = await api.put(`/properties/${id}`, payload);
  return normalizeResponse(response.data);
};

// 7️⃣ İlan sil (Protected)
export const deleteProperty = async (id) => {
  const response = await api.delete(`/properties/${id}`);
  return normalizeResponse(response.data);
};