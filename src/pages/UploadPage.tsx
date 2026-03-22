import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileText, CheckCircle, Lock } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import InfoTooltip from '../components/InfoTooltip';
import { validateFileType } from '../services/documentService';
import { uploadDocument } from '../services/documentService';

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  // Step 1 fields
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [author, setAuthor] = useState('');

  // Step 2 fields
  const [context, setContext] = useState('');
  const [tags, setTags] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFileType(file.name);
    if (!validation.valid) {
      setError(validation.message);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError('');
    setSelectedFile(file);
    if (!fileName) setFileName(file.name);
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleNextStep() {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    if (!fileName.trim()) {
      setError('Please enter the file name.');
      return;
    }
    if (!author.trim()) {
      setError('Please enter the author name.');
      return;
    }
    setError('');
    setStep(2);
  }

  function handleBack() {
    setStep(1);
    setError('');
  }

  async function handleSubmit() {
    if (!context.trim()) {
      setError('Please provide the document context.');
      return;
    }
    if (!uploadedBy.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!selectedFile) return;

    setError('');
    setIsUploading(true);

    try {
      await uploadDocument(selectedFile, {
        fileName: fileName.trim(),
        author: author.trim(),
        context: context.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        uploadedBy: uploadedBy.trim(),
        deletePassword: deletePassword.trim() || undefined,
      });
      setUploadSuccess(true);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Uploaded!</h2>
          <p className="text-gray-500 mb-8">
            Your document has been processed and embeddings have been generated. You can view it in the catalog.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/catalog')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Catalog
            </button>
            <button
              onClick={() => {
                setUploadSuccess(false);
                setStep(1);
                setSelectedFile(null);
                setFileName('');
                setAuthor('');
                setContext('');
                setTags('');
                setUploadedBy('');
                setDeletePassword('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-10">
      <div className="max-w-lg w-full">
        <StepIndicator
          currentStep={step}
          totalSteps={2}
          labels={['File & Info', 'Context & Tags']}
        />

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Upload Document
                <InfoTooltip text="Accepted formats: PDF, CSV, TXT, DOC, DOCX, XLS, XLSX, JSON, XML. Videos and audios are not allowed." />
              </label>
              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                >
                  <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Click to select a file</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, CSV, TXT, DOC, DOCX, XLS, XLSX, JSON, XML</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <FileText size={20} className="text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.csv,.txt,.doc,.docx,.xls,.xlsx,.json,.xml"
                onChange={handleFileSelect}
              />
            </div>

            {/* File Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                File Name
                <InfoTooltip text="A descriptive name for this document that will appear in the catalog." />
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter the document name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Author
                <InfoTooltip text="The original author or creator of this document." />
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter the author name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleNextStep}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {/* Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Context / Description
                <InfoTooltip text="Describe what this document is about. This context helps the AI understand and retrieve relevant information." />
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Describe the content and purpose of this document"
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tags
                <InfoTooltip text="Comma-separated tags to categorize this document (e.g., finance, report, quarterly)." />
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Uploaded By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Username
                <InfoTooltip text="Your username will be associated with this upload." />
              </label>
              <input
                type="text"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Delete Password (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <Lock size={14} />
                  Delete Password
                  <span className="text-gray-400 font-normal">(optional)</span>
                  <InfoTooltip text="Set a password to protect this document from deletion. If left empty, a default admin password will be used." />
                </span>
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Set a password to protect deletion"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upload Document'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
