import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shield,
  Star,
  Search,
  MapPin,
  ArrowRight,
  FlaskConical,
  Heart,
  Leaf,
  Calendar,
  Upload,
  CheckCircle,
  Quote,
  ChevronDown,
  TrendingUp,
} from 'lucide-react';
import { PublicHeader } from '../components/public/PublicHeader';
import { PublicFooter } from '../components/public/PublicFooter';
import { PublicDoctorCard } from '../components/public/PublicDoctorCard';
import { useFetch } from '../hooks/useFetch';
import api from '../utils/api';
import {
  PAKISTAN_CITIES,
  POPULAR_DISEASES,
  DOCTOR_CATEGORIES,
  TREATMENT_SPECIALTIES,
} from '../utils/constants';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const categoryIcons = {
  allopathic: FlaskConical,
  homeopathic: Heart,
  herbal: Leaf,
};

const stats = [
  { value: 50000, suffix: '+', label: 'Patients' },
  { value: 500, suffix: '+', label: 'Doctors' },
  { value: 100, suffix: '+', label: 'Clinics' },
  { value: 99, suffix: '%', label: 'Satisfaction' },
];

const steps = [
  { icon: Search, title: 'Search Doctor', description: 'Find doctors by disease, specialty, or city across Pakistan.' },
  { icon: Calendar, title: 'Book Appointment', description: 'Choose a convenient time slot and book instantly.' },
  { icon: Upload, title: 'Upload Payment', description: 'Submit your payment screenshot for quick verification.' },
  { icon: CheckCircle, title: 'Get Confirmed', description: 'Once verified, receive confirmation and visit your doctor.' },
];

const testimonials = [
  { name: 'Ahmed Hassan', city: 'Karachi', text: 'Booked a cardiologist in DHA within minutes. Payment verification was quick and my records are all in one place.', rating: 5 },
  { name: 'Fatima Malik', city: 'Lahore', text: 'Found an excellent dermatologist in Gulberg. The whole process felt professional and trustworthy.', rating: 5 },
  { name: 'Zainab Ahmed', city: 'Karachi', text: 'Verifying payments through the dashboard saves our clinic team hours every week. Enterprise-grade platform.', rating: 5 },
];

const faqs = [
  { q: 'How do I book an appointment?', a: 'Search for a doctor by disease or specialty, select an available time slot, and confirm your booking. Upload your payment screenshot to complete the process.' },
  { q: 'How long does payment verification take?', a: 'Our assistants typically verify payments within 2-4 hours during business hours. You will receive a notification once verified.' },
  { q: 'Can I access my medical history?', a: 'Yes! All your medical records, prescriptions, and reports are securely stored in your patient dashboard.' },
  { q: 'What types of doctors are available?', a: 'Doctor Hub features Allopathic, Homeopathic, and Herbal medicine practitioners across various specialties in Pakistan.' },
  { q: 'Is my health data secure?', a: 'Absolutely. We use enterprise-grade encryption and role-based access control to ensure your medical data is protected.' },
];

function Section({ children, variant = 'white', id, className = '' }) {
  const variants = {
    white: 'section-white',
    blue: 'section-blue',
    gradient: 'section-gradient',
    glass: 'section-glass',
    accent: 'section-accent-band',
  };
  return (
    <section id={id} className={`relative overflow-hidden py-20 md:py-24 ${variants[variant]} ${className}`}>
      <div className="page-shell relative z-10">{children}</div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-12 md:mb-16 text-center mx-auto max-w-3xl">
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-widest text-[#2563eb] mb-3">{eyebrow}</p>}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">{title}</h2>
      {description && <p className="mt-4 text-lg md:text-xl text-muted-fg leading-relaxed">{description}</p>}
    </motion.div>
  );
}

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="relative hidden lg:block"
    >
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#2563eb]/20 via-[#0d9488]/10 to-transparent blur-2xl" />
      <div className="relative glass-public glow-primary rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-bold">Doctor Hub</p>
            <p className="text-xs text-muted-fg">Patient Dashboard</p>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-full gradient-cta">Live</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[{ label: 'Appointments', value: '12' }, { label: 'Verified', value: '98%' }].map((s) => (
            <div key={s.label} className="rounded-xl bg-slate-50 p-3 border border-[#e2e8f0]">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-fg">{s.label}</p>
            </div>
          ))}
        </div>
        {['Dr. Hassan Raza — Cardiology', 'Dr. Ayesha Malik — Dermatology'].map((line, i) => (
          <div key={line} className="flex items-center justify-between rounded-xl border border-[#e2e8f0] px-3 py-2.5 mb-2">
            <div>
              <p className="text-xs font-semibold">{line.split(' — ')[0]}</p>
              <p className="text-[10px] text-muted-fg">{line.split(' — ')[1]}</p>
            </div>
            <TrendingUp className="h-3.5 w-3.5 text-[#0d9488]" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero min-h-[85vh] flex items-center">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-20 right-[10%] h-72 w-72 rounded-full bg-[#2563eb]/10 blur-3xl animate-float" />
      <div className="page-shell w-full py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 text-sm font-medium rounded-full border border-[#2563eb]/20 bg-[#2563eb]/10 text-[#2563eb]">
              <Sparkles className="h-3.5 w-3.5" /> Pakistan&apos;s #1 Healthcare Platform
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Find Trusted Doctors{' '}
              <span className="gradient-text">Across Pakistan</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 text-lg md:text-xl text-muted-fg max-w-xl leading-relaxed">
              Book appointments, manage medical records, and consult healthcare experts seamlessly.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex flex-wrap gap-4">
              <Link to="/doctors" className="btn-primary-public px-8 py-3.5">
                Find Doctors <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn-secondary-public px-8 py-3.5">
                Book Appointment
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-fg">
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-[#2563eb]" /> HIPAA-grade security</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9 average rating</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="glass-public rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold gradient-text">{s.value.toLocaleString()}{s.suffix}</p>
                  <p className="text-xs text-muted-fg mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function SearchSection() {
  const navigate = useNavigate();
  const [disease, setDisease] = useState('');
  const [city, setCity] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (disease) params.set('disease', disease);
    if (city) params.set('city', city);
    navigate(`/doctors?${params.toString()}`);
  };

  return (
    <Section id="search" variant="blue">
      <SectionHeader eyebrow="Smart Search" title="Find the Right Doctor in Seconds" description="Search by condition, specialty, or city across Karachi, Lahore, Islamabad and more." />
      <div className="max-w-4xl mx-auto glass-public glow-primary rounded-2xl p-8 md:p-10">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="disease-search" className="label-public flex items-center gap-2">Disease or condition</label>
            <div className="relative mt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-fg" />
              <input id="disease-search" placeholder="e.g. Diabetes, Hypertension" className="input-public pl-11 h-14" value={disease} onChange={(e) => setDisease(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="city-search" className="label-public flex items-center gap-2"><MapPin className="h-4 w-4" /> City in Pakistan</label>
            <select id="city-search" className="input-public mt-2 h-14" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Select city</option>
              {PAKISTAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button type="button" onClick={handleSearch} className="btn-primary-public h-14 px-8">
          <Search className="h-4 w-4" /> Search Doctors
        </button>
        <div className="mt-8 pt-6 border-t border-[#e2e8f0] flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-fg mr-2">Popular:</span>
          {POPULAR_DISEASES.map((d) => (
            <Link key={d} to={`/doctors?disease=${encodeURIComponent(d)}`} className="rounded-full border border-[#2563eb]/15 bg-[#2563eb]/5 px-4 py-1.5 text-sm font-medium text-[#2563eb] hover:bg-[#2563eb] hover:text-white transition-all">
              {d}
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}

function CategoriesSection() {
  return (
    <Section id="categories" variant="white">
      <SectionHeader eyebrow="Specializations" title="Doctor Categories" description="Choose from multiple medical approaches — all verified and trusted across Pakistan." />
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {DOCTOR_CATEGORIES.map((cat) => {
          const Icon = categoryIcons[cat.value];
          return (
            <Link key={cat.value} to={`/doctors?type=${cat.value}`} className="block group">
              <div className="premium-card p-8 h-full">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">{cat.label}</h3>
                <p className="text-muted-fg leading-relaxed mb-6">{cat.description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb] group-hover:gap-3 transition-all">
                  Explore doctors <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

function FeaturedDoctorsSection() {
  const { data, loading } = useFetch(async () => {
    const { data: res } = await api.get('/doctors?page=1&limit=4');
    return res;
  }, []);

  const doctors = data?.doctors?.slice(0, 4) || [];

  return (
    <Section variant="gradient">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#2563eb] mb-3">Top Rated</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured Doctors</h2>
          <p className="mt-4 text-lg text-muted-fg">Verified healthcare professionals across Pakistan</p>
        </div>
        <Link to="/doctors" className="btn-secondary-public shrink-0 self-start">View All Doctors</Link>
      </div>
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="premium-card h-80 animate-pulse bg-slate-100" />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="glass-public p-10 text-center text-muted-fg">No verified doctors yet. Run seed in backend.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doc, i) => <PublicDoctorCard key={doc._id} doctor={doc} index={i} />)}
        </div>
      )}
    </Section>
  );
}

function HowItWorksSection() {
  return (
    <Section id="how-it-works" variant="accent">
      <SectionHeader eyebrow="Simple Process" title="How It Works" description="Book your consultation in four simple steps" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <div key={step.title} className="relative text-center">
            <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-2xl gradient-cta text-white mb-5 shadow-lg">
              <step.icon className="h-8 w-8" />
              <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#0d9488] text-xs font-bold text-white">{i + 1}</span>
            </div>
            <h3 className="font-bold text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-muted-fg leading-relaxed max-w-xs mx-auto">{step.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TestimonialsSection() {
  return (
    <Section variant="blue">
      <SectionHeader eyebrow="Testimonials" title="Trusted by Patients Nationwide" description="Real feedback from patients across Pakistan" />
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="premium-card p-8">
            <Quote className="h-10 w-10 text-[#2563eb]/30 mb-4" />
            <p className="text-muted-fg leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-3 pt-4 border-t border-[#e2e8f0]">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2563eb]/20 to-[#0d9488]/20 flex items-center justify-center font-bold text-sm">
                {t.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-bold">{t.name}</p>
                <p className="text-sm text-muted-fg">Patient · {t.city}</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState(null);

  return (
    <Section id="faq" variant="white">
      <SectionHeader eyebrow="FAQ" title="Frequently Asked Questions" description="Everything you need to know about Doctor Hub Pakistan" />
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((item, i) => (
          <div key={item.q} className="glass-public rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between p-5 md:p-6 text-left font-semibold hover:bg-[#2563eb]/5 transition-colors"
            >
              {item.q}
              <ChevronDown className={`h-5 w-5 text-[#2563eb] shrink-0 ml-4 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <p className="px-5 md:px-6 pb-5 md:pb-6 text-muted-fg leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TreatmentTypesSection() {
  return (
    <Section variant="glass">
      <SectionHeader eyebrow="Treatments" title="Treatment Types" description="Find specialists for every healthcare need" />
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {TREATMENT_SPECIALTIES.map((t) => (
          <span key={t} className="inline-flex items-center rounded-full border border-[#2563eb]/15 bg-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:gradient-cta hover:text-white hover:border-transparent hover:scale-105 transition-all cursor-default">
            {t}
          </span>
        ))}
      </div>
    </Section>
  );
}

export default function Landing() {
  return (
    <div className="public-site">
      <PublicHeader />
      <HeroSection />
      <SearchSection />
      <CategoriesSection />
      <TreatmentTypesSection />
      <FeaturedDoctorsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FaqSection />
      <PublicFooter />
    </div>
  );
}
