import React, { useState } from 'react';
import {
  Trophy,
  Search,
  Plus,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Calendar,
  Sparkles,
  Users,
  Compass,
  HeartPulse,
  Flame,
  Palette,
  CheckSquare,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { CurriculumDoc, DocStatus, SchoolProfile } from '../types/curriculum';

interface ExtracurricularDocsViewProps {
  documents: CurriculumDoc[];
  schoolProfile: SchoolProfile;
  selectedAcademicYear: string;
  onOpenDocDetail: (doc: CurriculumDoc) => void;
  onDownloadDoc: (doc: CurriculumDoc) => void;
  onOpenUpload: (prefilledCategory?: string, prefilledRole?: string) => void;
  onUpdateStatus: (docId: string, status: DocStatus, notes?: string) => void;
}

export const ExtracurricularDocsView: React.FC<ExtracurricularDocsViewProps> = ({
  documents,
  schoolProfile,
  selectedAcademicYear,
  onOpenDocDetail,
  onDownloadDoc,
  onOpenUpload,
  onUpdateStatus,
}) => {
  // Filter for extracurricular documents
  const eskulDocs = documents.filter(
    (d) =>
      d.domain === 'pembina-eskul' ||
      d.category === 'Dokumen Pembina Ekstrakurikuler' ||
      d.targetRole?.toLowerCase().includes('pembina') ||
      d.tags?.some((t) =>
        [
          'UKS',
          'Pramuka',
          'OSIS',
          'ROHIS',
          'SENI TARI',
          'OLAH RAGA',
          'Eskul',
          'Rohis',
          'Seni Tari',
          'Olahraga',
          'Tari Tradisional',
          'Prestasi',
          'Gudep',
          'Jurnal Eskul',
          'Program Kerja Eskul',
        ].includes(t)
      )
  );

  const [selectedEskul, setSelectedEskul] = useState<string>('Semua');
  const [selectedSubTab, setSelectedSubTab] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [showGuidelines, setShowGuidelines] = useState<boolean>(false);

  const eskulList = [
    { id: 'Semua', name: 'Semua Eskul' },
    { id: 'UKS', name: 'UKS', pembina: 'Enik Ernawati., S.Pd' },
    { id: 'Pramuka', name: 'Pramuka', pembina: 'Affan Yusuf., S.Pd' },
    { id: 'OSIS', name: 'OSIS', pembina: 'Ratih Ernawati., S.Kom' },
    { id: 'ROHIS', name: 'ROHIS', pembina: 'Rike Kurniatika., S.PdI' },
    { id: 'SENI TARI', name: 'SENI TARI', pembina: 'Herlina., S.Pd' },
    { id: 'OLAH RAGA', name: 'OLAH RAGA', pembina: 'Rahadian Abdurroziq., S.Pd' },
  ];

  const filteredDocs = eskulDocs.filter((doc) => {
    // Filter Eskul
    if (selectedEskul !== 'Semua') {
      const targetLower = selectedEskul.toLowerCase();
      const altTarget = targetLower.replace(/\s+/g, ''); // e.g. 'olahraga' for 'olah raga'
      const roleLower = (doc.targetRole || '').toLowerCase();
      const titleLower = doc.title.toLowerCase();
      const matchRole = roleLower.includes(targetLower) || roleLower.replace(/\s+/g, '').includes(altTarget);
      const matchTitle = titleLower.includes(targetLower) || titleLower.replace(/\s+/g, '').includes(altTarget);
      const matchTags = doc.tags?.some((t) => {
        const tl = t.toLowerCase();
        return tl.includes(targetLower) || tl.replace(/\s+/g, '').includes(altTarget);
      });
      if (!matchRole && !matchTitle && !matchTags) return false;
    }

    // Filter sub tab
    if (selectedSubTab !== 'Semua') {
      if (selectedSubTab === 'Program Kerja' && !doc.title.toLowerCase().includes('proker') && !doc.title.toLowerCase().includes('program kerja') && doc.subCategory !== 'Program Kerja Eskul') return false;
      if (selectedSubTab === 'Presensi Latihan' && !doc.title.toLowerCase().includes('presensi') && !doc.title.toLowerCase().includes('jurnal')) return false;
      if (selectedSubTab === 'SK Pembina' && !doc.title.toLowerCase().includes('sk')) return false;
      if (selectedSubTab === 'Prestasi & Piagam' && !doc.title.toLowerCase().includes('prestasi') && !doc.title.toLowerCase().includes('piagam') && !doc.title.toLowerCase().includes('juara')) return false;
      if (selectedSubTab === 'Proposal & LPJ' && !doc.title.toLowerCase().includes('proposal') && !doc.title.toLowerCase().includes('lpj')) return false;
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

  const verifiedCount = eskulDocs.filter((d) => d.status === 'Terverifikasi').length;
  const pendingCount = eskulDocs.filter((d) => d.status === 'Menunggu Verifikasi').length;
  const prestasiCount = eskulDocs.filter(
    (d) =>
      d.tags?.some((t) => ['Prestasi', 'Juara 1', 'Piagam'].includes(t)) ||
      d.subCategory === 'Prestasi & Piagam'
  ).length;

  const eskulStandards = [
    { no: 1, title: 'Program Kerja & Silabus Latihan Mingguan', desc: 'Rencana target kompetensi ekstrakurikuler selama 1 tahun ajaran' },
    { no: 2, title: 'SK Penetapan Pembina & Pelatih Resmi Sekolah', desc: 'Surat Keputusan Kepala Sekolah pembagian tugas pembina eskul' },
    { no: 3, title: 'Buku Daftar Anggota & Presensi Latihan Rutin', desc: 'Daftar nama siswa peserta eskul dan catatan kehadiran tiap latihan' },
    { no: 4, title: 'Buku Jurnal Pelaksanaan Latihan & Materi', desc: 'Materi pembinaan karakter, teknis keterampilan, dan dokumentasi' },
    { no: 5, title: 'Proposal Kegiatan, Kemah & Anggaran Lomba', desc: 'Pengajuan izin pelaksanaan kegiatan outdoor atau pendaftaran kejuaraan' },
    { no: 6, title: 'Laporan Pertanggungjawaban (LPJ) Kegiatan', desc: 'Laporan evaluasi kegiatan dan bukti fisik pertanggungjawaban dana' },
    { no: 7, title: 'Buku Rekapitulasi Prestasi & Piagam Kejuaraan', desc: 'Penyimpanan sertifikat penghargaan siswa tingkat Tubaba / Provinsi' },
    { no: 8, title: 'Jadwal Pemakaian Lapangan & Inventaris Alat', desc: 'Koordinasi sarana prasarana sekolah agar teratur dan terpelihara' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-amber-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Pengembangan Bakat, Minat & Ekstrakurikuler Siswa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Dokumen Pembina Ekstrakurikuler
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed">
              Arsip resmi program kerja pembina UKS, Pramuka, OSIS, ROHIS, SENI TARI, dan OLAH RAGA,
              jurnal kegiatan rutin, proposal lomba, LPJ, serta arsip piagam prestasi siswa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() =>
                onOpenUpload(
                  'Dokumen Pembina Ekstrakurikuler',
                  selectedEskul !== 'Semua' ? `Pembina ${selectedEskul}` : 'Pembina Eskul'
                )
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Unggah Dokumen Eskul
            </button>
            <button
              onClick={() => setShowGuidelines(!showGuidelines)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>8 Standar Eskul</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGuidelines ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-amber-200 block">Total Berkas Eskul</span>
            <span className="text-xl font-bold font-mono">{eskulDocs.length}</span>
            <span className="text-[10px] text-amber-300 block">dokumen tersimpan</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-amber-200 block">Ekstrakurikuler Aktif</span>
            <span className="text-xl font-bold font-mono text-amber-300">6 Bidang</span>
            <span className="text-[10px] text-amber-200/70 block">UKS, Pramuka, OSIS, ROHIS, Seni Tari, Olahraga</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-amber-200 block">Prestasi & Piagam</span>
            <span className="text-xl font-bold font-mono text-amber-400">{prestasiCount || 1} Piagam</span>
            <span className="text-[10px] text-amber-200/70 block">Tingkat Tubaba & Provinsi</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-emerald-300 block">Terverifikasi Waka</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{verifiedCount}</span>
            <span className="text-[10px] text-emerald-200/70 block">dokumen sah</span>
          </div>
        </div>
      </div>

      {/* 8-Item Guidelines Collapsible */}
      {showGuidelines && (
        <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                8 Standar Tata Kelola & Dokumen Administrasi Pembina Ekstrakurikuler
              </h3>
            </div>
            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full">
              Kesiswaan SMPN 14 Tubaba
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {eskulStandards.map((item) => (
              <div
                key={item.no}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5"
              >
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">
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

      {/* Eskul Unit Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {eskulList.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelectedEskul(e.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedEskul === e.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{e.name}</span>
            {e.pembina && selectedEskul !== e.id && (
              <span className="text-[10px] text-slate-400 hidden lg:inline">({e.pembina.split(',')[0]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          'Semua',
          'Program Kerja',
          'Presensi Latihan',
          'SK Pembina',
          'Proposal & LPJ',
          'Prestasi & Piagam',
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
            placeholder="Cari berkas eskul, nama pembina, pramuka, PMR, piagam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
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
          <Trophy className="w-12 h-12 text-amber-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">Tidak ada dokumen eskul yang cocok</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Gunakan tombol "+ Unggah Dokumen Eskul" untuk mengunggah program kerja atau jurnal kegiatan pembina.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Dokumen & Kode</th>
                  <th className="py-3 px-4">Bidang Eskul & Peran</th>
                  <th className="py-3 px-4">Pembina Pengunggah</th>
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
                        <span className="font-mono text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
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
                        className="font-bold text-slate-900 hover:text-amber-700 text-left line-clamp-2 transition-colors cursor-pointer"
                      >
                        {doc.title}
                      </button>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {doc.fileType} • {doc.fileSize}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {doc.targetRole || 'Pembina Ekstrakurikuler'}
                      </span>
                      <span className="text-[11px] text-slate-500">{doc.academicYear}</span>
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
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer"
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
                                'Administrasi eskul telah diverifikasi dan disetujui.'
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
