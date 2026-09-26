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
  Eye,
} from 'lucide-react';
import {
  CurriculumDoc,
  CategoryDef,
  FileType,
  GradeLevel,
  SemesterType,
  CurriculumModel,
  DocStatus,
  AppUser,
  TeacherData,
} from '../types/curriculum';
import { SUBJECT_LIST, ACADEMIC_YEARS, INITIAL_TEACHERS, SUMATIF_CATEGORIES } from '../data/initialData';
import { generateDocCode, isLegacyTeacherName, normalizeTeacherName } from '../utils/storage';
import { saveFileToCache } from '../utils/fileCache';
import { FilePreviewModal } from './FilePreviewModal';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryDef[];
  existingDocs: CurriculumDoc[];
  defaultAcademicYear: string;
  defaultCategoryName?: string;
  defaultTargetRole?: string;
  currentUser?: AppUser | null;
  teachers?: TeacherData[];
  onUpdateTeachers?: (updatedTeachers: TeacherData[], message?: string) => void;
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
  currentUser,
  teachers = INITIAL_TEACHERS,
  onUpdateTeachers,
  onSuccess,
}) => {
  // Mode: 'batch' (multi-kategori perangkat ajar), 'single' (berkas satuan), or 'sumatif' (nilai sumatif)
  const [uploadMode, setUploadMode] = useState<'batch' | 'single' | 'sumatif'>('batch');

  // Shared Form Metadata (Diisi 1x untuk semua berkas)
  const [authorName, setAuthorName] = useState<string>(() => currentUser?.displayName || 'Yunita Wati., S.Pd');
  const [authorNip, setAuthorNip] = useState<string>(() => currentUser?.nip || '19840618 200903 2 007');
  const [subject, setSubject] = useState<string>('Matematika');
  const [grade, setGrade] = useState<GradeLevel>('Kelas 7');
  const [academicYear, setAcademicYear] = useState<string>(defaultAcademicYear || '2026/2027');
  const [semester, setSemester] = useState<SemesterType>('Ganjil');
  const [curriculumType, setCurriculumType] = useState<CurriculumModel>('Kurikulum Merdeka');
  const [initialStatus, setInitialStatus] = useState<DocStatus>('Menunggu Verifikasi');
  const [tagInput, setTagInput] = useState<string>('Kurikulum Merdeka, SMPN 14 Tubaba');

  // Add New Teacher to Dropdown State
  const [isAddingTeacher, setIsAddingTeacher] = useState<boolean>(false);
  const [newTeacherMode, setNewTeacherMode] = useState<'single' | 'bulk'>('single');
  const [newTeacherName, setNewTeacherName] = useState<string>('');
  const [newTeacherNip, setNewTeacherNip] = useState<string>('');
  const [newTeacherSubject, setNewTeacherSubject] = useState<string>('Matematika');
  const [bulkTeacherNames, setBulkTeacherNames] = useState<string>('');

  // Merged list of teachers for dropdown
  const teacherOptions: TeacherData[] = React.useMemo(() => {
    const base = (teachers.length > 0 ? [...teachers] : [...INITIAL_TEACHERS]).filter(
      (t) => t && t.name && !isLegacyTeacherName(t.name)
    );
    const existingNames = new Set(base.map((t) => t.name.toLowerCase()));
    existingDocs.forEach((d) => {
      const cleanName = d.authorName ? normalizeTeacherName(d.authorName) : '';
      if (cleanName && !isLegacyTeacherName(cleanName) && !existingNames.has(cleanName.toLowerCase())) {
        existingNames.add(cleanName.toLowerCase());
        base.push({
          id: `doc-author-${base.length}`,
          name: cleanName,
          nip: d.authorNip,
          subject: d.subject,
        });
      }
    });
    return base;
  }, [teachers, existingDocs]);

  const handleSelectTeacherFromDropdown = (val: string) => {
    if (val === '__ADD_NEW__') {
      setIsAddingTeacher(true);
      return;
    }
    setAuthorName(val);
    const found = teacherOptions.find((t) => t.name === val);
    if (found) {
      if (found.nip) setAuthorNip(found.nip);
      if (found.subject && SUBJECT_LIST.includes(found.subject) && found.subject !== 'Semua Mata Pelajaran') {
        setSubject(found.subject);
      }
    }
  };

  const handleSaveNewTeacher = () => {
    const currentList = teachers.length > 0 ? [...teachers] : [...INITIAL_TEACHERS];

    if (newTeacherMode === 'single') {
      const trimmedName = newTeacherName.trim();
      if (!trimmedName) return;

      const newEntry: TeacherData = {
        id: `t-${Date.now()}`,
        name: trimmedName,
        nip: newTeacherNip.trim() || undefined,
        subject: newTeacherSubject,
        role: `Guru ${newTeacherSubject}`,
      };

      const filtered = currentList.filter((t) => t.name.toLowerCase() !== trimmedName.toLowerCase());
      const updated = [newEntry, ...filtered];
      if (onUpdateTeachers) {
        onUpdateTeachers(updated, `Nama guru "${trimmedName}" berhasil ditambahkan ke dropdown!`);
      }
      setAuthorName(trimmedName);
      if (newTeacherNip.trim()) setAuthorNip(newTeacherNip.trim());
      if (newTeacherSubject) setSubject(newTeacherSubject);
      setNewTeacherName('');
      setNewTeacherNip('');
      setIsAddingTeacher(false);
    } else {
      const lines = bulkTeacherNames
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length === 0) return;

      const newEntries: TeacherData[] = [];
      const existingLower = new Set(currentList.map((t) => t.name.toLowerCase()));

      lines.forEach((line, idx) => {
        // Support format: "Nama Guru - NIP" or just "Nama Guru"
        const parts = line.split(/\s+-\s+|\t|\|/);
        const namePart = parts[0]?.trim();
        const nipPart = parts[1]?.trim();
        if (namePart && !existingLower.has(namePart.toLowerCase())) {
          existingLower.add(namePart.toLowerCase());
          newEntries.push({
            id: `t-${Date.now()}-${idx}`,
            name: namePart,
            nip: nipPart || undefined,
            subject: subject,
            role: 'Guru Mata Pelajaran',
          });
        }
      });

      if (newEntries.length > 0) {
        const updated = [...newEntries, ...currentList];
        if (onUpdateTeachers) {
          onUpdateTeachers(
            updated,
            `Berhasil menambahkan ${newEntries.length} nama guru baru ke dalam dropdown!`
          );
        }
        setAuthorName(newEntries[0].name);
        if (newEntries[0].nip) setAuthorNip(newEntries[0].nip);
      }
      setBulkTeacherNames('');
      setIsAddingTeacher(false);
    }
  };

  // Multi-Category Slots State (Map of categoryId -> CategoryFileSlot)
  const [categorySlots, setCategorySlots] = useState<Record<string, CategoryFileSlot>>({});
  const [sumatifSlots, setSumatifSlots] = useState<Record<string, CategoryFileSlot>>({});
  const [activePresetFilter, setActivePresetFilter] = useState<string>('all');
  const [autoMatchMessage, setAutoMatchMessage] = useState<string | null>(null);

  // Single-file state for 'single' mode
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const sumatifMultiFileInputRef = useRef<HTMLInputElement>(null);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleFileDataUrl, setSingleFileDataUrl] = useState<string | undefined>(undefined);
  const [singleFileSizeStr, setSingleFileSizeStr] = useState<string>('0 KB');
  const [singleFileTypeStr, setSingleFileTypeStr] = useState<FileType>('PDF');
  const [singleCategoryId, setSingleCategoryId] = useState<string>('');
  const [singleTitle, setSingleTitle] = useState<string>('');
  const [singleDescription, setSingleDescription] = useState<string>('');
  const [singleDragActive, setSingleDragActive] = useState<boolean>(false);

  // File Preview Modal state before uploading
  const [previewRawFile, setPreviewRawFile] = useState<{
    name: string;
    type: FileType;
    dataUrl?: string;
    size?: string;
    title?: string;
    category?: string;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitProgress, setSubmitProgress] = useState<string>('');

  const handleSingleFileSelect = (file: File) => {
    setSingleFile(file);
    setSingleFileSizeStr(formatFileSize(file.size));
    const ft = detectFileType(file.name);
    setSingleFileTypeStr(ft);
    if (!singleTitle) {
      setSingleTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSingleFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Initialize or reset category slots when modal opens or metadata changes
  useEffect(() => {
    if (isOpen) {
      if (defaultCategoryName) {
        const lowerDef = defaultCategoryName.toLowerCase();
        if (
          lowerDef.includes('sumatif') ||
          lowerDef.includes('nilai mid') ||
          lowerDef.includes('nilai sas') ||
          lowerDef === 'leger' ||
          lowerDef.includes('ujian sekolah')
        ) {
          setUploadMode('sumatif');
        }
        const found = categories.find(
          (c) =>
            c.name.toLowerCase() === lowerDef ||
            c.name.toLowerCase().includes(lowerDef) ||
            c.id.toLowerCase() === lowerDef
        );
        if (found) {
          setSingleCategoryId(found.id);
        }
      } else if (!singleCategoryId && categories.length > 0) {
        setSingleCategoryId(categories[1]?.id || categories[0]?.id);
      }
      if (defaultAcademicYear) {
        setAcademicYear(defaultAcademicYear);
      }
      if (currentUser?.displayName) {
        setAuthorName(currentUser.displayName);
      }
      if (currentUser?.nip) {
        setAuthorNip(currentUser.nip);
      }
    }
  }, [isOpen, defaultCategoryName, categories, currentUser]);

  if (!isOpen) return null;

  // Helper: Get Icon for category
  const getCategoryIcon = (prefix: string) => {
    switch (prefix) {
      case 'KAL':
        return <CalendarDays className="w-5 h-5 text-cyan-600" />;
      case 'RME':
        return <CalendarRange className="w-5 h-5 text-indigo-600" />;
      case 'CP':
        return <CheckSquare className="w-5 h-5 text-blue-600" />;
      case 'ATP':
        return <GitMerge className="w-5 h-5 text-emerald-600" />;
      case 'PROTA':
      case 'PRO':
        return <BookMarked className="w-5 h-5 text-amber-600" />;
      case 'PROMES':
        return <Layers className="w-5 h-5 text-purple-600" />;
      case 'KKTP':
      case 'ASM':
        return <Award className="w-5 h-5 text-teal-600" />;
      case 'MOD':
      case 'RPP':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'MID':
        return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
      case 'SAS':
        return <Award className="w-5 h-5 text-emerald-600" />;
      case 'LGR':
        return <Layers className="w-5 h-5 text-amber-600" />;
      case 'US':
        return <CheckSquare className="w-5 h-5 text-purple-600" />;
      case 'KOSP':
        return <BookMarked className="w-5 h-5 text-indigo-600" />;
      case 'P5':
        return <Sparkles className="w-5 h-5 text-rose-600" />;
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
    if (cat.codePrefix === 'KAL' || cat.id === 'kalender-pendidikan') {
      return `Kalender Pendidikan SMPN 14 Tulang Bawang Barat T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'RME' || cat.id === 'rincian-minggu-efektif') {
      return `Rincian Minggu Efektif (RME) ${subject} ${grade} Semester ${semester} T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'CP' || cat.id === 'capaian-pembelajaran') {
      return `Capaian Pembelajaran (CP) ${subject} Fase D T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'ATP' || cat.id === 'alur-tujuan-pembelajaran') {
      return `Alur Tujuan Pembelajaran (ATP) ${subject} ${grade} T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'PROTA' || cat.id === 'program-tahunan') {
      return `Program Tahunan (Prota) ${subject} ${grade} T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'PROMES' || cat.id === 'program-semester') {
      return `Program Semester (Promes) ${subject} ${grade} Semester ${semester} T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'KKTP' || cat.id === 'kktp') {
      return `Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) ${subject} ${grade} Semester ${semester} T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'MOD' || cat.id === 'modul-ajar-rpp') {
      return `Modul Ajar/RPP ${subject} ${grade} Semester ${semester} T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'MID' || cat.id === 'nilai-mid-semester') {
      return `Nilai Mid Semester (STS) ${subject} ${grade} Semester ${semester} T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'SAS' || cat.id === 'nilai-sas-rapor') {
      return `Nilai SAS / Rapor ${subject} ${grade} Semester ${semester} T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'LGR' || cat.id === 'leger') {
      return `Leger Nilai Siswa ${grade} Semester ${semester} T.A ${academicYear}`;
    }
    if (cat.codePrefix === 'US' || cat.id === 'nilai-ujian-sekolah') {
      return `Nilai Ujian Sekolah (US) ${subject} ${grade} T.A ${academicYear}`;
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
      // Match heuristics for the 8 standard categories
      let targetCat: CategoryDef | undefined;

      if (lower.includes('kalender') || lower.includes('jadwal') || lower.includes('akademik')) {
        targetCat = categories.find((c) => c.codePrefix === 'KAL' || c.id === 'kalender-pendidikan');
      } else if (
        lower.includes('minggu efektif') ||
        lower.includes('pekan efektif') ||
        lower.includes('rme') ||
        lower.includes('efektif')
      ) {
        targetCat = categories.find((c) => c.codePrefix === 'RME' || c.id === 'rincian-minggu-efektif');
      } else if (
        lower.includes('capaian') ||
        lower.includes(' cp ') ||
        lower.endsWith(' cp') ||
        lower.includes('(cp)') ||
        lower.includes('cp_') ||
        lower.includes('cp-')
      ) {
        targetCat = categories.find((c) => c.codePrefix === 'CP' || c.id === 'capaian-pembelajaran');
      } else if (
        lower.includes('atp') ||
        lower.includes('alur tujuan') ||
        lower.includes('alur pembelajaran')
      ) {
        targetCat = categories.find((c) => c.codePrefix === 'ATP' || c.id === 'alur-tujuan-pembelajaran');
      } else if (
        lower.includes('prota') ||
        lower.includes('program tahunan') ||
        (lower.includes('tahunan') && !lower.includes('promes'))
      ) {
        targetCat = categories.find((c) => c.codePrefix === 'PROTA' || c.id === 'program-tahunan');
      } else if (
        lower.includes('promes') ||
        lower.includes('program semester') ||
        lower.includes('semester')
      ) {
        targetCat = categories.find((c) => c.codePrefix === 'PROMES' || c.id === 'program-semester');
      } else if (
        lower.includes('kktp') ||
        lower.includes('ketercapaian') ||
        lower.includes('kriteria') ||
        lower.includes('ketuntasan') ||
        lower.includes('rubrik') ||
        lower.includes('nilai') ||
        lower.includes('asesmen') ||
        lower.includes('soal')
      ) {
        targetCat = categories.find((c) => c.codePrefix === 'KKTP' || c.id === 'kktp');
      } else if (
        lower.includes('modul') ||
        lower.includes('rpp') ||
        lower.includes('ajar') ||
        lower.includes('lkpd') ||
        lower.includes('kosp') ||
        lower.includes('p5')
      ) {
        targetCat = categories.find((c) => c.codePrefix === 'MOD' || c.id === 'modul-ajar-rpp');
      }

      if (!targetCat) {
        // Fallback: assign to first available unfilled category
        targetCat = categories.find((c) => !newSlots[c.id]) || categories[0];
      }

      if (targetCat) {
        matchedCount++;
        const targetId = targetCat.id;
        const reader = new FileReader();
        reader.onload = () => {
          setCategorySlots((prev) => ({
            ...prev,
            [targetId]: {
              ...prev[targetId],
              fileDataUrl: reader.result as string,
            },
          }));
        };
        reader.readAsDataURL(file);

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
      `Berhasil mencocokkan ${matchedCount} berkas ke kategori Kelengkapan Perangkat Pembelajaran yang sesuai!`
    );
    setTimeout(() => setAutoMatchMessage(null), 5000);
  };

  const SUMATIF_IDS = new Set(SUMATIF_CATEGORIES.map((c) => c.id));
  const perangkatCategories = categories.filter((c) => !SUMATIF_IDS.has(c.id));

  // Filter Categories by Preset (for Menu 1 - Perangkat Pembelajaran)
  const displayedCategories = perangkatCategories.filter((cat) => {
    if (activePresetFilter === 'all') return true;
    if (activePresetFilter === 'waktu') {
      return ['kalender-pendidikan', 'rincian-minggu-efektif', 'program-tahunan', 'program-semester'].includes(
        cat.id
      );
    }
    if (activePresetFilter === 'cp-atp') {
      return ['capaian-pembelajaran', 'alur-tujuan-pembelajaran'].includes(cat.id);
    }
    if (activePresetFilter === 'kktp-modul') {
      return ['kktp', 'modul-ajar-rpp'].includes(cat.id);
    }
    return true;
  });

  // Count how many category slots currently have files ready
  const readySlotsCount = Object.keys(categorySlots).length;
  const readySumatifSlotsCount = Object.keys(sumatifSlots).length;

  // Handlers for Menu 3: Unggah Berkas Nilai Sumatif
  const handleSetSumatifFile = (cat: CategoryDef, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setSumatifSlots((prev) => ({
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

  const handleCreateSumatifDraftSlot = (cat: CategoryDef) => {
    setSumatifSlots((prev) => ({
      ...prev,
      [cat.id]: {
        file: null,
        fileName: `${generateDefaultTitle(cat).replace(/\s+/g, '_')}.xlsx`,
        fileSizeStr: '850 KB',
        fileType: 'XLSX',
        title: prev[cat.id]?.title || generateDefaultTitle(cat),
        subCategory: cat.name,
      },
    }));
  };

  const handleRemoveSumatifSlot = (catId: string) => {
    setSumatifSlots((prev) => {
      const updated = { ...prev };
      delete updated[catId];
      return updated;
    });
  };

  const handleUpdateSumatifSlotTitle = (catId: string, newTitle: string) => {
    setSumatifSlots((prev) => {
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

  const handleSumatifMultiFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let matchedCount = 0;
    const newSlots: Record<string, CategoryFileSlot> = { ...sumatifSlots };

    Array.from(files).forEach((file) => {
      const lower = file.name.toLowerCase();
      let targetCat: CategoryDef | undefined;

      if (lower.includes('mid') || lower.includes('sts') || lower.includes('pts') || lower.includes('tengah')) {
        targetCat = SUMATIF_CATEGORIES.find((c) => c.id === 'nilai-mid-semester');
      } else if (
        lower.includes('sas') ||
        lower.includes('rapor') ||
        lower.includes('raport') ||
        lower.includes('pas') ||
        lower.includes('pat') ||
        lower.includes('akhir semester')
      ) {
        targetCat = SUMATIF_CATEGORIES.find((c) => c.id === 'nilai-sas-rapor');
      } else if (lower.includes('leger') || lower.includes('kumpulan nilai')) {
        targetCat = SUMATIF_CATEGORIES.find((c) => c.id === 'leger');
      } else if (
        lower.includes('ujian') ||
        lower.includes(' us ') ||
        lower.includes('_us_') ||
        lower.includes('-us-') ||
        lower.includes('usp') ||
        lower.includes('saj')
      ) {
        targetCat = SUMATIF_CATEGORIES.find((c) => c.id === 'nilai-ujian-sekolah');
      }

      if (!targetCat) {
        targetCat = SUMATIF_CATEGORIES.find((c) => !newSlots[c.id]) || SUMATIF_CATEGORIES[0];
      }

      if (targetCat) {
        matchedCount++;
        const targetId = targetCat.id;
        const reader = new FileReader();
        reader.onload = () => {
          setSumatifSlots((prev) => ({
            ...prev,
            [targetId]: {
              ...prev[targetId],
              fileDataUrl: reader.result as string,
            },
          }));
        };
        reader.readAsDataURL(file);

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

    setSumatifSlots(newSlots);
    setAutoMatchMessage(
      `Berhasil mencocokkan ${matchedCount} berkas ke Kategori Nilai Sumatif yang sesuai!`
    );
    setTimeout(() => setAutoMatchMessage(null), 5000);
  };

  const handleSumatifSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const slotKeys = Object.keys(sumatifSlots);
    if (slotKeys.length === 0) {
      setErrorMsg(
        'Belum ada berkas Nilai Sumatif yang dipilih. Silakan pilih berkas pada salah satu atau beberapa kategori di bawah.'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(`Menyiapkan ${slotKeys.length} berkas Nilai Sumatif...`);

    const tagsArray = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const createdDocs: CurriculumDoc[] = [];
    const runningDocsList = [...existingDocs];

    slotKeys.forEach((catId, index) => {
      const slot = sumatifSlots[catId];
      const catObj =
        SUMATIF_CATEGORIES.find((c) => c.id === catId) ||
        categories.find((c) => c.id === catId) ||
        SUMATIF_CATEGORIES[0];

      const generatedCode = generateDocCode(
        catObj.codePrefix || 'SUM',
        academicYear,
        runningDocsList
      );

      const newDoc: CurriculumDoc = {
        id: `doc-sumatif-${Date.now()}-${index}`,
        code: generatedCode,
        title: slot.title.trim() || generateDefaultTitle(catObj),
        category: catObj.name,
        subCategory: slot.subCategory || catObj.name,
        domain: 'guru',
        targetRole: defaultTargetRole || 'Guru Mata Pelajaran',
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
        tags: Array.from(
          new Set([
            ...tagsArray,
            'Nilai Sumatif',
            'Daftar Nilai',
            catObj.name,
            subject,
            grade,
          ])
        ),
        description: `Arsip resmi ${catObj.name} mata pelajaran ${subject} ${grade} semester ${semester} T.A ${academicYear}. Diunggah melalui Menu Unggah Berkas Nilai Sumatif SMPN 14 Tubaba.`,
        status: initialStatus,
        downloadCount: 0,
      };

      if (newDoc.fileDataUrl) {
        saveFileToCache(newDoc.id, newDoc.fileDataUrl, newDoc.fileName, newDoc.fileType);
      }

      createdDocs.push(newDoc);
      runningDocsList.push(newDoc);
    });

    setTimeout(() => {
      setSubmitProgress(`Menyimpan ${createdDocs.length} berkas Nilai Sumatif ke arsip...`);
      setTimeout(() => {
        onSuccess(createdDocs);
        setIsSubmitting(false);
        onClose();
      }, 500);
    }, 400);
  };

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

    if (newDoc.fileDataUrl) {
      saveFileToCache(newDoc.id, newDoc.fileDataUrl, newDoc.fileName, newDoc.fileType);
    }

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

      if (newDoc.fileDataUrl) {
        saveFileToCache(newDoc.id, newDoc.fileDataUrl, newDoc.fileName, newDoc.fileType);
      }

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
                  : uploadMode === 'sumatif'
                  ? 'Menu khusus unggah berkas Nilai Sumatif (Mid Semester, SAS/Rapor, Leger, & Ujian Sekolah)'
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

        {/* Mode Selector Tab (3 Menus) */}
        <div className="bg-slate-100/90 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
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
              <span>1. Unggah Semua Kategori Sekaligus (Paket Lengkap)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 font-extrabold ml-0.5">
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
              <span>2. Unggah Berkas Satuan (1 Dokumen)</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('sumatif')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                uploadMode === 'sumatif'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>3. Unggah Berkas Nilai Sumatif</span>
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
              {/* Nama Guru (Dropdown + Input/Tambah Baru) */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Pilih Nama Guru / Penanggung Jawab <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingTeacher(!isAddingTeacher)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAddingTeacher ? 'Tutup Form Guru' : 'Tambah Nama Guru ke Dropdown'}</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <select
                    value={teacherOptions.some((t) => t.name === authorName) ? authorName : '__CUSTOM__'}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') return;
                      handleSelectTeacherFromDropdown(e.target.value);
                    }}
                    aria-label="Pilih Nama Guru dari Dropdown"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 font-semibold"
                  >
                    {teacherOptions.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                    {!teacherOptions.some((t) => t.name === authorName) && authorName && (
                      <option value="__CUSTOM__">{authorName}</option>
                    )}
                    <option value="__ADD_NEW__">+ Tambah Nama Guru Baru ke Dropdown...</option>
                  </select>
                </div>

                {/* Inline Add Teacher to Dropdown Form */}
                {isAddingTeacher && (
                  <div className="mt-2.5 p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Masukkan Nama Guru Baru ke Daftar Dropdown
                      </span>
                      <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-emerald-200 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setNewTeacherMode('single')}
                          className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                            newTeacherMode === 'single'
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          1 Guru
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTeacherMode('bulk')}
                          className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                            newTeacherMode === 'bulk'
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Banyak Sekaligus
                        </button>
                      </div>
                    </div>

                    {newTeacherMode === 'single' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={newTeacherName}
                          onChange={(e) => setNewTeacherName(e.target.value)}
                          placeholder="Nama Lengkap & Gelar Guru *"
                          className="sm:col-span-1 text-xs px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                        />
                        <input
                          type="text"
                          value={newTeacherNip}
                          onChange={(e) => setNewTeacherNip(e.target.value)}
                          placeholder="NIP (Opsional)"
                          className="text-xs px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono"
                        />
                        <select
                          value={newTeacherSubject}
                          onChange={(e) => setNewTeacherSubject(e.target.value)}
                          className="text-xs px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                        >
                          {SUBJECT_LIST.filter((s) => s !== 'Semua Mata Pelajaran').map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <textarea
                          rows={3}
                          value={bulkTeacherNames}
                          onChange={(e) => setBulkTeacherNames(e.target.value)}
                          placeholder={'Ketik atau tempel daftar nama guru (1 nama per baris).\nContoh:\nYunita Wati., S.Pd\nRohisa., S.Pd'}
                          className="w-full text-xs p-2.5 bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingTeacher(false)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-white rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveNewTeacher}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Simpan ke Dropdown & Pilih</span>
                      </button>
                    </div>
                  </div>
                )}
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
                  Tingkat / Rombel Kelas
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800"
                >
                  <optgroup label="Tingkat Umum">
                    <option value="Kelas 7">Kelas 7 (Semua Rombel 7)</option>
                    <option value="Kelas 8">Kelas 8 (Semua Rombel 8)</option>
                    <option value="Kelas 9">Kelas 9 (Semua Rombel 9)</option>
                    <option value="Fase D">Fase D (Lintas Jenjang)</option>
                    <option value="Semua Tingkat">Semua Tingkat</option>
                  </optgroup>
                  <optgroup label="Rombel Kelas 7">
                    <option value="Kelas 7.1">Kelas 7.1</option>
                    <option value="Kelas 7.2">Kelas 7.2</option>
                    <option value="Kelas 7.3">Kelas 7.3</option>
                    <option value="Kelas 7.4">Kelas 7.4</option>
                  </optgroup>
                  <optgroup label="Rombel Kelas 8">
                    <option value="Kelas 8.1">Kelas 8.1</option>
                    <option value="Kelas 8.2">Kelas 8.2</option>
                    <option value="Kelas 8.3">Kelas 8.3</option>
                    <option value="Kelas 8.4">Kelas 8.4</option>
                  </optgroup>
                  <optgroup label="Rombel Kelas 9">
                    <option value="Kelas 9.1">Kelas 9.1</option>
                    <option value="Kelas 9.2">Kelas 9.2</option>
                    <option value="Kelas 9.3">Kelas 9.3</option>
                    <option value="Kelas 9.4">Kelas 9.4</option>
                  </optgroup>
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
                <span className="text-slate-400 text-[11px] font-medium shrink-0 mr-1">Filter Komponen:</span>
                <button
                  type="button"
                  onClick={() => setActivePresetFilter('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                    activePresetFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Perangkat Pembelajaran ({perangkatCategories.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActivePresetFilter('waktu')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                    activePresetFilter === 'waktu'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  📅 Waktu (Kalender, RME, Prota, Promes)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePresetFilter('cp-atp')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                    activePresetFilter === 'cp-atp'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  🎯 Capaian & Alur (CP & ATP)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePresetFilter('kktp-modul')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                    activePresetFilter === 'kktp-modul'
                      ? 'bg-purple-600 text-white shadow-2xs font-bold'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  📝 Asesmen & Ajar (KKTP & Modul Ajar/RPP)
                </button>
              </div>

              {/* Grid of All Categories Upload Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {displayedCategories.map((cat, idx) => {
                  const slot = categorySlots[cat.id];
                  const hasFile = Boolean(slot);
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
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                                #{itemNum}
                              </span>
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
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewRawFile({
                                      name: slot.fileName,
                                      type: slot.fileType,
                                      dataUrl: slot.fileDataUrl,
                                      size: slot.fileSizeStr,
                                      title: slot.title,
                                      category: cat.name,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer text-[11px] font-semibold transition-colors"
                                  title="Pratinjau berkas ini"
                                >
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Lihat</span>
                                </button>
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
                      handleSingleFileSelect(e.dataTransfer.files[0]);
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
                        handleSingleFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  {singleFile ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                            {singleFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {singleFileSizeStr} • Format {singleFileTypeStr}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewRawFile({
                              name: singleFile.name,
                              type: singleFileTypeStr,
                              dataUrl: singleFileDataUrl,
                              size: singleFileSizeStr,
                              title: singleTitle || singleFile.name,
                              category:
                                categories.find((c) => c.id === singleCategoryId)?.name ||
                                'Perangkat Pembelajaran',
                            });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Pratinjau Berkas</span>
                        </button>
                        <span className="text-[11px] text-slate-500 italic">
                          (Klik untuk ganti file)
                        </span>
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

          {/* ======================================================== */}
          {/* MODE 3: UNGGAH BERKAS NILAI SUMATIF                      */}
          {/* ======================================================== */}
          {uploadMode === 'sumatif' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Menu Unggah Berkas Nilai Sumatif (4 Kategori Penilaian)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Unggah berkas Nilai Mid Semester, Nilai SAS / Rapor, Leger, dan Nilai Ujian Sekolah
                    </p>
                  </div>
                </div>

                {/* Smart Multi-File Selector for Nilai Sumatif */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    ref={sumatifMultiFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      handleSumatifMultiFiles(e.target.files);
                      if (e.target) e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => sumatifMultiFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                    title="Pilih beberapa file nilai sekaligus, sistem akan mencocokkan ke kategori Nilai Sumatif"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>⚡ Pilih Banyak File Nilai Sekaligus (Auto-Detect)</span>
                  </button>
                </div>
              </div>

              {/* Grid of 4 Nilai Sumatif Categories Upload Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {SUMATIF_CATEGORIES.map((cat, idx) => {
                  const slot = sumatifSlots[cat.id];
                  const hasFile = Boolean(slot);
                  const itemNum = idx + 1;

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
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                                #{itemNum}
                              </span>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                [{cat.codePrefix}]
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 leading-tight">
                                {itemNum}. {cat.name}
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
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-emerald-200 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
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
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewRawFile({
                                      name: slot.fileName,
                                      type: slot.fileType,
                                      dataUrl: slot.fileDataUrl,
                                      size: slot.fileSizeStr,
                                      title: slot.title,
                                      category: cat.name,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer text-[11px] font-semibold transition-colors"
                                  title="Pratinjau berkas ini"
                                >
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Lihat</span>
                                </button>
                                <label className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer text-[11px] font-semibold">
                                  <span>Ganti</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleSetSumatifFile(cat, e.target.files[0]);
                                      }
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSumatifSlot(cat.id)}
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
                                Judul Berkas Nilai Sumatif:
                              </label>
                              <input
                                type="text"
                                value={slot.title}
                                onChange={(e) => handleUpdateSumatifSlotTitle(cat.id, e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-dashed border-slate-300 hover:border-emerald-400 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                              <UploadCloud className="w-4 h-4 text-emerald-600" />
                              <span>Pilih Berkas ({cat.name})</span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleSetSumatifFile(cat, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => handleCreateSumatifDraftSlot(cat)}
                              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium rounded-xl transition-colors cursor-pointer shrink-0"
                              title="Gunakan draf template resmi untuk kategori nilai ini"
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
            ) : uploadMode === 'sumatif' ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  📊 {readySumatifSlotsCount} berkas nilai sumatif
                </span>
                <span>telah siap diunggah dari</span>
                <span className="font-semibold text-slate-800">
                  {SUMATIF_CATEGORIES.length} kategori
                </span>
                {readySumatifSlotsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setSumatifSlots({})}
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
            ) : uploadMode === 'sumatif' ? (
              <button
                type="button"
                disabled={isSubmitting || readySumatifSlotsCount === 0}
                onClick={handleSumatifSubmit}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                  readySumatifSlotsCount === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-900/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>{submitProgress || 'Mengunggah Berkas Nilai...'}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>
                      Unggah Berkas Nilai Sumatif ({readySumatifSlotsCount} Dokumen)
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

      {/* Instant Preview Modal for Pre-Upload Inspection */}
      <FilePreviewModal
        isOpen={Boolean(previewRawFile)}
        onClose={() => setPreviewRawFile(null)}
        rawFile={previewRawFile || undefined}
      />
    </div>
  );
};
