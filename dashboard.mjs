import { select } from "@inquirer/prompts";
import { readdirSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, resolve } from "node:path";

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

const talk = await select({
  message: "Which talk?",
  choices: talks.map((name) => ({ value: name, name })),
});

const action = await select({
  message: `What do you want to do with "${talk}"?`,
  choices: [
    { value: "--open", name: "Present" },
    { value: "build", name: "Build" },
    { value: "export", name: "Export" },
  ],
});

spawn(`npx slidev ${action} ${talk}/slides.md`, {
  stdio: "inherit",
  shell: isWindows(),
});

function isWindows() {
  return process.platform === "win32";
}
