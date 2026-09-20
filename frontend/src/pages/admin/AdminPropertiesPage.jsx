import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Sparkles,
  MapPin,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProperties, useDeleteProperty } from '../../hooks/useProperties';
import PropertyFormModal from '../../components/modals/PropertyFormModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const AdminPropertiesPage = () => {
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  // Delete Confirmation Modal State
  const [deletingId, setDeletingId] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // API Hooks
  const { data: properties = [], isLoading } = useProperties();
  const deletePropertyMutation = useDeleteProperty();

  // Client-side Filter Logic
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

      return matchSearch && matchType;
    });
  }, [properties, searchTerm, selectedType]);

  const handleOpenCreateModal = () => {
    setEditingProperty(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (property) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deletePropertyMutation.mutateAsync(deletingId);
      setDeletingId(null);
    } catch (error) {
      console.error('İlan silinirken hata oluştu:', error);
    }
  };

  const formatPrice = (amount) => {
    if (!amount) return 'Fiyat Yok';
    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(amount);
  };

  if (isLoading) {
    return <LoadingSpinner text="İlan portföyü yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* BAŞLIK VE AKSİYON BUTONU */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#224239]/10">
        <div>
          <span className="text-xs font-semibold tracking-widest text-[#D96B43] uppercase">
            PORTFÖY YÖNETİMİ
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#224239] mt-1">
            İlanlar ({properties.length})
          </h1>
          <p className="text-xs text-[#224239]/60 mt-1">
            Satılık ve kiralık ilanlarınızı yönetin, yeni ilan ekleyin veya mevcut olanları güncelleyin.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-[#224239] hover:bg-[#19332C] text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni İlan Ekle</span>
        </button>
      </div>

      {/* ARAMA VE FİLTRELEME BARI */}
      <div className="bg-[#FAF8F2] p-4 rounded-2xl border border-[#224239]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#224239]/50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Başlık veya konum ara..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#224239]/15 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#224239]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white border border-[#224239]/15 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#224239] text-[#224239]"
          >
            <option value="">Tüm İlan Tipleri</option>
            <option value="Satılık">Satılık</option>
            <option value="Kiralık">Kiralık</option>
          </select>

          {(searchTerm || selectedType) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
              }}
              className="p-2 bg-white border border-[#224239]/15 rounded-xl text-[#224239] hover:text-[#D96B43] transition-colors"
              title="Filtreleri Sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* İLAN LİSTESİ TABLOSU */}
      {filteredProperties.length === 0 ? (
        <div className="py-16 text-center bg-[#FAF8F2] rounded-3xl border border-[#224239]/10">
          <Building2 className="w-10 h-10 mx-auto text-[#224239]/40 mb-3" />
          <p className="text-sm font-semibold text-[#224239]">Aramanıza uygun ilan bulunamadı.</p>
          <p className="text-xs text-[#224239]/60 mt-1">
            Filtreleme kriterlerini değiştirebilir veya yeni bir ilan ekleyebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#224239]/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F2] border-b border-[#224239]/10 text-[11px] font-semibold text-[#224239]/70 uppercase tracking-wider">
                  <th className="py-4 px-6">Görsel & İlan Başlığı</th>
                  <th className="py-4 px-4">Tip</th>
                  <th className="py-4 px-4">Konum</th>
                  <th className="py-4 px-4">Fiyat</th>
                  <th className="py-4 px-4 text-center">Öne Çıkan</th>
                  <th className="py-4 px-6 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#224239]/10 text-xs">
                {filteredProperties.map((property) => {
                  const mainImage =
                    property.images?.[0] ||
                    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80';
                  const isSale = property.type === 'sale' || property.type === 'Satılık';
                  const isFeatured = property.isFeatured || property.featured;

                  return (
                    <tr key={property.id} className="hover:bg-[#FAF8F2]/50 transition-colors">
                      {/* Görsel & Başlık */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={mainImage}
                            alt={property.title}
                            className="w-12 h-12 object-cover rounded-xl border border-[#224239]/10 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-[#224239] line-clamp-1">
                              {property.title}
                            </span>
                            <span className="text-[11px] text-[#224239]/50 block">
                              {property.bedroomCount ? `${property.bedroomCount} Oda` : ''}{' '}
                              {property.areaNet ? `• ${property.areaNet} m²` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tip */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider text-white ${
                            isSale ? 'bg-[#D96B43]' : 'bg-[#224239]'
                          }`}
                        >
                          {isSale ? 'Satılık' : 'Kiralık'}
                        </span>
                      </td>

                      {/* Konum */}
                      <td className="py-3 px-4 text-[#224239]/80">
                        <div className="flex items-center gap-1">
                          <MapPin size={13} className="text-[#D96B43] shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {property.district ? `${property.district}, ` : ''}
                            {property.city || 'Çorum'}
                          </span>
                        </div>
                      </td>

                      {/* Fiyat */}
                      <td className="py-3 px-4 font-bold text-[#224239] whitespace-nowrap">
                        {formatPrice(property.price)} TL
                      </td>

                      {/* Öne Çıkan */}
                      <td className="py-3 px-4 text-center">
                        {isFeatured ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            <Sparkles size={11} /> Öne Çıkan
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#224239]/40">-</span>
                        )}
                      </td>

                      {/* Aksiyonlar */}
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/ilan/${property.slug || property.id}`}
                            target="_blank"
                            className="p-1.5 text-[#224239]/60 hover:text-[#224239] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#224239]/15"
                            title="Sitede Gör"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(property)}
                            className="p-1.5 text-[#224239]/80 hover:text-[#224239] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#224239]/15"
                            title="Düzenle"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeletingId(property.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* İLAN DÜZENLEME / EKLEME MODAL */}
      <PropertyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProperty}
      />

      {/* SİLME ONAY DIALOG */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#224239]/15 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#224239]">İlanı Sil</h3>
              <p className="text-xs text-[#224239]/60 mt-1">
                Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#224239]/20 text-xs font-semibold text-[#224239] hover:bg-black/5"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletePropertyMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {deletePropertyMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertiesPage;