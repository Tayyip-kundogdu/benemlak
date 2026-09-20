import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MessageSquare,
  HelpCircle,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  Phone,
  Mail,
} from 'lucide-react';
import { useProperties } from '../../hooks/useProperties';
import { useLeads } from '../../hooks/useLeads';
import { useFaqs } from '../../hooks/useFaqs';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const DashboardPage = () => {
  // API Data Hooks
  const { data: properties = [], isLoading: isPropertiesLoading } = useProperties();
  const { data: leads = [], isLoading: isLeadsLoading } = useLeads();
  const { data: faqs = [], isLoading: isFaqsLoading } = useFaqs();

  // Dashboard İstatistik Hesaplamaları
  const stats = useMemo(() => {
    const totalProperties = properties.length;
    const featuredProperties = properties.filter(
      (p) => p.isFeatured || p.featured
    ).length;
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'new' || !l.status).length;
    const totalFaqs = faqs.length;

    return {
      totalProperties,
      featuredProperties,
      totalLeads,
      newLeads,
      totalFaqs,
    };
  }, [properties, leads, faqs]);

  // Son gelen 5 talep / mesaj
  const recentLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [leads]);

  const isLoading = isPropertiesLoading || isLeadsLoading || isFaqsLoading;

  if (isLoading) {
    return <LoadingSpinner text="Yönetim paneli yükleniyor..." />;
  }

  return (
    <div className="space-y-8">
      {/* BAŞLIK & KARŞILAMA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#224239]/10">
        <div>
          <span className="text-xs font-semibold tracking-widest text-[#D96B43] uppercase">
            YÖNETİM PANELİ
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#224239] mt-1">
            Çorum Saylan Emlak
          </h1>
          <p className="text-xs text-[#224239]/60 mt-1">
            Sistem durumunu inceleyebilir, gelen müşteri taleplerini ve ilanları yönetebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/ilanlar"
            className="px-4 py-2.5 bg-[#224239] hover:bg-[#19332C] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İlan Ekle</span>
          </Link>
        </div>
      </div>

      {/* METRİK KARTLARI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Toplam İlanlar */}
        <div className="bg-[#FAF8F2] p-5 rounded-2xl border border-[#224239]/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#224239]/60 block">
              Toplam İlan
            </span>
            <span className="text-3xl font-serif font-bold text-[#224239] mt-1 block">
              {stats.totalProperties}
            </span>
            <span className="text-[11px] text-[#224239]/50 mt-1 block">
              {stats.featuredProperties} öne çıkan ilan
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#224239]/10 flex items-center justify-center text-[#224239]">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Gelen Talepler / Mesajlar */}
        <div className="bg-[#FAF8F2] p-5 rounded-2xl border border-[#224239]/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#224239]/60 block">
              Gelen Mesajlar
            </span>
            <span className="text-3xl font-serif font-bold text-[#224239] mt-1 block">
              {stats.totalLeads}
            </span>
            <span className="text-[11px] font-semibold text-[#D96B43] mt-1 block">
              {stats.newLeads} yanıt bekleyen
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#D96B43]/10 flex items-center justify-center text-[#D96B43]">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Öne Çıkanlar */}
        <div className="bg-[#FAF8F2] p-5 rounded-2xl border border-[#224239]/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#224239]/60 block">
              Öne Çıkan Vitrin
            </span>
            <span className="text-3xl font-serif font-bold text-[#224239] mt-1 block">
              {stats.featuredProperties}
            </span>
            <span className="text-[11px] text-[#224239]/50 mt-1 block">
              Ana sayfada gösterilen
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* SSS Sayısı */}
        <div className="bg-[#FAF8F2] p-5 rounded-2xl border border-[#224239]/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#224239]/60 block">
              Rehber & SSS
            </span>
            <span className="text-3xl font-serif font-bold text-[#224239] mt-1 block">
              {stats.totalFaqs}
            </span>
            <span className="text-[11px] text-[#224239]/50 mt-1 block">
              Sık sorulan soru
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#224239]/10 flex items-center justify-center text-[#224239]">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SON MÜŞTERİ TALEPLERİ VE HIZLI ERİŞİM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sol Kolon: Son Gelen Mesajlar */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#224239]/10 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#224239]/10">
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#224239]">
                Son Müşteri Talepleri
              </h2>
              <p className="text-xs text-[#224239]/60">
                Web sitesinden gönderilen son 5 iletişim formu.
              </p>
            </div>
            <Link
              to="/admin/talepler"
              className="text-xs font-semibold text-[#D96B43] hover:underline flex items-center gap-1"
            >
              <span>Tümünü Gör</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#224239]/60 italic">
              Henüz bir müşteri talebi bulunmuyor.
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => {
                const isNew = lead.status === 'new' || !lead.status;
                return (
                  <div
                    key={lead.id}
                    className="p-4 bg-[#FAF8F2] rounded-2xl border border-[#224239]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#224239]">
                          {lead.fullName}
                        </span>
                        {isNew && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#D96B43] text-white uppercase tracking-wider">
                            Yeni
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#224239]/70">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#224239]/50" />
                          {lead.phone}
                        </span>
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#224239]/50" />
                            {lead.email}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#224239]/80 line-clamp-1 italic pt-1">
                        "{lead.message}"
                      </p>
                    </div>

                    <Link
                      to="/admin/talepler"
                      className="text-xs font-medium text-[#224239] hover:text-[#D96B43] bg-white px-3 py-1.5 rounded-xl border border-[#224239]/15 self-start sm:self-center transition-colors shrink-0"
                    >
                      İncele
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sağ Kolon: Hızlı İşlem & İpuçları */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FAF8F2] p-6 rounded-3xl border border-[#224239]/10 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#224239]">
              Hızlı Yönetim
            </h3>

            <div className="space-y-2">
              <Link
                to="/admin/ilanlar"
                className="w-full p-3 bg-white rounded-xl border border-[#224239]/10 text-xs font-medium text-[#224239] hover:border-[#224239] transition-all flex items-center justify-between group"
              >
                <span>İlan Portföyünü Yönet</span>
                <ArrowUpRight className="w-4 h-4 text-[#224239]/40 group-hover:text-[#224239] transition-colors" />
              </Link>

              <Link
                to="/admin/talepler"
                className="w-full p-3 bg-white rounded-xl border border-[#224239]/10 text-xs font-medium text-[#224239] hover:border-[#224239] transition-all flex items-center justify-between group"
              >
                <span>Müşteri Taleplerini Yönet</span>
                <ArrowUpRight className="w-4 h-4 text-[#224239]/40 group-hover:text-[#224239] transition-colors" />
              </Link>

              <Link
                to="/admin/sss"
                className="w-full p-3 bg-white rounded-xl border border-[#224239]/10 text-xs font-medium text-[#224239] hover:border-[#224239] transition-all flex items-center justify-between group"
              >
                <span>Sık Sorulan Soruları Düzenle</span>
                <ArrowUpRight className="w-4 h-4 text-[#224239]/40 group-hover:text-[#224239] transition-colors" />
              </Link>
            </div>
          </div>

          {/* İpucu Kutusu */}
          <div className="bg-[#224239] text-[#F7F5EE] p-6 rounded-3xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Danışman Notu</span>
            </div>
            <p className="text-xs text-[#F7F5EE]/80 leading-relaxed">
              Gelen müşteri taleplerine ilk 1 saat içerisinde dönüş yapmak, dönüşüm oranlarını %60 artırmaktadır. Müşteri sekmesinden talepleri işaretlemeyi unutmayın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;