// Casebook: what the trainers share. Each page loads this before its own app.js.
// Loaded with a plain <script src>, not as a module, so the pages still work opened straight from disk.
// updateView() calls the page's own buildTables(), which app.js defines.

// ---- Small DOM and text helpers ----

const byId = id => document.getElementById(id);

// Typed answers are compared without regard to case, surrounding spaces or Unicode composition.
const normalizeAnswer = text => text.trim().toLowerCase().normalize("NFC").replace(/\s+/g, " ");

// A form like "kollegor/kolleger" accepts either spelling.
const spellings = form => form.split("/");
const accepts = (form, typed) => spellings(form).some(one => normalizeAnswer(one) === normalizeAnswer(typed));

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

// A form with the part that differs from the dictionary form underlined:
// everything after the longest start the two share. "kobiecie" against "kobieta" marks "cie".
function markedForm(form, base) {
  const span = makeElement("span");
  let shared = 0;
  const a = form.toLowerCase(), b = base.toLowerCase();
  while (shared < a.length && shared < b.length && a[shared] === b[shared]) shared++;
  if (shared === form.length) { span.textContent = form; return span; }
  span.append(form.slice(0, shared), makeElement("span", "end", form.slice(shared)));
  return span;
}

// Each accepted spelling, marked, with "or" between them in the page's language
function markedSpellings(forms, base, orWord) {
  const span = makeElement("span");
  spellings(forms).forEach((form, k) => {
    if (k > 0) span.append(" ", withEnglish(makeElement("span", "or", orWord), "or"), " ");
    span.append(markedForm(form, base));
  });
  return span;
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
// first, then red for the wrong ones.
function showProgress(bar, answered, right, total) {
  bar.style.width = (answered / total * 100) + "%";
  bar.style.setProperty("--right", (answered ? right / answered * 100 : 100) + "%");
}

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

// ---- The answer box ----

// Buttons under the answer for letters a keyboard may lack. They type at the cursor
// and leave the focus in the box, so a phone keyboard stays open.
function addLetterKeys(letters, input) {
  const typeLetter = letter => {
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
  addKeysToggle(letters);
}

// On a phone the keys start hidden, as its keyboard has these letters on a long press. A small button
// under the answer shows them, and the choice is remembered for the language, in every game (the
// address ends …/portuguese/, …/polish/ or …/swedish/). On a wider screen the keys always show and
// the button doesn't (trainer.css).
function addKeysToggle(letters) {
  const keys = byId("keys");
  const language = new URL(".", location.href).pathname.split("/").filter(Boolean).pop();
  const storageKey = "tincture-keys-" + language;
  const toggle = makeElement("button", "keytog");
  toggle.id = "keytog";
  toggle.type = "button";
  toggle.setAttribute("aria-controls", "keys");
  toggle.setAttribute("aria-label", keys.getAttribute("aria-label"));
  toggle.innerHTML = '<span></span><svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';
  toggle.firstChild.textContent = letters.length > 3 ? letters.slice(0, 3).join(" ") + " …" : letters.join(" ");
  toggle.addEventListener("mousedown", event => event.preventDefault());
  // An inline style, as a page may use the hidden attribute itself, to hide the keys with the toggle
  // in a game played by buttons
  const show = shown => {
    keys.style.display = shown ? "" : "none";
    toggle.setAttribute("aria-expanded", String(shown));
  };
  let remembered = null;
  try { remembered = localStorage.getItem(storageKey); } catch { /* not remembered */ }
  show(remembered === "shown");
  toggle.onclick = () => {
    const shown = toggle.getAttribute("aria-expanded") !== "true";
    show(shown);
    try { localStorage.setItem(storageKey, shown ? "shown" : "hidden"); } catch { /* not remembered */ }
  };
  keys.before(toggle);
}

function setLetterKeysEnabled(enabled) {
  for (const key of byId("keys").children) key.disabled = !enabled;
}

// Enter checks the answer, then moves on; a held-down Enter doesn't skip ahead.
function onEnter(input, action) {
  input.addEventListener("keydown", event => {
    if (event.key !== "Enter" || event.isComposing) return;
    event.preventDefault();
    if (!event.repeat) action();
  });
}
