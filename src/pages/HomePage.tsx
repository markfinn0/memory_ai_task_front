import { Link } from 'react-router-dom';
import { Upload, BookOpen, MessageSquare, Brain } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center">
            <Brain size={32} className="text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Test memory approaches
          <br />
          for your AI solutions
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          Upload documents, explore embeddings, and chat with AI to see how memory reuse works in practice.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Upload size={18} />
            Upload Documents
          </Link>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <BookOpen size={18} />
            Browse Catalog
          </Link>
          <Link
            to="/chats"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <MessageSquare size={18} />
            Open Chat
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-gray-400">
        This is a proof of concept for testing AI memory approaches.
      </footer>
    </div>
  );
}
