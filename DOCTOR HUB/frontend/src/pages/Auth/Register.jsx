import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARD } from '../../utils/constants';
import { Logo } from '../../components/shared/Logo';

const schema = z
  .object({
    name: z.string().min(2, 'Name required'),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
    role: z.enum(['patient', 'doctor']),
    phone: z.string().optional(),
    specialization: z.string().optional(),
    treatmentType: z.enum(['allopathic', 'homeopathic', 'herbal']).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function Register() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'patient' },
  });

  const role = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await signup(data);
      toast.success('Account created!');
      navigate(ROLE_DASHBOARD[user.role]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg glass p-10"
      >
        <div className="mb-8 text-center">
          <Logo size="md" subtitle="Join the Circle" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {['patient', 'doctor'].map((r) => (
              <label key={r} className="cursor-pointer">
                <input type="radio" value={r} {...register('role')} className="sr-only" />
                <span
                  className={`block rounded-sm border py-2.5 text-center text-sm capitalize transition font-medium ${
                    role === r
                      ? 'border-[var(--color-brass)] bg-[var(--color-brass)]/15 text-[var(--color-brass-light)]'
                      : 'border-[var(--color-brass)]/20 text-muted hover:border-[var(--color-brass)]/40'
                  }`}
                  style={{ borderRadius: '2px 12px 2px 12px' }}
                >
                  {r}
                </span>
              </label>
            ))}
          </div>

          <input className="input-field" placeholder="Full name" {...register('name')} />
          {errors.name && <p className="text-xs text-[var(--color-alert)]">{errors.name.message}</p>}

          <input className="input-field" placeholder="Email" type="email" {...register('email')} />
          <input className="input-field" placeholder="Phone" {...register('phone')} />
          <input className="input-field" placeholder="Password" type="password" {...register('password')} />
          <input className="input-field" placeholder="Confirm password" type="password" {...register('confirmPassword')} />

          {role === 'doctor' && (
            <>
              <input className="input-field" placeholder="Specialization" {...register('specialization')} />
              <select className="input-field" {...register('treatmentType')}>
                <option value="">Treatment type</option>
                <option value="allopathic">Allopathic</option>
                <option value="homeopathic">Homeopathic</option>
                <option value="herbal">Herbal</option>
              </select>
            </>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already registered?{' '}
          <Link to="/login" className="text-[var(--color-brass)] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
