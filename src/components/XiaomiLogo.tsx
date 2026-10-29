import React from 'react';

interface XiaomiLogoProps {
  className?: string;
  color?: string;
  size?: number;
}

/**
 * Official Xiaomi Brand Wordmark
 * Directly sourced and extracted from Kenya Hara official corporate wordmark asset (117358_f02be844.png)
 * Features exact geometry:
 * - Rounded geometric 'x'
 * - Modern dotless 'i'
 * - Single-story circular 'a'
 * - Geometric oval 'o'
 * - Continuous double-arch 'm'
 * - Modern dotless 'i'
 * Aspect Ratio: 1305 / 210 (~6.214)
 */
export const XiaomiWordmark: React.FC<XiaomiLogoProps> = ({
  className = 'h-4 w-auto',
  color = 'currentColor',
}) => {
  // For pure white (frosted glass pills, dark photos)
  if (color === '#ffffff' || color === 'white') {
    return (
      <img
        src="/assets/aistudio/xiaomi_wordmark_white.png"
        alt="Xiaomi"
        className={`inline-block select-none shrink-0 object-contain ${className}`}
        style={{ aspectRatio: '1305 / 210' }}
        draggable={false}
      />
    );
  }

  // For pure black / dark slate (white strip style, light mode cards)
  if (color === '#000000' || color === '#111827' || color === '#0f172a' || color === 'black') {
    return (
      <img
        src="/assets/aistudio/xiaomi_wordmark_black.png"
        alt="Xiaomi"
        className={`inline-block select-none shrink-0 object-contain ${className}`}
        style={{ aspectRatio: '1305 / 210' }}
        draggable={false}
      />
    );
  }

  // Universal mask-image tinting for arbitrary colors or currentColor
  return (
    <span
      className={`inline-block select-none shrink-0 ${className}`}
      style={{
        display: 'inline-block',
        aspectRatio: '1305 / 210',
        backgroundColor: color === 'currentColor' ? 'currentColor' : color,
        maskImage: 'url(/assets/aistudio/xiaomi_wordmark.png)',
        WebkitMaskImage: 'url(/assets/aistudio/xiaomi_wordmark.png)',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
      role="img"
      aria-label="Xiaomi"
    />
  );
};

/**
 * Component that formats model text like "Xiaomi 13 Pro" or "Photo by xiaomi 13 Pro"
 * with authentic Xiaomi wordmark typography and proper spacing between brand and model.
 */
export const XiaomiModelBrand: React.FC<{
  model: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  logoClassName?: string;
  color?: string;
  onClick?: () => void;
  title?: string;
}> = ({
  model,
  prefix = '',
  suffix = '',
  className = 'flex items-center gap-1.5',
  logoClassName = 'h-3.5 w-auto',
  color = 'currentColor',
  onClick,
  title,
}) => {
  const isXiaomi = model.toLowerCase().startsWith('xiaomi');
  const modelRemainder = isXiaomi ? model.slice(6).trim() : model;

  return (
    <div
      onClick={onClick}
      title={title}
      className={`inline-flex items-center font-sans ${
        onClick ? 'cursor-pointer hover:opacity-90 active:scale-[0.98]' : ''
      } ${className}`}
    >
      {prefix && <span className="mr-1.5 shrink-0">{prefix}</span>}
      {isXiaomi ? (
        <span className="inline-flex items-center shrink-0">
          <XiaomiWordmark className={logoClassName} color={color} />
          {/* Spasi sedikit elegan antara xiaomi dan model (misal 13 Pro) */}
          {modelRemainder && (
            <span className="font-bold tracking-tight ml-2 sm:ml-2.5">
              {modelRemainder}
            </span>
          )}
        </span>
      ) : (
        <span className="font-bold tracking-tight">{model}</span>
      )}
      {suffix && <span className="ml-1.5 shrink-0">{suffix}</span>}
    </div>
  );
};

/**
 * Authentic Leica Red Dot badge component
 */
export const LeicaBadge: React.FC<{ size?: number; className?: string }> = ({
  size = 28,
  className = '',
}) => {
  return (
    <div
      className={`relative rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/assets/aistudio/269012_94034473.webp"
        alt="Leica Logo"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
