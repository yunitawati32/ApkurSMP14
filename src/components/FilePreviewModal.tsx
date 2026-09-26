import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Presentation,
  Check,
  Copy,
  BookOpen,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { CurriculumDoc, SchoolProfile, FileType } from '../types/curriculum';
import { getFileFromCache } from '../utils/fileCache';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: CurriculumDoc | null;
  schoolProfile?: SchoolProfile;
  // Direct file preview props when previewing before upload
  rawFile?: {
    name: string;
    type: FileType;
    dataUrl?: string;
    size?: string;
    title?: string;
    category?: string;
  };
  onDownload?: (doc: CurriculumDoc) => void;
  onOpenDetail?: (doc: CurriculumDoc) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  schoolProfile,
  rawFile,
  onDownload,
  onOpenDetail,
}) => {
  // Zoom & Rotation states
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [bgMode, setBgMode] = useState<'slate' | 'white' | 'grid'>('slate');
  const [activeSlide, setActiveSlide] = useState<number>(1);
  const [activeSheetTab, setActiveSheetTab] = useState<string>('Lembar Utama');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Cached file data URL state
  const [resolvedDataUrl, setResolvedDataUrl] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  // Reset controls when modal opens or document changes
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(100);
      setRotation(0);
      setActiveSlide(1);
      setActiveSheetTab('Lembar Utama');

      if (rawFile?.dataUrl) {
        setResolvedDataUrl(rawFile.dataUrl);
        setIsLoadingFile(false);
      } else if (document) {
        if (document.fileDataUrl) {
          setResolvedDataUrl(document.fileDataUrl);
          setIsLoadingFile(false);
        } else {
          // Check IndexedDB cache
          setIsLoadingFile(true);
          getFileFromCache(document.id)
            .then((cachedUrl) => {
              if (cachedUrl) {
                setResolvedDataUrl(cachedUrl);
              } else {
                setResolvedDataUrl(null);
              }
            })
            .catch(() => setResolvedDataUrl(null))
            .finally(() => setIsLoadingFile(false));
        }
      }
    } else {
      setResolvedDataUrl(null);
    }
  }, [isOpen, document, rawFile]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fileName = rawFile?.name || document?.fileName || 'Dokumen_Kurikulum.pdf';
  const fileType = rawFile?.type || document?.fileType || 'PDF';
  const fileSize = rawFile?.size || document?.fileSize || '1.2 MB';
  const title = rawFile?.title || document?.title || fileName;
  const category = rawFile?.category || document?.category || 'Perangkat Pembelajaran';
  const docCode = document?.code || 'ARK-2026-PREVIEW';
  const authorName = document?.authorName || 'Pendidik SMPN 14 Tubaba';
  const academicYear = document?.academicYear || '2026/2027';
  const semester = document?.semester || 'Ganjil';
  const grade = document?.grade || 'Fase D';
  const subject = document?.subject || 'Umum';

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => {
    setZoomLevel(100);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (document && onDownload) {
      onDownload(document);
    } else if (resolvedDataUrl) {
      const link = window.document.createElement('a');
      link.href = resolvedDataUrl;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (resolvedDataUrl) {
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${resolvedDataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      }
    }
  };

  const handleCopyManifest = () => {
    const text = `DOKUMEN RESMI SI-ARKUR\nKode: ${docCode}\nJudul: ${title}\nKategori: ${category}\nTahun Ajaran: ${academicYear} (${semester})\nPenyusun: ${authorName}\nSekolah: SMP Negeri 14 Tulang Bawang Barat`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Determine renderer mode
  const isImage =
    fileType === 'SCAN' ||
    /\.(png|jpe?g|webp|gif|svg)$/i.test(fileName) ||
    (resolvedDataUrl && resolvedDataUrl.startsWith('data:image/'));

  const isPDF =
    fileType === 'PDF' ||
    /\.pdf$/i.test(fileName) ||
    (resolvedDataUrl && resolvedDataUrl.startsWith('data:application/pdf'));

  const isExcel =
    fileType === 'XLSX' ||
    /\.(xlsx?|csv)$/i.test(fileName);

  const isWord =
    fileType === 'DOCX' ||
    /\.(docx?|rtf)$/i.test(fileName);

  const isPresentation =
    fileType === 'PPTX' ||
    /\.(pptx?|ppsx?)$/i.test(fileName);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`relative bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col transition-all duration-200 overflow-hidden ${
          isFullscreen
            ? 'w-full h-full rounded-none border-0'
            : 'w-full max-w-6xl h-[92vh]'
        }`}
      >
        {/* ============================================================== */}
        {/* TOP BAR: File Header & Interactive Viewer Toolbar              */}
        {/* ============================================================== */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* File Info Left */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${
                isPDF
                  ? 'bg-rose-600'
                  : isImage
                  ? 'bg-amber-600'
                  : isExcel
                  ? 'bg-emerald-600'
                  : isWord
                  ? 'bg-blue-600'
                  : isPresentation
                  ? 'bg-orange-600'
                  : 'bg-indigo-600'
              }`}
            >
              {isPDF && <FileText className="w-5 h-5" />}
              {isImage && <ImageIcon className="w-5 h-5" />}
              {isExcel && <FileSpreadsheet className="w-5 h-5" />}
              {isWord && <FileText className="w-5 h-5" />}
              {isPresentation && <Presentation className="w-5 h-5" />}
              {!isPDF && !isImage && !isExcel && !isWord && !isPresentation && (
                <FileCheck className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {docCode}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                  {category}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {fileType} • {fileSize}
                </span>
                {document?.status && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      document.status === 'Terverifikasi'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : document.status === 'Menunggu Verifikasi'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {document.status}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-white truncate max-w-md sm:max-w-xl">
                {title}
              </h3>
            </div>
          </div>

          {/* Viewer Action Controls Right */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Perkecil (-25%)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 text-xs font-mono font-semibold text-slate-200 hover:text-white cursor-pointer"
                title="Reset Ukuran (100%)"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 250}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Perbesar (+25%)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Rotate for images / scans */}
            {(isImage || isPDF) && (
              <button
                type="button"
                onClick={handleRotate}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors"
                title="Putar 90 Derajat (Rotasi Berkas)"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            )}

            {/* Open in new tab if binary URL available */}
            {resolvedDataUrl && (
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors hidden sm:inline-flex"
                title="Buka Dokumen di Tab Baru Browser"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors hidden sm:inline-flex"
              title="Cetak Berkas / Print"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              title="Unduh Berkas Ini"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-rose-600 border border-slate-700 cursor-pointer transition-colors ml-1"
              title="Tutup Pratinjau (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SUB BAR: Background Contrast / Sheet / Slide Switcher          */}
        {/* ============================================================== */}
        <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 text-xs flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Background Canvas Mode Selector */}
            <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
              Latar Pratinjau:
            </span>
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setBgMode('slate')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  bgMode === 'slate'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Gelap
              </button>
              <button
                type="button"
                onClick={() => setBgMode('white')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  bgMode === 'white'
                    ? 'bg-slate-200 text-slate-900 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Terang
              </button>
              <button
                type="button"
                onClick={() => setBgMode('grid')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  bgMode === 'grid'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kotak/Grid
              </button>
            </div>

            {/* Excel Sheet Tabs */}
            {isExcel && (
              <div className="flex items-center gap-1 ml-2">
                {['Lembar Utama (RME/Prota)', 'Distribusi Jam', 'Data Rekap'].map((sheet) => (
                  <button
                    key={sheet}
                    type="button"
                    onClick={() => setActiveSheetTab(sheet)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                      activeSheetTab === sheet
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {sheet}
                  </button>
                ))}
              </div>
            )}

            {/* Presentation Slide Navigator */}
            {isPresentation && (
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => setActiveSlide((p) => Math.max(p - 1, 1))}
                  disabled={activeSlide <= 1}
                  className="p-1 rounded bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-amber-400">
                  Slide {activeSlide} / 4
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSlide((p) => Math.min(p + 1, 4))}
                  disabled={activeSlide >= 4}
                  className="p-1 rounded bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="hidden sm:inline">
              Penyusun: <strong className="text-slate-200">{authorName}</strong>
            </span>
            <span className="hidden md:inline">
              T.A <strong className="text-emerald-400">{academicYear}</strong> ({semester})
            </span>
            {resolvedDataUrl && (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Berkas Digital Aktif
              </span>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN VIEWER CANVAS                                             */}
        {/* ============================================================== */}
        <div
          className={`flex-1 overflow-auto relative p-4 sm:p-8 flex items-center justify-center select-none ${
            bgMode === 'white'
              ? 'bg-slate-100'
              : bgMode === 'grid'
              ? 'bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] bg-slate-950'
              : 'bg-slate-950'
          }`}
        >
          {isLoadingFile ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-semibold text-slate-300">Memuat berkas arsip...</p>
            </div>
          ) : isPDF && resolvedDataUrl ? (
            /* Real PDF Viewer via object / iframe */
            <div
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full max-w-4xl h-[75vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-700"
            >
              <object
                data={`${resolvedDataUrl}#toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full h-full"
              >
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-700 bg-white">
                  <FileText className="w-16 h-16 text-rose-500 mb-3" />
                  <h4 className="text-base font-bold text-slate-900">
                    Pratinjau PDF Terpasang
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
                    Browser Anda mengarahkan dokumen PDF ini untuk dibuka langsung atau
                    diunduh.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleOpenInNewTab}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow"
                    >
                      Buka PDF di Tab Baru
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                    >
                      Unduh Berkas Asli
                    </button>
                  </div>
                </div>
              </object>
            </div>
          ) : isImage && resolvedDataUrl ? (
            /* Real Image / Scanned Document Viewer */
            <div
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out',
              }}
              className="max-w-full max-h-[75vh] flex items-center justify-center shadow-2xl rounded-xl overflow-hidden bg-white p-2 border border-slate-700"
            >
              <img
                src={resolvedDataUrl}
                alt={title}
                className="max-w-full max-h-[72vh] object-contain rounded"
              />
            </div>
          ) : isExcel ? (
            /* Interactive Spreadsheet Preview View (XLSX / CSV) */
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-300"
            >
              {/* Excel Ribbon Top */}
              <div className="bg-emerald-700 text-white px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
                  <span className="text-xs font-bold tracking-wide">
                    Microsoft Excel / Google Spreadsheet Preview
                  </span>
                  <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded text-emerald-100 font-mono">
                    {fileName}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-100 font-mono">
                  {academicYear} • {semester}
                </span>
              </div>

              {/* Formula Bar Simulation */}
              <div className="bg-slate-100 px-4 py-1.5 border-b border-slate-300 flex items-center gap-3 text-xs">
                <span className="font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-300">
                  fx
                </span>
                <span className="font-mono text-slate-700 text-[11px] truncate">
                  =SUM(B5:B24) // Rincian Alokasi Jam Tatap Muka & Minggu Efektif
                </span>
              </div>

              {/* Spreadsheet Grid Table */}
              <div className="overflow-x-auto max-h-[55vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-600 font-mono text-[11px] border-b border-slate-300">
                      <th className="w-10 p-2 border-r border-slate-300 text-center bg-slate-300/80 font-bold">
                        #
                      </th>
                      <th className="p-2 border-r border-slate-300 font-bold">A (Bulan/Komponen)</th>
                      <th className="p-2 border-r border-slate-300 font-bold">B (Jml Minggu)</th>
                      <th className="p-2 border-r border-slate-300 font-bold">C (Minggu Efektif)</th>
                      <th className="p-2 border-r border-slate-300 font-bold">D (Jam Pelajaran)</th>
                      <th className="p-2 font-bold">E (Keterangan Kurikulum)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans">
                    {[
                      {
                        no: 1,
                        a: 'Juli 2026',
                        b: '4 Minggu',
                        c: '2 Minggu',
                        d: '8 JP',
                        e: 'MPLS & Asesmen Diagnostik Awal',
                      },
                      {
                        no: 2,
                        a: 'Agustus 2026',
                        b: '5 Minggu',
                        c: '4 Minggu',
                        d: '16 JP',
                        e: 'Tujuan Pembelajaran 1 & 2 + PHBN',
                      },
                      {
                        no: 3,
                        a: 'September 2026',
                        b: '4 Minggu',
                        c: '4 Minggu',
                        d: '16 JP',
                        e: 'Tujuan Pembelajaran 3 & Sumatif Tengah Semester',
                      },
                      {
                        no: 4,
                        a: 'Oktober 2026',
                        b: '5 Minggu',
                        c: '4 Minggu',
                        d: '16 JP',
                        e: 'Modul Projek Penguatan Profil Pelajar Pancasila (P5)',
                      },
                      {
                        no: 5,
                        a: 'November 2026',
                        b: '4 Minggu',
                        c: '4 Minggu',
                        d: '16 JP',
                        e: 'Tujuan Pembelajaran 4 & Pengayaan Materi',
                      },
                      {
                        no: 6,
                        a: 'Desember 2026',
                        b: '4 Minggu',
                        c: '2 Minggu',
                        d: '8 JP',
                        e: 'Sumatif Akhir Semester & Pembagian Rapor',
                      },
                    ].map((row) => (
                      <tr key={row.no} className="hover:bg-emerald-50/50">
                        <td className="p-2 bg-slate-100 border-r border-slate-300 text-center font-mono text-slate-500 font-semibold">
                          {row.no}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                          {row.a}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-mono text-slate-700">
                          {row.b}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-mono font-bold text-emerald-700">
                          {row.c}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-mono text-slate-800">
                          {row.d}
                        </td>
                        <td className="p-2 text-slate-600 text-[11px]">{row.e}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                      <td className="p-2 bg-slate-200 border-r border-slate-300 text-center font-mono">
                        Σ
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-900">
                        Total Alokasi Semester Ganjil
                      </td>
                      <td className="p-2 border-r border-slate-300 font-mono">26 Minggu</td>
                      <td className="p-2 border-r border-slate-300 font-mono text-emerald-800">
                        20 Minggu Efektif
                      </td>
                      <td className="p-2 border-r border-slate-300 font-mono text-slate-900">
                        80 JP
                      </td>
                      <td className="p-2 text-emerald-800 text-[11px]">
                        Distribusi Jam Sesuai SK Pembagian Tugas Tubaba
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom Sheet Bar */}
              <div className="bg-slate-100 px-4 py-2 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-700">Sheet Aktif:</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-300 font-semibold text-emerald-700">
                    {activeSheetTab}
                  </span>
                </div>
                <span>Baris 1-7 dari 7 • Siap diunduh format XLSX/CSV</span>
              </div>
            </div>
          ) : isPresentation ? (
            /* Interactive Presentation Slide Deck (PPTX) */
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full max-w-3xl aspect-16/10 bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-orange-500/40 flex flex-col justify-between p-6 sm:p-10 relative"
            >
              {/* Slide Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Slide Header */}
              <div className="flex items-center justify-between relative z-10 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Presentation className="w-5 h-5 text-orange-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    SMPN 14 TULANG BAWANG BARAT • KURIKULUM MERDEKA
                  </span>
                </div>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                  Slide {activeSlide} / 4
                </span>
              </div>

              {/* Slide Body Content */}
              <div className="relative z-10 py-6 my-auto">
                {activeSlide === 1 && (
                  <div className="text-center space-y-3">
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                      {category} • T.A {academicYear}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight max-w-lg mx-auto">
                      {title}
                    </h2>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Mata Pelajaran: {subject} • {grade} • Semester {semester}
                    </p>
                    <div className="pt-4 flex items-center justify-center gap-2">
                      <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">
                        Disusun oleh: <strong>{authorName}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {activeSlide === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-orange-400 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-orange-400" />
                      Capaian & Alur Tujuan Pembelajaran (CP / ATP)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                        <h4 className="font-bold text-emerald-400 mb-1">
                          1. Pemahaman Konseptual
                        </h4>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          Peserta didik mampu mengidentifikasi, menganalisis, serta
                          merefleksikan materi inti {subject} dalam kehidupan sehari-hari
                          di lingkungan Tiyuh Mulya Kencana.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                        <h4 className="font-bold text-blue-400 mb-1">
                          2. Keterampilan Proses & Praktik
                        </h4>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          Melakukan penyelidikan mandiri dan kolaboratif, mempresentasikan
                          hasil telaah produk, dan menyusun laporan berbasis bukti.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSlide === 3 && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-orange-400 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-orange-400" />
                      Langkah Pembelajaran Berdiferensiasi
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex items-start gap-2">
                        <span className="font-bold text-orange-400">A.</span>
                        <span className="text-slate-300 text-[11px]">
                          <strong>Kegiatan Awal (10 Menit):</strong> Apersepsi kontekstual,
                          pertanyaan pemantik, dan penjelasan tujuan pembelajaran.
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex items-start gap-2">
                        <span className="font-bold text-emerald-400">B.</span>
                        <span className="text-slate-300 text-[11px]">
                          <strong>Kegiatan Inti (60 Menit):</strong> Diskusi kelompok
                          berdasarkan kesiapan belajar, eksplorasi lembar kerja siswa
                          (LKPD), dan bimbingan guru.
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex items-start gap-2">
                        <span className="font-bold text-blue-400">C.</span>
                        <span className="text-slate-300 text-[11px]">
                          <strong>Penutup (10 Menit):</strong> Refleksi bersama, asesmen
                          formatif singkat, dan penyampaian rencana pertemuan selanjutnya.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSlide === 4 && (
                  <div className="space-y-4 text-center">
                    <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h3 className="text-base font-bold text-white">
                      Asesmen Ketercapaian & Rubrik Penilaian
                    </h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Menggunakan Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) dengan
                      pendekatan rubrik deskriptif dan skala bertingkat (Interval Nilai).
                    </p>
                    <div className="pt-2 flex justify-center gap-2 text-xs">
                      <span className="px-3 py-1 rounded bg-emerald-900/60 border border-emerald-500/40 text-emerald-200">
                        Asesmen Formatif
                      </span>
                      <span className="px-3 py-1 rounded bg-blue-900/60 border border-blue-500/40 text-blue-200">
                        Asesmen Sumatif
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Slide Footer */}
              <div className="flex items-center justify-between relative z-10 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                <span>Dokumen Resmi: {docCode}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSlide((p) => Math.max(p - 1, 1))}
                    disabled={activeSlide <= 1}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSlide((p) => Math.min(p + 1, 4))}
                    disabled={activeSlide >= 4}
                    className="px-2 py-0.5 rounded bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold cursor-pointer"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Authentic Indonesian Kurikulum Merdeka Document Sheet (PDF/Word/Text Preview) */
            <div
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full max-w-3xl bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 border border-slate-300 my-auto relative overflow-hidden"
            >
              {/* Official Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-4">
                <div className="rotate-[-35deg] text-slate-900 font-extrabold text-5xl tracking-widest text-center uppercase leading-tight">
                  ARSIP RESMI SI-ARKUR<br />SMPN 14 TUBABA
                </div>
              </div>

              {/* Official Indonesian Letterhead (KOP SURAT DINAS) */}
              <div className="text-center relative pb-3 border-b-2 border-slate-900">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                  PEMERINTAH KABUPATEN TULANG BAWANG BARAT
                </p>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </p>
                <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase mt-0.5 tracking-tight">
                  {schoolProfile?.name || 'SMP NEGERI 14 TULANG BAWANG BARAT'}
                </h2>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  NPSN: {schoolProfile?.npsn || '69989014'} • Status Akreditasi: {schoolProfile?.accreditation || 'A (Unggul)'}
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  {schoolProfile?.address ||
                    'Jl. Poros Pendidikan Tiyuh Mulya Kencana, Kec. Tulang Bawang Tengah, Lampung 34693'}
                </p>
                <div className="w-full h-1 bg-slate-950 mt-2 mb-0.5"></div>
                <div className="w-full h-px bg-slate-950"></div>
              </div>

              {/* Document Identity Title */}
              <div className="text-center my-5">
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  KODE REGISTRASI: {docCode}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase mt-2 max-w-xl mx-auto leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 font-semibold">
                  Tahun Ajaran {academicYear} • Semester {semester}
                </p>
              </div>

              {/* Structured Metadata Matrix */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mb-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Mata Pelajaran
                    </span>
                    <strong className="text-slate-900 font-semibold">{subject}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Tingkat / Fase
                    </span>
                    <strong className="text-slate-900 font-semibold">{grade}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Model Kurikulum
                    </span>
                    <strong className="text-emerald-800 font-semibold">
                      {document?.curriculumType || 'Kurikulum Merdeka'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Kategori Arsip
                    </span>
                    <strong className="text-slate-900 font-semibold truncate block">
                      {category}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Structured Curriculum Body Content */}
              <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-[11px] pb-1 border-b border-slate-200 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    I. Capaian & Tujuan Pembelajaran (Fase D)
                  </h4>
                  <p className="text-[11px] text-slate-700 text-justify">
                    Pada akhir Fase D, peserta didik memahami konsep dasar mata pelajaran{' '}
                    <strong>{subject}</strong>, terampil menerapkan prosedur ilmiah,
                    memiliki nalar kritis, dan berkolaborasi secara gotong royong sesuai
                    Profil Pelajar Pancasila.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-[11px] pb-1 border-b border-slate-200 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    II. Alokasi Waktu & Distribusi Pertemuan
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border border-slate-200 rounded">
                      <thead className="bg-slate-100 font-bold text-slate-700">
                        <tr>
                          <th className="p-2 border-b border-slate-200">Komponen</th>
                          <th className="p-2 border-b border-slate-200 text-center">
                            Alokasi Efektif
                          </th>
                          <th className="p-2 border-b border-slate-200">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2">Kegiatan Intruktur / Tatap Muka</td>
                          <td className="p-2 text-center font-mono font-bold text-emerald-700">
                            64 JP
                          </td>
                          <td className="p-2 text-slate-600">
                            Reguler Intrakurikuler ({subject})
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2">Projek Penguatan P5</td>
                          <td className="p-2 text-center font-mono font-bold text-blue-700">
                            16 JP
                          </td>
                          <td className="p-2 text-slate-600">
                            Tema Kearifan Lokal Tubaba
                          </td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                          <td className="p-2">Total Jam Pelajaran Semester {semester}</td>
                          <td className="p-2 text-center font-mono text-slate-900">
                            80 JP
                          </td>
                          <td className="p-2 text-emerald-800">
                            Tahun Ajaran {academicYear}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-[11px] pb-1 border-b border-slate-200 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    III. Asesmen Ketercapaian & Kriteria Penilaian
                  </h4>
                  <p className="text-[11px] text-slate-700">
                    Asesmen mencakup asesmen formatif (observasi harian, unjuk kerja, portofolio
                    tugas) dan asesmen sumatif lingkup materi sesuai panduan Badan Standar,
                    Kurikulum, dan Asesmen Pendidikan (BSKAP).
                  </p>
                </div>
              </div>

              {/* Official Sign-off & Verification Block */}
              <div className="mt-8 pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-700">
                <div className="text-center sm:text-left">
                  <p className="text-[11px] text-slate-500">Mengetahui,</p>
                  <p className="font-bold text-slate-900">
                    Kepala {schoolProfile?.name || 'SMPN 14 Tulang Bawang Barat'}
                  </p>
                  <div className="h-14 flex items-center justify-center sm:justify-start">
                    <div className="w-20 h-10 border-2 border-dashed border-emerald-600/40 rounded flex items-center justify-center text-[10px] font-bold text-emerald-800 bg-emerald-50/50 rotate-[-4deg]">
                      STEMPEL SAH
                    </div>
                  </div>
                  <p className="font-extrabold text-slate-900 underline">
                    {schoolProfile?.headmaster || 'Cecep Agung Prehatin., M.Pd'}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500">
                    NIP. {schoolProfile?.headmasterNip || '19750812 200212 1 003'}
                  </p>
                </div>

                <div className="text-center sm:text-right">
                  <p className="text-[11px] text-slate-500">
                    Tulang Bawang Barat, {document?.uploadDate || new Date().toISOString().slice(0, 10)}
                  </p>
                  <p className="font-bold text-slate-900">Guru / Tim Penyusun,</p>
                  <div className="h-14 flex items-center justify-center sm:justify-end">
                    <div className="w-16 h-8 text-slate-400 italic text-[11px] flex items-center justify-center">
                      (Tanda Tangan)
                    </div>
                  </div>
                  <p className="font-extrabold text-slate-900 underline">{authorName}</p>
                  <p className="text-[11px] font-mono text-slate-500">
                    NIP. {document?.authorNip || 'Guru Mata Pelajaran'}
                  </p>
                </div>
              </div>

              {/* Digital Registry Footer Bar */}
              <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
                Registrasi Digital SI-ARKUR SMPN 14 Tubaba • Dokumen Sah Terdaftar di Cloud Repositori
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* MODAL FOOTER: Quick Action Navigation                          */}
        {/* ============================================================== */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyManifest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Salin Data Manifest Dokumen"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Identitas</span>
                </>
              )}
            </button>

            {document && onOpenDetail && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDetail(document);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Buka Lembar Telaah & Verifikasi</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Tutup Pratinjau
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas ({fileType})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
