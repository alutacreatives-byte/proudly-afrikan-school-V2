import React, { useState, useEffect } from 'react';
import { BuildHero } from './BuildHero';
import { BuildThreeWaysSection } from './BuildThreeWaysSection';
import { AllGeneratorsSection } from './AllGeneratorsSection';
import { BuildFaqSection } from './BuildFaqSection';
import { GeneratorModal } from './GeneratorModal';
import { BuildGeneratorView } from './BuildGeneratorView';
import { SavedResource, BuildToolId } from './types';

interface BuildAppProps {
  initialResource?: SavedResource | null;
  onGoHome?: () => void;
  onBack?: () => void;
}

export const BuildApp: React.FC<BuildAppProps> = ({
  initialResource = null,
  onGoHome,
  onBack,
}) => {
  const [currentView, setCurrentView] = useState<'hub' | 'generator'>(
    initialResource ? 'generator' : 'hub'
  );
  const [selectedTool, setSelectedTool] = useState<BuildToolId>(
    initialResource?.toolType || 'exam'
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(
    initialResource?.topic || initialResource?.title || ''
  );
  const [threeWaysMethod, setThreeWaysMethod] = useState<'topic' | 'text' | 'pdf' | 'capture'>('topic');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTool, setModalTool] = useState<string>('exam');
  const [modalTopic, setModalTopic] = useState<string>('');

  useEffect(() => {
    if (initialResource) {
      setCurrentView('generator');
      setSelectedTool(initialResource.toolType || 'exam');
      setSelectedTopic(initialResource.topic || initialResource.title || '');
    }
  }, [initialResource]);

  const handleSelectTool = (toolId: string) => {
    setSelectedTool(toolId as BuildToolId);
    setCurrentView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectInspiration = (topic: string) => {
    setSelectedTopic(topic);
    setSelectedTool('exam');
    setCurrentView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenGeneratorModal = (generatorType = 'exam') => {
    setModalTool(generatorType);
    setModalTopic(selectedTopic);
    setIsModalOpen(true);
  };

  const handleUploadClick = () => {
    setSelectedTool('exam');
    setCurrentView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'generator') {
    return (
      <BuildGeneratorView
        initialToolId={selectedTool}
        initialTopic={selectedTopic}
        initialResource={initialResource}
        onBack={() => {
          if (initialResource && onBack) {
            onBack();
          } else {
            setCurrentView('hub');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onGoHome={onGoHome}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <BuildHero
        onStartClick={() => handleSelectTool('exam')}
        onSelectInspiration={handleSelectInspiration}
        onOpenGenerator={handleOpenGeneratorModal}
        onUploadClick={handleUploadClick}
      />

      {/* Four Ways Section */}
      <BuildThreeWaysSection
        activeMethod={threeWaysMethod}
        onSelectMethod={(method) => {
          setThreeWaysMethod(method);
          handleSelectTool('exam');
        }}
      />

      {/* Complete Suite Grid */}
      <AllGeneratorsSection
        onSelectGenerator={handleSelectTool}
        onSelectTool={handleSelectTool}
      />

      {/* FAQ & Capabilities */}
      <BuildFaqSection />

      {/* Legacy or Quick Modal Support */}
      <GeneratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialGeneratorType={modalTool}
        initialTopic={modalTopic}
        onResourceSaved={(res) => {
          setIsModalOpen(false);
          setSelectedTool(res.toolType || 'exam');
          setCurrentView('generator');
        }}
      />
    </div>
  );
};

export default BuildApp;
