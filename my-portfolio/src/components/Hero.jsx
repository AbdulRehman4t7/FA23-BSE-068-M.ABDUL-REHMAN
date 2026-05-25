import { useState, useEffect } from "react";

const ROLES = ["Planning Specialist", "Full Stack Dev.", "Flutter Expert", "Deployment Engineer"];

export default function Hero({ info }) {
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const role = ROLES[roleIdx];
    let t;
    if (typing) {
      if (displayed.length < role.length) t = setTimeout(() => setDisplayed(role.slice(0, displayed.length + 1)), 75);
      else t = setTimeout(() => setTyping(false), 2200);
    } else {
      if (displayed.length > 0) t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
      else { setRoleIdx((i) => (i + 1) % ROLES.length); setTyping(true); }
    }
    return () => clearTimeout(t);
  }, [displayed, typing, roleIdx]);

  useEffect(() => {
    const src = info?.profile_pic || "/profile.png";
    const img = new Image();
    img.src = src;
  }, [info?.profile_pic]);

  const esc = (s) => (s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  const generateCV = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(info?.name)} — CV</title>
<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#111;font-size:13px;line-height:1.6;}.page{max-width:780px;margin:0 auto;padding:48px;}.header{border-bottom:3px solid #C8372D;padding-bottom:24px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start;}.name{font-size:36px;font-weight:900;letter-spacing:-1px;}.tagline{font-size:13px;color:#555;margin-top:4px;}.contact-info{text-align:right;font-size:12px;color:#444;line-height:1.9;}.contact-info a{color:#C8372D;}.section{margin-bottom:26px;}.section-title{font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#C8372D;border-bottom:1px solid #eee;padding-bottom:6px;margin-bottom:12px;}.bio{font-size:13px;color:#444;line-height:1.85;}.skill-tag{font-size:11px;background:#fff3f2;color:#C8372D;padding:3px 10px;border:1px solid #fccac7;display:inline-block;margin:2px;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style></head><body>
<div class="page"><div class="header"><div><div class="name">${esc(info?.name ?? "Muhammad Abdul Rehman")}</div><div class="tagline">${esc(info?.tagline ?? "")}</div><div class="tagline" style="margin-top:3px;color:#888;">Software Engineering Student · ${esc(info?.university ?? "COMSATS University")}</div></div><div class="contact-info"><div><a href="mailto:${esc(info?.email)}">${esc(info?.email)}</a></div><div><a href="${esc(info?.linkedin)}">LinkedIn</a></div><div><a href="${esc(info?.github)}">GitHub</a></div><div>${esc(info?.location)}</div></div></div>
<div class="section"><div class="section-title">Profile</div><p class="bio">${esc(info?.bio ?? "")}</p></div>
<div class="section"><div class="section-title">Technical Skills</div><div style="display:flex;flex-wrap:wrap;gap:4px;"><span class="skill-tag">React</span><span class="skill-tag">Node.js</span><span class="skill-tag">JavaScript</span><span class="skill-tag">Android</span><span class="skill-tag">Java</span><span class="skill-tag">Python</span><span class="skill-tag">Supabase</span><span class="skill-tag">Git</span></div></div>
</div><script>window.onload=()=>window.print();</script></body></html>`);
    w.document.close();
  };

  return (
    <section id="hero" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"flex-end", paddingTop:64, position:"relative", overflow:"hidden" }}>

      {/* Big number bg */}
      <div style={{
        position:"absolute", right:-40, top:"50%", transform:"translateY(-50%)",
        fontFamily:"var(--font-display)", fontSize:"clamp(200px,25vw,360px)",
        color:"rgba(13,13,13,0.04)", letterSpacing:"-0.05em", lineHeight:1,
        userSelect:"none", pointerEvents:"none", zIndex:0,
      }}>01</div>

      <div className="container" style={{ position:"relative", zIndex:1, paddingBottom:80 }}>
        {/* Main headline */}
        <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
          
          {/* Left Block */}
          <div style={{ paddingTop: 8 }}>
            <div className="rv" style={{ padding: "8px 24px", background: "var(--cream2)", borderRadius: 30, fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)", animation: "blink 2s infinite" }} />
              Open to Work
            </div>

            <h1 className="display rv" style={{ marginBottom: 24 }}>
              {info?.name ?? "Muhammad Abdul Rehman"}
            </h1>

            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }} className="rv rv-d1">
              <span style={{ fontFamily:"var(--font-body)", fontSize:18, fontWeight:400, color:"var(--ink3)", letterSpacing:"0.02em" }}>
                {displayed}<span style={{ borderRight:"2px solid var(--red)", marginLeft:1, animation:"blink 0.5s step-end infinite" }}>&nbsp;</span>
              </span>
            </div>

            <p style={{ fontSize:15, color:"var(--muted)", lineHeight:1.85, maxWidth:480, marginBottom:40 }} className="rv rv-d2">
              {info?.bio ?? "Building modern digital experiences at COMSATS University, Vehari. React · Node.js · Android."}
            </p>

            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }} className="rv rv-d3">
              <a href="#contact" className="btn-dark"
                onClick={e => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior:"smooth" }); }}>
                <span>Let's Talk</span><span>→</span>
              </a>
              <a href="#projects" className="btn-outline"
                onClick={e => { e.preventDefault(); document.getElementById("projects")?.scrollIntoView({ behavior:"smooth" }); }}>
                View Work
              </a>
            </div>

            {/* Socials row */}
            <div style={{ display:"flex", gap:12, marginTop:40, flexWrap:"wrap" }} className="rv rv-d4">
              {[
                { label:"LinkedIn", href: info?.linkedin },
                { label:"GitHub",   href: info?.github },
                { label:"Email",    href:`mailto:${info?.email}` },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", textDecoration: "none", padding: "8px 20px", borderRadius: 20, background: "var(--cream2)", transition: "all 0.2s" }}
                  onMouseEnter={e => {e.currentTarget.style.color = "var(--red)"}}
                  onMouseLeave={e => {e.currentTarget.style.color = "var(--muted)"}}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right Block — Profile Photo */}
          <div className="hero-photo rv-r" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <div style={{
              width: "clamp(260px, 32vw, 420px)", 
              height: "clamp(260px, 32vw, 420px)", 
              borderRadius: "50%", overflow: "hidden",
              border: "6px solid #fff", boxShadow: "0 24px 64px rgba(0,0,0,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream2)"
            }}>
              <img src={info?.profile_pic || "/profile.png"} alt={info?.name || "Muhammad Abdul Rehman"}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                loading="eager" fetchpriority="high" decoding="async"
                width="420" height="420"
                onError={(e) => { e.currentTarget.src = "/profile.png"; }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom marquee strip */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...Array(2)].map((_,ri) =>
            ["React Developer","Flutter Apps","Planning & Design","Deployment Techs","Node.js Backend","Open To Work"].map((t,i) => (
              <div key={`${ri}-${i}`} className="marquee-item">
                {t}<span className="marquee-dot" />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
