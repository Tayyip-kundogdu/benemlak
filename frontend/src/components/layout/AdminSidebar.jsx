import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useClerk } from '@clerk/clerk-react';
import { LayoutDashboard, Building2, HelpCircle, MessageSquare, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { path: '/admin/genel-bakis', label: 'Genel bakış', icon: LayoutDashboard },
    { path: '/admin/ilanlar', label: 'İlanlar', icon: Building2 },
    { path: '/admin/sss', label: 'SSS', icon: HelpCircle },
    { path: '/admin/mesajlar', label: 'Mesajlar', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-[#224239] text-[#F7F5EE] min-h-screen flex flex-col justify-between p-6 shrink-0">
      <div className="flex flex-col gap-8">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#D96B43] flex items-center justify-center text-white font-serif font-bold text-lg">
            S
          </div>
          <span className="font-serif font-bold text-xl text-white tracking-tight">
            saylan emlak
          </span>
        </div>

        {/* MENÜ */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
            ÇALIŞMA MASASI
          </span>

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold shadow-inner'
                        : 'text-stone-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ÇIKIŞ YAP */}
      <div className="pt-6 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-stone-300 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Çıkış yap</span>
        </button>
      </div>
    </aside>
  );
}