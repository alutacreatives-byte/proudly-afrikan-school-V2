import React from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  PlusCircle, 
  FolderKanban, 
  Calendar, 
  Sparkles, 
  Flame, 
  Compass, 
  User, 
  Camera 
} from 'lucide-react';
import { AppTab, UserProfile } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  profile: UserProfile;
  onOpenProfile: () => void;
  onOpenScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  profile,
  onOpenProfile,
  onOpenScanner
}) => {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'study', label: 'Study', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'build', label: 'Build', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'mysets', label: 'Archive', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'planner', label: 'Planner', icon: <Calendar className="w-4 h-4" /> },
    { id: 'pricing', label: 'Pricing', icon: <Sparkles className="w-4 h-4" />, badge: 'Pro' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E7DECD] shadow-xs">
      {/* African pattern motif top ribbon */}
      <div className="h-1.5 w-full bg-linear-to-r from-[#D92B8A] via-[#E59500] to-[#028090]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => onTabChange('study')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-xl bg-[#D92B8A] text-white flex items-center justify-center font-bold shadow-md shadow-[#D92B8A]/20 transition-transform group-hover:scale-105">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-tight text-[#161616]">
                  PROUDLY AFRIKAN
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-[#E59500]/15 text-[#B26B00] border border-[#E59500]/30 uppercase tracking-widest font-mono-code">
                  SCHOOL
                </span>
              </div>
              <p className="text-xs text-[#6F685B] hidden sm:block font-medium">
                Pan-African Revision & Academic Excellence
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-[#EDE7D9] p-1.5 rounded-2xl border border-[#DFD5C2]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap relative ${
                    isActive
                      ? 'bg-white text-[#161616] shadow-sm font-bold'
                      : 'text-[#5C5546] hover:text-[#161616] hover:bg-white/50'
                  }`}
                >
                  <span className={isActive ? 'text-[#D92B8A]' : 'text-[#827A6C]'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#D92B8A] text-white rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Badges: Streak, Cowries XP & Profile */}
          <div className="flex items-center gap-2.5">
            {/* Note scanner camera icon */}
            <button
              id="btn-quick-camera"
              onClick={onOpenScanner}
              title="Camera Note Scanner & Live Webcam"
              className="p-2.5 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] text-[#5C5546] hover:text-[#D92B8A] hover:border-[#D92B8A]/40 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Streak Counter */}
            <div 
              title="Consecutive Days of Study Streak"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold"
            >
              <Flame className="w-4 h-4 text-orange-600 fill-orange-500 animate-pulse" />
              <span>{profile.streakDays}d</span>
            </div>

            {/* Cowries XP Points */}
            <div 
              title="Ubuntu Cowries XP Earned"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold"
            >
              <span className="text-sm">🐚</span>
              <span>{profile.cowriesXP.toLocaleString()} XP</span>
            </div>

            {/* Profile Avatar Button */}
            <button
              id="btn-header-profile"
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white border border-[#DFD5C2] hover:border-[#D92B8A]/40 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-[#D92B8A] text-white flex items-center justify-center font-bold text-xs">
                {profile.name.charAt(0)}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-[#161616] leading-tight truncate max-w-[90px]">
                  {profile.name}
                </p>
                <p className="text-[10px] text-[#028090] font-semibold uppercase tracking-wider">
                  {profile.plan} Scholar
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#EDE7D9] overflow-x-auto gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[11px] font-semibold ${
                  isActive ? 'text-[#D92B8A] font-bold bg-[#EDE7D9]/70' : 'text-[#6F685B]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
