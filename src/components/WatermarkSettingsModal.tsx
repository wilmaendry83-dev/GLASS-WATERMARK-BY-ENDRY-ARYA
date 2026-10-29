import React, { useRef } from 'react';
import { WatermarkConfig, ExifData } from '../types.ts';
import { LeicaBadge, XiaomiModelBrand } from './XiaomiLogo.tsx';
import { Plus, Trash2, Check, X, Camera, Calendar, Sparkles } from 'lucide-react';
import { formatXiaomiDate } from '../utils/watermark.ts';

interface WatermarkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WatermarkConfig;
  onUpdateConfig: (newConfig: Partial<WatermarkConfig>) => void;
}

export const WatermarkSettingsModal: React.FC<WatermarkSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdateConfig({
        logoType: 'custom',
        customLogoUrl: url,
      });
    }
  };

  const handleSetCurrentDate = () => {
    onUpdateConfig({
      dateText: formatXiaomiDate(new Date()),
    });
  };

  const handleExifChange = (key: keyof ExifData, value: string) => {
    onUpdateConfig({
      exifData: {
        ...config.exifData,
        [key]: value,
      },
    });
  };

  const quickModels = [
    'Xiaomi 13 Pro',
    'Xiaomi 14 Ultra',
    'Xiaomi 15 Pro',
    'Xiaomi 17 Ultra',
    'POCO F6 Pro',
    'Redmi Note 13 Pro+',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-watermark-settings-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#15171c] rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex flex-col p-6 space-y-6 pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar on mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 id="modal-watermark-settings-title" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Pengaturan Watermark
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sesuaikan logo Leica, model ponsel, EXIF kamera, dan stempel waktu
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup pengaturan"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Custom Image / Logo Picker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 dark:text-white">
              Logo Watermark
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {config.customLogoUrl ? 'Logo Kustom Aktif' : 'Leica Asli Aktif'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Leica Red Dot Option */}
            <button
              onClick={() => onUpdateConfig({ logoType: 'leica-red' })}
              className={`relative p-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center w-16 h-16 ${
                config.logoType === 'leica-red'
                  ? 'border-red-600 bg-red-50/20 dark:bg-red-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
              title="Logo Asli Leica"
            >
              <LeicaBadge size={32} />
              {config.logoType === 'leica-red' && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px]">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </button>

            {/* Custom Uploaded Logo if any */}
            {config.customLogoUrl && (
              <button
                onClick={() => onUpdateConfig({ logoType: 'custom' })}
                className={`relative p-1.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center w-16 h-16 ${
                  config.logoType === 'custom'
                    ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
                title="Logo Kustom"
              >
                <img
                  src={config.customLogoUrl}
                  alt="Kustom"
                  className="w-10 h-10 object-contain rounded-full"
                />
                {config.logoType === 'custom' && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px]">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>
            )}

            {/* Add Custom Logo Button (+) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-slate-400 transition-colors"
              title="Unggah Logo Baru"
            >
              <Plus size={22} />
              <span className="text-[10px] mt-0.5">Tambah</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCustomLogoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onUpdateConfig({ logoType: 'none' })}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                config.logoType === 'none'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent font-medium'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Tanpa Logo
            </button>
            {config.customLogoUrl && (
              <button
                onClick={() => onUpdateConfig({ customLogoUrl: null, logoType: 'leica-red' })}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Hapus Logo Kustom</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Logo Alignment */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900 dark:text-white">
            Posisi Logo
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => onUpdateConfig({ logoPosition: 'left' })}
              className={`py-2.5 text-xs font-semibold rounded-xl transition-all ${
                config.logoPosition === 'left'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Rata Kiri
            </button>
            <button
              type="button"
              onClick={() => onUpdateConfig({ logoPosition: 'right' })}
              className={`py-2.5 text-xs font-semibold rounded-xl transition-all ${
                config.logoPosition === 'right'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Rata Kanan
            </button>
          </div>
        </div>

        {/* 3. Device Model Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 dark:text-white">
              Nama Model HP
            </label>
            <div className="flex items-center text-xs text-slate-500">
              <span className="mr-1 text-[11px] opacity-75">Tampilan:</span>
              <XiaomiModelBrand model={config.deviceModel} logoClassName="h-3 w-auto" />
            </div>
          </div>
          <input
            type="text"
            value={config.deviceModel}
            onChange={(e) => onUpdateConfig({ deviceModel: e.target.value })}
            placeholder="misal: Xiaomi 13 Pro"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
          />

          {/* Quick presets for Xiaomi models */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickModels.map((m) => (
              <button
                key={m}
                onClick={() => onUpdateConfig({ deviceModel: m })}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                  config.deviceModel === m
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent font-medium'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Photo Camera Parameters / EXIF */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Camera size={15} />
            Parameter Kamera (EXIF)
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => onUpdateConfig({ exifMode: 'auto' })}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                config.exifMode === 'auto'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Otomatis
            </button>
            <button
              type="button"
              onClick={() => onUpdateConfig({ exifMode: 'custom' })}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                config.exifMode === 'custom'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Kustom
            </button>
            <button
              type="button"
              onClick={() => onUpdateConfig({ exifMode: 'off' })}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                config.exifMode === 'off'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Nonaktif
            </button>
          </div>

          {/* Editable EXIF fields if Custom */}
          {config.exifMode === 'custom' && (
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-medium">Panjang Fokus:</span>
                <input
                  type="text"
                  value={config.exifData.focalLength}
                  onChange={(e) => handleExifChange('focalLength', e.target.value)}
                  placeholder="misal: 26mm"
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium">Diafragma (Aperture):</span>
                <input
                  type="text"
                  value={config.exifData.fNumber}
                  onChange={(e) => handleExifChange('fNumber', e.target.value)}
                  placeholder="misal: f/1.8"
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium">Kecepatan Shutter:</span>
                <input
                  type="text"
                  value={config.exifData.exposureTime}
                  onChange={(e) => handleExifChange('exposureTime', e.target.value)}
                  placeholder="misal: 1/15s"
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium">ISO:</span>
                <input
                  type="text"
                  value={config.exifData.iso}
                  onChange={(e) => handleExifChange('iso', e.target.value)}
                  placeholder="misal: ISO1432"
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. Date & Time Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar size={15} />
              Tampilkan Tanggal & Waktu
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={config.showDate}
              onClick={() => onUpdateConfig({ showDate: !config.showDate })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.showDate ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform ${
                  config.showDate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {config.showDate && (
            <div className="flex gap-2">
              <input
                type="text"
                value={config.dateText}
                onChange={(e) => onUpdateConfig({ dateText: e.target.value })}
                placeholder="2026.10.28 10:14"
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleSetCurrentDate}
                className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-1"
              >
                <Sparkles size={13} />
                <span>Sekarang</span>
              </button>
            </div>
          )}
        </div>

        {/* Save Settings Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm tracking-wide shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Check size={18} />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
