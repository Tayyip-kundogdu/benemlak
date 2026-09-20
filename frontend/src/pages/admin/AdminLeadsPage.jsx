import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Trash2,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  RotateCcw,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { useLeads, useUpdateLeadStatus, useDeleteLead } from '../../hooks/useLeads';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const AdminLeadsPage = () => {
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState(null);

  // API Data Hooks
  const { data: leads = [], isLoading } = useLeads();
  const updateStatusMutation = useUpdateLeadStatus();
  const deleteLeadMutation = useDeleteLead();

  // Client-side Filter Logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        lead.fullName?.toLowerCase().includes(searchLower) ||
        lead.phone?.includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.message?.toLowerCase().includes(searchLower);

      const matchStatus =
        !statusFilter ||
        (statusFilter === 'new' && (lead.status === 'new' || !lead.status)) ||
        lead.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
    } catch (error) {
      console.error('Talep durumu güncellenirken hata oluştu:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteLeadMutation.mutateAsync(deletingId);
      setDeletingId(null);
    } catch (error) {
      console.error('Talep silinirken hata oluştu:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tarih Belirtilmedi';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Müşteri talepleri yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* BAŞLIK VE ÖZET */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#224239]/10">
        <div>
          <span className="text-xs font-semibold tracking-widest text-[#D96B43] uppercase">
            MÜŞTERİ İLİŞKİLERİ
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#224239] mt-1">
            Gelen Talepler ({leads.length})
          </h1>
          <p className="text-xs text-[#224239]/60 mt-1">
            Web sitenizden gelen iletişim formlarını ve ilan bilgi taleplerini buradan inceleyip durumlarını güncelleyebilirsiniz.
          </p>
        </div>
      </div>

      {/* ARAMA VE DURUM FİLTRELERİ */}
      <div className="bg-[#FAF8F2] p-4 rounded-2xl border border-[#224239]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#224239]/50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="İsim, telefon veya mesaj ara..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#224239]/15 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#224239]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-[#224239]/70">
            <Filter className="w-3.5 h-3.5 text-[#D96B43]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#224239]/15 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#224239] text-[#224239]"
            >
              <option value="">Tüm Durumlar</option>
              <option value="new">Yeni Yanıtsız</option>
              <option value="contacted">Görüşüldü</option>
              <option value="closed">Tamamlandı</option>
            </select>
          </div>

          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="p-2 bg-white border border-[#224239]/15 rounded-xl text-[#224239] hover:text-[#D96B43] transition-colors"
              title="Filtreleri Sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* TALEP KARTLARI LİSTESİ */}
      {filteredLeads.length === 0 ? (
        <div className="py-16 text-center bg-[#FAF8F2] rounded-3xl border border-[#224239]/10">
          <MessageSquare className="w-10 h-10 mx-auto text-[#224239]/40 mb-3" />
          <p className="text-sm font-semibold text-[#224239]">
            Aramanıza uygun müşteri talebi bulunamadı.
          </p>
          <p className="text-xs text-[#224239]/60 mt-1">
            Filtre kriterlerinizi değiştirerek tekrar arayabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const isNew = lead.status === 'new' || !lead.status;
            const isContacted = lead.status === 'contacted';
            const isClosed = lead.status === 'closed';

            return (
              <div
                key={lead.id}
                className={`bg-white p-6 rounded-3xl border transition-all shadow-sm ${
                  isNew
                    ? 'border-[#D96B43]/50 ring-1 ring-[#D96B43]/20 bg-amber-50/20'
                    : 'border-[#224239]/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#224239]/10">
                  {/* Sol Taraf: Müşteri Kimlik Bilgileri */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-base text-[#224239]">
                        {lead.fullName}
                      </h3>

                      {/* Durum Rozeti */}
                      {isNew && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#D96B43] text-white uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Yanıt Bekliyor
                        </span>
                      )}
                      {isContacted && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Görüşüldü
                        </span>
                      )}
                      {isClosed && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Tamamlandı
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#224239]/70 pt-1">
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1.5 hover:text-[#D96B43] font-medium transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#224239]/50" />
                        <span>{lead.phone}</span>
                      </a>

                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1.5 hover:text-[#D96B43] transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#224239]/50" />
                          <span>{lead.email}</span>
                        </a>
                      )}

                      {lead.propertyId && (
                        <span className="flex items-center gap-1 text-[#224239] font-medium bg-[#FAF8F2] px-2 py-0.5 rounded-md border border-[#224239]/10">
                          <Building2 className="w-3 h-3 text-[#D96B43]" />
                          <span>İlan ID: #{lead.propertyId}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sağ Taraf: Tarih ve Hızlı Aksiyon Butonları */}
                  <div className="flex items-center gap-3 justify-between lg:justify-end">
                    <span className="text-[11px] text-[#224239]/50">
                      {formatDate(lead.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Durum Değiştirme Butonları */}
                      {!isContacted && (
                        <button
                          onClick={() => handleStatusChange(lead.id, 'contacted')}
                          disabled={updateStatusMutation.isPending}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200 transition-colors"
                          title="Görüşüldü İşaretle"
                        >
                          Görüşüldü
                        </button>
                      )}

                      {!isClosed && (
                        <button
                          onClick={() => handleStatusChange(lead.id, 'closed')}
                          disabled={updateStatusMutation.isPending}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200 transition-colors"
                          title="Tamamlandı İşaretle"
                        >
                          Kapat
                        </button>
                      )}

                      <button
                        onClick={() => setDeletingId(lead.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Talebi Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mesaj İçeriği */}
                <div className="pt-4">
                  <p className="text-xs text-[#224239]/90 bg-[#FAF8F2] p-4 rounded-2xl border border-[#224239]/10 leading-relaxed italic">
                    "{lead.message}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SİLME ONAY DIALOG */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#224239]/15 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#224239]">Talebi Sil</h3>
              <p className="text-xs text-[#224239]/60 mt-1">
                Bu müşteri talebini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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
                disabled={deleteLeadMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {deleteLeadMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeadsPage;