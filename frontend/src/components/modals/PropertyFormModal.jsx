import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useCreateProperty, useUpdateProperty } from '../../hooks/useProperties';
import { useCategories } from '../../hooks/useCategories';
import { LISTING_TYPES, PROPERTY_TYPES } from '../../api/properties';
import { Check, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';

const LISTING_LABELS = {
  satilik: 'Satılık',
  kiralik: 'Kiralık',
  sezonluk_kiralik: 'Sezonluk Kiralık',
  konut_projesi: 'Konut Projesi',
};

const PROPERTY_LABELS = {
  daire: 'Daire',
  villa: 'Villa',
  müstakil_ev: 'Müstakil Ev',
  arsa: 'Arsa',
  isyeri: 'İşyeri',
  bina: 'Bina',
};

const HEATING_OPTIONS = ['Kombi doğalgaz', 'Merkezi', 'Soba'];

const EMPTY_FORM = {
  title: '',
  listingType: 'satilik',
  propertyType: 'daire',
  categoryId: '',
  price: '',
  description: '',
  city: 'Çorum',
  district: 'Merkez',
  neighborhood: '',
  roomCount: '',
  netM2: '',
  heatingType: 'Kombi doğalgaz',
  isFeatured: false,
};

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

const inputClass =
  'w-full px-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239]';
const selectClass = `${inputClass} text-[#224239]`;
const labelClass = 'block text-xs font-medium text-[#224239]/80 mb-1';

export const PropertyFormModal = ({ isOpen, onClose, initialData = null }) => {
  const isEditMode = Boolean(initialData && initialData.id);

  const createPropertyMutation = useCreateProperty();
  const updatePropertyMutation = useUpdateProperty();
  const { data: categories = [] } = useCategories();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedImages, setSelectedImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || '',
        listingType: initialData.listingType || initialData.type || 'satilik',
        propertyType: initialData.propertyType || 'daire',
        categoryId: initialData.categoryId || '',
        price: initialData.price ?? '',
        description: initialData.description || '',
        city: initialData.city || 'Çorum',
        district: initialData.district || 'Merkez',
        neighborhood: initialData.neighborhood || '',
        roomCount: initialData.roomCount || initialData.bedroomCount || '',
        netM2: initialData.netM2 || initialData.areaNet || '',
        heatingType: initialData.heatingType || initialData.heating || 'Kombi doğalgaz',
        isFeatured: Boolean(initialData.isFeatured || initialData.featured),
      });
      setSelectedImages(initialData.images || []);
      setErrorMsg('');
    } else if (!isOpen) {
      setFormData(EMPTY_FORM);
      setSelectedImages([]);
      setErrorMsg('');
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen && !formData.categoryId && categories.length > 0) {
      setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [isOpen, categories, formData.categoryId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 📸 Bilgisayardan Çoklu Fotoğraf Yükleme İşleyicisi
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.categoryId) {
      setErrorMsg('Lütfen bir kategori seçin.');
      return;
    }

    try {
      const imagesList = selectedImages.length > 0 ? selectedImages : [DEFAULT_IMG];

      const payload = {
        ...formData,
        coverImage: imagesList[0],
        images: imagesList,
      };

      if (isEditMode) {
        await updatePropertyMutation.mutateAsync({ id: initialData.id, data: payload });
      } else {
        await createPropertyMutation.mutateAsync(payload);
      }

      onClose();
    } catch (err) {
      console.error('İlan kaydedilirken hata oluştu:', err);
      const d = err?.response?.data;
      setErrorMsg(
        d?.error || d?.message || err?.message || 'İlan kaydedilirken bir sunucu hatası oluştu.'
      );
    }
  };

  const isLoading = createPropertyMutation.isPending || updatePropertyMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* İlan Başlığı */}
        <div>
          <label className={labelClass}>
            İlan Başlığı <span className="text-[#D96B43]">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="Örn: Ulukavak Mahallesinde Satılık 3+1 Daire"
            className={inputClass}
          />
        </div>

        {/* İlan Tipi, Mülk Tipi, Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>İlan Tipi</label>
            <select
              name="listingType"
              value={formData.listingType}
              onChange={handleChange}
              className={selectClass}
            >
              {LISTING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {LISTING_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Mülk Tipi</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className={selectClass}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PROPERTY_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Kategori <span className="text-[#D96B43]">*</span>
            </label>
            <select
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              className={selectClass}
            >
              {categories.length === 0 && <option value="">Kategori bulunamadı</option>}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fiyat */}
        <div>
          <label className={labelClass}>
            Fiyat (TL) <span className="text-[#D96B43]">*</span>
          </label>
          <input
            type="number"
            name="price"
            required
            min="0"
            value={formData.price}
            onChange={handleChange}
            placeholder="3250000"
            className={inputClass}
          />
        </div>

        {/* 📸 BİLGİSAYARDAN BİRDEN FAZLA FOTOĞRAF YÜKLEME ALANI */}
        <div>
          <label className={labelClass}>
            İlan Fotoğrafları <span className="text-[10px] text-[#224239]/50">(Birden fazla seçebilirsiniz)</span>
          </label>
          
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#224239]/20 hover:border-[#224239] rounded-2xl cursor-pointer bg-white transition-all text-center group">
            <Upload className="w-8 h-8 text-[#224239]/50 group-hover:text-[#224239] transition-colors mb-2" />
            <span className="text-xs font-semibold text-[#224239]">
              Fotoğrafları seçmek için tıklayın
            </span>
            <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP (Aynı anda birden fazla yüklenebilir)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {/* Yüklenen Fotoğrafların Önizlemesi */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-3">
              {selectedImages.map((imgSrc, idx) => (
                <div key={idx} className="relative group/img aspect-square rounded-xl overflow-hidden border border-[#224239]/20 shadow-sm">
                  <img src={imgSrc} alt={`Yüklenen ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                    title="Görseli Kaldır"
                  >
                    <X size={12} />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-[#224239]/80 text-white text-[9px] text-center py-0.5">
                      Kapak
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Açıklama */}
        <div>
          <label className={labelClass}>
            Açıklama <span className="text-[#D96B43]">*</span>
          </label>
          <textarea
            name="description"
            rows="3"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="İlan hakkında detaylı açıklama..."
            className="w-full p-3 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239] resize-none"
          />
        </div>

        {/* İl, İlçe, Mahalle */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>
              Şehir <span className="text-[#D96B43]">*</span>
            </label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              placeholder="Çorum"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              İlçe <span className="text-[#D96B43]">*</span>
            </label>
            <input
              type="text"
              name="district"
              required
              value={formData.district}
              onChange={handleChange}
              placeholder="Merkez"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Mahalle</label>
            <input
              type="text"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              placeholder="Ulukavak"
              className={inputClass}
            />
          </div>
        </div>

        {/* Oda, m² */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Oda Sayısı</label>
            <input
              type="text"
              name="roomCount"
              value={formData.roomCount}
              onChange={handleChange}
              placeholder="3+1"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Net Alan (m²)</label>
            <input
              type="number"
              name="netM2"
              min="0"
              value={formData.netM2}
              onChange={handleChange}
              placeholder="140"
              className={inputClass}
            />
          </div>
        </div>

        {/* Isıtma & Checkbox */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
          <div>
            <label className={labelClass}>Isıtma Tipi</label>
            <select
              name="heatingType"
              value={formData.heatingType}
              onChange={handleChange}
              className={selectClass}
            >
              {HEATING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-5 sm:pt-4">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 text-[#224239] rounded border-gray-300 accent-[#224239]"
            />
            <label
              htmlFor="isFeatured"
              className="text-xs font-medium text-[#224239] cursor-pointer"
            >
              Öne çıkanlarda göster
            </label>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#224239]/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-full border border-[#224239]/20 text-xs font-medium text-[#224239] hover:bg-black/5 transition-colors"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-full bg-[#224239] hover:bg-[#19332C] text-white text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{isEditMode ? 'Güncelle' : 'Kaydet'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PropertyFormModal;