// Content script injected on rami-levy.co.il catalog pages.
// Automatically sorts product cards by their price per 100 grams and keeps
// the list ordered as infinite scrolling fetches more items.

const CONTAINER_SELECTOR = '.online-catalog-wrap';
const PRODUCT_CARD_SELECTOR = '.product-flex';

let containerElement = null;
let containerObserver = null;
let documentObserver = null;
let isSorting = false;
let scheduledSortHandle = null;
const scheduleCallback =
  typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (cb) => window.setTimeout(cb, 50);

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
  const container = ensureContainer();
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
 * Schedules a sort on the next animation frame (or timeout fallback) so that
 * multiple DOM mutations collapse into a single reorder.
 */
function scheduleSort() {
  if (scheduledSortHandle !== null || isSorting) {
    return;
  }

  scheduledSortHandle = scheduleCallback(() => {
    scheduledSortHandle = null;
    sortProductCards();
  });
}

/**
 * Ensures we keep a reference to the catalog container and (re)attaches the
 * mutation observer whenever the site swaps out that element.
 * @returns {Element | null}
 */
function ensureContainer() {
  const nextContainer = document.querySelector(CONTAINER_SELECTOR);
  if (!nextContainer) {
    detachContainerObserver();
    containerElement = null;
    return null;
  }

  if (containerElement === nextContainer) {
    return containerElement;
  }

  containerElement = nextContainer;
  attachContainerObserver();
  return containerElement;
}

function detachContainerObserver() {
  if (containerObserver) {
    containerObserver.disconnect();
    containerObserver = null;
  }
}

function attachContainerObserver() {
  detachContainerObserver();
  if (!containerElement) {
    return;
  }

  containerObserver = new MutationObserver((mutations) => {
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
      scheduleSort();
    }
  });

  containerObserver.observe(containerElement, {
    childList: true,
    subtree: true,
  });
}

function setupDocumentObserver() {
  if (documentObserver || !document.body) {
    return;
  }

  documentObserver = new MutationObserver(() => {
    const container = ensureContainer();
    if (container) {
      scheduleSort();
    }
  });

  documentObserver.observe(document.body, { childList: true, subtree: true });
}

/**
 * Initializes the sorter when the page is ready.
 */
function init() {
  ensureContainer();
  setupDocumentObserver();
  scheduleSort();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
