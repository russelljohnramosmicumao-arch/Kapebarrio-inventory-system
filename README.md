# Kape' Bar-Rio Inventory v15

Offline-capable inventory web app for Kape' Bar-Rio.

## Features
- All Ingredients view with category navigation and per-category inventory progress.
- Custom on-screen numeric keypad; no device keyboard required.
- Out of Stock status is distinct from an untouched/unchecked zero.
- Low Stocks view with scrollable inventory table, supplier grouping, and order status.
- Previous Inventory view available from the upper-right button.
- Previous Inventory shows the complete prior day's inventory and can be filtered to the current low-stock criteria.
- Inventory automatically rolls over after midnight using the tablet's local date: the previous day's inventory is saved as the snapshot and the current day's inventory starts fresh.
- Container/pack-based ingredients can be entered as whole containers/packs plus an additional ml/gram amount; the app calculates the total automatically.
- Updated supplier data keeps all TikTok-related suppliers grouped as `Tiktok Shop`.
- Offline-ready PWA suitable for GitHub Pages.

## v15 inventory updates
- Added White Bunny Powder.
- Added Avocado Powder.
- Updated all low-stock thresholds to the latest requested criteria.
- Added measurement configurations for syrups, powders, coffee-related stock, cans, bottles, cartons, and packs.
- Bumped the service-worker cache to v15.

## GitHub Pages
Upload/replace the contents of this folder in the GitHub repository and enable GitHub Pages.
Open the Pages URL once while online, then refresh once so the v15 service worker can take over.

## Daily reset behavior
The app does not require the browser to be open at midnight. When the app is next opened after midnight, it detects the new local day, saves the previous day's inventory snapshot, and clears the current day's inventory for a fresh inventory count.

## Low-stock thresholds
Thresholds are stored in each ingredient's base unit in `data.js`. Examples:
- Sweetener Syrup: 500 ml
- Milk essence: 3 packs = 3,000 g
- Matcha Powder (Premium): 100 g
- Condensed Milk: 2 cans = 2,000 g
- Brush: 0 pcs

## Supplier organization
Low-stock items are grouped by supplier. All supplier names containing TikTok are normalized to `Tiktok Shop`, including existing saved localStorage data.

## Measurement entry
For configured container/pack items, the editor shows two selectable fields:
1. Whole containers/packs/cans/bottles/cartons.
2. Additional ml or grams.

Example: `1 Container + 300 ml` for a 2.5-liter syrup container is saved as `2,800 ml` automatically. The same calculation is used for low-stock checks and inventory history.
