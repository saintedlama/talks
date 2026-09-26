import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, resolve } from "node:path";
import YAML from "yaml";

// 1. Determine base path
const repoName = process.env.GITHUB_REPOSITORY
  ? process.env.GITHUB_REPOSITORY.split("/")[1]
  : "talks";

let base = process.env.BASE_PATH || (process.env.GITHUB_ACTIONS ? `/${repoName}/` : "/talks/");
if (!base.startsWith("/")) base = "/" + base;
if (!base.endsWith("/")) base = base + "/";

console.log(`Starting build for GitHub Pages (base: "${base}")...\n`);

// 2. Discover talks
const talks = readdirSync(".", { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(entry.name, "slides.md")))
  .map((entry) => entry.name)
  .sort();

if (talks.length === 0) {
  console.error("No talks found!");
  process.exit(1);
}

// Ensure dist directory exists
const distDir = resolve("dist");
mkdirSync(distDir, { recursive: true });

// Prevent GitHub Pages from running Jekyll
writeFileSync(join(distDir, ".nojekyll"), "");

const talkMetadata = [];

// 3. Build each talk
for (const talk of talks) {
  console.log(`========================================`);
  console.log(`Building talk: ${talk}`);
  console.log(`========================================`);

  const slidesPath = join(talk, "slides.md");
  const content = readFileSync(slidesPath, "utf-8");

  // Parse frontmatter
  let frontmatter = {};
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    try {
      frontmatter = YAML.parse(fmMatch[1]) || {};
    } catch {
      // fallback if YAML parse fails
    }
  }

  // Extract title and description
  const contentAfterFm = fmMatch ? content.slice(fmMatch[0].length).trim() : content.trim();
  const headingMatch = contentAfterFm.match(/^#\s+(.+)$/m);
  const title = frontmatter.title || (headingMatch ? headingMatch[1] : talk);

  let description = frontmatter.description || "";
  if (!description && headingMatch) {
    const afterHeading = contentAfterFm.slice(headingMatch.index + headingMatch[0].length).trim();
    const firstParagraph = afterHeading.split(/\r?\n\r?\n/)[0];
    if (firstParagraph && !firstParagraph.startsWith("#") && !firstParagraph.startsWith("---")) {
      description = firstParagraph.replace(/[\r\n]+/g, " ").trim();
    }
  }

  talkMetadata.push({
    slug: talk,
    title,
    description,
    theme: frontmatter.theme || "default",
    url: `./${talk}/`,
  });

  const talkBase = `${base}${talk}/`;
  const outDir = `../dist/${talk}`;

  try {
    execSync(`npx slidev build "${talk}/slides.md" --base "${talkBase}" --out "${outDir}"`, {
      stdio: "inherit",
    });
  } catch (err) {
    console.error(`Build failed for ${talk}:`, err.message);
    process.exit(1);
  }
}

// 4. Generate landing page index.html
console.log(`\nGenerating landing page in ${distDir}/index.html...`);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Talks & Presentations</title>
  <link rel="icon" href="https://cdn.jsdelivr.net/gh/slidevjs/slidev/assets/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --card-hover-border: #38bdf8;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --accent-gradient: linear-gradient(135deg, #38bdf8, #818cf8);
      --tag-bg: #334155;
      --tag-text: #cbd5e1;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 3.5rem 1.5rem;
      width: 100%;
      flex: 1;
    }

    header {
      margin-bottom: 3.5rem;
      text-align: center;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 500;
      background: rgba(56, 189, 248, 0.1);
      color: var(--accent);
      border: 1px solid rgba(56, 189, 248, 0.3);
      margin-bottom: 1rem;
    }

    h1 {
      font-size: 2.75rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin-bottom: 0.75rem;
      background: var(--accent-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-size: 1.15rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto;
    }

    .talks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.75rem;
    }

    .talk-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      text-decoration: none;
      color: inherit;
    }

    .talk-card:hover {
      transform: translateY(-4px);
      border-color: var(--card-hover-border);
      box-shadow: 0 12px 24px -10px rgba(56, 189, 248, 0.2);
    }

    .talk-header {
      margin-bottom: 1rem;
    }

    .talk-theme-tag {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--tag-bg);
      color: var(--tag-text);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 0.75rem;
    }

    .talk-title {
      font-size: 1.35rem;
      font-weight: 600;
      line-height: 1.3;
      margin-bottom: 0.5rem;
      color: #fff;
    }

    .talk-description {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
      flex: 1;
    }

    .talk-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .talk-link {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--accent);
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .talk-slug {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-family: monospace;
    }

    footer {
      border-top: 1px solid var(--card-border);
      padding: 2rem 1.5rem;
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    footer a {
      color: var(--accent);
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <span class="badge">Slidev Presentations</span>
      <h1>Talks & Presentations</h1>
      <p class="subtitle">Interactive slide decks built with Slidev and published on GitHub Pages.</p>
    </header>

    <main class="talks-grid">
      ${talkMetadata
        .map(
          (talk) => `
        <a class="talk-card" href="${talk.url}">
          <div>
            <div class="talk-header">
              <span class="talk-theme-tag">${talk.theme}</span>
              <h2 class="talk-title">${talk.title}</h2>
            </div>
            ${talk.description ? `<p class="talk-description">${talk.description}</p>` : ""}
          </div>
          <div class="talk-actions">
            <span class="talk-slug">${talk.slug}</span>
            <span class="talk-link">View Slides &rarr;</span>
          </div>
        </a>`
        )
        .join("")}
    </main>
  </div>

  <footer>
    <p>Powered by <a href="https://sli.dev/" target="_blank" rel="noopener">Slidev</a> &bull; Hosted with GitHub Pages</p>
  </footer>
</body>
</html>
`;

writeFileSync(join(distDir, "index.html"), html);
console.log(`\nSuccessfully generated dist/index.html with ${talkMetadata.length} talk(s)!`);
