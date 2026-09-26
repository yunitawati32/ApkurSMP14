import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  RotateCcw,
  LayoutGrid,
  List,
  UploadCloud,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { CurriculumDoc, CategoryDef, SchoolProfile } from '../types/curriculum';
import { SUBJECT_LIST, INITIAL_TEACHERS } from '../data/initialData';
import { isLegacyTeacherName } from '../utils/storage';

interface DocumentListViewProps {
  documents: CurriculumDoc[];
  categories: CategoryDef[];
  schoolProfile?: SchoolProfile;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedAcademicYear: string;
  onOpenDocDetail: (doc: CurriculumDoc) => void;
  onPreviewDoc?: (doc: CurriculumDoc) => void;
  onDownloadDoc: (doc: CurriculumDoc) => void;
  onDeleteDoc: (id: string) => void;
  onOpenUpload: () => void;
  onExportCsv: (filteredDocs: CurriculumDoc[]) => void;
}

export const DocumentListView: React.FC<DocumentListViewProps> = ({
  documents,
  categories,
  schoolProfile,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  selectedAcademicYear,
  onOpenDocDetail,
  onPreviewDoc,
  onDownloadDoc,
  onDeleteDoc,
  onOpenUpload,
  onExportCsv,
}) => {
  // Local filter states
  const [selectedGrade, setSelectedGrade] = useState<string>('Semua');
  const [selectedSubject, setSelectedSubject] = useState<string>('Semua');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('Semua');
  const [selectedSemester, setSelectedSemester] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [selectedFileType, setSelectedFileType] = useState<string>('Semua');
  const [filterYear, setFilterYear] = useState<string>('Semua');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title' | 'code'>('date-desc');

  // Merged teacher options
  const teacherNamesList = useMemo(() => {
    const master = (
      schoolProfile?.teachers && schoolProfile.teachers.length > 0
        ? schoolProfile.teachers
        : INITIAL_TEACHERS
    ).filter((t) => t && t.name && !isLegacyTeacherName(t.name));
    return Array.from(
      new Set([
        ...master.map((t) => t.name),
        ...documents.map((d) => d.authorName).filter((n) => n && !isLegacyTeacherName(n)),
      ])
    ).filter(Boolean);
  }, [schoolProfile?.teachers, documents]);

  // Filter logic
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesCode = doc.code.toLowerCase().includes(query);
        const matchesAuthor = doc.authorName.toLowerCase().includes(query);
        const matchesSubject = doc.subject.toLowerCase().includes(query);
        const matchesTags = doc.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCode && !matchesAuthor && !matchesSubject && !matchesTags) {
          return false;
        }
      }

      // Category check
      if (selectedCategory && selectedCategory !== 'Semua') {
        if (doc.category !== selectedCategory) return false;
      }

      // Grade check
      if (selectedGrade !== 'Semua') {
        if (selectedGrade === 'Fase D') {
          if (doc.grade !== 'Fase D' && doc.grade !== 'Semua Tingkat') return false;
        } else if (['Kelas 7', 'Kelas 8', 'Kelas 9'].includes(selectedGrade)) {
          if (doc.grade !== selectedGrade && !doc.grade.startsWith(`${selectedGrade}.`)) return false;
        } else if (doc.grade !== selectedGrade) {
          return false;
        }
      }

      // Subject check
      if (selectedSubject !== 'Semua' && selectedSubject !== 'Semua Mata Pelajaran') {
        if (doc.subject !== selectedSubject) return false;
      }

      // Teacher check
      if (selectedTeacher !== 'Semua') {
        if (doc.authorName !== selectedTeacher) return false;
      }

      // Semester check
      if (selectedSemester !== 'Semua') {
        if (doc.semester !== selectedSemester) return false;
      }

      // Status check
      if (selectedStatus !== 'Semua') {
        if (doc.status !== selectedStatus) return false;
      }

      // File Type check
      if (selectedFileType !== 'Semua') {
        if (doc.fileType !== selectedFileType) return false;
      }

      // Academic Year check
      if (filterYear !== 'Semua') {
        if (doc.academicYear !== filterYear) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'code') {
        return a.code.localeCompare(b.code);
      }
      return 0;
    });
  }, [
    documents,
    searchQuery,
    selectedCategory,
    selectedGrade,
    selectedSubject,
    selectedTeacher,
    selectedSemester,
    selectedStatus,
    selectedFileType,
    filterYear,
    sortBy,
  ]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCategory) ||
    selectedGrade !== 'Semua' ||
    selectedSubject !== 'Semua' ||
    selectedTeacher !== 'Semua' ||
    selectedSemester !== 'Semua' ||
    selectedStatus !== 'Semua' ||
    selectedFileType !== 'Semua' ||
    filterYear !== 'Semua';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedGrade('Semua');
    setSelectedSubject('Semua');
    setSelectedTeacher('Semua');
    setSelectedSemester('Semua');
    setSelectedStatus('Semua');
    setSelectedFileType('Semua');
    setFilterYear('Semua');
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'PDF':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'DOCX':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'XLSX':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      default:
        return <FileCode className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Bank Arsip Dokumen Kurikulum</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
              {filteredDocs.length} Berkas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Repositori resmi perangkat pembelajaran, KOSP, ATP, modul, dan instrumen asesmen SMPN 14 Tulang Bawang Barat
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onExportCsv(filteredDocs)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            title="Ekspor daftar berkas terfilter ke CSV/Excel"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor Rekap (CSV)
          </button>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            Unggah Berkas Baru
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Row 1: Search & Fast Category Scroll */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search bar inside list */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan judul dokumen, nama guru, kode arsip, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode & Sort Toggle */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span>Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Urutkan Dokumen"
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="date-desc">Terbaru Diunggah</option>
                <option value="date-asc">Terlama</option>
                <option value="title">Judul (A-Z)</option>
                <option value="code">Kode Arsip</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Kartu Kotak"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters (Faceted Classification) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100">
          {/* Category Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Kategori
            </label>
            <select
              value={selectedCategory || 'Semua'}
              onChange={(e) => setSelectedCategory(e.target.value === 'Semua' ? null : e.target.value)}
              aria-label="Filter Kategori"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.codePrefix} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Tingkat / Kelas
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              aria-label="Filter Tingkat Kelas"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Kelas (12 Rombel)</option>
              <optgroup label="Tingkat Jenjang">
                <option value="Kelas 7">Kelas 7 (7.1 - 7.4)</option>
                <option value="Kelas 8">Kelas 8 (8.1 - 8.4)</option>
                <option value="Kelas 9">Kelas 9 (9.1 - 9.4)</option>
                <option value="Fase D">Fase D</option>
                <option value="Semua Tingkat">Semua Tingkat</option>
              </optgroup>
              <optgroup label="Rombel Kelas 7">
                <option value="Kelas 7.1">Kelas 7.1</option>
                <option value="Kelas 7.2">Kelas 7.2</option>
                <option value="Kelas 7.3">Kelas 7.3</option>
                <option value="Kelas 7.4">Kelas 7.4</option>
              </optgroup>
              <optgroup label="Rombel Kelas 8">
                <option value="Kelas 8.1">Kelas 8.1</option>
                <option value="Kelas 8.2">Kelas 8.2</option>
                <option value="Kelas 8.3">Kelas 8.3</option>
                <option value="Kelas 8.4">Kelas 8.4</option>
              </optgroup>
              <optgroup label="Rombel Kelas 9">
                <option value="Kelas 9.1">Kelas 9.1</option>
                <option value="Kelas 9.2">Kelas 9.2</option>
                <option value="Kelas 9.3">Kelas 9.3</option>
                <option value="Kelas 9.4">Kelas 9.4</option>
              </optgroup>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Mata Pelajaran
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              aria-label="Filter Mata Pelajaran"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              {SUBJECT_LIST.map((subj) => (
                <option key={subj} value={subj === 'Semua Mata Pelajaran' ? 'Semua' : subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Nama Guru
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              aria-label="Filter Nama Guru"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              <option value="Semua">Semua Guru ({teacherNamesList.length})</option>
              {teacherNamesList.map((tName) => (
                <option key={tName} value={tName}>
                  {tName}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              aria-label="Filter Semester"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Semester</option>
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
              <option value="Tahunan / Penuh">Tahunan / Penuh</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Status Telaah
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter Status Telaah"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Menunggu Verifikasi">Menunggu Review</option>
              <option value="Perlu Revisi">Perlu Revisi</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* File Format Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Format Berkas
            </label>
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              aria-label="Filter Format Berkas"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Format</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">Word (DOCX)</option>
              <option value="XLSX">Excel (XLSX)</option>
              <option value="PPTX">PowerPoint</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-600 font-medium">Filter Aktif:</span>
              {selectedCategory && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                  Kategori: {selectedCategory}
                </span>
              )}
              {selectedGrade !== 'Semua' && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                  Tingkat: {selectedGrade}
                </span>
              )}
              {selectedSubject !== 'Semua' && (
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px]">
                  Mapel: {selectedSubject}
                </span>
              )}
              {selectedStatus !== 'Semua' && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px]">
                  Status: {selectedStatus}
                </span>
              )}
              {selectedFileType !== 'Semua' && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 text-[11px]">
                  Tipe: {selectedFileType}
                </span>
              )}
            </div>

            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area: Table View or Grid View */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak ada dokumen yang sesuai filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Coba ubah kata kunci pencarian atau sesuaikan kombinasi filter kategori, tingkat, dan mata pelajaran Anda.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Reset Semua Filter
            </button>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Unggah Dokumen Baru
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Kode & Dokumen</th>
                  <th className="py-3.5 px-4">Kategori Klasifikasi</th>
                  <th className="py-3.5 px-4">Mata Pelajaran</th>
                  <th className="py-3.5 px-4">Kelas & Semester</th>
                  <th className="py-3.5 px-4">Guru / Penyusun</th>
                  <th className="py-3.5 px-4">Status Telaah</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Title & Code */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 border border-slate-200 group-hover:bg-white transition-colors">
                          {getFileIcon(doc.fileType)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] text-slate-600 font-semibold block mb-0.5">
                            {doc.code}
                          </span>
                          <button
                            onClick={() => onOpenDocDetail(doc)}
                            className="font-semibold text-slate-900 hover:text-emerald-600 text-left line-clamp-2 transition-colors cursor-pointer"
                          >
                            {doc.title}
                          </button>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                            <span>{doc.fileType}</span>
                            <span>•</span>
                            <span>{doc.fileSize}</span>
                            <span>•</span>
                            <span>{doc.uploadDate}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block truncate">{doc.category}</span>
                      <span className="text-[11px] text-emerald-600">{doc.curriculumType}</span>
                    </td>

                    {/* Subject */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-900 block truncate">{doc.subject}</span>
                      {doc.tags && doc.tags.length > 0 && (
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          #{doc.tags[0]}
                        </span>
                      )}
                    </td>

                    {/* Grade & Semester */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{doc.grade}</span>
                      <span className="text-[11px] text-slate-600">
                        {doc.academicYear} ({doc.semester})
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block truncate">{doc.authorName}</span>
                      <span className="text-[10px] text-slate-600 font-mono">
                        {doc.authorNip ? `NIP. ${doc.authorNip}` : 'Non-NIP'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          doc.status === 'Terverifikasi'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : doc.status === 'Menunggu Verifikasi'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : doc.status === 'Perlu Revisi'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => (onPreviewDoc ? onPreviewDoc(doc) : onOpenDocDetail(doc))}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Pratinjau Berkas Dokumen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenDocDetail(doc)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail & Telaah Berkas"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDownloadDoc(doc)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Unduh Berkas Arsip"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Yakin ingin menghapus dokumen "${doc.title}" dari arsip?`)) {
                              onDeleteDoc(doc.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Dokumen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200">
                      {getFileIcon(doc.fileType)}
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-slate-600">
                      {doc.code}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      doc.status === 'Terverifikasi'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : doc.status === 'Menunggu Verifikasi'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                {/* Title */}
                <button
                  onClick={() => onOpenDocDetail(doc)}
                  className="text-sm font-bold text-slate-900 hover:text-emerald-600 text-left line-clamp-2 transition-colors cursor-pointer mb-2"
                >
                  {doc.title}
                </button>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {doc.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {doc.category}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {doc.grade}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {doc.subject}
                  </span>
                </div>
              </div>

              {/* Footer Details & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                    {doc.authorName}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {doc.academicYear} • {doc.fileSize}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => (onPreviewDoc ? onPreviewDoc(doc) : onOpenDocDetail(doc))}
                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                    title="Pratinjau Berkas"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenDocDetail(doc)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                    title="Lihat Detail & Telaah"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDownloadDoc(doc)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                    title="Unduh Berkas"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus dokumen "${doc.title}"?`)) {
                        onDeleteDoc(doc.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
