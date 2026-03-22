import { DocumentRecord, ChatSession } from '../types';

export const MOCK_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-001',
    metadata: {
      id: 'doc-001',
      fileName: 'quarterly_report_q4.pdf',
      fileType: '.pdf',
      fileSize: 2048576,
      author: 'Maria Silva',
      context: 'Financial quarterly report for Q4 2025 containing revenue analysis, expense breakdown, and projections for 2026.',
      tags: ['finance', 'quarterly', 'report'],
      uploadedAt: '2025-12-15T10:30:00Z',
      uploadedBy: 'maria.silva',
    },
    content: 'Q4 2025 Financial Report\n\nRevenue: $4.2M (+15% YoY)\nOperating Expenses: $2.8M\nNet Income: $1.4M\n\nKey Highlights:\n- Cloud services revenue grew 28%\n- Customer acquisition cost decreased by 12%\n- Employee headcount increased to 156\n\nProjections for 2026:\n- Expected revenue growth of 20-25%\n- Planned expansion into European markets\n- New product line launch in Q2',
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      vector: Array.from({ length: 10 }, () => Math.random() * 2 - 1),
      tokenCount: 245,
      createdAt: '2025-12-15T10:31:00Z',
    },
  },
  {
    id: 'doc-002',
    metadata: {
      id: 'doc-002',
      fileName: 'customer_feedback_data.csv',
      fileType: '.csv',
      fileSize: 524288,
      author: 'Carlos Mendes',
      context: 'Aggregated customer feedback data from support tickets and surveys collected during November 2025.',
      tags: ['customer', 'feedback', 'data'],
      uploadedAt: '2025-11-30T14:20:00Z',
      uploadedBy: 'carlos.mendes',
    },
    content: 'ticket_id,date,category,sentiment,score,feedback\n1001,2025-11-01,UI/UX,positive,4.5,"Great new dashboard design"\n1002,2025-11-02,Performance,negative,2.0,"Loading times are slow"\n1003,2025-11-03,Features,positive,4.0,"Love the new export feature"\n1004,2025-11-05,Support,positive,5.0,"Quick and helpful response"\n1005,2025-11-07,Performance,neutral,3.0,"Could be faster"',
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      vector: Array.from({ length: 10 }, () => Math.random() * 2 - 1),
      tokenCount: 180,
      createdAt: '2025-11-30T14:21:00Z',
    },
  },
  {
    id: 'doc-003',
    metadata: {
      id: 'doc-003',
      fileName: 'api_documentation.txt',
      fileType: '.txt',
      fileSize: 102400,
      author: 'Ana Rodrigues',
      context: 'Internal API documentation for the memory management endpoints including authentication and rate limiting.',
      tags: ['api', 'documentation', 'technical'],
      uploadedAt: '2025-10-20T09:15:00Z',
      uploadedBy: 'ana.rodrigues',
    },
    content: 'Memory Management API v2.0\n\nBase URL: https://api.memoryai.com/v2\n\nEndpoints:\n\nPOST /documents\n- Upload and process a document\n- Requires: Authorization header\n- Body: multipart/form-data\n\nGET /documents/:id\n- Retrieve document with embeddings\n- Returns: DocumentRecord object\n\nPOST /chat\n- Send a message to the AI\n- Body: { message: string, chatId?: string }\n- Returns: ChatResponse with source info\n\nRate Limits:\n- 100 requests per minute\n- 10 document uploads per hour',
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      vector: Array.from({ length: 10 }, () => Math.random() * 2 - 1),
      tokenCount: 156,
      createdAt: '2025-10-20T09:16:00Z',
    },
  },
];

export const MOCK_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'chat-001',
    title: 'Revenue Analysis Discussion',
    createdAt: '2025-12-16T08:00:00Z',
    createdBy: 'Maria Silva',
    authorToken: 'mock-token-001',
    isPublic: true,
    messages: [
      {
        id: 'msg-001',
        role: 'user',
        content: 'What was the revenue for Q4 2025?',
        timestamp: '2025-12-16T08:00:00Z',
      },
      {
        id: 'msg-002',
        role: 'assistant',
        content: 'Based on the quarterly report, the revenue for Q4 2025 was $4.2M, which represents a 15% year-over-year growth. Cloud services revenue specifically grew by 28%.',
        timestamp: '2025-12-16T08:00:05Z',
        source: {
          type: 'new',
          confidence: 0.95,
          documentsUsed: ['doc-001'],
        },
      },
      {
        id: 'msg-003',
        role: 'user',
        content: 'What are the projections for 2026?',
        timestamp: '2025-12-16T08:01:00Z',
      },
      {
        id: 'msg-004',
        role: 'assistant',
        content: 'According to the Q4 2025 report, the projections for 2026 include:\n\n1. Expected revenue growth of 20-25%\n2. Planned expansion into European markets\n3. New product line launch in Q2 2026',
        timestamp: '2025-12-16T08:01:05Z',
        source: {
          type: 'new',
          confidence: 0.92,
          documentsUsed: ['doc-001'],
        },
      },
    ],
  },
  {
    id: 'chat-002',
    title: 'Customer Feedback Insights',
    createdAt: '2025-12-01T11:00:00Z',
    createdBy: 'Carlos Mendes',
    authorToken: 'mock-token-002',
    isPublic: true,
    messages: [
      {
        id: 'msg-005',
        role: 'user',
        content: 'What are the main customer complaints?',
        timestamp: '2025-12-01T11:00:00Z',
      },
      {
        id: 'msg-006',
        role: 'assistant',
        content: 'Based on the customer feedback data, the main complaints are related to Performance, specifically loading times. One customer rated it 2.0/5 saying "Loading times are slow". There was also a neutral comment about performance suggesting things "Could be faster".',
        timestamp: '2025-12-01T11:00:05Z',
        source: {
          type: 'new',
          confidence: 0.88,
          documentsUsed: ['doc-002'],
        },
      },
    ],
  },
];

const MOCK_AI_RESPONSES: Record<string, { content: string; type: 'reused' | 'new'; originalChatId?: string; documentsUsed?: string[] }> = {
  revenue: {
    content: 'Based on the quarterly report, the revenue for Q4 2025 was $4.2M, which represents a 15% year-over-year growth.',
    type: 'reused',
    originalChatId: 'chat-001',
  },
  projection: {
    content: 'The projections for 2026 include expected revenue growth of 20-25%, planned expansion into European markets, and a new product line launch in Q2.',
    type: 'reused',
    originalChatId: 'chat-001',
  },
  feedback: {
    content: 'The main customer complaints revolve around performance issues, particularly loading times.',
    type: 'reused',
    originalChatId: 'chat-002',
  },
  api: {
    content: 'The Memory Management API v2.0 has several endpoints including POST /documents for uploads, GET /documents/:id for retrieval, and POST /chat for AI interaction. Rate limits are 100 requests per minute and 10 document uploads per hour.',
    type: 'new',
    documentsUsed: ['doc-003'],
  },
};

export function getMockAIResponse(userMessage: string): { content: string; source: { type: 'reused' | 'new'; confidence: number; originalChatId?: string; documentsUsed?: string[] } } {
  const lowerMsg = userMessage.toLowerCase();

  for (const [keyword, response] of Object.entries(MOCK_AI_RESPONSES)) {
    if (lowerMsg.includes(keyword)) {
      return {
        content: response.content,
        source: {
          type: response.type,
          confidence: response.type === 'reused' ? 0.92 : 0.85,
          originalChatId: response.originalChatId,
          documentsUsed: response.type === 'new' ? response.documentsUsed : undefined,
        },
      };
    }
  }

  return {
    content: `I've analyzed your question: "${userMessage}". Based on the available documents and previous conversations, here is a synthesized response. This is a new analysis that hasn't been generated before, drawing from multiple sources in the knowledge base.`,
    source: {
      type: 'new',
      confidence: 0.75,
      documentsUsed: ['doc-001', 'doc-002'],
    },
  };
}
