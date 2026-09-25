import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  Eye,
  Download,
  Search,
  UserCheck,
  Users,
  Trophy,
  CalendarCheck,
  FolderArchive,
  BookOpen,
} from 'lucide-react';
import { CurriculumDoc, CategoryDef, SchoolProfile, ActiveTab } from '../types/curriculum';

interface DashboardViewProps {
  documents: CurriculumDoc[];
  categories: CategoryDef[];
  schoolProfile: SchoolProfile;
  selectedAcademicYear: string;
  onNavigateToCategory: (categoryName: string) => void;
  onNavigateToAllDocs: () => void;
  onNavigateToTab?: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  onOpenDocDetail: (doc: CurriculumDoc) => void;
  onDownloadDoc: (doc: CurriculumDoc) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  schoolProfile,
  selectedAcademicYear,
  onNavigateToAllDocs,
  onNavigateToTab,
  onOpenUpload,
  onOpenDocDetail,
  onDownloadDoc,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  // Key Counts
  const totalDocs = documents.length;
  const verifiedDocs = documents.filter((d) => d.status === 'Terverifikasi').length;
  const pendingDocs = documents.filter((d) => d.status === 'Menunggu Verifikasi').length;

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

  const teacherDocsCount = documents.filter(
    (d) =>
      d.domain === 'guru' ||
      standardCategories.includes(d.category) ||
      d.tags?.some((t) =>
        ['Jurnal Mengajar', 'Daftar Nilai', 'PMM', 'Remedial', 'Agenda Guru', 'KKTP', 'RME'].includes(t)
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

  // Recent docs sorted by date
  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 8);

  const displayedDocs = filterQuery.trim()
    ? recentDocs.filter(
        (d) =>
          d.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
          d.authorName.toLowerCase().includes(filterQuery.toLowerCase()) ||
          d.category.toLowerCase().includes(filterQuery.toLowerCase())
      )
    : recentDocs;

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <span className="font-semibold uppercase tracking-wider">Arsip Digital Resmi</span>
              <span>·</span>
              <span>SMPN 14 Tulang Bawang Barat</span>
              <span>·</span>
              <span>T.A {selectedAcademicYear}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Sistem Arsip Kurikulum & Administrasi Sekolah
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Tempat mudah menyimpan dan mencari berkas modul ajar guru, administrasi wali kelas,
              program pembina ekstrakurikuler, serta notula rapat dan kegiatan sekolah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              Unggah Dokumen Baru
            </button>
            <button
              onClick={onNavigateToAllDocs}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700/60 hover:bg-emerald-700 text-white border border-emerald-600/60 text-xs font-medium rounded-xl transition-all cursor-pointer"
            >
              <FolderArchive className="w-4 h-4" />
              Lihat Semua Arsip ({totalDocs})
            </button>
          </div>
        </div>

        {/* 3 Simple Stat Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-emerald-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-emerald-200">Total Berkas Tersimpan</div>
              <div className="text-lg font-bold font-mono text-white">{totalDocs} Dokumen</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-emerald-200">Sudah Terverifikasi</div>
              <div className="text-lg font-bold font-mono text-white">{verifiedDocs} Dokumen Sah</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-emerald-200">Menunggu Telaah</div>
              <div className="text-lg font-bold font-mono text-white">{pendingDocs} Dokumen</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Empat Pintu Masuk Utama (Role Gateways) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Pilih Sesuai Tugas & Peran Anda
            </h2>
            <p className="text-xs text-slate-500">
              Klik menu di bawah untuk melihat atau mengunggah berkas administrasi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Dokumen Guru */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('teacher-docs')}
            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {teacherDocsCount} Berkas
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Dokumen Guru (Perangkat Pembelajaran)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                8 Kelengkapan: Kalender pendidikan, RME, CP, ATP, Prota, Promes, KKTP, dan Modul Ajar/RPP.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              <span>Buka Menu Guru</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 2. Dokumen Wali Kelas */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('homeroom-docs')}
            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {homeroomDocsCount} Berkas
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Dokumen Wali Kelas
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Administrasi Kelas, Leger Nilai, Buku Catatan Kasus, dan Kunjungan Rumah (Home Visit).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              <span>Buka Menu Wali Kelas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 3. Dokumen Pembina Eskul */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('extracurricular-docs')}
            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                  {eskulDocsCount} Berkas
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Dokumen Pembina Eskul
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Program Kerja Pramuka, PMR, Rohis, Paskibra, Jurnal Latihan & Sertifikat Prestasi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              <span>Buka Menu Eskul</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 4. Dokumen Kegiatan Sekolah */}
          <div
            onClick={() => onNavigateToTab && onNavigateToTab('other-activities-docs')}
            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                  {activityDocsCount} Berkas
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                Dokumen Kegiatan Lainnya
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Notula Rapat Guru & Komite, Berkas ANBK, Panitia PPDB, dan Peringatan Hari Besar.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              <span>Buka Menu Kegiatan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Daftar Berkas Terakhir Diunggah */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Berkas Terakhir Diunggah</h3>
            <p className="text-xs text-slate-500">Daftar dokumen kurikulum dan administrasi terbaru</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Saring dokumen..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={onNavigateToAllDocs}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Lihat Semua ({totalDocs})
            </button>
          </div>
        </div>

        {displayedDocs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Tidak ada dokumen yang sesuai dengan saringan pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Dokumen</th>
                  <th className="py-3 px-4">Kategori / Peran</th>
                  <th className="py-3 px-4">Pengunggah</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <button
                        onClick={() => onOpenDocDetail(doc)}
                        className="font-bold text-slate-900 hover:text-emerald-700 text-left line-clamp-1 cursor-pointer"
                      >
                        {doc.title}
                      </button>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono text-slate-500">{doc.code}</span>
                        <span>·</span>
                        <span>{doc.fileType}</span>
                        <span>·</span>
                        <span>{doc.fileSize}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800 block">
                        {doc.targetRole || doc.category}
                      </span>
                      <span className="text-[11px] text-slate-500">{doc.grade}</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-900 block">{doc.authorName}</span>
                      <span className="text-[11px] text-slate-500">{doc.subject}</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500">
                      {doc.uploadDate}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'Terverifikasi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'Menunggu Verifikasi'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {doc.status === 'Terverifikasi' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {doc.status === 'Menunggu Verifikasi' && <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{doc.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenDocDetail(doc)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Lihat Detail Dokumen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDownloadDoc(doc)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          title="Unduh Berkas"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Quick Help Box for Teachers */}
      <div className="bg-slate-100 rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Butuh bantuan format berkas atau panduan Kurikulum Merdeka SMPN 14 Tulang Bawang Barat?
          </span>
        </div>
        <button
          onClick={() => onNavigateToTab && onNavigateToTab('school-profile')}
          className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline shrink-0 cursor-pointer"
        >
          Lihat Profil & Kontak Tim Kurikulum →
        </button>
      </div>
    </div>
  );
};
