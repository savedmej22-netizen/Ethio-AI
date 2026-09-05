import React from 'react';
import { Language, UserTier } from '../types';
import { translations } from '../locales/translations';
import { X, Sparkles, Globe, Moon, Sun, Type, Mic, Info, Crown, CreditCard, BarChart3 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  fontSizeMode: 'normal' | 'relaxed' | 'large';
  onChangeFontSize: (size: 'normal' | 'relaxed' | 'large') => void;
  currentTier: UserTier;
  onOpenPricing: () => void;
  onOpenAnalytics?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  fontSizeMode,
  onChangeFontSize,
  currentTier,
  onOpenPricing,
  onOpenAnalytics,
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className={`relative max-w-[380px] sm:max-w-md md:max-w-lg w-full rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-[#2B2723] border-[#423D37] text-[#F4F1EA]' : 'bg-[#F4F1EA] border-[#D9D4C7] text-[#2D2A26]'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B7E66]" />
            <h3 className="font-bold text-sm font-fidel">
              {t.settings}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:text-[#8B7E66] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto font-fidel text-xs">
          {/* Primary Language */}
          <div className="flex items-center justify-between py-2 border-b border-inherit/40">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#8B7E66]" />
              <div>
                <p className="font-bold">
                  {language === 'am' ? 'ነባሪ ቋንቋ' : 'Default Language'}
                </p>
                <p className="text-[11px] opacity-70">
                  {language === 'am' ? 'የመተግበሪያውን ቋንቋ ይምረጡ' : 'Select UI display language'}
                </p>
              </div>
            </div>

            <div className="flex items-center p-0.5 rounded-lg border border-inherit bg-white/40 dark:bg-black/20">
              <button
                onClick={() => onToggleLanguage('am')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  language === 'am'
                    ? 'bg-[#8B7E66] text-white font-bold shadow-2xs'
                    : 'opacity-70'
                }`}
              >
                አማርኛ
              </button>
              <button
                onClick={() => onToggleLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-colors font-sans-ui ${
                  language === 'en'
                    ? 'bg-[#8B7E66] text-white font-bold shadow-2xs'
                    : 'opacity-70'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between py-2 border-b border-inherit/40">
            <div className="flex items-center gap-2">
              {isDark ? (
                <Moon className="w-4 h-4 text-[#8B7E66]" />
              ) : (
                <Sun className="w-4 h-4 text-[#8B7E66]" />
              )}
              <div>
                <p className="font-bold">{t.theme}</p>
                <p className="text-[11px] opacity-70">
                  {theme === 'light' ? t.themeLight : t.themeDark}
                </p>
              </div>
            </div>

            <button
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-lg border border-inherit text-xs font-semibold opacity-80 hover:opacity-100 hover:text-[#8B7E66] bg-white/40 dark:bg-black/20 transition-colors"
            >
              {theme === 'light' ? 'ወደ Dark Clay ቀይር' : 'ወደ Natural Tones ቀይር'}
            </button>
          </div>

          {/* Fidel Typography Scale */}
          <div className="flex items-center justify-between py-2 border-b border-inherit/40">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-[#8B7E66]" />
              <div>
                <p className="font-bold">{t.fontSize}</p>
                <p className="text-[11px] opacity-70">
                  {language === 'am' ? 'የፊደል አቀማመጥ እና ከፍታ' : 'Fidel line height & size'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {(['normal', 'relaxed', 'large'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeFontSize(s)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-fidel transition-colors ${
                    fontSizeMode === s
                      ? 'bg-[#8B7E66] text-white font-bold shadow-2xs'
                      : 'border border-inherit opacity-70 bg-white/40 dark:bg-black/20'
                  }`}
                >
                  {s === 'normal' ? 'መደበኛ' : s === 'relaxed' ? 'ሰፋ ያለ' : 'ትልቅ'}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Input Locale */}
          <div className="flex items-center justify-between py-2 border-b border-inherit/40">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#8B7E66]" />
              <div>
                <p className="font-bold">
                  {language === 'am' ? 'የድምጽ ቋንቋ' : 'Voice Input Locale'}
                </p>
                <p className="text-[11px] opacity-70">
                  am-ET (Amharic - Ethiopia)
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#EBE7DF] dark:bg-[#1F1D1A] text-[#8B7E66] dark:text-[#D9D4C7] font-bold text-[11px] border border-[#D9D4C7] dark:border-[#423D37]">
              am-ET
            </span>
          </div>

          {/* Subscription Tier (Free vs Premium) */}
          <div className="flex items-center justify-between py-2 border-b border-inherit/40">
            <div className="flex items-center gap-2">
              {currentTier === 'premium' ? (
                <Crown className="w-4 h-4 text-amber-500" />
              ) : (
                <CreditCard className="w-4 h-4 text-[#8B7E66]" />
              )}
              <div>
                <p className="font-bold">
                  {language === 'am' ? 'የአገልግሎት እቅድ' : 'Subscription Tier'}
                </p>
                <p className="text-[11px] opacity-70">
                  {currentTier === 'premium'
                    ? language === 'am'
                      ? 'ፕሪሚየም ፕሮ (ያልተገደበ)'
                      : 'Premium Pro (Unlimited)'
                    : language === 'am'
                    ? 'ነፃ እቅድ (50 መልእክቶች/ቀን)'
                    : 'Free Plan (50 msgs/day)'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenPricing();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-fidel transition-all flex items-center gap-1.5 shadow-2xs ${
                currentTier === 'premium'
                  ? 'border border-[#8B7E66] bg-white/40 dark:bg-black/20 text-[#8B7E66] hover:bg-[#8B7E66] hover:text-white'
                  : 'bg-[#8B7E66] hover:bg-[#7A6E57] text-white'
              }`}
            >
              {currentTier === 'premium' ? (
                <span>{language === 'am' ? 'እቅድ አስተዳድር' : 'Manage Plan'}</span>
              ) : (
                <>
                  <Crown className="w-3 h-3" />
                  <span>{language === 'am' ? 'ወደ ፕሪሚየም አሻሽል' : 'Upgrade to Pro'}</span>
                </>
              )}
            </button>
          </div>

          {/* Visitor Analytics & Traffic (Admin) */}
          {onOpenAnalytics && (
            <div className="flex items-center justify-between py-2 border-b border-inherit/40">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#8B7E66]" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold">
                      {language === 'am' ? 'የጎብኚዎች ስታቲስቲክስ' : 'Visitor Analytics & Traffic'}
                    </p>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#8B7E66]/20 text-[#8B7E66] font-mono font-bold">
                      Admin
                    </span>
                  </div>
                  <p className="text-[11px] opacity-70">
                    {language === 'am'
                      ? 'የገጽ እይታዎች፣ ጎብኚዎች እና የ299 ብር ክፍያዎች'
                      : 'Live visitors, devices & 299 ETB payment submissions'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenAnalytics();
                }}
                className="px-3 py-1.5 rounded-lg border border-[#8B7E66] bg-white/40 dark:bg-black/20 hover:bg-[#8B7E66] hover:text-white text-[#8B7E66] dark:text-[#D9D4C7] dark:hover:text-white text-xs font-bold font-fidel transition-all shadow-2xs flex items-center gap-1"
              >
                <BarChart3 className="w-3 h-3" />
                <span>{language === 'am' ? 'ስታቲስቲክስ ይመልከቱ' : 'View Traffic'}</span>
              </button>
            </div>
          )}

          {/* Platform & Model Info */}
          <div className="p-3.5 rounded-xl bg-[#EBE7DF] dark:bg-[#1F1D1A] border border-[#D9D4C7] dark:border-[#423D37] text-[11px] space-y-1.5 opacity-85">
            <div className="flex items-center gap-1.5 font-bold text-[#2D2A26] dark:text-[#F4F1EA]">
              <Info className="w-3.5 h-3.5 text-[#8B7E66]" />
              <span>
                {language === 'am' ? 'ስለ ኢትዮ ኤአይ ሞዴሎች' : 'About Ethio AI Architecture'}
              </span>
            </div>
            <p className="leading-relaxed opacity-80">
              {language === 'am'
                ? 'የኢትዮ ኤአይ ሲስተም የጌሚኒ 3 ተከታታይ የላቀ ቴክኖሎጂን በመጠቀም የአማርኛ ፊደል OCR፣ ስነ-ጽሑፍ እና የባህል ትርጉሞችን በቅድሚያ እንዲረዳ ተዋቅሯል።'
                : 'Ethio AI pairs state-of-the-art multimodal vision for Ethiopic OCR with few-shot prompt engineering for natural Amharic prose.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-inherit flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#8B7E66] hover:bg-[#7A6E57] text-white font-bold text-xs font-fidel transition-colors shadow-2xs"
          >
            {language === 'am' ? 'ተጠናቋል' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
