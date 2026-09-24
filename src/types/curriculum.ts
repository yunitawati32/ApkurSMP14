export type GradeLevel = 'Kelas 7' | 'Kelas 8' | 'Kelas 9' | 'Semua Tingkat' | 'Fase D';

export type SemesterType = 'Ganjil' | 'Genap' | 'Tahunan / Penuh';

export type CurriculumModel = 'Kurikulum Merdeka' | 'Kurikulum 2013' | 'Muatan Lokal / Khusus';

export type DocStatus = 'Terverifikasi' | 'Menunggu Verifikasi' | 'Perlu Revisi' | 'Draft';

export type FileType = 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'SCAN' | 'LAINNYA';

export type ArchiveDomain =
  | 'kurikulum'
  | 'guru'
  | 'wali-kelas'
  | 'pembina-eskul'
  | 'kegiatan-lainnya';

export interface CurriculumDoc {
  id: string;
  code: string; // e.g., ARKUR-2024-KOSP-001
  title: string;
  category: string;
  subCategory?: string;
  domain?: ArchiveDomain;
  targetRole?: string; // e.g., 'Wali Kelas 7-A', 'Pembina Pramuka', 'Guru Matematika', 'Panitia ANBK'
  curriculumType: CurriculumModel;
  grade: GradeLevel;
  subject: string;
  academicYear: string; // e.g., '2024/2025'
  semester: SemesterType;
  authorName: string;
  authorNip?: string;
  uploadDate: string; // YYYY-MM-DD
  fileName: string;
  fileType: FileType;
  fileSize: string;
  fileDataUrl?: string; // base64 representation if uploaded
  tags: string[];
  description: string;
  status: DocStatus;
  verifiedBy?: string;
  verifiedDate?: string;
  verificationNotes?: string;
  downloadCount: number;
}

export interface CategoryDef {
  id: string;
  name: string;
  codePrefix: string;
  iconName: string;
  description: string;
  color: string;
  bgLight: string;
  domain?: ArchiveDomain;
}

export interface SchoolProfile {
  name: string;
  npsn: string;
  district: string;
  regency: string;
  province: string;
  address: string;
  accreditation: string;
  headmaster: string;
  headmasterNip: string;
  curriculumVice: string;
  curriculumViceNip: string;
  motto: string;
  email: string;
  phone: string;
  logoSchoolUrl?: string; // Base64 data-URL atau link logo sekolah
  logoPemdaUrl?: string;  // Base64 data-URL atau link logo Pemda Tubaba
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role?: string;
  nip?: string;
  isGoogleAuth?: boolean;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'all-docs' 
  | 'teacher-docs' 
  | 'homeroom-docs' 
  | 'extracurricular-docs' 
  | 'other-activities-docs'
  | 'categories' 
  | 'upload' 
  | 'verification' 
  | 'reports' 
  | 'school-profile';

