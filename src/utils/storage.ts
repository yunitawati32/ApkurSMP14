import { CurriculumDoc, CategoryDef, SchoolProfile, TeacherData } from '../types/curriculum';
import {
  INITIAL_CATEGORIES,
  INITIAL_DOCUMENTS,
  INITIAL_SCHOOL_PROFILE,
  INITIAL_TEACHERS,
} from '../data/initialData';

const LEGACY_TEACHER_MAP: Record<string, string> = {
  'yunitawati, s.pd., m.m.': 'Yunita Wati., S.Pd',
  'yunitawati, s.pd., m.m': 'Yunita Wati., S.Pd',
  'dra. yunitawati, m.pd.': 'Yunita Wati., S.Pd',
  'dra. yunitawati, m.pd': 'Yunita Wati., S.Pd',
  'tim kurikulum smpn 14 tubaba': 'Yunita Wati., S.Pd',
  'drs. h. mulyadi, m.pd.': 'Cecep Agung Prehatin., M.Pd',
  'drs. h. mulyadi, m.pd': 'Cecep Agung Prehatin., M.Pd',
  'rahmat hidayat, s.pd., m.m.': 'Cecep Agung Prehatin., M.Pd',
  'rahmat hidayat, s.pd., m.m': 'Cecep Agung Prehatin., M.Pd',
  'drs. supriyanto, m.pd.': 'Cecep Agung Prehatin., M.Pd',
  'drs. supriyanto, m.pd': 'Cecep Agung Prehatin., M.Pd',
  'tata usaha smpn 14 tubaba': 'Cecep Agung Prehatin., M.Pd',
  'ahmad fauzi': 'Rohisa., S.Pd',
  'ahmad fauzi, s.pd': 'Rohisa., S.Pd',
  'ahmad fauzi, s.pd.': 'Rohisa., S.Pd',
  'ahmad fauzi, m.pd': 'Candra Mustika., S.Pd',
  'ahmad fauzi, m.pd.': 'Candra Mustika., S.Pd',
  'rian pratama, s.kom': 'Ratih Ernawati., S.Kom',
  'rian pratama, s.kom.': 'Ratih Ernawati., S.Kom',
  'rian pratama, s.kom. (proktor)': 'Ratih Ernawati., S.Kom',
  'siti rahmawati, s.pd': 'Siti Halimah., S.Pd',
  'siti rahmawati, s.pd.': 'Siti Halimah., S.Pd',
  'zulkipli, s.pd': 'Frestin Rosdian Putri., S.Pd',
  'zulkipli, s.pd.': 'Frestin Rosdian Putri., S.Pd',
  'rina wardani': 'Agustina Jayanti., S.Pd',
  'rina wardani, s.pd': 'Agustina Jayanti., S.Pd',
  'rina wardani, s.pd.': 'Agustina Jayanti., S.Pd',
  'dewi sartika, s.si': 'Julita Dewi., S.Pd',
  'dewi sartika, s.si.': 'Julita Dewi., S.Pd',
  'siti nurhaliza, s.si': 'Siti Halimah., S.Pd',
  'siti nurhaliza, s.si.': 'Siti Halimah., S.Pd',
  'dra. endang sulastri': 'Siti Romelah., S.Pd',
  'nurul hidayah, s.pd': 'Herlina., S.Pd',
  'nurul hidayah, s.pd.': 'Herlina., S.Pd',
  'bambang irawan, s.pd': 'Affan Yusuf., S.Pd',
  'bambang irawan, s.pd.': 'Affan Yusuf., S.Pd',
  'budi santoso, s.pd': 'Affan Yusuf., S.Pd',
  'budi santoso, s.pd.': 'Affan Yusuf., S.Pd',
  'siti aminah, s.pd': 'Enik Ernawati., S.Pd',
  'siti aminah, s.pd.': 'Enik Ernawati., S.Pd',
  'roni hendrawan, s.pd': 'Rahadian Abdurroziq., S.Pd',
  'roni hendrawan, s.pd.': 'Rahadian Abdurroziq., S.Pd',
  'ratih kusuma, s.sn': 'Herlina., S.Pd',
  'ratih kusuma, s.sn.': 'Herlina., S.Pd',
  'tim fasilitator p5 smpn 14': 'Eka Reza Rifai., S.Pd',
};

const LEGACY_SUBSTRINGS: Array<{ pattern: string; replacement: string }> = [
  { pattern: 'ahmad fauzi', replacement: 'Rohisa., S.Pd' },
  { pattern: 'rina wardani', replacement: 'Agustina Jayanti., S.Pd' },
  { pattern: 'siti rahmawati', replacement: 'Siti Halimah., S.Pd' },
  { pattern: 'budi santoso', replacement: 'Affan Yusuf., S.Pd' },
  { pattern: 'dewi sartika', replacement: 'Julita Dewi., S.Pd' },
  { pattern: 'rian pratama', replacement: 'Ratih Ernawati., S.Kom' },
  { pattern: 'zulkipli', replacement: 'Frestin Rosdian Putri., S.Pd' },
  { pattern: 'siti nurhaliza', replacement: 'Siti Halimah., S.Pd' },
  { pattern: 'endang sulastri', replacement: 'Siti Romelah., S.Pd' },
  { pattern: 'nurul hidayah', replacement: 'Herlina., S.Pd' },
  { pattern: 'bambang irawan', replacement: 'Affan Yusuf., S.Pd' },
  { pattern: 'siti aminah', replacement: 'Enik Ernawati., S.Pd' },
  { pattern: 'roni hendrawan', replacement: 'Rahadian Abdurroziq., S.Pd' },
  { pattern: 'ratih kusuma', replacement: 'Herlina., S.Pd' },
  { pattern: 'rahmat hidayat', replacement: 'Cecep Agung Prehatin., M.Pd' },
  { pattern: 'mulyadi', replacement: 'Cecep Agung Prehatin., M.Pd' },
  { pattern: 'supriyanto', replacement: 'Cecep Agung Prehatin., M.Pd' },
  { pattern: 'yunitawati', replacement: 'Yunita Wati., S.Pd' },
];

export const isLegacyTeacherName = (name?: string): boolean => {
  if (!name) return false;
  const lower = name.trim().toLowerCase();
  if (LEGACY_TEACHER_MAP[lower]) return true;
  return LEGACY_SUBSTRINGS.some((item) => lower.includes(item.pattern));
};

export const normalizeTeacherName = (name?: string): string => {
  if (!name) return 'Yunita Wati., S.Pd';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  if (LEGACY_TEACHER_MAP[lower]) {
    return LEGACY_TEACHER_MAP[lower];
  }
  const foundSub = LEGACY_SUBSTRINGS.find((item) => lower.includes(item.pattern));
  if (foundSub) {
    return foundSub.replacement;
  }
  return trimmed;
};

export const normalizeTeachersArray = (storedTeachers?: TeacherData[]): TeacherData[] => {
  if (!Array.isArray(storedTeachers) || storedTeachers.length === 0) {
    return INITIAL_TEACHERS;
  }

  // Filter out any old legacy teachers
  const nonLegacy = storedTeachers.filter((t) => t && t.name && !isLegacyTeacherName(t.name));

  // Ensure all 25 official teachers from INITIAL_TEACHERS are present
  const officialNamesLower = new Set(INITIAL_TEACHERS.map((t) => t.name.toLowerCase()));
  const customAdded = nonLegacy.filter((t) => !officialNamesLower.has(t.name.trim().toLowerCase()));

  return [...INITIAL_TEACHERS, ...customAdded];
};

export const normalizeSchoolProfile = (profile?: Partial<SchoolProfile>): SchoolProfile => {
  if (!profile) return INITIAL_SCHOOL_PROFILE;
  const rawHeadmaster = profile.headmaster || INITIAL_SCHOOL_PROFILE.headmaster;
  const rawVice = profile.curriculumVice || INITIAL_SCHOOL_PROFILE.curriculumVice;

  return {
    ...INITIAL_SCHOOL_PROFILE,
    ...profile,
    headmaster: isLegacyTeacherName(rawHeadmaster)
      ? INITIAL_SCHOOL_PROFILE.headmaster
      : rawHeadmaster,
    curriculumVice: isLegacyTeacherName(rawVice)
      ? INITIAL_SCHOOL_PROFILE.curriculumVice
      : rawVice,
    logoPemdaUrl: profile.logoPemdaUrl || INITIAL_SCHOOL_PROFILE.logoPemdaUrl,
    logoSchoolUrl: profile.logoSchoolUrl || INITIAL_SCHOOL_PROFILE.logoSchoolUrl,
    teachers: normalizeTeachersArray(profile.teachers),
  };
};

export const normalizeDocCategory = (categoryName: string): string => {
  const map: Record<string, string> = {
    'KOSP (Kurikulum Sekolah)': 'Modul Ajar/RPP',
    'Modul Ajar & RPP': 'Modul Ajar/RPP',
    'Alur Tujuan Pembelajaran (ATP/CP)': 'Alur Tujuan Pembelajaran (ATP)',
    'Asesmen & Bank Soal': 'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)',
    'Prota & Promes': 'Program Tahunan',
    'Modul Projek P5': 'Modul Ajar/RPP',
    'Jadwal & Kalender Akademik': 'Kalender pendidikan',
    'SK Tugas & Regulasi': 'Kalender pendidikan',
    'LKPD & Lembar Siswa': 'Modul Ajar/RPP',
    'Dokumen & Portofolio Guru': 'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)',
    'Dokumen Administrasi Wali Kelas': 'Program Semester',
    'Dokumen Pembina Ekstrakurikuler': 'Program Tahunan',
    'Dokumen Kegiatan Sekolah & Notula': 'Kalender pendidikan',
  };
  return map[categoryName] || categoryName;
};

export const normalizeDocAcademicYear = (year?: string): string => {
  if (!year || year === '2024/2025') {
    return '2026/2027';
  }
  return year;
};

export const normalizeClassAndEskulText = (text?: string): string => {
  if (!text) return '';
  return text
    .replace(/2024\/2025/g, '2026/2027')
    .replace(/Kelas\s*7-A/gi, 'Kelas 7.1')
    .replace(/Kelas\s*7-B/gi, 'Kelas 7.2')
    .replace(/Kelas\s*7-C/gi, 'Kelas 7.3')
    .replace(/Kelas\s*7-D/gi, 'Kelas 7.4')
    .replace(/Kelas\s*8-A/gi, 'Kelas 8.1')
    .replace(/Kelas\s*8-B/gi, 'Kelas 8.2')
    .replace(/Kelas\s*8-C/gi, 'Kelas 8.3')
    .replace(/Kelas\s*8-D/gi, 'Kelas 8.4')
    .replace(/Kelas\s*9-A/gi, 'Kelas 9.1')
    .replace(/Kelas\s*9-B/gi, 'Kelas 9.2')
    .replace(/Kelas\s*9-C/gi, 'Kelas 9.3')
    .replace(/Kelas\s*9-D/gi, 'Kelas 9.4')
    .replace(/\b7-A\b/g, '7.1')
    .replace(/\b7-B\b/g, '7.2')
    .replace(/\b8-A\b/g, '8.1')
    .replace(/\b8-B\b/g, '8.2')
    .replace(/\b9-A\b/g, '9.1')
    .replace(/\b9-B\b/g, '9.2')
    .replace(/Palang Merah Remaja \(PMR\) Madya/gi, 'UKS (Usaha Kesehatan Sekolah)')
    .replace(/Pembina PMR/gi, 'Pembina UKS')
    .replace(/PMR Madya/gi, 'UKS');
};

export const normalizeCurriculumDoc = (d: CurriculumDoc): CurriculumDoc => {
  const normalizedTargetRole = d.targetRole ? normalizeClassAndEskulText(d.targetRole) : d.targetRole;
  let normalizedGrade = d.grade;
  if (normalizedTargetRole?.includes('7.1')) normalizedGrade = 'Kelas 7.1';
  else if (normalizedTargetRole?.includes('7.2')) normalizedGrade = 'Kelas 7.2';
  else if (normalizedTargetRole?.includes('8.2')) normalizedGrade = 'Kelas 8.2';
  else if (normalizedTargetRole?.includes('9.1')) normalizedGrade = 'Kelas 9.1';

  return {
    ...d,
    category: normalizeDocCategory(d.category),
    academicYear: normalizeDocAcademicYear(d.academicYear),
    title: normalizeClassAndEskulText(d.title),
    targetRole: normalizedTargetRole,
    grade: normalizedGrade,
    authorName: normalizeTeacherName(d.authorName),
    verifiedBy: d.verifiedBy ? normalizeTeacherName(d.verifiedBy) : d.verifiedBy,
    description: d.description ? normalizeClassAndEskulText(d.description) : d.description,
    tags: Array.isArray(d.tags) ? d.tags.map((t) => normalizeClassAndEskulText(t)) : [],
  };
};

const STORAGE_KEYS = {
  DOCS: 'siarkur_docs_v4',
  CATEGORIES: 'siarkur_categories_v3',
  SCHOOL: 'siarkur_school_v2',
};

export const getStoredDocs = (): CurriculumDoc[] => {
  try {
    const data =
      localStorage.getItem(STORAGE_KEYS.DOCS) ||
      localStorage.getItem('siarkur_docs_v3') ||
      localStorage.getItem('siarkur_docs_v2');
    if (data) {
      const parsed: CurriculumDoc[] = JSON.parse(data);
      return parsed.map((d) => normalizeCurriculumDoc(d));
    }
  } catch (e) {
    console.error('Error loading stored docs', e);
  }
  return INITIAL_DOCUMENTS;
};

export const saveStoredDocs = (docs: CurriculumDoc[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
  } catch (e) {
    console.error('Error saving docs to storage', e);
  }
};

export const getStoredCategories = (): CategoryDef[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (data) {
      const parsed = JSON.parse(data);
      const hasStandard = parsed.some(
        (c: CategoryDef) => c.id === 'rincian-minggu-efektif' || c.id === 'kktp'
      );
      if (hasStandard && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading stored categories', e);
  }
  saveStoredCategories(INITIAL_CATEGORIES);
  return INITIAL_CATEGORIES;
};

export const saveStoredCategories = (cats: CategoryDef[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  } catch (e) {
    console.error('Error saving categories', e);
  }
};

export const getStoredSchoolProfile = (): SchoolProfile => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCHOOL);
    if (data) {
      const parsed = JSON.parse(data);
      return normalizeSchoolProfile(parsed);
    }
  } catch (e) {
    console.error('Error loading school profile', e);
  }
  return INITIAL_SCHOOL_PROFILE;
};

export const saveStoredSchoolProfile = (profile: SchoolProfile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving school profile', e);
  }
};

export const generateDocCode = (
  categoryPrefix: string,
  year: string,
  existingDocs: CurriculumDoc[]
): string => {
  const cleanYear = year.split('/')[0] || '2024';
  const matching = existingDocs.filter(d => d.code.startsWith(`ARK-${cleanYear}-${categoryPrefix}`));
  const nextNumber = matching.length + 1;
  const padded = String(nextNumber).padStart(3, '0');
  return `ARK-${cleanYear}-${categoryPrefix}-${padded}`;
};

export const exportDocsToCsv = (docs: CurriculumDoc[], schoolName: string) => {
  const headers = [
    'Kode Arsip',
    'Judul Dokumen',
    'Kategori',
    'Mata Pelajaran',
    'Jenjang / Kelas',
    'Model Kurikulum',
    'Tahun Ajaran',
    'Semester',
    'Penyusun / Guru',
    'NIP',
    'Tanggal Unggah',
    'Tipe File',
    'Ukuran File',
    'Status Verifikasi',
    'Diverifikasi Oleh',
  ];

  const rows = docs.map(doc => [
    `"${doc.code}"`,
    `"${doc.title.replace(/"/g, '""')}"`,
    `"${doc.category}"`,
    `"${doc.subject}"`,
    `"${doc.grade}"`,
    `"${doc.curriculumType}"`,
    `"${doc.academicYear}"`,
    `"${doc.semester}"`,
    `"${doc.authorName.replace(/"/g, '""')}"`,
    `"${doc.authorNip || '-'}"`,
    `"${doc.uploadDate}"`,
    `"${doc.fileType}"`,
    `"${doc.fileSize}"`,
    `"${doc.status}"`,
    `"${doc.verifiedBy || '-'}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Daftar_Arsip_Kurikulum_${schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadDocumentFile = (doc: CurriculumDoc) => {
  if (doc.fileDataUrl) {
    const link = document.createElement('a');
    link.href = doc.fileDataUrl;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Create official simulated document summary file
  const fileContent = `================================================================================
KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
DINAS PENDIDIKAN DAN KEBUDAYAAN KABUPATEN TULANG BAWANG BARAT
SMP NEGERI 14 TULANG BAWANG BARAT
AKREDITASI: A | NPSN: 69989014
Alamat: Jl. Poros Pendidikan Tiyuh Mulya Kencana, Kab. Tulang Bawang Barat, Lampung
================================================================================
LEMBAR MANIFEST ARSIP DOKUMEN KURIKULUM DIGITAL (SI-ARKUR)
Nomor Registrasi Sistem : ${doc.code}
Tanggal Pengesahan/Arsip: ${doc.uploadDate}

IDENTITAS DOKUMEN:
--------------------------------------------------------------------------------
1. Judul Dokumen     : ${doc.title}
2. Kategori Klasifikasi: ${doc.category}
3. Model Kurikulum   : ${doc.curriculumType}
4. Mata Pelajaran    : ${doc.subject}
5. Tingkat / Fase    : ${doc.grade}
6. Tahun Pelajaran   : ${doc.academicYear}
7. Semester          : ${doc.semester}
8. Nama Penyusun     : ${doc.authorName} (NIP: ${doc.authorNip || '-'})
9. Nama Berkas Asli  : ${doc.fileName} (${doc.fileType} - ${doc.fileSize})
10. Status Dokumen   : ${doc.status}
${doc.verifiedBy ? `11. Petugas Verifikator: ${doc.verifiedBy} (Tanggal: ${doc.verifiedDate || '-'})` : ''}
${doc.verificationNotes ? `12. Catatan Telaah     : ${doc.verificationNotes}` : ''}

DESKRIPSI & RINGKASAN:
${doc.description}

KATA KUNCI / TAGS:
${doc.tags.join(', ')}

--------------------------------------------------------------------------------
Dokumen ini merupakan arsip resmi terdaftar pada Repositori Digital SMPN 14 Tulang
Bawang Barat untuk keperluan tertib administrasi kurikulum, supervisi akademik,
dan persiapan instrumen Akreditasi Satuan Pendidikan (BAN-PDM).
================================================================================
Dicetak otomatis dari SI-ARKUR SMPN 14 Tubaba pada ${new Date().toLocaleString('id-ID')}
`;

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${doc.code}_${doc.fileName.replace(/\.[^/.]+$/, '')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
