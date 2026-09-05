import React, { useState, useEffect } from 'react';
import {
  AppMode,
  Language,
  ChatMessage,
  ChatSession,
  ImageStylePreset,
  GeneratedImageItem,
  DocumentAnalysisResult,
  HistoryItem,
  UserTier,
} from './types';
import { translations } from './locales/translations';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { ImageView } from './components/ImageView';
import { DocumentView } from './components/DocumentView';
import { SettingsModal } from './components/SettingsModal';
import { PricingModal } from './components/PricingModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { initVisitorTracking, recordAction } from './utils/analytics';
import { MessageSquare, Image as ImageIcon, FileText, Sparkles, Smartphone, Monitor } from 'lucide-react';

const STORAGE_KEY_HISTORY = 'ethio_ai_history_v1';
const STORAGE_KEY_LANG = 'ethio_ai_lang_v1';
const STORAGE_KEY_THEME = 'ethio_ai_theme_v1';
const STORAGE_KEY_FONT_SIZE = 'ethio_ai_font_v1';
const STORAGE_KEY_TIER = 'ethio_ai_tier_v1';

export default function App() {
  // App State
  const [currentMode, setCurrentMode] = useState<AppMode>('chat');
  const [deviceView, setDeviceView] = useState<'desktop' | 'phone'>('desktop');
  const [phoneWidth, setPhoneWidth] = useState<'375' | '390' | '430'>('390');
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEY_LANG) as Language) || 'am';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(STORAGE_KEY_THEME) as 'light' | 'dark') || 'light';
  });
  const [fontSizeMode, setFontSizeMode] = useState<'normal' | 'relaxed' | 'large'>(() => {
    return (localStorage.getItem(STORAGE_KEY_FONT_SIZE) as any) || 'relaxed';
  });
  const [currentTier, setCurrentTier] = useState<UserTier>(() => {
    return (localStorage.getItem(STORAGE_KEY_TIER) as UserTier) || 'free';
  });
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TIER, currentTier);
  }, [currentTier]);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse history:', e);
    }
    return [];
  });

  // Active Chat Session
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // UI Panels
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Initialize and track visitor
  useEffect(() => {
    initVisitorTracking(currentMode);
  }, [currentMode]);

  const t = translations[language];
  const isDark = theme === 'dark';

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Persist language
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, language);
  }, [language]);

  // Persist font size
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, fontSizeMode);
  }, [fontSizeMode]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('History storage exceeded:', e);
    }
  }, [history]);

  // Start a fresh new session
  const handleNewSession = () => {
    if (currentMode === 'chat') {
      setActiveSessionId(null);
      setChatMessages([]);
    }
  };

  // Select item from history
  const handleSelectSession = (item: HistoryItem) => {
    setActiveSessionId(item.id);
    setCurrentMode(item.category);

    if (item.category === 'chat') {
      setChatMessages(item.messages || []);
    }
  };

  // Delete an item from history
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setChatMessages([]);
    }
  };

  // Clear all history
  const handleClearHistory = () => {
    if (confirm(language === 'am' ? 'ሁሉንም ታሪክ ማጥፋት ይፈልጋሉ?' : 'Clear all history?')) {
      setHistory([]);
      setActiveSessionId(null);
      setChatMessages([]);
    }
  };

  // Save Image session to history
  const handleSaveImageSession = (
    promptAm: string,
    promptEn: string,
    style: ImageStylePreset,
    images: GeneratedImageItem[]
  ) => {
    recordAction('image');
    const newSession = {
      id: `img_session_${Date.now()}`,
      title: promptEn.slice(0, 30),
      promptAm,
      promptEn,
      style,
      images,
      createdAt: Date.now(),
      category: 'image' as const,
    };
    setHistory((prev) => [newSession, ...prev]);
  };

  // Save Document session to history
  const handleSaveDocumentSession = (
    fileName: string,
    result: DocumentAnalysisResult
  ) => {
    recordAction('document');
    const newSession = {
      id: `doc_session_${Date.now()}`,
      fileName,
      fileType: result.documentType || 'Amharic Document',
      createdAt: Date.now(),
      result,
      qaHistory: [],
      category: 'document' as const,
    };
    setHistory((prev) => [newSession, ...prev]);
  };

  // Send message and stream SSE chunks
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    recordAction('chat');
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setIsStreaming(true);

    const assistantMsgId = `msg_${Date.now()}_assistant`;
    const placeholderAssistant: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setChatMessages([...newMessages, placeholderAssistant]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          languagePreference: language === 'am' ? 'amharic' : 'english',
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        const lines = rawChunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setChatMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              } else if (parsed.error) {
                accumulatedText += `\n[ስህተት: ${parsed.error}]`;
                setChatMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              }
            } catch {
              // Non-JSON line, continue
            }
          }
        }
      }

      // Update or create chat session in history
      const sessionTitleAm = text.slice(0, 24);
      const sessionTitleEn = text.slice(0, 24);

      if (activeSessionId) {
        setHistory((prev) =>
          prev.map((item) =>
            item.id === activeSessionId && item.category === 'chat'
              ? {
                  ...item,
                  messages: [
                    ...newMessages,
                    { ...placeholderAssistant, content: accumulatedText },
                  ],
                }
              : item
          )
        );
      } else {
        const newId = `chat_session_${Date.now()}`;
        setActiveSessionId(newId);
        const newSession: ChatSession = {
          id: newId,
          title: sessionTitleEn,
          titleAm: sessionTitleAm,
          createdAt: Date.now(),
          messages: [
            ...newMessages,
            { ...placeholderAssistant, content: accumulatedText },
          ],
          category: 'chat',
        };
        setHistory((prev) => [newSession, ...prev]);
      }
    } catch (err: any) {
      console.error('Chat send error:', err);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  language === 'am'
                    ? 'ይቅርታ፣ ከአገልጋዩ ጋር መገናኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።'
                    : 'Sorry, communication error occurred. Please retry.',
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div
      className={`w-full min-h-[100dvh] h-[100dvh] flex flex-col selection:bg-[#8B7E66]/20 overflow-hidden ${
        deviceView === 'phone'
          ? 'bg-[#E3DFD5] dark:bg-[#12100E] items-center justify-center p-0 sm:p-2 sm:py-3'
          : 'bg-[#F4F1EA] dark:bg-[#1F1D1A]'
      }`}
    >
      {/* Viewport Layout Switcher: Desktop (1024-1440px+) vs Phone (375-430px) */}
      <div className="hidden lg:flex items-center justify-between px-4 py-1.5 border-b border-[#D9D4C7] dark:border-[#38332E] bg-[#EBE7DF]/90 dark:bg-[#191715]/90 backdrop-blur-xs text-xs shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-fidel opacity-70">
            {language === 'am' ? 'የዕይታ ሁኔታ / Viewport:' : 'Viewport Mode:'}
          </span>
          <div className="flex items-center p-0.5 rounded-full border border-[#D9D4C7] dark:border-[#38332E] bg-white/70 dark:bg-black/40 shadow-2xs">
            <button
              id="btn-viewport-desktop"
              onClick={() => setDeviceView('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-fidel text-xs transition-all ${
                deviceView === 'desktop'
                  ? 'bg-[#8B7E66] text-white font-bold shadow-2xs'
                  : 'opacity-70 hover:opacity-100 text-[#2D2A26] dark:text-[#F4F1EA]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'ዴስክቶፕ / Desktop (1024–1440+ px)' : 'Desktop (1024–1440+ px)'}</span>
            </button>
            <button
              id="btn-viewport-phone"
              onClick={() => setDeviceView('phone')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-fidel text-xs transition-all ${
                deviceView === 'phone'
                  ? 'bg-[#8B7E66] text-white font-bold shadow-2xs'
                  : 'opacity-70 hover:opacity-100 text-[#2D2A26] dark:text-[#F4F1EA]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'ስልክ / Phone (375–430 px)' : 'Phone (375–430 px)'}</span>
            </button>
          </div>
        </div>

        {/* When in Phone frame on large screen: Allow selecting 375, 390, or 430px */}
        {deviceView === 'phone' ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-fidel opacity-70">
              {language === 'am' ? 'የስልክ ስፋት:' : 'Phone Width:'}
            </span>
            {(['375', '390', '430'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setPhoneWidth(w)}
                className={`px-2 py-0.5 rounded-full font-mono text-[10px] transition-all ${
                  phoneWidth === w
                    ? 'bg-[#8B7E66] text-white font-bold shadow-2xs'
                    : 'bg-white/60 dark:bg-black/30 border border-[#D9D4C7] dark:border-[#38332E] hover:text-[#2D2A26] dark:hover:text-white'
                }`}
              >
                {w}px {w === '375' ? '(SE)' : w === '390' ? '(Standard)' : '(Max)'}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] font-fidel text-[#8B7E66] dark:text-[#B0A48A]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {language === 'am'
                ? 'የዴስክቶፕ እይታ ነቅቷል (ሰፊ የስክሪን ካንቫስ)'
                : 'Desktop Layout Active (1024–1440+ px)'}
            </span>
          </div>
        )}
      </div>

      {/* Main Application Canvas (Adapts dynamically between Desktop and Phone) */}
      <div
        id={deviceView === 'phone' ? 'phone-device-shell' : 'desktop-app-canvas'}
        style={
          deviceView === 'phone'
            ? {
                maxWidth: phoneWidth === '375' ? '375px' : phoneWidth === '390' ? '390px' : '430px',
              }
            : undefined
        }
        className={`w-full flex-1 flex flex-col overflow-hidden relative transition-all duration-200 ${
          deviceView === 'phone'
            ? 'h-[100dvh] sm:h-[844px] sm:max-h-[94vh] sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-[#C4BEB1] dark:sm:border-[#38332E]'
            : 'h-full'
        } ${isDark ? 'bg-[#1F1D1A] text-[#F4F1EA]' : 'bg-[#F4F1EA] text-[#2D2A26]'}`}
      >
        {/* Top Navigation */}
        <Navbar
          currentMode={currentMode}
          onSelectMode={(mode) => setCurrentMode(mode)}
          language={language}
          onToggleLanguage={(l) => setLanguage(l)}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentTier={currentTier}
          onOpenPricing={() => setIsPricingOpen(true)}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 flex overflow-hidden relative min-h-0 w-full">
          {/* Collapsible Sidebar Drawer (Mobile) / Docked Panel (Desktop) */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            language={language}
            history={history}
            activeId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            onClearHistory={handleClearHistory}
            theme={theme}
            currentTier={currentTier}
            onOpenPricing={() => setIsPricingOpen(true)}
          />

          {/* Active View Container */}
          <main className="flex-1 flex flex-col overflow-hidden min-h-0 w-full">
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {currentMode === 'chat' && (
                <ChatView
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isStreaming={isStreaming}
                  language={language}
                  theme={theme}
                  fontSizeMode={fontSizeMode}
                  onChangeFontSize={setFontSizeMode}
                  onRegenerateLast={() => {
                    if (chatMessages.length > 1) {
                      const lastUserMsg = [...chatMessages]
                        .reverse()
                        .find((m) => m.role === 'user');
                      if (lastUserMsg) handleSendMessage(lastUserMsg.content);
                    }
                  }}
                />
              )}

              {currentMode === 'image' && (
                <ImageView
                  language={language}
                  theme={theme}
                  onSaveToHistory={handleSaveImageSession}
                  currentTier={currentTier}
                  onOpenPricing={() => setIsPricingOpen(true)}
                />
              )}

              {currentMode === 'document' && (
                <DocumentView
                  language={language}
                  theme={theme}
                  onSaveToHistory={handleSaveDocumentSession}
                  currentTier={currentTier}
                  onOpenPricing={() => setIsPricingOpen(true)}
                />
              )}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar (Persistent on phone, cleanly hidden on desktop layout) */}
        <nav
          id="mobile-bottom-nav"
          aria-label="Mobile mode navigation"
          className={`${
            deviceView === 'desktop' ? 'lg:hidden' : 'flex'
          } border-t shrink-0 z-20 items-center justify-around px-2 py-1 transition-colors ${
            isDark
              ? 'bg-[#1F1D1A]/95 border-[#423D37] text-[#F4F1EA]'
              : 'bg-[#F4F1EA]/95 border-[#D9D4C7] text-[#2D2A26]'
          } backdrop-blur-md pb-[max(0.25rem,env(safe-area-inset-bottom))]`}
        >
          <button
            onClick={() => setCurrentMode('chat')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs font-medium transition-all ${
              currentMode === 'chat'
                ? 'text-[#8B7E66] font-bold dark:text-[#B0A48A]'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-fidel">{language === 'am' ? 'ውይይት' : 'Chat'}</span>
          </button>

          <button
            onClick={() => setCurrentMode('image')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs font-medium transition-all ${
              currentMode === 'image'
                ? 'text-[#8B7E66] font-bold dark:text-[#B0A48A]'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <ImageIcon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-fidel">{language === 'am' ? 'ምስል' : 'Image'}</span>
          </button>

          <button
            onClick={() => setCurrentMode('document')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs font-medium transition-all ${
              currentMode === 'document'
                ? 'text-[#8B7E66] font-bold dark:text-[#B0A48A]'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-fidel">{language === 'am' ? 'ሰነድ' : 'Document'}</span>
          </button>
        </nav>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          language={language}
          onToggleLanguage={setLanguage}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          fontSizeMode={fontSizeMode}
          onChangeFontSize={setFontSizeMode}
          currentTier={currentTier}
          onOpenPricing={() => setIsPricingOpen(true)}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        />

        {/* Subscription & Pricing Modal */}
        <PricingModal
          isOpen={isPricingOpen}
          onClose={() => setIsPricingOpen(false)}
          language={language}
          theme={theme}
          currentTier={currentTier}
          onSelectTier={(newTier) => setCurrentTier(newTier)}
        />

        {/* Real-time Visitor Traffic & Analytics Modal */}
        <AnalyticsModal
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          language={language}
          theme={theme}
        />
      </div>
    </div>
  );
}
