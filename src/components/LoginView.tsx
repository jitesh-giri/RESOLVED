import React, { useState } from 'react';
import { authService } from '../lib/authService';
import { Shield, Sparkles, Building2, Eye, EyeOff, Check, Heart, HelpCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import BackgroundEffects from './BackgroundEffects';
import ThemeToggle from './ThemeToggle';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [locality, setLocality] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick Guest Sign In for instant testing
  const handleGuestSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.signInAnonymously();
      onLoginSuccess();
    } catch (err: any) {
      setError("Guest mode failed. Please sign up or login below.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.signInWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
        setError(null); // Just clear the error, user canceled
      } else {
        setError(err.message || "Google sign in failed. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (isSignUp && (!name || !locality)) {
      setError("Please fill out your name and locality.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await authService.signUp(name, email, password, locality);
      } else {
        await authService.signIn(email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "An error occurred. Please try again.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = "Invalid email or password.";
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = "This email is already registered.";
      } else if (err.code === 'auth/weak-password') {
        errMsg = "Password should be at least 6 characters.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

const STARS_DATA = [
  { top: '5%', left: '12%', size: 2, delay: '0.5s', duration: '3s' },
  { top: '15%', left: '85%', size: 3, delay: '1.2s', duration: '4s' },
  { top: '22%', left: '45%', size: 1.5, delay: '0.2s', duration: '2.5s' },
  { top: '35%', left: '72%', size: 2.5, delay: '2s', duration: '3.5s' },
  { top: '48%', left: '18%', size: 2, delay: '1.5s', duration: '3s' },
  { top: '55%', left: '92%', size: 3, delay: '0.8s', duration: '4.5s' },
  { top: '65%', left: '38%', size: 1.5, delay: '2.4s', duration: '2s' },
  { top: '78%', left: '81%', size: 2, delay: '1s', duration: '3s' },
  { top: '85%', left: '15%', size: 2.5, delay: '1.8s', duration: '3.8s' },
  { top: '92%', left: '60%', size: 3, delay: '0.3s', duration: '4s' },
  { top: '8%', left: '68%', size: 1.5, delay: '2.1s', duration: '2.8s' },
  { top: '28%', left: '25%', size: 2, delay: '0.7s', duration: '3.2s' },
  { top: '42%', left: '88%', size: 2.5, delay: '1.9s', duration: '3.6s' },
  { top: '50%', left: '55%', size: 1.5, delay: '2.5s', duration: '2.2s' },
  { top: '70%', left: '75%', size: 2, delay: '1.1s', duration: '3.4s' },
  { top: '82%', left: '48%', size: 3, delay: '0.6s', duration: '4.2s' },
];

  return (
    <div id="login_container" className="min-h-screen bg-sky-50 dark:bg-[#03001e] transition-colors duration-700 flex flex-col md:flex-row font-sans relative overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <BackgroundEffects />
      </div>

      {/* Left side: Premium civic art / geometric graphic with deep cosmic style */}
      <div className="w-full md:w-1/2 bg-white/40 dark:bg-[#08031d]/60 backdrop-blur-md flex flex-col justify-between p-8 md:p-16 text-slate-900 dark:text-white relative overflow-hidden border-r border-slate-200 dark:border-white/5">
        
        {/* Subtle background glow/decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 dark:bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        {/* Branding Header */}
        <div className="flex items-center space-x-3 z-10">
          <div className="bg-gradient-to-tr from-amber-500 to-orange-500 dark:from-violet-600 dark:to-indigo-600 p-2.5 rounded-xl flex items-center justify-center text-white shadow-lg dark:shadow-indigo-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 dark:from-white dark:via-indigo-100 dark:to-violet-300">Resolved</span>
        </div>

        {/* Dynamic content */}
        <div className="my-auto py-12 z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <span className="bg-amber-100 dark:bg-indigo-500/20 text-amber-700 dark:text-indigo-300 border border-amber-200 dark:border-indigo-500/30 text-sm tracking-wider font-semibold px-4 py-1.5 rounded-full inline-block font-sans">
              अंतः अस्ति प्रारंभः
            </span>
            <h1 className="font-display font-black text-4xl md:text-5xl mt-6 tracking-tight leading-tight">
              Report. Upvote.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-600 dark:from-violet-400 dark:to-indigo-300">Escalate & get Resolved</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mt-6 leading-relaxed">
              Resolved: Track local upgrades, report civic damage, and let AI escalate verified community issues directly to the top.
            </p>
          </motion.div>

          {/* Animated Tilted Cosmic Image */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mask-fade-edges opacity-10 dark:opacity-35 mix-blend-multiply dark:mix-blend-screen">
            <div className="absolute w-[800px] h-[800px] -left-20 top-20 animate-float-diagonal origin-center">
              <img 
                src="https://cdn.imgtree.co/images/G-k4QNOt.jpg" 
                alt="Lord Shiva Poster"
                className="w-full h-full object-contain object-center"
              />
            </div>
          </div>

          {/* Social Proof / Benefit grid */}
          <div className="grid grid-cols-2 gap-6 mt-12 pt-8 border-t border-white/5 relative z-10">
            <div className="flex space-x-3">
              <div className="flex-shrink-0 bg-indigo-500/15 text-indigo-300 p-1.5 rounded-lg h-9 w-9 flex items-center justify-center border border-indigo-500/10">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">AI Complaint Drafts</h4>
                <p className="text-xs text-slate-400 mt-1">Generates custom letters & tweets</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="flex-shrink-0 bg-violet-500/15 text-violet-300 p-1.5 rounded-lg h-9 w-9 flex items-center justify-center border border-violet-500/10">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Community Upvoting</h4>
                <p className="text-xs text-slate-400 mt-1">Harness collective public power</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 flex justify-between z-10 border-t border-white/5 pt-4">
          <span>© 2026 Resolved Civic Initiative</span>
          <span>Verified Local Security</span>
        </div>
      </div>

      {/* Right side: Cosmic Starry Space Background with Blended Lord Shiva */}
      <div className="w-full md:w-1/2 bg-white/20 dark:bg-gradient-to-b dark:from-[#08031d] dark:via-[#040114] dark:to-[#0a0521] backdrop-blur-md flex items-center justify-center p-6 sm:p-12 md:p-16 text-slate-900 dark:text-white relative overflow-hidden">
        
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Twinkling Stars Starfield Background */}
        <div className="absolute inset-0 z-0 pointer-events-none hidden dark:block">
          {STARS_DATA.map((star, idx) => (
            <div
              key={idx}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: 0.35 + Math.random() * 0.45,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}
        </div>

        {/* Cosmic floating nebulae glows */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none z-0 mix-blend-screen" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none z-0 mix-blend-screen" />

        {/* Lord Shiva Image - Full width right panel background, beautifully blended to the left */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden mix-blend-multiply opacity-20 dark:opacity-100 dark:mix-blend-normal">
          <div 
            className="absolute inset-0 z-10 dark:block hidden" 
            style={{ 
              background: 'linear-gradient(to left, rgba(8, 3, 29, 0.15) 0%, rgba(8, 3, 29, 0.6) 40%, rgba(4, 1, 20, 0.95) 85%, #040114 100%)' 
            }}
          />
          {/* Cosmic floating nebulae color glows */}
          <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-color-dodge hidden dark:block" />
          <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-color-dodge hidden dark:block" />
          
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Shiva_Adiyogi_Coimbatore_India.jpg" 
            alt="Cosmic Shiva" 
            className="w-full h-full object-cover object-right opacity-60 filter saturate-100 contrast-[1.15] brightness-90 scale-100 transition-transform duration-[10s] ease-out hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Authentication Form Card in glassmorphism */}
        <div className="w-full max-w-md bg-white/70 dark:bg-[#0c0724]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 sm:p-10 rounded-3xl shadow-xl dark:shadow-2xl space-y-8 z-10 relative">
          
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isSignUp ? "Create an account" : "Namaste, पार्थ"}
            </h2>
            <p className="text-slate-600 dark:text-indigo-200/70 text-sm">
              {isSignUp 
                ? "Join your neighbors to start reporting local issues." 
                : "Log in to check on active neighborhood concerns."
              }
            </p>
          </div>

          {/* Quick Sandbox Play Banner */}
          <div className="bg-sky-100/50 dark:bg-indigo-950/40 border border-sky-200/50 dark:border-indigo-500/30 rounded-2xl p-4 flex items-start space-x-3">
            <div className="bg-gradient-to-tr from-amber-400 to-orange-500 dark:from-violet-500 dark:to-indigo-500 text-white p-1.5 rounded-xl flex-shrink-0 mt-0.5 shadow-md shadow-orange-500/10 dark:shadow-indigo-500/10">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-indigo-100">Tester Sandbox</h4>
              <p className="text-xs text-indigo-200/75 mt-1">
                Skip registration! Jump straight to the app using our instant guest credential generator.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  id="guest_mode_btn"
                  onClick={handleGuestSignIn}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-[size:200%_auto] hover:bg-right hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-500 flex items-center justify-center space-x-2 hover:scale-[1.03] active:scale-95 border border-white/5 cursor-pointer"
                >
                  {loading ? 'Entering...' : '⚡ Launch Instant Guest'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-rose-950/45 border border-rose-500/30 text-rose-200 px-4 py-3 rounded-xl text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block" htmlFor="fullName">
                    Your Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-sm text-white placeholder-slate-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block" htmlFor="locality">
                    Area / Locality
                  </label>
                  <input
                    id="locality"
                    type="text"
                    placeholder="e.g. Indiranagar, Bangalore"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-sm text-white placeholder-slate-500"
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block" htmlFor="emailAddress">
                Email Address
              </label>
              <input
                id="emailAddress"
                type="email"
                placeholder="citizen@communityhero.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-sm text-white placeholder-slate-500"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block" htmlFor="secretPassword">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="secretPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-sm text-white pr-10 placeholder-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-indigo-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="submit_auth_btn"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-[size:200%_auto] hover:bg-right hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:border-violet-400/50 border border-transparent text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-500 flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-[1.03] active:scale-95 cursor-pointer"
            >
              <span>
                {loading ? 'Processing...' : (isSignUp ? 'Create Civic Account' : 'Login Securely')}
              </span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-indigo-300/50 text-xs uppercase tracking-wider font-semibold">Or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-slate-900/50 hover:bg-slate-800/80 text-white text-sm font-semibold px-4 py-3.5 rounded-xl shadow-lg shadow-black/10 transition-all duration-300 flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95 border border-white/10 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Login with Google</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-indigo-400 hover:text-fuchsia-300 text-sm font-semibold transition-all duration-300 hover:scale-105 inline-block cursor-pointer hover:underline"
            >
              {isSignUp 
                ? "Already have an account? Login" 
                : "New to Resolved? Register here"
              }
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
