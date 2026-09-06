import React, { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Layers, 
  FolderOpen, 
  Calendar, 
  Tag, 
  Zap, 
  Menu, 
  X, 
  LogIn, 
  UserPlus 
} from 'lucide-react';
import { useAuthCredit } from '../context/AuthCreditContext';
import { PlanTier, PLANS } from '../types/authCredit';

export type MainNavTab = 'STUDY' | 'QUIZ' | 'BUILD' | 'MY SETS' | 'PLANNER' | 'PRICING';

interface MasterHeaderProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  savedItemCount?: number;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({
  activeTab,
  onSelectTab,
  savedItemCount = 8,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { user, availableCredits, isAuthenticated, subscription, openAuthModal, openAccountModal } = useAuthCredit();

  // Dynamic Plan Tier: FREE, LEARNER, STUDENT, or SCHOLAR
  const currentPlanTier: PlanTier = (isAuthenticated && subscription?.planId && PLANS[subscription.planId]) 
    ? subscription.planId 
    : 'FREE';

  const getPlanDisplayLabel = (tier: PlanTier): string => {
    switch (tier) {
      case 'LEARNER':
        return 'Plan: Learner';
      case 'STUDENT':
        return 'Plan: Student';
      case 'SCHOLAR':
        return 'Plan: Scholar';
      case 'FREE':
      default:
        return 'Plan: Free';
    }
  };

  const navItems: { id: MainNavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'STUDY', label: 'STUDY', icon: BookOpen },
    { id: 'QUIZ', label: 'QUIZ', icon: GraduationCap },
    { id: 'BUILD', label: 'BUILD', icon: Layers },
    { id: 'MY SETS', label: 'MY SETS', icon: FolderOpen, badge: savedItemCount },
    { id: 'PLANNER', label: 'PLANNER', icon: Calendar },
    { id: 'PRICING', label: 'PRICING', icon: Tag },
  ];

  return (
    <header className="sticky top-0 z-50 select-none bg-[#FAF7F0] px-3 sm:px-6 lg:px-8 py-3 transition-all">
      {/* Outer Floating Pill Capsule Bar matching A2.png visual style */}
      <div className="w-full max-w-7xl mx-auto bg-white border border-[#EAE5DC] rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.02)] px-3.5 sm:px-6 lg:px-7 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Brand Emblem & Typography */}
        <div
          onClick={() => onSelectTab('STUDY')}
          className="flex items-center gap-3 sm:gap-3.5 cursor-pointer group shrink-0"
        >
          {/* Logo Emblem Box: Vibrant Crimson Rounded Squircle */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#E02D68] via-[#D92B8A] to-[#C92255] shadow-[0_4px_14px_rgba(217,43,138,0.35)] p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
            {!logoError ? (
              <img
                src="https://sifisos.com/wp-content/uploads/2026/04/Proudly-Afrikan-Logo.png"
                alt="Proudly Afrikan"
                className="w-full h-full object-contain brightness-0 invert"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="font-display font-black text-xs text-white tracking-tighter">
                PA
              </span>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-base sm:text-lg lg:text-xl tracking-tight text-[#161616] uppercase leading-none">
                PROUDLY AFRIKAN
              </span>
            </div>
            <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-[#6B655B] uppercase mt-1 leading-none">
              RESOURCE GENERATOR
            </span>
          </div>
        </div>

        {/* Center: Navigation Items (Preserving exact items, order, labels & functionality) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`font-display font-black text-xs xl:text-sm tracking-wide uppercase flex items-center gap-1.5 transition-colors cursor-pointer relative py-1.5 whitespace-nowrap ${
                  isActive
                    ? 'text-[#161616]'
                    : 'text-stone-600 hover:text-[#161616]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D92B8A]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                    isActive ? 'bg-[#161616] text-white' : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D92B8A] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Plan Button & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Dynamic Plan Button styled as refined pill */}
          <button
            id="nav-plan-account-btn"
            onClick={openAccountModal}
            title={`${getPlanDisplayLabel(currentPlanTier)} - Click to view current plan and account settings`}
            className="hidden sm:flex bg-white hover:bg-stone-50 text-[#161616] border border-stone-200 rounded-full px-3.5 sm:px-4 py-2 font-mono text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-xs items-center gap-1.5 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-[#D92B8A] shrink-0"></span>
            <span className="font-display font-black text-xs text-[#161616]">{getPlanDisplayLabel(currentPlanTier)}</span>
          </button>

          {/* Auth Trigger for Unauthenticated users */}
          {(!isAuthenticated || !user) && (
            <button
              onClick={() => openAuthModal('signin')}
              className="hidden 2xl:flex items-center gap-1 text-xs font-display font-black uppercase text-stone-700 hover:text-black px-2 py-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#D92B8A]" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile/Tablet menu toggle button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-full border border-stone-200 bg-white text-[#161616] shadow-xs hover:bg-stone-50 cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu matching visual style */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 w-full max-w-7xl mx-auto bg-white border border-[#EAE5DC] rounded-3xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.08)] space-y-2 animate-in slide-in-from-top-2">
          {/* Active Plan / Account Bar */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openAccountModal();
            }}
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D92B8A]"></span>
              <span className="font-display font-black text-xs text-[#161616]">{getPlanDisplayLabel(currentPlanTier)}</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-stone-500 uppercase">Account Settings</span>
          </button>

          {/* Navigation Links in exact order */}
          <div className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-2xl font-display font-black text-sm uppercase flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#161616] text-white'
                      : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D92B8A]' : 'text-stone-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile User Auth Actions */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            {!isAuthenticated || !user ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('signin');
                  }}
                  className="py-2.5 px-3 rounded-full bg-white border border-stone-200 text-[#161616] font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#D92B8A]" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="py-2.5 px-3 rounded-full bg-gradient-to-r from-[#D92B8A] to-[#E6425E] text-white font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
};

