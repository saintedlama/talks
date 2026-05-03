import { select } from '@inquirer/prompts';
import { readdirSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';

const talks = readdirSync('.', { withFileTypes: true })
  .filter(entry => entry.isDirectory() && existsSync(join(entry.name, 'slides.md')))
  .map(entry => entry.name)
  .sort();

if (talks.length === 0) {
  console.error('No talks found — create a subdirectory with a slides.md to get started.');
  process.exit(1);
}

const talk = await select({
  message: 'Which talk would you like to present?',
  choices: talks.map(name => ({ value: name, name })),
});

spawn(`slidev --open ${talk}/slides.md`, { stdio: 'inherit', shell: true });
