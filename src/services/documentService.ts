import { v4 as uuidv4 } from 'uuid';
import { DocumentRecord, DocumentMetadata, EmbeddingInfo, ALLOWED_FILE_TYPES, BLOCKED_FILE_TYPES } from '../types';
import { MOCK_DOCUMENTS } from './mockData';

const STORAGE_KEY = 'memory_ai_documents';

function getStoredDocuments(): DocumentRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as DocumentRecord[];
    }
  } catch {
    // If parsing fails, start fresh
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DOCUMENTS));
  return [...MOCK_DOCUMENTS];
}

function saveDocuments(docs: DocumentRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function validateFileType(fileName: string): { valid: boolean; message: string } {
  const extension = '.' + fileName.split('.').pop()?.toLowerCase();

  if (BLOCKED_FILE_TYPES.includes(extension)) {
    return { valid: false, message: 'Video and audio files are not allowed. Please upload documents only (PDF, CSV, TXT, DOC, DOCX, XLS, XLSX, JSON, XML).' };
  }

  if (!ALLOWED_FILE_TYPES.includes(extension as typeof ALLOWED_FILE_TYPES[number])) {
    return { valid: false, message: `File type "${extension}" is not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` };
  }

  return { valid: true, message: '' };
}

function generateMockEmbedding(): EmbeddingInfo {
  return {
    model: 'text-embedding-ada-002',
    dimensions: 1536,
    vector: Array.from({ length: 10 }, () => parseFloat((Math.random() * 2 - 1).toFixed(6))),
    tokenCount: Math.floor(Math.random() * 300) + 50,
    createdAt: new Date().toISOString(),
  };
}

function extractFileContent(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text.substring(0, 2000));
    };
    reader.onerror = () => {
      resolve('[Content could not be extracted - will be processed by AWS]');
    };
    reader.readAsText(file);
  });
}

export async function uploadDocument(
  file: File,
  metadata: Omit<DocumentMetadata, 'id' | 'fileType' | 'fileSize' | 'uploadedAt'>
): Promise<DocumentRecord> {
  const content = await extractFileContent(file);

  const docId = uuidv4();
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();

  const fullMetadata: DocumentMetadata = {
    ...metadata,
    id: docId,
    fileType: extension,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
  };

  const record: DocumentRecord = {
    id: docId,
    metadata: fullMetadata,
    content,
    embedding: generateMockEmbedding(),
  };

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const docs = getStoredDocuments();
  docs.unshift(record);
  saveDocuments(docs);

  return record;
}

export function getAllDocuments(): DocumentRecord[] {
  return getStoredDocuments();
}

export function getDocumentById(id: string): DocumentRecord | undefined {
  const docs = getStoredDocuments();
  return docs.find((d) => d.id === id);
}

export function searchDocuments(query: string): DocumentRecord[] {
  const docs = getStoredDocuments();
  const lower = query.toLowerCase();
  return docs.filter(
    (d) =>
      d.metadata.fileName.toLowerCase().includes(lower) ||
      d.metadata.author.toLowerCase().includes(lower) ||
      d.metadata.context.toLowerCase().includes(lower) ||
      d.metadata.tags.some((t) => t.toLowerCase().includes(lower)) ||
      d.content.toLowerCase().includes(lower)
  );
}
