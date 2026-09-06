import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  SubscriptionInfo, 
  CreditTransaction, 
  PlanTier, 
  PLANS, 
  AI_CREDIT_COSTS, 
  AiActionType,
  AI_ACTION_LABELS
} from '../types/authCredit';

interface AuthCreditContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  subscription: SubscriptionInfo;
  availableCredits: number;
  transactions: CreditTransaction[];
  currentPlan: PlanTier;
  isLoading: boolean;
  
  // Auth methods
  signIn: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (name: string, email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  signOut: () => void;
  updateName: (name: string) => void;

  // Credit methods
  canAfford: (action: AiActionType) => boolean;
  getCost: (action: AiActionType) => number;
  consumeCredits: (action: AiActionType, description?: string) => Promise<{ success: boolean; error?: string; remaining?: number }>;
  grantBonusCredits: (amount: number, reason: string) => void;
  replenishTestingCredits: () => void;
  
  // Subscription / Plan methods
  selectPlan: (planId: PlanTier) => Promise<{ success: boolean; message?: string }>;
  cancelSubscription: () => Promise<{ success: boolean; message?: string }>;
  refreshMonthlyCredits: () => void;

  // UI Modals
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  isAccountModalOpen: boolean;
  openAccountModal: () => void;
  closeAccountModal: () => void;
}

const AuthCreditContext = createContext<AuthCreditContextType | null>(null);

const STORAGE_KEYS = {
  USER: 'pas_user_profile_v1',
  SUBSCRIPTION: 'pas_subscription_v1',
  CREDITS: 'pas_credit_balance_v1',
  TRANSACTIONS: 'pas_transactions_v1',
};

export const AuthCreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null; // Visitors start signed out (no fictional default user)
  });

  const [subscription, setSubscription] = useState<SubscriptionInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return {
      id: 'sub-free-initial',
      userId: 'visitor',
      planId: 'FREE',
      status: 'free_tier',
      provider: 'none',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: nextMonth.toISOString(),
      monthlyCreditAllocation: 50000,
      autoRenew: false,
    };
  });

  const [availableCredits, setAvailableCredits] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CREDITS);
      if (saved !== null) {
        const val = Number(saved);
        if (val < 10000) return 50000;
        return val;
      }
    } catch (e) {}
    return 50000; // 50,000 abundant credits for testing all features
  });

  const [transactions, setTransactions] = useState<CreditTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'tx-welcome',
        userId: 'visitor',
        amount: 50000,
        type: 'initial_grant',
        actionType: 'FREE_WELCOME_BONUS',
        description: 'Testing Credits Grant: 50,000 free credits',
        timestamp: new Date().toISOString(),
        balanceAfter: 50000,
      },
    ];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
    } catch (e) {}
  }, [subscription]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CREDITS, availableCredits.toString());
    } catch (e) {}
  }, [availableCredits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {}
  }, [transactions]);

  // Auth Handlers
  const signIn = async (email: string, _password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.subscription) setSubscription(data.subscription);
        if (data.credits) {
          setAvailableCredits(data.credits.availableCredits ?? 400);
          if (data.credits.transactions) setTransactions(data.credits.transactions);
        }
      } else {
        // Fallback local sign in
        const now = new Date().toISOString();
        setUser({
          id: `user-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: 'student',
          createdAt: now,
          updatedAt: now,
        });
      }
      setIsAuthModalOpen(false);
      return { success: true, message: 'Signed in successfully!' };
    } catch (err) {
      const now = new Date().toISOString();
      setUser({
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: 'student',
        createdAt: now,
        updatedAt: now,
      });
      setIsAuthModalOpen(false);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, _password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/account/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.subscription) setSubscription(data.subscription);
        if (data.credits) {
          setAvailableCredits(data.credits.availableCredits ?? 400);
          if (data.credits.transactions) setTransactions(data.credits.transactions);
        }
      } else {
        const now = new Date().toISOString();
        setUser({
          id: `user-${Date.now()}`,
          name: name || email.split('@')[0],
          email,
          role: 'student',
          createdAt: now,
          updatedAt: now,
        });
        setAvailableCredits(400);
      }
      setIsAuthModalOpen(false);
      return { success: true, message: 'Account created with 400 once-off credits!' };
    } catch (err) {
      const now = new Date().toISOString();
      setUser({
        id: `user-${Date.now()}`,
        name: name || email.split('@')[0],
        email,
        role: 'student',
        createdAt: now,
        updatedAt: now,
      });
      setAvailableCredits(400);
      setIsAuthModalOpen(false);
      return { success: true, message: 'Account created with 400 free credits!' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/account/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'scholar@gmail.com',
          name: 'Google Scholar',
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.subscription) setSubscription(data.subscription);
        if (data.credits) {
          setAvailableCredits(data.credits.availableCredits ?? 400);
          if (data.credits.transactions) setTransactions(data.credits.transactions);
        }
      } else {
        const now = new Date().toISOString();
        setUser({
          id: `google-${Date.now()}`,
          name: 'Google Scholar',
          email: 'scholar@gmail.com',
          role: 'student',
          createdAt: now,
          updatedAt: now,
        });
      }
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err) {
      const now = new Date().toISOString();
      setUser({
        id: `google-${Date.now()}`,
        name: 'Google Scholar',
        email: 'scholar@gmail.com',
        role: 'student',
        createdAt: now,
        updatedAt: now,
      });
      setIsAuthModalOpen(false);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setSubscription({
      id: 'sub-guest',
      userId: 'guest',
      planId: 'FREE',
      status: 'free_tier',
      provider: 'none',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date().toISOString(),
      monthlyCreditAllocation: 400,
      autoRenew: false,
    });
    setAvailableCredits(400);
    setIsAccountModalOpen(false);
  };

  const updateName = (newName: string) => {
    if (!user) return;
    setUser({ ...user, name: newName, updatedAt: new Date().toISOString() });
  };

  // Credit methods
  const getCost = useCallback((action: AiActionType): number => {
    return AI_CREDIT_COSTS[action] || 10;
  }, []);

  const canAfford = useCallback((action: AiActionType): boolean => {
    const cost = getCost(action);
    if (availableCredits < cost) {
      // Auto-replenish testing credits so user testing is never blocked
      setAvailableCredits((prev) => prev + 50000);
      return true;
    }
    return true;
  }, [availableCredits, getCost]);

  const consumeCredits = async (action: AiActionType, customDesc?: string): Promise<{ success: boolean; error?: string; remaining?: number }> => {
    const cost = getCost(action);
    let currentBalance = availableCredits;
    if (currentBalance < cost) {
      currentBalance += 50000;
      setAvailableCredits(currentBalance);
    }

    const newBalance = Math.max(0, currentBalance - cost);
    setAvailableCredits(newBalance);

    const label = AI_ACTION_LABELS[action] || action;
    const tx: CreditTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user?.id || 'guest',
      amount: -cost,
      type: 'deduction',
      actionType: action,
      description: customDesc || `Generated ${label} (-${cost} credits)`,
      timestamp: new Date().toISOString(),
      balanceAfter: newBalance,
    };

    setTransactions((prev) => [tx, ...prev].slice(0, 50));

    // Async server notify
    try {
      fetch('/api/credits/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          actionType: action,
          customAmount: cost,
          description: tx.description,
        }),
      }).catch(() => {});
    } catch (e) {}

    return { success: true, remaining: newBalance };
  };

  const grantBonusCredits = (amount: number, reason: string) => {
    const newBalance = availableCredits + amount;
    setAvailableCredits(newBalance);

    const tx: CreditTransaction = {
      id: `tx-grant-${Date.now()}`,
      userId: user?.id || 'guest',
      amount,
      type: 'bonus',
      actionType: 'BONUS_CREDIT_GRANT',
      description: reason || `Bonus grant (+${amount} credits)`,
      timestamp: new Date().toISOString(),
      balanceAfter: newBalance,
    };

    setTransactions((prev) => [tx, ...prev].slice(0, 50));
  };

  const replenishTestingCredits = () => {
    grantBonusCredits(50000, 'Testing Credits Replenish: +50,000 credits');
  };

  // Plan Selection / Upgrade
  const selectPlan = async (planId: PlanTier): Promise<{ success: boolean; message?: string }> => {
    const plan = PLANS[planId];
    if (!plan) return { success: false, error: 'Invalid plan' } as any;

    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const newSub: SubscriptionInfo = {
      id: `sub-${planId.toLowerCase()}-${Date.now()}`,
      userId: user?.id || 'guest',
      planId,
      status: planId === 'FREE' ? 'free_tier' : 'active',
      provider: planId === 'FREE' ? 'none' : 'paypal',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: nextMonth.toISOString(),
      monthlyCreditAllocation: plan.monthlyCredits,
      autoRenew: planId !== 'FREE',
    };

    setSubscription(newSub);

    // Allocate plan credits
    const addedCredits = plan.monthlyCredits;
    const newBalance = availableCredits + addedCredits;
    setAvailableCredits(newBalance);

    const tx: CreditTransaction = {
      id: `tx-plan-${Date.now()}`,
      userId: user?.id || 'guest',
      amount: addedCredits,
      type: 'allocation',
      actionType: 'PLAN_UPGRADE_ALLOCATION',
      description: `Activated ${plan.name} Plan (+${addedCredits.toLocaleString()} Credits)`,
      timestamp: now.toISOString(),
      balanceAfter: newBalance,
    };

    setTransactions((prev) => [tx, ...prev].slice(0, 50));

    // Call server to persist
    try {
      fetch('/api/subscriptions/select-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, planId }),
      }).catch(() => {});
    } catch (e) {}

    return {
      success: true,
      message: `You are now on the ${plan.name} plan! ${addedCredits.toLocaleString()} credits added to your account.`,
    };
  };

  const cancelSubscription = async (): Promise<{ success: boolean; message?: string }> => {
    setSubscription((prev) => ({
      ...prev,
      status: 'cancelled',
      autoRenew: false,
    }));

    try {
      fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      }).catch(() => {});
    } catch (e) {}

    return {
      success: true,
      message: 'Subscription renewal has been cancelled. Your current credits remain available.',
    };
  };

  const refreshMonthlyCredits = () => {
    const plan = PLANS[subscription.planId];
    const refreshAmount = plan.monthlyCredits;
    const newBalance = availableCredits + refreshAmount;
    setAvailableCredits(newBalance);

    const tx: CreditTransaction = {
      id: `tx-refresh-${Date.now()}`,
      userId: user?.id || 'guest',
      amount: refreshAmount,
      type: 'allocation',
      actionType: 'MONTHLY_BILLING_CYCLE_REFRESH',
      description: `Monthly Cycle Credit Refresh: ${plan.name} Plan (+${refreshAmount.toLocaleString()} credits)`,
      timestamp: new Date().toISOString(),
      balanceAfter: newBalance,
    };

    setTransactions((prev) => [tx, ...prev].slice(0, 50));
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openAccountModal = () => setIsAccountModalOpen(true);
  const closeAccountModal = () => setIsAccountModalOpen(false);

  return (
    <AuthCreditContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        subscription,
        availableCredits,
        transactions,
        currentPlan: subscription.planId,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateName,
        canAfford,
        getCost,
        consumeCredits,
        grantBonusCredits,
        replenishTestingCredits,
        selectPlan,
        cancelSubscription,
        refreshMonthlyCredits,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isAccountModalOpen,
        openAccountModal,
        closeAccountModal,
      }}
    >
      {children}
    </AuthCreditContext.Provider>
  );
};

export const useAuthCredit = () => {
  const context = useContext(AuthCreditContext);
  if (!context) {
    throw new Error('useAuthCredit must be used within an AuthCreditProvider');
  }
  return context;
};
