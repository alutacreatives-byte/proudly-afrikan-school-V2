import React, { useState } from 'react';
import { SavedResource } from '../../types';
import { ArrowLeft, Printer, Copy, Bookmark, Check, Network, Sparkles } from 'lucide-react';
import { saveResourceToStorage } from '../../utils/storage';

interface MindMapViewerProps {
  resource: SavedResource;
  onBack: () => void;
}

export const MindMapViewer: React.FC<MindMapViewerProps> = ({ resource, onBack }) => {
  const content = resource.content || {};
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveResourceToStorage(resource);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const branches = content.branches || content.nodes || [
    { title: 'Core Foundations', points: ['Historical roots', 'Primary definitions', 'Key terminology'] },
    { title: 'Practical Applications', points: ['Case studies', 'Real-world impact', 'Modern relevance'] },
    { title: 'Challenges & Debates', points: ['Current critiques', 'Alternative perspectives', 'Future outlook'] }
  ];

  return (
    <div id="build-result-top" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in print:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-[#E63956] text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#E63956]" />
          Back to Generators
        </button>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            Print
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-stone-800 font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E63956] hover:bg-[#d02e48] text-white font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      <div className="card-3d-elevated p-8 sm:p-12 space-y-8 bg-white print:shadow-none print:border-none">
        <div className="border-b-2 border-stone-900 pb-6 text-center space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E63956] flex items-center justify-center gap-1.5">
            <Network className="w-4 h-4" />
            VISUAL CONCEPT MIND MAP
          </span>
          <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#161616]">
            {content.title || resource.title}
          </h1>
          <p className="text-xs font-mono text-stone-500">
            Subject: {content.subject || resource.subject}
          </p>
        </div>

        {/* Central Node */}
        <div className="flex justify-center my-6">
          <div className="px-8 py-5 rounded-3xl bg-[#18181B] text-white text-center shadow-lg border-2 border-[#E63956] max-w-md">
            <span className="font-mono text-[10px] uppercase font-bold text-[#E63956] tracking-widest block mb-1">CENTRAL TOPIC</span>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
              {content.topic || resource.topic || 'Core Concept'}
            </h3>
          </div>
        </div>

        {/* Branching Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {Array.isArray(branches) && branches.map((branch: any, bIdx: number) => (
            <div key={bIdx} className="p-6 rounded-2xl bg-stone-50 border border-stone-200 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#E63956] text-white font-mono font-bold text-xs flex items-center justify-center mb-2">
                0{bIdx + 1}
              </div>
              <h4 className="font-display font-black text-lg uppercase tracking-tight text-stone-900">
                {branch.title || branch.name}
              </h4>
              <ul className="space-y-2 pt-2">
                {Array.isArray(branch.points || branch.subtopics) ? (
                  (branch.points || branch.subtopics).map((pt: string, pIdx: number) => (
                    <li key={pIdx} className="text-xs sm:text-sm font-medium text-stone-700 flex items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E63956]" />
                      <span>{pt}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-stone-600">{JSON.stringify(branch)}</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
