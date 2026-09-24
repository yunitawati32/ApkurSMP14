import React from 'react';
import {
  LayoutDashboard,
  FolderArchive,
  UploadCloud,
  Layers,
  FileCheck2,
  Printer,
  School,
  X,
  BookOpen,
  UserCheck,
  Users,
  Trophy,
  CalendarCheck,
  HelpCircle,
} from 'lucide-react';
import { ActiveTab, CategoryDef, SchoolProfile } from '../types/curriculum';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  categories: CategoryDef[];
  pendingCount: number;
  totalDocsCount: number;
  teacherDocsCount?: number;
  homeroomDocsCount?: number;
  eskulDocsCount?: number;
  activityDocsCount?: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  schoolProfile: SchoolProfile;
  selectedAcademicYear: string;
  onOpenUpload?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  setSelectedCategory,
  pendingCount,
  totalDocsCount,
  teacherDocsCount = 0,
  homeroomDocsCount = 0,
  eskulDocsCount = 0,
  activityDocsCount = 0,
  isOpenMobile,
  setIsOpenMobile,
  schoolProfile,
  selectedAcademicYear,
  onOpenUpload,
}) => {
  const primaryMenuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Beranda Ringkasan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'teacher-docs' as ActiveTab,
      label: 'Dokumen Guru',
      icon: UserCheck,
      badge: teacherDocsCount,
    },
    {
      id: 'homeroom-docs' as ActiveTab,
      label: 'Dokumen Wali Kelas',
      icon: Users,
      badge: homeroomDocsCount,
    },
    {
      id: 'extracurricular-docs' as ActiveTab,
      label: 'Dokumen Pembina Eskul',
      icon: Trophy,
      badge: eskulDocsCount,
    },
    {
      id: 'other-activities-docs' as ActiveTab,
      label: 'Dokumen Kegiatan Sekolah',
      icon: CalendarCheck,
      badge: activityDocsCount,
    },
    {
      id: 'all-docs' as ActiveTab,
      label: 'Semua Berkas Arsip',
      icon: FolderArchive,
      badge: totalDocsCount,
    },
  ];

  const adminMenuItems = [
    {
      id: 'verification' as ActiveTab,
      label: 'Verifikasi Berkas',
      icon: FileCheck2,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'categories' as ActiveTab,
      label: 'Kategori Dokumen',
      icon: Layers,
      badge: null,
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Rekap & Laporan',
      icon: Printer,
      badge: null,
    },
    {
      id: 'school-profile' as ActiveTab,
      label: 'Profil Sekolah',
      icon: School,
      badge: null,
    },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    if (tabId !== 'all-docs') {
      setSelectedCategory(null);
    }
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold tracking-wider text-emerald-400">SI-ARKUR</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                    Tubaba
                  </span>
                </div>
                <h1 className="text-xs font-bold text-white leading-tight mt-0.5">
                  SMPN 14 Tubaba
                </h1>
              </div>
            </div>
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Upload Action */}
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              if (onOpenUpload) {
                onOpenUpload();
              } else {
                handleNavClick('upload');
              }
              setIsOpenMobile(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ Unggah Semua Berkas</span>
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Main Menu Section */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              Menu Utama
            </p>
            <nav className="space-y-1">
              {primaryMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold ${
                          isActive
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin & Reports Section */}
          <div className="pt-2 border-t border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              Pemeriksaan & Laporan
            </p>
            <nav className="space-y-1">
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold ${
                          item.badgeColor || (isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-800 text-xs bg-slate-950/50 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Database Cloud</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Realtime Aktif
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Tahun Ajaran</span>
            <span className="text-emerald-400 font-mono font-bold">{selectedAcademicYear}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {schoolProfile.address}
          </p>
        </div>
      </aside>
    </>
  );
};
