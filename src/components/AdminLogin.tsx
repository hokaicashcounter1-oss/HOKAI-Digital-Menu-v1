import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
  onClose: () => void;
}

export default function AdminLogin({ onLoginSuccess, onClose }: AdminLoginProps) {
  const [adminId, setAdminId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId || !password) {
      setError('Please fill in all security credentials.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication challenge failed.');
      }

      onLoginSuccess(data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Luxury Gold Accented Accent bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-[#D4AF37]/5 to-transparent pointer-events-none" />

        {/* Title & Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full border border-[#D4AF37]/40 bg-black/80 flex items-center justify-center text-[#D4AF37] mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-white text-2xl font-bold font-display uppercase tracking-widest">HOKAI Admin Gate</h2>
          <p className="text-white/50 text-xs mt-1 uppercase tracking-widest">Access secure management system</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Admin ID */}
          <div>
            <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Admin Security ID</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="e.g. Ak732888"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-all font-mono backdrop-blur-md"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-all font-mono backdrop-blur-md"
                required
              />
            </div>
          </div>

          {/* Error Feedbacks */}
          {error && (
            <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white/75 hover:text-white rounded-2xl text-xs uppercase tracking-widest font-semibold transition-all backdrop-blur-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#D4AF37] text-black hover:bg-amber-400 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1 shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Log In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Floating Note */}
        <div className="mt-8 pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/30 tracking-wider">
            Protected under standard Hokai Digital menu licensing protocol.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
