export default function Footer({ info }) {
  return (
    <footer style={{ background:"var(--ink)", padding:"48px 0 32px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
      <div className="container">
        <div className="footer-grid" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:48, flexWrap:"wrap", gap:32 }}>
          <div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:48, color:"var(--cream)", lineHeight:0.9, letterSpacing:"0.02em", marginBottom:16 }}>
              {(info?.name || "Muhammad Abdul Rehman").toUpperCase()}
            </div>
            <div style={{ fontSize:12, color:"rgba(245,240,232,0.35)", maxWidth:240, lineHeight:1.7 }}>
              Full Stack Developer · Android Dev · AI Enthusiast<br/>Pakistan
            </div>
          </div>

          <div style={{ display:"flex", gap:64, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,240,232,0.3)", marginBottom:16 }}>Links</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {["About","Projects","Skills","Contact","Blog"].map(l => (
                  <span key={l} style={{ fontSize:13, color:"rgba(245,240,232,0.55)", cursor:"none",
                    transition:"color 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="var(--red)"}
                    onMouseLeave={e=>e.currentTarget.style.color="rgba(245,240,232,0.55)"}
                  >{l}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,240,232,0.3)", marginBottom:16 }}>Connect</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[["LinkedIn", info?.linkedin],["GitHub", info?.github],["Email", `mailto:${info?.email}`]].map(([l,h]) => (
                  <a key={l} href={h} target="_blank" rel="noreferrer"
                    style={{ fontSize:13, color:"rgba(245,240,232,0.55)", textDecoration:"none", transition:"color 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="var(--red)"}
                    onMouseLeave={e=>e.currentTarget.style.color="rgba(245,240,232,0.55)"}
                  >{l} ↗</a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <span style={{ fontSize:11, color:"rgba(245,240,232,0.25)" }}>© 2026 {info?.name || "Muhammad Abdul Rehman"} — All Rights Reserved</span>
          <span style={{ fontSize:11, color:"rgba(245,240,232,0.25)" }}>Built with React & passion</span>
        </div>
      </div>
    </footer>
  );
}
