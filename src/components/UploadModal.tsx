import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Tag,
  BookOpen,
  Layers,
  FolderArchive,
  BookMarked,
  GitMerge,
  CheckSquare,
  CalendarRange,
  CalendarDays,
  Award,
  UserCheck,
  Users,
  Trophy,
  CalendarCheck,
  Plus,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  FilePlus,
  Zap,
} from 'lucide-react';
import {
  CurriculumDoc,
  CategoryDef,
  FileType,
  GradeLevel,
  SemesterType,
  CurriculumModel,
  DocStatus,
} from '../types/curriculum';
import { SUBJECT_LIST, ACADEMIC_YEARS } from '../data/initialData';
import { generateDocCode } from '../utils/storage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryDef[];
  existingDocs: CurriculumDoc[];
  defaultAcademicYear: string;
  defaultCategoryName?: string;
  defaultTargetRole?: string;
  onSuccess: (newDoc: CurriculumDoc | CurriculumDoc[]) => void;
}

interface CategoryFileSlot {
  file: File | null;
  fileDataUrl?: string;
  fileName: string;
  fileSizeStr: string;
  fileType: FileType;
  title: string;
  subCategory?: string;
  notes?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  categories,
  existingDocs,
  defaultAcademicYear,
  defaultCategoryName,
  defaultTargetRole,
  onSuccess,
}) => {
  // Mode: 'batch' (multi-kategori sekaligus) or 'single' (berkas satuan)
  const [uploadMode, setUploadMode] = useState<'batch' | 'single'>('batch');

  // Shared Form Metadata (Diisi 1x untuk semua berkas)
  const [authorName, setAuthorName] = useState<string>('Yunitawati, S.Pd., M.M.');
  const [authorNip, setAuthorNip] = useState<string>('19840618 200903 2 007');
  const [subject, setSubject] = useState<string>('Matematika');
  const [grade, setGrade] = useState<GradeLevel>('Kelas 7');
  const [academicYear, setAcademicYear] = useState<string>(defaultAcademicYear || '2024/2025');
  const [semester, setSemester] = useState<SemesterType>('Ganjil');
  const [curriculumType, setCurriculumType] = useState<CurriculumModel>('Kurikulum Merdeka');
  const [initialStatus, setInitialStatus] = useState<DocStatus>('Menunggu Verifikasi');
  const [tagInput, setTagInput] = useState<string>('Kurikulum Merdeka, SMPN 14 Tubaba');

  // Multi-Category Slots State (Map of categoryId -> CategoryFileSlot)
  const [categorySlots, setCategorySlots] = useState<Record<string, CategoryFileSlot>>({});
  const [activePresetFilter, setActivePresetFilter] = useState<string>('all');
  const [autoMatchMessage, setAutoMatchMessage] = useState<string | null>(null);

  // Single-file state for 'single' mode
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleFileDataUrl, setSingleFileDataUrl] = useState<string | undefined>(undefined);
  const [singleFileSizeStr, setSingleFileSizeStr] = useState<string>('0 KB');
  const [singleFileTypeStr, setSingleFileTypeStr] = useState<FileType>('PDF');
  const [singleCategoryId, setSingleCategoryId] = useState<string>('');
  const [singleTitle, setSingleTitle] = useState<string>('');
  const [singleDescription, setSingleDescription] = useState<string>('');
  const [singleDragActive, setSingleDragActive] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitProgress, setSubmitProgress] = useState<string>('');

  // Initialize or reset category slots when modal opens or metadata changes
  useEffect(() => {
    if (isOpen) {
      if (defaultCategoryName) {
        const found = categories.find(
          (c) =>
            c.name.toLowerCase() === defaultCategoryName.toLowerCase() ||
            c.name.toLowerCase().includes(defaultCategoryName.toLowerCase()) ||
            c.id.toLowerCase() === defaultCategoryName.toLowerCase()
        );
        if (found) {
          setSingleCategoryId(found.id);
        }
      } else if (!singleCategoryId && categories.length > 0) {
        setSingleCategoryId(categories[1]?.id || categories[0]?.id);
      }
    }
  }, [isOpen, defaultCategoryName, categories]);

  if (!isOpen) return null;

  // Helper: Get Icon for category
  const getCategoryIcon = (prefix: string) => {
    switch (prefix) {
      case 'KOSP':
        return <BookMarked className="w-5 h-5 text-indigo-600" />;
      case 'MOD':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'ATP':
        return <GitMerge className="w-5 h-5 text-emerald-600" />;
      case 'ASM':
        return <CheckSquare className="w-5 h-5 text-amber-600" />;
      case 'PRO':
        return <CalendarRange className="w-5 h-5 text-purple-600" />;
      case 'P5':
        return <Sparkles className="w-5 h-5 text-rose-600" />;
      case 'KAL':
        return <CalendarDays className="w-5 h-5 text-cyan-600" />;
      case 'SK':
        return <Award className="w-5 h-5 text-teal-600" />;
      case 'GUR':
        return <UserCheck className="w-5 h-5 text-blue-600" />;
      case 'WLK':
        return <Users className="w-5 h-5 text-emerald-600" />;
      case 'ESK':
        return <Trophy className="w-5 h-5 text-amber-600" />;
      case 'KEG':
        return <CalendarCheck className="w-5 h-5 text-purple-600" />;
      default:
        return <FolderArchive className="w-5 h-5 text-emerald-600" />;
    }
  };

  // Helper: Format file size
  const formatFileSize = (size: number): string => {
    const sizeInKb = size / 1024;
    return sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${Math.round(sizeInKb)} KB`;
  };

  // Helper: Detect FileType
  const detectFileType = (fileName: string): FileType => {
    const ext = fileName.split('.').pop()?.toUpperCase() || '';
    if (ext === 'PDF') return 'PDF';
    if (ext === 'DOC' || ext === 'DOCX') return 'DOCX';
    if (ext === 'XLS' || ext === 'XLSX') return 'XLSX';
    if (ext === 'PPT' || ext === 'PPTX') return 'PPTX';
    if (['PNG', 'JPG', 'JPEG', 'WEBP'].includes(ext)) return 'SCAN';
    return 'LAINNYA';
  };

  // Generate a clean default title for a category
  const generateDefaultTitle = (cat: CategoryDef): string => {
    const isSpecial = ['KOSP', 'KAL', 'SK', 'KEG'].includes(cat.codePrefix);
    if (isSpecial) {
      return `${cat.name} SMPN 14 Tulang Bawang Barat T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'WLK') {
      return `Administrasi Wali ${grade} - ${semester} T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'ESK') {
      return `Program Kerja & Administrasi Ekstrakurikuler T.A ${academicYear}`;
    }
    return `${cat.name} ${subject} ${grade} - Semester ${semester} T.A ${academicYear}`;
  };

  // Set file for a specific category slot
  const handleSetCategoryFile = (cat: CategoryDef, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCategorySlots((prev) => ({
        ...prev,
        [cat.id]: {
          file,
          fileDataUrl: reader.result as string,
          fileName: file.name,
          fileSizeStr: formatFileSize(file.size),
          fileType: detectFileType(file.name),
          title: prev[cat.id]?.title || generateDefaultTitle(cat),
          subCategory: cat.name,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  // Create a draft slot (without physical file yet)
  const handleCreateDraftSlot = (cat: CategoryDef) => {
    setCategorySlots((prev) => ({
      ...prev,
      [cat.id]: {
        file: null,
        fileName: `${generateDefaultTitle(cat).replace(/\s+/g, '_')}.pdf`,
        fileSizeStr: '1.4 MB',
        fileType: 'PDF',
        title: prev[cat.id]?.title || generateDefaultTitle(cat),
        subCategory: cat.name,
      },
    }));
  };

  // Remove a category slot
  const handleRemoveCategorySlot = (catId: string) => {
    setCategorySlots((prev) => {
      const updated = { ...prev };
      delete updated[catId];
      return updated;
    });
  };

  // Update title of a category slot
  const handleUpdateSlotTitle = (catId: string, newTitle: string) => {
    setCategorySlots((prev) => {
      if (!prev[catId]) return prev;
      return {
        ...prev,
        [catId]: {
          ...prev[catId],
          title: newTitle,
        },
      };
    });
  };

  // Smart Multi-File Matcher: Read multiple files and automatically match to categories
  const handleBatchMultiFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let matchedCount = 0;
    const newSlots: Record<string, CategoryFileSlot> = { ...categorySlots };

    Array.from(files).forEach((file) => {
      const lower = file.name.toLowerCase();
      // Match heuristics
      let targetCat: CategoryDef | undefined;

      if (lower.includes('modul') || lower.includes('rpp') || lower.includes('ajar')) {
        targetCat = categories.find((c) => c.codePrefix === 'MOD') || categories.find((c) => c.id === 'modul-ajar');
      } else if (lower.includes('atp') || lower.includes('cp') || lower.includes('tujuan') || lower.includes('capaian')) {
        targetCat = categories.find((c) => c.codePrefix === 'ATP') || categories.find((c) => c.id === 'atp-cp');
      } else if (lower.includes('prota') || lower.includes('promes') || lower.includes('tahunan') || lower.includes('semester')) {
        targetCat = categories.find((c) => c.codePrefix === 'PRO') || categories.find((c) => c.id === 'prota-promes');
      } else if (lower.includes('asesmen') || lower.includes('soal') || lower.includes('kisi') || lower.includes('sts') || lower.includes('sas')) {
        targetCat = categories.find((c) => c.codePrefix === 'ASM') || categories.find((c) => c.id === 'asesmen');
      } else if (lower.includes('p5') || lower.includes('projek') || lower.includes('pancasila')) {
        targetCat = categories.find((c) => c.codePrefix === 'P5') || categories.find((c) => c.id === 'projek-p5');
      } else if (lower.includes('lkpd') || lower.includes('kerja') || lower.includes('lembar')) {
        targetCat = categories.find((c) => c.codePrefix === 'LKP') || categories.find((c) => c.id === 'lkpd-bahan');
      } else if (lower.includes('wali') || lower.includes('kasus') || lower.includes('leger') || lower.includes('visit') || lower.includes('rombel')) {
        targetCat = categories.find((c) => c.codePrefix === 'WLK') || categories.find((c) => c.id === 'dokumen-wali-kelas');
      } else if (lower.includes('pramuka') || lower.includes('eskul') || lower.includes('pmr') || lower.includes('ekstra') || lower.includes('prestasi')) {
        targetCat = categories.find((c) => c.codePrefix === 'ESK') || categories.find((c) => c.id === 'dokumen-pembina-eskul');
      } else if (lower.includes('notula') || lower.includes('rapat') || lower.includes('anbk') || lower.includes('ppdb') || lower.includes('panitia') || lower.includes('iht')) {
        targetCat = categories.find((c) => c.codePrefix === 'KEG') || categories.find((c) => c.id === 'dokumen-kegiatan-lainnya');
      } else if (lower.includes('jurnal') || lower.includes('nilai') || lower.includes('remedial') || lower.includes('pmm') || lower.includes('guru')) {
        targetCat = categories.find((c) => c.codePrefix === 'GUR') || categories.find((c) => c.id === 'dokumen-guru');
      } else if (lower.includes('kosp') || lower.includes('kurikulum')) {
        targetCat = categories.find((c) => c.codePrefix === 'KOSP') || categories.find((c) => c.id === 'kosp');
      } else if (lower.includes('sk') || lower.includes('surat') || lower.includes('tugas') || lower.includes('keputusan')) {
        targetCat = categories.find((c) => c.codePrefix === 'SK') || categories.find((c) => c.id === 'sk-regulasi');
      } else if (lower.includes('jadwal') || lower.includes('kalender')) {
        targetCat = categories.find((c) => c.codePrefix === 'KAL') || categories.find((c) => c.id === 'jadwal-kalender');
      }

      if (!targetCat) {
        // Fallback: assign to first available unfilled category
        targetCat = categories.find((c) => !newSlots[c.id]) || categories[0];
      }

      if (targetCat) {
        matchedCount++;
        newSlots[targetCat.id] = {
          file,
          fileName: file.name,
          fileSizeStr: formatFileSize(file.size),
          fileType: detectFileType(file.name),
          title: generateDefaultTitle(targetCat),
          subCategory: targetCat.name,
        };
      }
    });

    setCategorySlots(newSlots);
    setAutoMatchMessage(
      `Berhasil mencocokkan ${matchedCount} berkas ke kategori dokumen yang sesuai!`
    );
    setTimeout(() => setAutoMatchMessage(null), 5000);
  };

  // Filter Categories by Preset
  const displayedCategories = categories.filter((cat) => {
    if (activePresetFilter === 'all') return true;
    if (activePresetFilter === 'guru') {
      return ['modul-ajar', 'atp-cp', 'prota-promes', 'asesmen', 'dokumen-guru', 'lkpd-bahan', 'projek-p5'].includes(
        cat.id
      );
    }
    if (activePresetFilter === 'wali-kelas') {
      return cat.id === 'dokumen-wali-kelas' || cat.domain === 'wali-kelas';
    }
    if (activePresetFilter === 'pembina-eskul') {
      return cat.id === 'dokumen-pembina-eskul' || cat.domain === 'pembina-eskul';
    }
    if (activePresetFilter === 'kegiatan') {
      return (
        cat.id === 'dokumen-kegiatan-lainnya' ||
        cat.id === 'kosp' ||
        cat.id === 'sk-regulasi' ||
        cat.id === 'jadwal-kalender' ||
        cat.domain === 'kegiatan-lainnya'
      );
    }
    return true;
  });

  // Count how many category slots currently have files ready
  const readySlotsCount = Object.keys(categorySlots).length;

  // Handle Single File Upload Submission
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!singleTitle.trim()) {
      setErrorMsg('Harap isi judul dokumen arsip');
      return;
    }

    const currentCat = categories.find((c) => c.id === singleCategoryId) || categories[0];
    setIsSubmitting(true);

    const generatedCode = generateDocCode(currentCat.codePrefix || 'DOC', academicYear, existingDocs);

    const tagsArray = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newDoc: CurriculumDoc = {
      id: `doc-${Date.now()}`,
      code: generatedCode,
      title: singleTitle.trim(),
      category: currentCat.name,
      subCategory: currentCat.name,
      domain: currentCat.domain || 'kurikulum',
      targetRole: defaultTargetRole || undefined,
      curriculumType,
      grade,
      subject,
      academicYear,
      semester,
      authorName: authorName.trim() || 'Guru SMPN 14 Tubaba',
      authorNip: authorNip.trim() || undefined,
      uploadDate: new Date().toISOString().slice(0, 10),
      fileName: singleFile ? singleFile.name : `${singleTitle.replace(/\s+/g, '_')}.pdf`,
      fileType: singleFileTypeStr,
      fileSize: singleFile ? singleFileSizeStr : '1.5 MB',
      fileDataUrl: singleFileDataUrl,
      tags: tagsArray.length > 0 ? tagsArray : ['Kurikulum Merdeka', 'SMPN 14 Tubaba'],
      description:
        singleDescription.trim() ||
        `Dokumen ${currentCat.name} mata pelajaran ${subject} ${grade} semester ${semester} tahun ajaran ${academicYear}.`,
      status: initialStatus,
      downloadCount: 0,
    };

    setTimeout(() => {
      onSuccess(newDoc);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  // Handle Multi-Category Batch Submission (Upload All Files at Once)
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const slotKeys = Object.keys(categorySlots);
    if (slotKeys.length === 0) {
      setErrorMsg(
        'Belum ada berkas kategori yang dipilih. Silakan pilih berkas pada salah satu atau beberapa kategori di bawah.'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(`Menyiapkan ${slotKeys.length} berkas arsip...`);

    const tagsArray = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const createdDocs: CurriculumDoc[] = [];
    const runningDocsList = [...existingDocs];

    slotKeys.forEach((catId, index) => {
      const slot = categorySlots[catId];
      const catObj = categories.find((c) => c.id === catId) || categories[0];

      const generatedCode = generateDocCode(
        catObj.codePrefix || 'DOC',
        academicYear,
        runningDocsList
      );

      const newDoc: CurriculumDoc = {
        id: `doc-${Date.now()}-${index}`,
        code: generatedCode,
        title: slot.title.trim() || generateDefaultTitle(catObj),
        category: catObj.name,
        subCategory: slot.subCategory || catObj.name,
        domain: catObj.domain || 'kurikulum',
        targetRole:
          catObj.domain === 'wali-kelas'
            ? `Wali ${grade}`
            : catObj.domain === 'pembina-eskul'
            ? 'Pembina Ekstrakurikuler'
            : defaultTargetRole || undefined,
        curriculumType,
        grade,
        subject,
        academicYear,
        semester,
        authorName: authorName.trim() || 'Guru SMPN 14 Tubaba',
        authorNip: authorNip.trim() || undefined,
        uploadDate: new Date().toISOString().slice(0, 10),
        fileName: slot.fileName,
        fileType: slot.fileType,
        fileSize: slot.fileSizeStr,
        fileDataUrl: slot.fileDataUrl,
        tags: [
          ...tagsArray,
          catObj.name,
          subject,
          grade,
        ],
        description: `Arsip resmi ${catObj.name} untuk mata pelajaran ${subject} ${grade} semester ${semester} T.A ${academicYear}. Diunggah via paket arsip lengkap SMPN 14 Tubaba.`,
        status: initialStatus,
        downloadCount: 0,
      };

      createdDocs.push(newDoc);
      runningDocsList.push(newDoc);
    });

    setTimeout(() => {
      setSubmitProgress(`Menyimpan ${createdDocs.length} berkas ke bank data arsip...`);
      setTimeout(() => {
        onSuccess(createdDocs);
        setIsSubmitting(false);
        onClose();
      }, 500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/40">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Pusat Unggah Berkas & Arsip</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  SMPN 14 Tubaba
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {uploadMode === 'batch'
                  ? 'Isi identitas guru 1 kali, unggah semua kategori berkas sekaligus ke bank arsip'
                  : 'Unggah satu berkas dokumen arsip secara cepat'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tab */}
        <div className="bg-slate-100/90 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setUploadMode('batch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                uploadMode === 'batch'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Unggah Semua Kategori Sekaligus (Paket Lengkap)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 font-extrabold ml-1">
                Rekomendasi
              </span>
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                uploadMode === 'single'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Unggah Berkas Satuan (1 Dokumen)</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
            <span>Tahun Ajaran:</span>
            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {academicYear}
            </span>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {autoMatchMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{autoMatchMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* 1. BAGIAN IDENTITAS & TAHUN AJARAN (Diisi 1x Bersama)    */}
          {/* ======================================================== */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                  1
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Data Pendidik & Rombongan Belajar (Diisi Sekali untuk Semua Berkas)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 hidden md:inline">
                Otomatis diterapkan ke seluruh kategori yang diunggah
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Nama Guru */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Guru / Penanggung Jawab <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Contoh: Yunitawati, S.Pd., M.M."
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              {/* NIP Guru */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  NIP Guru (Opsional)
                </label>
                <input
                  type="text"
                  value={authorNip}
                  onChange={(e) => setAuthorNip(e.target.value)}
                  placeholder="Contoh: 19840618 200903 2 007"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono"
                />
              </div>

              {/* Mata Pelajaran */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800"
                >
                  {SUBJECT_LIST.filter((s) => s !== 'Semua Mata Pelajaran').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tingkat / Kelas */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tingkat / Jenjang Kelas
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800"
                >
                  <option value="Kelas 7">Kelas 7</option>
                  <option value="Kelas 8">Kelas 8</option>
                  <option value="Kelas 9">Kelas 9</option>
                  <option value="Fase D">Fase D (Lintas Jenjang)</option>
                  <option value="Semua Tingkat">Semua Tingkat</option>
                </select>
              </div>

              {/* Tahun Ajaran */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tahun Ajaran
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 font-mono font-bold"
                >
                  {ACADEMIC_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as SemesterType)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                  <option value="Tahunan / Penuh">Tahunan / Penuh</option>
                </select>
              </div>

              {/* Model Kurikulum */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Model Kurikulum
                </label>
                <select
                  value={curriculumType}
                  onChange={(e) => setCurriculumType(e.target.value as CurriculumModel)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800"
                >
                  <option value="Kurikulum Merdeka">Kurikulum Merdeka (Fase D)</option>
                  <option value="Kurikulum 2013">Kurikulum 2013</option>
                  <option value="Muatan Lokal / Khusus">Muatan Lokal Lampung / Khusus</option>
                </select>
              </div>
            </div>

            {/* Quick Status and Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/60">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Label / Tag Kata Kunci (Opsional)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Contoh: Kurikulum Merdeka, Diferensiasi, Asesmen"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Alur Verifikasi Awal
                </label>
                <div className="flex items-center gap-4 py-1">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="initStatus"
                      value="Menunggu Verifikasi"
                      checked={initialStatus === 'Menunggu Verifikasi'}
                      onChange={() => setInitialStatus('Menunggu Verifikasi')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-emerald-800">Ajukan Telaah / Verifikasi</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="initStatus"
                      value="Draft"
                      checked={initialStatus === 'Draft'}
                      onChange={() => setInitialStatus('Draft')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-600">Simpan Draft Dulu</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* MODE 1: UNGGAH SEMUA KATEGORI SEKALIGUS (BATCH / PAKET)  */}
          {/* ======================================================== */}
          {uploadMode === 'batch' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Menu Unggah Berkas Tiap Kategori Dokumen
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Pilih berkas pada kategori yang ingin Anda arsipkan (bisa sebagian atau semua kategori)
                    </p>
                  </div>
                </div>

                {/* Smart Multi-File Selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    ref={multiFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      handleBatchMultiFiles(e.target.files);
                      if (e.target) e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => multiFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                    title="Pilih banyak file sekaligus, sistem akan mencocokkan ke kategori berdasarkan nama file"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>⚡ Pilih Banyak File Sekaligus (Auto-Detect)</span>
                  </button>
                </div>
              </div>

              {/* Preset Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 text-[11px] font-medium shrink-0 mr-1">Filter Kategori:</span>
                <button
                  type="button"
                  onClick={() => setActivePresetFilter('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                    activePresetFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Kategori ({categories.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActivePresetFilter('guru')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                    activePresetFilter === 'guru'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  📘 Paket Perangkat Guru (Modul, ATP, Prota, Nilai)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePresetFilter('wali-kelas')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                    activePresetFilter === 'wali-kelas'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  👥 Paket Wali Kelas (Kasus, Leger, Home Visit)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePresetFilter('pembina-eskul')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                    activePresetFilter === 'pembina-eskul'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  🏆 Paket Eskul (Pramuka, PMR, Rohis)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePresetFilter('kegiatan')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                    activePresetFilter === 'kegiatan'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  📋 Paket Kegiatan Sekolah (Notula, ANBK, SK)
                </button>
              </div>

              {/* Grid of All Categories Upload Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {displayedCategories.map((cat) => {
                  const slot = categorySlots[cat.id];
                  const hasFile = Boolean(slot);

                  return (
                    <div
                      key={cat.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        hasFile
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Category Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              hasFile ? 'bg-emerald-100' : 'bg-slate-100'
                            }`}
                          >
                            {getCategoryIcon(cat.codePrefix)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                [{cat.codePrefix}]
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 leading-tight">
                                {cat.name}
                              </h5>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {cat.description}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {hasFile ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Siap Diunggah</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-100">
                              Belum ada berkas
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Category Body / Upload Area */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        {hasFile ? (
                          /* Berkas Sudah Dipilih */
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-emerald-200 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate text-[11px]">
                                    {slot.fileName}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    {slot.fileSizeStr} • Format {slot.fileType}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <label className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer text-[11px] font-semibold">
                                  <span>Ganti</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleSetCategoryFile(cat, e.target.files[0]);
                                      }
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCategorySlot(cat.id)}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Hapus dari daftar unggah"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Editable Document Title */}
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                Judul Berkas Arsip:
                              </label>
                              <input
                                type="text"
                                value={slot.title}
                                onChange={(e) => handleUpdateSlotTitle(cat.id, e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                        ) : (
                          /* Belum Ada Berkas - Tombol Pilih */
                          <div className="flex items-center gap-2">
                            <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-dashed border-slate-300 hover:border-emerald-400 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                              <UploadCloud className="w-4 h-4 text-emerald-600" />
                              <span>Pilih Berkas ({cat.codePrefix})</span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleSetCategoryFile(cat, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => handleCreateDraftSlot(cat)}
                              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium rounded-xl transition-colors cursor-pointer shrink-0"
                              title="Gunakan draf template resmi untuk kategori ini"
                            >
                              + Draf Cepat
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 2: UNGGAH SATUAN (SINGLE DOCUMENT)                  */}
          {/* ======================================================== */}
          {uploadMode === 'single' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                  2
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Formulir Berkas Dokumen Satuan
                </h4>
              </div>

              {/* Drag & Drop File Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  File Dokumen <span className="text-rose-500">*</span>
                </label>
                <div
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setSingleDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setSingleDragActive(false);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setSingleDragActive(true);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setSingleDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const f = e.dataTransfer.files[0];
                      setSingleFile(f);
                      setSingleFileSizeStr(formatFileSize(f.size));
                      setSingleFileTypeStr(detectFileType(f.name));
                      if (!singleTitle) {
                        setSingleTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                      }
                    }
                  }}
                  onClick={() => singleFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    singleDragActive
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : singleFile
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60'
                  }`}
                >
                  <input
                    ref={singleFileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const f = e.target.files[0];
                        setSingleFile(f);
                        setSingleFileSizeStr(formatFileSize(f.size));
                        setSingleFileTypeStr(detectFileType(f.name));
                        if (!singleTitle) {
                          setSingleTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                        }
                      }
                    }}
                  />

                  {singleFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900 truncate max-w-sm">
                          {singleFile.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {singleFileSizeStr} • Format {singleFileTypeStr}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                      <p className="text-xs font-bold text-slate-800">
                        Klik untuk memilih berkas, atau seret ke area ini
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mendukung format PDF, DOCX, XLSX, PPTX, atau Scan (Maks 25 MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Judul & Kategori Satuan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Dokumen <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={singleCategoryId}
                    onChange={(e) => {
                      setSingleCategoryId(e.target.value);
                      const cat = categories.find((c) => c.id === e.target.value);
                      if (cat && !singleTitle) {
                        setSingleTitle(generateDefaultTitle(cat));
                      }
                    }}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        [{cat.codePrefix}] {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Dokumen Arsip <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                    placeholder="Contoh: Modul Ajar Matematika Bab 2 Aljabar Semester Ganjil"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Deskripsi Dokumen Satuan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi / Catatan Singkat
                </label>
                <textarea
                  rows={2}
                  value={singleDescription}
                  onChange={(e) => setSingleDescription(e.target.value)}
                  placeholder="Tuliskan keterangan berkas atau materi pokok pembelajaran..."
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            {uploadMode === 'batch' ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  📁 {readySlotsCount} berkas
                </span>
                <span>telah siap diunggah dari</span>
                <span className="font-semibold text-slate-800">
                  {displayedCategories.length} kategori
                </span>
                {readySlotsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setCategorySlots({})}
                    className="text-rose-600 hover:underline text-[11px] ml-2 cursor-pointer"
                  >
                    Kosongkan Semua
                  </button>
                )}
              </div>
            ) : (
              <span>1 berkas dokumen satuan siap diarsipkan</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>

            {uploadMode === 'batch' ? (
              <button
                type="button"
                disabled={isSubmitting || readySlotsCount === 0}
                onClick={handleBatchSubmit}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                  readySlotsCount === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-900/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>{submitProgress || 'Mengunggah Berkas...'}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>
                      Unggah Semua Berkas Sekaligus ({readySlotsCount} Dokumen)
                    </span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || !singleTitle.trim()}
                onClick={handleSingleSubmit}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Menyimpan Dokumen...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Simpan Dokumen ke Arsip</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
