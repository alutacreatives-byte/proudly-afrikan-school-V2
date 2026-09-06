import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Sparkles, 
  CreditCard, 
  CheckCircle, 
  RotateCw, 
  LogOut, 
  Calendar, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  TrendingDown,
  Clock
} from 'lucide-react';
import { useAuthCredit } from '../../context/AuthCreditContext';
import { PLANS, PlanTier } from '../../types/authCredit';

interface AccountModalProps {
  onNavigateToPricing: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ onNavigateToPricing }) => {
  const { 
    isAccountModalOpen, 
    closeAccountModal, 
    user, 
    availableCredits, 
    subscription, 
    transactions,
    signOut,
    refreshMonthlyCredits,
    cancelSubscription
  } = useAuthCredit();

  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'subscription'>('overview');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  if (!isAccountModalOpen) return null;

  const currentPlanDetails = PLANS[subscription.planId] || PLANS.FREE;
  const initialLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'A';
  const displayEmail = user?.email || 'scholar@proudlyafrikan.org';
  const displayCredits = availableCredits.toLocaleString();

  const handleRefresh = () => {
    refreshMonthlyCredits();
    setFeedbackMsg(`Monthly credits refreshed for ${currentPlanDetails.name} plan!`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleCancelSub = async () => {
    const res = await cancelSubscription();
    setFeedbackMsg(res.message || 'Subscription cancelled.');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#FAF7F0] border border-[#EAE3D6] rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.18)] p-6 sm:p-8 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching Afrikan Scholar Free Plan Card */}
        <div className="flex items-start justify-between pb-5 mb-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#161616] text-white flex items-center justify-center font-display font-black text-xl shadow-md shrink-0">
              {initialLetter}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-black text-xl sm:text-2xl text-[#161616] uppercase tracking-tight">
                  {user?.name || 'AFRIKAN SCHOLAR'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#161616] text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  {currentPlanDetails.id === 'FREE' ? 'FREE PLAN' : `${currentPlanDetails.name} PLAN`}
                </span>
              </div>
              <p className="font-mono text-xs sm:text-[13px] text-stone-600 font-medium mt-0.5">
                {displayEmail}
              </p>
            </div>
          </div>

          <button
            onClick={closeAccountModal}
            className="w-10 h-10 rounded-full bg-[#F2ECE1] hover:bg-[#EAE2D4] text-stone-800 border border-[#E0D7C7] flex items-center justify-center shadow-xs cursor-pointer transition-all shrink-0 ml-2"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Feedback message */}
        {feedbackMsg && (
          <div className="mb-3 p-3 rounded-2xl bg-white border border-[#F5B8D3] text-[#161616] text-xs font-mono font-bold flex items-center gap-2 shadow-[0_2px_10px_rgba(217,43,138,0.15)] animate-in fade-in">
            <Sparkles className="w-4 h-4 text-[#D92B8A] shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Tab Selection Bar with Neumorphic Pills */}
        <div className="p-1 rounded-2xl bg-[#EBE5DB] flex items-center gap-1.5 mb-5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-display font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer text-center ${
              activeTab === 'overview'
                ? 'bg-[#161616] text-white shadow-[0_0_16px_rgba(217,43,138,0.65)]'
                : 'bg-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            OVERVIEW & BALANCE
          </button>

          <button
            onClick={() => setActiveTab('usage')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-display font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer text-center ${
              activeTab === 'usage'
                ? 'bg-[#161616] text-white shadow-[0_0_16px_rgba(217,43,138,0.65)]'
                : 'bg-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            CREDIT USAGE LOG ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-display font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer text-center ${
              activeTab === 'subscription'
                ? 'bg-[#161616] text-white shadow-[0_0_16px_rgba(217,43,138,0.65)]'
                : 'bg-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            SUBSCRIPTION & BILLING
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* White Balance Card matching reference */}
              <div className="p-6 sm:p-7 rounded-[28px] bg-white border border-[#EAE3D6] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#D92B8A] fill-[#D92B8A]/20" />
                    <span className="font-display font-black text-xs sm:text-[13px] uppercase tracking-wider text-[#161616] underline underline-offset-4 decoration-2 decoration-stone-300">
                      AVAILABLE CREDITS
                    </span>
                  </div>
                  <span className="font-mono text-xs sm:text-[13px] font-bold text-stone-500">
                    Plan: <span className="text-[#161616] uppercase">{currentPlanDetails.name}</span>
                  </span>
                </div>

                {/* Giant Centered Available Credits Number */}
                <div className="py-2 text-center">
                  <div className="font-display font-black text-5xl sm:text-6xl text-[#161616] tracking-tight">
                    {displayCredits}
                  </div>
                </div>

                {/* Glowing Magenta Gradient Line */}
                <div className="my-6 w-full h-1.5 rounded-full bg-gradient-to-r from-[#E02D68] via-[#D92B8A] to-[#C92255] shadow-[0_0_12px_rgba(217,43,138,0.5)]" />

                {/* Normal Platform Use Is 100% Free Info */}
                <div className="space-y-1.5 mb-6">
                  <div className="flex items-center gap-2 text-xs sm:text-[13px] font-display font-black uppercase text-[#161616] tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-[#161616] stroke-[2.5]" />
                    <span>NORMAL PLATFORM USE IS 100% FREE</span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-sans text-stone-600 leading-relaxed pl-6">
                    Studying, viewing flashcards, taking quizzes, saving study sets, and using the Central Planner do <strong>not</strong> consume credits. Credits are solely dedicated to creating and generating new educational and assessment materials.
                  </p>
                </div>

                {/* Upgrade Plan Giant Glow Button */}
                <div>
                  <button
                    onClick={() => {
                      closeAccountModal();
                      onNavigateToPricing();
                    }}
                    className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-gradient-to-r from-[#E02D68] via-[#D92B8A] to-[#C92255] hover:brightness-105 active:scale-[0.99] text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_22px_rgba(217,43,138,0.5)] cursor-pointer transition-all"
                  >
                    <span>UPGRADE PLAN</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

                {subscription.planId !== 'FREE' && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={handleRefresh}
                      className="py-1.5 px-3 rounded-full text-stone-500 hover:text-stone-800 font-mono text-[11px] font-bold uppercase inline-flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <RotateCw className="w-3 h-3 text-stone-500" />
                      <span>Simulate Monthly Refresh</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-500 uppercase px-2">
                <span>Activity & Action</span>
                <span>Credits & Time</span>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-stone-200">
                  <Clock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs font-mono text-stone-500">No credit activity recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <div 
                        key={tx.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#EAE3D6] shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isPositive ? 'bg-[#FDF2F7] text-[#D92B8A]' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {isPositive ? <Sparkles className="w-4 h-4 text-[#D92B8A]" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-sans font-bold text-xs text-[#161616] truncate">
                              {tx.description}
                            </p>
                            <p className="font-mono text-[10px] text-stone-400">
                              {new Date(tx.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`font-mono font-bold text-xs ${
                            isPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {isPositive ? `+${tx.amount}` : tx.amount} cr
                          </span>
                          <p className="font-mono text-[10px] text-stone-400">
                            bal: {tx.balanceAfter}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <div className="p-5 rounded-[24px] bg-white border border-[#EAE3D6] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-stone-500 uppercase">
                    Current Plan Tier
                  </span>
                  <span className="font-display font-black text-sm text-[#161616] uppercase">
                    {currentPlanDetails.name} ({currentPlanDetails.priceZar === 0 ? 'FREE' : `R${currentPlanDetails.priceZar}/mo`})
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
                  <span className="font-mono text-xs font-bold text-stone-500 uppercase">
                    Monthly Credit Allocation
                  </span>
                  <span className="font-mono font-bold text-xs text-stone-800">
                    {currentPlanDetails.monthlyCredits.toLocaleString()} Credits / month
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
                  <span className="font-mono text-xs font-bold text-stone-500 uppercase">
                    Payment Provider
                  </span>
                  <span className="font-mono font-bold text-xs text-[#161616]">
                    {subscription.planId === 'FREE' ? 'None (Free Tier)' : 'Active Plan Subscription'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
                  <span className="font-mono text-xs font-bold text-stone-500 uppercase">
                    Status
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    subscription.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : subscription.status === 'cancelled'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-800'
                  }`}>
                    {subscription.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {subscription.planId !== 'FREE' && subscription.status === 'active' && (
                <div className="flex justify-end">
                  <button
                    onClick={handleCancelSub}
                    className="px-4 py-2 rounded-full bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-mono font-bold cursor-pointer transition-all shadow-xs"
                  >
                    Cancel Auto-Renewal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions matching reference */}
        <div className="mt-5 pt-4 border-t border-[#EAE3D6] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={signOut}
            className="text-stone-700 hover:text-stone-900 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-mono text-stone-600">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
            <span>Help: <a href="mailto:support@proudlyafrikan.org" className="underline font-bold text-[#161616] hover:text-[#D92B8A]">support@proudlyafrikan.org</a></span>
          </div>
        </div>
      </div>
    </div>
  );
};
