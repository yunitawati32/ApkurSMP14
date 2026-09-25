import React, { useState, useEffect } from 'react';
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
  Eye,
  Maximize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Presentation,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CurriculumDoc, SchoolProfile, DocStatus } from '../types/curriculum';
import { getFileFromCache } from '../utils/fileCache';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CurriculumDoc | null;
  schoolProfile: SchoolProfile;
  onDownload: (doc: CurriculumDoc) => void;
  onUpdateStatus: (docId: string, newStatus: DocStatus, notes?: string) => void;
  onOpenFullscreenPreview?: (doc: CurriculumDoc) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  document,
  schoolProfile,
  onDownload,
  onUpdateStatus,
  onOpenFullscreenPreview,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'registration'>('preview');
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [reviewStatus, setReviewStatus] = useState<DocStatus>('Terverifikasi');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Preview controls state
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [resolvedDataUrl, setResolvedDataUrl] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && document) {
      setZoomLevel(100);
      setRotation(0);
      // Auto open preview tab if file is uploaded
      setActiveTab('preview');

      if (document.fileDataUrl) {
        setResolvedDataUrl(document.fileDataUrl);
      } else {
        setIsLoadingFile(true);
        getFileFromCache(document.id)
          .then((cached) => setResolvedDataUrl(cached))
          .catch(() => setResolvedDataUrl(null))
          .finally(() => setIsLoadingFile(false));
      }
    } else {
      setResolvedDataUrl(null);
    }
  }, [isOpen, document]);

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

  const isImage =
    document.fileType === 'SCAN' ||
    /\.(png|jpe?g|webp|gif|svg)$/i.test(document.fileName) ||
    (resolvedDataUrl && resolvedDataUrl.startsWith('data:image/'));

  const isPDF =
    document.fileType === 'PDF' ||
    /\.pdf$/i.test(document.fileName) ||
    (resolvedDataUrl && resolvedDataUrl.startsWith('data:application/pdf'));

  const isExcel =
    document.fileType === 'XLSX' ||
    /\.(xlsx?|csv)$/i.test(document.fileName);

  const isWord =
    document.fileType === 'DOCX' ||
    /\.(docx?|rtf)$/i.test(document.fileName);

  const isPresentation =
    document.fileType === 'PPTX' ||
    /\.(pptx?|ppsx?)$/i.test(document.fileName);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* ============================================================== */}
        {/* MODAL TOP BAR                                                  */}
        {/* ============================================================== */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
              {isExcel ? (
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              ) : isImage ? (
                <ImageIcon className="w-5 h-5 text-amber-400" />
              ) : isPresentation ? (
                <Presentation className="w-5 h-5 text-orange-400" />
              ) : (
                <FileText className="w-5 h-5 text-emerald-300" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {document.code}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300 truncate max-w-xs">{document.category}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {document.fileType} • {document.fileSize}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate max-w-xl">
                {document.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenFullscreenPreview && (
              <button
                type="button"
                onClick={() => onOpenFullscreenPreview(document)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                title="Buka di Layar Penuh"
              >
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Layar Penuh</span>
              </button>
            )}
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

        {/* ============================================================== */}
        {/* TABS SELECTOR: Pratinjau Berkas vs Lembar Registrasi           */}
        {/* ============================================================== */}
        <div className="bg-slate-100 px-5 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau Berkas (File Preview)</span>
              {resolvedDataUrl && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('registration')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'registration'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Lembar Registrasi & Verifikasi</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Tahun Ajaran:</span>
            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {document.academicYear}
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODAL BODY                                                     */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {copiedLink && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
              Kode arsip dan judul berhasil disalin ke papan klip!
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: PRATINJAU BERKAS (INLINE FILE PREVIEW)                */}
          {/* ============================================================ */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {/* Preview Toolbar */}
              <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Pengaturan Tampilan:</span>
                  <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((p) => Math.max(p - 25, 50))}
                      disabled={zoomLevel <= 50}
                      className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Perkecil"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 font-mono text-[11px] text-emerald-400 font-bold">
                      {zoomLevel}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((p) => Math.min(p + 25, 200))}
                      disabled={zoomLevel >= 200}
                      className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Perbesar"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {(isImage || isPDF) && (
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors"
                      title="Putar Dokumen (Rotasi 90°)"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {resolvedDataUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const win = window.open();
                        if (win) {
                          win.document.write(
                            `<iframe src="${resolvedDataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                          );
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                      <span>Buka di Tab Baru</span>
                    </button>
                  )}

                  {onOpenFullscreenPreview && (
                    <button
                      type="button"
                      onClick={() => onOpenFullscreenPreview(document)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors text-[11px]"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Layar Penuh</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Content Container */}
              <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-6 border border-slate-800 min-h-[460px] flex items-center justify-center overflow-auto">
                {isLoadingFile ? (
                  <div className="text-center py-12 text-slate-400">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs">Memuat dokumen arsip...</p>
                  </div>
                ) : isPDF && resolvedDataUrl ? (
                  /* Embed PDF */
                  <div
                    style={{
                      transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="w-full max-w-4xl h-[600px] bg-white rounded-xl shadow-xl overflow-hidden"
                  >
                    <object
                      data={`${resolvedDataUrl}#toolbar=1`}
                      type="application/pdf"
                      className="w-full h-full"
                    >
                      <div className="p-8 text-center bg-white text-slate-800 h-full flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-rose-500 mb-2" />
                        <h4 className="text-sm font-bold">Dokumen PDF Terlampir</h4>
                        <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
                          {document.fileName}
                        </p>
                        <button
                          onClick={() => onDownload(document)}
                          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow"
                        >
                          Unduh Berkas PDF
                        </button>
                      </div>
                    </object>
                  </div>
                ) : isImage && resolvedDataUrl ? (
                  /* Scanned Image / Photo */
                  <div
                    style={{
                      transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="max-w-full max-h-[600px] bg-white p-2 rounded-xl shadow-2xl flex items-center justify-center"
                  >
                    <img
                      src={resolvedDataUrl}
                      alt={document.title}
                      className="max-w-full max-h-[560px] object-contain rounded"
                    />
                  </div>
                ) : (
                  /* Official Formatted Curriculum Document View (Kurikulum Merdeka Template) */
                  <div
                    style={{
                      transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-8 border border-slate-300 relative"
                  >
                    {/* Official Kop Surat */}
                    <div className="text-center pb-3 border-b-2 border-slate-900">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                        PEMERINTAH KABUPATEN TULANG BAWANG BARAT • DINAS PENDIDIKAN
                      </p>
                      <h4 className="text-sm sm:text-base font-black text-slate-950 uppercase mt-0.5">
                        {schoolProfile.name}
                      </h4>
                      <p className="text-[10px] text-slate-600">
                        NPSN: {schoolProfile.npsn} • Akreditasi: {schoolProfile.accreditation} • {schoolProfile.address}
                      </p>
                      <div className="w-full h-0.5 bg-slate-900 mt-1.5 mb-0.5"></div>
                      <div className="w-full h-px bg-slate-400"></div>
                    </div>

                    {/* Title */}
                    <div className="text-center my-4">
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        {document.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 uppercase mt-1.5 leading-snug">
                        {document.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 font-semibold">
                        Tahun Ajaran {document.academicYear} • Semester {document.semester}
                      </p>
                    </div>

                    {/* Info Matrix */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-lg bg-slate-50 border border-slate-200 mb-4">
                      <div>
                        <span className="text-slate-500">Mata Pelajaran:</span>{' '}
                        <strong className="text-slate-800">{document.subject}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Jenjang:</span>{' '}
                        <strong className="text-slate-800">{document.grade}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Penyusun:</span>{' '}
                        <strong className="text-slate-800">{document.authorName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Kategori:</span>{' '}
                        <strong className="text-emerald-700">{document.category}</strong>
                      </div>
                    </div>

                    {/* Description & Structured Content */}
                    <div className="space-y-3 text-xs text-slate-700">
                      <div>
                        <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1">
                          Ringkasan & Cakupan Perangkat Pembelajaran:
                        </h5>
                        <p className="text-[11px] leading-relaxed text-slate-600 bg-slate-50/50 p-2.5 rounded border border-slate-200">
                          {document.description}
                        </p>
                      </div>

                      {/* Curriculum Component Highlights */}
                      <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 text-[11px] space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Status Dokumen: {document.status}</span>
                        </div>
                        <p className="text-emerald-800 leading-normal">
                          Berkas resmi ini telah terdaftar dalam sistem SI-ARKUR SMPN 14 Tulang
                          Bawang Barat sebagai arsip sah perangkat pembelajaran pendidik.
                        </p>
                      </div>
                    </div>

                    {/* Sign-off signatures */}
                    <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                      <div>
                        <p className="font-semibold text-slate-900">{schoolProfile.curriculumVice}</p>
                        <p className="text-[10px] text-slate-500">Waka Kurikulum SMPN 14 Tubaba</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{document.authorName}</p>
                        <p className="text-[10px] text-slate-500">
                          {document.authorNip ? `NIP. ${document.authorNip}` : 'Guru Mata Pelajaran'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: LEMBAR REGISTRASI & VERIFIKASI RESMI                  */}
          {/* ============================================================ */}
          {activeTab === 'registration' && (
            <div className="space-y-6">
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
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200/60 rounded-md cursor-pointer"
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
                    <span
                      className="col-span-2 font-mono text-slate-800 text-[11px] truncate"
                      title={document.fileName}
                    >
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

              {/* Digital Validity Stamp */}
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
          )}
        </div>

        {/* ============================================================== */}
        {/* MODAL FOOTER ACTIONS                                           */}
        {/* ============================================================== */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer border border-slate-300"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen
            </button>
            {onOpenFullscreenPreview && (
              <button
                type="button"
                onClick={() => onOpenFullscreenPreview(document)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer border border-slate-300"
              >
                <Maximize2 className="w-4 h-4 text-emerald-600" />
                Pratinjau Layar Penuh
              </button>
            )}
          </div>

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
