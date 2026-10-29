import React from 'react';
import { WatermarkConfig, WatermarkStyleType } from '../types.ts';
import { LeicaBadge, XiaomiWordmark } from './XiaomiLogo.tsx';
import { Check } from 'lucide-react';

interface PresetItem {
  id: WatermarkStyleType;
  title: string;
  subtitle: string;
  recommendedModel: string;
  badge: string;
  configPatch: Partial<WatermarkConfig>;
}

export const PRESETS: PresetItem[] = [
  {
    id: 'frosted-glass',
    title: 'Modern Kaca (Frosted)',
    subtitle: 'Bar kaca transparan dengan efek blur HyperOS',
    recommendedModel: 'Xiaomi 13 Pro',
    badge: 'Referensi Utama',
    configPatch: {
      style: 'frosted-glass',
      cornerRadius: 100,
      blurAmount: 10,
      distortion: 40,
      widthPercent: 94,
      heightPercent: 100,
      verticalOffset: 6,
      logoType: 'leica-red',
      logoPosition: 'right',
      deviceModel: 'Xiaomi 13 Pro',
    },
  },
  {
    id: 'live-moment',
    title: 'Leica Live Moment',
    subtitle: 'Badge merah Leica [ Live Moment ] & parameter kamera',
    recommendedModel: 'Xiaomi 17 Ultra',
    badge: 'HyperOS 2.0',
    configPatch: {
      style: 'live-moment',
      verticalOffset: 8,
      logoType: 'leica-red',
      logoPosition: 'center',
      deviceModel: 'Xiaomi 17 Ultra',
      exifMode: 'custom',
    },
  },
  {
    id: 'white-strip',
    title: 'Strip Putih Klasik',
    subtitle: 'Bingkai bawah putih ala pameran fotografi Leica',
    recommendedModel: 'Xiaomi 14 Ultra',
    badge: 'Klasik',
    configPatch: {
      style: 'white-strip',
      logoType: 'leica-red',
      logoPosition: 'right',
      deviceModel: 'Xiaomi 14 Ultra',
      showDate: false,
      exifMode: 'auto',
    },
  },
  {
    id: 'black-strip',
    title: 'Strip Hitam Sinema',
    subtitle: 'Bingkai bawah hitam pekat bernuansa bioskop studio',
    recommendedModel: 'Xiaomi 15 Pro',
    badge: 'Sinematik',
    configPatch: {
      style: 'black-strip',
      logoType: 'leica-red',
      logoPosition: 'right',
      deviceModel: 'Xiaomi 15 Pro',
      showDate: false,
      exifMode: 'auto',
    },
  },
  {
    id: 'minimal-summilux',
    title: 'Minimalis Summilux',
    subtitle: 'Watermark teks Xiaomi & Leica minimal di sudut bawah',
    recommendedModel: 'Xiaomi 13 Pro',
    badge: 'Minimalis',
    configPatch: {
      style: 'minimal-summilux',
      logoType: 'leica-red',
      logoPosition: 'left',
      deviceModel: 'Xiaomi 13 Pro',
      verticalOffset: 6,
    },
  },
];

interface PresetSelectorProps {
  currentStyle: WatermarkStyleType;
  onSelectPreset: (patch: Partial<WatermarkConfig>) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  currentStyle,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Pilihan Preset Gaya
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          5 Gaya Asli Xiaomi & Leica
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESETS.map((p) => {
          const isSelected = currentStyle === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.configPatch)}
              className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/80 shadow-md scale-[1.01]'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14161a] hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <LeicaBadge size={22} />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {p.title}
                  </span>
                </div>
                {isSelected ? (
                  <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    {p.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                {p.subtitle}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <XiaomiWordmark className="h-3 w-auto" />
                  <span>{p.recommendedModel}</span>
                </span>
                <span className="text-slate-400 dark:text-slate-500 font-medium">Pilih Preset →</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
