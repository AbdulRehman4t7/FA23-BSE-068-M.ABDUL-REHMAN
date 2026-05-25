import { useState } from "react";
import { formatDate, estimateReadingTime, truncate } from "../utils/helpers";

export default function BlogPage({ posts, onBack }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [selected, setSelected] = useState(null);

  const allTags = ["All", ...new Set((posts || []).flatMap((p) => p.tags || []))];

  const filtered = (posts || []).filter((p) => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag === "All" || (p.tags || []).includes(activeTag);
    return matchSearch && matchTag;
  });

  if (selected) {
    return <BlogPostDetail post={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80 }}>
      {/* Header */}
      <div className="blog-header">
        <div className="container">
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
            ← Back to Portfolio
          </button>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", color: "var(--red)", marginBottom: 10, textTransform: "uppercase" }}>BLOG</div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-1.5px", color: "var(--ink)", marginBottom: 8 }}>
            Articles &amp; <span style={{ color: "var(--red)" }}>Insights</span>
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 520 }}>
            Thoughts on software development, mobile apps, and the tech I use.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Search + Filters */}
        <div className="blog-toolbar">
          <input
            type="text" placeholder="Search articles…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 280 }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                  background: activeTag === tag ? "var(--cream2)" : "transparent",
                  color: activeTag === tag ? "var(--red)" : "var(--muted)",
                  outline: activeTag === tag ? "1px solid var(--red)" : "1px solid var(--border)",
                  transition: "all 0.2s",
                }}
              >{tag}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)", fontSize: 14 }}>
            {posts?.length === 0 ? "No blog posts published yet." : "No results found."}
          </div>
        ) : (
          <div className="blog-grid">
            {filtered.map((post) => (
              <BlogCard key={post.id} post={post} onClick={() => setSelected(post)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BlogCard({ post, onClick }) {
  const readingTime = estimateReadingTime(post.content || post.description);
  return (
    <div className="card" onClick={onClick} style={{ cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {post.featured_image && (
        <div style={{ height: 180, overflow: "hidden" }}>
          <img src={post.featured_image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} />
        </div>
      )}
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {(post.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} style={{ padding: "2px 9px", borderRadius: 8, background: "var(--cream2)", fontSize: 10, color: "var(--red)", fontWeight: 600 }}>{tag}</span>
          ))}
        </div>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 8, lineHeight: 1.35 }}>{post.title}</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, flex: 1, marginBottom: 16 }}>{truncate(post.description || post.content, 120)}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--muted2)" }}>
          <span>{formatDate(post.created_at)}</span>
          <span>{readingTime}</span>
        </div>
      </div>
    </div>
  );
}

function BlogPostDetail({ post, onBack }) {
  const readingTime = estimateReadingTime(post.content || post.description);
  return (
    <div style={{ minHeight: "100vh", paddingTop: 80 }}>
      <div className="container blog-detail">
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13, marginBottom: 32, display: "flex", alignItems: "center", gap: 6 }}>
          ← Back to Blog
        </button>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {(post.tags || []).map((tag) => (
            <span key={tag} style={{ padding: "3px 10px", borderRadius: 8, background: "var(--cream2)", fontSize: 11, color: "var(--red)", fontWeight: 600 }}>{tag}</span>
          ))}
        </div>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(24px,4vw,42px)", letterSpacing: "-1px", color: "var(--ink)", marginBottom: 16, lineHeight: 1.15 }}>{post.title}</h1>
        <div className="blog-detail-meta">
          <span>{formatDate(post.created_at)}</span>
          <span>{readingTime}</span>
          {post.category && <span>{post.category}</span>}
        </div>
        {post.featured_image && (
          <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 40 }}>
            <img src={post.featured_image} alt={post.title} style={{ width: "100%", maxHeight: 420, objectFit: "cover" }} />
          </div>
        )}
        <div style={{ fontSize: 15, color: "var(--ink2)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
          {post.content || post.description}
        </div>
      </div>
    </div>
  );
}
