import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  Flame, 
  Trophy, 
  Award, 
  Save, 
  X, 
  User, 
  Building2, 
  MapPin, 
  Target,
  Sparkles,
  Crown,
  BookOpen,
  Mountain
} from 'lucide-react';
import { saveStoredProfile } from '../utils/storage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [institution, setInstitution] = useState(profile.institution);
  const [country, setCountry] = useState(profile.country);
  const [dailyGoal, setDailyGoal] = useState(profile.studyGoalDailyMinutes);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name,
      institution,
      country,
      studyGoalDailyMinutes: dailyGoal,
    };
    onUpdateProfile(updated);
    saveStoredProfile(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crown':
        return <Crown className="w-5 h-5 text-amber-500" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-[#D92B8A]" />;
      case 'Mountain':
        return <Mountain className="w-5 h-5 text-[#028090]" />;
      default:
        return <Award className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-8 border border-[#DFD5C2] shadow-2xl space-y-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E7DECD] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D92B8A] text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-[#D92B8A]/20">
              {name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-display font-extrabold text-[#161616]">
                Scholar Profile
              </h2>
              <span className="text-xs font-bold text-[#028090] uppercase tracking-wider font-mono-code">
                {profile.plan} Scholar Status
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9E9584] hover:text-[#161616] text-xl font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gamified Achievements Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-center space-y-1">
            <Flame className="w-5 h-5 text-orange-600 fill-orange-500 mx-auto" />
            <div className="text-lg font-mono-code font-bold text-orange-950">
              {profile.streakDays} Days
            </div>
            <p className="text-[10px] text-orange-800 font-semibold uppercase">
              Study Streak
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-center space-y-1">
            <span className="text-xl block">🐚</span>
            <div className="text-lg font-mono-code font-bold text-purple-950">
              {profile.cowriesXP.toLocaleString()}
            </div>
            <p className="text-[10px] text-purple-800 font-semibold uppercase">
              Cowries XP
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-1">
            <Target className="w-5 h-5 text-[#028090] mx-auto" />
            <div className="text-lg font-mono-code font-bold text-teal-950">
              {dailyGoal}m / day
            </div>
            <p className="text-[10px] text-teal-800 font-semibold uppercase">
              Daily Target
            </p>
          </div>
        </div>

        {/* Badges Earned */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#161616] font-mono-code flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#E59500]" />
            <span>Honors & Academic Badges ({profile.badges.length})</span>
          </h4>
          <div className="space-y-2">
            {profile.badges.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#DFD5C2] flex items-center gap-3"
              >
                <div className="p-2 rounded-xl bg-white shadow-xs">
                  {getBadgeIcon(b.icon)}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#161616]">{b.name}</h5>
                  <p className="text-[11px] text-[#6F685B]">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-[#E7DECD]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#161616] font-mono-code">
            Edit Scholar Credentials
          </h4>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#161616] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#8C8372]" /> Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#161616] flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#8C8372]" /> Academic Institution
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#161616] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8C8372]" /> Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#161616] flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#8C8372]" /> Daily Goal (Mins)
              </label>
              <input
                type="number"
                min={10}
                max={180}
                step={5}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D92B8A]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5C5546] hover:bg-[#FAF7F0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#D92B8A] hover:bg-[#BC1D73] text-white text-xs font-bold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'Updated!' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
