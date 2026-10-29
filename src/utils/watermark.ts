export interface ExifParams {
  focalLength?: number | string;
  fNumber?: number | string;
  exposureTime?: number | string;
  iso?: number | string;
  lensModel?: string;
}

export interface WatermarkSettings {
  style: 'frosted-glass' | 'white-strip' | 'black-strip' | 'live-moment' | 'minimal-summilux';
  deviceModel: string;
  logoPosition: 'left' | 'right' | 'center';
  logoType: 'leica-red' | 'leica-mono' | 'custom' | 'none';
  customLogoUrl?: string;
  exifMode: 'auto' | 'custom' | 'off';
  exifData: ExifParams;
  showDate: boolean;
  dateText: string;
  cornerRadius: number; // in dp/px (0 to 100)
  blurAmount: number; // in dp/px (0 to 20)
  distortion: number; // 0 to 100%
  widthPercent: number; // 50 to 100%
  heightPercent: number; // 50 to 150%
  verticalOffset: number; // 0 to 100% (distance from bottom)
}

/**
 * Formats camera EXIF parameters into standard photography notation:
 * e.g., "26mm f/1.8 1/15s ISO1432"
 */
export function formatExifString(exif: ExifParams): string {
  const parts: string[] = [];
  
  if (exif.focalLength) {
    const fl = typeof exif.focalLength === 'number' 
      ? `${Math.round(exif.focalLength)}mm` 
      : (exif.focalLength.toString().endsWith('mm') ? exif.focalLength : `${exif.focalLength}mm`);
    parts.push(fl);
  }

  if (exif.fNumber) {
    const fn = typeof exif.fNumber === 'number'
      ? `f/${exif.fNumber < 10 ? exif.fNumber.toFixed(1) : Math.round(exif.fNumber)}`
      : (exif.fNumber.toString().startsWith('f/') ? exif.fNumber : `f/${exif.fNumber}`);
    parts.push(fn);
  }

  if (exif.exposureTime) {
    let et = exif.exposureTime.toString();
    if (typeof exif.exposureTime === 'number') {
      if (exif.exposureTime < 1) {
        et = `1/${Math.round(1 / exif.exposureTime)}s`;
      } else {
        et = `${exif.exposureTime}s`;
      }
    }
    parts.push(et);
  }

  if (exif.iso) {
    const isoVal = exif.iso.toString().toUpperCase().startsWith('ISO')
      ? exif.iso.toString()
      : `ISO${exif.iso}`;
    parts.push(isoVal);
  }

  return parts.join(' ');
}

/**
 * Calculates responsive dimensions and positions for the watermark badge
 */
export function calculateWatermarkBounds(
  canvasWidth: number,
  canvasHeight: number,
  widthPercent: number,
  heightPercent: number,
  verticalOffsetPercent: number = 8
) {
  // Base watermark height scaled to image aspect ratio
  const baseHeight = Math.max(36, Math.min(canvasHeight * 0.08, 90));
  const finalHeight = baseHeight * (heightPercent / 100);
  
  // Base width relative to canvas width
  const finalWidth = (canvasWidth * (widthPercent / 100)) * 0.88;
  const x = (canvasWidth - finalWidth) / 2;
  
  // Distance from bottom
  const bottomMargin = (canvasHeight * (verticalOffsetPercent / 100));
  const y = canvasHeight - finalHeight - bottomMargin;

  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.min(canvasWidth, finalWidth),
    height: finalHeight,
  };
}

/**
 * Formats a Date object to Xiaomi camera timestamp format: "YYYY.MM.DD HH:mm"
 */
export function formatXiaomiDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const date = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}.${month}.${date} ${hours}:${minutes}`;
}

/**
 * Clamps numeric values within range
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}
