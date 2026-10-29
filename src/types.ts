export type WatermarkStyleType = 
  | 'frosted-glass'      // Gaya Kaca Frosted (Referensi Gambar 1 & 2)
  | 'live-moment'        // Live Moment Merah (Referensi Gambar 6)
  | 'white-strip'        // Strip Putih Klasik Leica
  | 'black-strip'        // Strip Hitam Sinematik
  | 'minimal-summilux';  // Gaya Minimal Hijau/Bawah (Referensi Gambar 7)

export type ExportResolution = 'HD' | '2K' | '4K' | 'ORIGINAL';

export interface ExifData {
  focalLength: string;
  fNumber: string;
  exposureTime: string;
  iso: string;
  lensModel?: string;
}

export interface WatermarkConfig {
  style: WatermarkStyleType;
  deviceModel: string;
  logoPosition: 'left' | 'right' | 'center';
  logoType: 'leica-red' | 'leica-mono' | 'custom' | 'none';
  customLogoUrl: string | null;
  exifMode: 'auto' | 'custom' | 'off';
  exifData: ExifData;
  showDate: boolean;
  dateText: string;
  
  // Real-time Sliders matching reference
  cornerRadius: number;  // 0dp - 100dp
  blurAmount: number;    // 0dp - 20dp
  distortion: number;    // 0% - 100%
  widthPercent: number;  // 50% - 100%
  heightPercent: number; // 50% - 150%
  verticalOffset: number; // 0% - 25% from bottom
}

export interface SavedPhoto {
  id: string;
  dataUrl: string;
  timestamp: string;
  deviceModel: string;
  style: WatermarkStyleType;
}

export interface SampleImage {
  id: string;
  name: string;
  url: string;
  defaultExif: ExifData;
  defaultModel: string;
}
