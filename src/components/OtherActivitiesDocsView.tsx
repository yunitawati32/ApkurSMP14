import React, { useState } from 'react';
import {
  CalendarCheck,
  Search,
  Plus,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Award,
  BookOpen,
  Laptop,
  UserPlus,
  Sparkles,
  ChevronDown,
  CheckSquare,
} from 'lucide-react';
import { CurriculumDoc, DocStatus, SchoolProfile } from '../types/curriculum';

interface OtherActivitiesDocsViewProps {
  documents: CurriculumDoc[];
  schoolProfile: SchoolProfile;
  selectedAcademicYear: string;
  onOpenDocDetail: (doc: CurriculumDoc) => void;
  onDownloadDoc: (doc: CurriculumDoc) => void;
  onOpenUpload: (prefilledCategory?: string, prefilledRole?: string) => void;
  onUpdateStatus: (docId: string, status: DocStatus, notes?: string) => void;
}

export const OtherActivitiesDocsView: React.FC<OtherActivitiesDocsViewProps> = ({
  documents,
  schoolProfile,
  selectedAcademicYear,
  onOpenDocDetail,
  onDownloadDoc,
  onOpenUpload,
  onUpdateStatus,
}) => {
  // Filter for other activities documents
  const activityDocs = documents.filter(
    (d) =>
      d.domain === 'kegiatan-lainnya' ||
      d.category === 'Dokumen Kegiatan Sekolah & Notula' ||
      d.tags?.some((t) =>
        ['Notula Rapat', 'ANBK', 'PPDB', 'IHT', 'Workshop', 'PHBN', 'Akreditasi', 'Komite'].includes(t)
      )
  );

  const [selectedSubTab, setSelectedSubTab] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [showGuidelines, setShowGuidelines] = useState<boolean>(false);

  const filteredDocs = activityDocs.filter((doc) => {
    if (selectedSubTab !== 'Semua') {
      if (selectedSubTab === 'Notula Rapat' && !doc.title.toLowerCase().includes('notula') && !doc.tags?.includes('Notula Rapat')) return false;
      if (selectedSubTab === 'Asesmen Nasional (ANBK)' && !doc.title.toLowerCase().includes('anbk') && !doc.tags?.includes('ANBK')) return false;
      if (selectedSubTab === 'PPDB' && !doc.title.toLowerCase().includes('ppdb') && !doc.tags?.includes('PPDB')) return false;
      if (selectedSubTab === 'IHT & Workshop' && !doc.title.toLowerCase().includes('iht') && !doc.title.toLowerCase().includes('workshop')) return false;
      if (selectedSubTab === 'Hari Besar / PHBN' && !doc.title.toLowerCase().includes('hari') && !doc.tags?.includes('PHBN')) return false;
    }

    if (statusFilter !== 'Semua' && doc.status !== statusFilter) return false;

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

  const verifiedCount = activityDocs.filter((d) => d.status === 'Terverifikasi').length;
  const pendingCount = activityDocs.filter((d) => d.status === 'Menunggu Verifikasi').length;
  const anbkDocsCount = activityDocs.filter((d) => d.tags?.includes('ANBK') || d.title.includes('ANBK')).length;
  const notulaCount = activityDocs.filter((d) => d.tags?.includes('Notula Rapat') || d.title.includes('Notula')).length;

  const activityCategories = [
    { no: 1, title: 'Notula Rapat Dinas & Pleno Komite Sekolah', desc: 'Daftar hadir, berita acara keputusan, dan foto dokumentasi kegiatan' },
    { no: 2, title: 'Pelaksanaan Asesmen Nasional (ANBK & Sulingjar)', desc: 'SK Panitia, SK Proktor/Teknisi, DNT siswa, berita acara sinkronisasi' },
    { no: 3, title: 'Penerimaan Peserta Didik Baru (PPDB)', desc: 'Juknis PPDB, rekapitulasi pendaftar, SK panitia dan LPJ keuangan PPDB' },
    { no: 4, title: 'In-House Training (IHT) & Komunitas Belajar (Kombel)', desc: 'Materi workshop guru, narasumber, laporan peningkatan mutu ajar' },
    { no: 5, title: 'Peringatan Hari Besar Nasional & Keagamaan (PHBN/PHBI)', desc: 'Proposal kegiatan, rundown acara, dokumentasi dan laporan anggaran' },
    { no: 6, title: 'Dokumen Persiapan Akreditasi Satuan (BAN-PDM)', desc: 'Bukti fisik 4 komponen mutu lulusan, proses, guru dan manajemen' },
    { no: 7, title: 'Kemitraan Masyarakat, Tiyuh & Dinas Pendidikan', desc: 'MoU puskesmas, koramil, kepolisian, dan kunjungan budaya Tubaba' },
    { no: 8, title: 'Kegiatan Tengah Semester & Porseni Antar-Kelas', desc: 'Jadwal perlombaan, susunan dewan juri, rekap juara kelas' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/30">
              <CalendarCheck className="w-4 h-4 text-purple-400" />
              <span>Dokumentasi Kegiatan Satuan Pendidikan & Kepanitiaan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Dokumen Kegiatan Sekolah Lainnya
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed">
              Pusat penyimpanan arsip berita acara & notula rapat dewan guru, berkas kepanitiaan ANBK/Sulingjar,
              laporan PPDB, In-House Training (IHT), peringatan hari besar, serta dokumen akreditasi sekolah.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onOpenUpload('Dokumen Kegiatan Sekolah & Notula', 'Panitia Kegiatan')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Unggah Dokumen Kegiatan
            </button>
            <button
              onClick={() => setShowGuidelines(!showGuidelines)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-purple-300" />
              <span>Standar Berkas Kegiatan</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGuidelines ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-purple-200 block">Total Berkas Kegiatan</span>
            <span className="text-xl font-bold font-mono">{activityDocs.length}</span>
            <span className="text-[10px] text-purple-300 block">dokumen tersimpan</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-purple-200 block">Notula Rapat Dinas</span>
            <span className="text-xl font-bold font-mono text-purple-300">{notulaCount || 1} Berkas</span>
            <span className="text-[10px] text-purple-200/70 block">Guru & Komite</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-purple-200 block">Kepanitiaan ANBK</span>
            <span className="text-xl font-bold font-mono text-purple-300">{anbkDocsCount || 1} Berkas</span>
            <span className="text-[10px] text-purple-200/70 block">Asesmen Nasional</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-emerald-300 block">Terverifikasi</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{verifiedCount}</span>
            <span className="text-[10px] text-emerald-200/70 block">dokumen sah</span>
          </div>
        </div>
      </div>

      {/* Guidelines Collapsible */}
      {showGuidelines && (
        <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Format Standar Dokumentasi & Arsip Kepanitiaan SMPN 14 Tulang Bawang Barat
              </h3>
            </div>
            <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2.5 py-1 rounded-full">
              Pedoman Tata Usaha & Kearsipan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {activityCategories.map((item) => (
              <div
                key={item.no}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5"
              >
                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center shrink-0">
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
          'Notula Rapat',
          'Asesmen Nasional (ANBK)',
          'PPDB',
          'IHT & Workshop',
          'Hari Besar / PHBN',
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedSubTab(tab)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedSubTab === tab
                ? 'bg-purple-600 text-white shadow-xs'
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
            placeholder="Cari berkas kegiatan, notula, ANBK, PPDB, panitia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          <CalendarCheck className="w-12 h-12 text-purple-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">Tidak ada dokumen kegiatan yang cocok</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Gunakan tombol "+ Unggah Dokumen Kegiatan" untuk menambahkan notula rapat, berkas ANBK, atau laporan PPDB.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Dokumen & Kode</th>
                  <th className="py-3 px-4">Kepanitiaan & Peran</th>
                  <th className="py-3 px-4">Penanggung Jawab</th>
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
                        <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
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
                        className="font-bold text-slate-900 hover:text-purple-700 text-left line-clamp-2 transition-colors cursor-pointer"
                      >
                        {doc.title}
                      </button>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {doc.fileType} • {doc.fileSize}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {doc.targetRole || 'Kepanitiaan Sekolah'}
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
                          className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg cursor-pointer"
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
                                'Dokumen kegiatan telah diperiksa dan disetujui.'
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
