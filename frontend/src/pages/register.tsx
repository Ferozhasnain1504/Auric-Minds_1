import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, MapPin, UserPlus } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import API from '../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await API.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-background"></div>

      <div className="auth-container">
        <motion.div className="auth-logo"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}>
          <UserPlus size={48} className="text-white" />
        </motion.div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join MindGuard AI today</p>

        <GlassCard className="auth-card" glow>
          <h2 className="auth-heading">Register</h2>

          {error && (
            <p className="error-text">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name */}
            <div className="input-wrapper">
              <User className="input-icon" />
              <input className="auth-input" placeholder="Full Name" type="text" required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            {/* Email */}
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input className="auth-input" placeholder="Email" type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            {/* Phone */}
            <div className="input-wrapper">
              <Phone className="input-icon" />
              <input className="auth-input" placeholder="Phone Number" required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>

            {/* Location */}
            <div className="input-wrapper">
              <MapPin className="input-icon" />
              <input className="auth-input" placeholder="Location" required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>

            {/* Password */}
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input className="auth-input" placeholder="Password"
                type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>

            <motion.button type="submit" className="btn-primary" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
              {loading ? "Creating..." : "Create Account"}
            </motion.button>
          </form>

          <p className="switch-text">
            Already registered?{" "}
            <button className="switch-link"
              onClick={() => navigate('/')}>
              Login →
            </button>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
