# Talks

Github repository for talks given by @saintedlama.

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

Create a subdirectory with a `slides.md` file and it will appear in the dashboard automatically:

```
talks/
  my-new-talk/
    slides.md
```

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
