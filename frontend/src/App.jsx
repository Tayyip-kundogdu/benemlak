/*
import { SignedIn, SignedOut, SignInButton, SignOutButton, RedirectToSignIn } from '@clerk/clerk-react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router'


function App() {
  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<h1>Home Page</h1>} />
          <Route path="/ilanlar" element={<h1>İlanlar Page</h1>} />
          <Route path="/iletisim" element={<h1>Contact Page</h1>} />
          <Route path="/admin" element={<SignInButton />} />
        </Routes>
      </main>
    </div>
  )
}





export default App 



import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';


import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import IlanlarPage from './pages/IlanlarPage';
import IlanDetayPage from './pages/IlanDetayPage';
import IletisimPage from './pages/IletisimPage';
import AdminPage from './pages/AdminPage';
import IlanEklePage from './pages/IlanEklePage';
import IlanDuzenlePage from './pages/IlanDuzenlePage';
*/
/*
export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content">
      
      <Navbar />

      
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          
          <Route path="/" element={<HomePage />} />
          <Route path="/ilanlar" element={<IlanlarPage />} />
          <Route path="/ilanlar/:id" element={<IlanDetayPage />} />
          <Route path="/iletisim" element={<IletisimPage />} />
          
          <Route 
            path="/admin" 
            element={
              <>
                <SignedIn>
                  
                  <h1>Admin Dashboard (Tüm İlanlar & Talepler)</h1>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />

          <Route 
            path="/admin/ekle" 
            element={
              <>
                <SignedIn>
                  <h1>Yeni İlan Ekle Sayfası</h1>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />

         
          <Route 
            path="/admin/duzenle/:id" 
            element={
              <>
                <SignedIn>
                  <h1>İlan Düzenleme Sayfası</h1>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />

          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}



import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

// Layout Bileşenleri
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminSidebar from './components/layout/AdminSidebar';

// Müşteri Sayfaları (Public)
import HomePage from './pages/public/HomePage';
import PropertiesPage from './pages/public/PropertiesPage';
import PropertyDetailPage from './pages/public/PropertyDetailPage';
import ContactPage from './pages/public/ContactPage';

// Admin / Danışman Paneli Sayfaları
import DashboardPage from './pages/admin/DashboardPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminFaqsPage from './pages/admin/AdminFaqsPage';
import AdminLeadsPage from './pages/admin/AdminLeadsPage';



// Müşteri Arayüzü Sarmalayıcısı (Navbar + İçerik + Footer)
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EE] text-stone-800 font-sans">
      <Navbar />
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Admin / Danışman Paneli Sarmalayıcısı (Sol Koyu Yeşil Sidebar + İçerik)
const AdminPanelLayout = () => {
  return (
    <div className="min-h-screen flex bg-[#F7F5EE] text-stone-800 font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ilanlar" element={<PropertiesPage />} />
        
        <Route path="/ilan/:slug" element={<PropertyDetailPage />} />
        <Route path="/ilanlar/:slug" element={<PropertyDetailPage />} />
        <Route path="/iletisim" element={<ContactPage />} />
      </Route>

      
      <Route
        element={
          <>
            <SignedIn>
              <AdminPanelLayout />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      >
        <Route path="/admin" element={<Navigate to="/admin/genel-bakis" replace />} />
        <Route path="/admin/genel-bakis" element={<DashboardPage />} />
        <Route path="/admin/ilanlar" element={<AdminPropertiesPage />} />
        <Route path="/admin/sss" element={<AdminFaqsPage />} />
        <Route path="/admin/talepler" element={<AdminLeadsPage />} />
        <Route path="/admin/mesajlar" element={<AdminLeadsPage />} />
      </Route>

      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}*/

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react';
import { setupAxiosInterceptors } from './api/axios';

// Layout Bileşenleri
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminSidebar from './components/layout/AdminSidebar';

// Müşteri Sayfaları (Public)
import HomePage from './pages/public/HomePage';
import PropertiesPage from './pages/public/PropertiesPage';
import PropertyDetailPage from './pages/public/PropertyDetailPage';
import ContactPage from './pages/public/ContactPage';

// Admin / Danışman Paneli Sayfaları
import DashboardPage from './pages/admin/DashboardPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminFaqsPage from './pages/admin/AdminFaqsPage';
import AdminLeadsPage from './pages/admin/AdminLeadsPage';

// Müşteri Arayüzü Sarmalayıcısı (Navbar + İçerik + Footer)
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EE] text-stone-800 font-sans">
      <Navbar />
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Admin / Danışman Paneli Sarmalayıcısı (Sol Koyu Yeşil Sidebar + İçerik)
const AdminPanelLayout = () => {
  return (
    <div className="min-h-screen flex bg-[#F7F5EE] text-stone-800 font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  const { getToken } = useAuth();

  // Axios isteklerine otomatik Clerk Bearer token eklenmesi
  useEffect(() => {
    setupAxiosInterceptors(getToken);
  }, [getToken]);

  return (
    <Routes>
      {/* 1. MÜŞTERİ / ZİYARETÇİ ROTALARI (Navbar & Footer İçerir) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ilanlar" element={<PropertiesPage />} />
        <Route path="/ilan/:slug" element={<PropertyDetailPage />} />
        <Route path="/ilanlar/:slug" element={<PropertyDetailPage />} />
        <Route path="/iletisim" element={<ContactPage />} />
      </Route>

      {/* 2. DANIŞMAN / ADMİN PANELİ (Korumalı Rotalar & Sol Sidebar) */}
      <Route
        element={
          <>
            <SignedIn>
              <AdminPanelLayout />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      >
        <Route path="/admin" element={<Navigate to="/admin/genel-bakis" replace />} />
        <Route path="/admin/genel-bakis" element={<DashboardPage />} />
        <Route path="/admin/ilanlar" element={<AdminPropertiesPage />} />
        <Route path="/admin/sss" element={<AdminFaqsPage />} />
        <Route path="/admin/talepler" element={<AdminLeadsPage />} />
        <Route path="/admin/mesajlar" element={<AdminLeadsPage />} />
      </Route>

      {/* Bilinmeyen rotaları ana sayfaya yönlendir */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}