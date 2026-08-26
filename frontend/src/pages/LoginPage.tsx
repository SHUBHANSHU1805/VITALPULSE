import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('doctor@vitalpulse.med');
  const [password, setPassword] = useState('Doctor123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch (err: any) { setError(err.response?.data?.error || 'Authentication failed.'); }
    finally { setLoading(false); }
  };

  const inp = "w-full pl-10 pr-4 py-2.5 bg-[#0B1329] border border-[#1A2744] rounded-xl text-sm text-vs-text placeholder-vs-dim focus:outline-none focus:border-vs-cyan/50 transition-colors";

  return (
    <div className="min-h-screen bg-[#070D1B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vs-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-vs-purple/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-vs-cyan to-vs-purple items-center justify-center mb-4 shadow-cyan">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
              <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gradient-brand">VitalPulse</h1>
          <p className="text-vs-dim text-sm mt-1">Clinician Remote Health Dashboard</p>
        </div>

        <div className="vs-card p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-vs-rose/10 border border-vs-rose/30 text-vs-rose text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-vs-dim uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-vs-dim absolute left-3 top-3" />
                <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required className={inp} placeholder="doctor@vitalpulse.med" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-vs-dim uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-vs-dim absolute left-3 top-3" />
                <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required className={inp} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-vs-cyan to-vs-purple text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-cyan transition-all disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="p-3.5 rounded-xl bg-[#0F1835] border border-[#1A2744] text-[11px] text-vs-dim space-y-1.5">
            <p className="font-semibold text-vs-text text-[10px] uppercase tracking-wider">Demo Credentials</p>
            <div className="flex justify-between font-mono"><span>doctor@vitalpulse.med</span><span className="text-vs-cyan">Doctor123!</span></div>
            <div className="flex justify-between font-mono"><span>admin@vitalpulse.med</span><span className="text-vs-cyan">Admin123!</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
