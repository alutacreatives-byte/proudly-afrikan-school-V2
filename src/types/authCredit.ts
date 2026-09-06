export type PlanTier = 'FREE' | 'LEARNER' | 'STUDENT' | 'SCHOLAR';

export interface PlanDetails {
  id: PlanTier;
  name: string;
  tagline: string;
  priceZar: number;
  monthlyCredits: number;
  features: string[];
  recommended?: boolean;
}

export const PLANS: Record<PlanTier, PlanDetails> = {
  FREE: {
    id: 'FREE',
    name: 'FREE',
    tagline: 'Get started with testing credits and basic learning tools.',
    priceZar: 0,
    monthlyCredits: 400,
    features: [
      '400 once-off AI credits on sign up',
      'Unlimited access to Study Suite',
      'Full access to My Sets library',
      'Standard AI generation speed',
      'No recurring payment',
    ],
  },
  LEARNER: {
    id: 'LEARNER',
    name: 'LEARNER',
    tagline: 'Ideal for ongoing revision and homework practice.',
    priceZar: 79,
    monthlyCredits: 1500,
    features: [
      '1,500 AI credits per month',
      'Monthly recurring subscription',
      'All AI generation tools enabled',
      'Export worksheets and exams to PDF',
      'Standard customer support',
    ],
  },
  STUDENT: {
    id: 'STUDENT',
    name: 'STUDENT',
    tagline: 'Most popular for comprehensive study & exam prep.',
    priceZar: 149,
    monthlyCredits: 4000,
    recommended: true,
    features: [
      '4,000 AI credits per month',
      'Monthly recurring subscription',
      'MOST POPULAR for South African students',
      'Deep study packs & multi-section exams',
      'Rollover support & priority assistance',
    ],
  },
  SCHOLAR: {
    id: 'SCHOLAR',
    name: 'SCHOLAR',
    tagline: 'Advanced curriculum builder and educator power tools.',
    priceZar: 349,
    monthlyCredits: 12000,
    features: [
      '12,000 AI credits per month',
      'Monthly recurring subscription',
      'Full curriculum & learning path builder',
      'Multi-section exam paper & rubric generator',
      'Direct support: support@proudlyafrikan.org',
    ],
  },
};

export type AiActionType =
  | 'FREE_WELCOME_BONUS'
  | 'QUIZ_FLASHCARDS'
  | 'STUDY_GUIDE'
  | 'WORKSHEET'
  | 'EXAM'
  | 'LESSON_PLAN'
  | 'PDF_STUDY_PACK'
  | 'PRESENTATION'
  | 'COURSE'
  | 'LEARNING_PATH'
  | 'MIND_MAP'
  | 'AI_TUTOR_CHAT';

export const AI_CREDIT_COSTS: Record<string, number> = {
  QUIZ_FLASHCARDS: 10,
  STUDY_GUIDE: 15,
  WORKSHEET: 20,
  EXAM: 30,
  LESSON_PLAN: 25,
  PDF_STUDY_PACK: 35,
  PRESENTATION: 25,
  COURSE: 40,
  LEARNING_PATH: 30,
  MIND_MAP: 20,
  AI_TUTOR_CHAT: 5,
};

export const AI_ACTION_LABELS: Record<string, string> = {
  FREE_WELCOME_BONUS: 'Welcome Bonus Credits',
  QUIZ_FLASHCARDS: 'Practice Quiz & Flashcards',
  STUDY_GUIDE: 'Detailed Study Guide',
  WORKSHEET: 'Classroom Worksheet',
  EXAM: 'Exam Paper & Marking Scheme',
  LESSON_PLAN: 'Structured Lesson Plan',
  PDF_STUDY_PACK: 'PDF Study Pack Generator',
  PRESENTATION: 'Presentation Slide Deck',
  COURSE: 'Course Curriculum Blueprint',
  LEARNING_PATH: 'Personalized Learning Roadmap',
  MIND_MAP: 'Mind Map Visualizer',
  AI_TUTOR_CHAT: 'Socratic AI Tutor Discussion',
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  institution?: string;
  country?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionInfo {
  id: string;
  userId: string;
  planId: PlanTier;
  status: 'active' | 'free_tier' | 'cancelled' | 'expired';
  provider: 'paystack' | 'stripe' | 'paypal' | 'none';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  monthlyCreditAllocation: number;
  autoRenew: boolean;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'initial_grant' | 'monthly_allocation' | 'bonus' | 'usage' | 'refund' | 'deduction' | 'allocation';
  actionType: string;
  description: string;
  timestamp: string;
  balanceAfter: number;
}
