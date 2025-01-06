import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Copy, Eye, Code } from 'lucide-react';
import { marked } from 'marked';
import Prism from 'prismjs';
import { fetchFileContent, isCodeFile } from '../utils/github';
import { Toast } from './Toast';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markdown';

export const FileViewer: React.FC = () => {
  const { repoName, '*': filePath } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'raw' | 'preview'>('raw');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const url = `https://api.github.com/repos/DUB55/${repoName}/contents/${filePath}`;
        const data = await fetchFileContent(url);
        setContent(data);
        setError(null);
        
        // Set preview mode by default for markdown files
        if (filePath?.endsWith('.md')) {
          setViewMode('preview');
        }
        
        if (isCodeFile(filePath || '')) {
          setTimeout(() => Prism.highlightAll(), 0);
        }
      } catch (err) {
        setError('Failed to fetch file content');
      } finally {
        setLoading(false);
      }
    };

    if (repoName && filePath) {
      fetchContent();
    }
  }, [repoName, filePath]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setShowToast(true);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath?.split('/').pop() || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (loading) return <div className="text-white">Loading...</div>;
    if (error) return <div className="text-red-400">{error}</div>;

    if (filePath?.endsWith('.md') && viewMode === 'preview') {
      return (
        <div 
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: marked(content) }}
        />
      );
    }

    return (
      <pre className="p-4 rounded-lg bg-gray-900 overflow-x-auto">
        <code className={`language-${filePath?.split('.').pop()}`}>
          {content}
        </code>
      </pre>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-white hover:text-blue-200 transition"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-4">
          {filePath?.endsWith('.md') && (
            <button
              onClick={() => setViewMode(viewMode === 'raw' ? 'preview' : 'raw')}
              className="flex items-center space-x-2 text-white hover:text-blue-200 transition"
            >
              {viewMode === 'raw' ? (
                <>
                  <Eye size={20} />
                  <span>Preview</span>
                </>
              ) : (
                <>
                  <Code size={20} />
                  <span>Raw</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 text-white hover:text-blue-200 transition"
          >
            <Copy size={20} />
            <span>Copy</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 text-white hover:text-blue-200 transition"
          >
            <Download size={20} />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {filePath?.split('/').pop()}
        </h2>
        {renderContent()}
      </div>

      <Toast 
        message="Content copied to clipboard!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};