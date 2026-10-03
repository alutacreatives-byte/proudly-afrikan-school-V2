import React from 'react';
import { SavedResource } from './types';
import { BuildGeneratorView } from './components/BuildGeneratorView';

interface BuildAppProps {
  initialResource?: SavedResource | null;
  onGoHome?: () => void;
  onBack?: () => void;
}

export default function BuildApp({
  initialResource,
  onGoHome,
  onBack,
}: BuildAppProps) {
  return (
    <div className="w-full min-h-full">
      <BuildGeneratorView
        initialResource={initialResource}
        onGoHome={onGoHome}
        onBack={onBack}
      />
    </div>
  );
}
