import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  Flame,
  BedDouble,
  Bath,
  Square,
  Building,
} from 'lucide-react';
import { usePropertyDetailBySlug } from '../../hooks/useProperties';
import { useCreateLead } from '../../hooks/useLeads';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const PropertyDetailPage = () => {
  const { slug } = useParams();

  // API Data Hook
  const { data: property, isLoading, isError } = usePropertyDetailBySlug(slug);

  // Lead Mutation
  const createLeadMutation = useCreateLead();

  // Gallery State
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: 'Bu ilan hakkında daha fazla bilgi almak istiyorum.',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const images = useMemo(() => {
    if (property?.images && property.images.length > 0) {
      return property.images;
    }
    return ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80'];
  }, [property]);

  const nextGalleryImage = () => {
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevGalleryImage = () => {
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatPrice = (amount) => {
    if (!amount) return 'Fiyat Belirtilmedi';
    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(amount);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      await createLeadMutation.mutateAsync({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        message: formData.message,
        propertyId: property?.id || undefined,
      });

      setIsSubmitted(true);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        message: 'Bu ilan hakkında daha fazla bilgi almak istiyorum.',
      });

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('İlan talebi gönderilirken hata oluştu:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="İlan detayları yükleniyor..." />;
  }

  if (isError || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#224239] mb-2">
          İlan Bulunamadı
        </h2>
        <p className="text-sm text-[#224239]/60 mb-6">
          Aradığınız ilan yayından kaldırılmış veya adresi değişmiş olabilir.
        </p>
        <Link
          to="/ilanlar"
          className="px-6 py-2.5 bg-[#224239] text-white rounded-full text-xs font-semibold hover:bg-[#19332C] transition-colors"
        >
          Tüm İlanlara Dön
        </Link>
      </div>
    );
  }

  const {
    title,
    price,
    type, // 'sale' | 'rent' | 'Satılık' | 'Kiralık'
    city = 'Çorum',
    district = 'Merkez',
    neighborhood,
    bedroomCount,
    bathroomCount,
    areaNet,
    area,
    floor,
    heating = 'Kombi doğalgaz',
    description,
  } = property;

  const displayArea = areaNet || area;
  const isSale = type === 'sale' || type === 'Satılık';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Geri Dön Butonu */}
      <Link
        to="/ilanlar"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#224239]/70 hover:text-[#224239] mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Tüm ilanlara dön
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SOL KOLON: GALERİ VE DETAYLAR */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ana Görsel & Galeri */}
          <div className="relative bg-stone-200 rounded-3xl overflow-hidden shadow-sm aspect-[4/3]">
            <img
              src={images[currentImgIndex]}
              alt={title}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Rozetler */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span
                className={`text-white text-xs px-3 py-1 rounded-full font-semibold shadow-sm uppercase tracking-wider ${
                  isSale ? 'bg-[#D96B43]' : 'bg-[#224239]'
                }`}
              >
                {isSale ? 'Satılık' : 'Kiralık'}
              </span>
            </div>

            {/* Konum Rozeti */}
            <div className="absolute bottom-4 left-28 text-white text-xs bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>
                {city} {district ? `/ ${district}` : ''} {neighborhood ? `- ${neighborhood}` : ''}
              </span>
            </div>

            {/* Galeri Navigasyonu */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-2">
                <button
                  onClick={prevGalleryImage}
                  className="hover:text-[#D96B43] transition-colors"
                  aria-label="Önceki Görsel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  {currentImgIndex + 1} / {images.length}
                </span>
                <button
                  onClick={nextGalleryImage}
                  className="hover:text-[#D96B43] transition-colors"
                  aria-label="Sonraki Görsel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Galeri Küçük Resimler (Thumbnails) */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Görsel ${idx + 1}`}
                  onClick={() => setCurrentImgIndex(idx)}
                  className={`w-16 h-12 object-cover rounded-xl cursor-pointer border-2 transition-all ${
                    idx === currentImgIndex
                      ? 'border-[#D96B43] opacity-100 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          )}

          {/* İlan Bilgileri */}
          <div>
            <span className="text-xs font-semibold tracking-widest text-[#D96B43] uppercase">
              PORTFÖY DETAYI
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#224239] mt-1 mb-2">
              {title}
            </h1>
            <div className="text-2xl sm:text-3xl font-bold text-[#224239] font-serif mb-6">
              {formatPrice(price)} TL
            </div>

            {/* Özellik Rozetleri Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#FAF8F2] rounded-2xl border border-[#224239]/10 text-center mb-6">
              {displayArea && (
                <div className="flex flex-col items-center justify-center p-2">
                  <Square className="w-5 h-5 text-[#224239] mb-1" />
                  <div className="font-bold text-base text-[#224239]">{displayArea} m²</div>
                  <div className="text-[11px] text-[#224239]/60">Net Alan</div>
                </div>
              )}

              {bedroomCount !== undefined && (
                <div className="flex flex-col items-center justify-center p-2 border-l border-[#224239]/10">
                  <BedDouble className="w-5 h-5 text-[#224239] mb-1" />
                  <div className="font-bold text-base text-[#224239]">{bedroomCount}</div>
                  <div className="text-[11px] text-[#224239]/60">Oda Sayısı</div>
                </div>
              )}

              {bathroomCount !== undefined && (
                <div className="flex flex-col items-center justify-center p-2 border-l border-[#224239]/10">
                  <Bath className="w-5 h-5 text-[#224239] mb-1" />
                  <div className="font-bold text-base text-[#224239]">{bathroomCount}</div>
                  <div className="text-[11px] text-[#224239]/60">Banyo</div>
                </div>
              )}

              {floor && (
                <div className="flex flex-col items-center justify-center p-2 border-l border-[#224239]/10">
                  <Building className="w-5 h-5 text-[#224239] mb-1" />
                  <div className="font-bold text-base text-[#224239]">{floor}</div>
                  <div className="text-[11px] text-[#224239]/60">Bulunduğu Kat</div>
                </div>
              )}
            </div>

            {/* Açıklama ve Ek Özellikler */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#224239] uppercase tracking-wider">
                Açıklama
              </h3>
              <p className="text-[#224239]/80 text-sm leading-relaxed whitespace-pre-line">
                {description || 'Bu ilan için herhangi bir açıklama girilmemiş.'}
              </p>

              {heating && (
                <div className="flex items-center gap-2 text-xs font-medium text-[#224239] bg-emerald-50 border border-emerald-200/60 p-3 rounded-xl w-fit mt-4">
                  <Flame className="w-4 h-4 text-[#D96B43]" />
                  <span>
                    Isıtma Tipi: <strong className="font-semibold">{heating}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SAĞ KOLON: İLAN İÇİN BİLGİ / İLETİŞİM FORMU */}
        <div className="lg:col-span-5">
          <div className="bg-[#FAF8F2] p-6 sm:p-8 rounded-3xl border border-[#224239]/10 sticky top-28 shadow-sm">
            <h3 className="font-serif text-xl font-medium text-[#224239] mb-1">
              Bu İlan İçin Bilgi Alın
            </h3>
            <p className="text-xs text-[#224239]/60 mb-6">
              Danışmanımıza hızlıca mesaj iletebilir, randevu oluşturabilirsiniz.
            </p>

            {isSubmitted && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-medium animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Talebiniz başarıyla iletildi. En kısa sürede sizi arayacağız.</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#224239]/80 mb-1">
                  Ad soyad <span className="text-[#D96B43]">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleFormChange}
                  placeholder="Adınız soyadınız"
                  className="w-full px-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#224239]/80 mb-1">
                    Telefon <span className="text-[#D96B43]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="05__ ___ __ __"
                    className="w-full px-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#224239]/80 mb-1">
                    E-posta <span className="text-[10px] text-[#224239]/50">(İsteğe bağlı)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="siz@ornek.com"
                    className="w-full px-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#224239]/80 mb-1">
                  Mesajınız <span className="text-[#D96B43]">*</span>
                </label>
                <textarea
                  name="message"
                  rows="4"
                  required
                  value={formData.message}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={createLeadMutation.isPending}
                className="w-full py-3.5 bg-[#D96B43] hover:bg-[#C85A32] text-white rounded-xl text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {createLeadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>İletiliyor...</span>
                  </>
                ) : (
                  <>
                    <span>Mesaj Gönder</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;