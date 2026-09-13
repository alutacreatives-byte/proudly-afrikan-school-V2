import React from 'react';
import { Sparkles, FileUp, ArrowRight, BookOpen, Globe, Sun, Leaf, Pyramid } from 'lucide-react';

interface BuildHeroProps {
  onSelectInspiration: (topic: string) => void;
  onOpenGenerator: (generatorType?: string) => void;
  onUploadClick: () => void;
}

export const BuildHero: React.FC<BuildHeroProps> = ({
  onSelectInspiration,
  onOpenGenerator,
  onUploadClick,
}) => {
  const inspirationTopics = [
    { title: 'Timbuktu Manuscripts', icon: BookOpen },
    { title: 'Great Zimbabwe Architecture', icon: Pyramid },
    { title: 'Swahili Maritime Trade', icon: Globe },
    { title: 'Kingdom of Aksum Coinage', icon: CrownIcon },
    { title: 'African Medicinal Botany', icon: Leaf },
    { title: 'West African Griots', icon: Sun },
  ];

  return (
    <section className="pt-2 pb-8 border-b border-white/60">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Edition Badge, Giant Display Headline, Subtext & Action Buttons */}
        <div className="lg:col-span-7 space-y-6">
          {/* Edition Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 liquid-glass-pill text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-stone-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63956] inline-block animate-pulse shadow-[0_0_6px_rgba(230,57,86,0.6)]"></span>
            <span>PROUDLY AFRIKAN EDUCATION • RESOURCE BUILDER</span>
          </div>

          {/* Giant Oversized Display Headline: Exact matching scale to Study and Quiz */}
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] xl:text-[6.25rem] uppercase tracking-tighter text-[#161616] leading-[0.88] sm:leading-[0.9] lg:leading-[0.92] break-words">
            BUILD<br />
            ANYTHING.<br />
            <span className="text-[#E63956]">ABOUT<br />ANYTHING.</span>
          </h1>

          {/* Clear, comfortable, easy-to-read subtext */}
          <p className="text-base sm:text-lg lg:text-xl xl:text-[1.3rem] text-stone-700 font-normal leading-[1.65] max-w-2xl">
            Turn any topic, text notes, or educational PDF into sharp, classroom-ready exams, lesson plans, worksheets, and interactive courses in seconds.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
            <button
              onClick={() => onOpenGenerator('exam')}
              className="w-full sm:w-auto px-7 sm:px-8 py-4 liquid-glass-btn-primary font-display text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>BUILD AN EXAM / WORKSHEET</span>
            </button>

            <button
              onClick={onUploadClick}
              className="w-full sm:w-auto px-7 sm:px-8 py-4 liquid-glass-btn-dark font-display text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-[#E63956]" />
              <span>UPLOAD PDF / DOC</span>
            </button>
          </div>
        </div>

        {/* Right Column: Instant Inspiration Card & Metrics */}
        <div className="lg:col-span-5 space-y-5 lg:pt-4">
          {/* Instant Inspiration Liquid Glass Card */}
          <div className="liquid-glass-card p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-white/80 pb-3">
              <div className="flex items-center gap-2 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900">
                <span className="text-[#E63956] text-sm">❖</span>
                <span>INSTANT INSPIRATION</span>
              </div>
              <span className="font-mono text-xs text-stone-400 font-bold uppercase tracking-wider">
                TAP TO TRY
              </span>
            </div>

            {/* Topic Pills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {inspirationTopics.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => onSelectInspiration(item.title)}
                    className="px-3.5 py-2.5 liquid-glass-pill hover:bg-pink-50/60 hover:text-[#E63956] text-stone-800 font-medium text-xs sm:text-sm flex items-center gap-2 text-left truncate cursor-pointer transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-stone-100/80 text-stone-700 flex items-center justify-center shrink-0">
                      <IconComponent className="w-3 h-3" />
                    </div>
                    <span className="truncate">{item.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <span className="text-xs font-mono text-stone-500 font-medium">
                * Click any topic above to launch pre-filled workbench.
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar in Liquid Glass Lozenge */}
          <div className="grid grid-cols-3 gap-2 liquid-glass-card p-3.5 rounded-2xl">
            <div className="text-center border-r border-stone-200/80 pr-2">
              <div className="font-mono text-lg sm:text-xl font-black text-[#E63956]">6</div>
              <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                Generators
              </div>
            </div>

            <div className="text-center border-r border-stone-200/80 px-2">
              <div className="font-mono text-lg sm:text-xl font-black text-stone-900">PDF</div>
              <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                Document AI
              </div>
            </div>

            <div className="text-center pl-2">
              <div className="font-mono text-lg sm:text-xl font-black text-[#E63956]">CAPS</div>
              <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                IEB Aligned
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function CrownIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z"/>
    </svg>
  );
}
