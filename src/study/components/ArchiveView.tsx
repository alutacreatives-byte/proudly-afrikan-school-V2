import React from 'react';
import { LibraryView } from './LibraryView';
import { UserProfile, StudySet, AppView, UserStats } from '../types';
import { StorageService } from '../services/storageService';

interface ArchiveViewProps {
  currentUser: UserProfile;
  studySets: StudySet[];
  onSelectSet: (set: StudySet, mode?: AppView) => void;
  onExploreSets: () => void;
  onUserChanged: (newUser: UserProfile) => void;
  onBack?: () => void;
  stats?: UserStats;
  onNavigate?: (view: AppView) => void;
  onCreateSetClick?: () => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  currentUser,
  studySets,
  onSelectSet,
  onExploreSets,
  onUserChanged,
  stats,
  onNavigate,
  onCreateSetClick,
}) => {
  const currentStats = stats || StorageService.getStats();

  return (
    <LibraryView 
      currentUser={currentUser}
      studySets={studySets}
      stats={currentStats}
      onSelectSet={onSelectSet}
      onExploreSets={onExploreSets}
      onUserChanged={onUserChanged}
      onNavigate={onNavigate || (() => {})}
      onCreateSetClick={onCreateSetClick || (() => {})}
    />
  );
};
