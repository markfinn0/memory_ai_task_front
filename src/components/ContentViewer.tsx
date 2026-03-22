import { useState } from 'react';
import { DocumentRecord } from '../types';
import { FileText, Table, FileCode, Eye, Code } from 'lucide-react';

interface ContentViewerProps {
  document: DocumentRecord;
}

function parseCsvToTable(csvContent: string): { headers: string[]; rows: string[][] } {
  const lines = csvContent.trim().split('\n');
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);

  return { headers, rows };
}

function isJsonContent(content: string): boolean {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

function CsvTableView({ content }: { content: string }) {
  const { headers, rows } = parseCsvToTable(content);

  if (headers.length === 0) {
    return <p className="text-sm text-gray-500 italic">No data to display</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-blue-50">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-2.5 text-left text-xs font-semibold text-blue-700 uppercase tracking-wide border-b border-blue-100 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="px-4 py-2 text-gray-700 border-b border-gray-100 whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PdfViewer({ dataUrl }: { dataUrl: string }) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
      <iframe
        src={dataUrl}
        className="w-full border-0"
        style={{ height: '600px' }}
        title="PDF Preview"
      />
    </div>
  );
}

function JsonViewer({ content }: { content: string }) {
  let formatted: string;
  try {
    formatted = JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    formatted = content;
  }

  return (
    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-900 text-green-400 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
      {formatted}
    </pre>
  );
}

function XmlViewer({ content }: { content: string }) {
  return (
    <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-900 text-amber-300 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
      {content}
    </pre>
  );
}

function TextViewer({ content }: { content: string }) {
  return (
    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-white p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto leading-relaxed">
      {content}
    </pre>
  );
}

export default function ContentViewer({ document: doc }: ContentViewerProps) {
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const fileType = doc.metadata.fileType.toLowerCase();

  const canRender = ['.csv', '.pdf', '.json', '.xml'].includes(fileType) ||
    (fileType === '.pdf' && doc.fileDataUrl);

  const getFileIcon = () => {
    switch (fileType) {
      case '.csv':
      case '.xls':
      case '.xlsx':
        return <Table size={14} className="text-emerald-600" />;
      case '.pdf':
        return <FileText size={14} className="text-red-500" />;
      case '.json':
      case '.xml':
        return <FileCode size={14} className="text-purple-600" />;
      default:
        return <FileText size={14} className="text-blue-600" />;
    }
  };

  const getFileLabel = () => {
    switch (fileType) {
      case '.csv': return 'Table View';
      case '.pdf': return 'PDF Preview';
      case '.json': return 'JSON View';
      case '.xml': return 'XML View';
      case '.xls':
      case '.xlsx': return 'Spreadsheet';
      default: return 'Text View';
    }
  };

  const renderContent = () => {
    if (viewMode === 'raw') {
      return <TextViewer content={doc.content} />;
    }

    switch (fileType) {
      case '.csv':
        return <CsvTableView content={doc.content} />;
      case '.pdf':
        if (doc.fileDataUrl) {
          return <PdfViewer dataUrl={doc.fileDataUrl} />;
        }
        return (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <FileText size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">PDF preview not available for this document.</p>
            <p className="text-xs text-gray-400 mt-1">Upload the PDF again to enable the preview.</p>
          </div>
        );
      case '.json':
        if (isJsonContent(doc.content)) {
          return <JsonViewer content={doc.content} />;
        }
        return <TextViewer content={doc.content} />;
      case '.xml':
        return <XmlViewer content={doc.content} />;
      default:
        return <TextViewer content={doc.content} />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          {getFileIcon()}
          Document Content — {getFileLabel()}
        </h4>
        {canRender && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('rendered')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'rendered'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Eye size={12} />
              Preview
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'raw'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Code size={12} />
              Raw
            </button>
          </div>
        )}
      </div>
      {renderContent()}
    </div>
  );
}
