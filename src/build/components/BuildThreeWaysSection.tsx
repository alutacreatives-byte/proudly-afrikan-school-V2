import React from 'react';
import { Sparkles, FileText, Upload, Camera, ArrowDown } from 'lucide-react';

interface BuildThreeWaysSectionProps {
  activeMethod: 'topic' | 'text' | 'pdf' | 'capture';
  onSelectMethod: (method: 'topic' | 'text' | 'pdf' | 'capture') => void;
}

export const BuildThreeWaysSection: React.FC<BuildThreeWaysSectionProps> = ({
  activeMethod,
  onSelectMethod,
}) => {
  const methods = [
    {
      id: 'topic',
      num: '01',
      badge: 'FASTEST',
      badgeStyle: 'bg-[#FFF0F2] text-[#E63956] border border-[#FFCCD4] shadow-xs',
      title: 'TYPE IT.',
      subtitle: 'TOPIC & CONCEPT MODE',
      desc: 'Type any subject, exam topic, or concept to generate flashcards, study guides, or practice quizzes.',
      icon: Sparkles,
    },
    {
      id: 'text',
      num: '02',
      badge: 'DEEP CONTEXT',
      badgeStyle: 'bg-stone-100 text-stone-700 border border-stone-200 shadow-xs',
      title: 'PASTE IT.',
      subtitle: 'LECTURE & CLASS NOTES',
      desc: 'Paste your raw revision notes, textbook summaries, or article snippets to build tailored drills.',
      icon: FileText,
    },
    {
      id: 'pdf',
      num: '03',
      badge: 'PDF • DOC • DOCX',
      badgeStyle: 'bg-stone-900 text-white shadow-xs',
      title: 'UPLOAD IT.',
      subtitle: 'DOCUMENT & PDF MODE',
      desc: 'Upload syllabus PDFs, past papers, or slides to extract content and ground every quiz with source citations.',
      icon: Upload,
    },
    {
      id: 'capture',
      num: '04',
      badge: 'CAMERA • OCR',
      badgeStyle: 'bg-[#FFF0F2] text-[#E63956] border border-[#FFCCD4] shadow-xs',
      title: 'CAPTURE IT.',
      subtitle: 'CAMERA & PHOTO MODE',
      desc: 'Photograph homework, textbook pages, handwritten work, equations, diagrams, or worksheets to instantly digitize and study.',
      icon: Camera,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
          Four Ways to Build Educational Content
        </h2>
        <p className="font-sans text-sm text-stone-600 max-w-2xl mx-auto">
          Generate comprehensive CAPS-aligned curriculum resources instantly using AI-powered topic prompts, pasted notes, syllabus documents, or camera snapshots.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {methods.map((method) => {
          const Icon = method.icon;
          const isActive = activeMethod === method.id;
          return (
            <div
              key={method.id}
              onClick={() => onSelectMethod(method.id as any)}
              className={`rounded-[2rem] p-7 flex flex-col justify-between transition-all cursor-pointer group ${
                isActive
                  ? 'bg-gradient-to-b from-[#FFFDF9] to-[#F9F0E6] border-2 border-[#E63956] shadow-[0_16px_40px_rgba(230,57,86,0.2)] transform -translate-y-1'
                  : 'clay-card-3d-interactive'
              }`}
            >
              <div className="space-y-6">
                {/* Top Row: Number & Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-2xl text-stone-900 tracking-tight">
                    {method.num}
                  </span>
                  <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${method.badgeStyle}`}>
                    {method.badge}
                  </span>
                </div>

                {/* Dark Circular Icon Box */}
                <div className="w-12 h-12 rounded-2xl bg-[#18181B] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Icon className="w-6 h-6 text-[#E63956]" />
                </div>

                {/* Title, Subtitle & Description */}
                <div className="space-y-2.5">
                  <div>
                    <h3 className="font-display font-black text-2xl text-[#161616] uppercase tracking-tight">
                      {method.title}
                    </h3>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#E63956]">
                      {method.subtitle}
                    </span>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {method.desc}
                  </p>
                </div>
              </div>

              {/* Bottom Footer Action */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-stone-200/80">
                <span className="font-mono text-xs font-bold text-stone-900 uppercase tracking-widest">
                  SELECT MODE
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                  isActive ? 'bg-[#E63956] text-white' : 'bg-stone-900 text-white group-hover:bg-[#E63956]'
                }`}>
                  <ArrowDown className="w-4 h-4 -rotate-90" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
