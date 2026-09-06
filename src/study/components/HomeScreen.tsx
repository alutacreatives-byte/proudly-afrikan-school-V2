import React, { useState } from 'react';
import { StudySet, AppView, UserStats, StudyConcept } from '../types';
import { 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  RotateCcw, 
  FolderPlus, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Flame, 
  Check, 
  AlertTriangle,
  CalendarDays,
  ExternalLink,
  Target,
  GraduationCap,
  FileQuestion,
  Upload,
  FileText,
  FileSpreadsheet,
  Presentation,
  Compass,
  ArrowDown,
  ArrowUpRight,
  Bookmark,
  Type,
  ClipboardList,
  FileUp,
  ChevronDown
} from 'lucide-react';
import { BROAD_SUBJECT_AREAS } from '../data/subjectCategories';
import { GeneratorMode } from './CreateSetModal';

interface HomeScreenProps {
  onNavigate: (view: AppView, categoryFilter?: string) => void;
  onSelectSet: (set: StudySet, defaultMode?: AppView) => void;
  featuredSets: StudySet[];
  reviewItemsCount: number;
  stats: UserStats;
  onCreateSetClick: (initialMethod?: 'topic' | 'paste' | 'upload', initialTopic?: string, initialMode?: GeneratorMode) => void;
  onStartReview: () => void;
  onStartStudyPlan: () => void;
  onOpenTutor?: (mode?: 'tutor' | 'homework') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onSelectSet,
  featuredSets,
  reviewItemsCount,
  stats,
  onCreateSetClick,
  onStartReview,
  onStartStudyPlan,
  onOpenTutor,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const inspirationTopics = [
    { label: '👑 Kingdom of Kush', topic: 'The Kingdom of Kush: Trade, Iron Metallurgy and Pyramids' },
    { label: '🌍 Great Rift Valley', topic: 'Geography and Geology of the Great Rift Valley' },
    { label: '📚 African Literature', topic: 'African Literature & Post-Colonial Authors' },
    { label: '⚙️ Solar In Africa', topic: 'Renewable Solar Energy and Microgrids in Africa' },
    { label: '🌱 Sustainable Agro', topic: 'Sustainable Agriculture and Soil Conservation' },
    { label: '🔬 Nubian Pyramids & Tech', topic: 'Nubian Pyramids, Astronomy and Ancient Engineering' },
  ];

  const generatorSuite = [
    {
      num: '01',
      tag: 'ASSESSMENT & TESTING',
      title: 'EXAM & QUIZ GENERATOR',
      subtitle: 'Build structured exams with multiple choice, essays, mark breakdowns, and teacher answer keys.',
      btnText: 'CREATE EXAM →',
      mode: 'exam' as GeneratorMode,
    },
    {
      num: '02',
      tag: 'PRACTICE & EXERCISES',
      title: 'WORKSHEET GENERATOR',
      subtitle: 'Create engaging classroom worksheets with matching activities, fill-in-blanks, and full answer solutions.',
      btnText: 'CREATE WORKSHEET →',
      mode: 'worksheet' as GeneratorMode,
    },
    {
      num: '03',
      tag: 'TEACHING & PEDAGOGY',
      title: 'LESSON PLAN GENERATOR',
      subtitle: "Create pedagogical lesson plans with timed phases, Bloom's taxonomy objectives, and assessment checks.",
      btnText: 'CREATE LESSON PLAN →',
      mode: 'lesson-plan' as GeneratorMode,
    },
    {
      num: '04',
      tag: 'DOCUMENT ANALYSIS',
      title: 'PDF TO QUIZ GENERATOR',
      subtitle: 'Upload course PDFs or textbook chapters to generate grounded multiple-choice & analytical quiz questions.',
      btnText: 'UPLOAD PDF / DOC →',
      mode: 'pdf-quiz' as GeneratorMode,
      inputMethod: 'upload' as const,
    },
    {
      num: '05',
      tag: 'DOCUMENT ANALYSIS',
      title: 'STUDY GUIDE GENERATOR',
      subtitle: 'Extract core key concepts, terminology, and memory triggers from any uploaded document.',
      btnText: 'CREATE STUDY GUIDE →',
      mode: 'study-guide' as GeneratorMode,
      inputMethod: 'upload' as const,
    },
    {
      num: '06',
      tag: 'SLIDES & LECTURE',
      title: 'PRESENTATION GENERATOR',
      subtitle: 'Generate structured slide outlines with presenter notes, discussion prompts, and visual cues.',
      btnText: 'CREATE SLIDES →',
      mode: 'slides' as GeneratorMode,
    },
    {
      num: '07',
      tag: 'CURRICULUM & MODULES',
      title: 'COURSE MODULE BUILDER',
      subtitle: 'Design sequential multi-week curriculum modules with learning objectives and outcomes.',
      btnText: 'CREATE COURSE →',
      mode: 'course' as GeneratorMode,
    },
    {
      num: '08',
      tag: 'STUDENT JOURNEY',
      title: 'LEARNING ROADMAP BUILDER',
      subtitle: 'Construct personalized step-by-step learning pathways tailored to mastery level.',
      btnText: 'CREATE ROADMAP →',
      mode: 'roadmap' as GeneratorMode,
    },
  ];

  const studyEngines = [
    {
      id: 'study' as AppView,
      title: 'LEARN',
      subtitle: 'Master material through clear concept lessons, analogies, and self-explanation.',
      icon: BookOpen,
      tag: 'LESSONS & INSIGHT',
      btnText: 'START LEARNING',
    },
    {
      id: 'flashcards' as AppView,
      title: 'FLASHCARDS',
      subtitle: 'Test memory with active-recall prompts and 4-tier retention ratings.',
      icon: Layers,
      tag: 'ACTIVE RECALL',
      btnText: 'FLIP CARDS',
    },
    {
      id: 'practice' as AppView,
      title: 'PRACTISE',
      subtitle: 'Reinforce concepts with immediate formative feedback and explanations.',
      icon: CheckCircle2,
      tag: 'FORMATIVE REINFORCE',
      btnText: 'START PRACTICE',
    },
    {
      id: 'review' as AppView,
      title: 'REVIEW QUEUE',
      subtitle: 'Reinforce concepts that need attention using spaced and interleaved review.',
      icon: RotateCcw,
      tag: `${reviewItemsCount} IN QUEUE`,
      btnText: 'OPEN REVIEW QUEUE',
      badge: reviewItemsCount > 0 ? `${reviewItemsCount} Due` : undefined,
    },
    {
      id: 'planner' as AppView,
      title: 'STUDY PLANNER',
      subtitle: 'Time-boxed 5, 10, 20, or 30-min sessions curated to your retention needs.',
      icon: CalendarDays,
      tag: 'TIME-BOXED SESSIONS',
      btnText: 'CHOOSE DURATION',
    },
    {
      id: 'sets' as AppView,
      title: 'MY STUDY SETS',
      subtitle: 'Browse all subject libraries, explore curriculum topics, or generate new sets.',
      icon: FolderPlus,
      tag: 'CURRICULUM ARCHIVE',
      btnText: 'BROWSE ALL SETS',
    },
  ];

  return (
    <div className="space-y-14 sm:space-y-16 pb-20">
      {/* 1. HERO SECTION (Reference Image Z layout) */}
      <section className="pt-2 pb-8 border-b border-stone-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Edition Badge, Giant Display Headline, Subtext & Action Buttons */}
          <div className="lg:col-span-7 space-y-6">
            {/* Edition Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 border border-stone-300/80 rounded-full shadow-sm text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-stone-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D92B8A] inline-block animate-pulse"></span>
              <span>PROUDLY AFRIKAN EDUCATION • STUDY COMPANION</span>
            </div>
            
            {/* Giant Oversized Display Headline: 80-100px Desktop, 60-76px Tablet, 42-54px Mobile */}
            <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] xl:text-[6.25rem] uppercase tracking-tighter text-[#161616] leading-[0.88] sm:leading-[0.9] lg:leading-[0.92] break-words">
              STUDY<br />
              ANYTHING.<br />
              <span className="text-[#D92B8A]">ABOUT<br />ANYTHING.</span>
            </h1>

            {/* Clear, comfortable, easy-to-read subtext (20-24px desktop, 18-21px tablet, 16-18px mobile) */}
            <p className="text-base sm:text-lg lg:text-xl xl:text-[1.3rem] text-stone-700 font-normal leading-[1.65] max-w-2xl">
              Turn any topic, text notes, or educational PDF into sharp, classroom-ready exams, lesson plans, worksheets, and interactive study sets in seconds.
            </p>

            {/* Action Buttons - Fully Responsive */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
              <button
                onClick={() => onCreateSetClick('topic')}
                className="w-full sm:w-auto px-7 sm:px-8 py-4 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-[0_4px_18px_rgba(217,43,138,0.38)] transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>CREATE A STUDY SET</span>
              </button>

              <button
                id="hero-btn-homework-help"
                onClick={() => onNavigate('homework')}
                className="w-full sm:w-auto px-7 py-4 bg-[#18181B] hover:bg-stone-900 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-[#D92B8A]" />
                <span>HOMEWORK HELP & TUTOR</span>
              </button>

              <button
                onClick={onStartStudyPlan}
                className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-[#D92B8A]" />
                <span>START 10-MIN PLAN</span>
              </button>
            </div>
          </div>

          {/* Right Column: Instant Inspiration Card & Metrics */}
          <div className="lg:col-span-5 space-y-5 lg:pt-4">
            {/* Instant Inspiration Elevated Rounded Card */}
            <div className="bg-[#FAF8F5] border-2 border-stone-200/90 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900">
                  <span className="text-[#D92B8A] text-sm">❖</span>
                  <span>INSTANT INSPIRATION</span>
                </div>
                <span className="font-mono text-xs text-stone-400 font-bold uppercase tracking-wider">
                  TAP TO TRY
                </span>
              </div>

              {/* 2-Column Pill Button Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {inspirationTopics.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const matched = featuredSets.find(s => 
                        s.title.toLowerCase().includes(item.label.split(' ')[1].toLowerCase())
                      );
                      if (matched) {
                        onSelectSet(matched, 'study');
                      } else {
                        onCreateSetClick('topic', item.topic);
                      }
                    }}
                    className="px-3.5 py-2.5 bg-white hover:bg-pink-50/60 border border-stone-200/90 hover:border-pink-300 text-stone-800 hover:text-[#D92B8A] font-medium text-xs sm:text-sm rounded-full transition-all shadow-sm flex items-center gap-2 text-left truncate cursor-pointer"
                  >
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 text-center">
                <span className="text-xs font-mono text-stone-500 font-medium">
                  * Click any topic above to launch pre-filled workbench.
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar in Rounded Pill Container */}
            <div className="grid grid-cols-3 gap-2 bg-white border border-stone-200/90 p-3.5 rounded-2xl shadow-sm">
              <div className="text-center border-r border-stone-200 pr-2">
                <div className="font-mono text-lg sm:text-xl font-black text-[#D92B8A] flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-[#D92B8A]" />
                  {stats.streakDays}
                </div>
                <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Streak
                </div>
              </div>

              <div className="text-center border-r border-stone-200 px-2">
                <div className="font-mono text-lg sm:text-xl font-black text-stone-800">
                  {stats.conceptsStudied}
                </div>
                <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Learned
                </div>
              </div>

              <div className="text-center pl-2">
                <div className="font-mono text-lg sm:text-xl font-black text-[#D92B8A]">
                  {stats.sessionsCompleted}
                </div>
                <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Sessions
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLEXIBLE INPUT MODES (Reference Image 2 layout: Three Ways to Create) */}
      <section className="space-y-6 pt-4 border-t border-stone-200/90">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs sm:text-sm font-mono font-bold text-[#D92B8A] uppercase tracking-widest block mb-1.5">
              FLEXIBLE INPUT MODES
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-[#161616] tracking-tighter uppercase leading-[0.92]">
              THREE WAYS TO CREATE.
            </h2>
          </div>
          <p className="text-sm sm:text-base font-mono text-stone-600 max-w-sm leading-relaxed">
            Select an input method below to immediately jump into the resource generator workbench.
          </p>
        </div>

        {/* 3 Large Elevated Rounded Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {/* Card 01: TYPE IT */}
          <div
            id="create-mode-type"
            onClick={() => onCreateSetClick('topic')}
            className="rounded-[28px] bg-white border border-stone-200/80 shadow-[0_16px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_50px_rgba(217,43,138,0.14)] hover:-translate-y-0.5 transition-all p-7 sm:p-8 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-3xl sm:text-4xl text-stone-400 group-hover:text-[#D92B8A] transition-colors">
                  01
                </span>
                <span className="rounded-full px-3.5 py-1 bg-gradient-to-r from-[#D92B8A] to-[#f43f5e] text-white text-xs font-mono font-bold uppercase tracking-wider shadow-[0_4px_14px_rgba(217,43,138,0.4)]">
                  FASTEST
                </span>
              </div>

              {/* Dark Circular Icon */}
              <div className="w-11 h-11 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center my-4 group-hover:scale-105 transition-transform shadow-md">
                <Type className="w-5 h-5 text-[#D92B8A] stroke-[2.2]" />
              </div>

              <h3 className="font-display font-black text-2xl sm:text-[26px] uppercase text-[#161616] tracking-tight mb-1">
                TYPE IT.
              </h3>
              <div className="text-xs font-mono font-bold text-[#D92B8A] uppercase tracking-wider mb-2.5">
                TOPIC & IDEA MODE
              </div>
              <p className="text-sm sm:text-base text-stone-700 font-normal leading-relaxed">
                Enter any topic, curriculum subject, or concept and synthesize a structured resource instantly.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-900 group-hover:text-[#D92B8A] transition-colors">
                LAUNCH BUILDER
              </span>
              <div className="w-7 h-7 rounded-full bg-[#18181B] text-white flex items-center justify-center group-hover:bg-[#D92B8A] transition-colors shadow-sm">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 02: PASTE IT */}
          <div
            id="create-mode-paste"
            onClick={() => onCreateSetClick('paste')}
            className="rounded-[28px] bg-white border border-stone-200/80 shadow-[0_16px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_50px_rgba(217,43,138,0.14)] hover:-translate-y-0.5 transition-all p-7 sm:p-8 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-3xl sm:text-4xl text-stone-400 group-hover:text-[#D92B8A] transition-colors">
                  02
                </span>
                <span className="rounded-full px-3.5 py-1 bg-stone-100 text-stone-800 border border-stone-200/90 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                  DEEP CONTEXT
                </span>
              </div>

              {/* Dark Circular Icon */}
              <div className="w-11 h-11 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center my-4 group-hover:scale-105 transition-transform shadow-md">
                <ClipboardList className="w-5 h-5 text-[#D92B8A] stroke-[2.2]" />
              </div>

              <h3 className="font-display font-black text-2xl sm:text-[26px] uppercase text-[#161616] tracking-tight mb-1">
                PASTE IT.
              </h3>
              <div className="text-xs font-mono font-bold text-[#D92B8A] uppercase tracking-wider mb-2.5">
                NOTES & ARTICLES
              </div>
              <p className="text-sm sm:text-base text-stone-700 font-normal leading-relaxed">
                Paste syllabus paragraphs, lesson transcripts, or curriculum excerpts to ground the generated questions.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-900 group-hover:text-[#D92B8A] transition-colors">
                LAUNCH BUILDER
              </span>
              <div className="w-7 h-7 rounded-full bg-[#18181B] text-white flex items-center justify-center group-hover:bg-[#D92B8A] transition-colors shadow-sm">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 03: UPLOAD IT */}
          <div
            id="create-mode-upload"
            onClick={() => onCreateSetClick('upload')}
            className="rounded-[28px] bg-white border border-stone-200/80 shadow-[0_16px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_50px_rgba(217,43,138,0.14)] hover:-translate-y-0.5 transition-all p-7 sm:p-8 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-black text-3xl sm:text-4xl text-stone-400 group-hover:text-[#D92B8A] transition-colors shrink-0">
                  03
                </span>
                <span className="rounded-full px-3 py-1 bg-[#18181B] text-white text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.3)] shrink-0 whitespace-nowrap">
                  PDF • DOC • DOCX
                </span>
              </div>

              {/* Dark Circular Icon */}
              <div className="w-11 h-11 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center my-4 group-hover:scale-105 transition-transform shadow-md">
                <FileUp className="w-5 h-5 text-[#D92B8A] stroke-[2.2]" />
              </div>

              <h3 className="font-display font-black text-2xl sm:text-[26px] uppercase text-[#161616] tracking-tight mb-1">
                UPLOAD IT.
              </h3>
              <div className="text-xs font-mono font-bold text-[#D92B8A] uppercase tracking-wider mb-2.5">
                DOCUMENT & PDF MODE
              </div>
              <p className="text-sm sm:text-base text-stone-700 font-normal leading-relaxed">
                Drop in textbook chapters, PDFs, Word docs, or test drafts to extract context and synthesize classroom packs.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-900 group-hover:text-[#D92B8A] transition-colors">
                LAUNCH BUILDER
              </span>
              <div className="w-7 h-7 rounded-full bg-[#18181B] text-white flex items-center justify-center group-hover:bg-[#D92B8A] transition-colors shadow-sm">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RESOURCE GENERATOR SUITE - ALL 8 GENERATORS (Image 1 layout) */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <span className="text-xs sm:text-sm font-mono font-bold text-[#D92B8A] uppercase tracking-widest block mb-1.5">
              RESOURCE GENERATOR SUITE
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-[#161616] tracking-tighter uppercase leading-[0.92]">
              STUDY TOOLS
            </h2>
          </div>
          <span className="text-xs sm:text-sm font-mono font-semibold text-stone-500 uppercase tracking-wider">
            ALL TOOLS SUPPORT OPTIONAL DOCUMENT UPLOADS
          </span>
        </div>

        {/* 8 Generator Cards in 4-column responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {generatorSuite.map((gen) => (
            <div
              key={gen.num}
              onClick={() => onCreateSetClick(gen.inputMethod || 'topic', '', gen.mode)}
              className="rounded-3xl bg-white border border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.03)] hover:shadow-[0_18px_40px_rgba(217,43,138,0.12)] hover:border-pink-200 transition-all p-6 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-black text-2xl text-stone-300 group-hover:text-[#D92B8A] transition-colors">
                    {gen.num}
                  </span>
                  <span className="rounded-full px-3 py-1 bg-stone-100 text-stone-700 text-xs font-mono font-bold uppercase tracking-wider border border-stone-200">
                    {gen.tag}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center my-3 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>

                <h3 className="font-display font-black text-lg sm:text-xl uppercase text-[#161616] mb-2 leading-tight">
                  {gen.title}
                </h3>

                <p className="text-sm text-stone-700 font-normal leading-relaxed">
                  {gen.subtitle}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="font-display font-black text-xs uppercase tracking-wider text-stone-900 group-hover:text-[#D92B8A] transition-colors">
                  {gen.btnText}
                </span>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#D92B8A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. AI STUDY TUTOR & HOMEWORK HELP SPOTLIGHT BANNER */}
      <section 
        id="home-homework-tutor-banner"
        className="bg-[#161616] text-[#FAF7F0] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#D92B8A] text-white rounded-full border border-white/20 shrink-0 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white text-[#161616] font-mono text-[11px] font-bold uppercase rounded-full shadow-sm">
                <span className="w-2 h-2 bg-[#D92B8A] rounded-full inline-block animate-pulse"></span>
                <span>LIVE STUDY TUTOR & HOMEWORK HELPER</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-none">
                HELLO. <span className="text-[#D92B8A]">I am your Homework Helper</span>
              </h2>
              <div className="text-sm sm:text-base text-stone-200 font-normal max-w-3xl leading-relaxed space-y-1 pt-1">
                <p>
                  Need help with a tricky school question or assignment? Paste your question below, upload a worksheet, or submit an attempted answer for feedback.
                </p>
                <p className="text-xs sm:text-sm text-stone-300">
                  I will help you understand step-by-step rather than simply giving away quick answers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              id="btn-home-homework-help"
              onClick={() => onNavigate('homework')}
              className="flex-1 sm:flex-initial px-7 py-4 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full transition-all shadow-[0_4px_16px_rgba(217,43,138,0.4)] flex items-center justify-center gap-2 active:scale-95"
            >
              <FileQuestion className="w-4 h-4" />
              <span>LAUNCH HOMEWORK WORKBENCH</span>
            </button>
          </div>
        </div>

        {/* Quick Launch Action Ribbon */}
        <div className="pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
          <button
            onClick={() => onNavigate('homework')}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-left rounded-xl transition-colors flex flex-col justify-between"
          >
            <span className="font-bold text-white flex items-center gap-1 text-xs">
              <span className="text-[#D92B8A]">1.</span> UNDERSTAND
            </span>
            <span className="text-xs text-stone-300">Core principles</span>
          </button>

          <button
            onClick={() => onNavigate('homework')}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-left rounded-xl transition-colors flex flex-col justify-between"
          >
            <span className="font-bold text-white flex items-center gap-1 text-xs">
              <span className="text-[#D92B8A]">2.</span> HINT
            </span>
            <span className="text-xs text-stone-300">Socratic clues</span>
          </button>

          <button
            onClick={() => onNavigate('homework')}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-left rounded-xl transition-colors flex flex-col justify-between"
          >
            <span className="font-bold text-white flex items-center gap-1 text-xs">
              <span className="text-[#D92B8A]">3.</span> STEPS
            </span>
            <span className="text-xs text-stone-300">Logic & formula</span>
          </button>

          <button
            onClick={() => onNavigate('homework')}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-left rounded-xl transition-colors flex flex-col justify-between"
          >
            <span className="font-bold text-emerald-400 flex items-center gap-1 text-xs">
              <span>4.</span> CHECK ANSWER
            </span>
            <span className="text-xs text-stone-300">Feedback report</span>
          </button>

          <button
            onClick={() => onNavigate('homework')}
            className="p-2.5 bg-[#D92B8A]/30 hover:bg-[#D92B8A]/40 border border-[#D92B8A]/60 text-left rounded-xl transition-colors flex flex-col justify-between"
          >
            <span className="font-bold text-white flex items-center gap-1 text-xs">
              <Flame className="w-3.5 h-3.5 text-[#D92B8A]" />
              <span>5. PRACTISE</span>
            </span>
            <span className="text-xs text-pink-200">Similar questions</span>
          </button>

          <button
            onClick={() => onNavigate('homework')}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-left rounded-xl transition-colors flex flex-col justify-between"
          >
            <span className="font-bold text-white flex items-center gap-1 text-xs">
              <span className="text-[#D92B8A]">6.</span> ESSAY
            </span>
            <span className="text-xs text-stone-300">Thesis & outline</span>
          </button>
        </div>
      </section>

      {/* 5. SPACED REVIEW ALERT (If items due) */}
      {reviewItemsCount > 0 && (
        <section 
          id="home-review-alert"
          className="bg-white border border-pink-200 rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-pink-50 rounded-2xl text-[#D92B8A] border border-pink-100">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="inline-block px-3 py-1 bg-[#D92B8A] text-white font-mono text-xs font-bold uppercase rounded-full mb-1">
                SPACED REPETITION QUEUE
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-[#161616]">
                {reviewItemsCount} {reviewItemsCount === 1 ? 'Concept Needs' : 'Concepts Need'} Active Reinforcement
              </h2>
              <p className="text-sm sm:text-base text-stone-700 mt-0.5 font-medium leading-relaxed">
                Revisit flagged concepts today to prevent memory decay and lock into long-term recall.
              </p>
            </div>
          </div>

          <button
            onClick={onStartReview}
            className="w-full sm:w-auto px-6 py-3 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-black tracking-wider uppercase rounded-full shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>START REVIEW QUEUE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* 6. PEDAGOGICAL ARCHITECTURE - 6 STUDY ENGINES */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs sm:text-sm font-mono font-bold text-[#D92B8A] uppercase tracking-widest block mb-1.5">
              PEDAGOGICAL ARCHITECTURE
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tighter text-[#161616] leading-[0.92]">
              6 STUDY ENGINES.
            </h2>
          </div>
          <span className="font-mono text-xs sm:text-sm font-semibold text-stone-500 uppercase tracking-wider">
            LEARN • UNDERSTAND • PRACTISE • REMEMBER • REVIEW
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyEngines.map((engine, idx) => {
            const Icon = engine.icon;
            const isPrimary = engine.id === 'study';
            const numStr = `0${idx + 1}`;

            return (
              <div
                key={engine.id}
                onClick={() => onNavigate(engine.id)}
                className={`bg-white border border-stone-200/90 rounded-3xl p-7 flex flex-col justify-between cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_40px_rgba(217,43,138,0.12)] hover:border-pink-200 transition-all ${
                  isPrimary ? 'ring-2 ring-[#D92B8A]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#18181B] text-[#D92B8A] flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                        <Icon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className="font-mono text-sm font-black text-stone-400">
                        {numStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {engine.badge && (
                        <span className="px-3 py-1 bg-[#D92B8A] text-white text-xs font-mono font-bold uppercase rounded-full shadow-sm">
                          {engine.badge}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-mono font-bold uppercase rounded-full border border-stone-200">
                        {engine.tag}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display font-black text-2xl uppercase text-[#161616] group-hover:text-[#D92B8A] transition-colors leading-tight mb-2">
                    {engine.title}
                  </h3>

                  <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal">
                    {engine.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-display text-xs font-black uppercase text-stone-800 tracking-wider group-hover:translate-x-1 transition-transform">
                    <span className="w-6 h-[2px] bg-[#D92B8A] transition-all group-hover:w-10"></span>
                    <span>{engine.btnText}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center group-hover:bg-[#D92B8A] transition-colors shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FEATURED STUDY SETS */}
      <section className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs sm:text-sm font-mono font-bold text-[#D92B8A] uppercase tracking-widest block mb-1.5">
              CURATED LEARNING SETS
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tighter text-[#161616] leading-[0.92]">
              FEATURED STUDY SETS.
            </h2>
            <p className="text-base sm:text-lg text-stone-700 font-normal mt-1">
              Curated, deep-retention learning sets from the Proudly Afrikan curriculum.
            </p>
          </div>

          <button
            onClick={() => onNavigate('sets')}
            className="text-xs font-mono font-bold text-[#D92B8A] hover:underline uppercase flex items-center gap-1 self-start sm:self-auto bg-pink-50 px-4 py-2 rounded-full border border-pink-200 shrink-0"
          >
            <span>VIEW ALL SETS →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {featuredSets.slice(0, 3).map(set => (
            <div
              key={set.id}
              className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-stone-100 text-stone-800 text-xs font-mono font-bold uppercase rounded-full border border-stone-200">
                    {set.category || 'General Knowledge'}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-mono font-semibold text-stone-600">
                    <Clock className="w-3.5 h-3.5" />
                    {set.estimatedMinutes || 10} MINS
                  </span>
                </div>

                <h3 className="font-display font-black text-xl text-[#161616] uppercase leading-tight mb-2">
                  {set.title}
                </h3>

                <p className="text-sm sm:text-base text-stone-700 line-clamp-2 leading-relaxed">
                  {set.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-800">
                  <span>{(set.concepts || []).length} CONCEPTS</span>
                  <span className="text-[#D92B8A]">READY TO STUDY</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectSet(set, 'study')}
                    className="w-full py-2.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs font-black uppercase rounded-full shadow-sm transition-all"
                  >
                    LEARN
                  </button>
                  <button
                    onClick={() => onSelectSet(set, 'flashcards')}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-display text-xs font-black uppercase rounded-full transition-all"
                  >
                    CARDS
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. HOW IT WORKS - 5-STEP WORKFLOW (Reference Image Y layout) */}
      <section className="space-y-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <span className="text-xs sm:text-sm font-mono font-bold text-[#D92B8A] uppercase tracking-widest block mb-1.5">
              HOW IT WORKS
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-[4rem] text-[#161616] tracking-tighter uppercase leading-[0.92]">
              5-STEP WORKFLOW.
            </h2>
          </div>
          <span className="text-xs sm:text-sm font-mono font-semibold text-stone-500 uppercase tracking-wider">
            END-TO-END PEDAGOGICAL PIPELINE
          </span>
        </div>

        {/* 5 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-pink-200 transition-all">
            <div>
              <span className="font-display font-black text-2xl sm:text-3xl text-[#D92B8A] block mb-3">
                01
              </span>
              <h3 className="font-display font-black text-base sm:text-lg uppercase text-[#161616] leading-tight mb-2">
                CHOOSE YOUR INPUT
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed">
                Type a topic, paste lecture notes or syllabus text, or attach any PDF/DOC/DOCX source material.
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-pink-200 transition-all">
            <div>
              <span className="font-display font-black text-2xl sm:text-3xl text-[#D92B8A] block mb-3">
                02
              </span>
              <h3 className="font-display font-black text-base sm:text-lg uppercase text-[#161616] leading-tight mb-2">
                CONFIGURE CRITERIA
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed">
                Customize target grade level, curriculum standards, question counts, marks, and duration.
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-pink-200 transition-all">
            <div>
              <span className="font-display font-black text-2xl sm:text-3xl text-[#D92B8A] block mb-3">
                03
              </span>
              <h3 className="font-display font-black text-base sm:text-lg uppercase text-[#161616] leading-tight mb-2">
                GENERATE RESOURCES
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed">
                The study engine analyzes pedagogical requirements and synthesizes structured materials instantly.
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-pink-200 transition-all">
            <div>
              <span className="font-display font-black text-2xl sm:text-3xl text-[#D92B8A] block mb-3">
                04
              </span>
              <h3 className="font-display font-black text-base sm:text-lg uppercase text-[#161616] leading-tight mb-2">
                INSPECT & REFINE
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed">
                Review interactive question banks, slide previews, lesson timings, and full teacher marking rubrics.
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-pink-200 transition-all">
            <div>
              <span className="font-display font-black text-2xl sm:text-3xl text-[#D92B8A] block mb-3">
                05
              </span>
              <h3 className="font-display font-black text-base sm:text-lg uppercase text-[#161616] leading-tight mb-2">
                SAVE, PRINT & EXPORT
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed">
                Store in My Builds, export print-ready PDF/Worksheets, or copy clean structured JSON payloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. QUESTIONS & ANSWERS - FREQUENTLY ASKED (Reference Image Y layout with accordion) */}
      <section className="space-y-6 pt-2">
        <div>
          <span className="text-xs sm:text-sm font-mono font-bold text-[#D92B8A] uppercase tracking-widest block mb-1.5">
            QUESTIONS & ANSWERS
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-[4rem] text-[#161616] tracking-tighter uppercase leading-[0.92]">
            FREQUENTLY ASKED.
          </h2>
        </div>

        {/* Interactive Accordion matching Image Y */}
        <div className="space-y-3.5">
          {[
            {
              q: 'HOW DOES PROUDLY AFRIKAN STRUCTURE EDUCATIONAL CONTENT?',
              a: 'Proudly Afrikan uses an advanced pedagogical engine to parse and structure educational concepts, generate Socratic homework hints, build spaced-repetition flashcards, and synthesize full multi-section study plans tailored to African curricula and global academic standards.'
            },
            {
              q: 'CAN I USE MY OWN PDF, DOC, OR DOCX DOCUMENTS AS SOURCE MATERIAL?',
              a: 'Yes! You can attach any textbook chapter, syllabus outline, teacher worksheet, or past examination paper in PDF, DOC, or DOCX format. The engine extracts key concepts, formulas, and terminology to build custom revision materials.'
            },
            {
              q: 'HOW DOES THE HOMEWORK HELPER TUTOR STUDENTS?',
              a: 'The Homework Helper uses a progressive Socratic methodology. Rather than giving away direct answers, it breaks complex questions into conceptual steps, gives targeted hints, checks student drafts, and generates similar practice problems to ensure true understanding.'
            },
            {
              q: 'HOW ARE ACTIVE MEMORY & SPACED REPETITION SCHEDULES CALCULATED?',
              a: 'Our active memory system employs the SuperMemo SM-2 algorithm. Based on your self-reported recall ratings (Again, Hard, Good, Easy), it calculates optimal review intervals (1, 3, 7, 14, 30 days) to prevent forgetting curve decay with minimal daily study time.'
            },
            {
              q: 'CAN TEACHERS AND EDUCATORS EXPORT PRINT-READY EXAMS & WORKSHEETS?',
              a: 'Yes! All 8 generator modules support one-click print-ready formatting, PDF export, structured question sheet copies, and complete teacher marking rubrics with model solutions and grading criteria.'
            }
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl shadow-sm transition-all overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <h3 className="font-display font-black text-sm sm:text-base md:text-lg uppercase text-[#161616] group-hover:text-[#D92B8A] transition-colors leading-tight">
                    {faq.q}
                  </h3>
                  <div className={`w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-pink-50 text-[#D92B8A]' : 'text-stone-500'}`}>
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-sm sm:text-base text-stone-600 font-normal leading-relaxed border-t border-stone-100">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. BROWSE BY SUBJECT */}
      <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <span className="text-xs sm:text-sm font-mono font-bold text-[#D92B8A] uppercase tracking-widest block mb-1">
              CURRICULUM DIRECTORY
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#161616]">
              BROWSE BY SUBJECT.
            </h2>
            <p className="text-sm sm:text-base font-medium text-stone-600 mt-0.5">
              <span className="text-[#D92B8A] font-bold">Proudly Afrikan</span> is an African learning platform where you can study anything.
            </p>
          </div>

          <button
            id="home-browse-all-subjects-btn"
            onClick={() => onNavigate('sets', 'ALL SUBJECTS')}
            className="text-xs font-mono font-black text-[#D92B8A] hover:underline uppercase flex items-center gap-1 self-start sm:self-auto bg-pink-50 px-3.5 py-1.5 rounded-full border border-pink-200"
          >
            <span>All Subjects →</span>
          </button>
        </div>

        {/* 12 Broad Subject Area Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {BROAD_SUBJECT_AREAS.map(area => {
            const Icon = area.icon;
            const isAfrican = area.id === 'african-knowledge';
            return (
              <button
                key={area.id}
                id={`home-subject-${area.id}`}
                onClick={() => onNavigate('sets', area.name)}
                className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between min-h-[105px] shadow-sm hover:shadow-md cursor-pointer ${
                  isAfrican 
                    ? 'bg-[#18181B] text-white border-stone-800 hover:bg-[#D92B8A]' 
                    : 'bg-[#FAF8F5] hover:bg-white text-stone-800 border-stone-200 hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <Icon className={`w-4 h-4 ${isAfrican ? 'text-[#D92B8A] group-hover:text-white' : 'text-[#D92B8A]'}`} />
                  <span className={`font-mono text-[9px] font-bold uppercase tracking-wider ${isAfrican ? 'text-stone-400' : 'text-stone-500'}`}>
                    {area.subSubjects.length} TOPICS
                  </span>
                </div>
                <div className="font-display font-black text-xs uppercase leading-snug">
                  {area.name}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 11. QUIZ CONNECTION CTA */}
      <section className="bg-[#FAF8F5] border border-stone-200/90 p-7 sm:p-9 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#18181B] text-white font-mono text-[10px] font-bold uppercase rounded-full">
            <span>SEPARATE PRODUCT: PROUDLY AFRIKAN QUIZ</span>
          </div>
          <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-[#161616] tracking-tight">
            READY TO TEST YOUR KNOWLEDGE?
          </h3>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            Proudly Afrikan Study is built to help you learn, understand, and remember. When you are ready for a timed, competitive challenge with scoring, head over to the Quiz platform.
          </p>
        </div>

        <a
          href="https://proudlyafrikan.com/quiz"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-lg transition-all flex items-center justify-center gap-2 text-center sm:whitespace-nowrap flex-shrink-0 cursor-pointer"
        >
          <span>TAKE THE PROUDLY AFRIKAN QUIZ →</span>
          <ExternalLink className="w-4 h-4 shrink-0" />
        </a>
      </section>
    </div>
  );
};
