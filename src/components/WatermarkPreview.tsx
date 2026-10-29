import React from 'react';
import { WatermarkConfig } from '../types.ts';
import { LeicaBadge, XiaomiWordmark, XiaomiModelBrand } from './XiaomiLogo.tsx';
import { formatExifString } from '../utils/watermark.ts';
import { Edit3 } from 'lucide-react';

interface WatermarkPreviewProps {
  imageUrl: string;
  config: WatermarkConfig;
  onOpenSettings?: () => void;
}

export const WatermarkPreview: React.FC<WatermarkPreviewProps> = ({
  imageUrl,
  config,
  onOpenSettings,
}) => {
  const isFrostedGlass = config.style === 'frosted-glass';
  const isLiveMoment = config.style === 'live-moment';
  const isWhiteStrip = config.style === 'white-strip';
  const isBlackStrip = config.style === 'black-strip';
  const isMinimalSummilux = config.style === 'minimal-summilux';

  // Format EXIF string (default: always included unless explicitly off)
  const exifDisplay = config.exifMode !== 'off' 
    ? formatExifString(config.exifData)
    : '';

  const pillRadius = `${config.cornerRadius}px`;
  const blurValue = `${config.blurAmount}px`;
  const alphaValue = 0.35 + (config.distortion / 100) * 0.45;

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[380px] mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col items-center justify-center transition-all duration-300">
      {/* Photo Frame Container - Compact for Sticky Mobile Viewport */}
      <div className="relative w-full aspect-[3/4] max-h-[38vh] overflow-hidden bg-black flex items-center justify-center select-none group">
        <img
          src={imageUrl}
          alt="Preview Foto"
          className="w-full h-full object-cover pointer-events-none"
          referrerPolicy="no-referrer"
        />

        {/* 1. Frosted Glass Style (3D Real Optical Glass Pill) */}
        {isFrostedGlass && (
          <div
            onClick={onOpenSettings}
            role="button"
            tabIndex={0}
            title="Ketuk untuk mengedit model HP atau parameter EXIF"
            className="group/pill absolute transition-all duration-150 flex items-center justify-between px-3.5 sm:px-4 text-white select-none cursor-pointer overflow-hidden active:scale-[0.98]"
            style={{
              width: `${config.widthPercent}%`,
              minHeight: `${Math.round(44 * (config.heightPercent / 100))}px`,
              borderRadius: pillRadius,
              backdropFilter: `blur(${blurValue}) saturate(190%) contrast(105%)`,
              WebkitBackdropFilter: `blur(${blurValue}) saturate(190%) contrast(105%)`,
              // 3D Glass Lighting Gradient
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 26%, rgba(14, 16, 20, ${alphaValue}) 60%, rgba(0, 0, 0, ${Math.min(0.92, alphaValue + 0.28)}) 100%)`,
              // 3D Depth Shadows: Ambient Occlusion + Specular Rim + Inner Bevel
              boxShadow: `
                0 18px 36px -6px rgba(0, 0, 0, 0.75),
                0 6px 14px -2px rgba(0, 0, 0, 0.55),
                inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.7),
                inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.65),
                inset 0 0 14px 0 rgba(255, 255, 255, 0.1)
              `,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              bottom: `${config.verticalOffset + 5}%`,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {/* 3D Top Curved Specular Sheen (Pantulan Kaca Melengkung) */}
            <div
              className="absolute top-0 left-[6%] right-[6%] h-[1.5px] pointer-events-none opacity-85"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 25%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.8) 75%, transparent 100%)',
              }}
            />

            {/* Quick edit hint indicator on hover/tap */}
            <div className="absolute right-1.5 top-1 opacity-0 group-hover/pill:opacity-70 transition-opacity pointer-events-none text-[8px] bg-black/60 rounded px-1 flex items-center gap-0.5">
              <Edit3 size={8} />
              <span>Edit</span>
            </div>

            {config.logoPosition === 'left' ? (
              <>
                <div className="flex items-center gap-2 shrink-0">
                  {config.logoType === 'leica-red' && <LeicaBadge size={20} />}
                  {config.logoType === 'custom' && config.customLogoUrl && (
                    <img src={config.customLogoUrl} alt="Logo" className="w-4 h-4 object-contain rounded-full" />
                  )}
                  <XiaomiModelBrand
                    model={config.deviceModel}
                    className="text-[11px] tracking-tight drop-shadow-sm truncate max-w-[150px]"
                    logoClassName="h-3 w-auto"
                    color="#ffffff"
                  />
                </div>

                {/* Sisi Kanan: EXIF Kamera Wajib Disertakan + Tanggal */}
                <div className="flex flex-col items-end justify-center text-right leading-tight shrink-0 pl-1">
                  {exifDisplay && (
                    <span className="text-[9px] text-white font-medium font-mono tracking-tight drop-shadow-sm whitespace-nowrap">
                      {exifDisplay}
                    </span>
                  )}
                  {config.showDate && config.dateText && (
                    <span className="text-[8px] text-white/80 font-normal tracking-tight mt-0.5 whitespace-nowrap">
                      {config.dateText}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <XiaomiModelBrand
                  model={config.deviceModel}
                  className="text-[11px] tracking-tight drop-shadow-sm truncate max-w-[150px]"
                  logoClassName="h-3 w-auto"
                  color="#ffffff"
                />

                {/* Sisi Kanan: Logo Leica + EXIF Kamera Wajib Disertakan + Tanggal */}
                <div className="flex items-center gap-3 sm:gap-3.5 shrink-0 pl-1.5">
                  {config.logoType === 'leica-red' && <LeicaBadge size={20} />}
                  {config.logoType === 'custom' && config.customLogoUrl && (
                    <img src={config.customLogoUrl} alt="Logo" className="w-4 h-4 object-contain rounded-full" />
                  )}
                  <div className="flex flex-col items-start justify-center text-left leading-tight shrink-0">
                    {exifDisplay && (
                      <span className="text-[9px] text-white font-medium font-mono tracking-tight drop-shadow-sm whitespace-nowrap">
                        {exifDisplay}
                      </span>
                    )}
                    {config.showDate && config.dateText && (
                      <span className="text-[8px] text-white/80 font-normal tracking-tight mt-0.5 whitespace-nowrap">
                        {config.dateText}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. Live Moment Style */}
        {isLiveMoment && (
          <div
            onClick={onOpenSettings}
            role="button"
            tabIndex={0}
            className="absolute transition-all duration-150 flex flex-col items-center justify-center text-center text-white select-none cursor-pointer drop-shadow-md"
            style={{
              bottom: `${config.verticalOffset + 5}%`,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
            }}
          >
            {config.logoType === 'leica-red' && <LeicaBadge size={22} className="mb-0.5" />}
            
            <div className="flex items-center gap-1 my-0.5">
              <span className="text-[#e3000f] font-bold text-sm leading-none">[</span>
              <span className="text-white font-bold text-xs tracking-wide">Live Moment</span>
              <span className="text-[#e3000f] font-bold text-sm leading-none">]</span>
            </div>

            <p className="text-[10px] text-white/95 tracking-wide font-normal font-mono my-0.5 drop-shadow-sm">
              {exifDisplay || '26mm f/1.8 1/15s ISO1432'}
            </p>

            <div className="flex items-center gap-1 mt-0.5">
              <XiaomiModelBrand
                model={config.deviceModel}
                suffix="by Leica"
                className="text-[11px] text-white font-semibold"
                logoClassName="h-3 w-auto"
                color="#ffffff"
              />
            </div>
          </div>
        )}

        {/* 5. Minimal Summilux Style (Sesuai referensi 275005_7ad387fe.png & 117358_f02be844.png) */}
        {isMinimalSummilux && (
          <div
            onClick={onOpenSettings}
            role="button"
            tabIndex={0}
            className="absolute transition-all duration-150 flex items-center gap-2 sm:gap-2.5 text-white select-none cursor-pointer drop-shadow-lg max-w-[94%]"
            style={{
              bottom: `${config.verticalOffset + 5}%`,
              left: '5%',
            }}
          >
            {/* Left large Xiaomi wordmark in original font */}
            <XiaomiWordmark className="h-4 sm:h-4.5 w-auto shrink-0" color="#ffffff" />
            
            {/* Hairline divider */}
            <div className="w-[1px] h-5 sm:h-6 bg-white/70 shrink-0" />
            
            {/* Leica Red Dot badge */}
            {config.logoType === 'leica-red' && <LeicaBadge size={20} className="shrink-0" />}
            
            {/* Right text lockup */}
            <div className="flex flex-col text-left whitespace-nowrap shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold leading-tight whitespace-nowrap">
                <span className="font-normal opacity-95">Photo by</span>
                {config.deviceModel.toLowerCase().startsWith('xiaomi') ? (
                  <span className="inline-flex items-center">
                    <XiaomiWordmark className="h-2.5 sm:h-3 w-auto inline shrink-0" color="#ffffff" />
                    <span className="font-bold ml-2">{config.deviceModel.slice(6).trim()}</span>
                  </span>
                ) : (
                  <span className="font-bold">{config.deviceModel}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[8px] sm:text-[9px] text-white/90 font-medium tracking-wider mt-0.5 whitespace-nowrap">
                <span>LEICA &nbsp;Summilux</span>
                {exifDisplay && (
                  <>
                    <span className="opacity-40">|</span>
                    <span className="font-mono opacity-90">{exifDisplay}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3 & 4. Classic Strip Styles */}
      {(isWhiteStrip || isBlackStrip) && (
        <div
          onClick={onOpenSettings}
          role="button"
          tabIndex={0}
          className={`w-full py-2.5 px-4 flex items-center justify-between border-t cursor-pointer transition-colors ${
            isWhiteStrip
              ? 'bg-white text-slate-900 border-slate-200'
              : 'bg-[#0f1013] text-white border-slate-800'
          }`}
        >
          <div className="flex flex-col text-left">
            <XiaomiModelBrand
              model={config.deviceModel}
              className="text-xs tracking-tight"
              logoClassName="h-3 w-auto"
              color={isWhiteStrip ? '#111827' : '#ffffff'}
            />
            <span className={`text-[9px] mt-0.5 ${isWhiteStrip ? 'text-slate-500' : 'text-slate-400'}`}>
              {config.showDate && config.dateText ? config.dateText : 'LEICA Summilux'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {config.exifMode !== 'off' && exifDisplay && (
              <span className={`text-[9px] font-mono tracking-tight ${isWhiteStrip ? 'text-slate-700' : 'text-slate-300'}`}>
                {exifDisplay}
              </span>
            )}
            <div className={`w-[1px] h-3.5 ${isWhiteStrip ? 'bg-slate-300' : 'bg-slate-700'}`} />
            {config.logoType === 'leica-red' && <LeicaBadge size={20} />}
          </div>
        </div>
      )}
    </div>
  );
};
