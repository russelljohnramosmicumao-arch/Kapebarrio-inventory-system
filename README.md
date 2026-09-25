# Kape' Bar-Rio Inventory

Offline-ready inventory web app for GitHub Pages.

## Files

- `index.html` — app interface
- `style.css` — responsive two-panel design
- `app.js` — inventory logic, keypad, local storage
- `data.js` — categories and ingredients
- `manifest.json` — PWA configuration
- `service-worker.js` — offline caching

## Run locally

Open `index.html` in a browser. For full PWA/service-worker behavior, use a local server.

## GitHub Pages

1. Create a GitHub repository.
2. Upload all files in this folder to the repository root.
3. Go to Settings → Pages.
4. Select the branch containing these files and the root folder.
5. Open the generated GitHub Pages URL.

## Important

Inventory values are stored in the browser's `localStorage`. That means data is local to the browser/device and is not automatically synchronized between devices.

The initial stock for every item is 0. Thresholds are configured in `data.js`.

To add more categories later, add another category object to `INVENTORY_SEED`.
