export type PlanTier = 'FREE' | 'LEARNER' | 'STUDENT' | 'SCHOLAR';

export interface PlanDetails {
  id: PlanTier;
  name: string;
  priceZar: number;
  monthlyCredits: number;
  isOnceOff?: boolean;
  isPopular?: boolean;
  tagline: string;
  description: string;
  features: string[];
  color: string;
  accentBg: string;
  borderColor: string;
  buttonLabel: string;
}

export const PLANS: Record<PlanTier, PlanDetails> = {
  FREE: {
    id: 'FREE',
    name: 'FREE',
    priceZar: 0,
    monthlyCredits: 400,
    isOnceOff: true,
    tagline: 'Once-off starter credit grant',
    description: 'Perfect for exploring African-centered learning sets and testing AI generation tools.',
    features: [
      '400 once-off AI credits on sign up',
      'Unlimited access to Study, Quiz & Planner',
      'Full access to My Sets library',
      'Standard AI generation speed',
      'No recurring payment',
    ],
    color: '#161616',
    accentBg: '#FAF7F0',
    borderColor: '#161616',
    buttonLabel: 'Get Started Free',
  },
  LEARNER: {
    id: 'LEARNER',
    name: 'LEARNER',
    priceZar: 49,
    monthlyCredits: 1500,
    tagline: 'Essential revision & weekly tasks',
    description: 'For active learners needing weekly study sets, practice quizzes, and homework hints.',
    features: [
      '1,500 AI credits per month',
      'Monthly recurring subscription',
      'All AI generation tools enabled',
      'PDF & document analysis',
      'Export worksheets and exams to PDF',
      'Standard customer support',
    ],
    color: '#E05A2B',
    accentBg: '#FFF7F2',
    borderColor: '#161616',
    buttonLabel: 'Select Learner Plan',
  },
  STUDENT: {
    id: 'STUDENT',
    name: 'STUDENT',
    priceZar: 99,
    monthlyCredits: 4000,
    isPopular: true,
    tagline: 'Comprehensive study & exam prep',
    description: 'Our most popular plan for intensive study, revision packs, quizzes, and course preparation.',
    features: [
      '4,000 AI credits per month',
      'Monthly recurring subscription',
      'MOST POPULAR for South African curricula',
      'Priority AI generation queue',
      'Deep study packs & multi-section exams',
      'Rollover support & priority assistance',
    ],
    color: '#D92B8A',
    accentBg: '#FDF2F8',
    borderColor: '#D92B8A',
    buttonLabel: 'Select Student Plan',
  },
  SCHOLAR: {
    id: 'SCHOLAR',
    name: 'SCHOLAR',
    priceZar: 249,
    monthlyCredits: 12000,
    tagline: 'High-volume mastery & educator output',
    description: 'For power users, tutors, educators, and institutions building full curricula and deep learning paths.',
    features: [
      '12,000 AI credits per month',
      'Monthly recurring subscription',
      'Full curriculum & learning path builder',
      'Full term lesson plans & scheme of work',
      'Multi-section exam paper & rubric generator',
      'Direct support: support@proudlyafrikan.org',
    ],
    color: '#E6425E',
    accentBg: '#FFF1F2',
    borderColor: '#161616',
    buttonLabel: 'Select Scholar Plan',
  },
};

export const AI_CREDIT_COSTS = {
  QUIZ_FLASHCARDS: 10,
  STUDY_GUIDE: 15,
  WORKSHEET: 25,
  MIND_MAP: 25,
  EXAM: 30,
  LESSON_PLAN: 30,
  PDF_STUDY_PACK: 40,
  PRESENTATION: 50,
  COURSE: 75,
  LEARNING_PATH: 75,
} as const;

export type AiActionType = keyof typeof AI_CREDIT_COSTS;

export const AI_ACTION_LABELS: Record<AiActionType, string> = {
  QUIZ_FLASHCARDS: 'Quiz / Flashcards Generation',
  STUDY_GUIDE: 'Study Guide Generation',
  WORKSHEET: 'Worksheet Generation',
  MIND_MAP: 'Mind Map Visual Hierarchy',
  EXAM: 'Exam & Rubric Paper',
  LESSON_PLAN: 'Lesson Plan Generation',
  PDF_STUDY_PACK: 'PDF Study Pack Analysis',
  PRESENTATION: 'Presentation Slide Deck',
  COURSE: 'Course Curriculum Blueprint',
  LEARNING_PATH: 'Career / Learning Path',
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'free_tier';

export interface SubscriptionInfo {
  id: string;
  userId: string;
  planId: PlanTier;
  status: SubscriptionStatus;
  provider: 'paypal' | 'none';
  paypalSubscriptionId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  monthlyCreditAllocation: number;
  autoRenew: boolean;
}

export type CreditTransactionType = 'deduction' | 'allocation' | 'bonus' | 'refund' | 'initial_grant';

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // positive for addition, negative for deduction
  type: CreditTransactionType;
  actionType?: AiActionType | string;
  description: string;
  timestamp: string;
  balanceAfter: number;
}

export interface CreditState {
  availableCredits: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastRefreshedAt: string;
  transactions: CreditTransaction[];
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  subscription: SubscriptionInfo;
  credits: CreditState;
}

export interface PayPalOrderRequest {
  planId: PlanTier;
  userId: string;
  customerEmail: string;
}
