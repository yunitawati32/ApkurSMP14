import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  FileText,
  FileSpreadsheet,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  BookOpen,
  CalendarCheck,
  CheckSquare,
  Sparkles,
  ChevronDown,
  Layers,
  Trash2,
  Users,
} from 'lucide-react';
import { CurriculumDoc, DocStatus, SchoolProfile, TeacherData } from '../types/curriculum';
import { SUBJECT_LIST, INITIAL_TEACHERS } from '../data/initialData';
import { isLegacyTeacherName } from '../utils/storage';

interface TeacherDocsViewProps {
  documents: CurriculumDoc[];
  schoolProfile: SchoolProfile;
  selectedAcademicYear: string;
  onOpenDocDetail: (doc: CurriculumDoc) => void;
  onDownloadDoc: (doc: CurriculumDoc) => void;
  onOpenUpload: (prefilledCategory?: string, prefilledRole?: string) => void;
  onUpdateStatus: (docId: string, status: DocStatus, notes?: string) => void;
  onUpdateTeachers?: (updatedTeachers: TeacherData[], message?: string) => void;
}

export const TeacherDocsView: React.FC<TeacherDocsViewProps> = ({
  documents,
  schoolProfile,
  selectedAcademicYear,
  onOpenDocDetail,
  onDownloadDoc,
  onOpenUpload,
  onUpdateStatus,
  onUpdateTeachers,
}) => {
  // Filter for teacher documents (by domain 'guru', category, or tags)
  const standardCategories = [
    'Kalender pendidikan',
    'Rincian Minggu Efektif',
    'Capaian Pembelajaran (CP)',
    'Alur Tujuan Pembelajaran (ATP)',
    'Program Tahunan',
    'Program Semester',
    'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)',
    'Modul Ajar/RPP',
    'Dokumen & Portofolio Guru',
    'Modul Ajar & RPP',
    'Alur Tujuan Pembelajaran (ATP/CP)',
    'Prota & Promes',
  ];

  const teacherDocs = documents.filter(
    (d) =>
      d.domain === 'guru' ||
      standardCategories.includes(d.category) ||
      d.tags?.some((t) =>
        ['Jurnal Mengajar', 'Daftar Nilai', 'PMM', 'Remedial', 'Agenda Guru', 'KKTP', 'RME'].includes(t)
      )
  );

  const [selectedSubTab, setSelectedSubTab] = useState<string>('Semua');
  const [selectedSubject, setSelectedSubject] = useState<string>('Semua');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [showChecklistGuide, setShowChecklistGuide] = useState<boolean>(false);
  const [showManageTeachers, setShowManageTeachers] = useState<boolean>(false);

  // Add teacher form state
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single');
  const [newName, setNewName] = useState<string>('');
  const [newNip, setNewNip] = useState<string>('');
  const [newSubject, setNewSubject] = useState<string>('Matematika');
  const [newRole, setNewRole] = useState<string>('Guru Mata Pelajaran');
  const [bulkInput, setBulkInput] = useState<string>('');

  const masterTeachers: TeacherData[] = (
    schoolProfile.teachers && schoolProfile.teachers.length > 0
      ? schoolProfile.teachers
      : INITIAL_TEACHERS
  ).filter((t) => t && t.name && !isLegacyTeacherName(t.name));

  // Extract unique teachers from both master list and uploaded docs
  const teachersList = Array.from(
    new Set([
      ...masterTeachers.map((t) => t.name),
      ...teacherDocs.map((d) => d.authorName).filter((n) => n && !isLegacyTeacherName(n)),
    ])
  ).filter(Boolean);

  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateTeachers) return;

    if (addMode === 'single') {
      const trimmed = newName.trim();
      if (!trimmed) return;
      const newEntry: TeacherData = {
        id: `t-${Date.now()}`,
        name: trimmed,
        nip: newNip.trim() || undefined,
        subject: newSubject,
        role: newRole.trim() || `Guru ${newSubject}`,
      };
      const filtered = masterTeachers.filter((t) => t.name.toLowerCase() !== trimmed.toLowerCase());
      onUpdateTeachers([newEntry, ...filtered], `Nama guru "${trimmed}" berhasil ditambahkan ke dropdown!`);
      setSelectedTeacher(trimmed);
      setNewName('');
      setNewNip('');
    } else {
      const lines = bulkInput
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length === 0) return;

      const existingLower = new Set(masterTeachers.map((t) => t.name.toLowerCase()));
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
        onUpdateTeachers(
          [...newEntries, ...masterTeachers],
          `Berhasil menambahkan ${newEntries.length} nama guru ke daftar dropdown!`
        );
      }
      setBulkInput('');
    }
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (!onUpdateTeachers) return;
    const updated = masterTeachers.filter((t) => t.id !== id);
    onUpdateTeachers(updated, `Nama guru "${name}" dihapus dari daftar dropdown.`);
    if (selectedTeacher === name) {
      setSelectedTeacher('Semua');
    }
  };

  const filteredDocs = teacherDocs.filter((doc) => {
    if (selectedSubTab !== 'Semua') {
      if (selectedSubTab === '1. Kalender Pendidikan') {
        if (doc.category !== 'Kalender pendidikan' && !doc.title.toLowerCase().includes('kalender')) return false;
      } else if (selectedSubTab === '2. Rincian Minggu Efektif') {
        if (doc.category !== 'Rincian Minggu Efektif' && !doc.title.toLowerCase().includes('efektif')) return false;
      } else if (selectedSubTab === '3. CP & ATP') {
        if (
          doc.category !== 'Capaian Pembelajaran (CP)' &&
          doc.category !== 'Alur Tujuan Pembelajaran (ATP)' &&
          !doc.title.toLowerCase().includes('cp') &&
          !doc.title.toLowerCase().includes('atp')
        )
          return false;
      } else if (selectedSubTab === '4. Prota & Promes') {
        if (
          doc.category !== 'Program Tahunan' &&
          doc.category !== 'Program Semester' &&
          !doc.title.toLowerCase().includes('prota') &&
          !doc.title.toLowerCase().includes('promes')
        )
          return false;
      } else if (selectedSubTab === '5. KKTP') {
        if (
          doc.category !== 'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)' &&
          !doc.title.toLowerCase().includes('kktp') &&
          !doc.title.toLowerCase().includes('kriteria')
        )
          return false;
      } else if (selectedSubTab === '6. Modul Ajar/RPP') {
        if (
          doc.category !== 'Modul Ajar/RPP' &&
          !doc.title.toLowerCase().includes('modul') &&
          !doc.title.toLowerCase().includes('rpp')
        )
          return false;
      } else if (selectedSubTab === 'Jurnal & Nilai') {
        const lower = doc.title.toLowerCase();
        if (
          !lower.includes('jurnal') &&
          !lower.includes('nilai') &&
          !lower.includes('presensi') &&
          doc.subCategory !== 'Jurnal Mengajar' &&
          doc.subCategory !== 'Daftar Nilai'
        )
          return false;
      }
    }
    if (selectedSubject !== 'Semua' && doc.subject !== selectedSubject) return false;
    if (selectedTeacher !== 'Semua' && doc.authorName !== selectedTeacher) return false;
    if (statusFilter !== 'Semua' && doc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        doc.title.toLowerCase().includes(q) ||
        doc.authorName.toLowerCase().includes(q) ||
        doc.code.toLowerCase().includes(q) ||
        doc.subject.toLowerCase().includes(q) ||
        doc.tags?.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const verifiedCount = teacherDocs.filter((d) => d.status === 'Terverifikasi').length;
  const pendingCount = teacherDocs.filter((d) => d.status === 'Menunggu Verifikasi').length;

  const standardChecklist = [
    { no: 1, title: 'Kalender pendidikan', desc: 'Jadwal tatap muka KBM, hari efektif belajar & kalender sekolah' },
    { no: 2, title: 'Rincian Minggu Efektif', desc: 'Analisis perhitungan minggu efektif dan total alokasi jam tatap muka' },
    { no: 3, title: 'Capaian Pembelajaran (CP)', desc: 'Pemetaan kompetensi dan elemen materi resmi Fase D' },
    { no: 4, title: 'Alur Tujuan Pembelajaran (ATP)', desc: 'Rangkaian tujuan pembelajaran yang tersusun logis dan terurut' },
    { no: 5, title: 'Program Tahunan', desc: 'Rencana alokasi waktu satu tahun ajaran penuh per materi TP' },
    { no: 6, title: 'Program Semester', desc: 'Distribusi materi KBM per pekan untuk semester ganjil dan genap' },
    { no: 7, title: 'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)', desc: 'Rubrik deskripsi kriteria dan skala interval ketuntasan asesmen' },
    { no: 8, title: 'Modul Ajar/RPP', desc: 'Perangkat ajar berdiferensiasi lengkap langkah KBM & asesmen formatif' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Administrasi & Portofolio Guru Mata Pelajaran</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Dokumen Administrasi Guru
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Pusat arsip kelengkapan perangkat ajar, buku jurnal harian mengajar, buku rekap nilai,
              analisis ketuntasan, dan portofolio pelatihan mandiri PMM dewan guru {schoolProfile.name}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
            <button
              onClick={() => onOpenUpload('Dokumen & Portofolio Guru', 'Guru Mapel')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Unggah Dokumen Guru
            </button>
            <button
              onClick={() => setShowManageTeachers(!showManageTeachers)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-100 text-xs font-bold rounded-xl border border-emerald-400/40 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>+ Input / Kelola Nama Guru ({masterTeachers.length})</span>
            </button>
            <button
              onClick={() => setShowChecklistGuide(!showChecklistGuide)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-blue-300" />
              <span>12 Kelengkapan Guru</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showChecklistGuide ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Total Arsip Guru</span>
            <span className="text-xl font-bold font-mono">{teacherDocs.length}</span>
            <span className="text-[10px] text-blue-300 block">dokumen aktif</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-emerald-300 block">Terverifikasi Waka</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{verifiedCount}</span>
            <span className="text-[10px] text-emerald-200/70 block">memenuhi syarat</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-amber-300 block">Menunggu Telaah</span>
            <span className="text-xl font-bold font-mono text-amber-400">{pendingCount}</span>
            <span className="text-[10px] text-amber-200/70 block">dalam antrean</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-purple-300 block">Dewan Guru Pengunggah</span>
            <span className="text-xl font-bold font-mono text-purple-300">{teachersList.length}</span>
            <span className="text-[10px] text-purple-200/70 block">guru aktif</span>
          </div>
        </div>
      </div>

      {/* Panel Input & Kelola Daftar Nama Guru untuk Dropdown */}
      {showManageTeachers && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Input & Kelola Daftar Nama Guru (Otomatis Masuk ke Semua Dropdown)
                </h3>
                <p className="text-xs text-slate-500">
                  Tambahkan nama guru satu per satu atau banyak sekaligus agar langsung tersedia di pilihan dropdown unggah berkas dan filter guru.
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

          <form onSubmit={handleAddTeacherSubmit} className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 space-y-3">
            {addMode === 'single' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar Guru <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
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
                    value={newNip}
                    onChange={(e) => setNewNip(e.target.value)}
                    placeholder="Contoh: 19850412 201001 1 008"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mata Pelajaran Utama
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
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
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
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
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={'Contoh:\nYunita Wati., S.Pd\nRohisa., S.Pd\nSiti Halimah., S.Pd'}
                  className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowManageTeachers(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-xl cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan ke Dropdown Guru</span>
              </button>
            </div>
          </form>

          {/* Daftar Guru Saat Ini */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                Daftar Guru Terdaftar di Dropdown ({masterTeachers.length} Guru)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {masterTeachers.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 hover:border-emerald-300 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{t.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {t.subject || 'Guru Mapel'} {t.nip ? `• NIP. ${t.nip}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTeacher(t.id, t.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title={`Hapus ${t.name} dari dropdown`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 12-Item Teacher Admin Checklist Collapsible */}
      {showChecklistGuide && (
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                12 Standar Kelengkapan Administrasi Guru Kurikulum Merdeka (Kemdikbudristek)
              </h3>
            </div>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full">
              Pedoman Supervisi Akademik Tubaba
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {standardChecklist.map((item) => (
              <div
                key={item.no}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5"
              >
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {item.no}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          'Semua',
          '1. Kalender Pendidikan',
          '2. Rincian Minggu Efektif',
          '3. CP & ATP',
          '4. Prota & Promes',
          '5. KKTP',
          '6. Modul Ajar/RPP',
          'Jurnal & Nilai',
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedSubTab(tab)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedSubTab === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berkas guru, judul, nama guru, kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Teacher Filter */}
          <select
            value={selectedTeacher}
            onChange={(e) => {
              if (e.target.value === '__ADD_NEW_TEACHER__') {
                setShowManageTeachers(true);
                return;
              }
              setSelectedTeacher(e.target.value);
            }}
            aria-label="Filter Nama Guru"
            className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua">Semua Guru ({teachersList.length})</option>
            {teachersList.map((teacher) => (
              <option key={teacher} value={teacher}>
                {teacher}
              </option>
            ))}
            <option value="__ADD_NEW_TEACHER__">+ Tambah Nama Guru Baru...</option>
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUBJECT_LIST.map((subj) => (
              <option key={subj} value={subj === 'Semua Mata Pelajaran' ? 'Semua' : subj}>
                {subj}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Terverifikasi">Terverifikasi</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Perlu Revisi">Perlu Revisi</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <UserCheck className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">Tidak ada dokumen guru yang cocok</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau bersihkan filter di atas untuk melihat dokumen lainnya.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Dokumen & Kode</th>
                  <th className="py-3 px-4">Mata Pelajaran & Jenjang</th>
                  <th className="py-3 px-4">Guru Penyusun</th>
                  <th className="py-3 px-4">Tanggal Unggah</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {doc.code}
                        </span>
                        {doc.subCategory && (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {doc.subCategory}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onOpenDocDetail(doc)}
                        className="font-bold text-slate-900 hover:text-blue-600 text-left line-clamp-2 transition-colors cursor-pointer"
                      >
                        {doc.title}
                      </button>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {doc.fileType} • {doc.fileSize}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{doc.subject}</span>
                      <span className="text-[11px] text-slate-500">{doc.grade}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{doc.authorName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {doc.authorNip || '-'}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-600 font-mono text-[11px]">{doc.uploadDate}</span>
                      <span className="text-[10px] text-slate-400 block">{doc.semester}</span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          doc.status === 'Terverifikasi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'Menunggu Verifikasi'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {doc.status === 'Terverifikasi' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {doc.status === 'Menunggu Verifikasi' && <Clock className="w-3 h-3 text-amber-600" />}
                        {doc.status === 'Perlu Revisi' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        <span>{doc.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDocDetail(doc)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Lihat Detail & Telaah"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDownloadDoc(doc)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Unduh Berkas"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {doc.status !== 'Terverifikasi' && (
                          <button
                            onClick={() =>
                              onUpdateStatus(
                                doc.id,
                                'Terverifikasi',
                                'Administrasi guru telah ditelaah dan lengkap.'
                              )
                            }
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                            title="Setujui Berkas"
                          >
                            Setujui
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
