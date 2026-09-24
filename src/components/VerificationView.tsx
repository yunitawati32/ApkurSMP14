import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CurriculumDoc, DocStatus, SchoolProfile } from '../types/curriculum';

interface VerificationViewProps {
  documents: CurriculumDoc[];
  schoolProfile: SchoolProfile;
  onUpdateStatus: (docId: string, status: DocStatus, notes?: string) => void;
  onOpenDocDetail: (doc: CurriculumDoc) => void;
  onDownloadDoc: (doc: CurriculumDoc) => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  documents,
  schoolProfile,
  onUpdateStatus,
  onOpenDocDetail,
  onDownloadDoc,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'revision'>('pending');
  const [selectedDocForNotes, setSelectedDocForNotes] = useState<CurriculumDoc | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');
  const [targetStatus, setTargetStatus] = useState<DocStatus>('Terverifikasi');

  const pendingDocs = documents.filter((d) => d.status === 'Menunggu Verifikasi');
  const verifiedDocs = documents.filter((d) => d.status === 'Terverifikasi');
  const revisionDocs = documents.filter((d) => d.status === 'Perlu Revisi');

  const currentList =
    activeTab === 'pending' ? pendingDocs : activeTab === 'verified' ? verifiedDocs : revisionDocs;

  const handleQuickApprove = (doc: CurriculumDoc) => {
    onUpdateStatus(
      doc.id,
      'Terverifikasi',
      'Telah ditelaah dan memenuhi komponen kurikulum satuan pendidikan.'
    );
  };

  const handleOpenNotesModal = (doc: CurriculumDoc, status: DocStatus) => {
    setSelectedDocForNotes(doc);
    setTargetStatus(status);
    setNotesInput(doc.verificationNotes || '');
  };

  const handleSaveNotes = () => {
    if (selectedDocForNotes) {
      onUpdateStatus(selectedDocForNotes.id, targetStatus, notesInput);
      setSelectedDocForNotes(null);
      setNotesInput('');
    }
  };

  const handleApproveAllPending = () => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menyetujui semua (${pendingDocs.length}) berkas yang menunggu verifikasi sekaligus?`
      )
    ) {
      pendingDocs.forEach((doc) => {
        onUpdateStatus(
          doc.id,
          'Terverifikasi',
          'Disetujui secara serentak oleh Waka Kurikulum.'
        );
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Verifikasi & Telaah Administrasi Kurikulum
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
              {pendingDocs.length} Perlu Ditelaah
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proses pemeriksaan keabsahan dan kelengkapan perangkat ajar guru oleh Wakil Kepala Sekolah
            Bidang Kurikulum ({schoolProfile.curriculumVice}).
          </p>
        </div>

        {pendingDocs.length > 0 && (
          <button
            onClick={handleApproveAllPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer self-start md:self-auto transition-colors"
          >
            <Check className="w-4 h-4" />
            Setujui Semua ({pendingDocs.length})
          </button>
        )}
      </div>

      {/* Status Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Menunggu Telaah</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[11px] font-mono">
            {pendingDocs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('verified')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'verified'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Telah Terverifikasi</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[11px] font-mono">
            {verifiedDocs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('revision')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'revision'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Perlu Perbaikan (Revisi)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[11px] font-mono">
            {revisionDocs.length}
          </span>
        </button>
      </div>

      {/* Content List */}
      {currentList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            {activeTab === 'pending'
              ? 'Semua dokumen telah selesai ditelaah!'
              : activeTab === 'revision'
              ? 'Tidak ada dokumen dalam status perlu revisi'
              : 'Belum ada dokumen yang terverifikasi'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'Kerja bagus! Seluruh arsip yang diajukan oleh dewan guru telah terverifikasi.'
              : 'Gunakan tab di atas untuk memeriksa riwayat status telaah lainnya.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Dokumen & Kode</th>
                  <th className="py-3 px-4">Kategori & Mapel</th>
                  <th className="py-3 px-4">Penyusun & Tanggal</th>
                  <th className="py-3 px-4">Catatan Verifikator</th>
                  <th className="py-3 px-4 text-right">Keputusan Telaah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentList.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-mono text-[10px] text-slate-500 block mb-0.5">
                        {doc.code}
                      </span>
                      <button
                        onClick={() => onOpenDocDetail(doc)}
                        className="font-semibold text-slate-900 hover:text-emerald-600 text-left line-clamp-2 transition-colors cursor-pointer"
                      >
                        {doc.title}
                      </button>
                      <span className="text-[11px] text-slate-400">
                        {doc.fileType} • {doc.fileSize}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{doc.category}</span>
                      <span className="text-[11px] text-slate-500">
                        {doc.subject} ({doc.grade})
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{doc.authorName}</span>
                      <span className="text-[10px] text-slate-400">
                        Diajukan: {doc.uploadDate}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {doc.verificationNotes ? (
                        <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 line-clamp-2">
                          {doc.verificationNotes}
                        </p>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Belum ada catatan
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDocDetail(doc)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Periksa Dokumen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDownloadDoc(doc)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Unduh Berkas"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Fast Decision Buttons */}
                        {doc.status !== 'Terverifikasi' && (
                          <button
                            onClick={() => handleQuickApprove(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                            title="Setujui dan Sahkan"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenNotesModal(doc, 'Perlu Revisi')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer"
                          title="Minta Perbaikan / Revisi"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revisi</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes / Revision Modal */}
      {selectedDocForNotes && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Beri Catatan Telaah Kurikulum
            </h4>
            <p className="text-xs text-slate-600 line-clamp-1">
              Dokumen: <span className="font-semibold">{selectedDocForNotes.title}</span>
            </p>

            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Tindakan Status
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as DocStatus)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="Perlu Revisi">Minta Perbaikan (Perlu Revisi)</option>
                <option value="Terverifikasi">Setujui (Terverifikasi)</option>
                <option value="Menunggu Verifikasi">Kembalikan ke Menunggu Review</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Umpan Balik / Catatan Perbaikan
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan catatan perbaikan atau alasan persetujuan..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDocForNotes(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Simpan Keputusan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
