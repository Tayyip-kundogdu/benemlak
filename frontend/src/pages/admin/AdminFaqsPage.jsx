import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';
import { useFaqs, useDeleteFaq } from '../../hooks/useFaqs';
import FaqFormModal from '../../components/modals/FaqFormModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const AdminFaqsPage = () => {
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // API Data Hooks
  const { data: faqs = [], isLoading } = useFaqs();
  const deleteFaqMutation = useDeleteFaq();

  // Client-side Search & Sorting Logic
  const filteredFaqs = useMemo(() => {
    return faqs
      .filter((faq) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          !searchTerm ||
          faq.question?.toLowerCase().includes(searchLower) ||
          faq.answer?.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [faqs, searchTerm]);

  const handleOpenCreateModal = () => {
    setEditingFaq(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteFaqMutation.mutateAsync(deletingId);
      setDeletingId(null);
    } catch (error) {
      console.error('SSS silinirken hata oluştu:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Sık sorulan sorular yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* BAŞLIK VE AKSİYON BUTONU */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#224239]/10">
        <div>
          <span className="text-xs font-semibold tracking-widest text-[#D96B43] uppercase">
            REHBER YÖNETİMİ
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#224239] mt-1">
            Sık Sorulan Sorular ({faqs.length})
          </h1>
          <p className="text-xs text-[#224239]/60 mt-1">
            Müşterilerinize rehberlik edecek soru ve yanıtları buradan ekleyebilir ve sıralayabilirsiniz.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-[#224239] hover:bg-[#19332C] text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Soru Ekle</span>
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
            placeholder="Soru veya yanıt ara..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#224239]/15 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#224239]"
          />
        </div>

        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="p-2 bg-white border border-[#224239]/15 rounded-xl text-[#224239] hover:text-[#D96B43] transition-colors"
            title="Aramayı Temizle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* SSS LİSTESİ TABLOSU */}
      {filteredFaqs.length === 0 ? (
        <div className="py-16 text-center bg-[#FAF8F2] rounded-3xl border border-[#224239]/10">
          <HelpCircle className="w-10 h-10 mx-auto text-[#224239]/40 mb-3" />
          <p className="text-sm font-semibold text-[#224239]">Sık sorulan soru bulunamadı.</p>
          <p className="text-xs text-[#224239]/60 mt-1">
            Arama teriminizi değiştirebilir veya yeni soru ekleyebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#224239]/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F2] border-b border-[#224239]/10 text-[11px] font-semibold text-[#224239]/70 uppercase tracking-wider">
                  <th className="py-4 px-4 w-16 text-center">
                    <span className="inline-flex items-center gap-1">
                      Sıra <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="py-4 px-6">Soru & Yanıt</th>
                  <th className="py-4 px-4 text-center">Durum</th>
                  <th className="py-4 px-6 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#224239]/10 text-xs">
                {filteredFaqs.map((faq) => {
                  const isPublished =
                    faq.isActive !== undefined
                      ? faq.isActive
                      : faq.published !== undefined
                      ? faq.published
                      : true;

                  return (
                    <tr key={faq.id} className="hover:bg-[#FAF8F2]/50 transition-colors">
                      {/* Sıra */}
                      <td className="py-4 px-4 text-center font-bold text-[#224239]">
                        #{faq.order || 1}
                      </td>

                      {/* Soru & Yanıt */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className="font-bold text-[#224239] block text-sm">
                            {faq.question}
                          </span>
                          <p className="text-[#224239]/70 line-clamp-2 text-xs leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </td>

                      {/* Yayında Durumu */}
                      <td className="py-4 px-4 text-center">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 size={12} /> Yayında
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            <XCircle size={12} /> Taslak
                          </span>
                        )}
                      </td>

                      {/* Aksiyonlar */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(faq)}
                            className="p-1.5 text-[#224239]/80 hover:text-[#224239] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#224239]/15"
                            title="Düzenle"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeletingId(faq.id)}
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

      {/* SSS FORMU MODAL */}
      <FaqFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingFaq}
      />

      {/* SİLME ONAY DIALOG */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#224239]/15 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#224239]">Soruyu Sil</h3>
              <p className="text-xs text-[#224239]/60 mt-1">
                Bu soruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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
                disabled={deleteFaqMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {deleteFaqMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFaqsPage;