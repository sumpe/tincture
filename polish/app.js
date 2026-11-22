// Polynoun, Polish: the game and the tables. Shared helpers are in ../js/trainer.js.
// Each question shows a noun, a case and a few words that call for it ("nie ma ___");
// the player types the form. A second mode drills the genitive of masculine inanimates: -a or -u?

// ---- Words on the page ----

const CASE_INFO = {
  nomPl: { label: "Mianownik\u00a0lm.", name: "mianownik, liczba mnoga", en: "nominative plural", frame: ["to są", "these are"] },
  genSg: { label: "Dopełniacz\u00a0lp.", name: "dopełniacz, liczba pojedyncza", en: "genitive singular", frame: ["nie ma", "there is no"] },
  genPl: { label: "Dopełniacz\u00a0lm.", name: "dopełniacz, liczba mnoga", en: "genitive plural", frame: ["dużo", "a lot of"] },
  accSg: { label: "Biernik\u00a0lp.", name: "biernik, liczba pojedyncza", en: "accusative singular", frame: ["widzę", "I see"] },
  locSg: { label: "Miejscownik\u00a0lp.", name: "miejscownik, liczba pojedyncza", en: "locative singular", frame: ["myślę o", "I'm thinking about"] },
  insSg: { label: "Narzędnik\u00a0lp.", name: "narzędnik, liczba pojedyncza", en: "instrumental singular", frame: ["przed", "in front of"] },
};

// The table's columns: the singular cases, then the plural ones
const TABLE_COLUMNS = [
  ["nominative", "mianownik lp.", "nominative singular"],
  ["genSg", "dopełniacz lp.", "genitive singular"],
  ["accSg", "biernik lp.", "accusative singular"],
  ["locSg", "miejscownik lp.", "locative singular"],
  ["insSg", "narzędnik lp.", "instrumental singular"],
  ["nomPl", "mianownik lm.", "nominative plural"],
  ["genPl", "dopełniacz lm.", "genitive plural"],
];

const GENDER_GROUPS = {
  f: { genders: ["f"], name: ["żeńskich", "feminine"] },
  m: { genders: ["mp", "m-a", "ma", "mi"], name: ["męskich", "masculine"] },
  n: { genders: ["n"], name: ["nijakich", "neuter"] },
};

// 1 rzeczownik, 2–4 rzeczowniki, 5–21 rzeczowników, 22–24 rzeczowniki…
function countNouns(n) {
  const lastTwo = n % 100, last = n % 10;
  if (n === 1) return "1 rzeczownik";
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return `${n} rzeczowniki`;
  return `${n} rzeczowników`;
}

// ---- Explaining a form ----

const SINGULAR_CASES = ["genSg", "accSg", "locSg", "insSg"];

// The note under an answer: the noun's own exception, or the rule its form follows,
// then any stem change the oblique forms share.
function explain(noun, caseKey) {
  const exception = noun.extras[caseKey];
  let [polish, english] = exception || ruleFor(caseKey, noun) || ["", ""];
  if (noun.gender === "m-a" && SINGULAR_CASES.includes(caseKey) && !exception) {
    polish = "Męski, ale w liczbie pojedynczej odmienia się jak żeński na -a. " + polish;
    english = "Masculine, but in the singular it declines like a feminine in -a. " + english;
  }
  const change = stemChange(noun);
  if (change && noun.forms[caseKey] !== noun.nominative) {
    polish += " " + change[0];
    english += " " + change[1];
  }
  return [polish, english];
}

// What a wrong answer really is, when it's another form of the same noun: "„kocie” to miejscownik"
function identifyForm(noun, caseKey, typed) {
  const matches = [];
  if (accepts(noun.nominative, typed)) matches.push(["mianownik, liczba pojedyncza", "the nominative singular"]);
  for (const other of CASES) {
    if (other !== caseKey && accepts(noun.forms[other], typed)) matches.push([CASE_INFO[other].name, "the " + CASE_INFO[other].en]);
  }
  if (!matches.length) return null;
  return [`„${typed}” to ` + matches.map(m => m[0]).join(" albo ") + ".",
          `“${typed}” is ` + matches.map(m => m[1]).join(" or ") + "."];
}

// The phrase with the form in its place, the changed part marked: "nie ma kot|a"
function framed(caseKey, form, noun) {
  const span = makeElement("span");
  span.append(CASE_INFO[caseKey].frame[0] + " ", markedSpellings(form, noun.nominative, "lub"));
  return span;
}

// ---- The page ----

const answerInput = byId("ans"), feedback = byId("fb"), mainButton = byId("go");
const progress = byId("prog"), scoreLabel = byId("score"), progressBar = byId("fill");

// ---- Settings ----

let mode = "cases";       // or "au", the -a or -u drill
let chosenCases = [...CASES];
let withExceptions = true;
let questionCount = 20;
let tableGroup = "f";

singleChoice("mode", value => { mode = value; showModeSettings(); });
singleChoice("count", value => { questionCount = Number(value); });
singleChoice("which", value => { withExceptions = value === "all"; });
singleChoice("tgender", value => { tableGroup = value; buildTables(); });

multiChoice(
  byId("cases"),
  CASES.map(key => ({ value: key, label: CASE_INFO[key].label, english: CASE_INFO[key].en })),
  () => chosenCases,
  chosen => { chosenCases = CASES.filter(key => chosen.includes(key)); }
);

const AU_NOUNS = POLISH_NOUNS.filter(noun => noun.gender === "mi");

function showModeSettings() {
  byId("cases-settings").hidden = mode !== "cases";
  byId("au-settings").hidden = mode !== "au";
}
setText(byId("au-count"), countNouns(AU_NOUNS.length) + ".", `${AU_NOUNS.length} nouns.`);
showModeSettings();

addLetterKeys(["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"], answerInput);

// ---- The round ----

let questions = [], questionIndex = 0, score = 0, mistakes = [];
let phase = ""; // "ask" while the player types, "review" while the answer shows

// Every noun and case the settings allow, shuffled so that one noun never comes twice in a row
function chooseQuestions() {
  const pairs = mode === "au"
    ? AU_NOUNS.map(noun => ({ noun, caseKey: "genSg" }))
    : POLISH_NOUNS.flatMap(noun => chosenCases
        .filter(caseKey => withExceptions || !noun.extras[caseKey])
        .map(caseKey => ({ noun, caseKey })));
  const picked = shuffled(pairs).slice(0, questionCount);
  for (let k = 1; k < picked.length; k++) {
    if (picked[k].noun !== picked[k - 1].noun) continue;
    const swap = picked.findIndex((pair, j) => j > k && pair.noun !== picked[k - 1].noun);
    if (swap > 0) [picked[k], picked[swap]] = [picked[swap], picked[k]];
  }
  return picked;
}

function startRound() {
  questions = chooseQuestions();
  questionIndex = 0;
  score = 0;
  mistakes = [];
  showSection("quiz");
  showQuestion();
}

function showScore() {
  setText(scoreLabel, `Punkty ${score}`, `Score ${score}`);
}

function showQuestion() {
  const { noun, caseKey } = questions[questionIndex];
  const info = CASE_INFO[caseKey];
  const number = questionIndex + 1, total = questions.length;
  phase = "ask";
  setText(progress, `Pytanie ${number} z ${total}`, `Question ${number} of ${total}`);
  showScore();
  progressBar.style.width = (questionIndex / total * 100) + "%";
  setText(byId("word"), noun.nominative, noun.english);
  setText(byId("case"), info.name, info.en);
  const frame = byId("frame");
  frame.textContent = "";
  frame.append(info.frame[0] + " ", makeElement("span", "blank"));
  withEnglish(frame, `${info.frame[1]} …`);
  answerInput.value = "";
  answerInput.readOnly = false;
  answerInput.className = "";
  setLetterKeysEnabled(true);
  feedback.hidden = true;
  setText(mainButton, "Sprawdź", "Check");
  answerInput.focus();
}

function checkAnswer() {
  const { noun, caseKey } = questions[questionIndex];
  const form = noun.forms[caseKey];
  const typed = answerInput.value.trim();
  if (!typed) { answerInput.focus(); return; }
  const right = accepts(form, typed);
  if (right) score++;
  else mistakes.push({ noun, caseKey, typed });

  answerInput.readOnly = true;
  answerInput.className = right ? "ok" : "bad";
  setLetterKeysEnabled(false);

  feedback.hidden = false;
  feedback.className = "fb " + (right ? "ok" : "bad");
  feedback.textContent = "";
  const answer = makeElement("span", "fa");
  answer.append(framed(caseKey, form, noun));
  if (right) {
    feedback.append(setText(makeElement("span"), "Dobrze", "Correct"), ": ", answer);
  } else {
    feedback.append(setText(makeElement("span"), "Odpowiedź", "Answer"), ": ", answer);
    const what = identifyForm(noun, caseKey, typed);
    if (what) feedback.append(setText(makeElement("span", "k"), what[0], what[1]));
  }
  const [polish, english] = explain(noun, caseKey);
  feedback.append(setText(makeElement("span", "rule"), polish, english));

  showScore();
  progressBar.style.width = ((questionIndex + 1) / questions.length * 100) + "%";
  const isLast = questionIndex === questions.length - 1;
  setText(mainButton, isLast ? "Zobacz wynik" : "Dalej", isLast ? "See your score" : "Next");
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

onEnter(answerInput, onMainButton);

// ---- Results ----

function showResults() {
  showSection("done");
  const total = questions.length, percent = Math.round(score / total * 100);
  byId("res").textContent = `${score} / ${total}`;
  const perfect = mistakes.length === 0;
  setText(byId("pct"), `${percent}% poprawnych` + (perfect ? ", bez błędów" : ""), `${percent}% correct` + (perfect ? ", no mistakes" : ""));

  const table = byId("miss");
  byId("misshead").hidden = table.hidden = perfect;
  [...table.tBodies].forEach(body => body.remove());
  const body = table.createTBody();
  for (const { noun, caseKey, typed } of mistakes) {
    const row = body.insertRow();
    const heading = makeElement("th");
    heading.scope = "row";
    heading.append(withEnglish(makeElement("span", "yes", noun.nominative), noun.english),
      setText(makeElement("span", "k"), CASE_INFO[caseKey].name, CASE_INFO[caseKey].en));
    row.append(heading);
    const cell = row.insertCell();
    const answer = makeElement("span", "yes");
    answer.append(framed(caseKey, noun.forms[caseKey], noun));
    cell.append(makeElement("span", "no", typed), answer);
  }
}

// ---- Tables ----

// One gender, every noun in it, alphabetical, with each form's change from the nominative marked
function buildTables() {
  const group = GENDER_GROUPS[tableGroup];
  const nouns = POLISH_NOUNS.filter(noun => group.genders.includes(noun.gender))
    .sort((a, b) => a.nominative.localeCompare(b.nominative, "pl"));
  setText(byId("tcount"), `${countNouns(nouns.length)} ${group.name[0]}`, `${nouns.length} ${group.name[1]} nouns`);

  const table = byId("tbl");
  table.textContent = "";
  const header = table.createTHead().insertRow();
  for (const [, polish, english] of TABLE_COLUMNS) header.appendChild(setText(makeElement("th"), polish, english));
  const body = table.createTBody();
  for (const noun of nouns) {
    const row = body.insertRow();
    for (const [key] of TABLE_COLUMNS) {
      const cell = row.insertCell();
      if (key === "nominative") setText(cell, noun.nominative, noun.english);
      else cell.append(markedSpellings(noun.forms[key], noun.nominative, "lub"));
    }
  }
}

// ---- Wiring ----

byId("start").onclick = startRound;
mainButton.onclick = onMainButton;
byId("again").onclick = startRound;
byId("change").onclick = () => showSection("setup");
window.addEventListener("hashchange", updateView);
updateView();
