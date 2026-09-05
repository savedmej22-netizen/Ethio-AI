import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types';
import { translations } from '../locales/translations';
import { BreathingLoader } from './BreathingLoader';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Type,
} from 'lucide-react';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isStreaming: boolean;
  language: Language;
  theme: 'light' | 'dark';
  fontSizeMode: 'normal' | 'relaxed' | 'large';
  onChangeFontSize: (size: 'normal' | 'relaxed' | 'large') => void;
  onRegenerateLast?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isStreaming,
  language,
  theme,
  fontSizeMode,
  onChangeFontSize,
  onRegenerateLast,
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');

  const t = translations[language];
  const isDark = theme === 'dark';

  // Language detection helper
  const detectLanguage = (text: string): 'amharic' | 'english' | 'mixed' => {
    const ethiopicRegex = /[\u1200-\u137F\u1380-\u139F\u2D80-\u2DDF]/g;
    const latinRegex = /[a-zA-Z]/g;
    const hasEthiopic = ethiopicRegex.test(text);
    const hasLatin = latinRegex.test(text);

    if (hasEthiopic && hasLatin) return 'mixed';
    if (hasEthiopic) return 'amharic';
    return 'english';
  };

  // Scroll smoothly to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Cleanup speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Adjust font size classes for Fidel vertical rhythm
  const getFontSizeClass = () => {
    switch (fontSizeMode) {
      case 'large':
        return 'text-base sm:text-lg leading-loose';
      case 'relaxed':
        return 'text-sm sm:text-base leading-[1.85]';
      case 'normal':
      default:
        return 'text-xs sm:text-sm leading-relaxed';
    }
  };

  // Handle Voice Input (Speech-to-Text)
  const handleToggleVoice = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechNotice(
        language === 'am'
          ? 'ይህ አሳሽ የድምጽ መቀበያ አይደግፍም። በ Chrome ወይም Edge ይሞክሩ።'
          : 'Speech recognition is not supported in this browser. Please try Chrome or Edge.'
      );
      setTimeout(() => setSpeechNotice(null), 4500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      // Set recognition language based on current UI preference or Amharic
      recognition.lang = language === 'am' ? 'am-ET' : 'en-US';

      baseTextRef.current = input;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechNotice(null);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const combined = (finalTranscript || interimTranscript).trim();
        if (combined) {
          setInput(baseTextRef.current ? `${baseTextRef.current} ${combined}` : combined);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition status:', err.error);
        setIsRecording(false);
        if (err.error === 'not-allowed') {
          setSpeechNotice(
            language === 'am'
              ? 'የማይክሮፎን ፈቃድ አልተሰጠም። እባክዎ በአሳሽዎ ይፍቀዱለት።'
              : 'Microphone access denied. Please grant permission in your browser.'
          );
          setTimeout(() => setSpeechNotice(null), 4500);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition start failed:', e);
      setIsRecording(false);
    }
  };

  // Handle Text-to-Speech playback
  const handleSpeak = (text: string, msgId: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMessageId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const isAmharic = /[\u1200-\u137F]/.test(text);
      utterance.lang = isAmharic ? 'am-ET' : 'en-US';
      utterance.rate = 0.92; // Slightly measured rate for clear Fidel enunciation

      // Try selecting the best matching voice
      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find(
        (v) => v.lang === (isAmharic ? 'am-ET' : 'en-US') || (isAmharic && v.lang.startsWith('am'))
      );
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      utterance.onend = () => {
        setSpeakingMessageId(null);
      };
      utterance.onerror = () => {
        setSpeakingMessageId(null);
      };

      setSpeakingMessageId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const textToSend = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(textToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const starters = [
    { titleAm: 'የላሊበላ ታሪክ', text: t.starter1 },
    { titleAm: 'የቡና አፈላል ባህል', text: t.starter2 },
    { titleAm: 'የንግድ እቅድ', text: t.starter3 },
    { titleAm: 'የግዕዝ ፊደል ፋይዳ', text: t.starter4 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full px-2 sm:px-6 lg:px-8 relative min-h-0 overflow-hidden">
      {/* Top Controls Bar: Font size & typography rhythm */}
      <div className="py-1 sm:py-2 flex items-center justify-between border-b border-[#D9D4C7] dark:border-[#423D37] text-xs gap-1 shrink-0">
        <div className="flex items-center gap-1.5 opacity-80 min-w-0">
          <span className="font-fidel font-medium truncate text-[10px] sm:text-xs">{language === 'am' ? 'የአማርኛ ፊደል' : 'Amharic Fidel'}</span>
          <span className="text-[8px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-[#EBE7DF] dark:bg-[#2B2723] border border-[#D9D4C7] dark:border-[#423D37] text-[#8B7E66] dark:text-[#B0A48A] font-fidel font-medium shrink-0">
            Noto Sans
          </span>
        </div>

        {/* Font size adjustment */}
        <div className="flex items-center gap-1 shrink-0">
          <Type className="w-3 h-3 text-[#8B7E66]" />
          <span className="text-[9px] sm:text-[11px] opacity-70 hidden xs:inline mr-0.5">{t.fontSize}:</span>
          {(['normal', 'relaxed', 'large'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onChangeFontSize(s)}
              className={`px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-fidel transition-colors ${
                fontSizeMode === s
                  ? 'bg-[#8B7E66] text-white font-bold shadow-2xs'
                  : isDark
                  ? 'bg-[#2B2723] text-[#A89F91] hover:text-white border border-[#423D37]'
                  : 'bg-[#EBE7DF] text-[#7A7265] hover:text-[#2D2A26] border border-[#D9D4C7]'
              }`}
            >
              {s === 'normal' ? 'መደበኛ' : s === 'relaxed' ? 'ሰፋ ያለ' : 'ትልቅ'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-2 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="py-4 sm:py-10 lg:py-14 flex flex-col items-center text-center">
            <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-2xl bg-[#8B7E66] text-white flex items-center justify-center font-bold text-base sm:text-2xl mb-2 sm:mb-4 shadow-md">
              <span className="font-fidel">ኢ</span>
            </div>
            <h1 className="text-base sm:text-2xl lg:text-3xl font-bold tracking-tight font-fidel mb-1 sm:mb-2 text-[#2D2A26] dark:text-[#F4F1EA]">
              {t.chatWelcomeTitle}
            </h1>
            <p className="text-[11px] sm:text-sm lg:text-base opacity-70 max-w-xl font-fidel mb-3 sm:mb-8">
              {t.chatWelcomeSubtitle}
            </p>

            {/* Quick Starters */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-left">
              {starters.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(s.text)}
                  className={`p-2.5 sm:p-4 rounded-xl border text-left transition-all ${
                    isDark
                      ? 'bg-[#2B2723] border-[#423D37] hover:border-[#8B7E66] hover:bg-[#38332E]'
                      : 'bg-white border-[#D9D4C7] hover:border-[#8B7E66] hover:bg-[#EBE7DF]'
                  } group shadow-2xs hover:shadow-sm`}
                >
                  <p className="text-[11px] sm:text-xs font-bold font-fidel text-[#8B7E66] mb-1">
                    {s.titleAm}
                  </p>
                  <p className="text-[11px] sm:text-xs opacity-75 group-hover:opacity-100 font-fidel line-clamp-2 leading-relaxed">
                    {s.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const lang = msg.detectedLang || detectLanguage(msg.content);
            const isAm = lang === 'amharic';
            const isMixed = lang === 'mixed';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2 sm:gap-3.5 ${isUser ? 'justify-end' : 'justify-start'} group`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#8B7E66] flex-shrink-0 flex items-center justify-center text-white text-[11px] sm:text-xs font-bold font-fidel shadow-xs mt-1">
                    ኢ
                  </div>
                )}

                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[90%] sm:max-w-[85%]`}>
                  {/* Language detection tag & role */}
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] opacity-60">
                    <span className="font-semibold font-fidel">
                      {isUser ? (language === 'am' ? 'እርስዎ' : 'You') : 'Ethio AI'}
                    </span>
                    <span>•</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full font-fidel border ${
                        isDark ? 'border-[#423D37]' : 'border-[#D9D4C7]'
                      } ${
                        isAm
                          ? 'bg-[#EBE7DF] dark:bg-[#2B2723] text-[#8B7E66] dark:text-[#B0A48A]'
                          : isMixed
                          ? 'bg-[#EBE7DF] dark:bg-[#2B2723] text-[#5C6B73]'
                          : 'bg-[#EBE7DF] dark:bg-[#2B2723] text-[#7A7265]'
                      }`}
                    >
                      {isAm
                        ? t.langBadgeAmharic
                        : isMixed
                        ? t.langBadgeMixed
                        : t.langBadgeEnglish}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-3 sm:p-5 transition-all ${
                      isUser
                        ? 'bg-[#8B7E66] text-white rounded-tr-none shadow-md font-fidel'
                        : isDark
                        ? 'bg-[#2B2723] border border-[#423D37] text-[#F4F1EA] rounded-tl-none shadow-sm font-fidel'
                        : 'bg-white border border-[#D9D4C7] text-[#2D2A26] rounded-tl-none shadow-sm font-fidel'
                    } ${getFontSizeClass()}`}
                  >
                    <div className="markdown-body select-text">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Action buttons (Copy, Speak, Regenerate) */}
                  {!isUser && (
                    <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        title={t.copyText}
                        className="p-1 rounded text-[#7A7265] dark:text-[#A89F91] hover:text-[#8B7E66] transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeak(msg.content, msg.id)}
                        title={speakingMessageId === msg.id ? t.stopSpeaking : t.speakResponse}
                        className={`p-1 rounded transition-colors ${
                          speakingMessageId === msg.id
                            ? 'text-[#8B7E66]'
                            : 'text-[#7A7265] dark:text-[#A89F91] hover:text-[#8B7E66]'
                        }`}
                      >
                        {speakingMessageId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {onRegenerateLast && (
                        <button
                          onClick={onRegenerateLast}
                          title={t.regenerate}
                          className="p-1 rounded text-[#7A7265] dark:text-[#A89F91] hover:text-[#8B7E66] transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#D9D4C7] dark:bg-[#423D37] flex-shrink-0 flex items-center justify-center text-xs font-bold text-[#2D2A26] dark:text-[#F4F1EA] shadow-xs mt-1">
                    እ
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Quiet breathing-dot loader when streaming */}
        {isStreaming && (
          <div className="flex items-center gap-3 py-2 pl-11">
            <BreathingLoader
              text={language === 'am' ? 'ምላሹ እየተዘጋጀ ነው...' : 'Generating response...'}
              size="md"
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pb-1 sm:pb-4 pt-0.5 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent shrink-0">
        {/* Quick Suggestion Chips */}
        <div className="flex justify-start sm:justify-center gap-1.5 mb-1.5 sm:mb-2 overflow-x-auto no-scrollbar py-0.5 px-0.5">
          <button
            type="button"
            onClick={() => onSendMessage(language === 'am' ? 'የአድዋ ድል ለኢትዮጵያዊያን ያለውን ትርጉም ባጭሩ ግለጽልኝ።' : 'Explain the historical significance of the Victory of Adwa.')}
            className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-medium border transition-colors shrink-0 shadow-2xs whitespace-nowrap ${
              isDark
                ? 'bg-[#2B2723] border-[#423D37] text-[#F4F1EA] hover:bg-[#38332E]'
                : 'bg-white border-[#D9D4C7] text-[#2D2A26] hover:bg-[#EBE7DF]'
            }`}
          >
            {language === 'am' ? 'የአድዋ ድል ታሪክ' : 'Adwa History'}
          </button>
          <button
            type="button"
            onClick={() => onSendMessage(language === 'am' ? 'የኢትዮጵያ ቡና ወደ ውጭ የመላክ አፈጻጸም እንዴት ነው?' : 'How is Ethiopia\'s coffee export performance trending?')}
            className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-medium border transition-colors shrink-0 shadow-2xs whitespace-nowrap ${
              isDark
                ? 'bg-[#2B2723] border-[#423D37] text-[#F4F1EA] hover:bg-[#38332E]'
                : 'bg-white border-[#D9D4C7] text-[#2D2A26] hover:bg-[#EBE7DF]'
            }`}
          >
            {language === 'am' ? 'የቡና ኤክስፖርት መረጃ' : 'Coffee Export'}
          </button>
        </div>

        {/* Speech / Recording Live Status or Notice */}
        {speechNotice && (
          <div className="flex justify-center mb-1.5 animate-fade-in">
            <div className="px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full bg-[#EBE7DF] dark:bg-[#2B2723] border border-[#D9D4C7] dark:border-[#423D37] text-[9px] sm:text-[11px] font-fidel text-[#8B7E66] flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#8B7E66] animate-ping" />
              <span>{speechNotice}</span>
            </div>
          </div>
        )}

        {isRecording && !speechNotice && (
          <div className="flex justify-center mb-1.5 animate-fade-in">
            <div className="px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full bg-[#EBE7DF] dark:bg-[#2B2723] border border-[#8B7E66]/50 text-[9px] sm:text-[11px] font-fidel text-[#8B7E66] flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>
                {language === 'am' ? 'በአማርኛ እየሰማን ነው... (am-ET)' : 'Listening in Amharic (am-ET)...'}
              </span>
            </div>
          </div>
        )}

        {/* Rounded Natural Tones Input Box */}
        <form
          onSubmit={handleSubmit}
          className={`relative rounded-2xl border p-1 sm:p-1.5 flex items-center gap-1 sm:gap-2 transition-all ${
            isDark
              ? 'bg-[#2B2723] border-[#423D37] focus-within:border-[#8B7E66]'
              : 'bg-white border-[#D9D4C7] focus-within:border-[#8B7E66]'
          } shadow-sm`}
        >
          {/* Textarea */}
          <textarea
            id="chat-input-textarea"
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? t.listening : t.chatInputPlaceholder}
            className={`flex-1 bg-transparent border-none outline-none px-2 sm:px-3 py-1 font-fidel text-xs sm:text-sm resize-none leading-relaxed placeholder:opacity-40 min-w-0 max-h-24 ${
              isRecording ? 'placeholder:text-[#8B7E66] placeholder:font-bold' : ''
            }`}
          />

          {/* Action buttons inside input */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Voice Input Button */}
            <button
              type="button"
              id="btn-voice-input"
              onClick={handleToggleVoice}
              title={isRecording ? 'Stop Recording' : t.voiceInput}
              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : isDark
                  ? 'opacity-60 hover:opacity-100 hover:bg-[#38332E] text-[#F4F1EA]'
                  : 'opacity-60 hover:opacity-100 hover:bg-[#EBE7DF] text-[#2D2A26]'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              id="btn-send-message"
              disabled={!input.trim() || isStreaming}
              className={`h-7 sm:h-9 px-2.5 sm:px-4 rounded-xl font-bold text-xs font-fidel shadow-inner transition-all flex items-center gap-1 shrink-0 ${
                input.trim() && !isStreaming
                  ? 'bg-[#8B7E66] hover:bg-[#7A6E57] text-white shadow-xs'
                  : 'bg-[#D9D4C7]/40 dark:bg-[#423D37] text-[#2D2A26]/40 dark:text-[#A89F91]/40 cursor-not-allowed'
              }`}
            >
              <Send className="w-3 h-3" />
              <span>{language === 'am' ? 'ላክ' : 'Send'}</span>
            </button>
          </div>
        </form>

        <p className="text-[8px] sm:text-[9px] text-center opacity-40 mt-1 font-fidel tracking-wider">
          Ethio AI • Amharic Native
        </p>
      </div>
    </div>
  );
};
