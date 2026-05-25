import { useState, useEffect } from "react";

function parseCSV(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value) return value.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export default function Projects({ projects }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (!modal) return;
    const screenshots = Array.isArray(modal.project.screenshots) ? modal.project.screenshots.filter(Boolean) : [];
    if (screenshots.length === 0) return;
    const onKey = (e) => {
      if (e.key === "Escape") setModal(null);
      if (e.key === "ArrowRight") setModal((m) => ({ ...m, idx: (m.idx + 1) % screenshots.length }));
      if (e.key === "ArrowLeft") setModal((m) => ({ ...m, idx: (m.idx - 1 + screenshots.length) % screenshots.length }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  const types = ["All", "App", "Web"];
  const shown = projects.filter(p => {
    if (filter === "All") return true;
    if (filter === "App") return p.type === "app";
    if (filter === "Web") return p.type === "web";
    return true;
  });

  if (!projects || projects.length === 0) {
    return (
      <section id="projects" className="section">
        <div className="container">
          <SectionHeader />
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)", fontSize: 14 }}>
            No projects yet. Add some in the admin panel.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHeader />

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {projects.map((p) => {
            if (p.type === "app") {
              return <AppCard key={p.id} project={p} onViewGallery={(idx) => setModal({ project: p, idx: idx || 0 })} />;
            } else {
              return <WebCard key={p.id} project={p} />;
            }
          })}
        </div>
      </div>

      {modal && (
        <ScreenshotModal
          project={modal.project}
          idx={modal.idx}
          setIdx={(idx) => setModal((m) => ({ ...m, idx }))}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  );
}

function SectionHeader() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", marginBottom:52 }}>
      <div className="label rv" style={{ marginBottom: 12, justifyContent: "center" }}>MY WORK</div>
      <h2 className="display-sm rv rv-d1" style={{ marginBottom: 24, color: "var(--ink)" }}>
        Featured <span className="red">Projects.</span>
      </h2>
      <div className="rv rv-d2" style={{ width: 1, height: 40, background: "var(--border)", margin: "0 auto 28px" }} />
    </div>
  );
}

function WebCard({ project: p }) {
  const techList = parseCSV(p.technologies);
  const accentColor = p.color || "var(--red)";

  return (
    <div className={`card project-card ${p.image_url ? 'has-media' : ''}`}>
       <div style={{ padding: "32px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ padding: "4px 12px", borderRadius: 6, background: "var(--cream2)", fontSize: 10, color: "var(--red)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Web Project
            </span>
            {p.category && <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{p.category}</span>}
            {p.year && <span style={{ fontSize: 11, color: "var(--muted2)" }}>{p.year}</span>}
          </div>
          
          <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, color: "var(--ink)", marginBottom: 12 }}>{p.title}</h3>
          
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginBottom: 20 }}>{p.description}</p>
          
          {techList.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24, marginTop: "auto" }}>
              {techList.map((t) => (
                <span key={t} style={{ padding: "4px 12px", background: "var(--cream2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {p.live_link && (
              <a href={p.live_link} target="_blank" rel="noreferrer" style={{ padding: "10px 20px", background: "var(--ink)", color: "var(--cream)", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                Live Demo ↗
              </a>
            )}
            {p.github_link && (
              <a href={p.github_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textDecoration: "none" }}>
                View GitHub ↗
              </a>
            )}
          </div>
       </div>

       {p.image_url && (
         <div className="project-media" style={{ background: "var(--cream2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
           <img src={p.image_url} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
         </div>
       )}
    </div>
  );
}

function AppCard({ project: p, onViewGallery }) {
  const techList = parseCSV(p.technologies);
  const featureList = parseCSV(p.features);
  const screenshots = Array.isArray(p.screenshots) ? p.screenshots.filter(Boolean) : [];
  const accentColor = p.color || "#0ea5e9";

  return (
    <div className={`card project-card ${screenshots.length > 0 ? 'has-media' : ''}`}>
      <div style={{ padding: "32px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ padding: "4px 12px", borderRadius: 6, background: "var(--cream2)", fontSize: 10, color: "var(--red)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Mobile App
          </span>
          {p.platform && (
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{p.platform}</span>
          )}
          {p.year && (
            <span style={{ fontSize: 11, color: "var(--muted2)" }}>{p.year}</span>
          )}
        </div>

        <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>{p.title}</h3>

        {p.tagline && (
          <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 12, letterSpacing: "0.02em" }}>{p.tagline}</p>
        )}

        {p.description && (
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginBottom: 16 }}>{p.description}</p>
        )}

        {techList.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
            {techList.map((t) => (
              <span key={t} style={{ padding: "3px 10px", background: `var(--cream2)`, border: `1px solid var(--border)`, borderRadius: 8, fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {featureList.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
            {featureList.slice(0, 5).map((f) => (
              <span key={f} style={{ fontSize: 11, color: "var(--muted2)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: "var(--red)", fontSize: 8 }}>●</span> {f}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 14, marginTop: "auto", alignItems: "center", flexWrap: "wrap" }}>
          {p.playstore_link && (
            <a href={p.playstore_link} target="_blank" rel="noreferrer" 
               style={{ padding: "10px 20px", background: "var(--red)", color: "var(--cream)", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
              Play Store ↗
            </a>
          )}
          {screenshots.length > 0 && (
            <button
              onClick={() => onViewGallery(0)}
              style={{ padding: "10px 20px", background: "var(--ink)", color: "var(--cream)", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              Gallery ({screenshots.length}) ↗
            </button>
          )}
          {p.github_link && (
            <a href={p.github_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              View GitHub ↗
            </a>
          )}
        </div>
      </div>

      {screenshots.length > 0 && (
        <div className="project-media project-screenshots-scroll" style={{
          display: "flex", gap: 12, padding: "20px", overflowX: "auto", alignItems: "center", background: "transparent"
        }}>
          {screenshots.map((src, i) => (
            <div
              key={i}
              onClick={() => onViewGallery(i)}
              style={{
                flexShrink: 0, width: "clamp(120px, 20vw, 160px)", height: "auto", aspectRatio: "9/19",
                borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              }}
            >
              <img src={src} alt={`screenshot ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScreenshotModal({ project: p, idx, setIdx, onClose }) {
  const screenshots = Array.isArray(p.screenshots) ? p.screenshots.filter(Boolean) : [];
  const total = screenshots.length;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer" }}>×</button>

      <div style={{ textAlign: "center", marginBottom: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{p.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>Screenshot {idx + 1} of {total} · Press ← → to navigate · Esc to close</div>
      </div>

      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, minHeight: 0, width: "100%", justifyContent: "center" }}>
        <button onClick={() => setIdx((idx - 1 + total) % total)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: 48, height: 48, borderRadius: "50%", fontSize: 24, cursor: "pointer" }}>‹</button>
        <div style={{ borderRadius: 16, overflow: "hidden", maxHeight: "100%", maxWidth: "80vw", display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.4)" }}>
          <img src={screenshots[idx]} alt={`screenshot ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", maxHeight: "65vh" }} />
        </div>
        <button onClick={() => setIdx((idx + 1) % total)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: 48, height: 48, borderRadius: "50%", fontSize: 24, cursor: "pointer" }}>›</button>
      </div>

      {total > 1 && (
        <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 12, marginTop: 24, padding: "10px 0", overflowX: "auto", maxWidth: "90vw", alignItems: "center", msOverflowStyle: "none", scrollbarWidth: "none" }}>
          <style>{"div::-webkit-scrollbar { display: none; }"}</style>
          {screenshots.map((src, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ width: 60, height: 100, flexShrink: 0, padding: 0, borderRadius: 8, overflow: "hidden", cursor: "pointer", border: i === idx ? `2px solid var(--red)` : "2px solid transparent", opacity: i === idx ? 1 : 0.5, transition: "all 0.2s", background: "#000" }}>
              <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={`Thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
