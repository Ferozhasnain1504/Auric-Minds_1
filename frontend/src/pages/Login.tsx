

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import API from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Floating UI Background */}
      <div className="glass-background"></div>

      <div className="auth-container">
        <motion.div className="auth-logo" animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}>
          <Activity size={48} className="text-white" />
        </motion.div>

        <h1 className="auth-title">Health Rakshak</h1>
        <p className="auth-subtitle">Understand Your Mind. Protect Your Health.</p>

        <GlassCard className="auth-card" glow>
          <h2 className="auth-heading">Login</h2>
          
          {error && (
            <p className="error-text">{error}</p>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            {/* Email */}
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input className="auth-input" placeholder="Email"
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {/* Password */}
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input className="auth-input" placeholder="Password"
                type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <motion.button type="submit" className="btn-primary" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
              {loading ? "Logging In..." : "Login"}
              <ArrowRight size={20} />
            </motion.button>
          </form>

          <p className="switch-text">
            New here?{" "}
            <button className="switch-link"
              onClick={() => navigate('/register')}>
              Create Account →
            </button>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
