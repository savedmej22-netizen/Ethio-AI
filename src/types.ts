export type AppMode = 'chat' | 'image' | 'document';
export type Language = 'am' | 'en';
export type UserTier = 'free' | 'premium';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  detectedLang?: 'amharic' | 'english' | 'mixed';
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  titleAm: string;
  createdAt: number;
  messages: ChatMessage[];
  category: 'chat';
}

export type ImageStylePreset = 
  | 'ethiopian_cultural'
  | 'traditional_art'
  | 'realistic'
  | 'illustration'
  | 'anime'
  | '3d_render';

export interface GeneratedImageItem {
  id: string;
  url: string;
  promptAm: string;
  promptEn: string;
  style: ImageStylePreset;
  timestamp: number;
  aspectRatio: string;
}

export interface ImageSession {
  id: string;
  title: string;
  promptAm: string;
  promptEn: string;
  style: ImageStylePreset;
  images: GeneratedImageItem[];
  createdAt: number;
  category: 'image';
}

export interface DocumentAnalysisResult {
  ocrText: string;
  documentType: string;
  summaryAmharic: string;
  summaryEnglish: string;
  keyPointsAmharic: string[];
  keyPointsEnglish: string[];
  entities?: Array<{ name: string; type: string; amharic?: string }>;
  tableData?: Array<{ categoryAm: string; categoryEn: string; value: number; unit?: string; trend?: string }>;
  chart?: {
    titleAm: string;
    titleEn: string;
    type: string;
    data: Array<{ name: string; value: number; labelAm?: string }>;
  };
}

export interface DocumentSession {
  id: string;
  fileName: string;
  fileType: string;
  createdAt: number;
  result: DocumentAnalysisResult;
  qaHistory: Array<{
    id: string;
    question: string;
    answerAmharic: string;
    answerEnglish: string;
    evidenceQuote?: string;
  }>;
  category: 'document';
}

export type HistoryItem = ChatSession | ImageSession | DocumentSession;
