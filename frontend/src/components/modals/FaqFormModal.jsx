import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useCreateFaq, useUpdateFaq } from '../../hooks/useFaqs';
import { Check, Loader2 } from 'lucide-react';

export const FaqFormModal = ({ isOpen, onClose, initialData = null }) => {
  const isEditMode = Boolean(initialData && initialData.id);

  const createFaqMutation = useCreateFaq();
  const updateFaqMutation = useUpdateFaq();

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 1,
    isActive: true,
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        question: initialData.question || '',
        answer: initialData.answer || '',
        order: initialData.order !== undefined ? initialData.order : 1,
        isActive: initialData.isActive !== undefined ? initialData.isActive : initialData.published !== undefined ? initialData.published : true,
      });
    } else if (!isOpen) {
      setFormData({
        question: '',
        answer: '',
        order: 1,
        isActive: true,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      question: formData.question,
      answer: formData.answer,
      order: Number(formData.order) || 1,
      isActive: Boolean(formData.isActive),
      published: Boolean(formData.isActive), // Backend alan adı farklarına karşı ikisi de gönderilir
    };

    if (isEditMode) {
      await updateFaqMutation.mutateAsync({
        id: initialData.id,
        data: payload,
      });
    } else {
      await createFaqMutation.mutateAsync(payload);
    }

    onClose();
  };

  const isLoading = createFaqMutation.isPending || updateFaqMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Soruyu Düzenle' : 'Yeni Sık Sorulan Soru'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Soru */}
        <div>
          <label className="block text-xs font-medium text-[#224239]/80 mb-1">
            Soru <span className="text-[#D96B43]">*</span>
          </label>
          <input
            type="text"
            name="question"
            required
            value={formData.question}
            onChange={handleChange}
            placeholder="Örn: Çorum'da ev alırken nelere dikkat etmeliyim?"
            className="w-full px-4 py-2.5 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239]"
          />
        </div>

        {/* Yanıt */}
        <div>
          <label className="block text-xs font-medium text-[#224239]/80 mb-1">
            Yanıt <span className="text-[#D96B43]">*</span>
          </label>
          <textarea
            name="answer"
            rows="4"
            required
            value={formData.answer}
            onChange={handleChange}
            placeholder="Sorunun detaylı açıklaması ve danışman yanıtı..."
            className="w-full p-3 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239] resize-none"
          />
        </div>

        {/* Sıralama & Yayında Checkbox */}
        <div className="flex items-center gap-6 pt-2">
          <div className="w-32">
            <label className="block text-xs font-medium text-[#224239]/80 mb-1">
              Görüntülenme Sırası
            </label>
            <input
              type="number"
              name="order"
              min="1"
              value={formData.order}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-[#224239]/15 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#224239]"
            />
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-[#224239] rounded border-gray-300 accent-[#224239]"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-[#224239]">
              Yayında
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
            className="px-6 py-2.5 rounded-full bg-[#224239] hover:bg-[#19332C] text-white text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
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

export default FaqFormModal;