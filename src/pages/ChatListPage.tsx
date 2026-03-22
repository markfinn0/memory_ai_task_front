import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, User, Calendar, Lock, Globe, MessageCircle } from 'lucide-react';
import { ChatSession } from '../types';
import { getAllChats, createChat, isAuthor } from '../services/chatService';

export default function ChatListPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setChats(getAllChats());
  }, []);

  function handleCreateChat() {
    if (!newTitle.trim()) {
      setError('Please enter a chat title.');
      return;
    }
    if (!newAuthor.trim()) {
      setError('Please enter your name.');
      return;
    }

    const chat = createChat(newTitle.trim(), newAuthor.trim());
    setChats([chat, ...chats]);
    setShowNewChat(false);
    setNewTitle('');
    setNewAuthor('');
    setError('');
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Chat Sessions</h1>
          <p className="text-gray-500 text-sm">
            All conversations are public. Only the author can send messages.
          </p>
        </div>
        <button
          onClick={() => setShowNewChat(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* New Chat Form */}
      {showNewChat && (
        <div className="mb-6 p-5 bg-white border border-blue-200 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Start a New Conversation</h3>
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Chat title (e.g., Revenue Analysis Discussion)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <input
              type="text"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateChat}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Chat
              </button>
              <button
                onClick={() => {
                  setShowNewChat(false);
                  setError('');
                }}
                className="px-5 py-2.5 text-gray-600 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400 flex items-center gap-1">
            <Lock size={10} />
            A cookie will be saved to authenticate you as the author of this chat.
          </p>
        </div>
      )}

      {/* Chat List */}
      {chats.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No conversations yet</p>
          <p className="text-gray-400 text-sm mt-1">Start a new chat to interact with the AI.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => {
            const isOwner = isAuthor(chat.id);
            return (
              <Link
                key={chat.id}
                to={`/chats/${chat.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-gray-900 truncate">{chat.title}</h3>
                      {isOwner && (
                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {chat.createdBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(chat.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={12} />
                        {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe size={12} />
                        Public
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
