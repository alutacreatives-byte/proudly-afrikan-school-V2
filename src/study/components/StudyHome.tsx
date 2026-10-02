import React, { useState } from 'react';
import { StudyHero } from './StudyHero';
import { StudyToolsMenu } from './StudyToolsMenu';
import { StudyThreeWaysSection, StudyCreationMethod } from './StudyThreeWaysSection';
import { StudyGeneratorsSection } from './StudyGeneratorsSection';
import { StudyFaqSection } from './StudyFaqSection';
import { StudyToolType } from '../types';

interface StudyHomeProps {
  onSelectTool: (
    toolId: StudyToolType,
    prefillTopic?: string,
    prefillCategory?: string,
    initialData?: { sourceSnippet?: string; documentName?: string; capturedPhotoUrl?: string; [key: string]: any }
  ) => void;
  onOpenMyResources?: () => void;
  savedCount?: number;
}

export const StudyHome: React.FC<StudyHomeProps> = ({
  onSelectTool,
  onOpenMyResources,
  savedCount = 0,
}) => {
  const [activeMethod, setActiveMethod] = useState<StudyCreationMethod>('topic');

  const handleStartClick = () => {
    const el = document.getElementById('study-generators-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSample = (topic: string, category: string, suggestedTool?: StudyToolType) => {
    const tool = suggestedTool || 'study-guide';
    onSelectTool(tool, topic, category);
  };

  const handleUploadPdfClick = () => {
    setActiveMethod('pdf');
    const el = document.getElementById('study-generators-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectMethod = (method: StudyCreationMethod) => {
    setActiveMethod(method);
    const el = document.getElementById('study-generators-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchTool = (toolId: StudyToolType) => {
    onSelectTool(toolId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 sm:space-y-12">
      {/* 1. Study Header Section with Instant Inspiration */}
      <StudyHero
        onStartClick={handleStartClick}
        onSelectSample={handleSelectSample}
        onUploadPdfClick={handleUploadPdfClick}
      />

      {/* 2. Primary Study Tools Menu */}
      <div id="study-menu-entry-point" className="w-full">
        <StudyToolsMenu
          activeTool={null}
          onSelectTool={handleLaunchTool}
        />
      </div>

      {/* 3. 4 Ways to Study Section */}
      <StudyThreeWaysSection
        activeMethod={activeMethod}
        onSelectMethod={handleSelectMethod}
      />

      {/* 4. All 6 Study Tools Section */}
      <StudyGeneratorsSection
        onSelectTool={(toolId) => handleLaunchTool(toolId)}
      />

      {/* 5. Frequently Asked Questions Section */}
      <StudyFaqSection />
    </div>
  );
};
