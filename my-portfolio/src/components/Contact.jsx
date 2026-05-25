import { useState } from "react";

export default function Contact({ info }) {
  const [form, setForm] = useState({ name:"", email:"", message:"" });
  const WHATSAPP = "923480748044";

  const openWA = () => {
    const msg = encodeURIComponent(`Hi ${info?.name || "Muhammad Abdul Rehman"}! I'm ${form.name||"a visitor"} (${form.email||"no email"}). ${form.message||"I want to discuss a project."}`);
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");
  };

  return (
    <section id="contact" className="section" style={{ borderTop:"1px solid var(--border)", background:"var(--cream2)" }}>
      <div className="container">
        <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:64 }}>
          <span style={{ fontFamily:"var(--font-display)", fontSize: "clamp(50px, 12vw, 80px)", color:"rgba(13,13,13,0.06)", lineHeight:1 }}>06</span>
          <div>
            <div className="label rv">Get In Touch</div>
            <h2 className="display-sm rv rv-d1">Let's <span className="red">Talk.</span></h2>
          </div>
        </div>

        <div className="contact-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80 }}>
          {/* Left — copy */}
          <div className="rv-l">
            <p style={{ fontFamily:"var(--font-serif)", fontStyle:"italic", fontSize:22, color:"var(--ink2)", lineHeight:1.7, marginBottom:40 }}>
              "Have a project in mind, want to hire me, or just want to say hi? My inbox is always open."
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {[
                { label:"LinkedIn",         val:"Connect professionally",  href: info?.linkedin,           icon:"↗" },
                { label:"GitHub",           val:"See my open source code", href: info?.github,             icon:"↗" },
                { label: info?.email,       val:"Direct email",            href:`mailto:${info?.email}`,   icon:"✉" },
                { label:"WhatsApp",         val:"Quick replies guaranteed",href:`https://wa.me/${WHATSAPP}`,icon:"💬" },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer"
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"18px 0", borderBottom:"1px solid var(--border)",
                    textDecoration:"none", transition:"all 0.2s", group:"true" }}
                  onMouseEnter={e => { e.currentTarget.style.paddingLeft = "10px"; e.currentTarget.style.color = "var(--red)"; }}
                  onMouseLeave={e => { e.currentTarget.style.paddingLeft = "0px"; e.currentTarget.style.color = "var(--ink)"; }}
                >
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:"inherit" }}>{s.label}</div>
                    <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{s.val}</div>
                  </div>
                  <span style={{ fontSize:18, color:"var(--muted)" }}>{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="rv-r">
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--muted)", marginBottom:32 }}>Send a Message</div>
            <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
              {[{key:"name",type:"text",ph:"Your full name"},{key:"email",type:"email",ph:"your@email.com"}].map(({key,type,ph}) => (
                <div key={key}>
                  <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted)", marginBottom:6 }}>{key}</div>
                  <input type={type} placeholder={ph} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} />
                </div>
              ))}
              <div>
                <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted)", marginBottom:6 }}>Message</div>
                <textarea rows={5} placeholder="Tell me about your project..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})} />
              </div>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <button onClick={openWA} className="btn-dark"><span>💬 WhatsApp</span></button>
                <a href={`mailto:${info?.email}`} className="btn-outline">✉️ Email</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
