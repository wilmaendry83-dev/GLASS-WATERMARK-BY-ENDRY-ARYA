import React, { useState, useEffect, useRef } from 'react';
import { WatermarkConfig, SampleImage, SavedPhoto, ExportResolution } from './types.ts';
import { WatermarkPreview } from './components/WatermarkPreview.tsx';
import { SliderControls } from './components/SliderControls.tsx';
import { WatermarkSettingsModal } from './components/WatermarkSettingsModal.tsx';
import { DownloadModal } from './components/DownloadModal.tsx';
import { PresetSelector } from './components/PresetSelector.tsx';
import { GalleryView } from './components/GalleryView.tsx';
import { BottomNavBar, TabKey } from './components/BottomNavBar.tsx';
import { TopHeader } from './components/TopHeader.tsx';
import { parsePhotoExif, estimateAiExif } from './utils/exifReader.ts';
import { renderWatermarkedCanvas, getResolutionTargetSize } from './utils/canvasRenderer.ts';
import { formatXiaomiDate } from './utils/watermark.ts';
import { Sliders, Sparkles, ImagePlus, Edit3, Download, Layers } from 'lucide-react';

const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'cafe-portrait',
    name: 'Potret Kafe Leica',
    url: '/src/assets/images/portrait_man_cafe_1793257065204.jpg',
    defaultModel: 'Xiaomi 13 Pro',
    defaultExif: {
      focalLength: '50mm',
      fNumber: 'f/1.4',
      exposureTime: '1/120s',
      iso: 'ISO100',
      lensModel: 'LEICA VARIO-SUMMILUX 1:1.9-2.2/14-75 ASPH.',
    },
  },
  {
    id: 'street-night',
    name: 'Malam Kota Sinematik',
    url: '/src/assets/images/street_urban_night_1793257065316.jpg',
    defaultModel: 'Xiaomi 14 Ultra',
    defaultExif: {
      focalLength: '23mm',
      fNumber: 'f/1.6',
      exposureTime: '1/30s',
      iso: 'ISO800',
      lensModel: 'LEICA VARIO-SUMMILUX 1:1.63-2.5/12-120 ASPH.',
    },
  },
  {
    id: 'love-at-first-shoot',
    name: 'Cangkir Kopi (Live Moment)',
    url: '/assets/aistudio/273915_74bbfc77.png',
    defaultModel: 'Xiaomi 17 Ultra',
    defaultExif: {
      focalLength: '26mm',
      fNumber: 'f/1.8',
      exposureTime: '1/15s',
      iso: 'ISO1432',
      lensModel: 'LEICA SUMMILUX 1:1.8/26 ASPH.',
    },
  },
  {
    id: 'green-studio',
    name: 'Studio Hijau Leica',
    url: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%221200%22%20height%3D%221600%22%20fill%3D%22%2300a82d%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%2F%3E%3C%2Fsvg%3E',
    defaultModel: 'Xiaomi 13 Pro',
    defaultExif: {
      focalLength: '23mm',
      fNumber: 'f/1.6',
      exposureTime: '1/60s',
      iso: 'ISO125',
      lensModel: 'LEICA VARIO-SUMMILUX 1:1.9-2.2/14-75 ASPH.',
    },
  },
];

// Default to 3D Optical Frosted Glass with authentic Leica Summilux EXIF
const DEFAULT_CONFIG: WatermarkConfig = {
  style: 'frosted-glass',
  deviceModel: 'Xiaomi 13 Pro',
  logoPosition: 'right',
  logoType: 'leica-red',
  customLogoUrl: null,
  exifMode: 'auto',
  exifData: {
    focalLength: '23mm',
    fNumber: 'f/1.6',
    exposureTime: '1/60s',
    iso: 'ISO125',
    lensModel: 'LEICA VARIO-SUMMILUX 1:1.9-2.2/14-75 ASPH.',
  },
  showDate: true,
  dateText: '2026.10.28 10:14',
  cornerRadius: 100,
  blurAmount: 2,
  distortion: 100,
  widthPercent: 96,
  heightPercent: 101,
  verticalOffset: 6,
};

export default function App() {
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<TabKey>('editor');
  const [currentImage, setCurrentImage] = useState<string>(SAMPLE_IMAGES[0].url);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [exportResolution, setExportResolution] = useState<ExportResolution>('4K');
  const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // STRICTLY default to Light Theme as requested by user ("Kontema nya masih gelap sih, ya Allah")
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure Light theme is strictly applied on mount and clear any dark mode state
  useEffect(() => {
    localStorage.setItem('xiaomi_dark_mode', 'false');
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('xiaomi_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('xiaomi_dark_mode', 'false');
    }
  }, [darkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleUpdateConfig = (patch: Partial<WatermarkConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    showToast('Pengaturan direset ke awal!');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = URL.createObjectURL(file);
      setCurrentImage(dataUrl);

      // Measure dimensions for AI heuristic estimation
      const img = new Image();
      img.src = dataUrl;
      await new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });

      const parsed = await parsePhotoExif(file, {
        width: img.naturalWidth,
        height: img.naturalHeight,
      });

      const patch: Partial<WatermarkConfig> = {
        exifData: parsed.exif,
        exifMode: 'auto',
      };
      if (parsed.dateStr) patch.dateText = parsed.dateStr;
      if (parsed.model) patch.deviceModel = parsed.model;

      handleUpdateConfig(patch);
      setActiveTab('editor');

      if (parsed.isAiEstimated) {
        showToast('Foto AI / Tanpa EXIF: Parameter Leica diestimasi otomatis!');
      } else {
        showToast(`EXIF asli dimuat: ${parsed.model} (${parsed.exif.focalLength} ${parsed.exif.fNumber})`);
      }
    } catch {
      showToast('Foto berhasil dimuat!');
    }
  };

  const handleDownload = async (resolution: ExportResolution = exportResolution) => {
    try {
      setIsExporting(true);
      showToast(`Merender watermark ${resolution} resolusi tinggi...`);

      const img = new Image();
      img.src = currentImage;
      await new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });

      const targetLongEdge = getResolutionTargetSize(img.naturalWidth, img.naturalHeight, resolution);
      const canvas = await renderWatermarkedCanvas(currentImage, config, targetLongEdge);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      const link = document.createElement('a');
      link.download = `Xiaomi_Watermark_${config.deviceModel.replace(/\s+/g, '_')}_${resolution}_${Date.now()}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const newSaved: SavedPhoto = {
        id: `photo-${Date.now()}`,
        dataUrl,
        timestamp: formatXiaomiDate(new Date()),
        deviceModel: `${config.deviceModel} (${resolution})`,
        style: config.style,
      };
      setSavedPhotos((prev) => [newSaved, ...prev.slice(0, 19)]);
      showToast(`Foto watermark ${resolution} berhasil diunduh! (${canvas.width}×${canvas.height})`);
      setIsDownloadModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses unduhan.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSaved = (photo: SavedPhoto) => {
    const link = document.createElement('a');
    link.download = `Xiaomi_${photo.deviceModel.replace(/\s+/g, '_')}_${photo.id}.jpg`;
    link.href = photo.dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Foto berhasil diunduh ulang!');
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0a0b0e] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Header Bar */}
      <TopHeader
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onReset={handleReset}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onUploadClick={() => fileInputRef.current?.click()}
        onDownloadClick={() => setIsDownloadModalOpen(true)}
        isExporting={isExporting}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto px-3 py-2 space-y-3 pb-24">
        {/* TAB 1: STUDIO / EDITOR */}
        {activeTab === 'editor' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* STICKY CANVAS: Tetap diam di atas saat scroll ke bawah */}
            <div className="sticky top-[48px] z-20 bg-[#f5f6f8] dark:bg-[#0a0b0e] py-1.5 transition-colors">
              <WatermarkPreview
                imageUrl={currentImage}
                config={config}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>

            {/* SCROLLABLE CONTROLS SECTION */}
            <div className="space-y-3 pt-1">
              {/* Quick Model & EXIF Editor Card */}
              <div className="bg-white dark:bg-[#14161a] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Edit3 size={13} className="text-red-600" />
                    Edit Cepat Model & EXIF
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const aiExif = estimateAiExif();
                      handleUpdateConfig({
                        exifData: aiExif.exif,
                        dateText: aiExif.dateStr,
                      });
                      showToast('EXIF diestimasi otomatis untuk Leica!');
                    }}
                    className="text-[10px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1 hover:underline"
                    title="Buat parameter kamera Leica otomatis jika foto hasil AI"
                  >
                    <Sparkles size={11} />
                    Estimasi EXIF AI
                  </button>
                </div>

                {/* Model input field */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Model:</span>
                  <input
                    type="text"
                    value={config.deviceModel}
                    onChange={(e) => handleUpdateConfig({ deviceModel: e.target.value })}
                    placeholder="misal: Xiaomi 13 Pro"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                {/* Quick Model Tags */}
                <div className="flex flex-wrap gap-1">
                  {['Xiaomi 13 Pro', 'Xiaomi 14 Ultra', 'Xiaomi 15 Pro', 'Xiaomi 17 Ultra'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleUpdateConfig({ deviceModel: m })}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                        config.deviceModel === m
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold border-transparent shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {m.replace('Xiaomi ', '')}
                    </button>
                  ))}
                </div>

                {/* Quick EXIF parameter inputs */}
                <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px]">
                  <div>
                    <span className="text-slate-400 block text-[9px] mb-0.5">Fokus</span>
                    <input
                      type="text"
                      value={config.exifData.focalLength}
                      onChange={(e) =>
                        handleUpdateConfig({
                          exifData: { ...config.exifData, focalLength: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] mb-0.5">Diafragma</span>
                    <input
                      type="text"
                      value={config.exifData.fNumber}
                      onChange={(e) =>
                        handleUpdateConfig({
                          exifData: { ...config.exifData, fNumber: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] mb-0.5">Shutter</span>
                    <input
                      type="text"
                      value={config.exifData.exposureTime}
                      onChange={(e) =>
                        handleUpdateConfig({
                          exifData: { ...config.exifData, exposureTime: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] mb-0.5">ISO</span>
                    <input
                      type="text"
                      value={config.exifData.iso}
                      onChange={(e) =>
                        handleUpdateConfig({
                          exifData: { ...config.exifData, iso: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>

              {/* Gaya Watermark Segmented Control */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold px-1">
                  <span className="text-slate-700 dark:text-slate-300">Gaya Watermark</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {config.style === 'frosted-glass'
                      ? 'Kaca Frosted 3D (Default)'
                      : config.style === 'minimal-summilux'
                      ? 'Summilux Asli'
                      : 'Live Moment'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white dark:bg-[#14161a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleUpdateConfig({ style: 'frosted-glass' })}
                    className={`py-2 px-1 text-xs font-bold rounded-xl transition-all text-center whitespace-nowrap truncate ${
                      config.style === 'frosted-glass'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Kaca Frosted
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateConfig({ style: 'minimal-summilux' })}
                    className={`py-2 px-1 text-xs font-bold rounded-xl transition-all text-center whitespace-nowrap truncate ${
                      config.style === 'minimal-summilux'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Summilux Asli
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateConfig({ style: 'live-moment' })}
                    className={`py-2 px-1 text-xs font-bold rounded-xl transition-all text-center whitespace-nowrap truncate ${
                      config.style === 'live-moment'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Live Moment
                  </button>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="py-2.5 px-3 rounded-2xl bg-white dark:bg-[#14161a] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 shadow-xs hover:border-slate-400 active:scale-95 transition-all"
                >
                  <Sliders size={13} />
                  <span>Pengaturan Logo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-2xl bg-white dark:bg-[#14161a] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 shadow-xs hover:border-slate-400 active:scale-95 transition-all"
                >
                  <ImagePlus size={13} />
                  <span>Ganti Foto</span>
                </button>
              </div>

              {/* Sliders */}
              <SliderControls
                config={config}
                onUpdate={handleUpdateConfig}
              />

              {/* Resolution Quick Picker & Download CTA Section */}
              <div className="space-y-2 pt-1">
                {/* Resolution Selector Row */}
                <div className="bg-white dark:bg-[#14161a] border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    <Layers size={13} className="text-red-600" />
                    <span>Resolusi:</span>
                  </div>
                  <div className="flex items-center gap-1 flex-1 justify-end">
                    {(['HD', '2K', '4K', 'ORIGINAL'] as ExportResolution[]).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => {
                          setExportResolution(res);
                          showToast(`Resolusi ${res === 'ORIGINAL' ? 'Asli' : res} dipilih!`);
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded-xl font-bold transition-all ${
                          exportResolution === res
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {res === 'ORIGINAL' ? 'Asli' : res}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big CTA Download Button */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(exportResolution)}
                    disabled={isExporting}
                    className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs sm:text-sm tracking-wide shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    <span>
                      {isExporting
                        ? 'Sedang Merender Resolusi Tinggi...'
                        : `Unduh Hasil (${exportResolution === 'ORIGINAL' ? 'Asli' : exportResolution})`}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsDownloadModalOpen(true)}
                    title="Buka Pilihan Resolusi Lengkap"
                    aria-label="Pilih opsi resolusi"
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-[#14161a] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-slate-400 active:scale-95 shadow-xs transition-all"
                  >
                    <Sparkles size={16} className="text-amber-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PENGATURAN (SETTINGS) */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in duration-200 py-2">
            <div className="bg-white dark:bg-[#14161a] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders size={18} />
                <span>Pengaturan Lanjutan</span>
              </h2>
              <p className="text-xs text-slate-500">
                Sesuaikan model HP, posisi logo, parameter kamera EXIF, dan teks stempel waktu.
              </p>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center gap-2"
              >
                <span>Buka Panel Pengaturan Lengkap</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PRESET GAYA */}
        {activeTab === 'presets' && (
          <div className="animate-in fade-in duration-200">
            <PresetSelector
              currentStyle={config.style}
              onSelectStyle={(s) => {
                handleUpdateConfig({ style: s });
                setActiveTab('editor');
                showToast('Gaya watermark berhasil diubah!');
              }}
            />
          </div>
        )}

        {/* TAB 4: GALERI TERSIMPAN */}
        {activeTab === 'gallery' && (
          <div className="animate-in fade-in duration-200">
            <GalleryView
              savedPhotos={savedPhotos}
              sampleImages={SAMPLE_IMAGES}
              onSelectSample={(sample) => {
                setCurrentImage(sample.url);
                handleUpdateConfig({
                  deviceModel: sample.defaultModel,
                  exifData: sample.defaultExif,
                });
                setActiveTab('editor');
                showToast(`Foto sampel "${sample.name}" dimuat!`);
              }}
              onDownload={handleDownloadSaved}
              onDelete={(id) => {
                setSavedPhotos((prev) => prev.filter((p) => p.id !== id));
                showToast('Foto dihapus dari riwayat.');
              }}
            />
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <WatermarkSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
      />

      {/* Download Resolution Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onConfirmDownload={(res) => handleDownload(res)}
        isExporting={isExporting}
        selectedResolution={exportResolution}
        onSelectResolution={setExportResolution}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-semibold rounded-full shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
