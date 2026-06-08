import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Clock, Users } from 'lucide-react';
import { Logo } from '../shared/Logo';

const features = [
  { icon: Shield, text: 'Enterprise-grade security' },
  { icon: Clock, text: 'Book in under 2 minutes' },
  { icon: Users, text: '50K+ patients served' },
];

export function AuthLayout({ children }) {
  return (
    <div className="public-site min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] flex-col justify-between p-12 relative overflow-hidden auth-gradient-panel">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/10 via-transparent to-[#0d9488]/10" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#2563eb]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#0d9488]/10 blur-3xl" />

        <Link to="/" className="relative inline-flex items-center gap-2.5 font-bold text-xl text-[#0f172a]">
          <Logo size="md" subtitle="" />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative space-y-6"
        >
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-[#0f172a]">
            Healthcare made{' '}
            <span className="gradient-text">simple & secure</span>
          </h1>
          <p className="text-lg text-muted-fg leading-relaxed max-w-md">
            Book appointments with verified doctors across Pakistan. Manage records,
            prescriptions, and payments in one place.
          </p>
          <ul className="space-y-4 pt-4">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-muted-fg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb]/10 text-[#2563eb]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <p className="relative text-sm text-muted-fg">
          Trusted by patients in Karachi, Lahore, Islamabad & beyond
        </p>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="lg:hidden p-6">
          <Link to="/" className="inline-flex items-center gap-2.5 font-bold text-xl text-[#0f172a]">
            <Logo size="md" subtitle="" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
