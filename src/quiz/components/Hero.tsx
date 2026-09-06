import React from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Flame, HelpCircle, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onStartClick: () => void;
  onSelectSample: (samplePrompt: string, category: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick, onSelectSample }) => {
  const inspirationTopics = [
    { label: '👑 Kingdom of Mali', topic: 'The Kingdom of Mali & Mansa Musa', category: 'History' },
    { label: '🌍 Great Rift Valley', topic: 'The Great Rift Valley Geography & Ecology', category: 'Geography' },
    { label: '📚 African Literature', topic: 'African Literature: Chinua Achebe & Things Fall Apart', category: 'Literature' },
    { label: '⚙️ Solar In Africa', topic: 'Solar Energy Revolution & Geothermal Power in Africa', category: 'Science' },
    { label: '🌱 Sustainable Agro', topic: 'Sustainable Agriculture & Indigenous Crops in Africa', category: 'Science' },
    { label: '🔬 Nubian Pyramids', topic: 'The Kingdom of Kush & Nubian Pyramids at Meroë', category: 'History' },
  ];

  return (
    <section className="pt-2 pb-8 border-b border-stone-200/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Edition Badge, Giant Display Headline, Subtext & Action Buttons */}
        <div className="lg:col-span-7 space-y-6">
          {/* Edition Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 border border-stone-300/80 rounded-full shadow-sm text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-stone-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E05A2B] inline-block animate-pulse"></span>
            <span>PROUDLY AFRIKAN EDUCATION • QUIZ GENERATOR</span>
          </div>

          {/* Giant Oversized Display Headline: Exact matching scale to Study and Build */}
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] xl:text-[6.25rem] uppercase tracking-tighter text-[#161616] leading-[0.88] sm:leading-[0.9] lg:leading-[0.92] break-words">
            TEST<br />
            ANYTHING.<br />
            <span className="text-[#E05A2B]">ABOUT<br />ANYTHING.</span>
          </h1>

          {/* Clear, comfortable, easy-to-read subtext */}
          <p className="text-base sm:text-lg lg:text-xl xl:text-[1.3rem] text-stone-700 font-normal leading-[1.65] max-w-2xl">
            Turn any topic, text notes, or educational PDF into sharp, classroom-ready quizzes, interactive assessments, and detailed answer keys in seconds.
          </p>

          {/* Action Buttons - Fully Responsive */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
            <button
              onClick={onStartClick}
              className="w-full sm:w-auto px-7 sm:px-8 py-4 bg-[#E05A2B] hover:bg-[#c84d22] text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-[0_4px_18px_rgba(224,90,43,0.38)] transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>CREATE YOUR QUIZ</span>
            </button>
          </div>
        </div>

        {/* Right Column: Instant Inspiration Card & Metrics */}
        <div className="lg:col-span-5 space-y-5 lg:pt-4">
          {/* Instant Inspiration Elevated Rounded Card */}
          <div className="bg-[#FAF8F5] border-2 border-stone-200/90 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900">
                <span className="text-[#E05A2B] text-sm">❖</span>
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
                  onClick={() => onSelectSample(item.topic, item.category)}
                  className="px-3.5 py-2.5 bg-white hover:bg-orange-50/60 border border-stone-200/90 hover:border-orange-300 text-stone-800 hover:text-[#E05A2B] font-medium text-xs sm:text-sm rounded-full transition-all shadow-sm flex items-center gap-2 text-left truncate cursor-pointer"
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
              <div className="font-mono text-lg sm:text-xl font-black text-[#E05A2B] flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-[#E05A2B]" />
                100%
              </div>
              <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                Accuracy
              </div>
            </div>

            <div className="text-center border-r border-stone-200 px-2">
              <div className="font-mono text-lg sm:text-xl font-black text-stone-800">
                CAPS
              </div>
              <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                Aligned
              </div>
            </div>

            <div className="text-center pl-2">
              <div className="font-mono text-lg sm:text-xl font-black text-[#E05A2B]">
                Fast
              </div>
              <div className="font-mono text-xs font-bold text-stone-600 uppercase tracking-wider">
                AI Engine
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

