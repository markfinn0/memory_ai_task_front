import { useState, useEffect } from 'react';
import { Search, FileText, User, Calendar, Tag, ChevronDown, ChevronUp, Hash, Trash2 } from 'lucide-react';
import { DocumentRecord } from '../types';
import { getAllDocuments, searchDocuments, deleteDocument } from '../services/documentService';
import ContentViewer from '../components/ContentViewer';

export default function CatalogPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllDocuments()
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setLoading(true);
      searchDocuments(searchQuery)
        .then(setDocuments)
        .catch(() => setDocuments([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(true);
      getAllDocuments()
        .then(setDocuments)
        .catch(() => setDocuments([]))
        .finally(() => setLoading(false));
    }
  }, [searchQuery]);

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async function handleDelete() {
    if (!deleteTarget || !deletePassword.trim()) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteDocument(deleteTarget, deletePassword.trim());
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget));
      setDeleteTarget(null);
      setDeletePassword('');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setDeleting(false);
    }
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
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
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
                      <ContentViewer document={doc} />
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
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Full Metadata
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(doc.id);
                            setDeleteError('');
                            setDeletePassword('');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Document</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter the admin password to delete this document. This action cannot be undone.
            </p>
            {deleteError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {deleteError}
              </div>
            )}
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || !deletePassword.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
