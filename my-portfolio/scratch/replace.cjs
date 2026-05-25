const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.jsx', 'utf8');

// Replace standard colors
code = code.replace(/color:\s*["']rgba\(255,255,255,0\.[23456]+["']/g, 'color: "var(--muted)"');
code = code.replace(/color:\s*["']#fff["']/gi, 'color: "var(--ink)"');
code = code.replace(/color:\s*["']#ffffff["']/gi, 'color: "var(--ink)"');
code = code.replace(/background:\s*["']rgba\(255,255,255,0\.0[3-6]+["']/g, 'background: "#fff"');
code = code.replace(/border(?:Bottom|Top|Right|Left)?:\s*["']1px solid rgba\(255,255,255,0\.[0-9]+["']/g, match => match.replace(/rgba\(255,255,255,0\.[0-9]+\)/, 'var(--border)'));
code = code.replace(/background: "#080810"/g, 'background: "var(--cream)"');
code = code.replace(/background: "rgba\(8,8,16,0.95\)"/g, 'background: "var(--cream)"');

fs.writeFileSync('src/pages/AdminPage.jsx', code);
