import { WatermarkConfig, ExportResolution } from '../types.ts';
import { formatExifString } from './watermark.ts';

/**
 * Loads an image from URL or dataURL into an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Loads authentic Xiaomi wordmark asset extracted from user reference 117358_f02be844.png
 * Aspect Ratio: 1305 / 210 = ~6.214
 */
const XIAOMI_ASPECT_RATIO = 1305 / 210;

async function loadXiaomiVector(color: string = '#ffffff'): Promise<HTMLImageElement> {
  const isWhite = color === '#ffffff' || color === 'white';
  const path = isWhite
    ? '/assets/aistudio/xiaomi_wordmark_white.png'
    : '/assets/aistudio/xiaomi_wordmark_black.png';
  return loadImage(path);
}

/**
 * Computes target long-edge dimension based on export resolution choice
 */
export function getResolutionTargetSize(
  imgW: number,
  imgH: number,
  resolution: ExportResolution = '4K'
): number | undefined {
  if (resolution === 'ORIGINAL') return undefined;
  const naturalLong = Math.max(imgW, imgH);
  if (resolution === 'HD') {
    return Math.min(naturalLong, 1920);
  }
  if (resolution === '2K') {
    return Math.min(naturalLong, 2560);
  }
  if (resolution === '4K') {
    return Math.max(naturalLong, 3840);
  }
  return undefined;
}

/**
 * Renders the image and the selected watermark style to an offscreen HTMLCanvasElement
 */
export async function renderWatermarkedCanvas(
  sourceImage: HTMLImageElement | string,
  config: WatermarkConfig,
  targetLongEdge?: number
): Promise<HTMLCanvasElement> {
  const baseImg = typeof sourceImage === 'string' ? await loadImage(sourceImage) : sourceImage;
  
  // Calculate canvas dimensions using long edge
  let scale = 1;
  if (targetLongEdge && targetLongEdge > 0) {
    const naturalLong = Math.max(baseImg.naturalWidth, baseImg.naturalHeight);
    scale = targetLongEdge / naturalLong;
  }

  const width = Math.round(baseImg.naturalWidth * scale);
  const height = Math.round(baseImg.naturalHeight * scale);

  const isWhiteStrip = config.style === 'white-strip';
  const isBlackStrip = config.style === 'black-strip';
  const stripExtraHeight = (isWhiteStrip || isBlackStrip) ? Math.round(height * 0.12) : 0;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height + stripExtraHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2d context');

  // Draw main photo
  ctx.drawImage(baseImg, 0, 0, width, height);

  // Load Leica logo asset
  let leicaImg: HTMLImageElement | null = null;
  if (config.logoType === 'leica-red' || config.logoType === 'leica-mono') {
    try {
      leicaImg = await loadImage('/assets/aistudio/269012_94034473.webp');
    } catch {
      // Fallback
    }
  } else if (config.logoType === 'custom' && config.customLogoUrl) {
    try {
      leicaImg = await loadImage(config.customLogoUrl);
    } catch {
      // Fallback
    }
  }

  // Load authentic Xiaomi brand assets (white & dark)
  const xiaomiWhite = await loadXiaomiVector('#ffffff');
  const xiaomiDark = await loadXiaomiVector('#111827');

  // Render according to style
  if (config.style === 'frosted-glass') {
    renderFrostedGlassStyle(ctx, width, height, config, leicaImg, xiaomiWhite, baseImg);
  } else if (config.style === 'live-moment') {
    renderLiveMomentStyle(ctx, width, height, config, leicaImg, xiaomiWhite);
  } else if (config.style === 'white-strip') {
    renderStripStyle(ctx, width, height, stripExtraHeight, config, leicaImg, xiaomiDark, true);
  } else if (config.style === 'black-strip') {
    renderStripStyle(ctx, width, height, stripExtraHeight, config, leicaImg, xiaomiWhite, false);
  } else if (config.style === 'minimal-summilux') {
    renderMinimalSummiluxStyle(ctx, width, height, config, leicaImg, xiaomiWhite);
  }

  return canvas;
}

/**
 * 1. Frosted Glass Style (3D Optical Frosted Glass Pill)
 */
function renderFrostedGlassStyle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: WatermarkConfig,
  leicaImg: HTMLImageElement | null,
  xiaomiWhite: HTMLImageElement,
  baseImg: HTMLImageElement
) {
  const badgeWidth = Math.round(w * (config.widthPercent / 100) * 0.92);
  const baseBadgeHeight = Math.max(54, Math.round(h * 0.082));
  const badgeHeight = Math.round(baseBadgeHeight * (config.heightPercent / 100));
  
  const x = Math.round((w - badgeWidth) / 2);
  const bottomOffset = Math.round(h * (config.verticalOffset / 100) + h * 0.04);
  const y = h - badgeHeight - bottomOffset;
  
  const maxRadius = badgeHeight / 2;
  const radius = Math.min(maxRadius, (config.cornerRadius / 100) * maxRadius);

  // 1. Realistic 3D Cast Shadow (Ambient Occlusion + Directional Shadow)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = Math.max(16, Math.round(badgeHeight * 0.5));
  ctx.shadowOffsetY = Math.max(6, Math.round(badgeHeight * 0.2));
  ctx.beginPath();
  ctx.roundRect(x, y, badgeWidth, badgeHeight, radius);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fill();
  ctx.restore();

  // 2. Optical Frosted Glass Background with real blur
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, badgeWidth, badgeHeight, radius);
  ctx.clip();

  if (config.blurAmount > 0) {
    ctx.filter = `blur(${Math.max(3, Math.round(config.blurAmount * 2.2))}px)`;
    ctx.drawImage(baseImg, 0, 0, w, h);
    ctx.filter = 'none';
  }

  const alpha = 0.38 + (config.distortion / 100) * 0.4;
  
  // 3D Convex Glass Refraction Gradient
  const grad = ctx.createLinearGradient(x, y, x + badgeWidth * 0.3, y + badgeHeight);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.34)');
  grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.08)');
  grad.addColorStop(0.65, `rgba(14, 16, 20, ${alpha})`);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, badgeWidth, badgeHeight);

  // 3. Top Curved Specular Sheen (Kilauan Kaca Fisik 3D)
  const sheenGrad = ctx.createLinearGradient(x, y + 1, x + badgeWidth, y + 1);
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  sheenGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
  sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
  sheenGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.85)');
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.strokeStyle = sheenGrad;
  ctx.lineWidth = Math.max(1.5, Math.round(w * 0.002));
  ctx.beginPath();
  ctx.moveTo(x + radius * 0.6, y + 1);
  ctx.lineTo(x + badgeWidth - radius * 0.6, y + 1);
  ctx.stroke();

  ctx.restore();

  // 4. 3D Bevel Border Stroke (Specular Top + Dark Under Rim)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, badgeWidth, badgeHeight, radius);
  const borderGrad = ctx.createLinearGradient(x, y, x, y + badgeHeight);
  borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
  borderGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.22)');
  borderGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = Math.max(1, Math.round(w * 0.0016));
  ctx.stroke();
  ctx.restore();

  const isLogoLeft = config.logoPosition === 'left';
  const paddingX = Math.round(badgeWidth * 0.055);
  const centerY = y + badgeHeight / 2;

  const primaryFontSize = Math.max(14, Math.round(badgeHeight * 0.32));
  const subFontSize = Math.max(11, Math.round(badgeHeight * 0.22));

  ctx.save();
  ctx.textBaseline = 'middle';

  // Format model text with authentic Xiaomi wordmark
  const isXiaomi = config.deviceModel.toLowerCase().startsWith('xiaomi');
  const modelRemainder = isXiaomi ? config.deviceModel.slice(6).trim() : config.deviceModel;

  // Format EXIF string (selalu disertakan) dan tanggal
  const exifStr = config.exifMode !== 'off' ? formatExifString(config.exifData) : '';
  const dateStr = config.showDate && config.dateText ? config.dateText : '';
  const hasBoth = Boolean(exifStr && dateStr);

  const logoSize = (leicaImg && config.logoType !== 'none') ? Math.round(badgeHeight * 0.44) : 0;
  // Generous spacing between Leica logo and EXIF text (minimum 18px up to 28px)
  const gapBetweenLogoAndText = logoSize > 0 ? Math.max(18, Math.round(badgeHeight * 0.32)) : 0;

  if (!isLogoLeft) {
    // Model on left
    let textX = x + paddingX;
    if (isXiaomi) {
      const logoH = Math.round(primaryFontSize * 0.85);
      const logoW = Math.round(logoH * XIAOMI_ASPECT_RATIO);
      ctx.drawImage(xiaomiWhite, textX, centerY - logoH / 2, logoW, logoH);
      // Spasi sedikit elegan antara xiaomi dan 13 Pro
      textX += logoW + Math.round(primaryFontSize * 0.45);
    }
    ctx.font = `700 ${primaryFontSize}px "MiSans", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(modelRemainder, textX, centerY);

    // Right side: Accurate measurement to prevent ANY collision between Leica logo and EXIF text
    const textRightX = x + badgeWidth - paddingX;

    // 1. Measure text width with their exact corresponding fonts
    ctx.font = `500 ${Math.round(subFontSize * 1.05)}px "MiSans", monospace`;
    const exifW = exifStr ? ctx.measureText(exifStr).width : 0;

    ctx.font = `400 ${Math.round(subFontSize * 0.9)}px "MiSans", sans-serif`;
    const dateW = dateStr ? ctx.measureText(dateStr).width : 0;

    const maxTextW = Math.max(exifW, dateW);

    // 2. Draw text block aligned right
    if (hasBoth) {
      ctx.textAlign = 'right';
      ctx.font = `500 ${Math.round(subFontSize * 1.05)}px "MiSans", monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(exifStr, textRightX, centerY - subFontSize * 0.55);

      ctx.font = `400 ${Math.round(subFontSize * 0.9)}px "MiSans", sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.fillText(dateStr, textRightX, centerY + subFontSize * 0.65);
    } else if (exifStr || dateStr) {
      ctx.textAlign = 'right';
      ctx.font = `500 ${Math.round(subFontSize * 1.05)}px "MiSans", monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(exifStr || dateStr, textRightX, centerY);
    }

    // 3. Draw Leica logo to the left of the entire text block with generous spacing (no clipping!)
    if (leicaImg && config.logoType !== 'none') {
      const logoX = textRightX - maxTextW - gapBetweenLogoAndText - logoSize;
      ctx.drawImage(leicaImg, logoX, centerY - logoSize / 2, logoSize, logoSize);
    }
  } else {
    // Logo on left
    let leftCursor = x + paddingX;
    if (leicaImg && config.logoType !== 'none') {
      ctx.drawImage(leicaImg, leftCursor, centerY - logoSize / 2, logoSize, logoSize);
      leftCursor += logoSize + gapBetweenLogoAndText;
    }

    if (isXiaomi) {
      const logoH = Math.round(primaryFontSize * 0.85);
      const logoW = Math.round(logoH * XIAOMI_ASPECT_RATIO);
      ctx.drawImage(xiaomiWhite, leftCursor, centerY - logoH / 2, logoW, logoH);
      // Spasi sedikit elegan antara xiaomi dan 13 Pro
      leftCursor += logoW + Math.round(primaryFontSize * 0.45);
    }
    ctx.font = `700 ${primaryFontSize}px "MiSans", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(modelRemainder, leftCursor, centerY);

    // Right side: EXIF + Tanggal
    const textRightX = x + badgeWidth - paddingX;
    if (hasBoth) {
      ctx.textAlign = 'right';
      ctx.font = `500 ${Math.round(subFontSize * 1.05)}px "MiSans", monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(exifStr, textRightX, centerY - subFontSize * 0.55);

      ctx.font = `400 ${Math.round(subFontSize * 0.9)}px "MiSans", sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.fillText(dateStr, textRightX, centerY + subFontSize * 0.65);
    } else if (exifStr || dateStr) {
      ctx.font = `500 ${Math.round(subFontSize * 1.05)}px "MiSans", monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'right';
      ctx.fillText(exifStr || dateStr, textRightX, centerY);
    }
  }

  ctx.restore();
}

/**
 * 2. Live Moment Style
 */
function renderLiveMomentStyle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: WatermarkConfig,
  leicaImg: HTMLImageElement | null,
  xiaomiWhite: HTMLImageElement
) {
  const bottomOffset = Math.round(h * (config.verticalOffset / 100) + h * 0.05);
  const centerY = h - bottomOffset;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 1. Leica Red Dot at top
  const logoSize = Math.max(24, Math.round(w * 0.055));
  if (leicaImg && config.logoType !== 'none') {
    ctx.drawImage(leicaImg, w / 2 - logoSize / 2, centerY - logoSize * 2.2, logoSize, logoSize);
  }

  // 2. Red corner brackets around "Live Moment"
  const titleFontSize = Math.max(14, Math.round(w * 0.038));
  ctx.font = `700 ${titleFontSize}px "MiSans", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 4;
  ctx.fillText('Live Moment', w / 2, centerY - logoSize * 0.9);

  const titleMetrics = ctx.measureText('Live Moment');
  const bracketW = 6;
  const bracketH = titleFontSize * 0.9;
  const leftX = w / 2 - titleMetrics.width / 2 - 12;
  const rightX = w / 2 + titleMetrics.width / 2 + 12;
  const bracketY = centerY - logoSize * 0.9;

  ctx.strokeStyle = '#e3000f';
  ctx.lineWidth = Math.max(2, Math.round(w * 0.0025));

  ctx.beginPath();
  ctx.moveTo(leftX + bracketW, bracketY - bracketH / 2);
  ctx.lineTo(leftX, bracketY - bracketH / 2);
  ctx.lineTo(leftX, bracketY + bracketH / 2);
  ctx.lineTo(leftX + bracketW, bracketY + bracketH / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rightX - bracketW, bracketY - bracketH / 2);
  ctx.lineTo(rightX, bracketY - bracketH / 2);
  ctx.lineTo(rightX, bracketY + bracketH / 2);
  ctx.lineTo(rightX - bracketW, bracketY + bracketH / 2);
  ctx.stroke();

  // 3. EXIF Kamera (Wajib Disertakan)
  const exifFontSize = Math.max(11, Math.round(w * 0.026));
  ctx.font = `400 ${exifFontSize}px "MiSans", monospace`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  const exifStr = config.exifMode !== 'off' 
    ? formatExifString(config.exifData) 
    : (config.dateText || '26mm f/1.8 1/15s ISO1432');
  ctx.fillText(exifStr, w / 2, centerY - logoSize * 0.1);

  // 4. Xiaomi Brand + Spasi + Model + "by Leica"
  const isXiaomi = config.deviceModel.toLowerCase().startsWith('xiaomi');
  const modelRemainder = isXiaomi ? config.deviceModel.slice(6).trim() : config.deviceModel;
  const brandFontSize = Math.max(12, Math.round(w * 0.03));
  
  const logoH = Math.round(brandFontSize * 0.85);
  const logoW = Math.round(logoH * XIAOMI_ASPECT_RATIO);
  const gapBetween = Math.round(brandFontSize * 0.45);
  ctx.font = `700 ${brandFontSize}px "MiSans", sans-serif`;
  const textRemainderWidth = ctx.measureText(`${modelRemainder} by Leica`).width;
  const totalBrandWidth = (isXiaomi ? logoW + gapBetween : 0) + textRemainderWidth;
  let startBrandX = w / 2 - totalBrandWidth / 2;

  if (isXiaomi) {
    ctx.drawImage(xiaomiWhite, startBrandX, centerY + logoSize * 0.65 - logoH / 2, logoW, logoH);
    startBrandX += logoW + gapBetween;
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${modelRemainder} by Leica`, startBrandX, centerY + logoSize * 0.65);

  ctx.restore();
}

/**
 * 3 & 4. Classic Strip Style (White or Black)
 */
function renderStripStyle(
  ctx: CanvasRenderingContext2D,
  w: number,
  imgH: number,
  stripH: number,
  config: WatermarkConfig,
  leicaImg: HTMLImageElement | null,
  xiaomiLogo: HTMLImageElement,
  isWhite: boolean
) {
  const y = imgH;
  const bg = isWhite ? '#ffffff' : '#0f1013';
  const textColor = isWhite ? '#111827' : '#ffffff';
  const subTextColor = isWhite ? '#64748b' : '#94a3b8';

  ctx.save();
  ctx.fillStyle = bg;
  ctx.fillRect(0, y, w, stripH);

  const centerY = y + stripH / 2;
  const paddingX = Math.round(w * 0.05);

  const titleSize = Math.max(14, Math.round(stripH * 0.28));
  const subSize = Math.max(11, Math.round(stripH * 0.2));

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  
  // Left side: Xiaomi wordmark + Model
  const isXiaomi = config.deviceModel.toLowerCase().startsWith('xiaomi');
  const modelRemainder = isXiaomi ? config.deviceModel.slice(6).trim() : config.deviceModel;
  let textX = paddingX;

  if (isXiaomi) {
    const logoH = Math.round(titleSize * 0.85);
    const logoW = Math.round(logoH * XIAOMI_ASPECT_RATIO);
    ctx.drawImage(xiaomiLogo, textX, centerY - titleSize * 0.45 - logoH / 2, logoW, logoH);
    textX += logoW + Math.round(titleSize * 0.45);
  }

  ctx.fillStyle = textColor;
  ctx.font = `700 ${titleSize}px "MiSans", sans-serif`;
  ctx.fillText(modelRemainder, textX, centerY - titleSize * 0.45);

  ctx.fillStyle = subTextColor;
  ctx.font = `400 ${subSize}px "MiSans", sans-serif`;
  if (config.showDate && config.dateText) {
    ctx.fillText(config.dateText, paddingX, centerY + subSize * 0.8);
  } else {
    ctx.fillText('LEICA Summilux', paddingX, centerY + subSize * 0.8);
  }

  // Right side: EXIF + Leica Red Dot (with generous space)
  let rightX = w - paddingX;
  if (leicaImg && config.logoType !== 'none') {
    const logoSize = Math.round(stripH * 0.46);
    ctx.drawImage(leicaImg, rightX - logoSize, centerY - logoSize / 2, logoSize, logoSize);
    rightX -= logoSize + Math.round(stripH * 0.24);
  }

  ctx.strokeStyle = isWhite ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rightX, centerY - stripH * 0.25);
  ctx.lineTo(rightX, centerY + stripH * 0.25);
  ctx.stroke();

  rightX -= Math.round(stripH * 0.24);

  if (config.exifMode !== 'off') {
    const exifStr = formatExifString(config.exifData);
    ctx.textAlign = 'right';
    ctx.fillStyle = textColor;
    ctx.font = `500 ${subSize * 1.1}px "MiSans", monospace`;
    ctx.fillText(exifStr, rightX, centerY);
  }

  ctx.restore();
}

/**
 * 5. Minimal Summilux Style (Sesuai referensi 275005_7ad387fe.png & 117358_f02be844.png)
 */
function renderMinimalSummiluxStyle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: WatermarkConfig,
  leicaImg: HTMLImageElement | null,
  xiaomiWhite: HTMLImageElement
) {
  const bottomOffset = Math.round(h * (config.verticalOffset / 100) + h * 0.05);
  const y = h - bottomOffset;
  const paddingX = Math.round(w * 0.07);

  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  let currentX = paddingX;
  const fontSize = Math.max(14, Math.round(w * 0.035));
  const subFontSize = Math.max(11, Math.round(w * 0.026));

  // 1. Large Xiaomi Wordmark on left (Authentic Kenya Hara typography)
  const mainLogoH = Math.round(fontSize * 1.25);
  const mainLogoW = Math.round(mainLogoH * XIAOMI_ASPECT_RATIO);
  ctx.drawImage(xiaomiWhite, currentX, y - mainLogoH / 2, mainLogoW, mainLogoH);
  currentX += mainLogoW + 16;

  // 2. Vertical Divider line |
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(currentX, y - fontSize * 0.9);
  ctx.lineTo(currentX, y + fontSize * 0.9);
  ctx.stroke();
  currentX += 16;

  // 3. Leica Red Dot
  if (leicaImg && config.logoType !== 'none') {
    const logoSize = Math.round(fontSize * 1.7);
    ctx.drawImage(leicaImg, currentX, y - logoSize / 2, logoSize, logoSize);
    currentX += logoSize + 16;
  }

  // 4. Line 1: "Photo by [xiaomi]  13 Pro"
  const isXiaomi = config.deviceModel.toLowerCase().startsWith('xiaomi');
  const modelRemainder = isXiaomi ? config.deviceModel.slice(6).trim() : config.deviceModel;

  ctx.font = `500 ${fontSize * 0.9}px "MiSans", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 4;
  ctx.fillText('Photo by ', currentX, y - fontSize * 0.45);

  const photoByWidth = ctx.measureText('Photo by ').width;
  let brandX = currentX + photoByWidth;

  if (isXiaomi) {
    const inlineLogoH = Math.round(fontSize * 0.75);
    const inlineLogoW = Math.round(inlineLogoH * XIAOMI_ASPECT_RATIO);
    ctx.drawImage(xiaomiWhite, brandX, y - fontSize * 0.45 - inlineLogoH / 2, inlineLogoW, inlineLogoH);
    // Spasi sedikit elegan antara xiaomi dan 13 Pro
    brandX += inlineLogoW + Math.round(fontSize * 0.4);
  }

  ctx.font = `700 ${fontSize * 0.9}px "MiSans", sans-serif`;
  ctx.fillText(modelRemainder, brandX, y - fontSize * 0.45);

  // 5. Line 2: "LEICA  Summilux" + EXIF Parameter
  const exifStr = config.exifMode !== 'off' ? formatExifString(config.exifData) : '';
  let line2Text = 'LEICA  Summilux';
  if (exifStr) {
    line2Text += `   |   ${exifStr}`;
  }

  ctx.font = `500 ${subFontSize}px "MiSans", sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillText(line2Text, currentX, y + fontSize * 0.55);

  ctx.restore();
}
