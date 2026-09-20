import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, SearchX, Filter } from 'lucide-react';
import PropertyCard from '../../components/ui/PropertyCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useProperties } from '../../hooks/useProperties';

export const PropertiesPage = () => {
  // Local Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRooms, setSelectedRooms] = useState('');
  const [selectedHeating, setSelectedHeating] = useState('');

  // API Data Hook
  const { data: properties = [], isLoading } = useProperties();

  // Client-side Filtering Logic
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
        (selectedType === 'Satılık' && (item.type === 'sale' || item.type === 'Satılık')) ||
        (selectedType === 'Kiralık' && (item.type === 'rent' || item.type === 'Kiralık')) ||
        item.type === selectedType;

      const matchRooms =
        !selectedRooms ||
        item.bedroomCount === selectedRooms ||
        item.rooms === selectedRooms;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* BAŞLIK & AÇIKLAMA */}
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-widest text-[#D96B43] uppercase">
          TÜM PORTFÖY
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#224239] font-medium mt-1 mb-2">
          Gayrimenkul İlanları
        </h1>
        <p className="text-[#224239]/70 text-sm sm:text-base max-w-xl">
          Çorum genelinde ihtiyaçlarınıza ve bütçenize uygun güncel satılık ve kiralık seçenekler.
        </p>
      </div>

      {/* FİLTRELEME KUTUSU */}
      <div className="bg-[#FAF8F2] p-4 sm:p-5 rounded-2xl border border-[#224239]/10 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[#224239] uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-[#D96B43]" />
          <span>İlanları Filtrele</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Arama Alanı */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#224239]/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mahalle, ilçe veya kelime..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239] transition-all"
            />
          </div>

          {/* İlan Tipi Filtresi */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239] transition-all text-[#224239]"
            >
              <option value="">Tüm İlan Tipleri</option>
              <option value="Satılık">Satılık</option>
              <option value="Kiralık">Kiralık</option>
            </select>
          </div>

          {/* Oda Sayısı Filtresi */}
          <div>
            <select
              value={selectedRooms}
              onChange={(e) => setSelectedRooms(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239] transition-all text-[#224239]"
            >
              <option value="">Tüm Oda Sayıları</option>
              <option value="1+1">1+1</option>
              <option value="2+1">2+1</option>
              <option value="3+1">3+1</option>
              <option value="4+1">4+1</option>
            </select>
          </div>

          {/* Isıtma Tipi Filtresi */}
          <div>
            <select
              value={selectedHeating}
              onChange={(e) => setSelectedHeating(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239] transition-all text-[#224239]"
            >
              <option value="">Tüm Isıtma Tipleri</option>
              <option value="Kombi doğalgaz">Kombi doğalgaz</option>
              <option value="Merkezi">Merkezi</option>
              <option value="Soba">Soba</option>
            </select>
          </div>
        </div>

        {/* Filtre Alt Bilgisi */}
        <div className="mt-4 flex justify-between items-center pt-3 border-t border-[#224239]/10">
          <span className="text-xs font-medium text-[#224239]/70">
            Toplam <strong className="text-[#224239]">{filteredProperties.length}</strong> ilan listeleniyor
          </span>
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-[#224239] hover:text-[#D96B43] bg-white px-3 py-1.5 rounded-full border border-[#224239]/15 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Filtreleri Temizle</span>
          </button>
        </div>
      </div>

      {/* İLAN LİSTESİ GRID */}
      {isLoading ? (
        <LoadingSpinner text="İlanlar yükleniyor..." />
      ) : filteredProperties.length === 0 ? (
        <div className="py-16 text-center bg-[#FAF8F2] rounded-3xl border border-[#224239]/10">
          <SearchX className="w-10 h-10 mx-auto text-[#224239]/40 mb-3" />
          <p className="text-base font-semibold text-[#224239]">
            Aramanıza uygun ilan bulunamadı.
          </p>
          <p className="text-xs text-[#224239]/60 mt-1 mb-4">
            Arama kriterlerinizi esneterek tekrar deneyebilirsiniz.
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
    </div>
  );
};

export default PropertiesPage;