import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('doctor@vitalpulse.med');
  const [password, setPassword] = useState('Doctor123!');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic background lighting elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-clinical-teal/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-clinical-cyan/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-clinical-teal/20 to-clinical-cyan/20 border border-clinical-teal/40 text-clinical-teal shadow-glow-teal mb-2">
            <HeartPulse className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">VITALPULSE</h1>
          <p className="text-xs text-slate-400">Clinician Remote Health & Predictive Analytics Dashboard</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Clinician Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-clinical-teal transition-colors"
                placeholder="doctor@vitalpulse.med"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-clinical-teal transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-clinical-teal to-clinical-cyan text-slate-950 font-extrabold text-sm flex items-center justify-center space-x-2 hover:opacity-90 shadow-glow-teal transition-all"
          >
            <span>{isSubmitting ? 'Authenticating Clinician...' : 'Enter Clinician Command Center'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <p className="font-bold text-slate-300 uppercase tracking-wider">Demo Access Credentials:</p>
          <div className="flex justify-between font-mono">
            <span>Doctor: doctor@vitalpulse.med</span>
            <span className="text-clinical-teal">Doctor123!</span>
          </div>
          <div className="flex justify-between font-mono">
            <span>Admin: admin@vitalpulse.med</span>
            <span className="text-clinical-teal">Admin123!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
