import { DocumentRecord, DocumentMetadata, ALLOWED_FILE_TYPES, BLOCKED_FILE_TYPES } from '../types';
import { apiCall } from './api';

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

interface UploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
  docId: string;
  contentType: string;
}

interface UploadResponse {
  message: string;
  document: DocumentRecord;
}

export async function uploadDocument(
  file: File,
  metadata: Omit<DocumentMetadata, 'id' | 'fileType' | 'fileSize' | 'uploadedAt'> & { deletePassword?: string }
): Promise<DocumentRecord> {
  const content = await extractFileContent(file);
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();

  // Step 1: Get a presigned S3 upload URL from the backend
  const uploadInfo = await apiCall<UploadUrlResponse>('get_upload_url', {
    fileType: extension,
  });

  // Step 2: Upload the file directly to S3 using the presigned URL
  const s3Response = await fetch(uploadInfo.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': uploadInfo.contentType },
    body: file,
  });

  if (!s3Response.ok) {
    throw new Error(`File upload to S3 failed (status ${s3Response.status}). Please try again.`);
  }

  // Step 3: Create the document record in DynamoDB (with S3 reference)
  const docData: Record<string, unknown> = {
    docId: uploadInfo.docId,
    s3Key: uploadInfo.s3Key,
    fileName: metadata.fileName,
    fileType: extension,
    fileSize: file.size,
    author: metadata.author,
    context: metadata.context,
    tags: metadata.tags,
    uploadedBy: metadata.uploadedBy,
    content,
  };

  if (metadata.deletePassword) {
    docData.deletePassword = metadata.deletePassword;
  }

  const result = await apiCall<UploadResponse>('upload_document', docData);
  return result.document;
}

interface GetDocumentsResponse {
  documents: DocumentRecord[];
  count: number;
}

export async function getAllDocuments(): Promise<DocumentRecord[]> {
  const result = await apiCall<GetDocumentsResponse>('get_documents');
  return result.documents;
}

interface GetDocumentResponse {
  document: DocumentRecord;
}

export async function getDocumentById(id: string): Promise<DocumentRecord | undefined> {
  try {
    const result = await apiCall<GetDocumentResponse>('get_document', { documentId: id });
    return result.document;
  } catch {
    return undefined;
  }
}

export async function searchDocuments(query: string): Promise<DocumentRecord[]> {
  const result = await apiCall<GetDocumentsResponse>('search_documents', { query });
  return result.documents;
}

interface DeleteResponse {
  message: string;
  documentId: string;
}

export async function deleteDocument(id: string, password: string): Promise<void> {
  await apiCall<DeleteResponse>('delete_document', { documentId: id, password });
}
