import React from 'react';
import { Sliders, Sparkles, Settings2, Image as ImageIcon } from 'lucide-react';

export type TabKey = 'editor' | 'settings' | 'presets' | 'gallery';

interface BottomNavBarProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    {
      key: 'editor' as TabKey,
      label: 'Studio',
      icon: Sliders,
    },
    {
      key: 'settings' as TabKey,
      label: 'Pengaturan',
      icon: Settings2,
    },
    {
      key: 'presets' as TabKey,
      label: 'Preset Gaya',
      icon: Sparkles,
    },
    {
      key: 'gallery' as TabKey,
      label: 'Galeri',
      icon: ImageIcon,
    },
  ];

  return (
    <nav 
      aria-label="Navigasi Utama Bawah"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0c0d10]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 transition-colors"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 pb-safe px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChangeTab(tab.key)}
              aria-label={tab.label}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-transform duration-150 ${isActive ? 'scale-110' : 'scale-100'}`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-white" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[70px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
