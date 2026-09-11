import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  Check, 
  Bookmark, 
  GitFork, 
  Sparkles, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';
import { MindMapData, MindMapNode, SavedResource } from '../../types';
import { saveResourceToStorage } from '../../utils/storage';

interface MindMapViewerProps {
  resource: SavedResource;
  onBack: () => void;
}

export const MindMapViewer: React.FC<MindMapViewerProps> = ({ resource, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const mm: MindMapData = resource.data;

  const toggleNode = (nodeId: string) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleCopy = () => {
    let text = `${mm.title}\nCentral Concept: ${mm.centralTopic}\nSubject: ${mm.subject}\n\n`;
    text += `OVERVIEW:\n${mm.summary}\n\nHIERARCHY:\n`;

    const serialize = (node: MindMapNode, level = 0) => {
      const indent = '  '.repeat(level);
      text += `${indent}• ${node.label}${node.description ? `: ${node.description}` : ''}\n`;
      if (node.children) {
        node.children.forEach((c) => serialize(c, level + 1));
      }
    };

    if (mm.rootNode) {
      serialize(mm.rootNode);
    }

    text += `\nKEY TAKEAWAYS:\n${(mm.keyTakeaways || []).map((t) => `• ${t}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveResourceToStorage(resource);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderNode = (node: MindMapNode, depth = 0) => {
    const isCollapsed = collapsedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;

    const depthBadge = [
      'bg-[#161616] text-white',
      'bg-[#E63956] text-white',
      'bg-stone-800 text-white',
      'bg-stone-200 text-stone-900',
    ][Math.min(depth, 3)];

    return (
      <div key={node.id} className="space-y-3">
        <div 
          className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
            depth === 0
              ? 'bg-[#161616] text-white border-[#161616] shadow-md'
              : depth === 1
              ? 'bg-white border-stone-200/90 shadow-2xs hover:border-stone-400'
              : 'bg-stone-50/70 border-stone-200 hover:bg-white'
          }`}
        >
          <div className="flex items-start gap-3 flex-1">
            {hasChildren && (
              <button
                type="button"
                onClick={() => toggleNode(node.id)}
                className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center hover:bg-stone-200/50 cursor-pointer"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${depthBadge}`}>
                  Level {depth + 1}
                </span>
                <span className={`font-display font-black text-sm sm:text-base uppercase tracking-tight ${
                  depth === 0 ? 'text-white' : 'text-stone-900'
                }`}>
                  {node.label}
                </span>
              </div>
              {node.description && (
                <p className={`font-mono text-xs leading-relaxed ${
                  depth === 0 ? 'text-stone-300' : 'text-stone-600'
                }`}>
                  {node.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Children Nodes */}
        {hasChildren && !isCollapsed && (
          <div className="pl-4 sm:pl-6 border-l-2 border-dashed border-stone-200 space-y-3 mt-2">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Build
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Hierarchy'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#161616] hover:bg-black text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#E63956]" />
            {saved ? 'Saved!' : 'Save to My Sets'}
          </button>
        </div>
      </div>

      {/* Main Mind Map Canvas */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-sm space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="pb-6 border-b border-stone-200 space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E63956]">
            VISUAL MIND MAP & CONCEPT HIERARCHY • CAPS ALIGNED
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase tracking-tight">
            {mm.title || resource.title}
          </h1>
          <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs text-stone-600 font-semibold flex-wrap">
            <span>SUBJECT: {mm.subject || resource.subject}</span>
            <span>•</span>
            <span>CENTRAL FOCUS: {mm.centralTopic}</span>
            <span>•</span>
            <span>AUDIENCE: {mm.gradeLevel || resource.gradeLevel}</span>
          </div>
          {mm.summary && (
            <p className="font-mono text-xs text-stone-700 pt-2 leading-relaxed">
              {mm.summary}
            </p>
          )}
        </div>

        {/* Mind Map Tree */}
        <div className="space-y-4">
          <h3 className="font-display font-black text-xl text-stone-900 uppercase flex items-center gap-2">
            <GitFork className="w-5 h-5 text-[#E63956]" />
            Conceptual Branching Structure
          </h3>
          <div className="pt-2">
            {mm.rootNode && renderNode(mm.rootNode, 0)}
          </div>
        </div>

        {/* Key Takeaways */}
        {mm.keyTakeaways && mm.keyTakeaways.length > 0 && (
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 font-mono text-xs space-y-3">
            <h4 className="font-bold uppercase text-stone-900 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E63956]" />
              Core Analytical Takeaways
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-stone-700">
              {mm.keyTakeaways.map((takeaway, i) => (
                <li key={i}>{takeaway}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
