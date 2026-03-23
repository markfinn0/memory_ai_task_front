import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Globe, Lock, User, Bot } from 'lucide-react';
import { ChatSession, ChatMessage } from '../types';
import { getChatById, isAuthor, sendMessage } from '../services/chatService';
import SourceBadge from '../components/SourceBadge';

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const [chat, setChat] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatId) {
      setLoading(true);
      getChatById(chatId)
        .then((loaded) => {
          setChat(loaded ?? null);
          if (loaded) {
            setIsOwner(isAuthor(chatId, loaded.authorToken));
          }
        })
        .catch(() => setChat(null))
        .finally(() => setLoading(false));
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  async function handleSend() {
    if (!input.trim() || !chatId || isSending) return;

    const userMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setChat((prev) => {
      if (!prev) return prev;
      return { ...prev, messages: [...prev.messages, userMsg] };
    });

    const msgContent = input.trim();
    setInput('');
    setIsSending(true);

    const assistantMsg = await sendMessage(chatId, msgContent);

    if (assistantMsg) {
      setChat((prev) => {
        if (!prev) return prev;
        return { ...prev, messages: [...prev.messages, assistantMsg] };
      });
    }

    setIsSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-medium">Chat not found</p>
          <Link to="/chats" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
            Back to chat list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {/* Chat Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/chats"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h2 className="font-semibold text-gray-900">{chat.title}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <User size={10} />
                  {chat.createdBy}
                </span>
                <span className="flex items-center gap-1">
                  <Globe size={10} />
                  Public
                </span>
              </div>
            </div>
          </div>
          <div>
            {isOwner ? (
              <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                <Lock size={10} />
                You are the author
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                <Globe size={10} />
                View only
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {chat.messages.length === 0 && (
            <div className="text-center py-16">
              <Bot size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No messages yet</p>
              {isOwner ? (
                <p className="text-gray-400 text-sm mt-1">
                  Start the conversation by typing a message below.
                </p>
              ) : (
                <p className="text-gray-400 text-sm mt-1">
                  Only the author can send messages in this chat.
                </p>
              )}
            </div>
          )}

          {chat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} className="text-emerald-600" />
                </div>
              )}
              <div
                className={`max-w-xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3'
                    : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md px-4 py-3'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`text-[10px] ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.source && <SourceBadge source={msg.source} />}
                </div>
                {msg.source?.type === 'elasticsearch' && (
                  <p className="text-[10px] mt-1 opacity-60">
                    This answer was retrieved from Elasticsearch — no AI tokens were used.
                  </p>
                )}
                {msg.source?.type === 'new' && (
                  <p className="text-[10px] mt-1 opacity-60">
                    Fresh response generated by AI for this interaction.
                  </p>
                )}
                {msg.source?.documentsUsed && msg.source.documentsUsed.length > 0 && (
                  <p className="text-[10px] mt-1 opacity-60">
                    Sources: {msg.source.documentsUsed.length} document{msg.source.documentsUsed.length !== 1 ? 's' : ''} used
                  </p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                  <User size={16} className="text-blue-600" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} className="text-emerald-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {isOwner ? (
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <Lock size={14} />
                Only the author ({chat.createdBy}) can send messages in this conversation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
