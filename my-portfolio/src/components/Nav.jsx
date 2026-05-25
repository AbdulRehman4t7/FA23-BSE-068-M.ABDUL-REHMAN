import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Nav({ active }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const activeKey = isHome ? active : null;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "About", href: "#about", key: "about" },
    { label: "Experience", href: "#experience", key: "experience" },
    { label: "Projects", href: "#projects", key: "projects" },
    { label: "Skills", href: "#skills", key: "skills" },
    { label: "Blog", key: "blog" },
    { label: "Contact", href: "#contact", key: "contact" },
  ];

  const handleLink = (link) => {
    setOpen(false);
    if (link.key === "blog") {
      navigate("/blog");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!isHome) {
      navigate({ pathname: "/", hash: link.href });
      return;
    }
    document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav className={`site-nav${scrolled ? " scrolled" : ""}`}>
        <button onClick={() => { navigate("/"); window.scrollTo({top:0}); }}
          aria-label="Back to top"
          className="nav-logo-btn">
          <div className="nav-logo">AH</div>
        </button>

        <div className="nav-links-desktop">
          {links.map(l => (
            <button key={l.key} onClick={() => handleLink(l)}
              className={`nav-link${activeKey===l.key||(l.key==="blog"&&location.pathname==="/blog")?" active":""}`}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="hamburger" onClick={() => setOpen(!open)}>
          <span style={{ transform: open ? "rotate(45deg) translate(5px,5px)" : "none", background: "var(--ink)" }} />
          <span style={{ opacity: open ? 0 : 1, background: "var(--ink)" }} />
          <span style={{ transform: open ? "rotate(-45deg) translate(5px,-5px)" : "none", background: "var(--ink)" }} />
        </div>
      </nav>

      {open && <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, zIndex:1099, background:"rgba(0,0,0,0.4)" }} />}
      <div className={`nav-links ${open ? 'open' : ''}`}>
        {links.map(l => (
          <button key={l.key} onClick={() => handleLink(l)} className={`nav-link ${activeKey === l.key || (l.key === "blog" && location.pathname === "/blog") ? "active" : ""}`}>
            {l.label}
          </button>
        ))}
      </div>
    </>
  );
}
