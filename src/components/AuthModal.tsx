import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { KeyRound, Mail, Sparkles } from 'lucide-react';

export default function AuthModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setIsOperationNotAllowed(false);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google auth exception:", err);
      let customMsg = err.message;
      if (err.code === 'auth/popup-closed-by-user') {
        customMsg = 'AUTHENTICATION CANCELLED: USER CLOSED THE AUTHENTICATION DIALOG //';
      } else if (err.code === 'auth/cancelled-popup-request') {
        customMsg = 'AUTHENTICATION CANCELLED: ANOTHER INTERFACE REQUEST PREVENTED HANDSHAKE //';
      } else if (err.code === 'auth/popup-blocked') {
        customMsg = 'POPUP BLOCKED: SECURE HANDSHAKING POPUP WAS BLOCKED BY THE BROWSER //';
      } else if (err.code === 'auth/operation-not-allowed') {
        setIsOperationNotAllowed(true);
        customMsg = 'AUTHENTICATION PROVIDER IS DISABLED // TO RESUME, ENABLE "GOOGLE" SIGN-IN IN YOUR FIREBASE CONSOLE.';
      }
      setError(customMsg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('PLEASE FILL IN ALL CRITICAL AUTHENTICATION FIELDS //');
      return;
    }
    if (password.length < 6) {
      setError('SECURITY THRESHOLD ERROR: PASSWORD MUST BE AT LEAST 6 CHARACTERS //');
      return;
    }

    setLoading(true);
    setError('');
    setIsOperationNotAllowed(false);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Firebase email auth exception:", err);
      // Clean up common firebase errors into professional user-readable instructions
      let customMsg = err.message;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        customMsg = 'INVALID IDENTIFICATION CREDENTIALS. CHECK YOUR EMAIL & ACCESS PASSWORD //';
      } else if (err.code === 'auth/email-already-in-use') {
        customMsg = 'ACCOUNT ALREADY IDENTIFIED: THIS EMAIL ADDRESS IS ALREADY REGISTERED //';
      } else if (err.code === 'auth/invalid-email') {
        customMsg = 'SYNTAX ERROR: THE PROVIDED EMAIL IS IMPROPERLY FORMATTED //';
      } else if (err.code === 'auth/weak-password') {
        customMsg = 'SECURITY WARNING: THE CHOSEN PASSWORD DOES NOT MEET MINIMUM DENSITY //';
      } else if (err.code === 'auth/operation-not-allowed') {
        setIsOperationNotAllowed(true);
        customMsg = 'AUTHENTICATION PROVIDER IS DISABLED // TO RESUME, ENABLE "EMAIL/PASSWORD" SIGN-IN IN YOUR FIREBASE CONSOLE.';
      }
      setError(customMsg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-gate-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-[#070707] p-4 select-none">
      <div 
        id="auth-card" 
        className="w-full max-w-md bg-[#0A0A0A] border-2 border-zinc-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Abstract design elements to enhance the brutalist aesthetic */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#E0FF00]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand & Theme Header */}
        <div className="text-center mb-8 border-b border-zinc-900 pb-5">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-950 border border-zinc-800 mb-3">
            <Sparkles className="w-6 h-6 text-[#E0FF00]" />
          </div>
          <h2 className="font-display text-base font-black uppercase tracking-[0.2em] text-white">
            FLASHLEARN // MEMORY ENGINE
          </h2>
          <p className="text-zinc-500 font-mono text-[10px] uppercase mt-1 tracking-wider">
            {isRegistering ? 'INITIALIZE NEW OPERATOR ACCOUNT //' : 'ABAC SECURED LOGIN // V1.0'}
          </p>
        </div>

        {/* Error notification display block */}
        {error && (
          <div 
            id="auth-error-banner" 
            className="mb-6 p-4 bg-red-950/25 border-l-4 border-red-500 rounded-xl text-left bg-[#0A0A0A] space-y-3"
          >
            <p className="text-red-400 font-mono text-[10px] leading-relaxed uppercase font-bold tracking-wider">
              {error}
            </p>
            {isOperationNotAllowed && (
              <div className="pt-2 border-t border-red-905/30 mt-2 space-y-2">
                <a 
                  href={`https://console.firebase.google.com/project/${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'flashlearn-c9ce8'}/authentication/providers`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#E0FF00] text-black font-display text-[9px] font-black uppercase tracking-[0.1em] px-3 py-2.5 rounded hover:bg-white text-center w-full transition-colors cursor-pointer border-0"
                >
                  [ OPEN FIREBASE CONSOLE &gt; AUTH PROVIDERS ]
                </a>
                <p className="text-zinc-500 font-mono text-[8px] uppercase tracking-normal leading-relaxed">
                  1. Visit Auth Section &gt; Sign-In Method<br />
                  2. Turn on "Email/Password" and/or "Google" providers<br />
                  3. Tap and reload this tab to log in successfully
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-5">
          <div>
            <label className="block text-[10px] font-display uppercase tracking-widest text-zinc-500 mb-2 font-bold">
              EMAIL ACCOUNT ID //
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="auth-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR_EMAIL@DOMAIN.COM"
                className="w-full pl-11 pr-4 py-3.5 bg-zinc-950 text-white rounded-xl border border-zinc-850 focus:border-[#E0FF00] focus:outline-none font-mono text-xs uppercase placeholder-zinc-600 transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-display uppercase tracking-widest text-zinc-500 mb-2 font-bold">
              SECURITY ACCESS TOKEN //
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-zinc-500">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                id="auth-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-zinc-950 text-white rounded-xl border border-zinc-850 focus:border-[#E0FF00] focus:outline-none font-mono text-xs placeholder-zinc-650 transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 bg-[#E0FF00] text-black font-display font-black text-xs uppercase tracking-[0.15em] rounded-2xl hover:bg-white hover:text-black transition-all cursor-pointer border-0 shadow-lg active:scale-95 duration-155 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading 
              ? 'AUTHENTICATING ENCRYPTED PROFILE...' 
              : isRegistering 
                ? '[ COMMIT NEW PROFILE TO CLOUD // ]' 
                : '[ ACCESS PROFILE INTERFACE // ]'
            }
          </button>

          {/* Visual split row */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-zinc-900"></div>
            <span className="relative bg-[#0A0A0A] px-3 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
              OR ALTERNATE CREDENTIALS //
            </span>
          </div>

          {/* Electric Google Auth button with custom monospaced layout and sharp edges */}
          <button
            id="auth-google-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 bg-[#0A0A0A] text-[#E0FF00] border-2 border-zinc-800 hover:border-[#E0FF00] hover:bg-[#E0FF00]/5 font-mono font-bold text-xs uppercase tracking-[0.15em] rounded-none cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            [ SIGN IN WITH GOOGLE.EXE ]
          </button>
        </form>

        {/* Toggle option for sign up vs sign in */}
        <div className="mt-8 text-center border-t border-zinc-900 pt-5">
          <button
            id="auth-toggle-mode-btn"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            disabled={loading}
            className="text-[#E0FF00] hover:text-white font-mono text-[10px] font-bold bg-transparent border-0 cursor-pointer p-0 transition-colors tracking-widest uppercase underline"
          >
            {isRegistering 
              ? 'ALREADY REGISTERED? [[ DISCOVER EXISTING PROFILE ]]' 
              : 'NEW OPERATOR? [[ CREATE AN ACCOUNT ]]'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
