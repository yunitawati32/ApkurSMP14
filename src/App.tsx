/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DocumentListView } from './components/DocumentListView';
import { CategoryManagementView } from './components/CategoryManagementView';
import { VerificationView } from './components/VerificationView';
import { ReportExportView } from './components/ReportExportView';
import { SchoolProfileView } from './components/SchoolProfileView';
import { TeacherDocsView } from './components/TeacherDocsView';
import { HomeroomDocsView } from './components/HomeroomDocsView';
import { ExtracurricularDocsView } from './components/ExtracurricularDocsView';
import { OtherActivitiesDocsView } from './components/OtherActivitiesDocsView';
import { UploadModal } from './components/UploadModal';
import { DocumentDetailModal } from './components/DocumentDetailModal';

import {
  CurriculumDoc,
  CategoryDef,
  SchoolProfile,
  ActiveTab,
  DocStatus,
  AppUser,
} from './types/curriculum';
import {
  getStoredDocs,
  saveStoredDocs,
  getStoredCategories,
  saveStoredCategories,
  getStoredSchoolProfile,
  saveStoredSchoolProfile,
  downloadDocumentFile,
  exportDocsToCsv,
} from './utils/storage';
import {
  INITIAL_DOCUMENTS,
  INITIAL_CATEGORIES,
  INITIAL_SCHOOL_PROFILE,
  ACADEMIC_YEARS,
} from './data/initialData';
import {
  subscribeToCurriculumDocs,
  subscribeToCategories,
  subscribeToSchoolProfile,
  saveBatchDocsToCloud,
  updateDocInCloud,
  deleteDocFromCloud,
  saveCategoryToCloud,
  saveSchoolProfileToCloud,
  seedCloudIfEmpty,
  auth,
  loginWithGoogle,
  logoutUser,
  getGoogleAuthErrorMessage,
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthModal } from './components/AuthModal';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  // Primary States
  const [documents, setDocuments] = useState<CurriculumDoc[]>(() => getStoredDocs());
  const [categories, setCategories] = useState<CategoryDef[]>(() => getStoredCategories());
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => getStoredSchoolProfile());

  // User Auth & Cloud Realtime States
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('siarkur_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authError, setAuthError] = useState<{ title: string; detail: string; actionHint: string } | null>(null);

  // UI Navigation States
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2024/2025');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [activeDetailDoc, setActiveDetailDoc] = useState<CurriculumDoc | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // 1. Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          role: 'Pendidik Akun Google',
          isGoogleAuth: true,
        };
        setCurrentUser(appUser);
        localStorage.setItem('siarkur_active_user', JSON.stringify(appUser));
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Cloud Realtime Firestore Subscriptions
  useEffect(() => {
    // Seed initial data if cloud is empty
    seedCloudIfEmpty();

    // Subscribe to curriculum documents in real-time
    const unsubDocs = subscribeToCurriculumDocs(
      (cloudDocs) => {
        if (cloudDocs && cloudDocs.length > 0) {
          setDocuments(cloudDocs);
        }
        setIsCloudConnected(true);
      },
      (error) => {
        console.warn('Realtime sync docs info:', error);
      }
    );

    // Subscribe to categories in real-time
    const unsubCats = subscribeToCategories((cloudCats) => {
      if (cloudCats && cloudCats.length > 0) {
        setCategories(cloudCats);
      }
    });

    // Subscribe to school profile in real-time
    const unsubSchool = subscribeToSchoolProfile((cloudProfile) => {
      if (cloudProfile && cloudProfile.name) {
        setSchoolProfile(cloudProfile);
      }
    });

    return () => {
      unsubDocs();
      unsubCats();
      unsubSchool();
    };
  }, []);

  // Sync with localStorage as fast local cache
  useEffect(() => {
    saveStoredDocs(documents);
  }, [documents]);

  useEffect(() => {
    saveStoredCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveStoredSchoolProfile(schoolProfile);
  }, [schoolProfile]);

  // Document Operations (Synced to Cloud in Realtime)
  const handleAddNewDocument = (newDocs: CurriculumDoc | CurriculumDoc[]) => {
    const docsArray = Array.isArray(newDocs) ? newDocs : [newDocs];
    setDocuments((prev) => [...docsArray, ...prev]);

    // Save to Firestore cloud database
    saveBatchDocsToCloud(docsArray).catch((err) => {
      console.error('Failed to sync new documents to cloud:', err);
    });

    if (docsArray.length === 1) {
      showToast(`Dokumen "${docsArray[0].title}" berhasil diunggah dan disinkronkan ke Cloud!`);
    } else {
      showToast(
        `Berhasil mengunggah ${docsArray.length} berkas sekaligus ke Cloud Realtime!`,
        'success'
      );
    }
    setActiveTab('all-docs');
  };

  const handleUpdateDocStatus = (docId: string, newStatus: DocStatus, notes?: string) => {
    const updatedDate = new Date().toISOString().slice(0, 10);
    const updates: Partial<CurriculumDoc> = {
      status: newStatus,
      verifiedBy: newStatus === 'Terverifikasi' ? schoolProfile.curriculumVice : undefined,
      verifiedDate: newStatus === 'Terverifikasi' ? updatedDate : undefined,
      verificationNotes: notes !== undefined ? notes : undefined,
    };

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            ...updates,
          };
        }
        return d;
      })
    );

    // Sync status change to Firestore
    updateDocInCloud(docId, updates).catch((err) => {
      console.error('Failed to update status in cloud:', err);
    });

    if (activeDetailDoc && activeDetailDoc.id === docId) {
      setActiveDetailDoc((prev) =>
        prev
          ? {
              ...prev,
              ...updates,
            }
          : null
      );
    }

    showToast(`Status dokumen berhasil diubah menjadi: ${newStatus} (Tersimpan di Cloud)`);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (activeDetailDoc?.id === docId) {
      setActiveDetailDoc(null);
    }

    // Delete from Firestore
    deleteDocFromCloud(docId).catch((err) => {
      console.error('Failed to delete doc from cloud:', err);
    });

    showToast('Dokumen berhasil dihapus dari Cloud Arsip', 'info');
  };

  const handleDownloadDocument = (doc: CurriculumDoc) => {
    // Increment download counter
    const newCount = (doc.downloadCount || 0) + 1;
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, downloadCount: newCount } : d))
    );
    updateDocInCloud(doc.id, { downloadCount: newCount }).catch((err) =>
      console.warn('Update download count error:', err)
    );

    downloadDocumentFile(doc);
    showToast(`Mengunduh berkas: ${doc.fileName}`);
  };

  const handleExportCsv = (docsToExport: CurriculumDoc[]) => {
    exportDocsToCsv(docsToExport, schoolProfile.name);
    showToast(`Mengekspor ${docsToExport.length} data arsip ke format CSV/Excel`);
  };

  const handleAddCategory = (newCat: CategoryDef) => {
    setCategories((prev) => [...prev, newCat]);
    saveCategoryToCloud(newCat).catch((err) => {
      console.error('Failed to save category to cloud:', err);
    });
    showToast(`Kategori "${newCat.name}" berhasil ditambahkan ke Cloud!`);
  };

  const handleUpdateSchoolProfile = (newProfile: SchoolProfile) => {
    setSchoolProfile(newProfile);
    saveStoredSchoolProfile(newProfile);
    saveSchoolProfileToCloud(newProfile).catch((err) => {
      console.error('Failed to sync school profile to cloud:', err);
    });
    showToast('Profil sekolah & logo berhasil diperbarui dan disinkronkan ke Cloud!');
  };

  const handleResetData = () => {
    setDocuments(INITIAL_DOCUMENTS);
    setCategories(INITIAL_CATEGORIES);
    setSchoolProfile(INITIAL_SCHOOL_PROFILE);
    saveStoredDocs(INITIAL_DOCUMENTS);
    saveStoredCategories(INITIAL_CATEGORIES);
    saveStoredSchoolProfile(INITIAL_SCHOOL_PROFILE);
    saveBatchDocsToCloud(INITIAL_DOCUMENTS);
    saveSchoolProfileToCloud(INITIAL_SCHOOL_PROFILE);
    showToast('Data berhasil diatur ulang ke data standar awal dan disimpan ke Cloud');
  };

  const handleRestoreData = (
    restoredDocs: CurriculumDoc[],
    restoredCats: CategoryDef[],
    restoredProf: SchoolProfile
  ) => {
    setDocuments(restoredDocs);
    setCategories(restoredCats);
    setSchoolProfile(restoredProf);
    saveBatchDocsToCloud(restoredDocs);
    saveSchoolProfileToCloud(restoredProf);
    showToast('Data arsip berhasil dipulihkan dan disinkronkan ke Cloud!');
  };

  const handleLoginGoogle = async () => {
    try {
      setAuthError(null);
      const user = await loginWithGoogle();
      const appUser: AppUser = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: 'Pendidik Akun Google',
        isGoogleAuth: true,
      };
      setCurrentUser(appUser);
      localStorage.setItem('siarkur_active_user', JSON.stringify(appUser));
      showToast(`Selamat datang, ${user.displayName || user.email}! Akun Google terhubung.`);
    } catch (err: any) {
      console.error('Login failed:', err);
      const diag = err?.diagnostics || getGoogleAuthErrorMessage(err);
      setAuthError(diag);
      setIsAuthModalOpen(true);
      throw err;
    }
  };

  const handleSelectTeacherProfile = (profile: AppUser) => {
    setCurrentUser(profile);
    localStorage.setItem('siarkur_active_user', JSON.stringify(profile));
    showToast(`Berhasil masuk sebagai: ${profile.displayName} (${profile.role || 'Pendidik'})`);
  };

  const handleLogout = async () => {
    try {
      await logoutUser().catch(() => {});
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('siarkur_active_user');
      showToast('Berhasil keluar identitas pendidik.', 'info');
    }
  };

  // Pending Count
  const pendingReviewCount = documents.filter((d) => d.status === 'Menunggu Verifikasi').length;

  // Domain Counts for Sidebar Badges
  const teacherDocsCount = documents.filter(
    (d) =>
      d.domain === 'guru' ||
      d.category === 'Dokumen & Portofolio Guru' ||
      d.category === 'Modul Ajar & RPP' ||
      d.category === 'Alur Tujuan Pembelajaran (ATP/CP)' ||
      d.category === 'Prota & Promes' ||
      d.tags?.some((t) =>
        ['Jurnal Mengajar', 'Daftar Nilai', 'PMM', 'Remedial', 'Agenda Guru'].includes(t)
      )
  ).length;

  const homeroomDocsCount = documents.filter(
    (d) =>
      d.domain === 'wali-kelas' ||
      d.category === 'Dokumen Administrasi Wali Kelas' ||
      d.targetRole?.toLowerCase().includes('wali') ||
      d.tags?.some((t) =>
        ['Wali Kelas', 'Home Visit', 'Buku Kasus', 'Leger Nilai', 'Presensi Bulanan', 'Rombel'].includes(t)
      )
  ).length;

  const eskulDocsCount = documents.filter(
    (d) =>
      d.domain === 'pembina-eskul' ||
      d.category === 'Dokumen Pembina Ekstrakurikuler' ||
      d.targetRole?.toLowerCase().includes('pembina') ||
      d.tags?.some((t) =>
        ['Pramuka', 'PMR', 'Eskul', 'Paskibra', 'Futsal', 'Tari Tradisional', 'Prestasi', 'Gudep'].includes(t)
      )
  ).length;

  const activityDocsCount = documents.filter(
    (d) =>
      d.domain === 'kegiatan-lainnya' ||
      d.category === 'Dokumen Kegiatan Sekolah & Notula' ||
      d.tags?.some((t) =>
        ['Notula Rapat', 'ANBK', 'PPDB', 'IHT', 'Workshop', 'PHBN', 'Akreditasi', 'Komite'].includes(t)
      )
  ).length;

  const [uploadCategory, setUploadCategory] = useState<string | undefined>(undefined);
  const [uploadRole, setUploadRole] = useState<string | undefined>(undefined);

  const handleOpenUploadWithPreset = (catName?: string, roleName?: string) => {
    setUploadCategory(catName);
    setUploadRole(roleName);
    setIsUploadOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'upload') {
            handleOpenUploadWithPreset();
          } else {
            setActiveTab(tab);
          }
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        pendingCount={pendingReviewCount}
        totalDocsCount={documents.length}
        teacherDocsCount={teacherDocsCount}
        homeroomDocsCount={homeroomDocsCount}
        eskulDocsCount={eskulDocsCount}
        activityDocsCount={activityDocsCount}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        schoolProfile={schoolProfile}
        selectedAcademicYear={selectedAcademicYear}
        onOpenUpload={() => handleOpenUploadWithPreset()}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenUpload={() => handleOpenUploadWithPreset()}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            if (activeTab !== 'all-docs') {
              setActiveTab('all-docs');
            }
          }}
          selectedAcademicYear={selectedAcademicYear}
          setSelectedAcademicYear={setSelectedAcademicYear}
          academicYears={ACADEMIC_YEARS}
          pendingCount={pendingReviewCount}
          onNavigateToVerification={() => setActiveTab('verification')}
          schoolProfile={schoolProfile}
          isCloudConnected={isCloudConnected}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Toast Alert */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              documents={documents}
              categories={categories}
              schoolProfile={schoolProfile}
              selectedAcademicYear={selectedAcademicYear}
              onNavigateToCategory={(catName) => {
                setSelectedCategory(catName);
                setActiveTab('all-docs');
              }}
              onNavigateToAllDocs={() => {
                setSelectedCategory(null);
                setActiveTab('all-docs');
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onOpenUpload={() => handleOpenUploadWithPreset()}
              onOpenDocDetail={(doc) => setActiveDetailDoc(doc)}
              onDownloadDoc={handleDownloadDocument}
            />
          )}

          {activeTab === 'all-docs' && (
            <DocumentListView
              documents={documents}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedAcademicYear={selectedAcademicYear}
              onOpenDocDetail={(doc) => setActiveDetailDoc(doc)}
              onDownloadDoc={handleDownloadDocument}
              onDeleteDoc={handleDeleteDocument}
              onOpenUpload={() => handleOpenUploadWithPreset()}
              onExportCsv={handleExportCsv}
            />
          )}

          {/* New Views: Dokumen Guru, Wali Kelas, Pembina Eskul, Kegiatan Lainnya */}
          {activeTab === 'teacher-docs' && (
            <TeacherDocsView
              documents={documents}
              schoolProfile={schoolProfile}
              selectedAcademicYear={selectedAcademicYear}
              onOpenDocDetail={(doc) => setActiveDetailDoc(doc)}
              onDownloadDoc={handleDownloadDocument}
              onOpenUpload={(cat, role) => handleOpenUploadWithPreset(cat, role)}
              onUpdateStatus={handleUpdateDocStatus}
            />
          )}

          {activeTab === 'homeroom-docs' && (
            <HomeroomDocsView
              documents={documents}
              schoolProfile={schoolProfile}
              selectedAcademicYear={selectedAcademicYear}
              onOpenDocDetail={(doc) => setActiveDetailDoc(doc)}
              onDownloadDoc={handleDownloadDocument}
              onOpenUpload={(cat, role) => handleOpenUploadWithPreset(cat, role)}
              onUpdateStatus={handleUpdateDocStatus}
            />
          )}

          {activeTab === 'extracurricular-docs' && (
            <ExtracurricularDocsView
              documents={documents}
              schoolProfile={schoolProfile}
              selectedAcademicYear={selectedAcademicYear}
              onOpenDocDetail={(doc) => setActiveDetailDoc(doc)}
              onDownloadDoc={handleDownloadDocument}
              onOpenUpload={(cat, role) => handleOpenUploadWithPreset(cat, role)}
              onUpdateStatus={handleUpdateDocStatus}
            />
          )}

          {activeTab === 'other-activities-docs' && (
            <OtherActivitiesDocsView
              documents={documents}
              schoolProfile={schoolProfile}
              selectedAcademicYear={selectedAcademicYear}
              onOpenDocDetail={(doc) => setActiveDetailDoc(doc)}
              onDownloadDoc={handleDownloadDocument}
              onOpenUpload={(cat, role) => handleOpenUploadWithPreset(cat, role)}
              onUpdateStatus={handleUpdateDocStatus}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManagementView
              categories={categories}
              documents={documents}
              onSelectCategoryFilter={(catName) => {
                setSelectedCategory(catName);
                setActiveTab('all-docs');
              }}
              onAddCategory={handleAddCategory}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationView
              documents={documents}
              schoolProfile={schoolProfile}
              onUpdateStatus={handleUpdateDocStatus}
              onOpenDocDetail={(doc) => setActiveDetailDoc(doc)}
              onDownloadDoc={handleDownloadDocument}
            />
          )}

          {activeTab === 'reports' && (
            <ReportExportView
              documents={documents}
              categories={categories}
              schoolProfile={schoolProfile}
              selectedAcademicYear={selectedAcademicYear}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'school-profile' && (
            <SchoolProfileView
              profile={schoolProfile}
              onUpdateProfile={handleUpdateSchoolProfile}
              documents={documents}
              categories={categories}
              onResetData={handleResetData}
              onRestoreData={handleRestoreData}
            />
          )}
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setUploadCategory(undefined);
          setUploadRole(undefined);
        }}
        categories={categories}
        existingDocs={documents}
        defaultAcademicYear={selectedAcademicYear}
        defaultCategoryName={uploadCategory}
        defaultTargetRole={uploadRole}
        currentUser={currentUser}
        onSuccess={handleAddNewDocument}
      />

      {/* Document Detail & Verification Modal */}
      <DocumentDetailModal
        isOpen={Boolean(activeDetailDoc)}
        onClose={() => setActiveDetailDoc(null)}
        document={activeDetailDoc}
        schoolProfile={schoolProfile}
        onDownload={handleDownloadDocument}
        onUpdateStatus={handleUpdateDocStatus}
      />

      {/* Teacher & Google Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthError(null);
        }}
        onLoginGoogle={handleLoginGoogle}
        onSelectTeacherProfile={handleSelectTeacherProfile}
        authError={authError}
        clearAuthError={() => setAuthError(null)}
      />
    </div>
  );
}
