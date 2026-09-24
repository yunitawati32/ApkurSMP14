import React, { useState } from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { CurriculumDoc, CategoryDef, SchoolProfile } from '../types/curriculum';
import { ACADEMIC_YEARS } from '../data/initialData';

interface ReportExportViewProps {
  documents: CurriculumDoc[];
  categories: CategoryDef[];
  schoolProfile: SchoolProfile;
  selectedAcademicYear: string;
  onExportCsv: (docs: CurriculumDoc[]) => void;
}

export const ReportExportView: React.FC<ReportExportViewProps> = ({
  documents,
  categories,
  schoolProfile,
  selectedAcademicYear,
  onExportCsv,
}) => {
  const [filterYear, setFilterYear] = useState<string>(selectedAcademicYear);
  const [filterSemester, setFilterSemester] = useState<string>('Semua');

  const reportDocs = documents.filter((doc) => {
    if (filterYear !== 'Semua' && doc.academicYear !== filterYear) return false;
    if (filterSemester !== 'Semua' && doc.semester !== filterSemester) return false;
    return true;
  });

  const verifiedCount = reportDocs.filter((d) => d.status === 'Terverifikasi').length;
  const pendingCount = reportDocs.filter((d) => d.status === 'Menunggu Verifikasi').length;

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Buku Induk & Rekapitulasi Arsip Kurikulum
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Laporan resmi kelengkapan administrasi pembelajaran untuk pengawas pembina dan instrumen akreditasi
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              aria-label="Filter Tahun Pelajaran"
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="Semua">Semua Tahun Pelajaran</option>
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>
                  T.A. {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              aria-label="Filter Semester Laporan"
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="Semua">Semua Semester</option>
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>

          <button
            onClick={() => onExportCsv(reportDocs)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-300"
          >
            <Download className="w-4 h-4" />
            Ekspor Excel / CSV
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen Laporan
          </button>
        </div>
      </div>

      {/* Printable Sheet Wrapper */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Kop Surat Resmi */}
        <div className="text-center border-b-2 border-slate-900 pb-3 mb-6 relative">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-0.5">
            PEMERINTAH KABUPATEN TULANG BAWANG BARAT
          </p>
          <p className="text-sm font-extrabold uppercase tracking-wide text-slate-800 mb-0.5">
            DINAS PENDIDIKAN DAN KEBUDAYAAN
          </p>
          <h1 className="text-xl font-black uppercase text-slate-950 tracking-wider">
            {schoolProfile.name}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            NPSN: {schoolProfile.npsn} • {schoolProfile.accreditation}
          </p>
          <p className="text-[11px] text-slate-500">
            {schoolProfile.address} • Telp: {schoolProfile.phone} • Surel: {schoolProfile.email}
          </p>
          <div className="w-full h-1 bg-slate-950 mt-3 mb-0.5"></div>
          <div className="w-full h-px bg-slate-950"></div>
        </div>

        {/* Report Title */}
        <div className="text-center mb-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
            BUKU INDUK REGISTRASI ARSIP KURIKULUM & PERANGKAT AJAR
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Tahun Ajaran: {filterYear} • Semester: {filterSemester}
          </p>
        </div>

        {/* Summary Metric Strip */}
        <div className="grid grid-cols-4 gap-2 mb-6 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase text-slate-600 font-semibold block">
              Total Berkas
            </span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {reportDocs.length}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] uppercase text-emerald-800 font-semibold block">
              Terverifikasi
            </span>
            <span className="text-base font-bold text-emerald-700 font-mono">
              {verifiedCount}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <span className="text-[10px] uppercase text-amber-800 font-semibold block">
              Menunggu Review
            </span>
            <span className="text-base font-bold text-amber-700 font-mono">
              {pendingCount}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-[10px] uppercase text-blue-800 font-semibold block">
              Tingkat Kelengkapan
            </span>
            <span className="text-base font-bold text-blue-700 font-mono">
              {reportDocs.length > 0 ? `${Math.round((verifiedCount / reportDocs.length) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Table of Archives */}
        <div className="border border-slate-300 rounded-lg overflow-hidden mb-8">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-300 w-10 text-center">No</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Kode & Nama Berkas</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Kategori</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Mata Pelajaran & Jenjang</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Guru Penyusun</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center">Tanggal</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportDocs.map((doc, idx) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 border-r border-slate-200 text-center font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 max-w-xs">
                    <span className="font-mono text-[10px] text-slate-500 block">{doc.code}</span>
                    <span className="font-semibold text-slate-900 block leading-snug">
                      {doc.title}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-slate-800">
                    {doc.category}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-slate-800">
                    <span>{doc.subject}</span>
                    <span className="text-[10px] text-slate-500 block">{doc.grade}</span>
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200">
                    <span className="font-medium text-slate-900 block">{doc.authorName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {doc.authorNip || '-'}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-center font-mono text-[11px] text-slate-600">
                    {doc.uploadDate}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                        doc.status === 'Terverifikasi'
                          ? 'text-emerald-800 bg-emerald-100'
                          : 'text-amber-800 bg-amber-100'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature Block */}
        <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-slate-300 break-inside-avoid">
          {/* Left: Waka Kurikulum */}
          <div className="text-center">
            <p className="text-slate-600">Mengetahui & Menelaah,</p>
            <p className="font-bold text-slate-900 mt-0.5">Wakil Kepala Sekolah Bidang Kurikulum</p>
            <div className="h-20"></div>
            <p className="font-bold underline text-slate-950 uppercase">{schoolProfile.curriculumVice}</p>
            <p className="text-slate-600 font-mono">NIP. {schoolProfile.curriculumViceNip}</p>
          </div>

          {/* Right: Kepala Sekolah */}
          <div className="text-center">
            <p className="text-slate-600">Tulang Bawang Barat, {currentDateStr}</p>
            <p className="font-bold text-slate-900 mt-0.5">Kepala {schoolProfile.name}</p>
            <div className="h-20"></div>
            <p className="font-bold underline text-slate-950 uppercase">{schoolProfile.headmaster}</p>
            <p className="text-slate-600 font-mono">NIP. {schoolProfile.headmasterNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
