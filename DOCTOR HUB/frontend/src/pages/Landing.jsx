import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Clock, Users, Sparkles } from 'lucide-react';
import { Logo } from '../components/shared/Logo';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(107,155,138,0.25), transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-[500px] w-[500px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(201,169,98,0.2), transparent 70%)' }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-14">
        <Logo size="md" />
        <div className="flex gap-3">
          <Link to="/login" className="btn-ghost text-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Begin Journey
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-8 pt-12 text-center lg:pt-20">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <span className="badge-gold mb-6 inline-flex items-center gap-2">
            <Sparkles size={12} /> Est. 2026 — Modern Care, Timeless Trust
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-display text-[clamp(2.5rem,6vw,4.25rem)] font-bold leading-[1.08]"
        >
          Where <span className="italic text-[var(--color-brass)]">healing</span>
          <br />
          meets heritage
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-accent mx-auto mt-6 max-w-xl text-xl italic text-muted"
        >
          A distinguished platform for consultations, records, and care — crafted with the elegance
          of classic medicine and the precision of today.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          <Link to="/register" className="btn-primary px-10 py-3.5 text-base">
            Enter as Patient
          </Link>
          <Link to="/register" className="btn-ghost px-10 py-3.5 text-base">
            Join as Physician
          </Link>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="ornament-line mx-auto mt-16 max-w-md"
        >
          <span>Excellence in Care</span>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-3">
        {[
          {
            icon: Shield,
            title: 'Vaulted Security',
            desc: 'Encrypted records & role-guarded access for every member of your care circle.',
          },
          {
            icon: Clock,
            title: 'Swift Appointments',
            desc: 'Reserve your consultation in moments — with payment verification built in.',
          },
          {
            icon: Users,
            title: 'United Practice',
            desc: 'Patients, physicians, assistants & administrators — harmoniously connected.',
          },
        ].map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            custom={5 + i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -6 }}
            className="glass group p-8 text-center transition-shadow hover:shadow-[0_20px_50px_rgba(201,169,98,0.12)]"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-sm border border-[var(--color-brass)]/30 bg-[var(--color-brass)]/10 transition group-hover:border-[var(--color-brass)]/60">
              <Icon className="text-[var(--color-brass)]" size={28} strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{desc}</p>
          </motion.div>
        ))}
      </section>

      <footer className="relative z-10 border-t border-[var(--color-brass)]/10 py-8 text-center">
        <p className="font-accent text-sm italic text-muted">
          Doctor Hub — Heritage Healthcare Platform
        </p>
      </footer>
    </div>
  );
}
