// Analytics and visitor tracking utility for Ethio AI

export interface VisitorSession {
  id: string;
  visitorId: string;
  timestamp: number;
  dateStr: string;
  referrer: string;
  referrerCategory: 'Telegram' | 'TikTok' | 'Facebook' | 'Google' | 'Direct' | 'Other';
  device: 'Mobile' | 'Tablet' | 'Desktop';
  mode: string;
}

export interface PaymentSubmission {
  id: string;
  timestamp: number;
  dateStr: string;
  transactionCode: string;
  senderPhone: string;
  amount: string;
  tier: string;
}

export interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  todayViews: number;
  devices: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  sources: Record<string, number>;
  actions: {
    chatMessages: number;
    imagesGenerated: number;
    documentsAnalyzed: number;
    upgradeClicks: number;
  };
  recentSessions: VisitorSession[];
  recentPayments: PaymentSubmission[];
  googleAnalyticsId: string;
}

const STORAGE_VISITOR_ID = 'ethio_ai_visitor_id_v1';
const STORAGE_SESSIONS = 'ethio_ai_sessions_v1';
const STORAGE_PAYMENTS = 'ethio_ai_payments_v1';
const STORAGE_ACTIONS = 'ethio_ai_actions_v1';
const STORAGE_GA_ID = 'ethio_ai_ga_id_v1';

// Detect device type
function getDeviceType(): 'Mobile' | 'Tablet' | 'Desktop' {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

// Categorize traffic source
function categorizeReferrer(ref: string): 'Telegram' | 'TikTok' | 'Facebook' | 'Google' | 'Direct' | 'Other' {
  if (!ref || ref === '') return 'Direct';
  const lower = ref.toLowerCase();
  if (lower.includes('t.me') || lower.includes('telegram')) return 'Telegram';
  if (lower.includes('tiktok.com')) return 'TikTok';
  if (lower.includes('facebook.com') || lower.includes('fb.com') || lower.includes('messenger.com')) return 'Facebook';
  if (lower.includes('google.com') || lower.includes('google.et')) return 'Google';
  return 'Other';
}

// Initialize and record visit
export function initVisitorTracking(currentMode: string = 'chat'): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Unique visitor ID
    let visitorId = localStorage.getItem(STORAGE_VISITOR_ID);
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem(STORAGE_VISITOR_ID, visitorId);
    }

    // 2. Load existing sessions
    const rawSessions = localStorage.getItem(STORAGE_SESSIONS);
    let sessions: VisitorSession[] = [];
    if (rawSessions) {
      try {
        sessions = JSON.parse(rawSessions);
      } catch (e) {
        sessions = [];
      }
    }

    // Don't flood if session recorded in last 2 minutes for same visitor
    const lastSession = sessions[0];
    const now = Date.now();
    const isVeryRecent = lastSession && lastSession.visitorId === visitorId && now - lastSession.timestamp < 2 * 60 * 1000;

    if (!isVeryRecent) {
      const ref = document.referrer || '';
      const newSession: VisitorSession = {
        id: 's_' + Math.random().toString(36).substring(2, 9),
        visitorId,
        timestamp: now,
        dateStr: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        referrer: ref,
        referrerCategory: categorizeReferrer(ref),
        device: getDeviceType(),
        mode: currentMode,
      };

      sessions.unshift(newSession);
      // Keep max 150 sessions
      if (sessions.length > 150) sessions = sessions.slice(0, 150);
      localStorage.setItem(STORAGE_SESSIONS, JSON.stringify(sessions));
    }

    // Check if Google Analytics ID is configured and inject
    const gaId = localStorage.getItem(STORAGE_GA_ID);
    if (gaId && gaId.trim().startsWith('G-')) {
      injectGoogleAnalytics(gaId.trim());
    }
  } catch (e) {
    console.warn('Visitor tracking error:', e);
  }
}

// Inject Google Analytics gtag.js dynamically
export function injectGoogleAnalytics(gaId: string): void {
  if (typeof window === 'undefined') return;
  const cleanId = gaId.trim();
  if (!cleanId.startsWith('G-')) return;

  const existingScript = document.getElementById('ga-gtag-script');
  if (existingScript) return;

  try {
    const script = document.createElement('script');
    script.id = 'ga-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${cleanId}`;
    document.head.appendChild(script);

    const inlineScript = document.createElement('script');
    inlineScript.id = 'ga-init-script';
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${cleanId}');
    `;
    document.head.appendChild(inlineScript);
    console.log('Google Analytics initialized with ID:', cleanId);
  } catch (err) {
    console.warn('Failed to inject Google Analytics:', err);
  }
}

// Save Google Analytics ID
export function saveGoogleAnalyticsId(id: string): boolean {
  if (typeof window === 'undefined') return false;
  const cleanId = id.trim().toUpperCase();
  if (cleanId === '') {
    localStorage.removeItem(STORAGE_GA_ID);
    return true;
  }
  if (!cleanId.startsWith('G-')) {
    return false;
  }
  localStorage.setItem(STORAGE_GA_ID, cleanId);
  injectGoogleAnalytics(cleanId);
  return true;
}

// Record an action
export function recordAction(actionType: 'chat' | 'image' | 'document' | 'upgrade'): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_ACTIONS);
    const actions = raw
      ? JSON.parse(raw)
      : { chatMessages: 0, imagesGenerated: 0, documentsAnalyzed: 0, upgradeClicks: 0 };

    if (actionType === 'chat') actions.chatMessages = (actions.chatMessages || 0) + 1;
    if (actionType === 'image') actions.imagesGenerated = (actions.imagesGenerated || 0) + 1;
    if (actionType === 'document') actions.documentsAnalyzed = (actions.documentsAnalyzed || 0) + 1;
    if (actionType === 'upgrade') actions.upgradeClicks = (actions.upgradeClicks || 0) + 1;

    localStorage.setItem(STORAGE_ACTIONS, JSON.stringify(actions));

    // Also send to GA if active
    if ((window as any).gtag) {
      (window as any).gtag('event', actionType, { event_category: 'engagement' });
    }
  } catch (e) {
    console.warn('Action tracking error:', e);
  }
}

// Record a Payment Verification submission (299 ETB to 0998888635)
export function recordPaymentSubmission(payment: {
  transactionCode: string;
  senderPhone: string;
  amount?: string;
  tier?: string;
}): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_PAYMENTS);
    let payments: PaymentSubmission[] = raw ? JSON.parse(raw) : [];

    const newPayment: PaymentSubmission = {
      id: 'pay_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      transactionCode: payment.transactionCode.trim() || 'N/A',
      senderPhone: payment.senderPhone.trim() || 'N/A',
      amount: payment.amount || '299 ETB',
      tier: payment.tier || 'Premium',
    };

    payments.unshift(newPayment);
    if (payments.length > 50) payments = payments.slice(0, 50);
    localStorage.setItem(STORAGE_PAYMENTS, JSON.stringify(payments));

    // Also send event to GA if active
    if ((window as any).gtag) {
      (window as any).gtag('event', 'payment_submitted', {
        event_category: 'ecommerce',
        value: 299,
        currency: 'ETB',
      });
    }
  } catch (e) {
    console.warn('Payment recording error:', e);
  }
}

// Get analytics data for admin view
export function getAnalyticsSummary(): AnalyticsSummary {
  if (typeof window === 'undefined') {
    return {
      totalPageViews: 1,
      uniqueVisitors: 1,
      todayViews: 1,
      devices: { mobile: 1, tablet: 0, desktop: 0 },
      sources: { Direct: 1 },
      actions: { chatMessages: 0, imagesGenerated: 0, documentsAnalyzed: 0, upgradeClicks: 0 },
      recentSessions: [],
      recentPayments: [],
      googleAnalyticsId: '',
    };
  }

  try {
    const rawSessions = localStorage.getItem(STORAGE_SESSIONS);
    const sessions: VisitorSession[] = rawSessions ? JSON.parse(rawSessions) : [];

    const rawPayments = localStorage.getItem(STORAGE_PAYMENTS);
    const payments: PaymentSubmission[] = rawPayments ? JSON.parse(rawPayments) : [];

    const rawActions = localStorage.getItem(STORAGE_ACTIONS);
    const actions = rawActions
      ? JSON.parse(rawActions)
      : { chatMessages: 0, imagesGenerated: 0, documentsAnalyzed: 0, upgradeClicks: 0 };

    const gaId = localStorage.getItem(STORAGE_GA_ID) || '';

    // Calculate metrics
    const totalPageViews = Math.max(sessions.length, 1);
    const uniqueVisitorIds = new Set(sessions.map((s) => s.visitorId));
    const uniqueVisitors = Math.max(uniqueVisitorIds.size, 1);

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const todayViews = Math.max(sessions.filter((s) => s.timestamp >= oneDayAgo).length, 1);

    const devices = { mobile: 0, tablet: 0, desktop: 0 };
    const sources: Record<string, number> = {
      Direct: 0,
      Telegram: 0,
      TikTok: 0,
      Facebook: 0,
      Google: 0,
      Other: 0,
    };

    sessions.forEach((s) => {
      if (s.device === 'Mobile') devices.mobile++;
      else if (s.device === 'Tablet') devices.tablet++;
      else devices.desktop++;

      const cat = s.referrerCategory || 'Direct';
      sources[cat] = (sources[cat] || 0) + 1;
    });

    // If empty default
    if (devices.mobile === 0 && devices.desktop === 0 && devices.tablet === 0) {
      devices.mobile = 1;
    }

    return {
      totalPageViews,
      uniqueVisitors,
      todayViews,
      devices,
      sources,
      actions,
      recentSessions: sessions.slice(0, 30),
      recentPayments: payments,
      googleAnalyticsId: gaId,
    };
  } catch (e) {
    return {
      totalPageViews: 1,
      uniqueVisitors: 1,
      todayViews: 1,
      devices: { mobile: 1, tablet: 0, desktop: 0 },
      sources: { Direct: 1 },
      actions: { chatMessages: 0, imagesGenerated: 0, documentsAnalyzed: 0, upgradeClicks: 0 },
      recentSessions: [],
      recentPayments: [],
      googleAnalyticsId: '',
    };
  }
}
