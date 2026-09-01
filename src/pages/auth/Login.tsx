import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { IbacmiLogo } from '../../components/ibacmi/IbacmiLogo';
import {
  FileText,
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  Sparkles,
  School,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn, switchDemoAccount } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.message || 'Invalid login credentials. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'STUDENT' | 'STAFF' | 'ADMIN') => {
    setError(null);
    setLoading(true);
    try {
      await switchDemoAccount(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo account');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setError(null);
    setLoading(true);

    try {
      await authService.resetPassword(forgotEmail);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-block hover:opacity-95 transition-opacity">
          <IbacmiLogo size="lg" textColor="dark" className="justify-center" />
        </Link>
        <p className="text-xs text-slate-500 font-medium">
          Official Student, Registrar & Faculty Web Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* 1-Click Instant Demo Login Bar */}
        <div className="mb-4 bg-gradient-to-r from-amber-50/80 via-white to-red-50/80 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B1E23]">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Instant 1-Click Persona Login</span>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-200">
              Demo Access
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              id="demo-student-btn"
              onClick={() => handleQuickLogin('STUDENT')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-blue-700 hover:text-white border border-slate-200 hover:border-blue-700 rounded-xl text-center transition-[background-color,border-color,color,transform] group shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95"
            >
              <GraduationCap className="w-4 h-4 text-blue-700 group-hover:text-amber-300 mb-1 transition-colors" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-white">Student</span>
              <span className="text-[10px] text-slate-400 group-hover:text-blue-100">Juan D.</span>
            </button>

            <button
              type="button"
              id="demo-staff-btn"
              onClick={() => handleQuickLogin('STAFF')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-blue-700 hover:text-white border border-slate-200 hover:border-blue-700 rounded-xl text-center transition-[background-color,border-color,color,transform] group shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95"
            >
              <Briefcase className="w-4 h-4 text-amber-700 group-hover:text-amber-300 mb-1 transition-colors" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-white">Registrar</span>
              <span className="text-[10px] text-slate-400 group-hover:text-blue-100">Sarah J.</span>
            </button>

            <button
              type="button"
              id="demo-admin-btn"
              onClick={() => handleQuickLogin('ADMIN')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-blue-700 hover:text-white border border-slate-200 hover:border-blue-700 rounded-xl text-center transition-[background-color,border-color,color,transform] group shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95"
            >
              <ShieldAlert className="w-4 h-4 text-slate-700 group-hover:text-amber-300 mb-1 transition-colors" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-white">Admin</span>
              <span className="text-[10px] text-slate-400 group-hover:text-blue-100">Dr. Vance</span>
            </button>
          </div>
        </div>

        <div className="bg-white py-7 px-6 shadow-xl border border-slate-200 sm:rounded-2xl sm:px-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-800">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
              {error.includes('Invalid login credentials') && (
                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-rose-700">Need to register first?</span>
                  <Link
                    to="/register"
                    className="font-bold text-[#8B1E23] hover:text-[#5F1217] underline inline-flex items-center gap-1"
                  >
                    Register Account <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {resetSent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 font-serif">Reset Email Dispatched</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                A password reset link has been dispatched to <strong>{forgotEmail}</strong>. Please check your inbox.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setResetSent(false);
                }}
                className="text-xs font-bold text-[#8B1E23] hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : showForgot ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-sm font-bold text-slate-900 font-serif">Reset Your Password</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your registered institutional email to receive a recovery link.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@ibacmi.edu.ph"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#8B1E23] focus:border-[#8B1E23]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="text-xs text-slate-500 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-[#8B1E23] text-white rounded-xl text-xs font-bold hover:bg-[#5F1217] transition-all shadow-xs cursor-pointer"
                >
                  {loading ? 'Sending...' : 'Send Recovery Link'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@ibacmi.edu.ph"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#8B1E23] focus:border-[#8B1E23] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setForgotEmail(email);
                    }}
                    className="text-xs text-[#8B1E23] font-semibold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="sign-in-submit-btn"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-2xs text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-[background-color,box-shadow,transform] disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4 mr-2 text-amber-300" />
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>
          )}

          {/* Quick Register link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New student requesting official records?{' '}
              <Link to="/register" className="font-bold text-blue-700 hover:underline">
                Create Student Account
              </Link>
            </p>
          </div>
        </div>

        {/* Public Tracker CTA */}
        <div className="mt-5 text-center">
          <Link
            to="/track"
            className="text-xs font-semibold text-slate-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
          >
            Have a Request Number? Track without logging in <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
          </Link>
        </div>
      </div>
    </div>
  );
};
