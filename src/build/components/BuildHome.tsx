import React from 'react';
import { 
  Sparkles, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  GitFork, 
  Presentation as PresIcon, 
  ArrowRight, 
  Bookmark, 
  Clock, 
  Trash2,
  Layers,
  ChevronRight
} from 'lucide-react';
import { BuildToolType, SavedResource } from '../types';

interface BuildHomeProps {
  onSelectTool: (type: BuildToolType) => void;
  savedResources: SavedResource[];
  onOpenResource: (resource: SavedResource) => void;
  onDeleteResource: (id: string) => void;
}

interface ToolCardInfo {
  type: BuildToolType;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
}

const BUILD_TOOLS: ToolCardInfo[] = [
  {
    type: 'exam',
    title: 'EXAM & QUIZ GENERATOR',
    subtitle: 'ASSESSMENT & TESTING • CAPS ALIGNED',
    category: 'Assessment & Testing',
    description: 'Design comprehensive examination papers, multiple choice tests, and structured essay questions with full teacher marking rubrics.',
    badge: 'EXAM & QUIZ',
    icon: FileText,
  },
  {
    type: 'worksheet',
    title: 'WORKSHEET GENERATOR',
    subtitle: 'PRACTICE & EXERCISES • CAPS ALIGNED',
    category: 'Classroom Exercises',
    description: 'Generate structured practice worksheets with fill-in blanks, concept matching, diagram analysis, and full teacher answer keys.',
    badge: 'WORKSHEET',
    icon: BookOpen,
  },
  {
    type: 'course',
    title: 'COURSE SYLLABUS BUILDER',
    subtitle: 'CURRICULUM & MODULES • CAPS ALIGNED',
    category: 'Curriculum Planning',
    description: 'Structure term-by-term multi-week curriculum outlines, learning objectives, lecture topics, and formal grading distributions.',
    badge: 'COURSE SYLLABUS',
    icon: GraduationCap,
  },
  {
    type: 'lesson-plan',
    title: 'LESSON PLAN GENERATOR',
    subtitle: 'TEACHING & PEDAGOGY • CAPS ALIGNED',
    category: 'Pedagogy & Instruction',
    description: 'Construct 5E instructional lesson plans with teacher facilitation prompts, student inquiry action, and inclusive differentiation.',
    badge: 'LESSON PLAN',
    icon: Layers,
  },
  {
    type: 'mind-map',
    title: 'MIND MAP GENERATOR',
    subtitle: 'VISUAL HIERARCHY • CAPS ALIGNED',
    category: 'Visual Synthesis',
    description: 'Generate hierarchical concept mind maps, branching taxonomies, and core analytical takeaways for visual clarity.',
    badge: 'MIND MAP',
    icon: GitFork,
  },
  {
    type: 'presentation',
    title: 'PRESENTATION GENERATOR',
    subtitle: 'SLIDES & LECTURE • CAPS ALIGNED',
    category: 'Lecture & Slides',
    description: 'Craft comprehensive lecture slide decks with presenter speaking notes, discussion challenges, and direct PPTX export.',
    badge: 'PRESENTATION',
    icon: PresIcon,
  },
];

export const BuildHome: React.FC<BuildHomeProps> = ({
  onSelectTool,
  savedResources,
  onOpenResource,
  onDeleteResource,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-12 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="space-y-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#E63956] uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
            PROUDLY AFRIKAN BUILD SUITE
          </span>
          <span className="font-mono text-xs text-stone-400">•</span>
          <span className="font-mono text-xs text-stone-500 font-semibold uppercase">
            100% CAPS ALIGNED
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#161616] tracking-tight uppercase leading-tight">
              BUILD GENERATORS
            </h1>
            <p className="font-mono text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              Curriculum design engines, structured assessments, interactive rubrics, and lesson architectures engineered for modern African education.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-stone-200 shadow-2xs font-mono text-xs text-stone-700 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#E63956]" />
              <span><strong>{savedResources.length}</strong> Saved Documents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 6 Generator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BUILD_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.type}
              onClick={() => onSelectTool(tool.type)}
              className="group relative p-7 rounded-3xl bg-white border border-stone-200/90 hover:border-stone-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer space-y-6"
            >
              <div className="space-y-4">
                {/* Header with red badge and category tag */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#E63956] group-hover:bg-[#d02845] transition-colors flex items-center justify-center text-white shadow-sm shrink-0">
                    <Sparkles className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-stone-500 uppercase px-2.5 py-1 rounded-full bg-stone-100">
                    {tool.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="font-display font-black text-lg sm:text-xl text-[#161616] group-hover:text-[#E63956] transition-colors uppercase tracking-tight leading-snug">
                    {tool.title}
                  </h3>
                  <p className="font-mono text-xs font-semibold text-stone-500 uppercase tracking-wider mt-1">
                    {tool.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="font-mono text-xs text-stone-600 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Card Footer Button */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-900 uppercase tracking-wider group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                  Launch Generator
                  <ArrowRight className="w-4 h-4 text-[#E63956]" />
                </span>
                <span className="font-mono text-[10px] text-stone-400 uppercase">
                  1 Credit
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Saved Creations / Resources Section */}
      {savedResources.length > 0 && (
        <div className="pt-8 border-t border-stone-200 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#161616] uppercase tracking-tight">
                Recent Build Library
              </h2>
              <p className="font-mono text-xs text-stone-500 mt-0.5">
                Previously generated CAPS materials and curriculum documents.
              </p>
            </div>
            <span className="font-mono text-xs text-stone-500">
              {savedResources.length} {savedResources.length === 1 ? 'Resource' : 'Resources'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedResources.slice(0, 6).map((res) => (
              <div
                key={res.id}
                onClick={() => onOpenResource(res)}
                className="p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#E63956] uppercase tracking-wider bg-pink-50 px-2 py-0.5 rounded border border-pink-100">
                      {res.toolType.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteResource(res.id);
                      }}
                      className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                      title="Delete saved resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-display font-black text-sm text-stone-900 uppercase truncate">
                    {res.title}
                  </h4>
                  <p className="font-mono text-xs text-stone-500 truncate">
                    {res.subject || 'General Curriculum'} {res.gradeLevel ? `• ${res.gradeLevel}` : ''}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 font-mono text-[10px] text-stone-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-[#161616] font-bold inline-flex items-center gap-0.5">
                    Open <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
