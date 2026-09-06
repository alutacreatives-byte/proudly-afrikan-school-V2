import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  Zap, 
  Mail, 
  ArrowRight, 
  Clock,
  HelpCircle,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { useAuthCredit } from '../context/AuthCreditContext';
import { PLANS, PlanTier, AI_CREDIT_COSTS } from '../types/authCredit';

interface PricingViewProps {
  onNavigateToTab?: (tab: any) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onNavigateToTab }) => {
  const { 
    currentPlan, 
    selectPlan, 
    availableCredits, 
    openAuthModal, 
    isAuthenticated,
    openAccountModal
  } = useAuthCredit();

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string>('');

  const plansList = Object.values(PLANS);

  const handlePlanClick = (planId: PlanTier) => {
    if (!isAuthenticated && planId === 'FREE') {
      openAuthModal('signup');
      return;
    }
    setSelectedPlanForCheckout(planId);
  };

  const handleConfirmPlanSubscription = async () => {
    if (!selectedPlanForCheckout) return;
    setIsProcessing(true);
    try {
      const res = await selectPlan(selectedPlanForCheckout);
      if (res.success) {
        setSuccessNotice(res.message || `Subscribed to ${selectedPlanForCheckout} plan!`);
        setSelectedPlanForCheckout(null);
        setTimeout(() => setSuccessNotice(''), 6000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const creditCostItems: { label: string; cost: number; category: string }[] = [
    { label: 'Quiz / Flashcards', cost: AI_CREDIT_COSTS.QUIZ_FLASHCARDS, category: 'Revision' },
    { label: 'Study Guide', cost: AI_CREDIT_COSTS.STUDY_GUIDE, category: 'Study' },
    { label: 'Worksheet', cost: AI_CREDIT_COSTS.WORKSHEET, category: 'Practice' },
    { label: 'Exam & Rubric', cost: AI_CREDIT_COSTS.EXAM, category: 'Assessment' },
    { label: 'Lesson Plan', cost: AI_CREDIT_COSTS.LESSON_PLAN, category: 'Curriculum' },
    { label: 'PDF Study Pack', cost: AI_CREDIT_COSTS.PDF_STUDY_PACK, category: 'Deep Review' },
    { label: 'Presentation Deck', cost: AI_CREDIT_COSTS.PRESENTATION, category: 'Slides' },
    { label: 'Course Blueprint', cost: AI_CREDIT_COSTS.COURSE, category: 'Mastery' },
    { label: 'Learning Path', cost: AI_CREDIT_COSTS.LEARNING_PATH, category: 'Mastery' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAF7F0] text-[#161616] pb-24">
      {/* Top Hero Section matching Study page */}
      <section className="pt-4 pb-12 border-b-2 border-[#161616] bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Edition Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border-2 border-[#161616] rounded-full shadow-[2px_2px_0px_#161616] text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-stone-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D92B8A] inline-block animate-pulse"></span>
            <span>PROUDLY AFRIKAN EDUCATION • TRANSPARENT PRICING</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] xl:text-[6.25rem] uppercase tracking-tighter text-[#161616] leading-[0.88] sm:leading-[0.9] lg:leading-[0.92] break-words">
                CHOOSE<br />
                HOW YOU<br />
                <span className="text-[#D92B8A]">LEARN.</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-stone-700 font-normal leading-[1.65] max-w-2xl">
                Every new user receives <strong className="font-bold text-[#161616]">400 free once-off credits</strong>. Upgrade to flexible monthly subscriptions anytime to power your curriculum, teaching, and study workflow.
              </p>
            </div>

            {/* Current Balance Card */}
            <div className="lg:col-span-4 flex lg:justify-end">
              <div className="w-full lg:w-auto bg-[#FAF8F5] border-2 border-[#161616] shadow-[4px_4px_0px_#161616] rounded-3xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between border-b-2 border-stone-200 pb-2.5 gap-4">
                  <div className="flex items-center gap-2 font-display text-xs font-black uppercase tracking-wider text-[#161616]">
                    <Zap className="w-4 h-4 text-[#D92B8A]" />
                    <span>YOUR ACCOUNT</span>
                  </div>
                  <span className="font-mono text-xs text-[#D92B8A] font-bold uppercase tracking-wider">
                    {currentPlan} PLAN
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-display font-black text-3xl text-[#161616]">
                    {availableCredits.toLocaleString()} <span className="text-sm font-mono font-normal text-stone-600">Credits</span>
                  </div>
                  <p className="font-mono text-xs text-stone-600">
                    Available balance for AI generation
                  </p>
                </div>

                <button
                  onClick={openAccountModal}
                  className="tactile-btn w-full py-2.5 px-4 rounded-2xl bg-[#161616] hover:bg-stone-800 text-white font-display text-xs font-black uppercase tracking-wider border-2 border-[#161616] shadow-[2px_2px_0px_#D92B8A] transition-all text-center cursor-pointer"
                >
                  Manage Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Success Alert */}
        {successNotice && (
          <div className="p-4 rounded-2xl bg-[#FAF7F0] border-2 border-[#161616] text-[#161616] font-sans text-sm font-bold flex items-center gap-3 shadow-[3px_3px_0px_#D92B8A] animate-in fade-in">
            <Sparkles className="w-5 h-5 text-[#D92B8A] shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* 4 Plans Grid - Matching exact soft-embossed card styling from Pricing.jpeg */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-7 items-stretch">
          {plansList.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isPopular = plan.id === 'STUDENT';

            // Distinct plan title colors matching reference
            const titleColor = 
              plan.id === 'FREE' ? '#E62E43' :
              plan.id === 'LEARNER' ? '#D96B27' :
              plan.id === 'STUDENT' ? '#D92B8A' : '#D33842';

            // Distinct badge next to title
            const getBadge = () => {
              if (plan.id === 'FREE') {
                return (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#161616] text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    CURRENT
                  </span>
                );
              }
              if (plan.id === 'LEARNER') {
                return (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-stone-700 font-mono text-[10px] font-bold uppercase tracking-wider border border-stone-200 shadow-xs">
                    ACTIVE
                  </span>
                );
              }
              if (plan.id === 'SCHOLAR') {
                return (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-stone-700 font-mono text-[10px] font-bold uppercase tracking-wider border border-stone-200 shadow-xs">
                    PLUS
                  </span>
                );
              }
              return null;
            };

            // Custom features matching reference exact phrasing
            const getFeaturesList = () => {
              if (plan.id === 'FREE') {
                return [
                  '400 once-off AI credits on sign',
                  'Unlimited access to Study.',
                  'Full access to My Sets library',
                  'Standard AI generation speed',
                  'No recurring payment',
                ];
              }
              if (plan.id === 'LEARNER') {
                return [
                  '1,500 AI credits per month',
                  'Monthly recurring subscription',
                  'All AI generation tools enabled',
                  'Export worksheets and exams to PDF',
                  'Standard customer support',
                ];
              }
              if (plan.id === 'STUDENT') {
                return [
                  '4,000 AI credits per month',
                  'Monthly recurring subscription',
                  'MOST POPULAR for South SA',
                  'Deep study packs & multi-section exams',
                  'Rollover support & priority assistance',
                ];
              }
              return [
                '12,000 AI credits per month',
                'Monthly recurring subscription',
                'Full curriculum & learning path',
                'Multi-section exam paper & rubric generator',
                'Direct support: support@proudlyafrikan.org',
              ];
            };

            const getCreditLabel = () => {
              if (plan.id === 'FREE') return '400 CREDITS ONCE-OFF';
              if (plan.id === 'LEARNER') return '1,500 CREDITS / MONTH';
              if (plan.id === 'STUDENT') return '4,000 CREDITS / MONTH';
              return '12,000 CREDITS / PLUS';
            };

            return (
              <div
                key={plan.id}
                onClick={() => !isCurrent && handlePlanClick(plan.id)}
                className={`relative rounded-[32px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                  isPopular 
                    ? 'bg-[#FDFBF7] border-2 border-[#D92B8A] shadow-[0_0_30px_rgba(217,43,138,0.22),0_12px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_0_40px_rgba(217,43,138,0.32),0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1' 
                    : 'bg-[#FDFBF7] border border-[#EAE3D6] shadow-[0_10px_30px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.07)] hover:-translate-y-1'
                }`}
              >
                {/* Popular Badge for Student */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#E02D68] via-[#D92B8A] to-[#C92255] text-white font-mono font-black text-[10px] tracking-wider uppercase shadow-[0_4px_16px_rgba(217,43,138,0.55)] whitespace-nowrap z-10 flex items-center gap-1">
                    <span>★ MOST POPULAR</span>
                  </div>
                )}

                <div>
                  {/* Card Header with Title and Pill Badge */}
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 
                      className="font-display font-black text-2xl sm:text-3xl tracking-tight uppercase"
                      style={{ color: titleColor }}
                    >
                      {plan.name}
                    </h3>

                    {getBadge()}
                  </div>

                  {/* Tagline */}
                  <p className="font-sans text-xs sm:text-[13px] text-stone-800 font-medium mb-4 min-h-[38px] leading-relaxed">
                    {plan.tagline}
                  </p>

                  {/* Inset Neumorphic Price & Credit Box */}
                  <div className={`p-4 sm:p-5 rounded-2xl mb-5 transition-colors ${
                    isPopular
                      ? 'bg-[#FAF0F4] border border-[#F5D0DE] shadow-[inset_1px_1px_3px_rgba(224,45,104,0.06),inset_-1px_-1px_3px_rgba(255,255,255,0.9)]'
                      : 'bg-[#F5EFEB] border border-[#E9E1D4] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.04),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]'
                  }`}>
                    <div className="flex items-baseline">
                      <span className="font-display font-black text-3xl sm:text-4xl text-[#161616] tracking-tight">
                        R{plan.priceZar}
                      </span>
                      <span className="font-mono text-xs sm:text-sm text-stone-600 font-bold ml-1.5">
                        {plan.priceZar === 0 ? 'once-off' : '/month'}
                      </span>
                    </div>

                    <div className={`mt-2.5 pt-2.5 flex items-center gap-1.5 text-xs font-mono font-bold tracking-tight text-[#161616] border-t ${
                      isPopular ? 'border-[#F0C4D4]' : 'border-[#E3D9C9]'
                    }`}>
                      <Zap className="w-3.5 h-3.5 text-[#D92B8A] fill-[#D92B8A]/20 shrink-0" />
                      <span>{getCreditLabel()}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    <p className="font-mono text-[11px] uppercase font-bold text-stone-900 tracking-wider mb-2.5">
                      INCLUDED IN THIS PLAN:
                    </p>
                    {getFeaturesList().map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-stone-800 font-normal leading-snug">
                        <Check className="w-3.5 h-3.5 text-[#D92B8A] shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button Group matching reference */}
                <div className="mt-4 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isCurrent) handlePlanClick(plan.id);
                      }}
                      className="bg-[#F2ECE1] hover:bg-[#EAE2D4] active:scale-[0.98] rounded-full py-2.5 sm:py-3 px-4 flex-1 text-center font-display font-black text-xs sm:text-[13px] tracking-wider text-[#161616] uppercase shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.03)] border border-[#E3D9C9] transition-all cursor-pointer"
                    >
                      <span>SELECT PLAN</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isCurrent) handlePlanClick(plan.id);
                      }}
                      className="w-10 h-10 rounded-full bg-[#161616] hover:bg-stone-800 active:scale-95 text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer"
                      title={`Select ${plan.name}`}
                    >
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free Normal Usage Guarantee Box */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-stone-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F0] border border-stone-300 text-[#161616] font-mono text-xs font-bold uppercase">
                <ShieldCheck className="w-4 h-4 text-[#D92B8A]" />
                <span>Zero-Credit Free Access Guarantee</span>
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#161616] uppercase tracking-tight">
                Normal platform use does NOT consume any credits
              </h3>
              <p className="font-sans text-stone-700 text-xs sm:text-sm max-w-3xl leading-relaxed">
                Credits are used only for AI creation and generation. You can freely study existing sets, take revision quizzes, review saved collections, and manage study timetables without spending a single credit.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono font-bold text-stone-800 shrink-0 w-full md:w-auto">
              <div className="p-2.5 rounded-2xl bg-[#FAF7F0] border border-stone-200 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#D92B8A]"></span>
                <span>Studying: 0 cr</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#FAF7F0] border border-stone-200 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#D92B8A]"></span>
                <span>Taking Quizzes: 0 cr</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#FAF7F0] border border-stone-200 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#D92B8A]"></span>
                <span>My Sets: 0 cr</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#FAF7F0] border border-stone-200 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#D92B8A]"></span>
                <span>Study Planner: 0 cr</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Credit Cost Breakdown Table */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-stone-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.06)] space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#D92B8A]" />
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#161616] uppercase tracking-tight">
                Credit Cost Schedule
              </h3>
            </div>
            <p className="font-sans text-xs sm:text-sm text-stone-600">
              Clear breakdown of AI credits required per generation tool:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {creditCostItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-stone-200 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-stone-500">
                    {item.category}
                  </span>
                  <h4 className="font-display font-black text-xs uppercase text-[#161616]">
                    {item.label}
                  </h4>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-[#161616] text-white font-mono font-bold text-xs flex items-center gap-1 shrink-0 shadow-sm">
                  <Zap className="w-3 h-3 text-[#D92B8A]" />
                  <span>{item.cost} cr</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Customer Support & Institutional Inquiries Card */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-stone-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D92B8A] uppercase">
              <Mail className="w-4 h-4" />
              <span>Direct Customer & School Support</span>
            </div>
            <h3 className="font-display font-black text-2xl text-[#161616] uppercase tracking-tight">
              support@proudlyafrikan.org
            </h3>
            <p className="font-sans text-xs sm:text-sm text-stone-700 leading-relaxed">
              For any questions regarding monthly subscriptions, custom school and educator bulk licenses, or account access, our team is ready to assist you.
            </p>
          </div>

          <a
            href="mailto:support@proudlyafrikan.org"
            className="px-7 py-4 rounded-full bg-[#18181B] hover:bg-stone-900 text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider shadow-md inline-flex items-center gap-2.5 cursor-pointer transition-all shrink-0"
          >
            <span>Contact Support</span>
            <ArrowRight className="w-4 h-4 text-[#D92B8A]" />
          </a>
        </div>
      </div>

      {/* Plan Selection / Subscription Modal */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-lg bg-[#FAF8F5] border-2 border-[#161616] rounded-3xl shadow-[6px_6px_0px_#161616] p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b-2 border-stone-200">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-stone-500">
                  Plan Subscription Setup
                </span>
                <h3 className="font-display font-black text-xl text-[#161616] uppercase">
                  {PLANS[selectedPlanForCheckout].name} PLAN
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="w-8 h-8 rounded-xl border-2 border-[#161616] bg-white text-[#161616] hover:bg-stone-100 flex items-center justify-center font-black cursor-pointer shadow-[1.5px_1.5px_0px_#161616]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-[#161616] shadow-[2px_2px_0px_#161616] space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-xs font-bold text-stone-600 uppercase">Monthly Price</span>
                <span className="font-display font-black text-2xl text-[#161616]">
                  R{PLANS[selectedPlanForCheckout].priceZar} {PLANS[selectedPlanForCheckout].priceZar === 0 ? 'once-off' : '/ month'}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
                <span className="font-mono text-xs font-bold text-stone-600 uppercase">Credit Allocation</span>
                <span className="font-mono font-bold text-sm text-[#D92B8A]">
                  +{PLANS[selectedPlanForCheckout].monthlyCredits.toLocaleString()} AI Credits
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="tactile-btn flex-1 py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-50 border-2 border-[#161616] text-[#161616] font-display font-black text-xs uppercase cursor-pointer transition-all shadow-[2px_2px_0px_#161616]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPlanSubscription}
                disabled={isProcessing}
                className="tactile-btn flex-1 py-3.5 px-4 rounded-2xl bg-[#D92B8A] hover:bg-[#c02377] text-white font-display font-black text-xs uppercase tracking-wider border-2 border-[#161616] shadow-[3px_3px_0px_#161616] cursor-pointer transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : `Confirm & Activate`}
              </button>
            </div>

            <div className="text-center text-[10px] font-mono text-stone-500">
              Need assistance? Email <a href="mailto:support@proudlyafrikan.org" className="underline hover:text-[#161616] font-bold">support@proudlyafrikan.org</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

