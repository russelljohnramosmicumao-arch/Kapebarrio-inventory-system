# Kape' Bar-Rio Inventory

Offline-capable inventory management app for Kape' Bar-Rio, designed for GitHub Pages and touchscreen/tablet use.

## v6 changes
- All Ingredients is split into a category navigation pane and an ingredient list pane.
- Selected category is highlighted black with white text.
- A green check mark appears beside a category when every ingredient in that category has a recorded inventory timestamp.
- Low Stocks still expands to the full panel and keeps the four-column order table.
- Numeric keypad replaces the C button with an **Out of Stock** button.
- The Out of Stock button sets the current value to 0 and records the inventory check when UPDATE is pressed.
- An untouched zero remains distinguishable by its missing inventory timestamp, meaning it can represent skipped/not-yet-checked stock.
- Existing localStorage inventory data is preserved.

## GitHub Pages / offline
1. Upload all files in this folder to a GitHub repository.
2. Enable GitHub Pages for the repository.
3. Open the published page once while online.
4. Install the app from a supported browser.
5. Reopen the installed app after the service worker has cached the files.

The app stores inventory data in the browser's localStorage and works offline after the service worker has been installed and the app files have been cached.
