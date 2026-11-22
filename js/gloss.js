// Polynoun: English on hover.
// Any element with a data-en attribute shows that English text in a small slip above it
// while the mouse rests on it. Pages set data-en in their markup, or in script for text
// that changes. Only devices with a real mouse get this; touch screens never show it.
(function () {
  if (!window.matchMedia || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;

  const MARGIN = 8, GAP = 6;               // px from the window edge, and between slip and element
  const FIRST_DELAY = 350, NEXT_DELAY = 40; // ms before a slip shows; shorter when moving from one to the next
  const MOVING_ON = 400;                    // ms after a slip hides in which the next counts as "moving on"

  const slip = document.createElement("div");
  slip.className = "gloss";
  slip.lang = "en";
  slip.setAttribute("aria-hidden", "true");
  document.body.appendChild(slip);

  let target = null, showTimer = 0, lastHiddenAt = 0;

  // Centred above the element, kept inside the window; below it when there is no room above.
  function position() {
    const box = target.getBoundingClientRect();
    const windowWidth = document.documentElement.clientWidth;
    const left = Math.max(MARGIN, Math.min(box.left + box.width / 2 - slip.offsetWidth / 2, windowWidth - slip.offsetWidth - MARGIN));
    let top = box.top - slip.offsetHeight - GAP;
    if (top < MARGIN) top = box.bottom + GAP;
    slip.style.left = left + "px";
    slip.style.top = top + "px";
  }

  function show() {
    if (!target || !target.isConnected || !target.dataset.en) return hide();
    slip.textContent = target.dataset.en;
    position();
    slip.classList.add("on");
  }

  function hide() {
    clearTimeout(showTimer);
    if (slip.classList.contains("on")) lastHiddenAt = Date.now();
    target = null;
    slip.classList.remove("on");
  }

  document.addEventListener("pointerover", event => {
    if (event.pointerType === "touch") return;
    const hovered = event.target.closest ? event.target.closest("[data-en]") : null;
    if (hovered === target) return;
    hide();
    if (!hovered) return;
    target = hovered;
    const movingOn = Date.now() - lastHiddenAt < MOVING_ON;
    showTimer = setTimeout(show, movingOn ? NEXT_DELAY : FIRST_DELAY);
  });
  document.addEventListener("pointerout", event => {
    if (target && !target.contains(event.relatedTarget)) hide();
  });
  document.addEventListener("pointerdown", hide);
  document.addEventListener("keydown", hide);
  addEventListener("scroll", hide, true);
  addEventListener("blur", hide);
})();
