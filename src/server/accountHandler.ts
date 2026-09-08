import { Express, Request, Response } from 'express';
import { 
  PlanTier, 
  PLANS, 
  UserProfile, 
  SubscriptionInfo, 
  CreditTransaction, 
  AI_CREDIT_COSTS, 
  AiActionType 
} from '../types/authCredit';

// In-Memory resilient state model for users, credits, and subscriptions
// (Designed to easily swap with PostgreSQL / Cloud SQL / Firestore in production)
interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  createdAt: string;
  updatedAt: string;
  subscription: SubscriptionInfo;
  availableCredits: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastRefreshedAt: string;
  transactions: CreditTransaction[];
}

const mockDatabase: Map<string, StoredUser> = new Map();

// Helper to seed or initialize default guest user with 400 once-off credits
function getOrCreateUser(userId = 'default-guest-user', email = 'student@proudlyafrikan.org', name = 'Afrikan Scholar'): StoredUser {
  let user = mockDatabase.get(userId);
  if (!user) {
    const now = new Date().toISOString();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const initialTx: CreditTransaction = {
      id: `tx-init-${Date.now()}`,
      userId,
      amount: 400,
      type: 'initial_grant',
      actionType: 'FREE_WELCOME_BONUS',
      description: 'Welcome Bonus: 400 once-off AI credits',
      timestamp: now,
      balanceAfter: 400,
    };

    user = {
      id: userId,
      name,
      email,
      role: 'student',
      createdAt: now,
      updatedAt: now,
      subscription: {
        id: `sub-${Date.now()}`,
        userId,
        planId: 'FREE',
        status: 'free_tier',
        provider: 'none',
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth.toISOString(),
        monthlyCreditAllocation: 400,
        autoRenew: false,
      },
      availableCredits: 400,
      lifetimeEarned: 400,
      lifetimeSpent: 0,
      lastRefreshedAt: now,
      transactions: [initialTx],
    };
    mockDatabase.set(userId, user);
  }
  return user;
}

// Initialize demo user
getOrCreateUser('default-guest-user', 'scholar@proudlyafrikan.org', 'Proudly Afrikan Scholar');

export function registerAccountRoutes(app: Express) {
  // 1. Get Current User Profile & Credit Balance
  app.get('/api/account/me', (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || 'default-guest-user';
    const user = getOrCreateUser(userId);
    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      subscription: user.subscription,
      credits: {
        availableCredits: user.availableCredits,
        lifetimeEarned: user.lifetimeEarned,
        lifetimeSpent: user.lifetimeSpent,
        lastRefreshedAt: user.lastRefreshedAt,
        transactions: user.transactions.slice(-20), // recent 20
      },
    });
  });

  // 2. User Sign Up
  app.post('/api/account/signup', (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const user = getOrCreateUser(userId, email, name || email.split('@')[0]);
    user.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      subscription: user.subscription,
      credits: {
        availableCredits: user.availableCredits,
        lifetimeEarned: user.lifetimeEarned,
        lifetimeSpent: user.lifetimeSpent,
        lastRefreshedAt: user.lastRefreshedAt,
        transactions: user.transactions,
      },
      message: 'Account created successfully with 400 free AI credits!',
    });
  });

  // 3. User Sign In
  app.post('/api/account/login', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Lookup user or initialize session
    let matchedUser: StoredUser | undefined;
    for (const u of mockDatabase.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      const userId = `user-${Date.now()}`;
      matchedUser = getOrCreateUser(userId, email, email.split('@')[0]);
    }

    return res.json({
      success: true,
      user: {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        createdAt: matchedUser.createdAt,
      },
      subscription: matchedUser.subscription,
      credits: {
        availableCredits: matchedUser.availableCredits,
        lifetimeEarned: matchedUser.lifetimeEarned,
        lifetimeSpent: matchedUser.lifetimeSpent,
        lastRefreshedAt: matchedUser.lastRefreshedAt,
        transactions: matchedUser.transactions,
      },
    });
  });

  // 4. Google Sign In
  app.post('/api/account/google', (req: Request, res: Response) => {
    const { email, name } = req.body;
    const userEmail = email || 'google-user@proudlyafrikan.org';
    const userName = name || 'Google Scholar';
    const userId = `google-${Date.now()}`;

    const user = getOrCreateUser(userId, userEmail, userName);
    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      subscription: user.subscription,
      credits: {
        availableCredits: user.availableCredits,
        lifetimeEarned: user.lifetimeEarned,
        lifetimeSpent: user.lifetimeSpent,
        lastRefreshedAt: user.lastRefreshedAt,
        transactions: user.transactions,
      },
    });
  });

  // 5. Consume AI Credits
  app.post('/api/credits/consume', (req: Request, res: Response) => {
    const { userId = 'default-guest-user', actionType, customAmount, description } = req.body;
    const user = getOrCreateUser(userId);

    const cost = customAmount !== undefined 
      ? Number(customAmount) 
      : (AI_CREDIT_COSTS[actionType as AiActionType] || 10);

    if (user.availableCredits < cost) {
      return res.status(402).json({
        success: false,
        error: 'INSUFFICIENT_CREDITS',
        requiredCredits: cost,
        availableCredits: user.availableCredits,
        message: `You need ${cost} credits for this action, but only have ${user.availableCredits} credits remaining. Please upgrade your plan or top up.`,
      });
    }

    user.availableCredits -= cost;
    user.lifetimeSpent += cost;
    user.updatedAt = new Date().toISOString();

    const tx: CreditTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId: user.id,
      amount: -cost,
      type: 'deduction',
      actionType: actionType || 'AI_GENERATION',
      description: description || `Generated AI resource (-${cost} credits)`,
      timestamp: new Date().toISOString(),
      balanceAfter: user.availableCredits,
    };

    user.transactions.push(tx);

    return res.json({
      success: true,
      cost,
      availableCredits: user.availableCredits,
      transaction: tx,
    });
  });

  // 6. Select / Upgrade Plan (PayPal Preparation)
  app.post('/api/subscriptions/select-plan', (req: Request, res: Response) => {
    const { userId = 'default-guest-user', planId } = req.body as { userId?: string; planId: PlanTier };
    const targetPlan = PLANS[planId];
    if (!targetPlan) {
      return res.status(400).json({ success: false, error: 'Invalid plan selected' });
    }

    const user = getOrCreateUser(userId);
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Update subscription
    user.subscription = {
      id: `sub-${planId.toLowerCase()}-${Date.now()}`,
      userId: user.id,
      planId,
      status: planId === 'FREE' ? 'free_tier' : 'active',
      provider: planId === 'FREE' ? 'none' : 'paypal',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: nextMonth.toISOString(),
      monthlyCreditAllocation: targetPlan.monthlyCredits,
      autoRenew: planId !== 'FREE',
    };

    // Credit allocation
    const allocationAmount = targetPlan.monthlyCredits;
    user.availableCredits += allocationAmount;
    user.lifetimeEarned += allocationAmount;
    user.lastRefreshedAt = now.toISOString();
    user.updatedAt = now.toISOString();

    const tx: CreditTransaction = {
      id: `tx-alloc-${Date.now()}`,
      userId: user.id,
      amount: allocationAmount,
      type: 'allocation',
      actionType: 'PLAN_SUBSCRIPTION_ALLOCATION',
      description: `Plan Activated: ${targetPlan.name} (+${allocationAmount.toLocaleString()} AI Credits)`,
      timestamp: now.toISOString(),
      balanceAfter: user.availableCredits,
    };
    user.transactions.push(tx);

    return res.json({
      success: true,
      plan: targetPlan,
      subscription: user.subscription,
      availableCredits: user.availableCredits,
      transaction: tx,
      supportEmail: 'support@proudlyafrikan.org',
      message: `Successfully switched to ${targetPlan.name} plan! ${allocationAmount.toLocaleString()} credits allocated.`,
    });
  });

  // 7. Cancel Subscription
  app.post('/api/subscriptions/cancel', (req: Request, res: Response) => {
    const { userId = 'default-guest-user' } = req.body;
    const user = getOrCreateUser(userId);

    user.subscription.status = 'cancelled';
    user.subscription.autoRenew = false;
    user.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      subscription: user.subscription,
      message: 'Subscription renewal has been cancelled. You retain your existing credits until current period end.',
      supportEmail: 'support@proudlyafrikan.org',
    });
  });

  // 8. PayPal Webhook Listener (Ready for production Aluta Creatives PayPal Business integration)
  app.post('/api/subscriptions/paypal-webhook', (req: Request, res: Response) => {
    const event = req.body;
    const eventType = event?.event_type || 'TEST_WEBHOOK_RECEIVED';

    console.log(`[PayPal Webhook] Received event: ${eventType}`, event?.id);

    // Structure ready to process recurring billing events:
    // - BILLING.SUBSCRIPTION.ACTIVATED
    // - PAYMENT.SALE.COMPLETED
    // - BILLING.SUBSCRIPTION.CANCELLED
    // - PAYMENT.SALE.DENIED
    // - PAYMENT.SALE.REFUNDED

    return res.json({
      received: true,
      eventType,
      handledAt: new Date().toISOString(),
      recipientAccount: 'Aluta Creatives PayPal Business',
      supportEmail: 'support@proudlyafrikan.org',
    });
  });
}
