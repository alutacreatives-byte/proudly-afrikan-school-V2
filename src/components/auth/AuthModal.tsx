import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthCredit } from '../../context/AuthCreditContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, signIn, signUp, signInWithGoogle, isLoading } = useAuthCredit();
  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize initial mode
  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMsg('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (mode === 'signup') {
      if (!password) {
        setErrorMsg('Please enter a password.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
      const res = await signUp(name || email.split('@')[0], email, password);
      if (!res.success) setErrorMsg(res.message || 'Failed to create account.');
    } else {
      const res = await signIn(email, password);
      if (!res.success) setErrorMsg(res.message || 'Failed to sign in.');
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    await signInWithGoogle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#FAF7F0] border-2 border-[#161616] rounded-3xl shadow-[6px_6px_0px_#161616] p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#161616] mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#161616] text-[#D92B8A] flex items-center justify-center font-display font-black text-xs border border-[#161616] shadow-[2px_2px_0px_#D92B8A]">
              PAS
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-[#161616] uppercase tracking-tight">
                {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
              </h3>
              <p className="font-mono text-[11px] text-stone-500 font-semibold">
                Proudly Afrikan School Suite
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl border-2 border-[#161616] bg-white hover:bg-stone-100 text-[#161616] shadow-[2px_2px_0px_#161616] cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Credits Badge for Sign Up */}
        {mode === 'signup' && (
          <div className="mb-5 p-3 rounded-2xl bg-[#FDF2F8] border-2 border-[#D92B8A] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#D92B8A] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-black text-xs text-[#D92B8A] uppercase tracking-wider">
                400 Free Credits Included
              </p>
              <p className="text-[11px] font-sans text-stone-700 font-medium">
                New registered accounts receive the Free Plan with 400 creation credits.
              </p>
            </div>
          </div>
        )}

        {/* Google Quick Sign-In */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full mb-4 py-3 px-4 rounded-2xl border-2 border-[#161616] bg-white hover:bg-stone-50 font-display font-black text-xs uppercase tracking-wider text-[#161616] flex items-center justify-center gap-3 shadow-[2.5px_2.5px_0px_#161616] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer transition-all disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-stone-300"></div>
          <span className="flex-shrink mx-3 text-stone-400 font-mono text-[10px] uppercase tracking-widest font-bold">
            Or with email
          </span>
          <div className="flex-grow border-t border-stone-300"></div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sipho Ndlovu"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-[#161616] rounded-xl text-xs font-sans text-[#161616] placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#D92B8A]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold text-stone-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scholar@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-[#161616] rounded-xl text-xs font-sans text-[#161616] placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#D92B8A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-stone-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-[#161616] rounded-xl text-xs font-sans text-[#161616] placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#D92B8A]"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono font-bold text-stone-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-[#161616] rounded-xl text-xs font-sans text-[#161616] placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#D92B8A]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#161616] hover:bg-stone-800 text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#161616] shadow-[3px_3px_0px_#D92B8A] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer transition-all disabled:opacity-50"
          >
            <span>{mode === 'signup' ? 'Create Free Account (400 Credits)' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#D92B8A]" />
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="mt-5 pt-4 border-t border-stone-200 text-center">
          {mode === 'signup' ? (
            <p className="text-xs font-sans text-stone-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-display font-black text-[#D92B8A] uppercase hover:underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-xs font-sans text-stone-600">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-display font-black text-[#D92B8A] uppercase hover:underline cursor-pointer ml-1"
              >
                Sign Up (400 Free Credits)
              </button>
            </p>
          )}
        </div>

        {/* Support Note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-mono text-stone-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
          <span>Support: <a href="mailto:support@proudlyafrikan.org" className="underline hover:text-stone-600">support@proudlyafrikan.org</a></span>
        </div>
      </div>
    </div>
  );
};
