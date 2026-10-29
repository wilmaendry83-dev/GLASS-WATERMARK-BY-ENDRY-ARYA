import React from 'react';
import { SavedPhoto, SampleImage } from '../types.ts';
import { Download, Check, Sparkles, Trash2, ArrowUpRight } from 'lucide-react';
import { LeicaBadge, XiaomiWordmark } from './XiaomiLogo.tsx';

interface GalleryViewProps {
  sampleImages: SampleImage[];
  selectedImageUrl: string;
  onSelectSample: (sample: SampleImage) => void;
  savedPhotos: SavedPhoto[];
  onDownloadSaved: (photo: SavedPhoto) => void;
  onClearHistory: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  sampleImages,
  selectedImageUrl,
  onSelectSample,
  savedPhotos,
  onDownloadSaved,
  onClearHistory,
}) => {
  return (
    <div className="space-y-6 pb-6">
      {/* 1. Foto Sampel Bawaan (Termasuk foto dari referensi pengguna) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={16} className="text-orange-500" />
            Foto Sampel Kamera
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Pilih foto untuk langsung diedit
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {sampleImages.map((sample) => {
            const isSelected = selectedImageUrl === sample.url;
            return (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all duration-200 aspect-[3/4] flex flex-col justify-end p-3 ${
                  isSelected
                    ? 'border-slate-900 dark:border-white shadow-lg ring-2 ring-slate-900/10 dark:ring-white/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}

                <div className="relative z-10 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-600/90 text-white inline-block mb-1">
                    {sample.defaultModel}
                  </span>
                  <p className="text-xs font-semibold leading-tight drop-shadow-sm truncate">
                    {sample.name}
                  </p>
                  <p className="text-[10px] text-white/80 font-mono mt-0.5">
                    {sample.defaultExif.focalLength} · {sample.defaultExif.fNumber}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Riwayat Hasil Ekspor Watermark */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Riwayat Ekspor Foto ({savedPhotos.length})
          </h3>
          {savedPhotos.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span>Bersihkan</span>
            </button>
          )}
        </div>

        {savedPhotos.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
            <LeicaBadge size={36} className="mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Belum ada foto yang diekspor
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Beri watermark pada foto Anda di tab Studio, lalu tekan Unduh untuk menyimpan ke sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {savedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="p-3 bg-white dark:bg-[#14161a] rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm"
              >
                <img
                  src={photo.dataUrl}
                  alt="Hasil Ekspor"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <XiaomiWordmark className="h-3 w-auto" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {photo.deviceModel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Gaya: {photo.style}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {photo.timestamp}
                  </p>
                </div>
                <button
                  onClick={() => onDownloadSaved(photo)}
                  className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow hover:opacity-90 active:scale-95 transition-all shrink-0"
                  title="Unduh Lagi"
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
