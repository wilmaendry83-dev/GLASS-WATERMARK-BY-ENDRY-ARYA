import React from 'react';
import { WatermarkConfig } from '../types.ts';

interface SliderControlsProps {
  config: WatermarkConfig;
  onUpdate: (patch: Partial<WatermarkConfig>) => void;
}

export const SliderControls: React.FC<SliderControlsProps> = ({
  config,
  onUpdate,
}) => {
  return (
    <div className="space-y-2.5">
      {/* 1. Radius Sudut */}
      <div className="bg-white dark:bg-[#14161a] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-800 dark:text-slate-200">Radius Sudut</span>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {config.cornerRadius}dp
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={config.cornerRadius}
          onChange={(e) => onUpdate({ cornerRadius: Number(e.target.value) })}
          className="w-full text-slate-900 dark:text-white"
          aria-label="Radius Sudut"
        />
      </div>

      {/* 2. Kekeruhan / Blur */}
      <div className="bg-white dark:bg-[#14161a] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-800 dark:text-slate-200">Kekeruhan Blur</span>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {config.blurAmount}dp
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          value={config.blurAmount}
          onChange={(e) => onUpdate({ blurAmount: Number(e.target.value) })}
          className="w-full text-slate-900 dark:text-white"
          aria-label="Kekeruhan Blur"
        />
      </div>

      {/* 3. Distorsi Kaca */}
      <div className="bg-white dark:bg-[#14161a] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-800 dark:text-slate-200">Distorsi & Efek Kaca</span>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {config.distortion}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={config.distortion}
          onChange={(e) => onUpdate({ distortion: Number(e.target.value) })}
          className="w-full text-slate-900 dark:text-white"
          aria-label="Distorsi dan Efek Kaca"
        />
      </div>

      {/* 4. Lebar Watermark */}
      <div className="bg-white dark:bg-[#14161a] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-800 dark:text-slate-200">Lebar Watermark</span>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {config.widthPercent}%
          </span>
        </div>
        <input
          type="range"
          min="50"
          max="100"
          value={config.widthPercent}
          onChange={(e) => onUpdate({ widthPercent: Number(e.target.value) })}
          className="w-full text-slate-900 dark:text-white"
          aria-label="Lebar Watermark"
        />
      </div>

      {/* 5. Tinggi Watermark */}
      <div className="bg-white dark:bg-[#14161a] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-800 dark:text-slate-200">Tinggi Watermark</span>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {config.heightPercent}%
          </span>
        </div>
        <input
          type="range"
          min="50"
          max="150"
          value={config.heightPercent}
          onChange={(e) => onUpdate({ heightPercent: Number(e.target.value) })}
          className="w-full text-slate-900 dark:text-white"
          aria-label="Tinggi Watermark"
        />
      </div>

      {/* 6. Jarak Vertikal */}
      <div className="bg-white dark:bg-[#14161a] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-800 dark:text-slate-200">Posisi Vertikal dari Bawah</span>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {config.verticalOffset}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="25"
          value={config.verticalOffset}
          onChange={(e) => onUpdate({ verticalOffset: Number(e.target.value) })}
          className="w-full text-slate-900 dark:text-white"
          aria-label="Posisi Vertikal"
        />
      </div>
    </div>
  );
};
