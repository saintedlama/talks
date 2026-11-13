import { select } from "@inquirer/prompts";
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";
import YAML from "yaml";

const talks = readdirSync(".", { withFileTypes: true })
  .filter(
    (entry) => entry.isDirectory() && existsSync(join(entry.name, "slides.md")),
  )
  .map((entry) => entry.name)
  .sort();

if (talks.length === 0) {
  console.error(
    "No talks found — create a subdirectory with a slides.md to get started.",
  );
  process.exit(1);
}

function getTalkTitle(talkDir) {
  try {
    const slidesPath = join(talkDir, "slides.md");
    if (!existsSync(slidesPath)) return talkDir;
    const content = readFileSync(slidesPath, "utf-8");
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (fmMatch) {
      try {
        const frontmatter = YAML.parse(fmMatch[1]) || {};
        if (frontmatter.title) return frontmatter.title;
      } catch {
        // ignore yaml parsing errors
      }
    }
    const contentAfterFm = fmMatch
      ? content.slice(fmMatch[0].length).trim()
      : content.trim();
    const headingMatch = contentAfterFm.match(/^#\s+(.+)$/m);
    if (headingMatch) return headingMatch[1].trim();
  } catch {
    // fallback
  }
  return talkDir;
}

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`\nTalks CLI Dashboard\n`);
  console.log(`Usage:`);
  console.log(`  npm start                      Interactive talk dashboard`);
  console.log(`  node dashboard.mjs [talk] [action]\n`);
  console.log(`Actions:`);
  console.log(`  present, --open    Present talk in browser (default)`);
  console.log(`  build              Build static site into <talk>/dist`);
  console.log(`  export             Export slides to PDF\n`);
  console.log(`Available Talks:`);
  for (const t of talks) {
    const title = getTalkTitle(t);
    console.log(`  - ${t}: ${title}`);
  }
  console.log();
  process.exit(0);
}

const ACTION_MAP = {
  open: "--open",
  present: "--open",
  "--open": "--open",
  build: "build",
  export: "export",
  pdf: "export",
};

// Check if a talk argument was passed
let talk = args.find((arg) => !arg.startsWith("-") && talks.includes(arg));
const firstNonFlag = args.find((arg) => !arg.startsWith("-"));
if (firstNonFlag && !talk) {
  console.error(`Unknown talk: "${firstNonFlag}"`);
  console.error(`Available talks: ${talks.join(", ")}`);
  process.exit(1);
}

// Check if an action argument was passed
let action;
const actionArg = args.find((arg) => {
  const normalized = arg.toLowerCase().replace(/^--?/, "");
  return normalized in ACTION_MAP || arg in ACTION_MAP;
});
if (actionArg) {
  action =
    ACTION_MAP[actionArg.toLowerCase().replace(/^--?/, "")] ||
    ACTION_MAP[actionArg];
}

// Prompt for talk if not provided via CLI argument
if (!talk) {
  talk = await select({
    message: "Which talk?",
    choices: talks.map((name) => {
      const title = getTalkTitle(name);
      return {
        value: name,
        name: title && title !== name ? `${title} (${name})` : name,
      };
    }),
  });
}

// Prompt for action if not provided via CLI argument
if (!action) {
  action = await select({
    message: `What do you want to do with "${talk}"?`,
    choices: [
      { value: "--open", name: "Present" },
      { value: "build", name: "Build" },
      { value: "export", name: "Export" },
    ],
  });
}

spawn(`npx slidev ${action} ${talk}/slides.md`, {
  stdio: "inherit",
  shell: isWindows(),
});

function isWindows() {
  return process.platform === "win32";
}
