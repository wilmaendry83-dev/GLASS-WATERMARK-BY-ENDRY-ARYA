import React, { useState } from 'react';
import { ExportResolution } from '../types.ts';
import { Download, X, Check, Sparkles, Image, ShieldCheck } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDownload: (resolution: ExportResolution) => void;
  isExporting: boolean;
  selectedResolution: ExportResolution;
  onSelectResolution: (res: ExportResolution) => void;
}

interface ResolutionOption {
  key: ExportResolution;
  label: string;
  pixels: string;
  description: string;
  isRecommended?: boolean;
  badge?: string;
}

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  {
    key: '4K',
    label: '4K Ultra HD',
    pixels: '3840px (Sisi Panjang)',
    description: 'Ketajaman master maksimal, detail Leica sangat jernih dan cocok untuk cetak.',
    isRecommended: true,
    badge: 'Kualitas Terbaik',
  },
  {
    key: '2K',
    label: '2K Quad HD',
    pixels: '2560px (Sisi Panjang)',
    description: 'Keseimbangan ideal antara kejernihan tinggi dan efisiensi ukuran media sosial.',
    badge: 'Sosial Media',
  },
  {
    key: 'HD',
    label: 'HD 1080p',
    pixels: '1920px (Sisi Panjang)',
    description: 'Ukuran file lebih ringan, proses ekspor instan dan mudah dibagikan via WhatsApp.',
    badge: 'Cepat & Ringan',
  },
  {
    key: 'ORIGINAL',
    label: 'Resolusi Asli (Original)',
    pixels: '100% Dimensi Bawaan',
    description: 'Mempertahankan resolusi sensor asli foto Anda tanpa kompresi skala.',
    badge: 'File Asli',
  },
];

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  onConfirmDownload,
  isExporting,
  selectedResolution,
  onSelectResolution,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-download-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#14161a] rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex flex-col p-5 space-y-4 pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 id="modal-download-title" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Download size={18} className="text-red-600" />
              <span>Pilih Resolusi Unduhan</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih kualitas rendering watermark foto Xiaomi Leica
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Resolution Options List */}
        <div className="space-y-2.5">
          {RESOLUTION_OPTIONS.map((opt) => {
            const isSelected = selectedResolution === opt.key;
            return (
              <div
                key={opt.key}
                onClick={() => onSelectResolution(opt.key)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                  isSelected
                    ? 'border-slate-900 dark:border-white bg-slate-50/80 dark:bg-slate-800/60 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Radio Circle */}
                <div
                  className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border transition-all ${
                    isSelected
                      ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'border-slate-300 dark:border-slate-700 bg-transparent'
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {opt.label}
                      {opt.isRecommended && (
                        <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-md font-semibold">
                          Rekomendasi
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                      {opt.pixels}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => onConfirmDownload(selectedResolution)}
            disabled={isExporting}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm tracking-wide shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <span>Sedang Merender Resolusi Tinggi...</span>
            ) : (
              <>
                <Download size={18} />
                <span>Unduh Sekarang ({selectedResolution})</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck size={12} />
            <span>Format JPEG kualitas tinggi 95% dengan profil warna Leica asli</span>
          </p>
        </div>
      </div>
    </div>
  );
};
