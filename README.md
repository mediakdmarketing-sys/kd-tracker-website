# WorkBuddy website

A fast, single-page introduction site for WorkBuddy. Plain HTML, CSS and JavaScript: no build step, no dependencies.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Change the name, links and contact email

Everything you will want to change is at the top of `js/main.js`:

```js
const SITE = {
  brand: 'WorkBuddy',
  appUrl: 'https://app.example.com/login',   // the "Sign in" link: your deployed web app
  contactEmail: 'hello@example.com',         // where the demo form sends mail
};
```

Every place the product name appears is marked `data-brand`, so renaming the product is a one-line change.
Update the page title and `og:` tags in `index.html` too if you rename it.

## Motion design

All motion is plain CSS and a small script in js/main.js (no animation library):

- **Layered parallax**: elements marked data-speed drift at their own speed as you scroll, and data-depth layers also shift with the pointer in the hero.
- **Masked word reveal**: headings marked data-split are split into words that rise out of a clip, one after another.
- **Scroll-driven product reveal**: the live-board preview sits in a sticky stage and tilts flat as you scroll through it, with cards flying in from the sides.
- **Ghost words**: giant faint words behind section headings slide sideways (data-dx).
- **Honeycomb spotlight**: the privacy section's hex lattice lights up in gold around the pointer (and wanders on its own on touch screens).
- **Marquee, drawing timeline, scroll clock, count-up numbers, scroll-spy nav, progress bar.**

Everything is switched off for visitors who prefer reduced motion.

## Deploy

Any static host works: Vercel, Netlify, Cloudflare Pages, GitHub Pages. Point it at this folder (no build command, output directory `.`).

## Files

- `index.html`: all the content
- `css/styles.css`: design, animations, light and dark themes, responsive layout
- `js/main.js`: settings, scroll reveal, counters, live clocks, role tabs, demo form
- `assets/`: logo and icons
