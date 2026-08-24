# PSX Values

A static value list site for Pet Simulator X. No build step, no backend
required to run it.

## What's here

- Home page with recent value movement and the highest-value pets
- Searchable, filterable Values page (category, variant, sort)
- Pet detail popup
- Trade calculator — add pets to both sides, see who's ahead
- Responsive layout, works down to phone width

## Where the data lives

Everything the site shows — every pet, its value, and the change log —
comes from `data.json`. There's no admin panel and nothing is stored in
the browser. To update a value, rename a pet, or add a new one, edit
`data.json` directly and commit it. The site always reflects exactly
what's in that file.

`data.json` has two arrays:

- `seedPets` — the pet list itself (name, category, variant, value,
  demand, release date, emoji, recent % change)
- `defaultChanges` — the "recent movement" entries shown on the home
  page

## Pet images

Drop images in `assets/pets/` and name them after the pet, lowercase
with dashes instead of spaces — e.g. `Huge Cat` → `assets/pets/huge-cat.png`.
That's the only step; the site looks for a matching filename
automatically. If a pet doesn't have an image yet, it just shows a paw
icon instead — nothing breaks.

## Run it locally

Serve the folder instead of opening `index.html` directly — the site
fetches `data.json`, and browsers block that over `file://`.

```bash
python -m http.server 8000
```

Then go to `http://localhost:8000`.

## Publish on GitHub Pages

1. Push `index.html`, `styles.css`, `app.js`, `data.json`, and the
   `assets` folder to a GitHub repo.
2. Settings → Pages.
3. Pick the branch you pushed to, root folder.
4. Save and wait for it to deploy — check the Actions tab for progress.

Edits to `data.json` go live the same way: commit, push, wait for the
Pages deploy to finish, then hard-refresh the site.
