import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#1e0a3a] to-[#0a0e1a] relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3A7AFE] rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#B517FF] rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-[#FF3D57] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo and Tagline */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#3A7AFE] to-[#B517FF] mb-6 neon-glow"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Activity className="w-10 h-10" />
          </motion.div>
          
          <h1 className="text-4xl mb-3 bg-gradient-to-r from-[#3A7AFE] via-[#B517FF] to-[#00E676] bg-clip-text text-transparent">
            MindGuard AI
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <Sparkles className="w-4 h-4 text-[#FFB300]" />
            <p className="text-lg">Understand Your Mind. Protect Your Health.</p>
            <Sparkles className="w-4 h-4 text-[#FFB300]" />
          </div>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard className="p-8" glow>
            <h2 className="text-2xl mb-6 text-center">Welcome Back</h2>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#3A7AFE] focus:ring-2 focus:ring-[#3A7AFE]/30 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#3A7AFE] focus:ring-2 focus:ring-[#3A7AFE]/30 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  Remember me
                </label>
                <a href="#" className="text-[#3A7AFE] hover:text-[#B517FF] transition-colors">
                  Forgot password?
                </a>
              </div>

              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-[#3A7AFE] to-[#B517FF] text-white py-3 rounded-2xl flex items-center justify-center gap-2 group overflow-hidden relative"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">Login to Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#B517FF] to-[#3A7AFE]"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <button className="text-[#3A7AFE] hover:text-[#B517FF] transition-colors">
                  Register now
                </button>
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mt-8 grid grid-cols-3 gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div>
            <div className="text-2xl mb-1">🧠</div>
            <p className="text-xs text-gray-400">AI Powered</p>
          </div>
          <div>
            <div className="text-2xl mb-1">📊</div>
            <p className="text-xs text-gray-400">Real-time Data</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🔒</div>
            <p className="text-xs text-gray-400">Secure & Private</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
