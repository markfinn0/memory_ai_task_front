import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import { ChatSession, ChatMessage } from '../types';
import { MOCK_CHAT_SESSIONS, getMockAIResponse } from './mockData';

const STORAGE_KEY = 'memory_ai_chats';
const COOKIE_PREFIX = 'memory_ai_chat_';

function getStoredChats(): ChatSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ChatSession[];
    }
  } catch {
    // If parsing fails, start fresh
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CHAT_SESSIONS));
  return [...MOCK_CHAT_SESSIONS];
}

function saveChats(chats: ChatSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export function getAllChats(): ChatSession[] {
  return getStoredChats();
}

export function getChatById(id: string): ChatSession | undefined {
  const chats = getStoredChats();
  return chats.find((c) => c.id === id);
}

export function isAuthor(chatId: string): boolean {
  const token = Cookies.get(`${COOKIE_PREFIX}${chatId}`);
  const chat = getChatById(chatId);
  return !!token && !!chat && chat.authorToken === token;
}

export function createChat(title: string, createdBy: string): ChatSession {
  const chatId = uuidv4();
  const authorToken = uuidv4();

  const newChat: ChatSession = {
    id: chatId,
    title,
    createdAt: new Date().toISOString(),
    createdBy,
    authorToken,
    messages: [],
    isPublic: true,
  };

  // Save the author token in a cookie
  Cookies.set(`${COOKIE_PREFIX}${chatId}`, authorToken, { expires: 30 });

  const chats = getStoredChats();
  chats.unshift(newChat);
  saveChats(chats);

  return newChat;
}

export async function sendMessage(chatId: string, content: string): Promise<ChatMessage | null> {
  if (!isAuthor(chatId)) {
    return null;
  }

  const chats = getStoredChats();
  const chatIndex = chats.findIndex((c) => c.id === chatId);
  if (chatIndex === -1) return null;

  const userMessage: ChatMessage = {
    id: uuidv4(),
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
  };

  chats[chatIndex].messages.push(userMessage);
  saveChats(chats);

  // Simulate AI response delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  const aiResponse = getMockAIResponse(content);

  const assistantMessage: ChatMessage = {
    id: uuidv4(),
    role: 'assistant',
    content: aiResponse.content,
    timestamp: new Date().toISOString(),
    source: aiResponse.source,
  };

  // Re-read chats in case of concurrent updates
  const updatedChats = getStoredChats();
  const updatedIndex = updatedChats.findIndex((c) => c.id === chatId);
  if (updatedIndex !== -1) {
    updatedChats[updatedIndex].messages.push(assistantMessage);
    saveChats(updatedChats);
  }

  return assistantMessage;
}
