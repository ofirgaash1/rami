# Rami Levy Price-Per-100g Sorter

This repository contains a lightweight Chrome extension that automatically sorts product cards on [rami-levy.co.il](https://www.rami-levy.co.il/) by their price per 100 grams. The logic is implemented as a content script that runs silently in the background and keeps the list sorted even when new items load via infinite scrolling.

## Project structure

```
extension/
├── manifest.json   # Chrome Manifest V3 definition
└── content.js      # Content script that performs the sorting
```

## Installation (Chrome / Edge / Brave)

1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and choose the `extension` folder from this project.
5. Visit any catalog page on `https://www.rami-levy.co.il/` and the products will sort automatically once the page finishes loading.

No browser action or popup is required; the extension simply enhances the catalog listing in-place.
