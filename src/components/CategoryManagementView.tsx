import React, { useState } from 'react';
import {
  Layers,
  Plus,
  ArrowRight,
  FolderArchive,
  BookMarked,
  FileText,
  GitMerge,
  CheckSquare,
  CalendarRange,
  Sparkles,
  CalendarDays,
  Award,
  BookOpen,
  UserCheck,
  Users,
  Trophy,
  CalendarCheck,
} from 'lucide-react';
import { CategoryDef, CurriculumDoc } from '../types/curriculum';

interface CategoryManagementViewProps {
  categories: CategoryDef[];
  documents: CurriculumDoc[];
  onSelectCategoryFilter: (categoryName: string) => void;
  onAddCategory: (newCat: CategoryDef) => void;
}

export const CategoryManagementView: React.FC<CategoryManagementViewProps> = ({
  categories,
  documents,
  onSelectCategoryFilter,
  onAddCategory,
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatPrefix, setNewCatPrefix] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatPrefix.trim()) return;

    const newCategory: CategoryDef = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      codePrefix: newCatPrefix.trim().toUpperCase(),
      iconName: 'FolderArchive',
      description: newCatDesc.trim() || `Klasifikasi dokumen ${newCatName}`,
      color: 'text-emerald-600',
      bgLight: 'bg-emerald-50 border-emerald-200',
    };

    onAddCategory(newCategory);
    setNewCatName('');
    setNewCatPrefix('');
    setNewCatDesc('');
    setShowAddForm(false);
  };

  const getCategoryIcon = (prefix: string) => {
    switch (prefix) {
      case 'KAL':
        return <CalendarDays className="w-6 h-6 text-cyan-600" />;
      case 'RME':
        return <CalendarRange className="w-6 h-6 text-indigo-600" />;
      case 'CP':
        return <CheckSquare className="w-6 h-6 text-blue-600" />;
      case 'ATP':
        return <GitMerge className="w-6 h-6 text-emerald-600" />;
      case 'PROTA':
      case 'PRO':
        return <BookMarked className="w-6 h-6 text-amber-600" />;
      case 'PROMES':
        return <Layers className="w-6 h-6 text-purple-600" />;
      case 'KKTP':
      case 'ASM':
        return <Award className="w-6 h-6 text-teal-600" />;
      case 'MOD':
      case 'RPP':
        return <FileText className="w-6 h-6 text-rose-600" />;
      case 'KOSP':
        return <BookMarked className="w-6 h-6 text-indigo-600" />;
      case 'P5':
        return <Sparkles className="w-6 h-6 text-rose-600" />;
      case 'SK':
        return <Award className="w-6 h-6 text-teal-600" />;
      case 'GUR':
        return <UserCheck className="w-6 h-6 text-blue-600" />;
      case 'WLK':
        return <Users className="w-6 h-6 text-emerald-600" />;
      case 'ESK':
        return <Trophy className="w-6 h-6 text-amber-600" />;
      case 'KEG':
        return <CalendarCheck className="w-6 h-6 text-purple-600" />;
      default:
        return <FolderArchive className="w-6 h-6 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Kelengkapan Perangkat Pembelajaran
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
              8 Komponen Standar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Struktur 8 kategori arsip perangkat ajar guru SMPN 14 Tulang Bawang Barat yang dirancang sesuai
            standar administrasi Kurikulum Merdeka, telaah supervisi akademik, dan kesiapan akreditasi sekolah.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori Baru
        </button>
      </div>

      {/* Add Category Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreateCategory}
          className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Buat Kategori Klasifikasi Baru
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕ Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nama Kategori <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Modul Kokurikuler"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kode Prefiks Arsip <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={5}
                placeholder="Contoh: KOK / EXT"
                value={newCatPrefix}
                onChange={(e) => setNewCatPrefix(e.target.value.toUpperCase())}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Keterangan / Deskripsi
              </label>
              <input
                type="text"
                placeholder="Deskripsi singkat jenis dokumen ini..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Simpan Kategori
            </button>
          </div>
        </form>
      )}

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, idx) => {
          const matchingDocs = documents.filter((d) => d.category === cat.name);
          const count = matchingDocs.length;
          const verifiedCount = matchingDocs.filter((d) => d.status === 'Terverifikasi').length;

          const standardOrder = [
            'kalender-pendidikan',
            'rincian-minggu-efektif',
            'capaian-pembelajaran',
            'alur-tujuan-pembelajaran',
            'program-tahunan',
            'program-semester',
            'kktp',
            'modul-ajar-rpp',
          ];
          const itemIndex = standardOrder.indexOf(cat.id);
          const itemNum = itemIndex !== -1 ? itemIndex + 1 : idx + 1;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      {getCategoryIcon(cat.codePrefix)}
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      #{itemNum}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {cat.codePrefix}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">Kode Klasifikasi</p>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{cat.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="font-bold text-slate-900 font-mono">{count} berkas</span>
                  <span className="text-[11px] text-emerald-600 block">
                    {verifiedCount} terverifikasi
                  </span>
                </div>

                <button
                  onClick={() => onSelectCategoryFilter(cat.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-emerald-200/60"
                >
                  <span>Buka Berkas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational Guideline on Taxonomy */}
      <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Pedoman 8 Kelengkapan Perangkat Pembelajaran Guru SMPN 14 Tubaba</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Sesuai dengan ketentuan Kurikulum Merdeka dan instrumen supervisi mutu SMPN 14 Tulang Bawang Barat,
          setiap pendidik diwajibkan melengkapi 8 komponen perangkat pembelajaran pada awal tahun ajaran dan semester:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-emerald-400 font-bold block mb-1">1. Kalender Pendidikan</span>
            <p className="text-[11px] text-slate-400">Jadwal KBM, pekan efektif, dan libur dinas.</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-emerald-400 font-bold block mb-1">2. Rincian Minggu Efektif</span>
            <p className="text-[11px] text-slate-400">Analisis pekan KBM dan alokasi total JP.</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-emerald-400 font-bold block mb-1">3. Capaian Pembelajaran (CP)</span>
            <p className="text-[11px] text-slate-400">Kompetensi dan elemen materi Fase D.</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-emerald-400 font-bold block mb-1">4. Alur Tujuan Pembelajaran</span>
            <p className="text-[11px] text-slate-400">Rangkaian TP yang tersusun logis dan runtut.</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-emerald-400 font-bold block mb-1">5. Program Tahunan</span>
            <p className="text-[11px] text-slate-400">Rencana alokasi waktu satu tahun ajaran.</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-emerald-400 font-bold block mb-1">6. Program Semester</span>
            <p className="text-[11px] text-slate-400">Distribusi materi per pekan tiap semester.</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-emerald-400 font-bold block mb-1">7. KKTP</span>
            <p className="text-[11px] text-slate-400">Kriteria ketercapaian TP dan rubrik asesmen.</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-emerald-400 font-bold block mb-1">8. Modul Ajar/RPP</span>
            <p className="text-[11px] text-slate-400">Rencana aksi KBM berdiferensiasi dan asesmen.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
