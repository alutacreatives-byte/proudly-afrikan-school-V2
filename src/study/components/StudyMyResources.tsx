import React, { useState } from 'react';
import { 
  FolderOpen, 
  Search, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  Layers,
  CheckSquare,
  FileCheck2,
  Presentation,
  GraduationCap,
  GitBranch,
  Download
} from 'lucide-react';
import { StudyToolType } from '../types';
import { getSavedResources, deleteResourceFromStorage } from '../../build/utils/storage';

interface StudyMyResourcesProps {
  onBack: () => void;
  onOpenResource: (resource: any) => void;
}

export const StudyMyResources: React.FC<StudyMyResourcesProps> = ({
  onBack,
  onOpenResource,
}) => {
  const [resources, setResources] = useState<any[]>(getSavedResources());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteResourceFromStorage(id);
    setResources(getSavedResources());
  };

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'study-guide': return <FileText className="w-4 h-4 text-[#E63956]" />;
      case 'flashcards': return <Layers className="w-4 h-4 text-emerald-600" />;
      case 'quiz': return <CheckSquare className="w-4 h-4 text-sky-600" />;
      case 'pdf-quiz': return <FileCheck2 className="w-4 h-4 text-purple-600" />;
      case 'presentation': return <Presentation className="w-4 h-4 text-amber-600" />;
      case 'course': return <GraduationCap className="w-4 h-4 text-indigo-600" />;
      case 'learning-path': return <GitBranch className="w-4 h-4 text-teal-600" />;
      default: return <FileText className="w-4 h-4 text-stone-600" />;
    }
  };

  // Only show resources relevant to study or all saved
  const filtered = resources.filter((res) => {
    const matchesSearch = (res.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.topic || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || res.toolType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#161616]">
              My Study Library ({resources.length})
            </h1>
            <p className="font-sans text-xs sm:text-sm text-stone-500">
              Access and review your saved study guides, flashcard sets, quizzes, slide decks, and roadmaps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search study library..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-full font-mono text-xs text-stone-800 focus:outline-hidden focus:border-[#E63956]"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Resources' },
          { id: 'study-guide', label: 'Study Guides' },
          { id: 'flashcards', label: 'Flashcards' },
          { id: 'quiz', label: 'Quizzes' },
          { id: 'pdf-quiz', label: 'PDF Quizzes' },
          { id: 'presentation', label: 'Presentations' },
          { id: 'course', label: 'Courses' },
          { id: 'learning-path', label: 'Roadmaps' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              filterType === tab.id
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid or Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E0D8] rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="font-display font-black text-lg text-[#161616] uppercase">
              No Saved Resources Found
            </h3>
            <p className="font-sans text-xs text-stone-500">
              When you generate study guides, flashcards, quizzes, or slides, click "Save" to keep them here for ongoing revision.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenResource(item)}
              className="bg-white border border-stone-200 hover:border-[#E63956]/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getToolIcon(item.toolType)}
                    <span className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      {item.toolType.replace('-', ' ')}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-stone-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-display font-black text-base text-[#161616] uppercase group-hover:text-[#E63956] transition-colors line-clamp-2">
                  {item.title}
                </h3>

                {item.subject && (
                  <span className="inline-block font-mono text-[10px] px-2 py-0.5 bg-pink-50 text-[#E63956] border border-pink-200/60 rounded-md font-semibold">
                    {item.subject}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete resource"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#E63956] group-hover:translate-x-0.5 transition-transform">
                  <span>Open Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
