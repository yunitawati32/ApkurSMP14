import React, { useState, useRef } from 'react';
import {
  School,
  Award,
  MapPin,
  Mail,
  Phone,
  User,
  ShieldAlert,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  Save,
  Image as ImageIcon,
  Building2,
  Trash2,
  RefreshCw,
  Sparkles,
  Eye,
  FileCheck,
  Plus,
  Users,
} from 'lucide-react';
import { SchoolProfile, CurriculumDoc, CategoryDef, TeacherData } from '../types/curriculum';
import {
  INITIAL_DOCUMENTS,
  INITIAL_CATEGORIES,
  INITIAL_SCHOOL_PROFILE,
  INITIAL_TEACHERS,
  SUBJECT_LIST,
} from '../data/initialData';
import { isLegacyTeacherName } from '../utils/storage';
import {
  optimizeImageFile,
  DEFAULT_PEMDA_LOGO_SVG,
  DEFAULT_SCHOOL_LOGO_SVG,
} from '../utils/imageOptimizer';

interface SchoolProfileViewProps {
  profile: SchoolProfile;
  onUpdateProfile: (newProfile: SchoolProfile) => void;
  documents: CurriculumDoc[];
  categories: CategoryDef[];
  onResetData: () => void;
  onRestoreData: (docs: CurriculumDoc[], cats: CategoryDef[], prof: SchoolProfile) => void;
}

export const SchoolProfileView: React.FC<SchoolProfileViewProps> = ({
  profile,
  onUpdateProfile,
  documents,
  categories,
  onResetData,
  onRestoreData,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>(profile);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [logoNotification, setLogoNotification] = useState<string | null>(null);
  const [isUploadingPemda, setIsUploadingPemda] = useState<boolean>(false);
  const [isUploadingSchool, setIsUploadingSchool] = useState<boolean>(false);

  // Teacher dropdown list management
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single');
  const [teacherName, setTeacherName] = useState<string>('');
  const [teacherNip, setTeacherNip] = useState<string>('');
  const [teacherSubject, setTeacherSubject] = useState<string>('Matematika');
  const [teacherRole, setTeacherRole] = useState<string>('Guru Mata Pelajaran');
  const [bulkTeachersInput, setBulkTeachersInput] = useState<string>('');

  const currentTeachers: TeacherData[] = (
    profile.teachers && profile.teachers.length > 0 ? profile.teachers : INITIAL_TEACHERS
  ).filter((t) => t && t.name && !isLegacyTeacherName(t.name));

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (addMode === 'single') {
      const trimmed = teacherName.trim();
      if (!trimmed) return;
      const newEntry: TeacherData = {
        id: `t-${Date.now()}`,
        name: trimmed,
        nip: teacherNip.trim() || undefined,
        subject: teacherSubject,
        role: teacherRole.trim() || `Guru ${teacherSubject}`,
      };
      const filtered = currentTeachers.filter((t) => t.name.toLowerCase() !== trimmed.toLowerCase());
      const updatedProfile: SchoolProfile = {
        ...profile,
        teachers: [newEntry, ...filtered],
      };
      setFormData(updatedProfile);
      onUpdateProfile(updatedProfile);
      showNotification(`Nama guru "${trimmed}" berhasil ditambahkan ke dropdown!`);
      setTeacherName('');
      setTeacherNip('');
    } else {
      const lines = bulkTeachersInput
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length === 0) return;

      const existingLower = new Set(currentTeachers.map((t) => t.name.toLowerCase()));
      const newEntries: TeacherData[] = [];

      lines.forEach((line, idx) => {
        const parts = line.split(/\s+-\s+|\t|\|/);
        const namePart = parts[0]?.trim();
        const nipPart = parts[1]?.trim();
        if (namePart && !existingLower.has(namePart.toLowerCase())) {
          existingLower.add(namePart.toLowerCase());
          newEntries.push({
            id: `t-${Date.now()}-${idx}`,
            name: namePart,
            nip: nipPart || undefined,
            subject: 'Umum / Satuan Pendidikan',
            role: 'Guru Mata Pelajaran',
          });
        }
      });

      if (newEntries.length > 0) {
        const updatedProfile: SchoolProfile = {
          ...profile,
          teachers: [...newEntries, ...currentTeachers],
        };
        setFormData(updatedProfile);
        onUpdateProfile(updatedProfile);
        showNotification(`Berhasil menambahkan ${newEntries.length} nama guru ke dropdown!`);
      }
      setBulkTeachersInput('');
    }
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    const updatedProfile: SchoolProfile = {
      ...profile,
      teachers: currentTeachers.filter((t) => t.id !== id),
    };
    setFormData(updatedProfile);
    onUpdateProfile(updatedProfile);
    showNotification(`Nama guru "${name}" dihapus dari daftar dropdown.`);
  };

  const pemdaFileInputRef = useRef<HTMLInputElement>(null);
  const schoolFileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string) => {
    setLogoNotification(msg);
    setTimeout(() => setLogoNotification(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Upload Logo Pemda Handler
  const handleUploadPemdaLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be re-selected if needed
    e.target.value = '';

    setIsUploadingPemda(true);
    try {
      const dataUrl = await optimizeImageFile(file, 280, 280);
      const updated: SchoolProfile = {
        ...profile,
        logoPemdaUrl: dataUrl,
      };
      setFormData(updated);
      onUpdateProfile(updated);
      showNotification('Logo Pemkab Tulang Bawang Barat berhasil diunggah dan disimpan!');
    } catch (err) {
      console.error('Failed to process Pemda logo:', err);
      alert('Gagal memproses berkas gambar logo Pemda.');
    } finally {
      setIsUploadingPemda(false);
    }
  };

  // Upload Logo Sekolah Handler
  const handleUploadSchoolLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    setIsUploadingSchool(true);
    try {
      const dataUrl = await optimizeImageFile(file, 280, 280);
      const updated: SchoolProfile = {
        ...profile,
        logoSchoolUrl: dataUrl,
      };
      setFormData(updated);
      onUpdateProfile(updated);
      showNotification('Logo SMPN 14 Tulang Bawang Barat berhasil diunggah dan disimpan!');
    } catch (err) {
      console.error('Failed to process School logo:', err);
      alert('Gagal memproses berkas gambar logo Sekolah.');
    } finally {
      setIsUploadingSchool(false);
    }
  };

  // Reset to default preset logos
  const handleResetPemdaLogo = () => {
    const updated: SchoolProfile = {
      ...profile,
      logoPemdaUrl: DEFAULT_PEMDA_LOGO_SVG,
    };
    setFormData(updated);
    onUpdateProfile(updated);
    showNotification('Logo Pemkab Tulang Bawang Barat dikembalikan ke lambang resmi default.');
  };

  const handleResetSchoolLogo = () => {
    const updated: SchoolProfile = {
      ...profile,
      logoSchoolUrl: DEFAULT_SCHOOL_LOGO_SVG,
    };
    setFormData(updated);
    onUpdateProfile(updated);
    showNotification('Logo Sekolah dikembalikan ke lambang Tut Wuri Handayani default.');
  };

  // Remove logos
  const handleRemovePemdaLogo = () => {
    if (window.confirm('Hapus Logo Pemda dari profil dan Kop Surat?')) {
      const updated: SchoolProfile = {
        ...profile,
        logoPemdaUrl: '',
      };
      setFormData(updated);
      onUpdateProfile(updated);
      showNotification('Logo Pemda dihapus.');
    }
  };

  const handleRemoveSchoolLogo = () => {
    if (window.confirm('Hapus Logo Sekolah dari profil dan Kop Surat?')) {
      const updated: SchoolProfile = {
        ...profile,
        logoSchoolUrl: '',
      };
      setFormData(updated);
      onUpdateProfile(updated);
      showNotification('Logo Sekolah dihapus.');
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      version: '1.0',
      school: profile,
      categories,
      documents,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_SIARKUR_SMPN14_TUBABA_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.documents && parsed.categories) {
          onRestoreData(
            parsed.documents,
            parsed.categories,
            parsed.school || INITIAL_SCHOOL_PROFILE
          );
          alert('Data cadangan berhasil dipulihkan!');
        } else {
          alert('Format berkas cadangan tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca berkas cadangan JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {profile.logoPemdaUrl && (
              <div
                className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shadow-xs"
                title="Logo Pemkab Tulang Bawang Barat"
              >
                <img
                  src={profile.logoPemdaUrl}
                  alt="Logo Pemda Tubaba"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div
              className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shadow-xs"
              title="Logo SMPN 14 Tulang Bawang Barat"
            >
              {profile.logoSchoolUrl ? (
                <img
                  src={profile.logoSchoolUrl}
                  alt="Logo SMPN 14 Tubaba"
                  className="w-full h-full object-contain"
                />
              ) : (
                <School className="w-8 h-8 text-emerald-600" />
              )}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-xs text-slate-500">
              NPSN: <span className="font-mono font-bold text-slate-700">{profile.npsn}</span> •{' '}
              <span className="text-emerald-700 font-semibold">{profile.accreditation}</span> •{' '}
              {profile.regency}, {profile.province}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          {isEditing ? 'Batal Ubah' : 'Edit Identitas Sekolah'}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Profil sekolah berhasil diperbarui!</span>
        </div>
      )}

      {logoNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{logoNotification}</span>
        </div>
      )}

      {/* SECTION KHUSUS: UPLOAD & KELOLA LOGO PEMDA & LOGO SEKOLAH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">
                Menu Upload Logo Lembaga (Pemda & Sekolah)
              </h3>
              <p className="text-xs text-slate-300">
                Otomatis dicantumkan pada Kop Surat resmi, cetak laporan, sampul berkas, dan navigasi
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 self-start sm:self-auto">
            🟢 Tersinkron Real-time Cloud
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KARTU 1: LOGO PEMDA TUBABA */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Logo Pemda Tubaba (Kiri Kop)
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                    Sisi Kiri Kop Surat
                  </span>
                </div>

                {/* Logo Preview Frame */}
                <div className="w-full h-40 rounded-xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-3 relative group">
                  {profile.logoPemdaUrl ? (
                    <img
                      src={profile.logoPemdaUrl}
                      alt="Logo Pemda Tubaba"
                      className="max-h-32 max-w-full object-contain transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-10 h-10 mx-auto mb-1 opacity-40" />
                      <p className="text-xs font-medium">Belum ada logo Pemda</p>
                      <p className="text-[10px]">Klik tombol di bawah untuk memilih gambar</p>
                    </div>
                  )}

                  {isUploadingPemda && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Mengompresi & Menyimpan...</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-2">
                  Lambang resmi Pemerintah Kabupaten Tulang Bawang Barat. Format didukung: <strong>PNG (latar transparan), JPG, SVG, WebP</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <input
                  type="file"
                  ref={pemdaFileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleUploadPemdaLogo}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => pemdaFileInputRef.current?.click()}
                  disabled={isUploadingPemda}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{profile.logoPemdaUrl ? 'Ganti Logo Pemda Tubaba' : 'Unggah Logo Pemda Tubaba'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetPemdaLogo}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer text-center"
                    title="Kembalikan ke lambang Tubaba bawaan"
                  >
                    Pakai Lambang Resmi Tubaba
                  </button>
                  {profile.logoPemdaUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePemdaLogo}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Logo Pemda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* KARTU 2: LOGO SEKOLAH (SMPN 14 TUBABA) */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Logo Sekolah (Kanan Kop & Banner)
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Sisi Kanan Kop Surat
                  </span>
                </div>

                {/* Logo Preview Frame */}
                <div className="w-full h-40 rounded-xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-3 relative group">
                  {profile.logoSchoolUrl ? (
                    <img
                      src={profile.logoSchoolUrl}
                      alt="Logo SMPN 14 Tubaba"
                      className="max-h-32 max-w-full object-contain transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <School className="w-10 h-10 mx-auto mb-1 opacity-40" />
                      <p className="text-xs font-medium">Belum ada logo Sekolah</p>
                      <p className="text-[10px]">Klik tombol di bawah untuk memilih gambar</p>
                    </div>
                  )}

                  {isUploadingSchool && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Mengompresi & Menyimpan...</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-2">
                  Lambang resmi SMPN 14 Tulang Bawang Barat / Tut Wuri Handayani. Format didukung: <strong>PNG, JPG, SVG, WebP</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <input
                  type="file"
                  ref={schoolFileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleUploadSchoolLogo}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => schoolFileInputRef.current?.click()}
                  disabled={isUploadingSchool}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{profile.logoSchoolUrl ? 'Ganti Logo Sekolah' : 'Unggah Logo Sekolah'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetSchoolLogo}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer text-center"
                    title="Kembalikan ke lambang sekolah default"
                  >
                    Pakai Lambang Default Sekolah
                  </button>
                  {profile.logoSchoolUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveSchoolLogo}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Logo Sekolah"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SIMULASI TAMPILAN KOP SURAT DINAS */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">
                  Pratinjau Posisi Logo pada Kop Surat Dinas Resmi
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                (Standar Surat Dinas Pemkab & Kurikulum)
              </span>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-300 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                {/* Sisi Kiri: Logo Pemda */}
                <div className="w-14 h-16 sm:w-16 sm:h-20 flex items-center justify-center shrink-0">
                  {profile.logoPemdaUrl ? (
                    <img
                      src={profile.logoPemdaUrl}
                      alt="Kop Pemda"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-12 h-14 border border-dashed border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400 text-center">
                      Logo Pemda
                    </div>
                  )}
                </div>

                {/* Bagian Tengah: Teks Lembaga */}
                <div className="text-center flex-1 px-2">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600">
                    PEMERINTAH KABUPATEN TULANG BAWANG BARAT
                  </p>
                  <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wide text-slate-800">
                    DINAS PENDIDIKAN DAN KEBUDAYAAN
                  </p>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider">
                    {profile.name}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500">
                    NPSN: {profile.npsn} • {profile.accreditation} • {profile.address}
                  </p>
                </div>

                {/* Sisi Kanan: Logo Sekolah */}
                <div className="w-14 h-16 sm:w-16 sm:h-20 flex items-center justify-center shrink-0">
                  {profile.logoSchoolUrl ? (
                    <img
                      src={profile.logoSchoolUrl}
                      alt="Kop Sekolah"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-12 h-14 border border-dashed border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400 text-center">
                      Logo Sekolah
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full h-0.5 bg-slate-900 mt-2 mb-0.5"></div>
              <div className="w-full h-px bg-slate-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* School Information Form or View */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Perbarui Data Satuan Pendidikan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Nama Sekolah
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                NPSN
              </label>
              <input
                type="text"
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Akreditasi
              </label>
              <input
                type="text"
                value={formData.accreditation}
                onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Alamat Lengkap
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.headmaster}
                onChange={(e) => setFormData({ ...formData, headmaster: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.headmasterNip}
                onChange={(e) => setFormData({ ...formData, headmasterNip: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Wakil Kepala Sekolah Bidang Kurikulum
              </label>
              <input
                type="text"
                value={formData.curriculumVice}
                onChange={(e) => setFormData({ ...formData, curriculumVice: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                NIP Waka Kurikulum
              </label>
              <input
                type="text"
                value={formData.curriculumViceNip}
                onChange={(e) => setFormData({ ...formData, curriculumViceNip: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Kabupaten / Wilayah
              </label>
              <input
                type="text"
                value={formData.regency}
                onChange={(e) => setFormData({ ...formData, regency: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Email Satuan
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Nomor Telepon
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      ) : (
        /* View Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Identitas Sekolah */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <School className="w-4 h-4 text-emerald-600" />
              Identitas Lembaga Pendidikan
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Satuan:</span>
                <span className="font-semibold text-slate-900">{profile.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">NPSN & Status:</span>
                <span className="font-mono font-semibold text-slate-800">{profile.npsn}</span> •{' '}
                <span className="text-emerald-700 font-semibold">{profile.accreditation}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Wilayah:</span>
                <span className="text-slate-800">
                  {profile.district}, {profile.regency}, {profile.province}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Alamat Surat:</span>
                <span className="text-slate-800">{profile.address}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-600">
                <span>Surel: {profile.email}</span>
                <span>Telp: {profile.phone}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Pimpinan & Tim Pengembang Kurikulum */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-emerald-600" />
              Pejabat Penanggung Jawab Kurikulum
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Kepala Satuan Pendidikan:
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{profile.headmaster}</p>
                <p className="text-[11px] text-slate-500 font-mono">NIP. {profile.headmasterNip}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                  Wakil Kepala Sekolah Bidang Kurikulum (Verifikator):
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{profile.curriculumVice}</p>
                <p className="text-[11px] text-slate-600 font-mono">
                  NIP. {profile.curriculumViceNip}
                </p>
                <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                  • Penelaah Utama Dokumen KOSP, Modul Ajar, Asesmen & P5
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daftar Nama Guru & Tenaga Pendidik (Master Dropdown) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Nama Guru & Tenaga Pendidik (Master Dropdown Guru)
              </h3>
              <p className="text-xs text-slate-500">
                Masukkan nama guru di sini agar otomatis muncul di pilihan dropdown saat unggah berkas maupun pencarian dokumen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setAddMode('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                addMode === 'single'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Input 1 Guru
            </button>
            <button
              type="button"
              onClick={() => setAddMode('bulk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                addMode === 'bulk'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Input Banyak Nama Sekaligus
            </button>
          </div>
        </div>

        <form onSubmit={handleAddTeacher} className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80 space-y-3">
          {addMode === 'single' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar Guru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Contoh: Yunita Wati., S.Pd"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  NIP Guru (Opsional)
                </label>
                <input
                  type="text"
                  value={teacherNip}
                  onChange={(e) => setTeacherNip(e.target.value)}
                  placeholder="Contoh: 19850412 201001 1 008"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mata Pelajaran Utama
                </label>
                <select
                  value={teacherSubject}
                  onChange={(e) => setTeacherSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                >
                  {SUBJECT_LIST.filter((s) => s !== 'Semua Mata Pelajaran').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Jabatan / Tugas Tambahan
                </label>
                <input
                  type="text"
                  value={teacherRole}
                  onChange={(e) => setTeacherRole(e.target.value)}
                  placeholder="Contoh: Wali Kelas 7.1"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Ketik / Tempel Daftar Nama Guru (1 Nama per Baris) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={bulkTeachersInput}
                onChange={(e) => setBulkTeachersInput(e.target.value)}
                placeholder={'Contoh:\nYunita Wati., S.Pd\nRohisa., S.Pd\nSiti Halimah., S.Pd'}
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambahkan ke Dropdown Guru</span>
            </button>
          </div>
        </form>

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700">
              Daftar Guru Saat Ini ({currentTeachers.length} Guru Terdaftar)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {currentTeachers.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 hover:border-emerald-300 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{t.name}</p>
                  {t.nip && (
                    <p className="text-[11px] text-slate-500 truncate font-mono">
                      NIP. {t.nip}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteTeacher(t.id, t.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title={`Hapus ${t.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backup & Data Management Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          Manajemen Data & Cadangan Arsip (Backup & Restore)
        </h3>
        <p className="text-xs text-slate-500">
          Amankan basis data arsip kurikulum lokal Anda dengan membuat cadangan berkala atau pulihkan data
          saat berpindah perangkat komputer.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Unduh Cadangan Lengkap (.json)
          </button>

          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Pulihkan Cadangan (.json)</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileRestore}
            />
          </label>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'Yakin ingin memuat ulang data percontohan awal SMPN 14 Tulang Bawang Barat? Semua perubahan baru akan diganti data bawaan.'
                )
              ) {
                onResetData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold cursor-pointer border border-rose-200 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset ke Data Percontohan Awal
          </button>
        </div>
      </div>
    </div>
  );
};
