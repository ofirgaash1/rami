// Content script injected on rami-levy.co.il catalog pages.
// Automatically sorts product cards by their price per 100 grams.

const CONTAINER_SELECTOR = '.online-catalog-wrap';
const PRODUCT_CARD_SELECTOR = '.product-flex';

let observer = null;
let isSorting = false;

/**
 * Extracts the price per 100 grams from the provided text.
 * The site uses strings such as "2.63 ל-100 גרם".
 * @param {string} text
 * @returns {number} price per 100 grams or Infinity when not found
 */
function parsePriceFromText(text) {
  if (!text) {
    return Infinity;
  }

  const normalized = text.replace(/,/g, '.');
  const match = normalized.match(/([\d.]+)\s*(?:₪)?\s*ל?-?\s*100\s*גרם/);
  if (!match) {
    return Infinity;
  }

  const value = parseFloat(match[1]);
  return Number.isFinite(value) ? value : Infinity;
}

/**
 * Finds the text that contains the price per 100 grams within a product card
 * and converts it into a numeric value.
 * @param {Element} card
 * @returns {number}
 */
function extractPricePer100g(card) {
  if (!card) {
    return Infinity;
  }

  const spans = card.querySelectorAll('span');
  for (const span of spans) {
    const text = span.textContent?.trim();
    if (text && /100\s*גרם/.test(text)) {
      return parsePriceFromText(text);
    }
  }

  return Infinity;
}

/**
 * Sorts product cards within the container by their price per 100 grams.
 */
function sortProductCards() {
  const container = document.querySelector(CONTAINER_SELECTOR);
  if (!container || isSorting) {
    return;
  }

  const cards = Array.from(container.querySelectorAll(PRODUCT_CARD_SELECTOR));
  if (cards.length === 0) {
    return;
  }

  isSorting = true;
  try {
    cards
      .map((card) => ({ card, price: extractPricePer100g(card) }))
      .sort((a, b) => a.price - b.price)
      .forEach(({ card }) => container.appendChild(card));
  } finally {
    isSorting = false;
  }
}

/**
 * Sets up a MutationObserver so we can re-sort whenever infinite scrolling
 * adds new product cards to the DOM.
 */
function setupObserver() {
  if (observer) {
    return;
  }

  const container = document.querySelector(CONTAINER_SELECTOR);
  if (!container) {
    return;
  }

  observer = new MutationObserver((mutations) => {
    if (isSorting) {
      return;
    }

    const shouldResort = mutations.some((mutation) => {
      return Array.from(mutation.addedNodes).some((node) => {
        if (!(node instanceof HTMLElement)) {
          return false;
        }

        return (
          node.matches?.(PRODUCT_CARD_SELECTOR) ||
          node.querySelector?.(PRODUCT_CARD_SELECTOR)
        );
      });
    });

    if (shouldResort) {
      sortProductCards();
    }
  });

  observer.observe(container, { childList: true, subtree: true });
}

/**
 * Initializes the sorter when the page is ready.
 */
function init() {
  sortProductCards();
  setupObserver();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
