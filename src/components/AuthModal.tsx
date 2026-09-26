import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  User,
  Sparkles,
} from 'lucide-react';
import { AppUser } from '../types/curriculum';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginGoogle: () => Promise<void>;
  onSelectTeacherProfile: (profile: AppUser) => void;
  authError: { title: string; detail: string; actionHint: string } | null;
  clearAuthError: () => void;
}

interface DefaultTeacher {
  name: string;
  role: string;
  nip: string;
  email: string;
  badge: string;
  badgeColor: string;
  avatarBg: string;
}

const DEFAULT_TEACHERS: DefaultTeacher[] = [
  {
    name: 'Dra. Yunitawati, M.Pd.',
    role: 'Wakil Kepala Sekolah Bidang Kurikulum / Verifikator',
    nip: '19780512 200501 2 008',
    email: 'yunitawati32@guru.smp.belajar.id',
    badge: 'Verifikator Kurikulum',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    avatarBg: 'bg-emerald-600',
  },
  {
    name: 'Rahmat Hidayat, S.Pd., M.M.',
    role: 'Kepala Sekolah SMPN 14 Tulang Bawang Barat',
    nip: '19720315 199802 1 003',
    email: 'kepala.smpn14@tubaba.sch.id',
    badge: 'Kepala Sekolah',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    avatarBg: 'bg-blue-600',
  },
  {
    name: 'Ahmad Fauzi, S.Pd.',
    role: 'Guru Mata Pelajaran IPA & Koordinator Projek P5',
    nip: '19840210 201001 1 012',
    email: 'ahmad.fauzi@guru.smp.belajar.id',
    badge: 'Guru Mapel / P5',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    avatarBg: 'bg-amber-600',
  },
  {
    name: 'Siti Rahmawati, S.Pd.',
    role: 'Guru Bahasa Indonesia & Wali Kelas 7.1',
    nip: '19890624 201503 2 004',
    email: 'siti.rahmawati@guru.smp.belajar.id',
    badge: 'Wali Kelas 7.1',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    avatarBg: 'bg-purple-600',
  },
  {
    name: 'Budi Santoso, S.Pd.',
    role: 'Guru PJOK & Pembina Ekstrakurikuler Pramuka',
    nip: '19910817 201902 1 005',
    email: 'budi.santoso@guru.smp.belajar.id',
    badge: 'Pembina Pramuka',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    avatarBg: 'bg-teal-600',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginGoogle,
  onSelectTeacherProfile,
  authError,
  clearAuthError,
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'google'>('profiles');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [copied, setCopied] = useState(false);

  // Custom Teacher Form State
  const [customName, setCustomName] = useState('');
  const [customNip, setCustomNip] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState('Guru Mata Pelajaran');
  const [showCustomForm, setShowCustomForm] = useState(false);

  useEffect(() => {
    if (authError) {
      setActiveTab('google');
    }
  }, [authError]);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopyHostname = () => {
    if (navigator.clipboard && currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoogleClick = async () => {
    setIsLoggingIn(true);
    clearAuthError();
    try {
      await onLoginGoogle();
      onClose();
    } catch (err) {
      // Error handled by parent or displayed via authError
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleChooseTeacher = (teacher: DefaultTeacher) => {
    const user: AppUser = {
      uid: `teacher_${teacher.nip.replace(/\s+/g, '')}`,
      displayName: teacher.name,
      email: teacher.email,
      role: teacher.role,
      nip: teacher.nip,
      isGoogleAuth: false,
    };
    onSelectTeacherProfile(user);
    onClose();
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const user: AppUser = {
      uid: `custom_${Date.now()}`,
      displayName: customName.trim(),
      email: customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, '.')}@guru.smp.belajar.id`,
      role: customRole,
      nip: customNip.trim() || undefined,
      isGoogleAuth: false,
    };
    onSelectTeacherProfile(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-snug">
                Akses & Identitas Pendidik
              </h3>
              <p className="text-xs text-slate-300">
                SI-ARKUR • SMPN 14 Tulang Bawang Barat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors cursor-pointer border-t border-x ${
              activeTab === 'profiles'
                ? 'bg-white text-emerald-700 border-slate-200 -mb-px shadow-xs'
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Pilih Profil Pendidik (Cepat & Langsung)</span>
          </button>

          <button
            onClick={() => setActiveTab('google')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors cursor-pointer border-t border-x ${
              activeTab === 'google'
                ? 'bg-white text-emerald-700 border-slate-200 -mb-px shadow-xs'
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4 text-emerald-600" />
            <span>Akun Google Workspace</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* TAB 1: PROFIL PENDIDIK LANGSUNG */}
          {activeTab === 'profiles' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <p className="font-bold">Masuk Instan Tanpa Hambatan Peramban / Iframe</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Pilih nama Anda di bawah ini. Sistem akan langsung mengaktifkan hak verifikasi, mencantumkan nama dan NIP pada formulir berkas secara otomatis.
                  </p>
                </div>
              </div>

              {/* List of Teachers */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Pendidik & Verifikator Resmi:
                </p>
                <div className="space-y-2">
                  {DEFAULT_TEACHERS.map((teacher, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChooseTeacher(teacher)}
                      className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl ${teacher.avatarBg} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}
                        >
                          {teacher.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                              {teacher.name}
                            </h4>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${teacher.badgeColor}`}
                            >
                              {teacher.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            NIP. {teacher.nip} • {teacher.email}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Teacher Collapsible */}
              <div className="pt-2 border-t border-slate-100">
                {!showCustomForm ? (
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>+ Masuk dengan Nama Guru / NIP Lain</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleSubmitCustom}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800">
                        Identitas Pendidik Baru
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowCustomForm(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Batal
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Nama Lengkap & Gelar *
                        </label>
                        <input
                          type="text"
                          required
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="Contoh: Nurhayati, S.Pd."
                          className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          NIP (Opsional)
                        </label>
                        <input
                          type="text"
                          value={customNip}
                          onChange={(e) => setCustomNip(e.target.value)}
                          placeholder="1985xxxx xxxx x xxx"
                          className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Tugas / Peran Sekolah
                        </label>
                        <select
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="Guru Mata Pelajaran">Guru Mata Pelajaran</option>
                          <option value="Wali Kelas">Wali Kelas</option>
                          <option value="Pembina Ekstrakurikuler">Pembina Ekstrakurikuler</option>
                          <option value="Tim Verifikator Kurikulum">Tim Verifikator Kurikulum</option>
                          <option value="Staf Administrasi / TU">Staf Administrasi / TU</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Email (@guru.smp.belajar.id)
                        </label>
                        <input
                          type="email"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder="nama@guru.smp.belajar.id"
                          className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Masuk dengan Identitas Ini
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SIGN IN */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="text-center py-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2 border border-slate-200">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Masuk dengan Akun Google Belajar.id
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Gunakan akun resmi Kemendikbudristek atau akun Google Anda untuk sinkronisasi dokumen kurikulum.
                </p>
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleClick}
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></span>
                    Menghubungkan ke Google...
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Lanjutkan dengan Akun Google</span>
                  </>
                )}
              </button>

              {/* Error & Solution Diagnostics Card */}
              {authError && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 space-y-2.5 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-amber-900">
                        {authError.title}
                      </h5>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {authError.detail}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-lg p-2.5 border border-amber-200 text-[11px] space-y-1.5 text-slate-700">
                    <p className="font-semibold text-slate-800">
                      💡 Mengapa hal ini terjadi?
                    </p>
                    <p className="text-slate-600">
                      Google OAuth memerlukan domain peramban aktif terdaftar di Firebase Console, dan sering kali dibatasi jika dijalankan di dalam iFrame pratinjau studio atau domain baru (seperti Vercel).
                    </p>

                    <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 font-mono truncate">
                        Domain aktif: <strong className="text-slate-800">{currentHostname}</strong>
                      </span>
                      <button
                        onClick={handleCopyHostname}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded cursor-pointer shrink-0"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Tersalin!' : 'Salin Domain'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <button
                      onClick={() => setActiveTab('profiles')}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer text-center"
                    >
                      👉 Gunakan Masuk Cepat Profil Pendidik
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>SMPN 14 Tulang Bawang Barat</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
