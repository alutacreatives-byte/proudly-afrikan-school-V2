import React, { useState } from 'react';
import { SavedResource } from './types';
import { BuildHero } from './components/BuildHero';
import { BuildThreeWaysSection } from './components/BuildThreeWaysSection';
import { AllGeneratorsSection } from './components/AllGeneratorsSection';
import { BuildFaqSection } from './components/BuildFaqSection';
import { GeneratorModal } from './components/GeneratorModal';

interface BuildAppProps {
  initialResource?: SavedResource | null;
  onGoHome?: () => void;
}

export default function BuildApp({ initialResource }: BuildAppProps) {
  const [activeMethod, setActiveMethod] = useState<'topic' | 'text' | 'pdf' | 'capture'>('topic');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(initialResource ? true : false);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialResource?.topic || '');
  const [selectedGeneratorType, setSelectedGeneratorType] = useState<string>(initialResource?.toolType || 'exam');

  const handleSelectInspiration = (topic: string) => {
    setSelectedTopic(topic);
    setSelectedGeneratorType('exam');
    setIsModalOpen(true);
  };

  const handleOpenGenerator = (type: string = 'exam') => {
    setSelectedGeneratorType(type);
    setIsModalOpen(true);
  };

  const handleSelectMethod = (method: 'topic' | 'text' | 'pdf' | 'capture') => {
    setActiveMethod(method);
    if (method === 'pdf' || method === 'capture') {
      setSelectedGeneratorType('worksheet');
    } else {
      setSelectedGeneratorType('exam');
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
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
          onSelectTool={handleOpenGenerator}
        />

        {/* 4. Frequently Asked Questions Section */}
        <BuildFaqSection />

        {/* Generator Workbench Modal */}
        <GeneratorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialTopic={selectedTopic}
          initialGeneratorType={selectedGeneratorType}
        />
      </div>
    </div>
  );
}
