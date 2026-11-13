# Talks

Github repository for talks given by @saintedlama.

🌐 **Online Presentations:** [https://saintedlama.github.io/talks/](https://saintedlama.github.io/talks/)

## Available Talks

- [The Hands-Off Maintainer](https://saintedlama.github.io/talks/the-hands-off-maintainer/) — Seamless NPM Releases with OIDC & Release Please
- [How GitHub fucked up security (and keeps doing it)](https://saintedlama.github.io/talks/github-security/) — A Story about Supply Chain Attacks

## Getting started

Install dependencies once:

```bash
npm install
```

## Dashboard

The interactive dashboard lets you pick a talk and an action:

```bash
npm start
```

You can also pass arguments directly or view usage:

```bash
# Interactive selection
npm start

# Direct CLI execution
node dashboard.mjs github-security present
node dashboard.mjs github-security build
node dashboard.mjs github-security export

# Show help & available talks
node dashboard.mjs --help
```

You will be prompted to select a talk (if not specified as an argument), then choose one of:

- **Present** — starts the Slidev dev server and opens the slides in the browser
- **Build** — builds the slides as a static site into the talk's `dist/` folder
- **Export** — exports the slides to a PDF file

## Adding a talk

Create a subdirectory with a `slides.md` file and it will appear in the dashboard and GitHub Pages build automatically:

```
talks/
  my-new-talk/
    slides.md
```

## GitHub Pages

All talks are automatically built and published to GitHub Pages at [https://saintedlama.github.io/talks/](https://saintedlama.github.io/talks/) upon pushing to `main` via [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

To build the static site and landing page locally:

```bash
node build-pages.mjs
```

The output will be placed in `dist/` with a root `index.html` landing page linking to each talk.

## Running Slidev directly

You can also use the Slidev CLI directly for a specific talk:

```bash
# Present
npx slidev github-security/slides.md
npx slidev the-hands-off-maintainer/slides.md

# Build static site
npx slidev build github-security/slides.md
npx slidev build the-hands-off-maintainer/slides.md

# Export to PDF
npx slidev export github-security/slides.md
npx slidev export the-hands-off-maintainer/slides.md
```

## Credits

- Cover photo for *How GitHub fucked up security (and keeps doing it)*: Photo by <a href="https://unsplash.com/@oculareuphoria?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Martin Podsiad</a> on <a href="https://unsplash.com/photos/police-cars-on-dark-residential-street-wrdtA9lew9E?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

## License

Licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](LICENSE).
