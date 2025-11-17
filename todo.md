

**Build a complete Chrome extension that automatically sorts product cards on the Rami Levy website ([https://www.rami-levy.co.il/](https://www.rami-levy.co.il/)) by price per 100 grams, from lowest to highest.
Requirements:**

1. **Detect and sort product elements**

   * Product elements are the `<div class="product-flex">` cards.
   * Each card contains a `<span>` with text like `"2.63 ל-100 גרם"` or similar Hebrew format.
   * Extract the numeric price-per-100g value using regex and convert it to a float.
   * Sort the cards ascending by that value.
   * Reinsert the sorted elements back into their parent container `.online-catalog-wrap`.

2. **Trigger conditions**

   * Execute automatically once the page is fully loaded.
   * Support infinite scrolling (use a `MutationObserver` to re-sort whenever new items load).

3. **Extension structure**

   * Manifest V3
   * Files required:

     * `manifest.json`
     * `content.js`
   * No UI needed. The script should run silently.

4. **manifest.json** should:

   * Match all pages on `https://www.rami-levy.co.il/*`
   * Load content script with `"run_at": "document_idle"`

5. **content.js** should include:

   * Function to extract price per 100g
   * Sorting logic
   * Auto-run on page load
   * MutationObserver that re-sorts whenever products are added to the DOM
   * Defensive coding: skip invalid values, treat missing price as `Infinity`

6. **Output required**

   * Provide the full extension folder with all files
   * Include inline comments explaining each part
   * Provide installation instructions
   * Make sure the solution actually works with the real site’s HTML structure and class names?
