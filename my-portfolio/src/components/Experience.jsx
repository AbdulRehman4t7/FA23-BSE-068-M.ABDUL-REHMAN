export default function Experience() {
  const experiences = [
    {
      company: "Arch Technologies",
      role: "Mobile Application Developer",
      period: "April 2026 — Present",
      duration: "1 month",
      location: "Remote",
      desc: "Specializing in high-performance mobile application development using cutting-edge technologies.",
      current: true
    },
    {
      company: "CodeAlpha",
      role: "App Developer",
      period: "March 2026 — April 2026",
      duration: "2 months",
      location: "Remote",
      desc: "Contributed to application design and development workflows in a remote-first environment."
    },
    {
      company: "Freelance",
      role: "Application Developer",
      period: "March 2026 — Present",
      duration: "2 months",
      location: "Remote",
      desc: "Developing custom software solutions and applications for diverse client requirements."
    },
    {
      company: "Largify Solutions",
      role: "Mobile Application Developer",
      period: "October 2025 — January 2026",
      duration: "4 months",
      location: "Burewala",
      desc: "Worked on building Android apps and connecting them with backend services. Designed simple user interfaces, added login and database features, and fixed bugs. Learned how to work in a remote team and gained real experience in mobile app development."
    }
  ];

  return (
    <section id="experience" className="section" style={{ background: "var(--cream)", color: "var(--ink)", borderTop: "1px solid var(--border)" }}>
      <div className="container">
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: 64 }}>
          <div className="label rv" style={{ marginBottom: 16 }}>Career Path</div>
          <h2 className="display-sm rv rv-d1" style={{ color: "var(--ink)", marginBottom: 20 }}>
            Work <span className="red">Experience.</span>
          </h2>
          <div className="rv rv-d2" style={{ width: 60, height: 4, background: "var(--red)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {experiences.map((exp, idx) => (
            <div key={idx} className="rv exp-item experience-grid" style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
              gap: "24px 40px", 
              padding: "48px 0",
              borderBottom: idx === experiences.length - 1 ? "none" : "1px solid var(--border)",
              transition: "all 0.3s ease"
            }}>
              {/* Left Column: Period & Location */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ 
                  fontSize: 12, 
                  fontWeight: 700, 
                  letterSpacing: "0.1em", 
                  textTransform: "uppercase", 
                  color: exp.current ? "var(--red)" : "var(--muted)" 
                }}>
                  {exp.period}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted2)", fontWeight: 500 }}>
                  {exp.location} • {exp.duration}
                </div>
              </div>

              {/* Right Column: Role & Company */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <h3 style={{ fontSize: 24, fontFamily: "var(--font-body)", fontWeight: 600 }}>{exp.role}</h3>
                  <span style={{ fontSize: 13, padding: "4px 12px", borderRadius: 20, background: "var(--cream2)", border: "1px solid var(--border)", color: "var(--red)", fontWeight: 600 }}>
                    {exp.company}
                  </span>
                </div>
                <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.8, maxWidth: 800 }}>
                  {exp.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
