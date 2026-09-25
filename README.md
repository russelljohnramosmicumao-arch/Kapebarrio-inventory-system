# Kape' Bar-Rio Inventory

Offline-capable inventory web app for Kape' Bar-Rio.

## Features
- All Ingredients view with category navigation and per-category inventory progress.
- Custom on-screen numeric keypad; no device keyboard required.
- Out of Stock status is distinct from an untouched/unchecked zero.
- Low Stocks view with scrollable inventory table and order status.
- Previous Inventory view available from the upper-right button.
- Previous Inventory shows the complete prior day's inventory and can be filtered to Out of Stock only.
- Inventory automatically rolls over after midnight using the tablet's local date: the previous day's inventory is saved as the snapshot and the current day's inventory starts fresh.
- Offline-ready PWA suitable for GitHub Pages.

## GitHub Pages
Upload the contents of this folder to a GitHub repository and enable GitHub Pages.
Open the Pages URL once while online so the service worker can cache the app.

## Daily reset behavior
The app does not require the browser to be open at midnight. When the app is next opened after midnight, it detects the new local day, saves the previous day's inventory snapshot, and clears the current day's inventory for a fresh inventory count.
