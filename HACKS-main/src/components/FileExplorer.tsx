import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, FileText, ChevronLeft } from 'lucide-react';
import { fetchDirectoryContents } from '../utils/github';
import type { GitHubFile } from '../types';
import { clsx } from 'clsx';
import { LayoutToggle } from './LayoutToggle';

export const FileExplorer: React.FC = () => {
  const { repoName } = useParams();
  const navigate = useNavigate();
  const [contents, setContents] = useState<GitHubFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isGridView, setIsGridView] = useState(true);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        const path = currentPath.join('/');
        const url = `https://api.github.com/repos/DUB55/${repoName}/contents/${path}`;
        const data = await fetchDirectoryContents(url);
        setContents(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch repository contents');
      } finally {
        setLoading(false);
      }
    };

    if (repoName) {
      fetchContents();
    }
  }, [repoName, currentPath]);

  const handleItemClick = (item: GitHubFile) => {
    if (item.type === 'dir') {
      setCurrentPath([...currentPath, item.name]);
    } else {
      navigate(`/file/${repoName}/${[...currentPath, item.name].join('/')}`);
    }
  };

  const handleBack = () => {
    if (currentPath.length === 0) {
      navigate('/');
    } else {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 text-white p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-white hover:text-blue-200 transition"
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          <h2 className="text-2xl font-semibold text-white">
            {repoName}/{currentPath.join('/')}
          </h2>
        </div>
        <LayoutToggle isGrid={isGridView} onToggle={() => setIsGridView(!isGridView)} />
      </div>

      <div className={clsx(
        isGridView 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "flex flex-col space-y-4"
      )}>
        {contents.map((item) => (
          <div
            key={item.path}
            onClick={() => handleItemClick(item)}
            className={clsx(
              "bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer",
              "transform transition-all duration-200 hover:scale-105",
              "border border-white/20 hover:border-white/40"
            )}
          >
            <div className="flex items-center space-x-3">
              {item.type === 'dir' ? (
                <Folder size={20} className="text-blue-300" />
              ) : (
                <FileText size={20} className="text-green-300" />
              )}
              <span className="text-white">{item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};