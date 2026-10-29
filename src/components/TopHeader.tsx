import React from 'react';
import { RotateCcw, Sliders, Moon, Sun, Upload, Download } from 'lucide-react';
import { XiaomiWordmark, LeicaBadge } from './XiaomiLogo.tsx';

interface TopHeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  onUploadClick: () => void;
  onDownloadClick: () => void;
  isExporting: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onReset,
  onOpenSettings,
  onUploadClick,
  onDownloadClick,
  isExporting,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#f5f6f8]/95 dark:bg-[#0a0b0e]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3.5 py-2 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Left: Xiaomi Wordmark + Leica Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <XiaomiWordmark className="h-4 w-auto" />
          <span className="text-[11px] font-semibold tracking-tight text-slate-500 dark:text-slate-400">
            Studio
          </span>
          <LeicaBadge size={18} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Reset button */}
          <button
            onClick={onReset}
            aria-label="Reset pengaturan"
            title="Reset Pengaturan ke Awal"
            className="h-8 px-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 shadow-xs hover:border-slate-400 active:scale-95 transition-all"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all shadow-xs shrink-0"
            title="Ganti Mode Gelap / Terang"
          >
            {darkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
          </button>

          {/* Upload Button */}
          <button
            onClick={onUploadClick}
            aria-label="Unggah Foto"
            className="h-8 px-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-semibold flex items-center gap-1 shadow-xs hover:border-slate-400 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            <Upload size={13} />
            <span>Unggah</span>
          </button>

          {/* Download Button */}
          <button
            onClick={onDownloadClick}
            disabled={isExporting}
            aria-label="Unduh Foto HD"
            className="h-8 px-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1 shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Download size={13} />
            <span>{isExporting ? 'Proses...' : 'Unduh'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
