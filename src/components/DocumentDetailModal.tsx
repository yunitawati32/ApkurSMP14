import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  ShieldCheck,
  Tag,
  BookOpen,
  Share2,
  FileSpreadsheet,
  Edit3,
} from 'lucide-react';
import { CurriculumDoc, SchoolProfile, DocStatus } from '../types/curriculum';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CurriculumDoc | null;
  schoolProfile: SchoolProfile;
  onDownload: (doc: CurriculumDoc) => void;
  onUpdateStatus: (docId: string, newStatus: DocStatus, notes?: string) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  document,
  schoolProfile,
  onDownload,
  onUpdateStatus,
}) => {
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [reviewStatus, setReviewStatus] = useState<DocStatus>('Terverifikasi');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!isOpen || !document) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`${document.code}: ${document.title}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveReview = () => {
    onUpdateStatus(document.id, reviewStatus, reviewNotes);
    setShowReviewForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {document.code}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-300">{document.category}</span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1 max-w-xl">
                {document.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Salin Kode Arsip"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Official Institution Header (Kop Surat Resmi) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center relative overflow-hidden">
            <div className="max-w-2xl mx-auto">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Pemerintah Kabupaten Tulang Bawang Barat • Dinas Pendidikan dan Kebudayaan
              </p>
              <h4 className="text-base font-extrabold text-slate-900 uppercase mt-0.5">
                {schoolProfile.name}
              </h4>
              <p className="text-[11px] text-slate-600">
                NPSN: {schoolProfile.npsn} • {schoolProfile.accreditation} • {schoolProfile.address}
              </p>
              <div className="w-full h-0.5 bg-slate-800 mt-2 mb-0.5"></div>
              <div className="w-full h-px bg-slate-400"></div>
              <p className="text-[11px] font-bold text-emerald-800 mt-1 uppercase tracking-wide">
                LEMBAR REGISTRASI ARSIP KURIKULUM DIGITAL (SI-ARKUR)
              </p>
            </div>
          </div>

          {copiedLink && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
              Kode arsip dan judul berhasil disalin ke papan klip!
            </div>
          )}

          {/* Status & Verification Badge Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  document.status === 'Terverifikasi'
                    ? 'bg-emerald-100 text-emerald-700'
                    : document.status === 'Menunggu Verifikasi'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {document.status === 'Terverifikasi' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status Dokumen:
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      document.status === 'Terverifikasi'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : document.status === 'Menunggu Verifikasi'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {document.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {document.verifiedBy
                    ? `Diverifikasi oleh: ${document.verifiedBy} pada ${document.verifiedDate || '-'}`
                    : 'Menunggu review dari Tim Kurikulum / Waka Kurikulum'}
                </p>
              </div>
            </div>

            {/* Verification action button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setReviewStatus(document.status);
                  setReviewNotes(document.verificationNotes || '');
                  setShowReviewForm(!showReviewForm);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {showReviewForm ? 'Tutup Telaah' : 'Ubah Status Telaah'}
              </button>
            </div>
          </div>

          {/* Review Form Drawer if clicked */}
          {showReviewForm && (
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Panel Telaah & Verifikasi Kurikulum
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                    Ubah Status Ke
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as DocStatus)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Terverifikasi">Terverifikasi (Disetujui)</option>
                    <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                    <option value="Perlu Revisi">Perlu Revisi (Perbaikan)</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                    Catatan / Rekomendasi Perbaikan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Format ATP sudah lengkap, tambahkan rubrik asesmen produk."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200/60 rounded-md"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveReview}
                  className="px-4 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer"
                >
                  Simpan Hasil Telaah
                </button>
              </div>
            </div>
          )}

          {/* Verification Notes Alert if exists */}
          {document.verificationNotes && !showReviewForm && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
              <span className="font-bold">Catatan Telaah Kurikulum: </span>
              <span>{document.verificationNotes}</span>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Box: Academic Info */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Informasi Kurikulum & Pembelajaran
              </h5>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <span className="text-slate-500 font-medium">Model Kurikulum:</span>
                <span className="col-span-2 font-semibold text-slate-900">
                  {document.curriculumType}
                </span>

                <span className="text-slate-500 font-medium">Mata Pelajaran:</span>
                <span className="col-span-2 font-semibold text-slate-900">{document.subject}</span>

                <span className="text-slate-500 font-medium">Tingkat / Kelas:</span>
                <span className="col-span-2 font-semibold text-slate-900">{document.grade}</span>

                <span className="text-slate-500 font-medium">Tahun Ajaran:</span>
                <span className="col-span-2 font-semibold text-slate-900 font-mono">
                  {document.academicYear}
                </span>

                <span className="text-slate-500 font-medium">Semester:</span>
                <span className="col-span-2 font-semibold text-slate-900">{document.semester}</span>

                <span className="text-slate-500 font-medium">Kategori:</span>
                <span className="col-span-2 font-semibold text-emerald-700">
                  {document.category}
                </span>
              </div>
            </div>

            {/* Right Box: Author & Digital File Info */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                Identitas Penyusun & Berkas
              </h5>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <span className="text-slate-500 font-medium">Nama Penyusun:</span>
                <span className="col-span-2 font-semibold text-slate-900">
                  {document.authorName}
                </span>

                <span className="text-slate-500 font-medium">NIP Guru:</span>
                <span className="col-span-2 font-mono text-slate-800">
                  {document.authorNip || '-'}
                </span>

                <span className="text-slate-500 font-medium">Tanggal Arsip:</span>
                <span className="col-span-2 font-mono text-slate-800">{document.uploadDate}</span>

                <span className="text-slate-500 font-medium">Nama Berkas:</span>
                <span className="col-span-2 font-mono text-slate-800 text-[11px] truncate" title={document.fileName}>
                  {document.fileName}
                </span>

                <span className="text-slate-500 font-medium">Format & Ukuran:</span>
                <span className="col-span-2 font-semibold text-slate-900">
                  {document.fileType} • {document.fileSize}
                </span>

                <span className="text-slate-500 font-medium">Jumlah Diunduh:</span>
                <span className="col-span-2 font-mono text-slate-800">
                  {document.downloadCount} kali
                </span>
              </div>
            </div>
          </div>

          {/* Description / Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Deskripsi & Catatan Dokumen
            </h5>
            <p className="text-xs text-slate-700 leading-relaxed">{document.description}</p>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2.5 border-t border-slate-200">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {document.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Digital Validity Stamp (Stempel Keabsahan Digital) */}
          <div className="p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-600 flex items-center justify-center text-emerald-800 font-extrabold text-xs text-center leading-tight rotate-[-6deg]">
                <span>SAH<br />TUBABA</span>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  Repositori Digital Terverifikasi
                </p>
                <p className="text-[11px] text-emerald-800">
                  Arsip kurikulum sah terdaftar dalam basis data SMPN 14 Tulang Bawang Barat
                </p>
                <p className="text-[10px] text-emerald-700 font-mono">
                  Hash Validasi: {document.code}-{document.academicYear.replace('/', '')}-VALID
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-600">
              <p className="font-semibold text-slate-900">{schoolProfile.curriculumVice}</p>
              <p className="text-[11px] text-slate-500">Waka Kurikulum SMPN 14 Tubaba</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer border border-slate-300"
          >
            <Printer className="w-4 h-4" />
            Cetak Tanda Terima Arsip
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 rounded-xl cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => onDownload(document)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Unduh Dokumen Berkas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
