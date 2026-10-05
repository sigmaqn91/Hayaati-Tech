// Public Data Whitelist & Context Retrieval
import enContent from '@/locales/en/content.json';
import { aboutData } from '@/data/about';

// Owner Profile Data Structure
export interface OwnerProfile {
  name: string;
  role: string;
  about: string;
  preferences: string;
  businessNotes: string;
  rateLimitsEnabled: boolean;
}

const DEFAULT_OWNER_PROFILE: OwnerProfile = {
  name: 'Aliya Khan',
  role: 'Owner / Founder, Hayaati Tech',
  about: 'Founder & Lead Architect of Hayaati Web Technology. Focused on 2030–2050 frontier computing, sustainable orbital infrastructure, and neural interfaces.',
  preferences: 'Replies in natural, concise English or Hinglish; prefers direct answers without fluff.',
  businessNotes: 'Priority initiatives: Autonomous orbital habitats, clean baseload fusion power models, and real-time cognitive web applications.',
  rateLimitsEnabled: true,
};

let activeOwnerProfile: OwnerProfile = { ...DEFAULT_OWNER_PROFILE };

// Conversation Turn Log for Admin Panel
export interface ConversationLogItem {
  id: string;
  timestamp: string;
  role: 'user' | 'model';
  text: string;
  isOwner: boolean;
  language?: string;
}

export interface ConversationSession {
  sessionId: string;
  startedAt: string;
  isOwner: boolean;
  turns: ConversationLogItem[];
}

export const conversationSessions: ConversationSession[] = [];
export const telemetryStats = {
  totalConversations: 0,
  totalRequests: 0,
  totalErrors: 0,
};

/**
 * Public Data Whitelist: extracts only safe, sanitized data for public visitors.
 * Never includes internal configs, hashes, admin codes, or private notes.
 */
function getSanitizedPublicCorpus(): string {
  const erasText = Object.entries(enContent.eras || {})
    .map(([key, era]: [string, any]) => `[${era.yearLabel}: ${era.title}] ${era.story} Breakthroughs: ${(era.breakthroughs || []).join('; ')}`)
    .join('\n');

  const placesText = Object.entries(enContent.places || {})
    .map(([key, place]: [string, any]) => `[Place: ${place.name}, ${place.location} (${place.yearLabel})] ${place.description}`)
    .join('\n');

  const timelineCardsText = Object.entries(enContent.timelineCards || {})
    .slice(0, 15)
    .map(([key, card]: [string, any]) => `[Tech: ${card.title}] ${card.description} (Breakthrough: ${card.breakthrough})`)
    .join('\n');

  const aboutSummary = `[Architect: ${aboutData.ownerName}] Email: ${aboutData.email}, Domain: ${aboutData.domain}. Portfolio & research archive focused on 2030–2050 innovation.`;

  return `
--- SYSTEM DOMAIN KNOWLEDGE (PUBLIC WHITELIST) ---
${erasText}

${placesText}

${timelineCardsText}

${aboutSummary}
--- END DOMAIN KNOWLEDGE ---
`;
}

/**
 * Retrieves relevant context snippet based on query keywords.
 */
export function getSiteContext(query: string, isOwner: boolean): string {
  const publicCorpus = getSanitizedPublicCorpus();
  const lowerQuery = query.toLowerCase();

  const lines = publicCorpus.split('\n');
  const matchedLines = lines.filter((line) => {
    if (!line.trim()) return false;
    const words = lowerQuery.split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) return true;
    return words.some((w) => line.toLowerCase().includes(w));
  });

  const relevantSection = matchedLines.length > 0 ? matchedLines.join('\n') : publicCorpus;

  if (isOwner) {
    return `
${relevantSection}

--- CONFIDENTIAL OWNER PROFILE & BUSINESS CONTEXT ---
Owner Name: ${activeOwnerProfile.name}
Role: ${activeOwnerProfile.role}
Background / About: ${activeOwnerProfile.about}
Interaction Preferences: ${activeOwnerProfile.preferences}
Internal Business Notes: ${activeOwnerProfile.businessNotes}
--- END CONFIDENTIAL OWNER CONTEXT ---
`;
  }

  return relevantSection;
}

/**
 * Log conversation turn.
 */
export function recordConversationTurn(
  sessionId: string,
  userMessage: string,
  modelReply: string,
  isOwner: boolean,
  language?: string
) {
  telemetryStats.totalRequests += 1;

  let session = conversationSessions.find((s) => s.sessionId === sessionId);
  if (!session) {
    telemetryStats.totalConversations += 1;
    session = {
      sessionId,
      startedAt: new Date().toISOString(),
      isOwner,
      turns: [],
    };
    conversationSessions.unshift(session);
    if (conversationSessions.length > 100) {
      conversationSessions.pop();
    }
  }

  const userTurn: ConversationLogItem = {
    id: `turn-${Date.now()}-u`,
    timestamp: new Date().toISOString(),
    role: 'user',
    text: userMessage,
    isOwner,
    language,
  };

  const modelTurn: ConversationLogItem = {
    id: `turn-${Date.now()}-m`,
    timestamp: new Date().toISOString(),
    role: 'model',
    text: modelReply,
    isOwner,
    language,
  };

  session.turns.push(userTurn, modelTurn);
  // Keep last 20 turns
  if (session.turns.length > 20) {
    session.turns = session.turns.slice(-20);
  }
}

/**
 * Record an error for stats.
 */
export function recordErrorOccurrence() {
  telemetryStats.totalErrors += 1;
}

/**
 * Accessor for Owner Profile.
 */
export function getOwnerProfile(): OwnerProfile {
  return { ...activeOwnerProfile };
}

/**
 * Updater for Owner Profile.
 */
export function updateOwnerProfile(newProfile: Partial<OwnerProfile>): OwnerProfile {
  activeOwnerProfile = {
    ...activeOwnerProfile,
    ...newProfile,
  };
  return { ...activeOwnerProfile };
}
