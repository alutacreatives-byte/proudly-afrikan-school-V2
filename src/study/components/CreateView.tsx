import React from 'react';
import { ToolsView } from './ToolsView';
import { AppView, StudySet } from '../types';
import { GeneratorMode, InputMethod } from './CreateSetModal';

interface CreateViewProps {
  onNavigate: (view: AppView) => void;
  onCreateSetClick: (method?: InputMethod, topic?: string, mode?: GeneratorMode) => void;
  onSelectSet: (set: StudySet, mode?: AppView) => void;
  featuredSets?: StudySet[];
  onBack?: () => void;
  onOpenTutor?: (mode?: 'tutor' | 'homework') => void;
}

export const CreateView: React.FC<CreateViewProps> = ({
  onNavigate,
  onCreateSetClick,
  onSelectSet,
  onOpenTutor,
}) => {
  return (
    <ToolsView 
      onNavigate={onNavigate}
      onCreateSetClick={onCreateSetClick}
      onSelectSet={onSelectSet}
      onOpenTutor={onOpenTutor}
    />
  );
};
