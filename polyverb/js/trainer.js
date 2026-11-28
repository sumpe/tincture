// Polyverb: what the three trainers share. Each page loads this before its own app.js.
// Loaded with a plain <script src>, not as a module, so the pages still work opened straight from disk.
// updateView() calls the page's own buildTables(), which app.js defines.

// ---- Small DOM and text helpers ----

const byId = id => document.getElementById(id);

// Typed answers are compared without regard to case, surrounding spaces or Unicode composition.
const normalizeAnswer = text => text.trim().toLowerCase().normalize("NFC").replace(/\s+/g, " ");

// A shuffled copy (Fisher–Yates); the original array is left alone.
function shuffled(items) {
  const copy = items.slice();
  for (let k = copy.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [copy[k], copy[j]] = [copy[j], copy[k]];
  }
  return copy;
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = text;
  return element;
}

// The English that gloss.js shows on hover
function withEnglish(element, english) {
  element.dataset.en = english;
  return element;
}

function setText(element, text, english) {
  element.textContent = text;
  return withEnglish(element, english);
}

// "a or b or c", with each "or" in the page's language
function appendAlternatives(element, forms, orWord) {
  forms.forEach((form, k) => {
    if (k > 0) element.append(" ", withEnglish(makeElement("span", "or", orWord), "or"), " ");
    element.append(form);
  });
}

// ---- Choice buttons ----

function setPressed(button, pressed) {
  button.classList.toggle("on", pressed);
  button.setAttribute("aria-pressed", String(pressed));
}

// A row of buttons in the markup where exactly one is on; onChoose gets the button's data-v.
function singleChoice(groupId, onChoose) {
  const buttons = document.querySelectorAll(`#${groupId} button`);
  buttons.forEach(button => {
    button.onclick = () => {
      onChoose(button.dataset.v);
      buttons.forEach(other => setPressed(other, other === button));
    };
  });
}

// Buttons for picking any number of options, but never none.
// getChosen() returns the chosen option values; setChosen(values) stores a new choice.
function multiChoice(container, options, getChosen, setChosen) {
  const buttons = options.map(({ value, label, english }) => {
    const button = makeElement("button", null, label);
    if (english) withEnglish(button, english);
    button.onclick = () => {
      const chosen = getChosen();
      if (!chosen.includes(value)) setChosen(chosen.concat(value));
      else if (chosen.length > 1) setChosen(chosen.filter(v => v !== value));
      paint();
    };
    container.appendChild(button);
    return button;
  });
  function paint() {
    buttons.forEach((button, k) => setPressed(button, getChosen().includes(options[k].value)));
  }
  paint();
  return paint;
}

// The progress bar: as long as the share of questions answered, green for the right answers
// first, amber for slips (right answers with a typo, counted among the right ones), then red for
// the wrong ones.
function showProgress(bar, answered, right, total, slips = 0) {
  bar.style.width = (answered / total * 100) + "%";
  bar.style.setProperty("--right", (answered ? right / answered * 100 : 100) + "%");
  bar.style.setProperty("--clean", (answered ? (right - slips) / answered * 100 : 100) + "%");
}

// ---- Phones ----

// While a phone's keyboard is up, the page takes a compact layout (body.kb), and the question card is
// scrolled to the top of what the keyboard leaves, keeping the answer in sight; left to itself, the
// browser scrolls only as far as the answer and can leave the verb under the status bar.
(function () {
  const viewport = window.visualViewport;
  if (!viewport) return;
  const isTyping = () => document.activeElement?.matches("input[type=text]") ?? false;
  function bringQuestionIntoView() {
    const quiz = byId("quiz"), field = document.activeElement;
    if (!quiz || quiz.hidden || !isTyping()) return;
    const statusBar = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
    const top = viewport.offsetTop + statusBar, bottom = viewport.offsetTop + viewport.height;
    const toCardTop = quiz.getBoundingClientRect().top - top - 6;
    const toKeepField = field.getBoundingClientRect().bottom - bottom + 10;
    const shift = Math.round(Math.max(toCardTop, toKeepField));
    if (shift) window.scrollBy(0, shift);
  }
  function update() {
    const keyboardUp = isTyping() && viewport.height < document.documentElement.clientHeight * 0.8;
    document.body.classList.toggle("kb", keyboardUp);
    if (keyboardUp) requestAnimationFrame(bringQuestionIntoView);
  }
  viewport.addEventListener("resize", update);
  document.addEventListener("focusin", () => { update(); setTimeout(update, 350); });
  document.addEventListener("focusout", () => setTimeout(update, 100));
})();

// ---- Sections ----

// Setup, quiz or results; or the tables, whenever the address ends in #tables.
// A tables section marked data-wide widens the page.
let currentSection = "setup";

function updateView() {
  const onTables = location.hash === "#tables";
  for (const id of ["setup", "quiz", "done"]) byId(id).hidden = onTables || id !== currentSection;
  byId("tbl-view").hidden = !onTables;
  byId("sub").hidden = onTables;
  document.body.classList.toggle("play", !onTables && currentSection !== "setup");
  document.body.classList.toggle("wide", onTables && "wide" in byId("tbl-view").dataset);
  markCurrentTab(byId("tab-game"), !onTables);
  markCurrentTab(byId("tab-tables"), onTables);
  if (onTables) buildTables();
  window.scrollTo(0, 0);
}

function markCurrentTab(tab, isCurrent) {
  if (isCurrent) tab.setAttribute("aria-current", "page");
  else tab.removeAttribute("aria-current");
}

function showSection(id) {
  currentSection = id;
  updateView();
}

// ---- Letter keys ----

// Buttons under the answer for letters a keyboard may lack. They type at the cursor of
// getTargetInput() and leave the focus there, so a phone keyboard stays open.
function addLetterKeys(letters, getTargetInput) {
  const typeLetter = letter => {
    const input = getTargetInput();
    if (input.readOnly) return;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    input.setRangeText(letter, start, end, "end");
    input.focus();
  };
  for (const letter of letters) {
    const key = makeElement("button", null, letter);
    key.type = "button";
    key.addEventListener("mousedown", event => event.preventDefault());
    key.addEventListener("touchstart", event => { event.preventDefault(); typeLetter(letter); }, { passive: false });
    key.onclick = () => typeLetter(letter);
    byId("keys").appendChild(key);
  }
}

function setLetterKeysEnabled(enabled) {
  for (const key of byId("keys").children) key.disabled = !enabled;
}

// ---- The question card (Portuguese and Polish) ----

// The little timeline beside the tense: a dot for now, arrows for the past or the future.
const TIMELINE_MARKS = {
  present: '<circle class="d" cx="26" cy="7" r="3.5"/>',
  past: '<path class="m" d="M26 7H6M11 2.5 6 7l5 4.5"/>',
  pluperfect: '<path class="m" d="M26 7H4M9 2.5 4 7l5 4.5M15 2.5 10 7l5 4.5"/>',
  future: '<path class="m" d="M26 7H46M41 2.5 46 7l-5 4.5"/>',
  conditional: '<path class="m dash" d="M26 7H43"/><path class="m" d="M41 2.5 46 7l-5 4.5"/>'
};
const timelineSvg = mark =>
  '<line class="b" x1="2" y1="7" x2="50" y2="7"/><line class="n" x1="26" y1="2" x2="26" y2="12"/>' + TIMELINE_MARKS[mark];

// The six persons as a grid of dots, singular in the left column and plural in the right
function highlightPerson(grid, person) {
  const row = person % 3, column = person >= 3 ? 1 : 0;
  [...grid.children].forEach((dot, k) => dot.classList.toggle("on", k === row * 2 + column));
}
