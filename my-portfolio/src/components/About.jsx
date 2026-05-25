export default function About({ info }) {
  const universityFallback = "COMSATS University Islamabad (Vehari Campus)";
  const expYears = info?.years_exp && info.years_exp > 0 ? info.years_exp : 2;

  return (
    <section id="about" className="section" style={{ borderTop:"1px solid var(--border)", background: "var(--cream)" }}>
      <div className="container">

        {/* Section label */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", marginBottom:48 }}>
          <div className="label rv" style={{ marginBottom: 12 }}>Personal Profile</div>
          <h2 className="display-sm rv rv-d1" style={{ marginBottom: 20 }}>About <span className="red">Me.</span></h2>
          <div className="rv rv-d2" style={{ width: 40, height: 4, background: "var(--red)" }} />
        </div>

        <div className="about-content-wrapper" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
          {/* Left: Bio Text */}
          <div className="rv rv-d1">
            <p style={{ 
              fontSize: 18, 
              color: "var(--ink2)", 
              lineHeight: 1.8, 
              marginBottom: 32,
              fontWeight: 400,
              fontFamily: "var(--font-body)"
            }}>
              {info?.about_bio || "Software Engineering student at COMSATS University Islamabad (Vehari Campus) with hands-on experience in Android and full-stack development. I specialize in building production-ready mobile and web applications, delivering end-to-end solutions from intuitive user interfaces to scalable backend systems. Committed to clean, maintainable code and driven by a focus on real-world impact, I continuously refine my skills through professional and freelance projects."}
            </p>
            <div className="rv rv-d2">
              <a href={info?.github} target="_blank" rel="noreferrer" className="btn-dark">
                <span>Explore GitHub</span><span>↗</span>
              </a>
            </div>
          </div>

          {/* Right: Info Cards */}
          <div className="info-cards-grid rv rv-d2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { l: "University", v: info?.university || universityFallback, i: "🎓" },
              { l: "Location", v: info?.location || "Vehari, Pakistan", i: "📍" },
               { l: "Email", v: info?.email || "a03480748044@gmail.com", i: "✉️" },
              { l: "Experience", v: `${expYears}+ Years`, i: "⚡" },
            ].map((item) => (
              <div key={item.l} style={{ 
                padding: "24px", 
                background: "#fff", 
                border: "1px solid var(--border)", 
                borderRadius: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
              }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted2)", marginBottom: 8 }}>{item.l}</div>
                <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, lineHeight: 1.4 }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
