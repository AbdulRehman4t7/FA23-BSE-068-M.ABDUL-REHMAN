import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import { getProfile } from "./services/profileService";
import { getProjects } from "./services/projectsService";
import { getBlogPosts } from "./services/blogService";

const DEFAULT_INFO = {
  name: "Muhammad Abdul Rehman",
  tagline: "Planning · Development · Deployment · Flutter · Android · Full-Stack",
  bio: "Crafting excellence through precise Planning, agile Development, and seamless Deployment. I specialize in building high-performance web and mobile applications using React, Node.js, and Flutter.",
  about_bio: "Software Engineering student at COMSATS University Islamabad with hands-on experience in mobile app development (Flutter & Android) and full-stack web development. I specialize in building production-ready mobile and web applications, delivering end-to-end solutions from intuitive user interfaces to scalable backend systems. Committed to clean, maintainable code and driven by a focus on real-world impact, I continuously refine my skills through professional and freelance projects.",
  university: "COMSATS University Islamabad",
  location: "Pakistan",
  email: "a03480748044@gmail.com",
  linkedin: "https://www.linkedin.com/in/muhammad-abdul-rehman4t7",
  github: "https://github.com/AbdulRehman4t7",
  profile_pic: "/profile.jpg",
  available: true,
  years_exp: 1,
  projects_count: 6,
};

const DEFAULT_PROJECTS = [
  {
    id: "default-1",
    type: "web",
    title: "AdFlow Pro (Marketplace)",
    description: "A premium full-stack marketplace for sponsored listings, featuring a complete moderation workflow, secure payment proof verification, campaign scheduling, expiry automation, and real-time performance analytics.",
    technologies: "Next.js, React, Supabase, PostgreSQL, TailwindCSS",
    live_link: "https://fa-23-bse-068-m-abdul-rehman.vercel.app",
    github_link: "https://github.com/AbdulRehman4t7/FA23-BSE-068-M.ABDUL-REHMAN",
    year: "2026",
    category: "Full-Stack Marketplace"
  },
  {
    id: "default-2",
    type: "app",
    title: "Flutter Apps Collection",
    tagline: "High-performance cross-platform applications",
    platform: "Cross-Platform",
    description: "A curated suite of clean, fast, and feature-rich mobile applications built using Flutter. Focuses on smooth UI animations, local database integrations, external API connectivity, and native platform integration.",
    technologies: "Flutter, Dart, Provider, SQLite, REST APIs",
    features: "Clean Architecture, Dynamic Theming, State Management, Offline Support, Native API Integration",
    github_link: "https://github.com/AbdulRehman4t7/FLUTTER-APPS",
    year: "2025"
  },
  {
    id: "default-3",
    type: "web",
    title: "Online Cinema Ticket Booking System",
    description: "A cinema booking system for browsing shows, selecting seats, and managing ticket reservations through a clean web-based flow.",
    technologies: "JavaScript, HTML, CSS",
    github_link: "https://github.com/AbdulRehman4t7/FA23-BSE-068-M.ABDUL-REHMAN/tree/main/online%20cinema%20ticket%20booking%20system",
    year: "2026",
    category: "Booking Platform"
  },
  {
    id: "default-4",
    type: "web",
    title: "Committee Management System",
    description: "A committee management solution for handling members, schedules, records, and administrative workflows in one place.",
    technologies: "JavaScript, HTML, CSS",
    github_link: "https://github.com/AbdulRehman4t7/FA23-BSE-068-M.ABDUL-REHMAN/tree/main/Committee%20Management%20System",
    year: "2026",
    category: "Management System"
  },
  {
    id: "default-5",
    type: "web",
    title: "Freelance Connect Platform",
    description: "A dedicated platform built to bridge the gap between freelance developers and clients, enabling project postings, bidding, and seamless messaging capabilities.",
    technologies: "React, TypeScript, Node.js, Supabase, CSS",
    github_link: "https://github.com/AbdulRehman4t7/freelance-connect",
    year: "2026",
    category: "Web Platform"
  },
  {
    id: "default-6",
    type: "web",
    title: "Online Election Management System",
    description: "An election management system for publishing elections, managing candidates, and collecting votes with role-based access.",
    technologies: "TypeScript, JavaScript, HTML, CSS",
    github_link: "https://github.com/AbdulRehman4t7/FA23-BSE-068-M.ABDUL-REHMAN/tree/main/Online%20Election%20Management%20System",
    year: "2026",
    category: "Election Platform"
  }
];

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_KEYS = {
  profile: "portfolio.profile",
  projects: "portfolio.projects",
  blogs: "portfolio.blogs",
};

const BlogPage = lazy(() => import("./pages/BlogPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&display=swap');

:root {
  --cream: #F5F0E8;
  --cream2: #EDE8DC;
  --ink: #0D0D0D;
  --ink2: #1A1A1A;
  --ink3: #2A2A2A;
  --muted: #6B6560;
  --muted2: #9B9590;
  --red: #C8372D;
  --red2: #E04038;
  --border: rgba(13,13,13,0.12);
  --border2: rgba(13,13,13,0.06);
  --font-display: 'Bebas Neue', 'Arial Black', sans-serif;
  --font-serif: 'DM Serif Display', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --section-pad: clamp(60px, 10vw, 120px);
  --container-width: 1180px;
}

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior:smooth; overflow-x:hidden; width: 100%; }

body {
  background: var(--cream);
  color: var(--ink);
  font-family: var(--font-body);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  cursor: none;
}

@media (hover: none) and (pointer: coarse) {
  body { cursor: auto; }
  .cursor-dot, .cursor-ring { display: none !important; }
  a, button { cursor: pointer !important; }
}

.cursor-dot {
  width: 8px; height: 8px; background: var(--red);
  border-radius: 50%; position: fixed; pointer-events: none;
  z-index: 99999; transition: transform 0.1s ease;
  transform: translate(-50%, -50%);
}
.cursor-ring {
  width: 36px; height: 36px;
  border: 1.5px solid var(--ink); border-radius: 50%;
  position: fixed; pointer-events: none; z-index: 99998;
  transition: transform 0.18s ease, width 0.25s, height 0.25s, border-color 0.25s;
  transform: translate(-50%, -50%);
}
.cursor-ring.hovering { width: 56px; height: 56px; border-color: var(--red); }

a, button { cursor: none; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--cream2); }
::-webkit-scrollbar-thumb { background: var(--ink); border-radius: 0; }

@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.rv {
  opacity:0; transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
}
.rv.in { opacity:1; transform: translateY(0); }
.rv-l {
  opacity:0; transform: translateX(-40px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
}
.rv-l.in { opacity:1; transform: translateX(0); }
.rv-r {
  opacity:0; transform: translateX(40px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
}
.rv-r.in { opacity:1; transform: translateX(0); }

.rv-d1 { transition-delay: 0.1s !important; }
.rv-d2 { transition-delay: 0.2s !important; }
.rv-d3 { transition-delay: 0.3s !important; }

.section { padding: var(--section-pad) 0; position: relative; width: 100%; }
.container { width: 100%; max-width: var(--container-width); margin: 0 auto; padding: 0 40px; }

.label {
  font-family: var(--font-body); font-size: 10px; font-weight: 700;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted);
  display: flex; align-items: center; gap: 10px;
}
.label::before { content: ''; display: block; width: 28px; height: 1.5px; background: var(--muted); }

.display {
  font-family: var(--font-display);
  letter-spacing: 0.02em; line-height: 0.9; color: var(--ink);
  font-size: clamp(60px, 10vw, 130px);
}
.display-sm {
  font-family: var(--font-display);
  letter-spacing: 0.02em; line-height: 0.95; color: var(--ink);
  font-size: clamp(40px, 7vw, 88px);
}
.display .red, .display-sm .red { color: var(--red); }

.btn-dark {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--ink); color: var(--cream);
  padding: 14px 32px; border-radius: 0;
  font-family: var(--font-body); font-size: 12px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  text-decoration: none; border: none; cursor: none;
  transition: all 0.3s ease; position: relative; overflow: hidden;
}
.btn-dark::before {
  content: ''; position: absolute; inset: 0;
  background: var(--red); transform: scaleX(0); transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
}
.btn-dark:hover { letter-spacing: 0.12em; }
.btn-dark:hover::before { transform: scaleX(1); }
.btn-dark span { position: relative; z-index: 1; }

.btn-outline {
  display: inline-flex; align-items: center; gap: 10px;
  background: transparent; color: var(--ink);
  padding: 13px 30px;
  border: 1.5px solid var(--ink);
  font-family: var(--font-body); font-size: 12px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  text-decoration: none; cursor: none;
  transition: all 0.3s ease;
}
.btn-outline:hover { background: var(--ink); color: var(--cream); }

.project-card {
  display: flex; flex-direction: column;
  background: #fff; border: 1px solid var(--border);
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s;
}
.project-card:hover { transform: translateY(-6px); box-shadow: 0 30px 60px rgba(0,0,0,0.08); }

@media (min-width: 900px) {
  .project-card.has-media { flex-direction: row; }
  .project-card.has-media > div:first-child { flex: 1.2; }
  .project-card.has-media > .project-media { flex: 1; border-left: 1px solid var(--border); }
}

.site-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  height: 70px; padding: 0 clamp(20px, 4vw, 48px);
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(245,240,232,0.92);
  border-bottom: 1px solid rgba(13,13,13,0.06);
  transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
}
.site-nav.scrolled {
  background: rgba(245,240,232,0.98);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 12px 30px rgba(13,13,13,0.08);
}
.nav-logo-btn {
  background: none; border: none; cursor: none;
  display: flex; align-items: center; gap: 12px;
}
.nav-logo {
  width: 42px; height: 42px; border-radius: 12px; background: var(--ink);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 16px; color: var(--cream);
  letter-spacing: 0.04em; box-shadow: 0 8px 18px rgba(13,13,13,0.18);
}
.nav-links-desktop {
  display: flex; align-items: center; gap: 24px;
  padding: 0; border-radius: 0; background: transparent;
  border: none; box-shadow: none;
}
.nav-link {
  font-size: 12px; font-weight: 700; color: var(--muted);
  letter-spacing: 0.18em; text-transform: uppercase;
  background: transparent; border: none; cursor: none;
  padding: 10px 0; position: relative;
  transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
  display: inline-flex; align-items: center; opacity: 0.7;
}
.nav-link::after {
  content: ""; position: absolute; left: 0; bottom: -6px; height: 2px; width: 0;
  background: var(--red); transition: width 0.25s cubic-bezier(0.16,1,0.3,1);
}
.nav-link:hover { color: var(--ink); opacity: 1; }
.nav-link:hover::after { width: 100%; }
.nav-link.active { color: var(--ink); opacity: 1; }
.nav-link.active::after { width: 100%; }

.nav-links { display: none; }

.hamburger { display:none; flex-direction:column; gap:5px; cursor:none; padding:6px; z-index: 1200; }
.hamburger span { width:22px; height:1.5px; background:var(--ink); transition:all 0.3s; display:block; }

input, textarea, select {
  width: 100%; background: transparent;
  border: none; border-bottom: 1.5px solid var(--border);
  padding: 14px 0; color: var(--ink);
  font-family: var(--font-body); font-size: 15px; font-weight: 400;
  outline: none; transition: border-color 0.3s;
}
input:focus, textarea:focus { border-color: var(--red); }
input::placeholder, textarea::placeholder { color: var(--muted2); }
textarea { resize: none; }

.marquee-wrap {
  overflow: hidden; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  padding: 14px 0; background: var(--ink); white-space: nowrap;
}
.marquee-track { display: inline-flex; gap: 0; animation: marquee 20s linear infinite; }
.marquee-item {
  font-family: var(--font-display); font-size: 22px; color: var(--cream);
  padding: 0 32px; letter-spacing: 0.06em;
  display: flex; align-items: center; gap: 32px;
}
.marquee-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--red); }

@media (max-width: 1024px) { .container { padding: 0 32px; } }

@media (max-width: 768px) {
  .container { padding: 0 24px; }
  .site-nav { height: 64px; padding: 0 20px; }
  .nav-logo { width: 38px; height: 38px; font-size: 16px; }
  .nav-links { padding: 110px 28px 28px; }
  .nav-links-desktop { display: none !important; }
  .hamburger { display: flex; }
  .nav-links {
    display: flex; flex-direction: column;
    position: fixed; top: 0; right: 0; bottom: 0; width: 100%;
    background: var(--cream); padding: 120px 40px 40px;
    gap: 12px; z-index: 1100;
    transform: translateX(100%); transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  .nav-links.open { transform: translateX(0); }
  .nav-links .nav-link { 
    font-size: 32px; font-weight: 800; font-family: var(--font-display); 
    padding: 16px 0; border-bottom: 1px solid var(--border2); width: 100%; 
    text-align: left; opacity: 1;
  }
  .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
  .hero-photo { justify-content: center !important; order: -1; margin-bottom: 40px; }
  .hero-photo > div { width: clamp(220px, 60vw, 320px) !important; height: clamp(220px, 60vw, 320px) !important; }
  .about-content-wrapper { grid-template-columns: 1fr !important; gap: 40px !important; }
  .info-cards-grid { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important; }

  .skills-grid { grid-template-columns: 1fr !important; }
  .skills-grid > div { border-right: none !important; border-bottom: 1px solid var(--border) !important; }
  .skills-grid > div:last-child { border-bottom: none !important; }

  .experience-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
  .exp-item { padding: 32px 0 !important; }
  .contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
  .footer-grid { flex-direction: column !important; align-items: center !important; text-align: center !important; }
}

.blog-header { padding: 40px 0 32px; border-bottom: 1px solid var(--border); }
.blog-toolbar { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 36px; }
.blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 22px; }
.blog-detail { max-width: 760px; padding-top: 48px; padding-bottom: 80px; }
.blog-detail-meta { display: flex; gap: 20px; flex-wrap: wrap; font-size: 12px; color: var(--muted); margin-bottom: 40px; }

.hr { border: none; border-top: 1px solid var(--border); }

.card-editorial {
  background: var(--cream2); border: 1px solid var(--border);
  padding: 28px 28px; position: relative;
  transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.card-editorial::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; background: var(--red); transform: scaleX(0); transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
}
.card-editorial:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
.card-editorial:hover::after { transform: scaleX(1); }

@media (max-width: 480px) {
  .container { padding: 0 20px; }
  .display { font-size: 48px; }
  .display-sm { font-size: 36px; }
  .info-cards-grid { grid-template-columns: 1fr !important; }
  .nav-links .nav-link { font-size: 26px; }
  .hero-grid { gap: 32px !important; }
  .marquee-item { font-size: 18px; padding: 0 20px; }
  .btn-dark, .btn-outline { width: 100%; justify-content: center; }
  .blog-toolbar input { max-width: 100% !important; }
  .blog-grid { grid-template-columns: 1fr; }
  .blog-detail { padding-top: 32px; }
}
`;

export default function App() {
  const [active, setActive] = useState("hero");
  const [showTop, setShowTop] = useState(false);
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [blogPosts, setBlogPosts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const isAdmin = location.pathname.startsWith("/admin");

  const handleBlogBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    async function load() {
      const cachedProfile = readCache(CACHE_KEYS.profile);
      const cachedProjects = readCache(CACHE_KEYS.projects);
      const cachedBlogs = readCache(CACHE_KEYS.blogs);
      if (cachedProfile) setInfo(cachedProfile);
      if (cachedProjects && cachedProjects.length > 0) {
        setProjects(cachedProjects);
      } else {
        setProjects(DEFAULT_PROJECTS);
      }
      if (cachedBlogs) setBlogPosts(cachedBlogs);

      // First, get the profile so we can show the hero immediately
      const prof = await getProfile();
      if (prof) setInfo(prof);
      
      // Then, get projects and blog posts
      try {
        const [web, app, blogs] = await Promise.all([
          getProjects("web"), getProjects("app"), getBlogPosts(true),
        ]);
        const fetchedProjects = [
          ...(app || []).map(p => ({ ...p, type: "app" })),
          ...(web || []).map(p => ({ ...p, type: "web" }))
        ].sort((a, b) => parseInt(b.year || 0) - parseInt(a.year || 0));

        if (fetchedProjects.length > 0) {
          setProjects(fetchedProjects);
          writeCache(CACHE_KEYS.projects, fetchedProjects);
        } else {
          const cached = readCache(CACHE_KEYS.projects);
          if (!cached || cached.length === 0) {
            setProjects(DEFAULT_PROJECTS);
          }
        }
        setBlogPosts(blogs || []);
        if (prof) writeCache(CACHE_KEYS.profile, prof);
        writeCache(CACHE_KEYS.blogs, blogs || []);
      } catch (err) {
        console.error("Delayed load error:", err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const sections = ["hero","about","experience","projects","skills","contact"];
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { threshold: 0.2 }
    );
    sections.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [isHome]);

  useEffect(() => {
    if (!isHome) return;
    if (!location.hash) return;
    let tries = 0;
    const tryScroll = () => {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (tries < 20) {
        tries += 1;
        requestAnimationFrame(tryScroll);
      }
    };
    tryScroll();
  }, [isHome, location.hash]);

  useEffect(() => {
    if (isAdmin) return;
    const fn = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin || !isHome) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".rv, .rv-l, .rv-r").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [isAdmin, isHome]);

  useEffect(() => {
    if (isAdmin) return;
    const dot = document.getElementById("cur-dot");
    const ring = document.getElementById("cur-ring");
    if (!dot || !ring) return;
    const move = (e) => {
      dot.style.left = e.clientX + "px"; dot.style.top = e.clientY + "px";
      ring.style.left = e.clientX + "px"; ring.style.top = e.clientY + "px";
    };
    const hover = () => ring.classList.add("hovering");
    const leave = () => ring.classList.remove("hovering");
    document.addEventListener("mousemove", move);
    document.querySelectorAll("a, button, .card-editorial").forEach(el => {
      el.addEventListener("mouseenter", hover);
      el.addEventListener("mouseleave", leave);
    });
    return () => document.removeEventListener("mousemove", move);
  }, [isAdmin]);

  return (
    <>
      <style>{CSS}</style>
      {!isAdmin && <div id="cur-dot" className="cursor-dot" />}
      {!isAdmin && <div id="cur-ring" className="cursor-ring" />}
      {!isAdmin && <Nav active={active} />}

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage info={info} projects={projects} />} />
          <Route path="/blog" element={<BlogPage posts={blogPosts} onBack={handleBlogBack} />} />
          <Route path="/admin/*" element={<AdminPage onBack={() => { navigate("/"); window.scrollTo({ top: 0 }); }} />} />
          <Route path="*" element={<NotFound onHome={() => navigate("/")} />} />
        </Routes>
      </Suspense>

      {!isAdmin && isHome && <Footer info={info} />}

      {showTop && !isAdmin && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ position:"fixed", bottom:32, right:32, zIndex:999, width:48, height:48,
            background:"var(--ink)", border:"none", color:"var(--cream)", fontSize:20,
            cursor:"none", display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.background="var(--red)"}
          onMouseLeave={e=>e.currentTarget.style.background="var(--ink)"}
        >↑</button>
      )}
    </>
  );
}

function HomePage({ info, projects }) {
  return (
    <main>
      <Hero info={info} />
      <About info={info} />
      <Experience />
      <Projects projects={projects} />
      <Skills />
      <Contact info={info} />
    </main>
  );
}

function NotFound({ onHome }) {
  return (
    <div style={{ minHeight: "100vh", paddingTop: 120, textAlign: "center" }}>
      <div className="container">
        <div className="label" style={{ justifyContent: "center", marginBottom: 12 }}>Not Found</div>
        <h1 className="display-sm" style={{ marginBottom: 16 }}>Page Missing</h1>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>The page you are looking for does not exist.</p>
        <button className="btn-dark" onClick={onHome}><span>Go Home</span></button>
      </div>
    </div>
  );
}

function RouteFallback() {
  return (
    <div style={{ minHeight: "100vh", paddingTop: 120, textAlign: "center" }}>
      <div className="container">
        <div className="label" style={{ justifyContent: "center", marginBottom: 12 }}>Loading</div>
        <p style={{ color: "var(--muted)" }}>Preparing the page…</p>
      </div>
    </div>
  );
}
