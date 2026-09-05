import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import {
  getAnalyticsSummary,
  saveGoogleAnalyticsId,
  AnalyticsSummary,
} from '../utils/analytics';
import {
  BarChart3,
  Users,
  Eye,
  Smartphone,
  Monitor,
  Share2,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Zap,
  Globe,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: 'light' | 'dark';
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  language,
  theme,
}) => {
  const [data, setData] = useState<AnalyticsSummary>(getAnalyticsSummary);
  const [gaInput, setGaInput] = useState('');
  const [gaMessage, setGaMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'googleAnalytics'>('overview');

  const isDark = theme === 'dark';

  const refreshData = () => {
    const summary = getAnalyticsSummary();
    setData(summary);
    setGaInput(summary.googleAnalyticsId);
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveGa = (e: React.FormEvent) => {
    e.preventDefault();
    setGaMessage(null);
    const trimmed = gaInput.trim().toUpperCase();

    if (trimmed && !trimmed.startsWith('G-')) {
      setGaMessage({
        text:
          language === 'am'
            ? 'የGoogle Analytics Measurement ID በ "G-" መጀመር አለበት (ምሳሌ: G-XXXXXXXXXX)'
            : 'Google Analytics Measurement ID must start with "G-" (e.g. G-XXXXXXXXXX)',
        type: 'error',
      });
      return;
    }

    const success = saveGoogleAnalyticsId(trimmed);
    if (success) {
      setGaMessage({
        text: trimmed
          ? language === 'am'
            ? 'Google Analytics በተሳካ ሁኔታ ተገናኝቷል!'
            : 'Google Analytics successfully connected!'
          : language === 'am'
          ? 'Google Analytics ID ተሰርዟል'
          : 'Google Analytics ID removed',
        type: 'success',
      });
      refreshData();
      setTimeout(() => setGaMessage(null), 3500);
    }
  };

  // Calculations
  const totalDevs = (data.devices.mobile || 0) + (data.devices.desktop || 0) + (data.devices.tablet || 0) || 1;
  const mobilePct = Math.round(((data.devices.mobile || 0) / totalDevs) * 100);
  const desktopPct = Math.round(((data.devices.desktop || 0) / totalDevs) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
      <div
        className={`relative max-w-[390px] md:max-w-3xl lg:max-w-4xl w-full my-auto rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#2B2723] border-[#423D37] text-[#F4F1EA]'
            : 'bg-[#F4F1EA] border-[#D9D4C7] text-[#2D2A26]'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-inherit flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#8B7E66] text-white flex items-center justify-center shadow-2xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-fidel">
                  {language === 'am' ? 'የጎብኚዎች እና የገጽ ስታቲስቲክስ' : 'Visitor Traffic & Analytics'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8B7E66]/20 text-[#8B7E66] font-mono">
                  Admin
                </span>
              </div>
              <p className="text-[11px] opacity-75 font-fidel">
                {language === 'am'
                  ? 'የድረ-ገጽዎን ጎብኚዎች፣ የትራፊክ ምንጮች እና የ299 ብር ክፍያዎችን ይከታተሉ'
                  : 'Track website visitors, traffic sources, and 299 ETB payment confirmations'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={refreshData}
              title={language === 'am' ? 'አድስ' : 'Refresh'}
              className="p-1.5 rounded-xl opacity-70 hover:opacity-100 hover:text-[#8B7E66] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-xl opacity-70 hover:opacity-100 hover:text-[#8B7E66] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-5 pt-3 flex gap-2 border-b border-inherit/40 text-xs font-fidel">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-2 border-b-2 font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#8B7E66] text-[#8B7E66]'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{language === 'am' ? 'አጠቃላይ እይታ' : 'Overview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-2 px-2 border-b-2 font-bold transition-colors flex items-center gap-1.5 relative ${
              activeTab === 'payments'
                ? 'border-[#8B7E66] text-[#8B7E66]'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{language === 'am' ? 'የ299 ብር ክፍያዎች' : '299 ETB Payments'}</span>
            {data.recentPayments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#8B7E66] text-white text-[10px] font-mono">
                {data.recentPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('googleAnalytics')}
            className={`pb-2 px-2 border-b-2 font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'googleAnalytics'
                ? 'border-[#8B7E66] text-[#8B7E66]'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Google Analytics (GA4)</span>
            {data.googleAnalyticsId && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            )}
          </button>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Top 4 Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl border border-inherit bg-white/40 dark:bg-black/20">
                <div className="flex items-center justify-between opacity-70 mb-1">
                  <span className="text-[11px] font-fidel">
                    {language === 'am' ? 'ጠቅላላ እይታዎች' : 'Total Views'}
                  </span>
                  <Eye className="w-3.5 h-3.5 text-[#8B7E66]" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#8B7E66]">
                  {data.totalPageViews}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-inherit bg-white/40 dark:bg-black/20">
                <div className="flex items-center justify-between opacity-70 mb-1">
                  <span className="text-[11px] font-fidel">
                    {language === 'am' ? 'ልዩ ጎብኚዎች' : 'Unique Visitors'}
                  </span>
                  <Users className="w-3.5 h-3.5 text-[#8B7E66]" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#8B7E66]">
                  {data.uniqueVisitors}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-inherit bg-white/40 dark:bg-black/20">
                <div className="flex items-center justify-between opacity-70 mb-1">
                  <span className="text-[11px] font-fidel">
                    {language === 'am' ? 'የዛሬ ጎብኚዎች' : 'Today Visits'}
                  </span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {data.todayViews}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-inherit bg-white/40 dark:bg-black/20">
                <div className="flex items-center justify-between opacity-70 mb-1">
                  <span className="text-[11px] font-fidel">
                    {language === 'am' ? 'የክፍያ ሙከራዎች' : 'Payments (299 ETB)'}
                  </span>
                  <CreditCard className="w-3.5 h-3.5 text-[#8B7E66]" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#8B7E66]">
                  {data.recentPayments.length}
                </div>
              </div>
            </div>

            {/* Traffic Breakdown & Devices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Traffic Sources */}
              <div className="p-3.5 rounded-xl border border-inherit bg-white/40 dark:bg-black/20 space-y-2">
                <div className="flex items-center gap-1.5 font-bold font-fidel">
                  <Share2 className="w-3.5 h-3.5 text-[#8B7E66]" />
                  <span>{language === 'am' ? 'የትራፊክ ምንጮች' : 'Traffic Sources'}</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {Object.entries(data.sources).map(([source, count]) => {
                    const pct = Math.round((count / Math.max(data.totalPageViews, 1)) * 100);
                    return (
                      <div key={source} className="flex items-center justify-between text-[11px]">
                        <span className="opacity-80 font-fidel">
                          {source === 'Direct' ? 'ቀጥታ ሊንክ (Direct)' : source}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                            <div
                              className="h-full bg-[#8B7E66] rounded-full"
                              style={{ width: `${Math.min(pct || 15, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold w-6 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Devices */}
              <div className="p-3.5 rounded-xl border border-inherit bg-white/40 dark:bg-black/20 space-y-2">
                <div className="flex items-center gap-1.5 font-bold font-fidel">
                  <Smartphone className="w-3.5 h-3.5 text-[#8B7E66]" />
                  <span>{language === 'am' ? 'የመጠቀሚያ መሳሪያዎች' : 'Visitor Devices'}</span>
                </div>
                <div className="space-y-2 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="flex items-center gap-1 opacity-80 font-fidel">
                        <Smartphone className="w-3 h-3" /> ሞባይል (Mobile)
                      </span>
                      <span className="font-mono font-bold">{mobilePct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                      <div className="h-full bg-[#8B7E66] rounded-full" style={{ width: `${mobilePct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="flex items-center gap-1 opacity-80 font-fidel">
                        <Monitor className="w-3 h-3" /> ኮምፒዩተር (Desktop)
                      </span>
                      <span className="font-mono font-bold">{desktopPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                      <div className="h-full bg-stone-400 dark:bg-stone-500 rounded-full" style={{ width: `${desktopPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Usage */}
            <div className="p-3.5 rounded-xl border border-inherit bg-white/40 dark:bg-black/20">
              <span className="text-xs font-bold font-fidel block mb-2">
                {language === 'am' ? 'የተጠቃሚዎች ተሳትፎ' : 'Platform Feature Engagement'}
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-inherit/40 border border-inherit/40">
                  <div className="flex items-center justify-center gap-1 opacity-70 mb-1">
                    <MessageSquare className="w-3 h-3 text-[#8B7E66]" />
                    <span className="text-[10px] font-fidel">ውይይት</span>
                  </div>
                  <span className="font-mono font-bold text-sm">
                    {data.actions.chatMessages || 0}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-inherit/40 border border-inherit/40">
                  <div className="flex items-center justify-center gap-1 opacity-70 mb-1">
                    <ImageIcon className="w-3 h-3 text-[#8B7E66]" />
                    <span className="text-[10px] font-fidel">ምስሎች</span>
                  </div>
                  <span className="font-mono font-bold text-sm">
                    {data.actions.imagesGenerated || 0}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-inherit/40 border border-inherit/40">
                  <div className="flex items-center justify-center gap-1 opacity-70 mb-1">
                    <FileText className="w-3 h-3 text-[#8B7E66]" />
                    <span className="text-[10px] font-fidel">ሰነዶች</span>
                  </div>
                  <span className="font-mono font-bold text-sm">
                    {data.actions.documentsAnalyzed || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Sessions List */}
            <div>
              <span className="text-xs font-bold font-fidel block mb-2">
                {language === 'am' ? 'የቅርብ ጊዜ የጎብኚዎች እንቅስቃሴ' : 'Recent Visitor Sessions'}
              </span>
              <div className="border border-inherit rounded-xl overflow-hidden divide-y divide-inherit/40 text-[11px] bg-white/20 dark:bg-black/10">
                {data.recentSessions.length === 0 ? (
                  <div className="p-3 text-center opacity-60 font-fidel">
                    {language === 'am' ? 'ምንም የተቀረጸ እንቅስቃሴ የለም' : 'No recorded sessions yet'}
                  </div>
                ) : (
                  data.recentSessions.slice(0, 5).map((s) => (
                    <div key={s.id} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {s.device === 'Mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-[#8B7E66]" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 opacity-70" />
                        )}
                        <span className="font-mono text-[10px] opacity-75">{s.dateStr}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-inherit border border-inherit/50 font-fidel">
                          {s.referrerCategory}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] opacity-60">ID: {s.visitorId.slice(0, 8)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PAYMENTS LOG (299 ETB to 0998888635) */}
        {activeTab === 'payments' && (
          <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="p-3 rounded-xl border border-[#8B7E66]/40 bg-[#8B7E66]/10 text-xs font-fidel leading-relaxed">
              <p className="font-bold text-[#8B7E66] mb-1">
                {language === 'am'
                  ? 'የተላከውን 299 ብር ማረጋገጫ ዝርዝር'
                  : 'Submitted 299 ETB Payment Verifications'}
              </p>
              <p className="opacity-80 text-[11px]">
                {language === 'am'
                  ? 'ተጠቃሚዎች ወደ 0998888635 ብር ልከናል ብለው ያስገቡት የትራንዛክሽን ቁጥር እና ስልክ እዚህ ይመዘገባል። በቴሌብር SMS የተቀበሉትን ከዚህ ጋር አመሳክረው ማረጋገጥ ይችላሉ።'
                  : 'When users submit their Telebirr/CBE Birr transaction code or phone number after sending 299 ETB to 0998888635, it appears here for verification.'}
              </p>
            </div>

            <div className="border border-inherit rounded-xl overflow-hidden divide-y divide-inherit/40 text-xs">
              {data.recentPayments.length === 0 ? (
                <div className="p-6 text-center opacity-60 font-fidel">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#8B7E66]" />
                  <p>{language === 'am' ? 'እስካሁን የቀረበ የክፍያ ማረጋገጫ የለም።' : 'No payment submissions yet.'}</p>
                  <p className="text-[10px] mt-1 opacity-75">
                    {language === 'am'
                      ? 'ተጠቃሚዎች 299 ብር ሲልኩ እዚህ ጋር በዝርዝር ይመዘገባል።'
                      : 'Submissions will appear here when users activate Premium.'}
                  </p>
                </div>
              ) : (
                data.recentPayments.map((p) => (
                  <div key={p.id} className="p-3 bg-white/30 dark:bg-black/20 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#8B7E66]">
                          {p.amount}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-fidel">
                          {language === 'am' ? 'የቀረበ' : 'Submitted'}
                        </span>
                      </div>
                      <div className="mt-1 space-y-0.5 text-[11px]">
                        <p>
                          <strong className="opacity-70 font-fidel">
                            {language === 'am' ? 'የትራንዛክሽን ኮድ:' : 'Transaction ID:'}{' '}
                          </strong>
                          <span className="font-mono font-bold">{p.transactionCode}</span>
                        </p>
                        <p>
                          <strong className="opacity-70 font-fidel">
                            {language === 'am' ? 'የከፋይ ስልክ:' : 'Sender Phone:'}{' '}
                          </strong>
                          <span className="font-mono">{p.senderPhone}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px] opacity-60">
                      {p.dateStr}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: GOOGLE ANALYTICS (GA4) */}
        {activeTab === 'googleAnalytics' && (
          <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Status Banner */}
            {data.googleAnalyticsId ? (
              <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-fidel">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {language === 'am'
                    ? `Google Analytics በተሳካ ሁኔታ ተገናኝቷል (${data.googleAnalyticsId})`
                    : `Google Analytics is active with Measurement ID: ${data.googleAnalyticsId}`}
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-[#8B7E66]/30 bg-[#8B7E66]/10 text-xs flex items-center gap-2 font-fidel">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#8B7E66]" />
                <span>
                  {language === 'am'
                    ? 'Google Analytics Measurement ID እዚህ በማስገባት የቀጥታ ጎብኚዎችን በGoogle Analytics Dashboard ማየት ይችላሉ።'
                    : 'Paste your Measurement ID below to connect your site directly with Google Analytics.'}
                </span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSaveGa} className="space-y-3">
              <div>
                <label className="block text-xs font-bold font-fidel mb-1">
                  Google Analytics Measurement ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gaInput}
                    onChange={(e) => setGaInput(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="flex-1 px-3 py-2 rounded-xl border border-inherit bg-white dark:bg-black/30 font-mono text-xs outline-none focus:border-[#8B7E66]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#8B7E66] hover:bg-[#7A6E57] text-white text-xs font-bold font-fidel transition-colors"
                  >
                    {language === 'am' ? 'አስቀምጥና አገናኝ' : 'Save & Connect'}
                  </button>
                </div>
                <p className="text-[10px] opacity-70 font-fidel mt-1">
                  {language === 'am'
                    ? 'ምሳሌ፡ G-ABC1234567 (በ Google Analytics Admin > Data Streams ውስጥ ያገኙታል)'
                    : 'Example: G-ABC1234567 (Found in Google Analytics > Admin > Data Streams)'}
                </p>
              </div>

              {gaMessage && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-fidel flex items-center gap-2 ${
                    gaMessage.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
                  }`}
                >
                  {gaMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{gaMessage.text}</span>
                </div>
              )}
            </form>

            {/* Step-by-step Help */}
            <div className="p-3.5 rounded-xl border border-inherit/60 bg-white/40 dark:bg-black/20 text-xs font-fidel space-y-2 leading-relaxed">
              <span className="font-bold text-[#8B7E66] block">
                {language === 'am' ? 'የ G- ኮድዎን የት ያገኙታል?' : 'Where to find your G- ID in Google Analytics:'}
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[11px] opacity-80">
                <li>
                  {language === 'am'
                    ? 'ወደ analytics.google.com ይግቡ።'
                    : 'Log in to analytics.google.com.'}
                </li>
                <li>
                  {language === 'am'
                    ? 'ከታች በስተግራ ያለውን ⚙️ Admin (ቅንብር) ይጫኑ።'
                    : 'Click ⚙️ Admin (gear icon) at bottom-left.'}
                </li>
                <li>
                  {language === 'am'
                    ? 'በመሃል Data Streams የሚለውን መርጠው Ethio AI የሚለውን ይጫኑ።'
                    : 'Click Data Streams and select your Ethio AI stream.'}
                </li>
                <li>
                  {language === 'am'
                    ? 'ከላይ በስተቀኝ "Measurement ID: G-XXXXXXXXXX" ተጽፎ ያገኙታል፤ እሱን ኮፒ አድርገው ከላይ ባለው ሳጥን ውስጥ ያስገቡ!'
                    : 'Copy the Measurement ID (G-XXXXXXXXXX) at the top right and paste it above!'}
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 border-t border-inherit flex items-center justify-between text-[11px] opacity-70 font-fidel bg-inherit/20">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#8B7E66]" />
            <span>
              {language === 'am'
                ? 'የኢትዮ ኤአይ ጎብኚዎች መከታተያ መድረክ'
                : 'Ethio AI Real-Time Visitor Analytics'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-inherit hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {language === 'am' ? 'ዝጋ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
