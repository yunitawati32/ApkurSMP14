import React, { useState } from 'react';
import {
  School,
  Award,
  MapPin,
  Mail,
  Phone,
  User,
  ShieldAlert,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  Save,
} from 'lucide-react';
import { SchoolProfile, CurriculumDoc, CategoryDef } from '../types/curriculum';
import { INITIAL_DOCUMENTS, INITIAL_CATEGORIES, INITIAL_SCHOOL_PROFILE } from '../data/initialData';

interface SchoolProfileViewProps {
  profile: SchoolProfile;
  onUpdateProfile: (newProfile: SchoolProfile) => void;
  documents: CurriculumDoc[];
  categories: CategoryDef[];
  onResetData: () => void;
  onRestoreData: (docs: CurriculumDoc[], cats: CategoryDef[], prof: SchoolProfile) => void;
}

export const SchoolProfileView: React.FC<SchoolProfileViewProps> = ({
  profile,
  onUpdateProfile,
  documents,
  categories,
  onResetData,
  onRestoreData,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>(profile);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDownloadBackup = () => {
    const backupData = {
      version: '1.0',
      school: profile,
      categories,
      documents,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_SIARKUR_SMPN14_TUBABA_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.documents && parsed.categories) {
          onRestoreData(
            parsed.documents,
            parsed.categories,
            parsed.school || INITIAL_SCHOOL_PROFILE
          );
          alert('Data cadangan berhasil dipulihkan!');
        } else {
          alert('Format berkas cadangan tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca berkas cadangan JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
            <School className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-xs text-slate-500">
              NPSN: <span className="font-mono font-bold text-slate-700">{profile.npsn}</span> •{' '}
              <span className="text-emerald-700 font-semibold">{profile.accreditation}</span> •{' '}
              {profile.regency}, {profile.province}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          {isEditing ? 'Batal Ubah' : 'Edit Identitas Sekolah'}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Profil sekolah berhasil diperbarui!</span>
        </div>
      )}

      {/* School Information Form or View */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Perbarui Data Satuan Pendidikan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Nama Sekolah
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                NPSN
              </label>
              <input
                type="text"
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Akreditasi
              </label>
              <input
                type="text"
                value={formData.accreditation}
                onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Alamat Lengkap
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.headmaster}
                onChange={(e) => setFormData({ ...formData, headmaster: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.headmasterNip}
                onChange={(e) => setFormData({ ...formData, headmasterNip: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Wakil Kepala Sekolah Bidang Kurikulum
              </label>
              <input
                type="text"
                value={formData.curriculumVice}
                onChange={(e) => setFormData({ ...formData, curriculumVice: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                NIP Waka Kurikulum
              </label>
              <input
                type="text"
                value={formData.curriculumViceNip}
                onChange={(e) => setFormData({ ...formData, curriculumViceNip: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      ) : (
        /* View Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Identitas Sekolah */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <School className="w-4 h-4 text-emerald-600" />
              Identitas Lembaga Pendidikan
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Satuan:</span>
                <span className="font-semibold text-slate-900">{profile.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">NPSN & Status:</span>
                <span className="font-mono font-semibold text-slate-800">{profile.npsn}</span> •{' '}
                <span className="text-emerald-700 font-semibold">{profile.accreditation}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Wilayah:</span>
                <span className="text-slate-800">
                  {profile.district}, {profile.regency}, {profile.province}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Alamat Surat:</span>
                <span className="text-slate-800">{profile.address}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-600">
                <span>Surel: {profile.email}</span>
                <span>Telp: {profile.phone}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Pimpinan & Tim Pengembang Kurikulum */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-emerald-600" />
              Pejabat Penanggung Jawab Kurikulum
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Kepala Satuan Pendidikan:
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{profile.headmaster}</p>
                <p className="text-[11px] text-slate-500 font-mono">NIP. {profile.headmasterNip}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                  Wakil Kepala Sekolah Bidang Kurikulum (Verifikator):
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{profile.curriculumVice}</p>
                <p className="text-[11px] text-slate-600 font-mono">
                  NIP. {profile.curriculumViceNip}
                </p>
                <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                  • Penelaah Utama Dokumen KOSP, Modul Ajar, Asesmen & P5
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup & Data Management Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          Manajemen Data & Cadangan Arsip (Backup & Restore)
        </h3>
        <p className="text-xs text-slate-500">
          Amankan basis data arsip kurikulum lokal Anda dengan membuat cadangan berkala atau pulihkan data
          saat berpindah perangkat komputer.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Unduh Cadangan Lengkap (.json)
          </button>

          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Pulihkan Cadangan (.json)</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileRestore}
            />
          </label>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'Yakin ingin memuat ulang data percontohan awal SMPN 14 Tulang Bawang Barat? Semua perubahan baru akan diganti data bawaan.'
                )
              ) {
                onResetData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold cursor-pointer border border-rose-200 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset ke Data Percontohan Awal
          </button>
        </div>
      </div>
    </div>
  );
};
