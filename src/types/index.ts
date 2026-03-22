export interface DocumentMetadata {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  author: string;
  context: string;
  tags: string[];
  uploadedAt: string;
  uploadedBy: string;
}

export interface DocumentRecord {
  id: string;
  metadata: DocumentMetadata;
  content: string;
  embedding: EmbeddingInfo;
}

export interface EmbeddingInfo {
  model: string;
  dimensions: number;
  vector: number[];
  tokenCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: MessageSource;
}

export interface MessageSource {
  type: 'reused' | 'new';
  confidence?: number;
  originalChatId?: string;
  documentsUsed?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  createdBy: string;
  authorToken: string;
  messages: ChatMessage[];
  isPublic: boolean;
}

export type AllowedFileType = '.pdf' | '.csv' | '.txt' | '.doc' | '.docx' | '.xls' | '.xlsx' | '.json' | '.xml';

export const ALLOWED_FILE_TYPES: AllowedFileType[] = [
  '.pdf', '.csv', '.txt', '.doc', '.docx', '.xls', '.xlsx', '.json', '.xml'
];

export const BLOCKED_FILE_TYPES = [
  '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv',
  '.mp3', '.wav', '.aac', '.ogg', '.flac', '.wma',
  '.webm', '.m4a', '.m4v'
];
