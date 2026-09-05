import React, { useState } from 'react';
import { Language, UserTier } from '../types';
import { translations } from '../locales/translations';
import { recordPaymentSubmission, recordAction } from '../utils/analytics';
import {
  Crown,
  Check,
  Sparkles,
  X,
  Zap,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Copy,
  PhoneCall,
  AlertCircle,
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: 'light' | 'dark';
  currentTier: UserTier;
  onSelectTier: (tier: UserTier) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  language,
  theme,
  currentTier,
  onSelectTier,
}) => {
  const recipientPhone = '0998888635';

  const [senderPhone, setSenderPhone] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const t = translations[language];
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(recipientPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleUpgradeClick = () => {
    recordAction('upgrade');
    setShowPaymentStep(true);
    setPaymentError(null);
  };

  const handleConfirmPayment = () => {
    if (!transactionCode.trim() && !senderPhone.trim()) {
      setPaymentError(
        language === 'am'
          ? 'እባክዎ 299 ብር ከላኩ በኋላ ከቴሌብር ወይም ባንክ የደረሰዎትን የትራንዛክሽን ቁጥር ወይም የከፈሉበትን ስልክ ያስገቡ'
          : 'Please enter the Transaction Reference ID or your sender phone number after transferring 299 ETB'
      );
      return;
    }

    // Record submission into owner's admin log
    recordPaymentSubmission({
      transactionCode: transactionCode.trim(),
      senderPhone: senderPhone.trim(),
      amount: '299 ETB',
      tier: 'Premium',
    });

    setPaymentError(null);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSelectTier('premium');
      setShowPaymentStep(false);
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
      }, 4500);
    }, 1200);
  };

  const handleDowngrade = () => {
    if (
      confirm(
        language === 'am'
          ? 'እርግጠኛ ነዎት ወደ ነፃ እቅድ መመለስ ይፈልጋሉ?'
          : 'Are you sure you want to switch back to the Free plan?'
      )
    ) {
      onSelectTier('free');
      setShowPaymentStep(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
      <div
        className={`relative max-w-[390px] md:max-w-3xl lg:max-w-4xl w-full my-auto rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#2B2723] border-[#423D37] text-[#F4F1EA]'
            : 'bg-[#F4F1EA] border-[#D9D4C7] text-[#2D2A26]'
        }`}
      >
        {/* Success Toast */}
        {successToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-600 text-white font-fidel text-xs font-bold flex items-center gap-2 shadow-xl animate-bounce whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {language === 'am'
                ? 'ክፍያዎ ተረጋግጧል! እንኳን ወደ ፕሪሚየም በደህና መጡ!'
                : 'Payment confirmed! Welcome to Ethio AI Premium!'}
            </span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-inherit flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#8B7E66] text-white flex items-center justify-center shadow-2xs">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold font-fidel leading-tight">
                {language === 'am' ? 'የአገልግሎት እቅዶች እና ፕሪሚየም' : 'Plans & Premium Upgrade'}
              </h2>
              <span className="text-[10px] sm:text-xs opacity-75 font-fidel block mt-0.5">
                {language === 'am'
                  ? 'ፕሪሚየም ለማግኘት 299 ብር ወደ 0998888635 ይላኩ'
                  : 'Send 299 ETB to 0998888635 to activate Premium'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 sm:p-2 rounded-xl opacity-70 hover:opacity-100 hover:text-[#8B7E66] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-3 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 max-h-[75vh] md:max-h-[80vh] overflow-y-auto">
          {/* FREE PLAN */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              currentTier === 'free'
                ? 'border-[#8B7E66] bg-white/60 dark:bg-[#1F1D1A]/60 shadow-sm ring-1 ring-[#8B7E66]/30'
                : 'border-inherit bg-white/30 dark:bg-black/10'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-fidel bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  {t.tierFree}
                </span>
                {currentTier === 'free' && (
                  <span className="text-[11px] font-bold text-[#8B7E66] font-fidel flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {t.activePlanBadge}
                  </span>
                )}
              </div>

              <div className="my-2.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-fidel">0 ብር</span>
                  <span className="text-xs opacity-60 font-fidel">/ {t.freePeriod}</span>
                </div>
                <p className="text-xs opacity-75 font-fidel mt-1 leading-relaxed">
                  {t.freeDesc}
                </p>
              </div>

              <div className="py-2.5 border-t border-inherit/40 space-y-2">
                {t.freeFeatures.slice(0, 4).map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-fidel opacity-85">
                    <div className="w-3.5 h-3.5 rounded-full bg-stone-300/40 dark:bg-stone-700/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-stone-600 dark:text-stone-300" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-inherit/40">
              {currentTier === 'free' ? (
                <div className="w-full py-2 rounded-xl border border-inherit text-xs font-bold font-fidel opacity-70 text-center flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#8B7E66]" />
                  <span>{t.currentPlan}</span>
                </div>
              ) : (
                <button
                  onClick={handleDowngrade}
                  className="w-full py-2 rounded-xl border border-inherit hover:border-red-500 text-xs font-bold font-fidel opacity-70 hover:opacity-100 hover:text-red-500 transition-colors"
                >
                  {t.switchToFree}
                </button>
              )}
            </div>
          </div>

          {/* PREMIUM PLAN (299 ብር) */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
              currentTier === 'premium'
                ? 'border-[#8B7E66] bg-gradient-to-b from-[#8B7E66]/15 to-transparent shadow-md ring-2 ring-[#8B7E66]'
                : 'border-[#8B7E66] bg-white dark:bg-[#1F1D1A] shadow-sm'
            }`}
          >
            {/* Ribbon */}
            <div className="absolute top-0 right-0 bg-[#8B7E66] text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold font-fidel shadow-2xs">
              {t.popularBadge}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-fidel bg-[#8B7E66] text-white flex items-center gap-1 shadow-2xs">
                  <Crown className="w-3 h-3" />
                  {t.tierPremium}
                </span>
                {currentTier === 'premium' && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-fidel flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {t.activePlanBadge}
                  </span>
                )}
              </div>

              <div className="my-2.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold font-fidel text-[#8B7E66]">
                    299 ብር
                  </span>
                  <span className="text-xs opacity-70 font-fidel">/ በወር</span>
                </div>
                <p className="text-xs opacity-75 font-fidel mt-1 leading-relaxed">
                  {language === 'am'
                    ? 'ያልተገደበ ፍጥነት፣ 4K ባህላዊ ምስሎች እና የጥልቅ ሰነድ OCR አገልግሎት።'
                    : 'Unlimited speed, 4K cultural images, and deep document OCR.'}
                </p>
              </div>

              <div className="py-2.5 border-t border-inherit/40 space-y-2">
                {t.premiumFeatures.slice(0, 4).map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-fidel font-medium">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#8B7E66]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-[#8B7E66]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-inherit/40">
              {currentTier === 'premium' ? (
                <div className="w-full py-2 rounded-xl bg-[#8B7E66] text-white text-xs font-bold font-fidel flex items-center justify-center gap-1.5 shadow-2xs">
                  <Crown className="w-3.5 h-3.5" />
                  <span>{language === 'am' ? 'የፕሪሚየም አባል ኖት' : 'Active Premium Member'}</span>
                </div>
              ) : (
                <button
                  onClick={handleUpgradeClick}
                  className="w-full py-2.5 rounded-xl bg-[#8B7E66] hover:bg-[#7A6E57] text-white text-xs font-bold font-fidel transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'am' ? 'በ 299 ብር ፕሪሚየም ያግኙ' : 'Get Premium for 299 ETB'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade Payment Panel (Send 299 ETB to 0998888635) */}
        {showPaymentStep && currentTier !== 'premium' && (
          <div className="p-4 sm:p-6 border-t border-inherit bg-white/70 dark:bg-black/30 animate-fade-in space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#8B7E66]" />
                <h4 className="text-xs sm:text-sm font-bold font-fidel">
                  {language === 'am'
                    ? 'ክፍያ መላኪያ መረጃ (ቴሌብር / CBE Birr)'
                    : 'Payment Transfer Details (Telebirr / CBE Birr)'}
                </h4>
              </div>
              <span className="text-xs font-bold text-[#8B7E66] font-fidel bg-[#8B7E66]/10 px-2.5 py-1 rounded-full">
                299 ብር / በወር
              </span>
            </div>

            {/* Direct Number Box */}
            <div className="p-4 rounded-xl border border-[#8B7E66] bg-[#F4F1EA] dark:bg-[#25221E] space-y-3 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-[11px] opacity-70 font-fidel block">
                    {language === 'am' ? '299 ብር የሚላክበት ስልክ ቁጥር:' : 'Send 299 ETB to this number:'}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xl sm:text-2xl font-extrabold tracking-wider text-[#8B7E66]">
                      {recipientPhone}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="px-2.5 py-1 rounded-lg text-xs font-fidel font-bold transition-all border border-[#8B7E66] bg-white dark:bg-black/30 hover:bg-[#8B7E66] hover:text-white flex items-center gap-1 shadow-2xs"
                    >
                      {copiedPhone ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {language === 'am' ? 'ተቀድቷል!' : 'Copied!'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{language === 'am' ? 'ቁጥሩን ቅዳ' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`tel:${recipientPhone}`}
                      className="p-1.5 rounded-lg border border-[#8B7E66]/40 hover:bg-[#8B7E66] hover:text-white transition-colors"
                      title={language === 'am' ? 'ደውል' : 'Call'}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-[11px] opacity-70 font-fidel mt-1">
                    {language === 'am'
                      ? 'የመለያ አይነት: ቴሌብር (Telebirr) ወይም CBE Birr'
                      : 'Account Type: Telebirr or CBE Birr'}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] opacity-60 font-fidel block">
                    {language === 'am' ? 'የሚላከው መጠን:' : 'Amount to send:'}
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-[#8B7E66] font-mono">
                    299 ብር
                  </span>
                </div>
              </div>

              {/* Steps */}
              <div className="text-xs opacity-85 font-fidel space-y-1.5 bg-white/60 dark:bg-black/20 p-3 rounded-lg border border-inherit/40 leading-relaxed">
                <p>
                  <strong>1. </strong>
                  {language === 'am'
                    ? `በቴሌብር (Telebirr App ወይም *127#) ወይም በ CBE Bir (*847#) 299 ብር ወደ ${recipientPhone} ይላኩ።`
                    : `Send 299 ETB to ${recipientPhone} via Telebirr (App / *127#) or CBE Birr (*847#).`}
                </p>
                <p>
                  <strong>2. </strong>
                  {language === 'am'
                    ? 'ብር ከላኩ በኋላ ከቴሌብር ወይም ባንክ በSMS የደረሰዎትን የማረጋገጫ ቁጥር (Transaction ID) ከታች ያስገቡ።'
                    : 'After sending, enter your SMS Transaction Reference ID or sender phone number below.'}
                </p>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                <div>
                  <label className="block text-[11px] font-bold font-fidel mb-1">
                    {language === 'am'
                      ? 'የትራንዛክሽን ማረጋገጫ ቁጥር (Transaction ID) *'
                      : 'Transaction Reference ID *'}
                  </label>
                  <input
                    type="text"
                    value={transactionCode}
                    onChange={(e) => {
                      setTransactionCode(e.target.value);
                      if (paymentError) setPaymentError(null);
                    }}
                    placeholder={language === 'am' ? 'ምሳሌ፡ FT24... ወይም የቴሌብር ኮድ' : 'e.g., FT2489... or Telebirr code'}
                    className="w-full px-3 py-2 rounded-lg border border-inherit bg-white dark:bg-black/40 font-mono text-xs outline-none focus:border-[#8B7E66]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold font-fidel mb-1">
                    {language === 'am' ? 'የከፈሉበት ስልክ ቁጥር (Sender Phone)' : 'Your Sender Phone'}
                  </label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => {
                      setSenderPhone(e.target.value);
                      if (paymentError) setPaymentError(null);
                    }}
                    placeholder="09... or 07..."
                    className="w-full px-3 py-2 rounded-lg border border-inherit bg-white dark:bg-black/40 font-mono text-xs outline-none focus:border-[#8B7E66]"
                  />
                </div>
              </div>

              {/* Error Message */}
              {paymentError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-fidel flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPaymentStep(false)}
                className="px-4 py-2 rounded-xl border border-inherit text-xs font-fidel opacity-70 hover:opacity-100 transition-colors"
              >
                {language === 'am' ? 'ተመለስ' : 'Back'}
              </button>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-[#8B7E66] hover:bg-[#7A6E57] text-white text-xs font-bold font-fidel transition-all flex items-center gap-2 shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>{language === 'am' ? 'እየተረጋገጠ ነው...' : 'Verifying...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {language === 'am'
                        ? '299 ብር ልኬያለሁ ፕሪሚየም አንቃ'
                        : 'I Sent 299 ETB — Activate Premium'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3.5 border-t border-inherit flex flex-wrap items-center justify-between gap-2 text-[11px] opacity-70 font-fidel bg-inherit/20">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#8B7E66]" />
            <span>
              {language === 'am'
                ? 'እርዳታ ካስፈለገዎት ወደ 0998888635 ይደውሉ'
                : 'Need assistance? Call 0998888635'}
            </span>
          </div>

          <div className="font-mono text-[10px]">
            Ethio AI • 299 ETB / Month
          </div>
        </div>
      </div>
    </div>
  );
};
