import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const BUILD_DIR = path.join(ROOT, 'build');

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + '\n...[truncated]...' : str;
}

function main() {
  const corpusPath = path.join(BUILD_DIR, 'pdf_corpus.txt');
  if (!fs.existsSync(corpusPath)) {
    console.error('Missing corpus. Run "npm run extract-pdfs" first.');
    process.exit(1);
  }
  const corpus = read(corpusPath);
  const promptPath = path.join(BUILD_DIR, 'project_prompt.txt');

  const prompt = [
    'ROLE:',
    '- You are a senior backend engineer and API architect.',
    '',
    'OBJECTIVE:',
    '- Design and implement a production-grade REST API starter aligned with the attached corpus.',
    '- Prioritize clarity, standards compliance, and security best practices.',
    '',
    'REQUIREMENTS:',
    '- Follow resource-oriented design, nouns for resources, plural collection paths.',
    '- Implement semantic HTTP methods, correct status codes, pagination and filtering.',
    '- Enforce validation, consistent error shapes, idempotency for safe methods.',
    '- Provide API versioning (/api/v1), OpenAPI seed, and health endpoints.',
    '- Apply security: Helmet, CORS, rate limiting, input validation, JWT auth skeleton.',
    '- Prepare production readiness: logging, env config, and error boundaries.',
    '',
    'DELIVERABLES:',
    '- A minimal Node.js + Express service with:',
    '  - /api/v1/health (liveness + readiness)',
    '  - /api/v1/items CRUD illustrating patterns (in-memory store ok)',
    '  - Centralized error handler, request logging, rate limiting, validation',
    '  - Versioned routing and OpenAPI starter file',
    '',
    'NON-GOALS:',
    '- Full database integration, full auth flows, and CI/CD; provide stubs.',
    '',
    'IMPLEMENTATION NOTES:',
    '- Use Express with Helmet, CORS, Morgan, express-rate-limit, express-validator.',
    '- Structure by domain: routes/, middleware/, controllers/, lib/, and src/server.js.',
    '',
    'REFERENCE CORPUS (excerpts; do not blindly copy, synthesize into best practices):',
    '----- BEGIN CORPUS -----',
    truncate(corpus, 8000),
    '----- END CORPUS -----',
    '',
    'OUTPUT:',
    '- Provide the code and instructions to run locally.'
  ].join('\n');

  fs.writeFileSync(promptPath, prompt, 'utf8');
  console.log('Wrote:', promptPath);
}

main();

