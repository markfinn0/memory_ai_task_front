import { useState, useEffect } from 'react';
import { Search, FileText, User, Calendar, Tag, ChevronDown, ChevronUp, Hash } from 'lucide-react';
import { DocumentRecord } from '../types';
import { getAllDocuments, searchDocuments } from '../services/documentService';

export default function CatalogPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setDocuments(getAllDocuments());
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setDocuments(searchDocuments(searchQuery));
    } else {
      setDocuments(getAllDocuments());
    }
  }, [searchQuery]);

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Catalog</h1>
        <p className="text-gray-500">Browse all uploaded documents with their embeddings and metadata.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents by name, author, content, or tags..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {documents.length} document{documents.length !== 1 ? 's' : ''} found
      </p>

      {/* Document Cards */}
      {documents.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No documents found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or upload a new document.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => {
            const isExpanded = expandedId === doc.id;
            return (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={18} className="text-blue-600 shrink-0" />
                        <h3 className="font-semibold text-gray-900 truncate">
                          {doc.metadata.fileName}
                        </h3>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full uppercase font-medium">
                          {doc.metadata.fileType.replace('.', '')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {doc.metadata.context}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {doc.metadata.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(doc.metadata.uploadedAt)}
                        </span>
                        <span>{formatFileSize(doc.metadata.fileSize)}</span>
                        {doc.metadata.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag size={12} />
                            {doc.metadata.tags.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="ml-4 text-gray-400 hover:text-gray-600 transition-colors">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {/* Content Section */}
                    <div className="p-5 bg-gray-50">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Document Content
                      </h4>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-white p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                        {doc.content}
                      </pre>
                    </div>

                    {/* Embedding Section */}
                    <div className="p-5">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Embedding Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wide">Model</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">{doc.embedding.model}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wide">Dimensions</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">{doc.embedding.dimensions}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wide">Tokens</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">{doc.embedding.tokenCount}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wide">Created</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDate(doc.embedding.createdAt)}</p>
                        </div>
                      </div>

                      {/* Vector Preview */}
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                          <Hash size={12} />
                          Vector preview (first 10 dimensions of {doc.embedding.dimensions})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {doc.embedding.vector.map((val, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-mono px-2 py-0.5 bg-gray-100 rounded text-gray-600"
                            >
                              {val.toFixed(4)}
                            </span>
                          ))}
                          <span className="text-[11px] font-mono px-2 py-0.5 text-gray-400">...</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="p-5 bg-gray-50 border-t border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Full Metadata
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">ID:</span>{' '}
                          <span className="text-gray-700 font-mono text-xs">{doc.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Uploaded by:</span>{' '}
                          <span className="text-gray-700">{doc.metadata.uploadedBy}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">File type:</span>{' '}
                          <span className="text-gray-700">{doc.metadata.fileType}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Size:</span>{' '}
                          <span className="text-gray-700">{formatFileSize(doc.metadata.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
