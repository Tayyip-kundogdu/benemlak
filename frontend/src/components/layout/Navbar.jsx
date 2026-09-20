import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, useClerk, UserButton } from '@clerk/clerk-react';
import { ShieldCheck, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openSignIn } = useClerk();

  // Aktif sayfa kontrolü için helper
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleAdvisorLogin = () => {
    openSignIn({
      afterSignInUrl: '/admin/genel-bakis',
      redirectUrl: '/admin/genel-bakis',
    });
  };

  return (
    <header className="w-full bg-[#F7F5EE] border-b border-[#E5E2D9] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO & MARKA BİLGİSİ */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#224239] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm group-hover:bg-[#1a342d] transition-colors">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-[#224239] tracking-tight leading-none">
              saylan emlak
            </span>
            <span className="text-[10px] font-medium tracking-widest text-stone-500 uppercase mt-1">
              ÇORUM • 1998'DEN BERİ
            </span>
          </div>
        </Link>

        {/* MENÜ LİNKLERİ (Müşteri Navigasyonu) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') && location.pathname === '/'
                ? 'text-[#224239] font-semibold border-b-2 border-[#224239] pb-1'
                : 'text-stone-600 hover:text-[#224239]'
            }`}
          >
            Ana sayfa
          </Link>
          <Link
            to="/ilanlar"
            className={`text-sm font-medium transition-colors ${
              isActive('/ilanlar')
                ? 'text-[#224239] font-semibold border-b-2 border-[#224239] pb-1'
                : 'text-stone-600 hover:text-[#224239]'
            }`}
          >
            İlanlar
          </Link>
          <Link
            to="/iletisim"
            className={`text-sm font-medium transition-colors ${
              isActive('/iletisim')
                ? 'text-[#224239] font-semibold border-b-2 border-[#224239] pb-1'
                : 'text-stone-600 hover:text-[#224239]'
            }`}
          >
            İletişim
          </Link>
        </nav>

        {/* DANIŞMAN GİRİŞİ / CLERK AUTH BUTONU */}
        <div className="flex items-center gap-3">
          {/* Danışman Giriş Yapmamışsa */}
          <SignedOut>
            <button
              onClick={handleAdvisorLogin}
              className="inline-flex items-center gap-2 bg-[#224239] hover:bg-[#1a342d] text-white px-5 py-2.5 rounded-full text-xs font-medium transition-all shadow-sm active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Danışman girişi</span>
            </button>
          </SignedOut>

          {/* Danışman Oturum Açmışsa */}
          <SignedIn>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/genel-bakis')}
                className="inline-flex items-center gap-2 bg-[#224239] hover:bg-[#1a342d] text-white px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Danışman Girişi</span>
              </button>

              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 border border-stone-300"
                  }
                }}
              />
            </div>
          </SignedIn>
        </div>

      </div>
    </header>
  );
}