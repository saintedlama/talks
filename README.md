# Talks

Github repository for talks given by @saintedlama.

🌐 **Online Presentations:** [https://saintedlama.github.io/talks/](https://saintedlama.github.io/talks/)

## Available Talks

- [The Hands-Off Maintainer](https://saintedlama.github.io/talks/the-hands-off-maintainer/) — Seamless NPM Releases with OIDC & Release Please

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

You will be prompted to select a talk, then choose one of:

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
npx slidev the-hands-off-maintainer/slides.md

# Build static site
npx slidev build the-hands-off-maintainer/slides.md

# Export to PDF
npx slidev export the-hands-off-maintainer/slides.md
```

## License

Licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](LICENSE).
