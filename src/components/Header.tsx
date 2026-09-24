import React, { useState } from 'react';
import {
  Menu,
  Search,
  UploadCloud,
  FileCheck2,
  Calendar,
  Cloud,
  CheckCircle2,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { SchoolProfile, ActiveTab } from '../types/curriculum';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenUpload: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedAcademicYear: string;
  setSelectedAcademicYear: (year: string) => void;
  academicYears: string[];
  pendingCount: number;
  onNavigateToVerification: () => void;
  schoolProfile: SchoolProfile;
  isCloudConnected?: boolean;
  currentUser?: User | null;
  onLoginGoogle?: () => void;
  onLogoutGoogle?: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Beranda', subtitle: 'Ringkasan Arsip' },
  'teacher-docs': { title: 'Dokumen Guru', subtitle: 'Perangkat Ajar & Modul' },
  'homeroom-docs': { title: 'Dokumen Wali Kelas', subtitle: 'Administrasi Rombongan Belajar' },
  'extracurricular-docs': { title: 'Dokumen Pembina Eskul', subtitle: 'Pramuka, PMR & Ekstrakurikuler' },
  'other-activities-docs': { title: 'Dokumen Kegiatan Sekolah', subtitle: 'Notula Rapat, ANBK & PPDB' },
  'all-docs': { title: 'Semua Dokumen', subtitle: 'Bank Data Arsip' },
  categories: { title: 'Kategori Dokumen', subtitle: 'Klasifikasi Berkas' },
  verification: { title: 'Verifikasi Berkas', subtitle: 'Pemeriksaan & Telaah Dokumen' },
  reports: { title: 'Rekap & Laporan', subtitle: 'Cetak Buku Induk Arsip' },
  'school-profile': { title: 'Profil Sekolah', subtitle: 'Informasi SMPN 14 Tubaba' },
  upload: { title: 'Unggah Dokumen', subtitle: 'Formulir Berkas Baru' },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenUpload,
  searchQuery,
  setSearchQuery,
  selectedAcademicYear,
  setSelectedAcademicYear,
  academicYears,
  pendingCount,
  onNavigateToVerification,
  schoolProfile,
  isCloudConnected = true,
  currentUser,
  onLoginGoogle,
  onLogoutGoogle,
}) => {
  const currentTabInfo = TAB_TITLES[activeTab] || { title: 'SI-ARKUR', subtitle: schoolProfile.name };
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Contextual Page Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none cursor-pointer"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {currentTabInfo.title}
              </h2>
              <span className="hidden lg:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                NPSN {schoolProfile.npsn}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {currentTabInfo.subtitle || schoolProfile.name}
            </p>
          </div>
        </div>

        {/* Center: Clean Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari modul ajar, nama guru, kelas, surat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Cloud Sync Pill, Year Picker, Pending Alert, Google User & Upload */}
        <div className="flex items-center gap-2">
          {/* Cloud Realtime Status Pill */}
          <div
            title="Database Cloud Firestore Realtime aktif dan tersinkronisasi otomatis di seluruh perangkat"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cloud Realtime</span>
          </div>

          {/* Academic Year Selector */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-500 text-[11px]">T.A:</span>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              aria-label="Pilih Tahun Ajaran"
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Pending Review Quick Icon */}
          <button
            onClick={onNavigateToVerification}
            title={`${pendingCount} dokumen menunggu telaah/verifikasi`}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <FileCheck2 className="w-5 h-5 text-slate-600" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow-xs">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Google Auth Button / Profile Dropdown */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                title={`Login sebagai: ${currentUser.displayName || currentUser.email}`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Akun'}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {(currentUser.displayName || currentUser.email || 'G').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 hidden xl:inline max-w-[120px] truncate">
                  {currentUser.displayName || currentUser.email}
                </span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentUser.displayName || 'Guru SMPN 14 Tubaba'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">
                      {currentUser.email}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Cloud Sync Aktif
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (onLogoutGoogle) onLogoutGoogle();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Akun Google</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginGoogle}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Masuk dengan Akun Google Guru untuk sinkronisasi akun"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span>Masuk Google</span>
            </button>
          )}

          {/* Primary Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden md:inline">Unggah Dokumen</span>
          </button>
        </div>
      </div>
    </header>
  );
};
