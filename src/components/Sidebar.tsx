import React, { useState } from 'react';
import { HistoryItem, Language, AppMode, UserTier } from '../types';
import { translations } from '../locales/translations';
import {
  Search,
  Plus,
  Trash2,
  X,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  Clock,
  Crown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  history: HistoryItem[];
  activeId: string | null;
  onSelectSession: (item: HistoryItem) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearHistory: () => void;
  theme: 'light' | 'dark';
  currentTier: UserTier;
  onOpenPricing: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  language,
  history,
  activeId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearHistory,
  theme,
  currentTier,
  onOpenPricing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'chat' | 'image' | 'document'>('all');
  const t = translations[language];
  const isDark = theme === 'dark';

  // Filter history items by search (in Amharic or English) and category
  const filteredHistory = history.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) {
      return false;
    }
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const title = 'title' in item ? item.title.toLowerCase() : '';
    const titleAm = 'titleAm' in item ? (item as any).titleAm?.toLowerCase() || '' : '';
    const fileName = 'fileName' in item ? item.fileName.toLowerCase() : '';
    const promptAm = 'promptAm' in item ? item.promptAm.toLowerCase() : '';
    const promptEn = 'promptEn' in item ? item.promptEn.toLowerCase() : '';

    return (
      title.includes(term) ||
      titleAm.includes(term) ||
      fileName.includes(term) ||
      promptAm.includes(term) ||
      promptEn.includes(term)
    );
  });

  const getIcon = (category: AppMode) => {
    switch (category) {
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-[#D97706]" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-[#059669]" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-[#3B82F6]" />;
    }
  };

  const getDisplayTitle = (item: HistoryItem) => {
    if (item.category === 'chat') {
      return language === 'am' && item.titleAm ? item.titleAm : item.title;
    }
    if (item.category === 'image') {
      return language === 'am' && item.promptAm ? item.promptAm : item.promptEn || item.title;
    }
    if (item.category === 'document') {
      return item.fileName;
    }
    return 'Untitled';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (Only on mobile/tablet screens < 1024px) */}
      <div
        className="fixed lg:hidden inset-0 bg-black/50 backdrop-blur-xs z-40"
        onClick={onClose}
      />

      {/* Sidebar Panel (Drawer on mobile, docked panel on desktop 1024-1440px+) */}
      <aside
        id="app-sidebar"
        className={`fixed lg:relative top-0 left-0 bottom-0 z-50 lg:z-10 w-[82%] max-w-[310px] lg:max-w-none lg:w-72 xl:w-80 flex flex-col border-r shadow-2xl lg:shadow-none transition-colors duration-200 shrink-0 ${
          isDark
            ? 'bg-[#2B2723] border-[#423D37] text-[#F4F1EA]'
            : 'bg-[#EBE7DF] border-[#D9D4C7] text-[#2D2A26]'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between border-inherit">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#8B7E66] flex items-center justify-center text-white text-xs font-bold font-fidel">
              ኢ
            </div>
            <h2 className="font-bold text-sm tracking-tight font-fidel">
              {language === 'am' ? 'ያለፉ ውይይቶች / History' : 'History / ያለፉ ውይይቶች'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-[#38332E] text-[#A89F91]'
                : 'hover:bg-[#D9D4C7] text-[#7A7265]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Session Button */}
        <div className="p-3">
          <button
            id="btn-sidebar-new"
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#8B7E66] hover:bg-[#7A6E57] text-white text-xs font-bold shadow-sm transition-colors font-fidel"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newChat}</span>
          </button>
        </div>

        {/* Search input (Amharic and English) */}
        <div className="px-3 pb-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              isDark
                ? 'bg-[#1F1D1A] border-[#423D37] focus-within:border-[#8B7E66]'
                : 'bg-[#F4F1EA] border-[#D9D4C7] focus-within:border-[#8B7E66]'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-[#8B7E66] shrink-0" />
            <input
              id="input-history-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchHistory}
              className="w-full bg-transparent outline-none font-fidel text-xs placeholder:text-[#8B7E66]/60"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}>
                <X className="w-3 h-3 text-[#8B7E66]" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-3 pb-2 flex items-center gap-1 text-[11px] overflow-x-auto no-scrollbar">
          {(['all', 'chat', 'image', 'document'] as const).map((cat) => {
            const labels = {
              all: t.allHistory,
              chat: t.chatHistory,
              image: t.imageHistory,
              document: t.docHistory,
            };
            const isSelected = filterCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-fidel ${
                  isSelected
                    ? isDark
                      ? 'bg-[#1F1D1A] text-[#F4F1EA] font-semibold border border-[#423D37]'
                      : 'bg-[#F4F1EA] text-[#2D2A26] font-semibold border border-[#D9D4C7] shadow-2xs'
                    : isDark
                    ? 'text-[#A89F91] hover:text-[#F4F1EA]'
                    : 'text-[#7A7265] hover:text-[#2D2A26]'
                }`}
              >
                {labels[cat]}
              </button>
            );
          })}
        </div>

        {/* List of Sessions */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-50 font-fidel">
              {t.noHistory}
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isActive = activeId === item.id;
              const dateStr = new Date(item.createdAt).toLocaleDateString(
                language === 'am' ? 'am-ET' : 'en-US',
                { month: 'short', day: 'numeric' }
              );

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectSession(item);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-[#1F1D1A] text-[#F4F1EA] border border-[#423D37] shadow-xs'
                        : 'bg-[#F4F1EA] text-[#2D2A26] border border-[#D9D4C7] shadow-xs'
                      : isDark
                      ? 'hover:bg-[#38332E] text-[#C4BCB0] hover:text-white'
                      : 'hover:bg-[#E3DFD5] text-[#2D2A26]/80 hover:text-[#2D2A26]'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0 pr-6">
                    <div className="mt-0.5 shrink-0">{getIcon(item.category)}</div>
                    <div className="min-w-0">
                      <p className="font-fidel font-medium truncate leading-relaxed">
                        {getDisplayTitle(item)}
                      </p>
                      <span className="text-[10px] opacity-50 block mt-0.5">
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  {/* Delete Item Button */}
                  <button
                    onClick={(e) => onDeleteSession(item.id, e)}
                    title={language === 'am' ? 'ሰርዝ' : 'Delete'}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-600 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Subscription Tier Card */}
        <div className="p-3 border-t border-inherit">
          <div
            onClick={() => {
              onOpenPricing();
              if (window.innerWidth < 1024) onClose();
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              currentTier === 'premium'
                ? 'bg-gradient-to-r from-[#8B7E66]/20 to-[#8B7E66]/5 border-[#8B7E66] hover:border-[#8B7E66]'
                : 'bg-white/40 dark:bg-black/20 border-inherit hover:border-[#8B7E66]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                {currentTier === 'premium' ? (
                  <div className="w-5 h-5 rounded-md bg-[#8B7E66] text-white flex items-center justify-center shadow-2xs">
                    <Crown className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-md bg-stone-300 dark:bg-stone-700 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-[#8B7E66]" />
                  </div>
                )}
                <span className="font-bold text-xs font-fidel">
                  {currentTier === 'premium'
                    ? language === 'am'
                      ? 'ፕሪሚየም ፕሮ'
                      : 'Premium Pro'
                    : language === 'am'
                    ? 'ነፃ እቅድ'
                    : 'Free Plan'}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold font-fidel bg-[#8B7E66] text-white">
                {currentTier === 'premium'
                  ? language === 'am'
                    ? 'የነቃ'
                    : 'Active'
                  : language === 'am'
                  ? 'አሻሽል'
                  : 'Upgrade'}
              </span>
            </div>

            <p className="text-[11px] opacity-70 font-fidel leading-snug">
              {currentTier === 'premium'
                ? language === 'am'
                  ? 'ያልተገደበ ፍጥነት፣ 4K ምስሎች እና ጥልቅ OCR'
                  : 'Unlimited speed, 4K images & deep OCR'
                : language === 'am'
                ? 'በቀን 50 መልእክቶች እና 5 ምስሎች'
                : '50 messages & 5 images per day'}
            </p>
          </div>
        </div>

        {/* Footer: Clear All & Branding Profile */}
        <div className="p-3 border-t border-inherit space-y-2">
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs opacity-60 hover:opacity-100 hover:text-red-600 transition-colors font-fidel"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearAll}</span>
            </button>
          )}
          <div className="pt-2 flex items-center justify-between opacity-80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#D9D4C7] dark:bg-[#423D37] flex items-center justify-center text-[10px] font-bold text-[#2D2A26] dark:text-[#F4F1EA]">
                ኢ
              </div>
              <span className="text-xs font-semibold">Ethio AI</span>
            </div>
            <span className="text-[10px] opacity-50 font-mono">v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
