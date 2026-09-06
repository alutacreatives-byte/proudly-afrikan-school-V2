import React, { useState } from 'react';
import { 
  StudySet, 
  AppTab 
} from '../types';
import { 
  Search, 
  Plus, 
  BookOpen, 
  Play, 
  Download, 
  Heart, 
  Trash2, 
  Layers, 
  Calendar, 
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { exportSetToPDF, exportSetToPPTX } from '../utils/exportUtils';

interface MySetsViewProps {
  sets: StudySet[];
  onSelectSet: (set: StudySet) => void;
  onNavigateTab: (tab: AppTab) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteSet: (id: string) => void;
}

export const MySetsView: React.FC<MySetsViewProps> = ({
  sets,
  onSelectSet,
  onNavigateTab,
  onToggleFavorite,
  onDeleteSet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'African History & Civilization', 'Pan-African Economics', 'Earth Science & Geography', 'African Literature'];

  const filteredSets = sets.filter((s) => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tags && s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'All' || s.subject.includes(selectedCategory) || selectedCategory.includes(s.subject);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D8C6] pb-6">
        <div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#028090]/15 text-[#028090] uppercase tracking-widest font-mono-code">
            KNOWLEDGE VAULT & DECKS
          </span>
          <h1 className="text-3xl font-display font-extrabold text-[#161616] mt-1">
            My Study Decks & Curricula
          </h1>
          <p className="text-sm text-[#6F685B]">
            Browse your authored flashcard kits, curated Pan-African master sets, and saved notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('build')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D92B8A] hover:bg-[#BC1D73] text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Set</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9584]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, keyword, or tag..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFD5C2] bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A] text-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#161616] text-white'
                  : 'bg-white border border-[#DFD5C2] text-[#5C5546] hover:border-[#161616]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sets Grid */}
      {filteredSets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#DFD5C2] space-y-4">
          <Layers className="w-12 h-12 text-[#9E9584] mx-auto" />
          <h3 className="text-lg font-bold text-[#161616]">No study sets found</h3>
          <p className="text-sm text-[#6F685B] max-w-md mx-auto">
            Try adjusting your search criteria or create a brand new revision set in the Build studio.
          </p>
          <button
            onClick={() => onNavigateTab('build')}
            className="px-5 py-2.5 rounded-xl bg-[#D92B8A] text-white font-bold text-sm"
          >
            Build New Set
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => (
            <div
              key={set.id}
              className="bg-white rounded-2xl border border-[#DFD5C2] hover:border-[#D92B8A]/50 transition-all p-6 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md"
            >
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E59500]/15 text-[#B26B00] font-mono-code">
                    {set.subject}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleFavorite(set.id)}
                      title={set.favorite ? 'Unfavorite' : 'Favorite'}
                      className="p-1.5 rounded-lg text-[#9E9584] hover:text-rose-600 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${set.favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                    {set.id.startsWith('custom-') && (
                      <button
                        onClick={() => onDeleteSet(set.id)}
                        title="Delete set"
                        className="p-1.5 rounded-lg text-[#9E9584] hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 
                  onClick={() => {
                    onSelectSet(set);
                    onNavigateTab('study');
                  }}
                  className="font-display font-extrabold text-lg text-[#161616] leading-snug cursor-pointer hover:text-[#D92B8A] transition-colors"
                >
                  {set.title}
                </h3>

                <p className="text-xs text-[#6F685B] line-clamp-2 leading-relaxed">
                  {set.description}
                </p>
              </div>

              {/* Tags & Card Count */}
              <div className="space-y-3 pt-2 border-t border-[#E7DECD]/60">
                <div className="flex items-center justify-between text-xs text-[#6F685B] font-medium">
                  <span className="flex items-center gap-1 font-mono-code font-bold text-[#161616]">
                    <Layers className="w-3.5 h-3.5 text-[#D92B8A]" />
                    {set.cards.length} Cards
                  </span>
                  <span className="text-[11px] text-[#8C8372]">
                    Level: {set.gradeLevel}
                  </span>
                </div>

                {set.tags && set.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {set.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#DFD5C2] text-[#6F685B]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    onSelectSet(set);
                    onNavigateTab('study');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#161616] hover:bg-[#2A2A2A] text-white font-bold text-xs transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study</span>
                </button>

                <button
                  onClick={() => {
                    onSelectSet(set);
                    onNavigateTab('quiz');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#D92B8A] hover:bg-[#BC1D73] text-white font-bold text-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Quiz</span>
                </button>
              </div>

              {/* Export triggers */}
              <div className="flex items-center justify-between text-[11px] text-[#8C8372] pt-1">
                <button
                  onClick={() => exportSetToPDF(set)}
                  className="hover:text-[#D92B8A] font-semibold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> PDF
                </button>
                <button
                  onClick={() => exportSetToPPTX(set)}
                  className="hover:text-[#E59500] font-semibold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> PPTX Slides
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
