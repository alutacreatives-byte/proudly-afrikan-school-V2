import React from 'react';
import { BUILD_TOOLS_LIST } from './BuildToolsMenu';
import { ArrowUpRight } from 'lucide-react';

interface AllGeneratorsSectionProps {
  onSelectGenerator?: (toolId: string) => void;
  onSelectTool?: (toolId: string) => void;
}

export const AllGeneratorsSection: React.FC<AllGeneratorsSectionProps> = ({
  onSelectGenerator,
  onSelectTool,
}) => {
  const handleSelect = onSelectGenerator || onSelectTool || (() => {});
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
              onClick={() => handleSelect(tool.id)}
              className="clay-card-3d-interactive p-7 flex flex-col justify-between space-y-6 cursor-pointer group"
            >
              <div className="space-y-5">
                {/* Top Row: Number & Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xl text-stone-900 tracking-tight">
                    {tool.num}
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E05A2B] bg-[#FFF5EE] border border-[#FED7AA] px-3.5 py-1.5 rounded-full shadow-xs">
                    {tool.badge}
                  </span>
                </div>

                {/* Dark Icon Box */}
                <div className="w-12 h-12 rounded-2xl bg-[#18181B] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Icon className="w-6 h-6 text-[#E05A2B]" />
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="font-display font-black text-xl text-[#161616] uppercase tracking-tight group-hover:text-[#E05A2B] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Bottom Row Action */}
              <div className="flex items-center justify-between pt-5 border-t border-stone-200/80 font-mono text-xs font-bold text-[#E05A2B] uppercase tracking-wider">
                <span>{tool.actionLabel || 'Create Now'} →</span>
                <div className="w-7 h-7 rounded-full bg-[#FFF5EE] flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#E05A2B] group-hover:to-[#D99B00] group-hover:text-white transition-all shadow-xs">
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
