import { CurriculumDoc, CategoryDef, SchoolProfile } from '../types/curriculum';
import { INITIAL_CATEGORIES, INITIAL_DOCUMENTS, INITIAL_SCHOOL_PROFILE } from '../data/initialData';

const STORAGE_KEYS = {
  DOCS: 'siarkur_docs_v2',
  CATEGORIES: 'siarkur_categories_v2',
  SCHOOL: 'siarkur_school_v2',
};

export const getStoredDocs = (): CurriculumDoc[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DOCS);
    if (data) {
      return JSON.parse(data);
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
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading stored categories', e);
  }
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
      return JSON.parse(data);
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
