import React from 'react';
import { AppView, StudySet } from '../types';
import { GeneratorMode, InputMethod } from './CreateSetModal';
import { GlobalNavigationButtons } from './GlobalNavigationButtons';
import { 
  Sparkles, 
  Type, 
  ClipboardList, 
  FileUp, 
  ArrowUpRight, 
  BookOpen, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  GraduationCap, 
  Compass, 
  Upload, 
  Layers,
  FileQuestion,
  Wrench,
  Lightbulb,
  Camera
} from 'lucide-react';

interface ToolsViewProps {
  onNavigate: (view: AppView) => void;
  onCreateSetClick: (method?: InputMethod, topic?: string, mode?: GeneratorMode) => void;
  onSelectSet: (set: StudySet, mode?: AppView) => void;
  onOpenTutor?: (mode?: 'tutor' | 'homework') => void;
  onBack?: () => void;
  onGoHome?: () => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  onNavigate,
  onCreateSetClick,
  onOpenTutor,
  onBack,
  onGoHome,
}) => {
  const toolsList = [
    {
      id: 'worksheet',
      title: 'WORKSHEET GENERATOR',
      subtitle: 'STUDY TOOL',
      tag: 'PRACTICE & EXERCISES',
      description: 'Create structured printable or interactive worksheets with fill-in-blanks, matching activities, and full answer solutions.',
      btnText: 'CREATE WORKSHEET →',
      mode: 'worksheet' as GeneratorMode,
      icon: FileSpreadsheet,
    },
    {
      id: 'exam',
      title: 'EXAM & QUIZ GENERATOR',
      subtitle: 'STUDY TOOL',
      tag: 'ASSESSMENT & TESTING',
      description: 'Build structured exams with multiple choice, essays, mark breakdowns, and grading rubrics.',
      btnText: 'CREATE EXAM →',
      mode: 'exam' as GeneratorMode,
      icon: FileQuestion,
    },
    {
      id: 'lesson-plan',
      title: 'LESSON PLAN GENERATOR',
      subtitle: 'STUDY TOOL',
      tag: 'TEACHING & PEDAGOGY',
      description: "Design comprehensive pedagogical lesson plans with timed learning phases, Bloom's taxonomy objectives, and checks.",
      btnText: 'CREATE LESSON PLAN →',
      mode: 'lesson-plan' as GeneratorMode,
      icon: BookOpen,
    },
    {
      id: 'study-guide',
      title: 'STUDY GUIDE GENERATOR',
      subtitle: 'STUDY TOOL',
      tag: 'REVISION & MEMORY',
      description: 'Extract core key concepts, terminology, memory triggers, and concise review summaries for any topic.',
      btnText: 'CREATE STUDY GUIDE →',
      mode: 'study-guide' as GeneratorMode,
      icon: FileText,
    },
    {
      id: 'tutor',
      title: 'AI TUTOR & HOMEWORK HELPER',
      subtitle: 'STUDY TOOL',
      tag: 'STEP-BY-STEP GUIDANCE',
      description: 'Get immediate conversational explanations, step-by-step math reasoning, essay critique, and conceptual checks.',
      btnText: 'OPEN AI TUTOR →',
      action: () => onOpenTutor ? onOpenTutor('tutor') : onNavigate('homework'),
      icon: GraduationCap,
    },
    {
      id: 'pdf-quiz',
      title: 'PDF & DOCUMENT TO QUIZ',
      subtitle: 'STUDY TOOL',
      tag: 'DOCUMENT ANALYSIS',
      description: 'Upload course PDFs, lecture transcripts, or textbook chapters to generate grounded multiple-choice & analytical quizzes.',
      btnText: 'UPLOAD DOCUMENT →',
      mode: 'pdf-quiz' as GeneratorMode,
      inputMethod: 'upload' as const,
      icon: Upload,
    },
    {
      id: 'slides',
      title: 'PRESENTATION & SLIDE OUTLINE',
      subtitle: 'STUDY TOOL',
      tag: 'LECTURE & SLIDES',
      description: 'Generate structured slide decks with presenter talking points, discussion prompts, and visual key takeaways.',
      btnText: 'CREATE SLIDES →',
      mode: 'slides' as GeneratorMode,
      icon: Presentation,
    },
    {
      id: 'course',
      title: 'COURSE MODULE BUILDER',
      subtitle: 'STUDY TOOL',
      tag: 'CURRICULUM ARCHITECTURE',
      description: 'Design sequential multi-week curriculum modules with learning objectives, reading milestones, and outcomes.',
      btnText: 'CREATE COURSE →',
      mode: 'course' as GeneratorMode,
      icon: Layers,
    },
    {
      id: 'roadmap',
      title: 'LEARNING ROADMAP',
      subtitle: 'STUDY TOOL',
      tag: 'LEARNER JOURNEY',
      description: 'Construct personalized step-by-step learning pathways tailored to your baseline mastery and target outcomes.',
      btnText: 'CREATE ROADMAP →',
      mode: 'roadmap' as GeneratorMode,
      icon: Compass,
    },
  ];

  return (
    <div id="tools-view-root" className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Global Navigation: BACK + HOME */}
      <div className="flex items-center justify-between">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
      </div>

      {/* Header Banner */}
      <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-pink-50 border border-pink-200 rounded-full text-xs font-mono font-bold tracking-wider uppercase text-[#D92B8A]">
              <Wrench className="w-3.5 h-3.5" />
              <span>STUDY TOOLS • MAKE THINGS THAT HELP YOU LEARN</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#161616] leading-none">
              STUDY TOOLS. <span className="text-[#D92B8A]">STUDY ANYTHING.</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-700 font-normal leading-relaxed">
              Create structured study materials, interactive worksheets, exam practice tests, lesson plans, and custom study guides tailored to any subject or grade level.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button
              id="tools-create-topic-cta"
              onClick={() => onCreateSetClick('topic')}
              className="px-7 py-4 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-[0_4px_16px_rgba(217,43,138,0.35)] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>CREATE FROM TOPIC</span>
            </button>
            <button
              id="tools-upload-cta"
              onClick={() => onCreateSetClick('upload')}
              className="px-6 py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full border border-stone-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-stone-700" />
              <span>UPLOAD PDF / DOC</span>
            </button>
          </div>
        </div>
      </section>

      {/* Input Methods Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#D92B8A] uppercase tracking-widest block">
              CHOOSE HOW TO START
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-stone-900 tracking-tight">
              PRIMARY INPUT METHODS
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 01: Type a Topic */}
          <div
            id="tool-input-topic"
            onClick={() => onCreateSetClick('topic')}
            className="rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md hover:border-pink-300 transition-all p-6 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-400 group-hover:text-[#D92B8A]">01 • FASTEST</span>
                <span className="px-2.5 py-0.5 bg-pink-50 text-[#D92B8A] border border-pink-200 rounded-full font-mono text-xs font-bold uppercase">TOPIC</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center">
                <Type className="w-5 h-5 text-[#D92B8A]" />
              </div>
              <h3 className="font-display font-black text-xl uppercase text-stone-900">TYPE A TOPIC</h3>
              <p className="text-sm text-stone-600 leading-relaxed font-normal">
                Enter any subject topic, historical era, scientific law, or mathematical principle to generate materials immediately.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between font-mono text-xs font-bold uppercase text-stone-800 group-hover:text-[#D92B8A]">
              <span>START WITH TOPIC</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 02: Paste Notes */}
          <div
            id="tool-input-paste"
            onClick={() => onCreateSetClick('paste')}
            className="rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md hover:border-pink-300 transition-all p-6 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-400 group-hover:text-[#D92B8A]">02 • CONTEXT</span>
                <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 border border-stone-200 rounded-full font-mono text-xs font-bold uppercase">NOTES</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-[#D92B8A]" />
              </div>
              <h3 className="font-display font-black text-xl uppercase text-stone-900">PASTE TEXT / NOTES</h3>
              <p className="text-sm text-stone-600 leading-relaxed font-normal">
                Paste syllabus paragraphs, lesson transcripts, or article excerpts to ground the generated questions and exercises.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between font-mono text-xs font-bold uppercase text-stone-800 group-hover:text-[#D92B8A]">
              <span>PASTE TEXT</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 03: Upload File */}
          <div
            id="tool-input-upload"
            onClick={() => onCreateSetClick('upload')}
            className="rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md hover:border-pink-300 transition-all p-6 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-400 group-hover:text-[#D92B8A]">03 • DOCUMENT</span>
                <span className="px-2.5 py-0.5 bg-stone-900 text-white rounded-full font-mono text-xs font-bold uppercase">PDF / DOC</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center">
                <FileUp className="w-5 h-5 text-[#D92B8A]" />
              </div>
              <h3 className="font-display font-black text-xl uppercase text-stone-900">UPLOAD PDF OR DOC</h3>
              <p className="text-sm text-stone-600 leading-relaxed font-normal">
                Upload textbook chapters, curriculum guidelines, or study materials to parse and extract quizzes and study guides.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between font-mono text-xs font-bold uppercase text-stone-800 group-hover:text-[#D92B8A]">
              <span>UPLOAD FILE</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 04: Capture Photo */}
          <div
            id="tool-input-capture"
            onClick={() => onCreateSetClick('capture')}
            className="rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md hover:border-pink-300 transition-all p-6 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-400 group-hover:text-[#D92B8A]">04 • CAMERA</span>
                <span className="px-2.5 py-0.5 bg-pink-100 text-[#D92B8A] rounded-full font-mono text-xs font-bold uppercase">PHOTO OCR</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center">
                <Camera className="w-5 h-5 text-[#D92B8A]" />
              </div>
              <h3 className="font-display font-black text-xl uppercase text-stone-900">CAPTURE IT</h3>
              <p className="text-sm text-stone-600 leading-relaxed font-normal">
                Photograph homework, textbook pages, handwritten work, equations, diagrams, or worksheets for instant AI OCR.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between font-mono text-xs font-bold uppercase text-stone-800 group-hover:text-[#D92B8A]">
              <span>CAPTURE PHOTO</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Complete Study Tools Grid */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-[#D92B8A] uppercase tracking-widest block">
            STUDY TOOL SUITE
          </span>
          <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-stone-900 tracking-tight">
            ALL STUDY TOOLS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolsList.map(tool => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                id={`tool-card-${tool.id}`}
                onClick={() => {
                  if (tool.action) {
                    tool.action();
                  } else {
                    onCreateSetClick(tool.inputMethod || 'topic', undefined, tool.mode);
                  }
                }}
                className="bg-white border border-stone-200/90 hover:border-pink-300 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 font-mono text-[11px] font-bold uppercase tracking-wider rounded-full border border-stone-200">
                      {tool.tag}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-pink-50 text-[#D92B8A] flex items-center justify-center group-hover:bg-[#D92B8A] group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    {/* Main Large Tool Name */}
                    <h3 className="font-display font-black text-xl sm:text-2xl uppercase text-stone-900 tracking-tight leading-tight group-hover:text-[#D92B8A] transition-colors">
                      {tool.title}
                    </h3>
                    {/* Subtitle: STUDY TOOL */}
                    <div className="font-mono text-xs font-bold text-[#D92B8A] uppercase tracking-wider mt-0.5">
                      {tool.subtitle}
                    </div>
                  </div>

                  <p className="text-sm text-stone-600 leading-relaxed font-normal">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-display text-xs font-black uppercase tracking-wider text-stone-900 group-hover:text-[#D92B8A] transition-colors">
                    {tool.btnText}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#18181B] text-white flex items-center justify-center group-hover:bg-[#D92B8A] transition-colors">
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
