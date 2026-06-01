import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARD } from '../../utils/constants';
import { Logo } from '../../components/shared/Logo';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);
      const redirect = location.state?.from?.pathname || ROLE_DASHBOARD[user.role];
      navigate(redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-[var(--color-sage)]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[var(--color-brass)]/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md glass p-10"
      >
        <div className="mb-10 text-center">
          <div className="mb-6 flex justify-center">
            <Logo size="lg" subtitle="Member Portal" />
          </div>
          <p className="font-accent text-lg italic text-muted">Sign in to continue your care</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="section-label mb-2 block">Email Address</label>
            <input className="input-field" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-[var(--color-alert)]">{errors.email.message}</p>}
          </div>
          <div>
            <label className="section-label mb-2 block">Password</label>
            <input className="input-field" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-[var(--color-alert)]">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? 'Signing in...' : 'Enter Portal'}
          </button>
        </form>

        <div className="ornament-line mt-8">
          <span>or</span>
        </div>

        <p className="text-center text-sm text-muted">
          New to Doctor Hub?{' '}
          <Link to="/register" className="font-medium text-[var(--color-brass)] hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
