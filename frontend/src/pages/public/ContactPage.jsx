import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useCreateLead } from '../../hooks/useLeads';

export const ContactPage = () => {
  const createLeadMutation = useCreateLead();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createLeadMutation.mutateAsync({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        message: formData.message,
      });

      setIsSubmitted(true);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        message: '',
      });

      // 5 saniye sonra bildirim mesajını temizle
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Mesaj gönderilirken hata oluştu:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* SOL TARAF: İLETİŞİM BİLGİLERİ */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <span className="text-xs font-semibold tracking-widest text-[#D96B43] uppercase">
              İLETİŞİM
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#224239] mt-1 leading-tight">
              Bir evden<br />
              <span className="italic font-normal">fazlası.</span>
            </h1>
            <p className="text-[#224239]/70 text-sm mt-4 leading-relaxed">
              Aradığınız yeri birlikte bulalım. Bazen doğru ev, doğru soruyla başlar. Çorum'daki gayrimenkul ihtiyaçlarınız için her zaman yanınızdayız.
            </p>
          </div>

          <div className="space-y-6 pt-4 border-t border-[#224239]/15">
            {/* Telefon */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F2] border border-[#224239]/10 flex items-center justify-center text-[#224239] shrink-0 mt-1">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#224239] text-sm">0364 222 22 33</div>
                <div className="text-xs text-[#224239]/60">Hafta içi 09:00 - 18:30</div>
              </div>
            </div>

            {/* E-posta */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F2] border border-[#224239]/10 flex items-center justify-center text-[#224239] shrink-0 mt-1">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#224239] text-sm">merhaba@saylanemlak.com</div>
                <div className="text-xs text-[#224239]/60">Her zaman okuyup döneriz</div>
              </div>
            </div>

            {/* Adres */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F2] border border-[#224239]/10 flex items-center justify-center text-[#224239] shrink-0 mt-1">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#224239] text-sm">Gazi Caddesi, Merkez / Çorum</div>
                <div className="text-xs text-[#224239]/60">Çayımız hazır</div>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ TARAF: MESAJ & TALEP FORMU */}
        <div className="lg:col-span-7">
          <div className="bg-[#FAF8F2] p-6 sm:p-10 rounded-3xl border border-[#224239]/10 shadow-sm">
            <span className="text-xs font-semibold tracking-widest text-[#D96B43] uppercase">
              MESAJ BIRAKIN
            </span>
            <h2 className="font-serif text-3xl font-medium text-[#224239] mt-1 mb-6">
              Sizi dinliyoruz.
            </h2>

            {isSubmitted && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-medium animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Mesajınız başarıyla danışmanımıza iletildi. En kısa sürede dönüş yapacağız.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#224239]/80 mb-1">
                  Ad soyad <span className="text-[#D96B43]">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Adınız soyadınız"
                  className="w-full px-4 py-3 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#224239]/80 mb-1">
                    Telefon <span className="text-[#D96B43]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="05__ ___ __ __"
                    className="w-full px-4 py-3 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239]"
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
                    onChange={handleChange}
                    placeholder="siz@ornek.com"
                    className="w-full px-4 py-3 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#224239]/80 mb-1">
                  Mesajınız <span className="text-[#D96B43]">*</span>
                </label>
                <textarea
                  name="message"
                  rows="5"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Size nasıl yardımcı olabiliriz?"
                  className="w-full p-4 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={createLeadMutation.isPending}
                className="w-full py-4 bg-[#D96B43] hover:bg-[#C85A32] text-white rounded-xl text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {createLeadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <span>Mesaj gönder</span>
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

export default ContactPage;