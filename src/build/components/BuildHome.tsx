import React from 'react';
import { BuildHero } from './BuildHero';
import { BuildThreeWaysSection, BuildCreationMethod } from './BuildThreeWaysSection';
import { AllGeneratorsSection } from './AllGeneratorsSection';
import { BuildFaqSection } from './BuildFaqSection';
import { BuildToolType } from '../types';

interface BuildHomeProps {
  onSelectTool: (toolId: BuildToolType, prefillTopic?: string, prefillCategory?: string) => void;
  onOpenMyResources?: () => void;
  savedCount?: number;
}

export const BuildHome: React.FC<BuildHomeProps> = ({
  onSelectTool,
  onOpenMyResources,
  savedCount = 0,
}) => {
  const [activeMethod, setActiveMethod] = React.useState<BuildCreationMethod>('topic');

  const handleStartClick = () => {
    const el = document.getElementById('all-generators-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSample = (topic: string, category: string, suggestedTool?: BuildToolType) => {
    const tool = suggestedTool || 'exam';
    onSelectTool(tool, topic, category);
  };

  const handleUploadPdfClick = () => {
    setActiveMethod('pdf');
    const el = document.getElementById('all-generators-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectMethod = (method: BuildCreationMethod) => {
    setActiveMethod(method);
    const el = document.getElementById('all-generators-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 sm:space-y-14">
      {/* 1. Build Header Section with Instant Inspiration */}
      <BuildHero
        onStartClick={handleStartClick}
        onSelectSample={handleSelectSample}
        onUploadPdfClick={handleUploadPdfClick}
      />

      {/* 2. 4 Ways to Create Section */}
      <BuildThreeWaysSection
        activeMethod={activeMethod}
        onSelectMethod={handleSelectMethod}
      />

      {/* 3. All 6 Generators Section */}
      <AllGeneratorsSection
        onSelectTool={(toolId) => onSelectTool(toolId)}
      />

      {/* 4. Frequently Asked Questions Section */}
      <BuildFaqSection />
    </div>
  );
};
