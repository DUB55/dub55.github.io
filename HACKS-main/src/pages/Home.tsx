import React from 'react';
import { RepositoryCard } from '../components/RepositoryCard';
import { getRepositories } from '../utils/github';

export const Home: React.FC = () => {
  const repositories = getRepositories();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white text-center">
        GitHub Repository Explorer
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repositories.map((repo) => (
          <RepositoryCard key={repo.name} repository={repo} />
        ))}
      </div>
    </div>
  );
};