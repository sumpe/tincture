// Polyverb, Swedish: the game and the tables. Shared helpers are in ../trainer.js.
// Each question shows an infinitive; the player types its three principal parts.

// ---- Words on the page ----

const PARTS = ["presens", "preteritum", "supinum"];
const PARTS_EN = ["present", "past", "supine"];
const INFINITIVE = -1; // where a typed form is the infinitive rather than one of the three parts

const CONJUGATION_BUTTONS = ["Första", "Andra", "Tredje", "Fjärde"];
const CONJUGATION_BUTTONS_EN = ["First", "Second", "Third", "Fourth"];
const CONJUGATION_NAMES = ["första konjugationen", "andra konjugationen", "tredje konjugationen", "fjärde konjugationen"];
const CONJUGATION_NAMES_EN = ["1st conjugation", "2nd conjugation", "3rd conjugation", "4th conjugation: strong and irregular"];
const ORDINALS = ["första", "andra", "tredje", "fjärde"];
const ORDINALS_EN = ["first", "second", "third", "fourth"];

// ---- The verbs ----

// verbs.js lists each verb as [infinitive, presens, preteritum, supinum, conjugation 1–4, English].
const toVerb = common => ([infinitive, present, past, supine, conjugation, english]) =>
  ({ infinitive, parts: [present, past, supine], conjugation: conjugation - 1, english, common });
const VERBS = COMMON_VERBS.map(toVerb(true)).concat(RARER_VERBS.map(toVerb(false)));

// A part like "sa/sade" accepts either spelling.
const spellings = part => part.split("/");
const accepts = (part, typed) => spellings(part).some(form => normalizeAnswer(form) === normalizeAnswer(typed));
const showSpellings = part => part.replace("/", " / ");

// Every form of every verb, infinitives included, so a wrong answer can be traced to where it belongs.
const FORMS = new Map(); // normalized form → [{ verb, part }]
for (const verb of VERBS) {
  [verb.infinitive, ...verb.parts].forEach((forms, k) => {
    for (const form of spellings(forms)) {
      const key = normalizeAnswer(form);
      if (!FORMS.has(key)) FORMS.set(key, []);
      FORMS.get(key).push({ verb, part: k - 1 });
    }
  });
}

// What a wrong answer in the box for `part` really is: up to two { verb, parts }, or null.
// Forms of the verb that was asked about win over look-alikes from other verbs.
function identifyForm(askedVerb, part, typed) {
  const found = typed && FORMS.get(normalizeAnswer(typed));
  if (!found) return null;
  const partsByVerb = new Map();
  for (const match of found) {
    if (match.verb === askedVerb && match.part === part) continue;
    if (!partsByVerb.has(match.verb)) partsByVerb.set(match.verb, []);
    const parts = partsByVerb.get(match.verb);
    if (!parts.includes(match.part)) parts.push(match.part);
  }
  let matches = [...partsByVerb].map(([verb, parts]) => ({ verb, parts }));
  const ofAskedVerb = matches.filter(match => match.verb === askedVerb);
  if (ofAskedVerb.length) matches = ofAskedVerb;
  return matches.length ? matches.slice(0, 2) : null;
}

// "a", "a och b", "a, b och c"
function joinList(items, andWord) {
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " " + andWord + " " + items[items.length - 1];
}

// The matches said in Swedish, "preteritum av ”se”", and in English, "the past of “se” (to see)"
function describeInSwedish(matches, askedVerb) {
  return matches.map(({ verb, parts }) => {
    const names = joinList(parts.map(part => part === INFINITIVE ? "infinitiv" : PARTS[part]), "och");
    return verb === askedVerb ? names : `${names} av ”${verb.infinitive}”`;
  }).join(" eller ");
}

function describeInEnglish(matches, askedVerb) {
  return matches.map(({ verb, parts }) => {
    const names = "the " + joinList(parts.map(part => part === INFINITIVE ? "infinitive" : PARTS_EN[part]), "and");
    return verb === askedVerb ? names : `${names} of “${verb.infinitive}” (${verb.english})`;
  }).join(" or ");
}

// ---- The page ----

const answerInputs = [byId("f0"), byId("f1"), byId("f2")];
const correctAnswers = [byId("r0"), byId("r1"), byId("r2")];
const progress = byId("prog"), scoreLabel = byId("score"), progressBar = byId("fill");
const verbLabel = byId("verb"), feedback = byId("fb"), mainButton = byId("go");

// ---- Settings ----

let questionCount = 20;
let chosenConjugations = [0, 1, 2, 3];
let verbSet = "common"; // or "all", the rare verbs too
let tableConjugation = 0;

singleChoice("seg", value => { questionCount = Number(value); });
singleChoice("which", value => { verbSet = value; });
singleChoice("tconj", value => { tableConjugation = Number(value); buildTables(); });

multiChoice(
  byId("conj"),
  CONJUGATION_BUTTONS.map((label, k) => ({ value: k, label, english: CONJUGATION_BUTTONS_EN[k] + " conjugation" })),
  () => chosenConjugations,
  chosen => { chosenConjugations = chosen.sort(); showVerbCounts(); }
);

// How many verbs each choice gives, for the conjugations picked
function showVerbCounts() {
  const inChosen = VERBS.filter(verb => chosenConjugations.includes(verb.conjugation));
  const common = inChosen.filter(verb => verb.common);
  byId("w-common").textContent = `Vanliga (${common.length})`;
  byId("w-all").textContent = `Alla (${inChosen.length})`;
}
showVerbCounts();

// The letter keys type into whichever answer box was used last.
let lastUsedInput = answerInputs[0];
addLetterKeys(["å", "ä", "ö"], () => lastUsedInput);

// ---- The round ----

let questions = [], questionIndex = 0, score = 0, mistakes = [];
let phase = ""; // "ask" while the player types, "review" while the answer shows

function startRound() {
  const eligible = VERBS.filter(verb =>
    chosenConjugations.includes(verb.conjugation) && (verbSet === "all" || verb.common));
  questions = shuffled(eligible).slice(0, questionCount);
  questionIndex = 0;
  score = 0;
  mistakes = [];
  showSection("quiz");
  showQuestion();
}

function showScore() {
  setText(scoreLabel, `Poäng ${score}`, `Score ${score}`);
}

function showQuestion() {
  const verb = questions[questionIndex];
  const number = questionIndex + 1, total = questions.length;
  phase = "ask";
  setText(progress, `Fråga ${number} av ${total}`, `Question ${number} of ${total}`);
  showScore();
  progressBar.style.width = (questionIndex / total * 100) + "%";
  setText(verbLabel, verb.infinitive, verb.english);
  answerInputs.forEach((input, k) => {
    input.value = "";
    input.readOnly = false;
    input.className = "";
    correctAnswers[k].textContent = "";
  });
  setLetterKeysEnabled(true);
  feedback.hidden = true;
  setText(mainButton, "Kontrollera", "Check");
  answerInputs[0].focus();
}

function checkAnswer() {
  const verb = questions[questionIndex];
  const typed = answerInputs.map(input => input.value.trim());
  const right = typed.map((answer, k) => !!answer && accepts(verb.parts[k], answer));
  const allRight = right.every(Boolean);
  if (allRight) score++;
  else mistakes.push({ verb, typed, right });

  answerInputs.forEach((input, k) => {
    input.readOnly = true;
    input.className = right[k] ? "ok" : "bad";
    const correction = correctAnswers[k];
    correction.textContent = "";
    if (right[k]) return;
    correction.append(showSpellings(verb.parts[k]));
    // A real form, of this verb or another, in the wrong box? Say which one it is.
    const matches = identifyForm(verb, k, typed[k]);
    if (matches) {
      correction.append(setText(makeElement("span", "k"),
        `”${typed[k]}” är ` + describeInSwedish(matches, verb), `“${typed[k]}” is ` + describeInEnglish(matches, verb)));
    }
  });
  setLetterKeysEnabled(false);

  const rightCount = right.filter(Boolean).length;
  feedback.hidden = false;
  feedback.className = "fb " + (allRight ? "ok" : "bad");
  feedback.textContent = "";
  feedback.append(allRight
    ? setText(makeElement("span"), "Rätt", "Correct")
    : setText(makeElement("span"), `${rightCount} av 3 rätt`, `${rightCount} of 3 correct`));
  showScore();
  progressBar.style.width = ((questionIndex + 1) / questions.length * 100) + "%";
  const isLast = questionIndex === questions.length - 1;
  setText(mainButton, isLast ? "Se resultatet" : "Nästa", isLast ? "See your score" : "Next");
  phase = "review";
}

function nextQuestion() {
  questionIndex++;
  if (questionIndex < questions.length) showQuestion();
  else showResults();
}

function onMainButton() {
  if (phase === "ask") checkAnswer();
  else nextQuestion();
}

// Enter moves on to the next empty box; once all three are filled it checks them.
answerInputs.forEach((input, k) => {
  input.addEventListener("focus", () => { lastUsedInput = input; });
  input.addEventListener("keydown", event => {
    if (event.key !== "Enter" || event.isComposing) return;
    event.preventDefault();
    if (event.repeat) return;
    if (phase === "ask") {
      const othersInOrder = [...answerInputs.slice(k + 1), ...answerInputs.slice(0, k)];
      const nextEmpty = othersInOrder.find(other => !other.value.trim());
      if (nextEmpty) { nextEmpty.focus(); return; }
    }
    onMainButton();
  });
});

// ---- Results ----

function showResults() {
  showSection("done");
  const total = questions.length, percent = Math.round(score / total * 100);
  byId("res").textContent = `${score} / ${total}`;
  const perfect = mistakes.length === 0;
  setText(byId("pct"), `${percent} % rätt` + (perfect ? ", inga fel" : ""), `${percent}% correct` + (perfect ? ", no mistakes" : ""));

  const table = byId("miss");
  byId("misshead").hidden = table.hidden = perfect;
  [...table.tBodies].forEach(body => body.remove());
  mistakes.forEach(mistake => addMistakeRows(table, mistake));
}

// One mistake: the verb and its conjugation, then each part as typed, with the right form under any wrong one.
function addMistakeRows(table, { verb, typed, right }) {
  const body = table.createTBody(), heading = makeElement("th");
  heading.colSpan = 3;
  heading.scope = "rowgroup";
  body.insertRow().append(heading);
  heading.append(
    withEnglish(makeElement("span", "v", verb.infinitive), verb.english),
    setText(makeElement("span", "k"), CONJUGATION_NAMES[verb.conjugation], CONJUGATION_NAMES_EN[verb.conjugation]));

  const row = body.insertRow();
  verb.parts.forEach((part, k) => {
    const cell = row.insertCell();
    if (right[k]) { cell.append(makeElement("span", "fine", typed[k])); return; }
    const matches = identifyForm(verb, k, typed[k]);
    if (matches) cell.className = "real";
    cell.append(makeElement("span", "no", typed[k] || "—"), makeElement("span", "yes", showSpellings(part)));
    if (matches) {
      cell.append(setText(makeElement("span", "k"),
        "det är " + describeInSwedish(matches, verb), "you wrote " + describeInEnglish(matches, verb)));
    }
  });
}

// ---- Tables ----

// One conjugation, every verb, alphabetical (Swedish order: å, ä, ö after z).
// Only the infinitive carries English on hover.
function buildTables() {
  const verbs = VERBS.filter(verb => verb.conjugation === tableConjugation)
    .sort((a, b) => a.infinitive.localeCompare(b.infinitive, "sv"));
  setText(byId("tcount"),
    `${verbs.length} verb i ${ORDINALS[tableConjugation]} konjugationen`,
    `${verbs.length} verbs in the ${ORDINALS_EN[tableConjugation]} conjugation`);

  const table = byId("tbl");
  table.textContent = "";
  const header = table.createTHead().insertRow();
  header.appendChild(setText(makeElement("th"), "infinitiv", "infinitive"));
  PARTS.forEach((part, k) => header.appendChild(setText(makeElement("th"), part, PARTS_EN[k])));

  const body = table.createTBody();
  for (const verb of verbs) {
    const row = body.insertRow();
    setText(row.insertCell(), verb.infinitive, verb.english);
    for (const part of verb.parts) row.insertCell().textContent = showSpellings(part);
  }
}

// ---- Wiring ----

byId("start").onclick = startRound;
mainButton.onclick = onMainButton;
byId("again").onclick = startRound;
byId("change").onclick = () => showSection("setup");
window.addEventListener("hashchange", updateView);
updateView();
