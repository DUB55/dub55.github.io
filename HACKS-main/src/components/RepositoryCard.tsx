import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder } from 'lucide-react';
import type { Repository } from '../types';

interface Props {
  repository: Repository;
}

export const RepositoryCard: React.FC<Props> = ({ repository }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/explorer/${repository.name}`)}
      className="bg-white/10 backdrop-blur-sm rounded-lg p-6 cursor-pointer
                 transform transition-all duration-200 hover:scale-105
                 border border-white/20 hover:border-white/40"
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <Folder size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{repository.name}</h3>
          {repository.description && (
            <p className="text-blue-100 mt-1">{repository.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};