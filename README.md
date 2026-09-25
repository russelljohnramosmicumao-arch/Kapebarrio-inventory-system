# Kape' Bar-Rio Inventory

Offline-ready inventory web app for GitHub Pages.

## Files

- `index.html` — app interface
- `style.css` — responsive two-panel design
- `app.js` — inventory logic, keypad, local storage
- `data.js` — categories and ingredients
- `manifest.json` — PWA configuration for installable app behavior
- `service-worker.js` — offline caching
- `icons/` — PWA install icons

## GitHub Pages

1. Create a GitHub repository.
2. Upload all files in this folder to the repository root.
3. Go to Settings → Pages.
4. Select the branch containing these files and the root folder.
5. Open the generated GitHub Pages URL over HTTPS.
6. On the tablet, open the GitHub Pages URL in a supported browser and use the browser's **Install app** / **Add to Home Screen** option.

## Offline behavior

The app uses a service worker to cache the application files. Open the site online at least once so the browser can install/cache the app before using it offline.

Inventory values are stored in the browser's `localStorage`. Data is local to that browser/device and is not automatically synchronized between devices.

## Adding categories

Add categories and items to `INVENTORY_SEED` in `data.js`. Existing saved inventory is merged with newly added items automatically, so adding a category does not require resetting existing stock.

## Initial thresholds

The thresholds for the newly added categories are provisional starting values. Change them in `data.js` whenever you have your preferred reorder levels.
