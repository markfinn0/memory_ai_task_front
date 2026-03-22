import Cookies from 'js-cookie';
import { ChatSession, ChatMessage } from '../types';
import { apiCall } from './api';

const COOKIE_PREFIX = 'memory_ai_chat_';

interface GetChatsResponse {
  chats: ChatSession[];
  count: number;
}

interface GetChatResponse {
  chat: ChatSession;
}

interface CreateChatResponse {
  message: string;
  chat: ChatSession;
}

interface SendMessageResponse {
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
}

export async function getAllChats(): Promise<ChatSession[]> {
  const result = await apiCall<GetChatsResponse>('get_chats');
  return result.chats;
}

export async function getChatById(id: string): Promise<ChatSession | undefined> {
  try {
    const result = await apiCall<GetChatResponse>('get_chat', { chatId: id });
    return result.chat;
  } catch {
    return undefined;
  }
}

export function isAuthor(chatId: string, authorToken?: string): boolean {
  const token = Cookies.get(`${COOKIE_PREFIX}${chatId}`);
  if (!token) return false;
  if (authorToken) return token === authorToken;
  return !!token;
}

export function getAuthorToken(chatId: string): string | undefined {
  return Cookies.get(`${COOKIE_PREFIX}${chatId}`);
}

export async function createChat(title: string, createdBy: string): Promise<ChatSession> {
  const result = await apiCall<CreateChatResponse>('create_chat', { title, createdBy });
  const chat = result.chat;

  // Save the author token in a cookie
  Cookies.set(`${COOKIE_PREFIX}${chat.id}`, chat.authorToken, { expires: 30 });

  return chat;
}

export async function sendMessage(chatId: string, content: string): Promise<ChatMessage | null> {
  const authorToken = getAuthorToken(chatId);
  if (!authorToken) return null;

  const result = await apiCall<SendMessageResponse>('send_message', {
    chatId,
    message: content,
    authorToken,
  });

  return result.aiMessage;
}

interface DeleteChatResponse {
  message: string;
  chatId: string;
}

export async function deleteChat(chatId: string, password: string): Promise<void> {
  await apiCall<DeleteChatResponse>('delete_chat', { chatId, password });
  // Remove the author cookie for this chat
  Cookies.remove(`${COOKIE_PREFIX}${chatId}`);
}
