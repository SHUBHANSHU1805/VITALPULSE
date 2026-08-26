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
      {/* Ambient background blobs */}
      <div className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-indigo-600/08 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-900/05 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="p-8 rounded-3xl glass-panel border border-[rgba(59,130,246,0.15)] shadow-2xl space-y-6">

          {/* Logo & header */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600/25 to-indigo-500/20 border border-blue-500/30 text-blue-400 shadow-glow-blue mb-1">
              <HeartPulse className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider text-gradient-blue">VITALPULSE</h1>
              <p className="text-xs text-slate-400 mt-1">Clinician Remote Health & Predictive Analytics</p>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Clinician Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(15,23,42,0.80)] border border-[rgba(59,130,246,0.15)] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:shadow-glow-blue transition-all"
                  placeholder="doctor@vitalpulse.med"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(15,23,42,0.80)] border border-[rgba(59,130,246,0.15)] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:shadow-glow-blue transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center space-x-2 hover:from-blue-500 hover:to-indigo-500 shadow-glow-blue transition-all disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Enter Clinician Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo credentials */}
          <div className="p-3.5 rounded-xl bg-[rgba(15,23,42,0.60)] border border-[rgba(59,130,246,0.10)] text-[11px] text-slate-400 space-y-1.5">
            <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Demo Credentials</p>
            <div className="flex justify-between font-mono">
              <span>doctor@vitalpulse.med</span>
              <span className="text-blue-400">Doctor123!</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>admin@vitalpulse.med</span>
              <span className="text-blue-400">Admin123!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
