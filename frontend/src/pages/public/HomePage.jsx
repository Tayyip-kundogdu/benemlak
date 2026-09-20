import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, SearchX, Compass, ChevronUp, ChevronDown } from 'lucide-react';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useProperties } from '../../hooks/useProperties';
import { useFaqs } from '../../hooks/useFaqs';

export const HomePage = () => {
  // Local Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRooms, setSelectedRooms] = useState('');
  const [selectedHeating, setSelectedHeating] = useState('');
  
  // Accordion State for FAQ
  const [openFaqId, setOpenFaqId] = useState(null);

  // API Data Hooks
  const { data: properties = [], isLoading: isPropertiesLoading } = useProperties();
  const { data: faqs = [], isLoading: isFaqsLoading } = useFaqs();

  // Client-side Filtering Logic (Mock-up ile birebir uyumlu)
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.title?.toLowerCase().includes(searchLower) ||
        item.district?.toLowerCase().includes(searchLower) ||
        item.neighborhood?.toLowerCase().includes(searchLower) ||
        item.city?.toLowerCase().includes(searchLower);

      const matchType =
        !selectedType ||
        (selectedType === 'Satılık' && item.type === 'sale') ||
        (selectedType === 'Kiralık' && item.type === 'rent') ||
        item.type === selectedType;

      const matchRooms = !selectedRooms || item.roomCount === selectedRooms || item.rooms === selectedRooms;
      const matchHeating = !selectedHeating || item.heating === selectedHeating;

      return matchSearch && matchType && matchRooms && matchHeating;
    });
  }, [properties, searchTerm, selectedType, selectedRooms, selectedHeating]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedRooms('');
    setSelectedHeating('');
  };

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  // Sadece yayında olan SSS'ler
  const publishedFaqs = useMemo(() => {
    return faqs
      .filter((f) => f.published !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [faqs]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* HERO HEADING */}
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-widest text-[#D96B43] uppercase">
          SAYLAN SEÇKİSİ
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#224239] font-medium mt-1 mb-3 leading-tight">
          Size iyi gelecek <br />
          <span className="italic font-normal">bir yer.</span>
        </h1>
        <p className="text-[#224239]/70 text-sm sm:text-base max-w-xl">
          Çorum'un farklı mahallelerinde, özenle seçilmiş satılık ve kiralık seçenekler.
        </p>
      </div>

      {/* FILTER BOX */}
      <div className="bg-[#FAF8F2] p-4 sm:p-5 rounded-2xl border border-[#224239]/10 shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Keyword */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#224239]/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mahalle veya anahtar kelime"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239] transition-all"
            />
          </div>

          {/* Listing Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239] transition-all text-[#224239]"
            >
              <option value="">Tüm ilanlar</option>
              <option value="Satılık">Satılık</option>
              <option value="Kiralık">Kiralık</option>
            </select>
          </div>

          {/* Room Count Filter */}
          <div>
            <select
              value={selectedRooms}
              onChange={(e) => setSelectedRooms(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239] transition-all text-[#224239]"
            >
              <option value="">Oda sayısı</option>
              <option value="1+1">1+1</option>
              <option value="2+1">2+1</option>
              <option value="3+1">3+1</option>
              <option value="4+1">4+1</option>
            </select>
          </div>

          {/* Heating Filter */}
          <div>
            <select
              value={selectedHeating}
              onChange={(e) => setSelectedHeating(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239] transition-all text-[#224239]"
            >
              <option value="">Isıtma</option>
              <option value="Kombi doğalgaz">Kombi doğalgaz</option>
              <option value="Merkezi">Merkezi</option>
              <option value="Soba">Soba</option>
            </select>
          </div>
        </div>

        {/* Filter Footer Info */}
        <div className="mt-4 flex justify-between items-center pt-3 border-t border-[#224239]/10">
          <span className="text-xs font-medium text-[#224239]/70">
            {filteredProperties.length} ilan bulundu
          </span>
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-[#224239] hover:text-[#D96B43] bg-white px-3 py-1.5 rounded-full border border-[#224239]/15 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Filtreleri temizle</span>
          </button>
        </div>
      </div>

      {/* LISTINGS GRID */}
      {isPropertiesLoading ? (
        <LoadingSpinner text="İlanlar yükleniyor..." />
      ) : filteredProperties.length === 0 ? (
        <div className="col-span-full py-16 text-center bg-[#FAF8F2] rounded-3xl border border-[#224239]/10">
          <SearchX className="w-10 h-10 mx-auto text-[#224239]/40 mb-3" />
          <p className="text-base font-semibold text-[#224239]">
            Aramanıza uygun ilan bulunamadı.
          </p>
          <p className="text-xs text-[#224239]/60 mt-1 mb-4">
            Filtreleme kriterlerinizi değiştirerek tekrar deneyebilirsiniz.
          </p>
          <button
            onClick={clearFilters}
            className="text-xs text-[#D96B43] font-semibold hover:underline"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* SSS SECTION */}
      <div className="mt-20 pt-12 border-t border-[#224239]/15">
        <div className="mb-8">
          <span className="text-xs font-semibold tracking-widest text-[#D96B43] uppercase">
            REHBER & BİLGİ
          </span>
          <h2 className="font-serif text-3xl font-medium text-[#224239] mt-1">
            Sık sorulan sorular.
          </h2>
        </div>

        {isFaqsLoading ? (
          <LoadingSpinner text="Sorular yükleniyor..." />
        ) : publishedFaqs.length === 0 ? (
          <p className="text-xs text-[#224239]/60 italic">Henüz soru eklenmedi.</p>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {publishedFaqs.map((faq, index) => {
              const isOpen = openFaqId === faq.id || (openFaqId === null && index === 0);
              return (
                <div
                  key={faq.id}
                  className="bg-[#FAF8F2] rounded-2xl border border-[#224239]/10 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center font-medium text-sm text-[#224239]"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#224239]/60 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#224239]/60 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-[#224239]/70 leading-relaxed border-t border-[#224239]/10 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;