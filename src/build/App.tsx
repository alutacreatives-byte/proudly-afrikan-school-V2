import React, { useState } from 'react';
import { SavedResource } from './types';
import { BuildHero } from './components/BuildHero';
import { BuildThreeWaysSection } from './components/BuildThreeWaysSection';
import { AllGeneratorsSection } from './components/AllGeneratorsSection';
import { BuildFaqSection } from './components/BuildFaqSection';
import { BuildGeneratorView } from './components/BuildGeneratorView';
import { GlobalNavigationButtons } from '../components/GlobalNavigationButtons';
import { BUILD_TOOLS_LIST } from './components/BuildToolsMenu';

interface BuildAppProps {
  initialResource?: SavedResource | null;
  onGoHome?: () => void;
}

export default function BuildApp({ initialResource, onGoHome }: BuildAppProps) {
  const [activeMethod, setActiveMethod] = useState<'topic' | 'text' | 'pdf' | 'capture'>('topic');
  const [activeTool, setActiveTool] = useState<string | null>(initialResource ? (initialResource.toolType || 'exam') : null);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialResource?.topic || '');

  const handleSelectInspiration = (topic: string) => {
    setSelectedTopic(topic);
    setActiveTool('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenGenerator = (type: string = 'exam') => {
    setActiveTool(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMethod = (method: 'topic' | 'text' | 'pdf' | 'capture') => {
    setActiveMethod(method);
    if (method === 'pdf' || method === 'capture') {
      setActiveTool('worksheet');
    } else {
      setActiveTool('exam');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOverview = () => {
    setActiveTool(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentToolItem = BUILD_TOOLS_LIST.find((t) => t.id === activeTool);

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      {/* Top Navigation Header in BUILD: [Back] and [Home] - displayed when a user opens a build tool */}
      {activeTool !== null && (
        <div className="w-full bg-[#FAF7F0] border-b border-stone-200/80 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
            <GlobalNavigationButtons
              onBack={handleBackToOverview}
              onGoHome={onGoHome}
              backLabel="Back"
              homeLabel="Home"
            />

            <div className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider hidden sm:block">
              {`BUILD • ${currentToolItem?.title || activeTool.toUpperCase()}`}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {activeTool !== null ? (
            /* Active Build Tool View with menu directly above generation area */
            <BuildGeneratorView
              key={`build-gen-${activeTool}`}
              activeTool={activeTool}
              onSelectTool={(toolId) => setActiveTool(toolId)}
              onBack={handleBackToOverview}
              initialTopic={selectedTopic}
              initialResource={initialResource}
            />
          ) : (
            /* Build Home Overview */
            <>
              {/* 1. Build Hero Section */}
              <BuildHero
                onSelectInspiration={handleSelectInspiration}
                onOpenGenerator={handleOpenGenerator}
                onUploadClick={() => handleSelectMethod('pdf')}
              />

              {/* 2. Four Ways To Create Section */}
              <BuildThreeWaysSection
                activeMethod={activeMethod}
                onSelectMethod={handleSelectMethod}
              />

              {/* 3. All 6 Generators Suite Section */}
              <AllGeneratorsSection
                onSelectGenerator={handleOpenGenerator}
              />

              {/* 4. Frequently Asked Questions Section */}
              <BuildFaqSection />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

