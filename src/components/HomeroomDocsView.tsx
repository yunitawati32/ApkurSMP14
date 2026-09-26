import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GraduationCap,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  MapPin,
  HeartHandshake,
  BookOpen,
  CheckSquare,
  ChevronDown,
} from 'lucide-react';
import { CurriculumDoc, DocStatus, SchoolProfile } from '../types/curriculum';

interface HomeroomDocsViewProps {
  documents: CurriculumDoc[];
  schoolProfile: SchoolProfile;
  selectedAcademicYear: string;
  onOpenDocDetail: (doc: CurriculumDoc) => void;
  onDownloadDoc: (doc: CurriculumDoc) => void;
  onOpenUpload: (prefilledCategory?: string, prefilledRole?: string) => void;
  onUpdateStatus: (docId: string, status: DocStatus, notes?: string) => void;
}

export const HomeroomDocsView: React.FC<HomeroomDocsViewProps> = ({
  documents,
  schoolProfile,
  selectedAcademicYear,
  onOpenDocDetail,
  onDownloadDoc,
  onOpenUpload,
  onUpdateStatus,
}) => {
  // Filter for homeroom documents
  const homeroomDocs = documents.filter(
    (d) =>
      d.domain === 'wali-kelas' ||
      d.category === 'Dokumen Administrasi Wali Kelas' ||
      d.targetRole?.toLowerCase().includes('wali') ||
      d.tags?.some((t) =>
        ['Wali Kelas', 'Home Visit', 'Buku Kasus', 'Leger Nilai', 'Presensi Bulanan', 'Rombel'].includes(t)
      )
  );

  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [selectedSubTab, setSelectedSubTab] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [showChecklistGuide, setShowChecklistGuide] = useState<boolean>(false);

  const classList = [
    { id: 'Semua', name: 'Semua Rombel (12 Kelas)' },
    { id: 'Kelas 7.1', name: 'Kelas 7.1', wali: 'Rohisa., S.Pd' },
    { id: 'Kelas 7.2', name: 'Kelas 7.2', wali: 'Siti Halimah., S.Pd' },
    { id: 'Kelas 7.3', name: 'Kelas 7.3', wali: 'Candra Mustika., S.Pd' },
    { id: 'Kelas 7.4', name: 'Kelas 7.4', wali: 'Agustina Jayanti., S.Pd' },
    { id: 'Kelas 8.1', name: 'Kelas 8.1', wali: 'Eti Inrayuni., S.Pd' },
    { id: 'Kelas 8.2', name: 'Kelas 8.2', wali: 'Ria Siti Nur Hasanah., S.Pd' },
    { id: 'Kelas 8.3', name: 'Kelas 8.3', wali: 'Siti Romelah., S.Pd' },
    { id: 'Kelas 8.4', name: 'Kelas 8.4', wali: 'Julita Dewi., S.Pd' },
    { id: 'Kelas 9.1', name: 'Kelas 9.1', wali: 'Herlina., S.Pd' },
    { id: 'Kelas 9.2', name: 'Kelas 9.2', wali: 'Rahadian Abdurroziq., S.Pd' },
    { id: 'Kelas 9.3', name: 'Kelas 9.3', wali: 'Lupi Novita., S.Pd' },
    { id: 'Kelas 9.4', name: 'Kelas 9.4', wali: 'Jenius Aritonang., S.Pd' },
  ];

  const filteredDocs = homeroomDocs.filter((doc) => {
    // Filter class
    if (selectedClass !== 'Semua') {
      const shortCode = selectedClass.replace('Kelas ', ''); // e.g., '7.1'
      const matchRole = doc.targetRole?.includes(selectedClass) || doc.targetRole?.includes(shortCode);
      const matchTitle = doc.title.includes(selectedClass) || doc.title.includes(shortCode);
      const matchGrade = doc.grade === selectedClass;
      const matchTags = doc.tags?.some((t) => t.includes(selectedClass) || t.includes(shortCode));
      if (!matchRole && !matchTitle && !matchGrade && !matchTags) return false;
    }

    // Filter sub tab
    if (selectedSubTab !== 'Semua') {
      if (selectedSubTab === 'Program Kerja' && !doc.title.toLowerCase().includes('program kerja') && doc.subCategory !== 'Program Kerja Wali Kelas') return false;
      if (selectedSubTab === 'Presensi Bulanan' && !doc.title.toLowerCase().includes('presensi') && !doc.title.toLowerCase().includes('absensi')) return false;
      if (selectedSubTab === 'Buku Kasus & Home Visit' && !doc.title.toLowerCase().includes('visit') && !doc.title.toLowerCase().includes('kasus') && !doc.title.toLowerCase().includes('bimbingan')) return false;
      if (selectedSubTab === 'Leger & Rapor' && !doc.title.toLowerCase().includes('leger') && !doc.title.toLowerCase().includes('rapor')) return false;
    }

    // Status filter
    if (statusFilter !== 'Semua' && doc.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        doc.title.toLowerCase().includes(q) ||
        doc.authorName.toLowerCase().includes(q) ||
        doc.code.toLowerCase().includes(q) ||
        doc.tags?.some((t) => t.toLowerCase().includes(q)) ||
        (doc.targetRole && doc.targetRole.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const verifiedCount = homeroomDocs.filter((d) => d.status === 'Terverifikasi').length;
  const pendingCount = homeroomDocs.filter((d) => d.status === 'Menunggu Verifikasi').length;

  const homeroomObligations = [
    { no: 1, title: 'Program Kerja Tahunan Wali Kelas', desc: 'Visi kelas, program pembinaan karakter siswa & agenda rutin' },
    { no: 2, title: 'Struktur Organisasi Kelas & Denah Duduk', desc: 'Pengurus kelas, jadwal piket 7K & rotasi bangku berkala' },
    { no: 3, title: 'Buku Rekapitulasi Presensi & Kehadiran Bulanan', desc: 'Grafik ketidakhadiran (S/I/A) dan tindak lanjut siswa' },
    { no: 4, title: 'Buku Catatan Kasus & Bimbingan Khusus Siswa', desc: 'Koordinasi bersama Guru BK dan catatan perkembangan' },
    { no: 5, title: 'Buku & Surat Tugas Kunjungan Rumah (Home Visit)', desc: 'Pendampingan langsung siswa ke tiyuh tempat tinggal' },
    { no: 6, title: 'Buku Kas Paguyuban & Notula Rapat Wali Murid', desc: 'Transparansi keuangan kelas & kemitraan orang tua' },
    { no: 7, title: 'Buku Leger Nilai Hasil Belajar & Kumpulan Nilai Mapel', desc: 'Rekapitulasi nilai formatif/sumatif dari seluruh guru mapel' },
    { no: 8, title: 'Laporan Capaian Rapor Siswa & e-Rapor Satuan', desc: 'Distribusi laporan hasil belajar tengah & akhir semester' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Administrasi & Portofolio Wali Kelas (Rombel 7, 8, 9)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Dokumen Administrasi Wali Kelas
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Pusat penyimpanan program kerja wali kelas, rekapitulasi presensi bulanan, buku bimbingan
              siswa, catatan kunjungan rumah (home visit), buku kas paguyuban, serta buku leger nilai rapor siswa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onOpenUpload('Dokumen Administrasi Wali Kelas', 'Wali Kelas')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Unggah Dokumen Wali Kelas
            </button>
            <button
              onClick={() => setShowChecklistGuide(!showChecklistGuide)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>8 Administrasi Wajib</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showChecklistGuide ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-emerald-200 block">Total Arsip Wali Kelas</span>
            <span className="text-xl font-bold font-mono">{homeroomDocs.length}</span>
            <span className="text-[10px] text-emerald-300 block">dokumen rombel</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-teal-300 block">Rombongan Belajar</span>
            <span className="text-xl font-bold font-mono text-teal-300">12 Kelas</span>
            <span className="text-[10px] text-teal-200/70 block">7.1–7.4, 8.1–8.4, 9.1–9.4</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-emerald-300 block">Terverifikasi Waka</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{verifiedCount}</span>
            <span className="text-[10px] text-emerald-200/70 block">administrasi sah</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-amber-300 block">Menunggu Telaah</span>
            <span className="text-xl font-bold font-mono text-amber-400">{pendingCount}</span>
            <span className="text-[10px] text-amber-200/70 block">dalam proses</span>
          </div>
        </div>
      </div>

      {/* 8-Item Homeroom Admin Checklist Collapsible */}
      {showChecklistGuide && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                8 Standar Buku Kerja & Administrasi Wali Kelas SMPN 14 Tulang Bawang Barat
              </h3>
            </div>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
              Kesiapan Akreditasi Satuan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {homeroomObligations.map((item) => (
              <div
                key={item.no}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5"
              >
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
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

      {/* Class Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {classList.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedClass(c.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedClass === c.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{c.name}</span>
            {c.wali && selectedClass !== c.id && (
              <span className="text-[10px] text-slate-400 hidden lg:inline">({c.wali.split(',')[0]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          'Semua',
          'Program Kerja',
          'Presensi Bulanan',
          'Buku Kasus & Home Visit',
          'Leger & Rapor',
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedSubTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedSubTab === tab
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
            placeholder="Cari berkas wali kelas, siswa, presensi, nomor surat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Terverifikasi">Terverifikasi</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Perlu Revisi">Perlu Revisi</option>
          </select>
        </div>
      </div>

      {/* Document List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">Tidak ada dokumen wali kelas yang cocok</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Gunakan tombol "+ Unggah Dokumen Wali Kelas" untuk menambahkan berkas program kerja atau presensi rombel.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Dokumen & Kode</th>
                  <th className="py-3 px-4">Rombel & Peran</th>
                  <th className="py-3 px-4">Wali Kelas Pengunggah</th>
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
                        <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
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
                        className="font-bold text-slate-900 hover:text-emerald-700 text-left line-clamp-2 transition-colors cursor-pointer"
                      >
                        {doc.title}
                      </button>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {doc.fileType} • {doc.fileSize}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {doc.targetRole || doc.grade}
                      </span>
                      <span className="text-[11px] text-slate-500">{doc.semester}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{doc.authorName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {doc.authorNip || '-'}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-600 font-mono text-[11px]">{doc.uploadDate}</span>
                      <span className="text-[10px] text-slate-400 block">{doc.academicYear}</span>
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
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
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
                                'Administrasi wali kelas telah diverifikasi dan disetujui.'
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
