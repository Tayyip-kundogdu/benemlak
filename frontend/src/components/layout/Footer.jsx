import React from 'react';
import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="w-full bg-[#224239] text-[#F7F5EE] pt-12 pb-8 border-t border-[#1a342d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-stone-700/50">
          
          {/* MARKA & AÇIKLAMA */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D96B43] flex items-center justify-center text-white font-serif font-bold text-base">
                S
              </div>
              <span className="font-serif font-bold text-xl text-white tracking-tight">
                saylan emlak
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed max-w-sm">
              Çorum'da bir ev ararken karşınızda bir portal değil, sizi dinleyen bir danışman olsun.
            </p>
          </div>

          {/* HIZLI MENÜ (KEŞFET) */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold tracking-widest text-[#D96B43] uppercase">
              KEŞFET
            </h4>
            <div className="flex flex-col gap-2 text-xs text-stone-300 font-medium">
              <Link to="/ilanlar" className="hover:text-white transition-colors">
                Güncel İlanlar
              </Link>
              <Link to="/iletisim" className="hover:text-white transition-colors">
                Bize Ulaşın
              </Link>
            </div>
          </div>

          {/* İLETİŞİM BİLGİLERİ */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold tracking-widest text-[#D96B43] uppercase">
              ÇORUM OFİSİ
            </h4>
            <div className="flex flex-col gap-1.5 text-xs text-stone-300">
              <p>Gazi Caddesi, Merkez / Çorum</p>
              <p>0536 071 48 22</p>
              <p>yusufsaylan@gmail</p>
            </div>
          </div>

        </div>

        {/* TELİF HAKKI */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
          <p>© {new Date().getFullYear()} Saylan Emlak. Tüm hakları saklıdır.</p>
          <p className="text-stone-400"></p>
        </div>
      </div>
    </footer>
  );
}