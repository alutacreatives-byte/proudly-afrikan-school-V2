import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  School, 
  Zap, 
  HelpCircle,
  CreditCard,
  Smartphone
} from 'lucide-react';
import { UserProfile } from '../types';
import { saveStoredProfile } from '../utils/storage';

interface PricingViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

type Currency = 'NGN' | 'KES' | 'GHS' | 'ZAR' | 'USD';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: '₦',
  KES: 'KSh ',
  GHS: 'GH₵ ',
  ZAR: 'R ',
  USD: '$',
};

export const PricingView: React.FC<PricingViewProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showCheckoutModal, setShowCheckoutModal] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mobile-money' | 'card'>('mobile-money');
  const [isProcessing, setIsProcessing] = useState(false);

  const discountMultiplier = billingCycle === 'annual' ? 0.8 : 1.0;

  const plans = [
    {
      id: 'free',
      name: 'Harambee Free',
      badge: 'For All African Students',
      tagline: 'Open access to core pan-African revision kits & peer study.',
      price: {
        USD: 0,
        NGN: 0,
        KES: 0,
        GHS: 0,
        ZAR: 0,
      },
      features: [
        'Full access to curated Pan-African history & science decks',
        'Interactive flashcards with spaced repetition',
        'Standard practice quiz arena',
        'Daily revision timetable & Pomodoro timer',
        'Export flashcards to printable PDF',
        'Standard community support',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Ubuntu Scholar Pro',
      badge: 'Most Popular Across Africa',
      tagline: 'Unlimited Gemini intelligence, document parsing, and adaptive exam mastery.',
      price: {
        USD: 4.99 * discountMultiplier,
        NGN: Math.round(6500 * discountMultiplier),
        KES: Math.round(650 * discountMultiplier),
        GHS: Math.round(65 * discountMultiplier),
        ZAR: Math.round(95 * discountMultiplier),
      },
      features: [
        'Unlimited AI study kit & flashcard generation',
        'Upload textbook DOCX & notes for instant syllabus mapping',
        'Adaptive AI exam questions with deep historical context',
        'Export full decks directly to PowerPoint (PPTX) & PDF',
        'Indigenous & colonial language audio speech synthesis',
        'Offline study synchronization',
        'Verified Scholar profile badge & 2x XP Cowries boost',
      ],
      popular: true,
    },
    {
      id: 'campus',
      name: 'Sankofa Campus & School',
      badge: 'Institutions & Academies',
      tagline: 'Institutional curriculum licensing for schools, colleges, and academies.',
      price: {
        USD: 39.00 * discountMultiplier,
        NGN: Math.round(52000 * discountMultiplier),
        KES: Math.round(5200 * discountMultiplier),
        GHS: Math.round(520 * discountMultiplier),
        ZAR: Math.round(750 * discountMultiplier),
      },
      features: [
        'Whole-school license with teacher administrative control',
        'Alignment with national syllabi (WAEC, KCSE, Matric, IGCSE)',
        'Classroom performance analytics & cohort progress reports',
        'Custom school badge, heraldry, and crest integration',
        'LMS integration (Google Classroom, Moodle, Canvas)',
        'Direct pedagogy workshop support with academic specialists',
      ],
      popular: false,
    },
  ];

  const handleCompleteUpgrade = (planId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const updated: UserProfile = {
        ...profile,
        plan: planId === 'campus' ? 'campus' : 'pro',
      };
      onUpdateProfile(updated);
      saveStoredProfile(updated);
      setIsProcessing(false);
      setShowCheckoutModal(null);
      alert(`🎉 Welcome to ${planId === 'campus' ? 'Sankofa Campus' : 'Ubuntu Scholar Pro'}! Your membership is active.`);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E59500]/15 text-[#B26B00] text-xs font-bold font-mono-code uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#E59500]" />
          <span>Local African Currency Pricing</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#161616] tracking-tight">
          Accessible, Continental Pricing for Every Mind
        </h1>

        <p className="text-base text-[#5C5546] font-medium leading-relaxed">
          Empowering the next generation of African scientists, historians, and leaders. Pay seamlessly in local currency via Mobile Money or Card.
        </p>

        {/* Currency Switcher & Billing Toggle */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Currency selection pills */}
          <div className="flex items-center bg-[#EDE7D9] p-1 rounded-2xl border border-[#DFD5C2]">
            {(['NGN', 'KES', 'GHS', 'ZAR', 'USD'] as Currency[]).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currency === cur
                    ? 'bg-white text-[#161616] shadow-xs'
                    : 'text-[#6F685B] hover:text-[#161616]'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          {/* Annual vs Monthly */}
          <div className="flex items-center bg-white px-3 py-1.5 rounded-2xl border border-[#DFD5C2] text-xs font-bold text-[#161616] gap-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-2.5 py-1 rounded-lg ${billingCycle === 'monthly' ? 'bg-[#161616] text-white' : 'text-[#6F685B]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 ${billingCycle === 'annual' ? 'bg-[#D92B8A] text-white' : 'text-[#6F685B]'}`}
            >
              <span>Annual</span>
              <span className="text-[10px] bg-white/20 px-1 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isCurrentPlan = profile.plan === plan.id;
          const displayPrice = plan.price[currency];

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'bg-white border-2 border-[#D92B8A] shadow-xl shadow-[#D92B8A]/10 -translate-y-1'
                  : 'bg-white border border-[#DFD5C2] shadow-xs'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#D92B8A] text-white text-[11px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  {!plan.popular && (
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8C8372] font-mono-code">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-2xl font-display font-extrabold text-[#161616] mt-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#6F685B] mt-1 leading-relaxed">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-[#E7DECD]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold font-mono-code text-[#161616]">
                      {CURRENCY_SYMBOLS[currency]}{typeof displayPrice === 'number' ? displayPrice.toLocaleString() : displayPrice}
                    </span>
                    <span className="text-xs font-medium text-[#8C8372]">
                      {plan.id === 'free' ? '/ forever' : billingCycle === 'annual' ? '/ mo (billed annually)' : '/ month'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#161616] font-mono-code">
                    Included Features:
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2.5 text-xs text-[#443D32]">
                        <Check className="w-4 h-4 text-[#D92B8A] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 mt-6 border-t border-[#E7DECD]">
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-2xl bg-[#EDE7D9] text-[#6F685B] font-bold text-sm text-center cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    id={`btn-select-plan-${plan.id}`}
                    onClick={() => setShowCheckoutModal(plan.id)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-sm ${
                      plan.popular
                        ? 'bg-[#D92B8A] hover:bg-[#BC1D73] text-white shadow-[#D92B8A]/20'
                        : 'bg-[#161616] hover:bg-[#333] text-white'
                    }`}
                  >
                    {plan.id === 'free' ? 'Switch to Free' : `Activate ${plan.name}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout / Payment Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-[#DFD5C2] shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E7DECD] pb-4">
              <div>
                <span className="text-xs font-bold text-[#D92B8A] uppercase font-mono-code">
                  PROUDLY AFRIKAN CHECKOUT
                </span>
                <h3 className="text-xl font-bold text-[#161616]">
                  {plans.find((p) => p.id === showCheckoutModal)?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowCheckoutModal(null)}
                className="text-[#9E9584] hover:text-[#161616] text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Payment Method Selector (Mobile Money vs Card) */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase font-mono-code text-[#161616]">
                Select Payment Channel
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile-money')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                    paymentMethod === 'mobile-money'
                      ? 'border-[#D92B8A] bg-[#D92B8A]/5 text-[#D92B8A]'
                      : 'border-[#DFD5C2] text-[#5C5546]'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mb-1 text-emerald-600" />
                  <p className="text-xs font-bold text-[#161616]">Mobile Money</p>
                  <p className="text-[10px] text-[#8C8372]">M-Pesa, MTN MoMo, Airtel</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#D92B8A] bg-[#D92B8A]/5 text-[#D92B8A]'
                      : 'border-[#DFD5C2] text-[#5C5546]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1 text-[#028090]" />
                  <p className="text-xs font-bold text-[#161616]">Bank Card / Verve</p>
                  <p className="text-[10px] text-[#8C8372]">Visa, Mastercard, Verve</p>
                </button>
              </div>
            </div>

            {paymentMethod === 'mobile-money' ? (
              <div className="space-y-2 text-xs">
                <label className="font-bold text-[#161616]">Mobile Phone Number (with Country Code)</label>
                <input
                  type="text"
                  placeholder="+234 801 234 5678 or +254 712 345 678"
                  defaultValue="+234 803 555 1234"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] font-mono-code text-xs"
                />
                <p className="text-[11px] text-[#8C8372]">
                  You will receive an instant push prompt to enter your mobile money PIN.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <input
                  type="text"
                  placeholder="Card Number"
                  defaultValue="5399 •••• •••• 4021"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] font-mono-code text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="08/29"
                    className="px-3.5 py-2 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] font-mono-code text-xs"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    defaultValue="892"
                    className="px-3.5 py-2 rounded-xl border border-[#DFD5C2] bg-[#FAF7F0] font-mono-code text-xs"
                  />
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E7DECD] text-xs text-[#554E41] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>256-bit encrypted pan-African billing settlement via PAPSS & Flutterwave.</span>
            </div>

            <button
              id="btn-confirm-payment"
              onClick={() => handleCompleteUpgrade(showCheckoutModal)}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-[#D92B8A] hover:bg-[#BC1D73] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Verifying Transaction with Mobile Carrier...' : `Pay ${CURRENCY_SYMBOLS[currency]}${plans.find(p => p.id === showCheckoutModal)?.price[currency].toLocaleString()}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
