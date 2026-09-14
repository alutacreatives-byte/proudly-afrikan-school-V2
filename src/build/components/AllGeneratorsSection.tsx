import React from 'react';
import { BUILD_TOOLS_LIST } from './BuildToolsMenu';
import { ArrowUpRight } from 'lucide-react';

interface AllGeneratorsSectionProps {
  onSelectGenerator: (toolId: string) => void;
}

export const AllGeneratorsSection: React.FC<AllGeneratorsSectionProps> = ({
  onSelectGenerator,
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight">
          Complete Generator Suite
        </h2>
        <p className="font-sans text-sm text-stone-600 max-w-2xl mx-auto">
          Select from our comprehensive set of professional educational tools designed for every classroom need.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BUILD_TOOLS_LIST.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => onSelectGenerator(tool.id)}
              className="bg-white border border-stone-200/90 hover:border-[#E63956]/50 rounded-3xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-5">
                {/* Top Row: Number & Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xl text-stone-900 tracking-tight">
                    {tool.num}
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E63956] bg-[#FFF0F2] border border-[#FFCCD4] px-3.5 py-1.5 rounded-full shadow-xs">
                    {tool.badge}
                  </span>
                </div>

                {/* Dark Icon Box */}
                <div className="w-12 h-12 rounded-2xl bg-[#18181B] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Icon className="w-6 h-6 text-[#E63956]" />
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="font-display font-black text-xl text-[#161616] uppercase tracking-tight group-hover:text-[#E63956] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-stone-500 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Bottom Row Action */}
              <div className="flex items-center justify-between pt-5 border-t border-stone-100 font-mono text-xs font-bold text-[#E63956] uppercase tracking-wider">
                <span>{tool.actionLabel} →</span>
                <div className="w-7 h-7 rounded-full bg-[#FFF0F2] flex items-center justify-center group-hover:bg-[#E63956] group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
