# PSX: OG Values — GitHub Pages Starter

A static value-list site for Pet Simulator X. No build step, no backend required to run it.

## What's here

- Home page with the latest changes and highest-value pets
- Searchable, filterable Values page (category, variant, sort)
- Pet detail modal
- Trade calculator (add pets to both sides, see who's ahead)
- Admin page for adding/editing pets and pet images, without touching code
- Responsive layout, works down to phone width
- Data saved in the browser via localStorage, plus a JSON export button

## Pet images

Drop images in `assets/pets/` and name them after the pet, lowercase with
dashes instead of spaces — e.g. `Huge Cat` → `assets/pets/huge-cat.png`.
If a pet doesn't have a matching image yet, the site just shows a paw icon
instead, nothing breaks.

You can also add an image straight from the Admin page when adding a new
pet — it gets stored as part of that pet's data in the browser, so it
doesn't need a matching file in `assets/pets/`.

## Admin page

The Admin page lets you add new pets (name, category, variant, value,
demand, release date, emoji, image) and quick-edit existing values and
demand from a table. It's still local-only: edits are saved to whoever's
browser made them, not shared with other visitors. If you want a real
public admin — one where edits show up for everyone — you'll need to
connect it to a backend/database with proper login. Supabase, Firebase,
or a small custom API all work fine for this.

## Run it locally

Open `index.html` directly, or serve it:

```bash
python -m http.server 8000
```

Then go to `http://localhost:8000`.

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, `README.md`, and the `assets` folder.
3. Settings → Pages.
4. Pick the main branch, root folder.
5. Save and wait for it to deploy.

## Replacing the demo values

The starting pet records live near the top of `app.js`, in `seedPets`.
Swap those out for real values before you publish. If the list grows a
lot, it's worth moving the data into its own JSON file (or a real
database) instead of keeping it inline in `app.js`.
