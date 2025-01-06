import React from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';

interface LayoutToggleProps {
  isGrid: boolean;
  onToggle: () => void;
}

export const LayoutToggle: React.FC<LayoutToggleProps> = ({ isGrid, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center space-x-2 text-white hover:text-blue-200 transition bg-white/10 px-4 py-2 rounded-lg"
      title={isGrid ? "Switch to list view" : "Switch to grid view"}
    >
      {isGrid ? (
        <>
          <LayoutList size={20} />
          <span>List View</span>
        </>
      ) : (
        <>
          <LayoutGrid size={20} />
          <span>Grid View</span>
        </>
      )}
    </button>
  );
};