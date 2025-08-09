'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../../Context/AuthContext';

export default function SignIn() {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo credentials
  const demoUser = {
    _id: '1',
    name: 'Test User',
    email: 'Deekibraa@gmail.com',
    role: 'superadmin' as const,
    subcity: 'DemoCity',
     avatar: '/images/default-avatar.png', // ✅ added to match User interface
  };
  const demoPassword = '123456';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    setLoading(true);
    setTimeout(() => {
      if (formData.email === demoUser.email && formData.password === demoPassword) {
        login(demoUser, 'fake-jwt-token-demo');
        router.push('/dashboard');
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    }, 1000);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80')",
      }}
    >
      {/* Overlay blur + dark */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={20} />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-3 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={20} />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-3 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>

          {/* Error message */}
          {error && <p className="text-red-400 text-center">{error}</p>}

          {/* Sign in button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white shadow-lg transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            <LogIn size={20} />
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <p className="text-center text-white/70 mt-4 text-sm">
          Use demo: <strong>{demoUser.email}</strong> / <strong>{demoPassword}</strong>
        </p>

        {/* Sign Up Link */}
        <motion.button
          type="button"
          onClick={() => router.push('/auth/signup')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition"
          aria-label="Go to Sign Up page"
        >
          <UserPlus size={20} />
          Don&apos;t have an account? Sign Up
        </motion.button>
      </motion.div>
    </div>
  );
}
