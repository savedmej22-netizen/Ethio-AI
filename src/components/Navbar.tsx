import React from 'react';
import { AppMode, Language, UserTier } from '../types';
import { translations } from '../locales/translations';
import { MessageSquare, Image as ImageIcon, FileText, Sun, Moon, Settings, Menu, Crown, Sparkles, BarChart3 } from 'lucide-react';

interface NavbarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  currentTier: UserTier;
  onOpenPricing: () => void;
  onOpenAnalytics?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  onOpenSettings,
  onToggleSidebar,
  currentTier,
  onOpenPricing,
  onOpenAnalytics,
}) => {
  const t = translations[language];

  const modes: Array<{ id: AppMode; label: string; icon: React.ReactNode }> = [
    { id: 'chat', label: t.navChat, icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'image', label: t.navImage, icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'document', label: t.navDocument, icon: <FileText className="w-4 h-4" /> },
  ];

  const isDark = theme === 'dark';

  return (
    <header
      id="app-header"
      className={`sticky top-0 z-30 w-full border-b transition-colors duration-200 shrink-0 ${
        isDark
          ? 'bg-[#1F1D1A]/95 border-[#423D37] text-[#F4F1EA]'
          : 'bg-[#F4F1EA]/95 border-[#D9D4C7] text-[#2D2A26]'
      } backdrop-blur-md`}
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-12 lg:h-14 flex items-center justify-between gap-2">
        {/* Left: Sidebar Toggle + Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            aria-label="Toggle history sidebar"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 ${
              isDark
                ? 'hover:bg-[#2B2723] text-[#A89F91]'
                : 'hover:bg-[#EBE7DF] text-[#7A7265]'
            }`}
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div
            onClick={() => onSelectMode('chat')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#8B7E66] rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-2xs transition-transform group-hover:scale-105 shrink-0">
              <span className="font-fidel">ኢ</span>
            </div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-bold text-sm sm:text-base tracking-tight font-sans-ui whitespace-nowrap">Ethio AI</span>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-[#EBE7DF] border border-[#D9D4C7] dark:bg-[#2B2723] dark:border-[#423D37] text-[#8B7E66] dark:text-[#B0A48A] font-semibold font-fidel shrink-0">
                ኢትዮ
              </span>
            </div>
          </div>
        </div>

        {/* Center: Mode Selector Pills (Desktop 1024-1440px+ only, mobile has sleek bottom nav) */}
        <nav
          id="mode-nav"
          className={`hidden lg:flex items-center p-1 rounded-full border shrink-0 ${
            isDark ? 'bg-[#2B2723] border-[#423D37]' : 'bg-[#EBE7DF] border-[#D9D4C7]'
          }`}
        >
          {modes.map((m) => {
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                id={`nav-btn-${m.id}`}
                onClick={() => onSelectMode(m.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? isDark
                      ? 'bg-[#1F1D1A] text-[#F4F1EA] shadow-sm font-bold'
                      : 'bg-[#F4F1EA] text-[#2D2A26] shadow-sm font-bold'
                    : isDark
                    ? 'text-[#A89F91] hover:text-[#F4F1EA]'
                    : 'text-[#7A7265] hover:text-[#2D2A26]'
                }`}
              >
                {m.icon}
                <span className="font-fidel text-xs">{m.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Language toggle + Theme + Tier + Settings */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Prominent Bilingual Language Switcher */}
          <div
            id="lang-toggle-container"
            className={`flex items-center p-0.5 rounded-full border text-xs font-semibold shrink-0 ${
              isDark ? 'bg-[#2B2723] border-[#423D37]' : 'bg-[#EBE7DF] border-[#D9D4C7]'
            }`}
          >
            <button
              id="btn-lang-am"
              onClick={() => onToggleLanguage('am')}
              className={`px-2 sm:px-2.5 py-0.5 rounded-full transition-all font-fidel text-[10px] sm:text-xs ${
                language === 'am'
                  ? isDark
                    ? 'bg-[#1F1D1A] text-[#F4F1EA] font-bold shadow-sm'
                    : 'bg-[#F4F1EA] text-[#2D2A26] font-bold shadow-sm'
                  : isDark
                  ? 'text-[#A89F91] opacity-70 hover:opacity-100'
                  : 'text-[#7A7265] opacity-70 hover:opacity-100'
              }`}
              title="አማርኛ ይምረጡ"
            >
              አማ
            </button>
            <button
              id="btn-lang-en"
              onClick={() => onToggleLanguage('en')}
              className={`px-2 sm:px-2.5 py-0.5 rounded-full transition-all font-sans-ui text-[10px] sm:text-xs ${
                language === 'en'
                  ? isDark
                    ? 'bg-[#1F1D1A] text-[#F4F1EA] font-bold shadow-sm'
                    : 'bg-[#F4F1EA] text-[#2D2A26] font-bold shadow-sm'
                  : isDark
                  ? 'text-[#A89F91] opacity-70 hover:opacity-100'
                  : 'text-[#7A7265] opacity-70 hover:opacity-100'
              }`}
              title="Select English"
            >
              EN
            </button>
          </div>

          {/* Subscription Tier Badge / Upgrade Button */}
          <button
            id="btn-tier-toggle"
            onClick={onOpenPricing}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-fidel transition-all shadow-2xs shrink-0 ${
              currentTier === 'premium'
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-500 font-bold'
                : isDark
                ? 'bg-[#2B2723] hover:bg-[#38332E] border border-[#8B7E66]/60 text-[#F4F1EA]'
                : 'bg-white/80 hover:bg-white border border-[#8B7E66]/60 text-[#2D2A26]'
            }`}
            title={language === 'am' ? 'የአገልግሎት እቅድዎን ይመልከቱ' : 'View subscription plans'}
          >
            {currentTier === 'premium' ? (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline font-bold text-xs">{language === 'am' ? 'ፕሪሚየም' : 'Premium'}</span>
                <span className="text-[9px] px-1 py-0.2 rounded-full bg-amber-500 text-white font-mono font-bold">PRO</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#8B7E66]" />
                <span className="hidden sm:inline font-bold text-xs">{language === 'am' ? 'ነፃ' : 'Free'}</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-[#8B7E66] text-white font-bold">
                  {language === 'am' ? 'አሻሽል' : 'Upgrade'}
                </span>
              </>
            )}
          </button>

          {/* Visitor Analytics Button (Desktop) */}
          {onOpenAnalytics && (
            <button
              id="btn-analytics"
              onClick={onOpenAnalytics}
              aria-label="Visitor Analytics"
              className={`hidden md:flex p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 ${
                isDark
                  ? 'hover:bg-[#2B2723] text-[#A89F91]'
                  : 'hover:bg-[#EBE7DF] text-[#7A7265]'
              }`}
              title={language === 'am' ? 'የጎብኚዎች ስታቲስቲክስ' : 'Visitor Traffic & Analytics'}
            >
              <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          )}

          {/* Theme Switcher */}
          <button
            id="btn-theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 ${
              isDark
                ? 'hover:bg-[#2B2723] text-[#A89F91]'
                : 'hover:bg-[#EBE7DF] text-[#7A7265]'
            }`}
            title={theme === 'light' ? t.themeDark : t.themeLight}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#D5C29D]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Button */}
          <button
            id="btn-settings"
            onClick={onOpenSettings}
            aria-label="Open settings"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 ${
              isDark
                ? 'hover:bg-[#2B2723] text-[#A89F91]'
                : 'hover:bg-[#EBE7DF] text-[#7A7265]'
            }`}
            title={t.settings}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
