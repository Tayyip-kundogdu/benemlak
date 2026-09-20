import React from 'react';

export const LoadingSpinner = ({ fullScreen = false, text = 'Yükleniyor...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-10 h-10 border-4 border-[#224239]/20 border-t-[#D96B43] rounded-full animate-spin" />
      {text && <p className="text-sm font-medium text-[#224239]/80">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F7F5EE]">
        {content}
      </div>
    );
  }

  return content;
};

// Hem named hem default import ile çalışabilmesi için:
export default LoadingSpinner;