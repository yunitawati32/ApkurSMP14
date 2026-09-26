import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Layers,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  X,
} from 'lucide-react';
import { CurriculumDoc } from '../types/curriculum';

interface UploadTrendChartProps {
  documents: CurriculumDoc[];
  selectedAcademicYear: string;
  onOpenDocDetail: (doc: CurriculumDoc) => void;
  onDownloadDoc: (doc: CurriculumDoc) => void;
}

type ChartMode = 'area' | 'status' | 'domain';
type SemesterFilter = 'all' | 'ganjil' | 'genap';

interface MonthlyDataPoint {
  monthKey: number; // 1..12
  shortLabel: string; // e.g., 'Jul 26'
  fullLabel: string; // e.g., 'Juli 2026'
  semester: 'Ganjil' | 'Genap';
  total: number;
  cumulative: number;
  terverifikasi: number;
  menunggu: number;
  revisiDraft: number;
  guru: number;
  waliKelas: number;
  eskul: number;
  kegiatan: number;
  docs: CurriculumDoc[];
}

const ACADEMIC_MONTH_ORDER = [
  { month: 7, short: 'Jul', full: 'Juli', semester: 'Ganjil' as const },
  { month: 8, short: 'Agu', full: 'Agustus', semester: 'Ganjil' as const },
  { month: 9, short: 'Sep', full: 'September', semester: 'Ganjil' as const },
  { month: 10, short: 'Okt', full: 'Oktober', semester: 'Ganjil' as const },
  { month: 11, short: 'Nov', full: 'November', semester: 'Ganjil' as const },
  { month: 12, short: 'Des', full: 'Desember', semester: 'Ganjil' as const },
  { month: 1, short: 'Jan', full: 'Januari', semester: 'Genap' as const },
  { month: 2, short: 'Feb', full: 'Februari', semester: 'Genap' as const },
  { month: 3, short: 'Mar', full: 'Maret', semester: 'Genap' as const },
  { month: 4, short: 'Apr', full: 'April', semester: 'Genap' as const },
  { month: 5, short: 'Mei', full: 'Mei', semester: 'Genap' as const },
  { month: 6, short: 'Jun', full: 'Juni', semester: 'Genap' as const },
];

export const UploadTrendChart: React.FC<UploadTrendChartProps> = ({
  documents,
  selectedAcademicYear,
  onOpenDocDetail,
  onDownloadDoc,
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('area');
  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>('all');
  const [selectedMonthKey, setSelectedMonthKey] = useState<number | null>(null);

  // Parse startYear & endYear from selectedAcademicYear (e.g. "2026/2027")
  const [startYearStr, endYearStr] = useMemo(() => {
    const parts = selectedAcademicYear.split('/');
    const start = parts[0] || '2026';
    const end = parts[1] || String(Number(start) + 1);
    return [start, end];
  }, [selectedAcademicYear]);

  // Filter documents matching the selected academic year
  const yearDocs = useMemo(() => {
    return documents.filter((doc) => doc.academicYear === selectedAcademicYear);
  }, [documents, selectedAcademicYear]);

  // Build 12-month academic year dataset
  const monthlyData = useMemo<MonthlyDataPoint[]>(() => {
    let runningTotal = 0;

    return ACADEMIC_MONTH_ORDER.map((m) => {
      const yearLabel = m.semester === 'Ganjil' ? startYearStr : endYearStr;
      const shortYear = yearLabel.slice(-2);

      const monthDocs = yearDocs.filter((doc) => {
        if (!doc.uploadDate) return false;
        const parts = doc.uploadDate.split('-');
        if (parts.length < 2) return false;
        const docMonth = parseInt(parts[1], 10);
        return docMonth === m.month;
      });

      const total = monthDocs.length;
      runningTotal += total;

      const terverifikasi = monthDocs.filter((d) => d.status === 'Terverifikasi').length;
      const menunggu = monthDocs.filter((d) => d.status === 'Menunggu Verifikasi').length;
      const revisiDraft = monthDocs.filter(
        (d) => d.status === 'Perlu Revisi' || d.status === 'Draft'
      ).length;

      const waliKelas = monthDocs.filter(
        (d) =>
          d.domain === 'wali-kelas' ||
          d.category === 'Dokumen Administrasi Wali Kelas' ||
          d.targetRole?.toLowerCase().includes('wali')
      ).length;

      const eskul = monthDocs.filter(
        (d) =>
          d.domain === 'pembina-eskul' ||
          d.category === 'Dokumen Pembina Ekstrakurikuler' ||
          d.targetRole?.toLowerCase().includes('pembina')
      ).length;

      const kegiatan = monthDocs.filter(
        (d) =>
          d.domain === 'kegiatan-lainnya' ||
          d.category === 'Dokumen Kegiatan Sekolah & Notula'
      ).length;

      const guru = Math.max(0, total - waliKelas - eskul - kegiatan);

      return {
        monthKey: m.month,
        shortLabel: `${m.short} '${shortYear}`,
        fullLabel: `${m.full} ${yearLabel}`,
        semester: m.semester,
        total,
        cumulative: runningTotal,
        terverifikasi,
        menunggu,
        revisiDraft,
        guru,
        waliKelas,
        eskul,
        kegiatan,
        docs: monthDocs,
      };
    });
  }, [yearDocs, startYearStr, endYearStr]);

  // Filter dataset by semester selection
  const displayedData = useMemo(() => {
    if (semesterFilter === 'ganjil') {
      return monthlyData.filter((d) => d.semester === 'Ganjil');
    }
    if (semesterFilter === 'genap') {
      return monthlyData.filter((d) => d.semester === 'Genap');
    }
    return monthlyData;
  }, [monthlyData, semesterFilter]);

  // Summary metrics
  const stats = useMemo(() => {
    const totalUploads = displayedData.reduce((acc, item) => acc + item.total, 0);
    const totalVerified = displayedData.reduce((acc, item) => acc + item.terverifikasi, 0);
    const activeMonths = displayedData.filter((d) => d.total > 0).length;
    const avgPerActiveMonth =
      activeMonths > 0 ? (totalUploads / activeMonths).toFixed(1) : '0';

    let peakMonth: MonthlyDataPoint | null = null;
    for (const item of displayedData) {
      if (!peakMonth || item.total > peakMonth.total) {
        peakMonth = item;
      }
    }

    const verificationRate =
      totalUploads > 0 ? Math.round((totalVerified / totalUploads) * 100) : 0;

    return {
      totalUploads,
      totalVerified,
      avgPerActiveMonth,
      peakMonth: peakMonth && peakMonth.total > 0 ? peakMonth : null,
      verificationRate,
    };
  }, [displayedData]);

  const selectedMonthPoint = useMemo(() => {
    if (selectedMonthKey === null) return null;
    return monthlyData.find((m) => m.monthKey === selectedMonthKey) || null;
  }, [monthlyData, selectedMonthKey]);

  // Custom Recharts Tooltip
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data: MonthlyDataPoint = payload[0].payload;

    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[210px]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/80">
          <span className="font-bold text-white">{data.fullLabel}</span>
          <span className="text-[11px] text-emerald-400 font-mono">
            Sem. {data.semester}
          </span>
        </div>

        <div className="space-y-1.5 font-mono tabular-nums">
          <div className="flex items-center justify-between text-slate-200">
            <span className="font-sans text-slate-300">Unggahan Bulan Ini:</span>
            <span className="font-bold text-white">{data.total} berkas</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-sans text-slate-400">Akumulasi T.A:</span>
            <span className="font-semibold text-emerald-300">{data.cumulative} berkas</span>
          </div>

          {chartMode === 'status' || chartMode === 'area' ? (
            <div className="pt-1.5 mt-1.5 border-t border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-sans text-emerald-400">Terverifikasi:</span>
                <span>{data.terverifikasi}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-sans text-amber-400">Menunggu Telaah:</span>
                <span>{data.menunggu}</span>
              </div>
              {data.revisiDraft > 0 && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-sans text-rose-400">Revisi / Draft:</span>
                  <span>{data.revisiDraft}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-1.5 mt-1.5 border-t border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-sans text-blue-400">Perangkat Guru:</span>
                <span>{data.guru}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-sans text-emerald-400">Wali Kelas:</span>
                <span>{data.waliKelas}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-sans text-amber-400">Pembina Eskul:</span>
                <span>{data.eskul}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-sans text-purple-400">Kegiatan Sekolah:</span>
                <span>{data.kegiatan}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 text-center">
          Klik grafik untuk rincian berkas bulan ini
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Analitik Kurikulum</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-emerald-700">
              Tahun Ajaran {selectedAcademicYear}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Tren Unggahan Dokumen Per Bulan
          </h2>
          <p className="text-xs text-slate-500">
            Distribusi pengarsipan perangkat ajar dan administrasi sekolah sepanjang siklus kalender akademik ({startYearStr}–{endYearStr})
          </p>
        </div>

        {/* Interactive Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Semester Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => setSemesterFilter('all')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                semesterFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1 Tahun Penuh
            </button>
            <button
              type="button"
              onClick={() => setSemesterFilter('ganjil')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                semesterFilter === 'ganjil'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sem. Ganjil
            </button>
            <button
              type="button"
              onClick={() => setSemesterFilter('genap')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                semesterFilter === 'genap'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sem. Genap
            </button>
          </div>

          {/* Chart Type Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => setChartMode('area')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                chartMode === 'area'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grafik Area Tren Bulanan & Akumulasi"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tren & Akumulasi</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('status')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                chartMode === 'status'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grafik Batang berdasarkan Status Verifikasi"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Status Verifikasi</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('domain')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                chartMode === 'domain'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grafik Batang berdasarkan Kategori Tugas/Peran"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Peran Pendidik</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/60 border-b border-slate-100">
        <div className="p-4">
          <div className="text-xs text-slate-500">Total Unggahan ({selectedAcademicYear})</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {stats.totalUploads}
            </span>
            <span className="text-xs text-slate-500">dokumen</span>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-slate-500">Bulan Puncak Aktivitas</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900">
              {stats.peakMonth ? stats.peakMonth.fullLabel : 'Belum ada data'}
            </span>
            {stats.peakMonth && (
              <span className="text-xs font-mono tabular-nums text-emerald-700 font-semibold">
                ({stats.peakMonth.total} berkas)
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-slate-500">Rata-rata per Bulan Aktif</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {stats.avgPerActiveMonth}
            </span>
            <span className="text-xs text-slate-500">berkas / bulan</span>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-slate-500">Tingkat Verifikasi Arsip</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-700">
              {stats.verificationRate}%
            </span>
            <span className="text-xs text-slate-500">
              ({stats.totalVerified} dari {stats.totalUploads} sah)
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="p-5">
        {stats.totalUploads === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Calendar className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              Belum ada dokumen yang diunggah pada Tahun Ajaran {selectedAcademicYear}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Silakan pilih tahun ajaran lain pada pemilih di bagian atas atau unggah berkas baru untuk melihat visualisasi tren bulanan.
            </p>
          </div>
        ) : (
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'area' ? (
                <AreaChart
                  data={displayedData}
                  margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      const clicked: MonthlyDataPoint = state.activePayload[0].payload;
                      setSelectedMonthKey((prev) =>
                        prev === clicked.monthKey ? null : clicked.monthKey
                      );
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Unggahan Bulanan"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorMonthly)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#047857' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Akumulasi Tahunan"
                    stroke="#0284c7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorCumulative)"
                  />
                </AreaChart>
              ) : chartMode === 'status' ? (
                <BarChart
                  data={displayedData}
                  margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      const clicked: MonthlyDataPoint = state.activePayload[0].payload;
                      setSelectedMonthKey((prev) =>
                        prev === clicked.monthKey ? null : clicked.monthKey
                      );
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="terverifikasi"
                    name="Terverifikasi"
                    stackId="status"
                    fill="#059669"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="menunggu"
                    name="Menunggu Verifikasi"
                    stackId="status"
                    fill="#d97706"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="revisiDraft"
                    name="Perlu Revisi / Draft"
                    stackId="status"
                    fill="#e11d48"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <BarChart
                  data={displayedData}
                  margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      const clicked: MonthlyDataPoint = state.activePayload[0].payload;
                      setSelectedMonthKey((prev) =>
                        prev === clicked.monthKey ? null : clicked.monthKey
                      );
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="guru"
                    name="Perangkat Guru"
                    stackId="domain"
                    fill="#2563eb"
                  />
                  <Bar
                    dataKey="waliKelas"
                    name="Wali Kelas"
                    stackId="domain"
                    fill="#059669"
                  />
                  <Bar
                    dataKey="eskul"
                    name="Pembina Eskul"
                    stackId="domain"
                    fill="#d97706"
                  />
                  <Bar
                    dataKey="kegiatan"
                    name="Kegiatan Sekolah"
                    stackId="domain"
                    fill="#9333ea"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Interactive Month Selector Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">
              Pilih bulan untuk menyaring berkas yang diunggah:
            </span>
            {selectedMonthKey !== null && (
              <button
                type="button"
                onClick={() => setSelectedMonthKey(null)}
                className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Tutup Rincian Bulan
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {displayedData.map((m) => {
              const isSelected = selectedMonthKey === m.monthKey;
              const hasDocs = m.total > 0;
              return (
                <button
                  key={m.monthKey}
                  type="button"
                  onClick={() =>
                    setSelectedMonthKey((prev) => (prev === m.monthKey ? null : m.monthKey))
                  }
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : hasDocs
                      ? 'bg-slate-50 hover:bg-emerald-50/70 text-slate-800 border-slate-200 hover:border-emerald-300'
                      : 'bg-slate-50/40 text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-semibold truncate">{m.shortLabel}</div>
                  <div
                    className={`text-xs font-mono tabular-nums font-bold mt-0.5 ${
                      isSelected
                        ? 'text-emerald-100'
                        : hasDocs
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {m.total} berkas
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drill-down List when a Month is selected */}
        {selectedMonthPoint && (
          <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Daftar Unggahan Bulan {selectedMonthPoint.fullLabel} ({selectedMonthPoint.docs.length} Dokumen)
                </h4>
                <p className="text-xs text-slate-500">
                  Semester {selectedMonthPoint.semester} · Tahun Ajaran {selectedAcademicYear}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMonthKey(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="Tutup rincian bulan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedMonthPoint.docs.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500 text-center">
                Tidak ada dokumen yang tercatat pada bulan {selectedMonthPoint.fullLabel}.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedMonthPoint.docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-white hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onOpenDocDetail(doc)}
                        className="font-bold text-slate-900 hover:text-emerald-700 text-left truncate block cursor-pointer"
                      >
                        {doc.title}
                      </button>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{doc.code}</span>
                        <span>·</span>
                        <span>{doc.category}</span>
                        <span>·</span>
                        <span>{doc.authorName}</span>
                        <span>·</span>
                        <span className="font-mono">{doc.uploadDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] font-semibold ${
                          doc.status === 'Terverifikasi'
                            ? 'text-emerald-700'
                            : doc.status === 'Menunggu Verifikasi'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {doc.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenDocDetail(doc)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                        title="Pratinjau & Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadDoc(doc)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Unduh"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
