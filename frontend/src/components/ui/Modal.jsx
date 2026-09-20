import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  // ESC tuşuna basıldığında modali kapatma ve body scroll kilidi
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className={`bg-[#FAF8F2] w-full ${maxWidth} rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#224239]/15 animate-in fade-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Başlığı / Header */}
        <div className="px-6 py-5 bg-[#224239] text-white flex items-center justify-between border-b border-[#224239]/20">
          <h3 className="font-serif font-semibold text-lg text-[#F7F5EE] tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal İçeriği / Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-grow text-[#224239]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Import çakışmalarını önlemek için hem named hem default export:
export default Modal;