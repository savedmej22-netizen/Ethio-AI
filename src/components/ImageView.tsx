import React, { useState } from 'react';
import { ImageStylePreset, GeneratedImageItem, Language, UserTier } from '../types';
import { translations } from '../locales/translations';
import { BreathingLoader } from './BreathingLoader';
import {
  Sparkles,
  Download,
  Maximize2,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  Globe,
  Info,
  Crown,
} from 'lucide-react';

interface ImageViewProps {
  language: Language;
  theme: 'light' | 'dark';
  onSaveToHistory: (
    promptAm: string,
    promptEn: string,
    style: ImageStylePreset,
    images: GeneratedImageItem[]
  ) => void;
  currentTier?: UserTier;
  onOpenPricing?: () => void;
}

export const ImageView: React.FC<ImageViewProps> = ({
  language,
  theme,
  onSaveToHistory,
  currentTier = 'free',
  onOpenPricing,
}) => {
  const [prompt, setPrompt] = useState('');
  const [stylePreset, setStylePreset] = useState<ImageStylePreset>('ethiopian_cultural');
  const [variationCount, setVariationCount] = useState<number>(2);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageItem[]>([]);
  const [translationData, setTranslationData] = useState<{
    translatedPrompt: string;
    culturalNotesAm: string;
    culturalNotesEn: string;
  } | null>(null);
  const [showCulturalPreview, setShowCulturalPreview] = useState(true);
  const [zoomImage, setZoomImage] = useState<GeneratedImageItem | null>(null);

  const t = translations[language];
  const isDark = theme === 'dark';

  const styleOptions: Array<{ id: ImageStylePreset; label: string; icon: string }> = [
    { id: 'ethiopian_cultural', label: t.presets.ethiopian_cultural, icon: '🇪🇹' },
    { id: 'traditional_art', label: t.presets.traditional_art, icon: '📜' },
    { id: 'realistic', label: t.presets.realistic, icon: '📸' },
    { id: 'illustration', label: t.presets.illustration, icon: '🎨' },
    { id: 'anime', label: t.presets.anime, icon: '✨' },
    { id: '3d_render', label: t.presets['3d_render'], icon: '🧊' },
  ];

  const suggestedPrompts = [
    {
      am: 'በቡና አፈላል ስነ-ስርዓት ወቅት በባህላዊ የሀበሻ ጥበብ ቀሚስ ያጌጠች ወጣት ኢትዮጵያዊት',
      en: 'Young Ethiopian woman in elegant traditional Habesha kemis with gold tibeb embroidery during a serene coffee ceremony with clay jebena and smoke',
    },
    {
      am: 'ጥንታዊቷ የላሊበላ ቤተ ጊዮርጊስ በንጋት ፀሐይ ወርቃማ ብርሃን ታጥባ',
      en: 'Ancient Lalibela Bete Giyorgis rock-hewn monolithic church bathed in golden sunrise rays with morning mountain mist',
    },
    {
      am: 'የስሜን ተራሮች ግርማ ሞገስ እና የጭላዳ ዝንጀሮዎች በሰንሰለታማ ገደሎች ላይ',
      en: 'Majestic Simien Mountains peaks with endemic Gelada baboon troop overlooking deep African rift escarpments',
    },
    {
      am: 'የአክሱም ሐውልት በምሽት ከዋክብት እና በጥንታዊ የግዕዝ ጽሑፎች ተከብቦ',
      en: 'Ancient Axum Obelisk under a starry night sky with glowing mystical Ge\'ez fidel scripts floating softly',
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      // Step 1: Translate and culturally enhance Amharic prompt
      const translateRes = await fetch('/api/image/translate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          stylePreset,
        }),
      });

      const transData = await translateRes.json();
      setTranslationData(transData);

      // Step 2: Request Image Generation
      const genRes = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          englishPrompt: transData.translatedPrompt,
          stylePreset,
          count: variationCount,
          aspectRatio,
        }),
      });

      const data = await genRes.json();
      if (data.images && data.images.length > 0) {
        const formatted: GeneratedImageItem[] = data.images.map((img: any) => ({
          id: img.id,
          url: img.url,
          promptAm: prompt.trim(),
          promptEn: transData.translatedPrompt || prompt.trim(),
          style: stylePreset,
          timestamp: Date.now(),
          aspectRatio,
        }));

        setGeneratedImages(formatted);
        onSaveToHistory(prompt.trim(), transData.translatedPrompt, stylePreset, formatted);
      }
    } catch (err) {
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download with custom Amharic file naming
  const handleDownload = (img: GeneratedImageItem, index: number) => {
    const link = document.createElement('a');
    link.href = img.url;
    // Amharic file naming e.g. ኢትዮ_ኤአይ_ምስል_1.png or ethio_ai_image_1.png
    const sanitizedAmharic = prompt
      .trim()
      .slice(0, 15)
      .replace(/[\s\/:*?"<>|]/g, '_');
    const amharicFileName = `ኢትዮ_ኤአይ_${sanitizedAmharic || 'ምስል'}_${index + 1}.png`;
    link.download = amharicFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Remix: Load prompt and style back into workspace
  const handleRemix = (img: GeneratedImageItem) => {
    setPrompt(img.promptAm);
    setStylePreset(img.style);
    setZoomImage(null);
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full px-2 sm:px-6 lg:px-8 py-3 sm:py-6 overflow-y-auto">
      {/* Header Info */}
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
        <div>
          <h1 className="text-base sm:text-xl font-bold font-fidel tracking-tight">
            {t.imageTitle}
          </h1>
          <p className="text-[11px] sm:text-sm text-[#78716C] font-fidel">
            {t.imageSubtitle}
          </p>
        </div>

        {/* Tier status indicator */}
        <div className="flex items-center gap-2">
          {currentTier === 'premium' ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#8B7E66]/15 border border-[#8B7E66] text-[#8B7E66] dark:text-[#E8DFC8] text-[11px] sm:text-xs font-fidel font-bold">
              <Crown className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-500" />
              <span>{language === 'am' ? 'ፕሪሚየም 4K Ultra-HD ነቅቷል' : 'Premium 4K Ultra-HD Active'}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/70 dark:bg-black/30 border border-[#D9D4C7] dark:border-[#423D37] text-[11px] sm:text-xs font-fidel">
              <span className="opacity-75">{language === 'am' ? 'ነፃ እቅድ (5 ምስሎች/ቀን)' : 'Free Plan (5 img/day)'}</span>
              {onOpenPricing && (
                <button
                  onClick={onOpenPricing}
                  className="font-bold text-[#8B7E66] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{language === 'am' ? 'አሻሽል' : 'Upgrade'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input & Controls Box */}
      <div
        className={`p-3 sm:p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#2B2723] border-[#423D37]' : 'bg-white border-[#D9D4C7]'
        } shadow-sm mb-4 sm:mb-5`}
      >
        {/* Text Input */}
        <div className="relative mb-3">
          <textarea
            id="image-prompt-input"
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.imageInputPlaceholder}
            className="w-full p-3 text-xs sm:text-sm font-fidel bg-transparent border border-inherit rounded-xl outline-none focus:border-[#8B7E66] transition-colors resize-none placeholder:opacity-50"
          />
        </div>

        {/* Quick Suggested Prompts Pills */}
        <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          <span className="opacity-60 font-fidel shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#8B7E66]" />
            {language === 'am' ? 'የተመረጡ ሐሳቦች:' : 'Sample Ideas:'}
          </span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(language === 'am' ? p.am : p.en)}
              className={`px-3 py-1 rounded-full border transition-all shrink-0 font-fidel ${
                isDark
                  ? 'border-[#423D37] bg-[#1F1D1A] hover:border-[#8B7E66] text-[#F4F1EA]'
                  : 'border-[#D9D4C7] bg-[#F4F1EA] hover:border-[#8B7E66] text-[#2D2A26]'
              }`}
            >
              {p.am.slice(0, 24)}...
            </button>
          ))}
        </div>

        {/* Controls: Style, Variations, Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Style Preset Selector */}
          <div>
            <label className="block text-[11px] font-bold opacity-75 mb-1 font-fidel">
              {t.stylePreset}
            </label>
            <select
              value={stylePreset}
              onChange={(e) => setStylePreset(e.target.value as ImageStylePreset)}
              className={`w-full p-2 text-xs font-fidel rounded-xl border outline-none transition-colors ${
                isDark
                  ? 'bg-[#1F1D1A] border-[#423D37] text-[#F4F1EA] focus:border-[#8B7E66]'
                  : 'bg-[#F4F1EA] border-[#D9D4C7] text-[#2D2A26] focus:border-[#8B7E66]'
              }`}
            >
              {styleOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Variations Count Selector */}
          <div>
            <label className="block text-[11px] font-bold opacity-75 mb-1 font-fidel">
              {t.variations}
            </label>
            <div className="flex items-center gap-1">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setVariationCount(count)}
                  className={`flex-1 py-1.5 text-xs font-fidel rounded-lg border transition-colors ${
                    variationCount === count
                      ? 'bg-[#8B7E66] text-white border-[#8B7E66] font-bold shadow-2xs'
                      : isDark
                      ? 'bg-[#1F1D1A] border-[#423D37] text-[#A89F91]'
                      : 'bg-[#F4F1EA] border-[#D9D4C7] text-[#7A7265]'
                  }`}
                >
                  {count} {language === 'am' ? 'ምስሎች' : 'Vars'}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-[11px] font-bold opacity-75 mb-1 font-fidel">
              {t.aspectRatio}
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as any)}
              className={`w-full p-2 text-xs font-fidel rounded-xl border outline-none transition-colors ${
                isDark
                  ? 'bg-[#1F1D1A] border-[#423D37] text-[#F4F1EA] focus:border-[#8B7E66]'
                  : 'bg-[#F4F1EA] border-[#D9D4C7] text-[#2D2A26] focus:border-[#8B7E66]'
              }`}
            >
              <option value="1:1">1:1 (Square / ካሬ)</option>
              <option value="16:9">16:9 (Landscape / አግድም)</option>
              <option value="9:16">9:16 (Portrait / ቁመት)</option>
              <option value="4:3">4:3 (Standard)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] opacity-60 font-fidel hidden sm:flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#8B7E66]" />
            <span>
              {language === 'am'
                ? 'የአማርኛ ቃላት ወደ እንግሊዝኛ ምስል ሞዴል በባህላዊ ማብራሪያ ተርጉሞ ይዘጋጃል።'
                : 'Amharic concepts are culturally interpreted before image synthesis.'}
            </span>
          </div>

          <button
            id="btn-generate-image"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm font-fidel transition-all flex items-center gap-2 ${
              prompt.trim() && !isGenerating
                ? 'bg-[#8B7E66] hover:bg-[#7A6E57] text-white shadow-sm'
                : 'bg-[#D9D4C7]/50 text-[#2D2A26]/40 dark:bg-[#423D37] dark:text-[#A89F91]/40 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? t.generating : t.generateButton}</span>
          </button>
        </div>
      </div>

      {/* Amharic Cultural Translation Layer Card */}
      {translationData && (
        <div
          className={`p-4 rounded-xl border mb-5 transition-all ${
            isDark ? 'bg-[#2B2723] border-[#423D37]' : 'bg-[#EBE7DF] border-[#D9D4C7]'
          }`}
        >
          <div
            onClick={() => setShowCulturalPreview(!showCulturalPreview)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#8B7E66]" />
              <span className="text-xs font-bold font-fidel text-[#8B7E66] dark:text-[#D9D4C7]">
                {t.translationPreviewTitle}
              </span>
            </div>
            {showCulturalPreview ? (
              <ChevronUp className="w-4 h-4 opacity-60" />
            ) : (
              <ChevronDown className="w-4 h-4 opacity-60" />
            )}
          </div>

          {showCulturalPreview && (
            <div className="mt-3 space-y-2 text-xs font-fidel border-t border-inherit/40 pt-2">
              <div>
                <span className="opacity-70 font-medium">
                  {language === 'am' ? 'የተተረጎመ ዝርዝር መግለጫ (Prompt): ' : 'Enhanced Prompt: '}
                </span>
                <p className="mt-0.5 italic opacity-90">
                  "{translationData.translatedPrompt}"
                </p>
              </div>
              <div className="flex items-start gap-2 text-[11px] opacity-75">
                <span className="font-bold text-[#8B7E66]">
                  {language === 'am' ? 'የባህል ማስታወሻ:' : 'Cultural Notes:'}
                </span>
                <span>
                  {language === 'am'
                    ? translationData.culturalNotesAm
                    : translationData.culturalNotesEn}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {isGenerating && (
        <div className="py-12 flex flex-col items-center justify-center">
          <BreathingLoader text={t.generating} size="lg" />
          <p className="text-xs opacity-50 font-fidel mt-2">
            {language === 'am'
              ? 'የተመረጠውን የኢትዮጵያ ባህላዊ ቅጥ እና ዝርዝር ቀለማት እያዘጋጀን ነው...'
              : 'Synthesizing visual variations with authentic cultural motifs...'}
          </p>
        </div>
      )}

      {/* Generated Images Grid */}
      {generatedImages.length > 0 && !isGenerating && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-fidel">
              {language === 'am' ? 'የተፈጠሩ ምስሎች (Variations)' : 'Generated Variations'}
            </h2>
            <span className="text-xs opacity-60 font-fidel">
              {generatedImages.length} {language === 'am' ? 'ልዩነቶች' : 'variations'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {generatedImages.map((img, idx) => (
              <div
                key={img.id}
                className={`group relative rounded-2xl overflow-hidden border transition-all ${
                  isDark ? 'bg-[#2B2723] border-[#423D37]' : 'bg-white border-[#D9D4C7]'
                } shadow-sm hover:shadow-md`}
              >
                {/* Image Display */}
                <div
                  className="w-full aspect-square bg-[#1F1D1A] flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => setZoomImage(img)}
                >
                  <img
                    src={img.url}
                    alt={img.promptAm}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Caption & Actions */}
                <div className="p-3 flex items-center justify-between border-t border-inherit">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold font-fidel truncate leading-relaxed">
                      {img.promptAm}
                    </p>
                    <span className="text-[10px] opacity-60 font-fidel">
                      {img.style} • {img.aspectRatio}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setZoomImage(img)}
                      title={t.upscale}
                      className="p-1.5 rounded-lg border border-inherit opacity-70 hover:opacity-100 hover:text-[#8B7E66] transition-colors"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleRemix(img)}
                      title={t.remix}
                      className="p-1.5 rounded-lg border border-inherit opacity-70 hover:opacity-100 hover:text-[#8B7E66] transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDownload(img, idx)}
                      title={t.downloadAmharic}
                      className="p-1.5 rounded-lg bg-[#8B7E66] hover:bg-[#7A6E57] text-white transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High-res Zoom Modal */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-3 border-b border-[#27272A] flex items-center justify-between">
              <span className="text-xs font-medium text-[#FAFAFA] font-fidel truncate pr-4">
                {zoomImage.promptAm}
              </span>
              <button
                onClick={() => setZoomImage(null)}
                className="p-1 text-[#A1A1AA] hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="w-full max-h-[70vh] flex items-center justify-center bg-black overflow-hidden p-2">
              <img
                src={zoomImage.url}
                alt={zoomImage.promptAm}
                className="max-h-[68vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#27272A] flex items-center justify-between text-xs font-fidel">
              <span className="text-[#A1A1AA] text-[11px]">
                {zoomImage.promptEn.slice(0, 60)}...
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRemix(zoomImage)}
                  className="px-3 py-1.5 rounded-lg border border-[#3F3F46] text-[#FAFAFA] hover:bg-[#27272A] transition-colors flex items-center gap-1.5 text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.remix}</span>
                </button>
                <button
                  onClick={() => handleDownload(zoomImage, 0)}
                  className="px-3 py-1.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.downloadAmharic}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
