import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

const ROOT = path.resolve(process.cwd());
const BUILD_DIR = path.join(ROOT, 'build');

async function readPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text || '';
}

async function main() {
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }

  const entries = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.pdf'))
    .map((e) => e.name);

  if (entries.length === 0) {
    console.error('No PDF files found in:', ROOT);
    process.exit(1);
  }

  const corpusParts = [];
  const meta = [];
  for (const name of entries) {
    const full = path.join(ROOT, name);
    try {
      const text = await readPdf(full);
      const clean = text.replace(/\r/g, '').trim();
      corpusParts.push(
        `\n===== BEGIN DOCUMENT: ${name} =====\n${clean}\n===== END DOCUMENT: ${name} =====\n`
      );
      meta.push({ file: name, chars: clean.length });
      console.log(`Extracted: ${name} (${clean.length} chars)`);
    } catch (err) {
      console.error(`Failed to read ${name}:`, err.message);
    }
  }

  const corpusPath = path.join(BUILD_DIR, 'pdf_corpus.txt');
  fs.writeFileSync(corpusPath, corpusParts.join('\n'), 'utf8');
  fs.writeFileSync(path.join(BUILD_DIR, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
  console.log('Wrote:', corpusPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

