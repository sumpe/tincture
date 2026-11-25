// Polyverb, Polish: the game and the tables. Shared helpers are in ../js/trainer.js.
// Each question asks for one form of a regular verb: a tense or mood, a person and, where it matters, a gender.

// ---- Words on the page ----

const TENSES = ["Czas teraźniejszy", "Czas przeszły", "Czas przyszły", "Tryb przypuszczający"];
const TENSES_EN = ["Present tense", "Past tense", "Future tense", "Conditional mood"];
const TENSE_BUTTONS = ["Teraźniejszy", "Przeszły", "Przyszły", "Przypuszczający"];
const TENSE_BUTTONS_EN = ["Present", "Past", "Future", "Conditional"];
const PRESENT = 0, PAST = 1, FUTURE = 2, CONDITIONAL = 3;
const TIMELINE_OF_TENSE = ["present", "past", "future", "conditional"];

const PRONOUNS = ["ja", "ty", "on / ona / ono", "my", "wy", "oni / one"];
const PRONOUNS_EN = ["I", "you", "he / she / it", "we", "you all", "they"];
const THIRD_SINGULAR = 2;

// In the past tense and the conditional the form depends on gender: masculine or feminine in
// the singular (and neuter for "ono"); in the plural, masculine personal (any group that
// includes a man) against non-masculine personal (everything else).
function genderLabel(person, gender) {
  if (person === THIRD_SINGULAR) return ["on", "ona", "ono"][gender];
  const who = person < THIRD_SINGULAR ? ["mężczyzna", "kobieta"][gender] : ["grupa z mężczyznami", "same kobiety"][gender];
  return `${PRONOUNS[person]} (${who})`;
}
function genderLabelEn(person, gender) {
  if (person === THIRD_SINGULAR) return ["he", "she", "it"][gender];
  const who = person < THIRD_SINGULAR ? ["masculine", "feminine"][gender] : ["masculine personal", "non-masculine personal"][gender];
  return `${PRONOUNS_EN[person]} (${who})`;
}

// ---- Conjugation ----

const FUTURE_AUXILIARY = ["będę", "będziesz", "będzie", "będziemy", "będziecie", "będą"];
// Past and conditional endings, added to the infinitive without its final -ć: [person, gender, past, conditional]
const PAST_ENDINGS = [
  [0, 0, "łem", "łbym"], [0, 1, "łam", "łabym"],
  [1, 0, "łeś", "łbyś"], [1, 1, "łaś", "łabyś"],
  [2, 0, "ł", "łby"], [2, 1, "ła", "łaby"], [2, 2, "ło", "łoby"],
  [3, 0, "liśmy", "libyśmy"], [3, 1, "łyśmy", "łybyśmy"],
  [4, 0, "liście", "libyście"], [4, 1, "łyście", "łybyście"],
  [5, 0, "li", "liby"], [5, 1, "ły", "łyby"]
];
const PAST_COLUMN = 2, CONDITIONAL_COLUMN = 3;

function presentForms(verb) {
  if (verb.endsWith("ować")) {
    const stem = verb.slice(0, -4);
    return ["uję", "ujesz", "uje", "ujemy", "ujecie", "ują"].map(ending => stem + ending);
  }
  if (verb.endsWith("ać")) {
    const stem = verb.slice(0, -1);
    return ["m", "sz", "", "my", "cie", "ją"].map(ending => stem + ending);
  }
  // -ić and -yć. After l the i drops out of the first person and the plural (palę, palą);
  // elsewhere it stays (robię, robią).
  const stem = verb.slice(0, -2);
  const endings = verb.endsWith("yć") ? ["ę", "ysz", "y", "ymy", "ycie", "ą"]
    : stem.endsWith("l") ? ["ę", "isz", "i", "imy", "icie", "ą"]
    : ["ię", "isz", "i", "imy", "icie", "ią"];
  return endings.map(ending => stem + ending);
}

// Every form of a verb, by tense: rows of { person, label, english, answers }.
// A row has more than one answer only in the compound future: będę czytać, będę czytał, będę czytała.
function conjugate(verb) {
  const stem = verb.slice(0, -1);
  const row = (person, label, english, answers) => ({ person, label, english, answers });

  const present = presentForms(verb).map((form, person) => row(person, PRONOUNS[person], PRONOUNS_EN[person], [form]));
  const future = FUTURE_AUXILIARY.map((auxiliary, person) => {
    const participles = person < 3 ? [stem + "ł", stem + "ła"] : [stem + "li", stem + "ły"];
    if (person === THIRD_SINGULAR) participles.push(stem + "ło");
    const answers = [auxiliary + " " + verb, ...participles.map(participle => auxiliary + " " + participle)];
    return row(person, PRONOUNS[person], PRONOUNS_EN[person], answers);
  });
  const byGender = column => PAST_ENDINGS.map(endings => {
    const [person, gender] = endings;
    return row(person, genderLabel(person, gender), genderLabelEn(person, gender), [stem + endings[column]]);
  });
  return [present, byGender(PAST_COLUMN), future, byGender(CONDITIONAL_COLUMN)];
}

const CONJUGATIONS = new Map(Object.values(VERBS_BY_CLASS).flat().map(verb => [verb, conjugate(verb)]));

// ---- Where a wrong answer belongs ----

// Every form of every verb, so a wrong answer can be traced to where it belongs.
const FORMS = new Map(); // normalized form → [{ verb, tense, label, english }]
for (const [verb, tenses] of CONJUGATIONS) {
  tenses.forEach((rows, tense) => {
    for (const { label, english, answers } of rows) {
      for (const answer of answers) {
        const key = normalizeAnswer(answer);
        if (!FORMS.has(key)) FORMS.set(key, []);
        FORMS.get(key).push({ verb, tense, label, english });
      }
    }
  });
}

// Up to two { verb, tense, labels, englishLabels, isAskedVerb }, or null.
// Forms of the verb that was asked about win over look-alikes from other verbs.
function identifyForm(typed, question) {
  const found = FORMS.get(typed);
  if (!found) return null;
  const groups = new Map();
  for (const { verb, tense, label, english } of found) {
    const key = verb + "|" + tense;
    if (!groups.has(key)) groups.set(key, { verb, tense, labels: [], englishLabels: [] });
    groups.get(key).labels.push(label);
    groups.get(key).englishLabels.push(english);
  }
  let matches = [...groups.values()];
  const ofAskedVerb = matches.filter(match => match.verb === question.verb);
  if (ofAskedVerb.length) matches = ofAskedVerb;
  return matches.slice(0, 2).map(match => ({ ...match, isAskedVerb: match.verb === question.verb }));
}

// The matches said in Polish, "czas przeszły · ja (kobieta)", and in English
function describeInPolish(matches) {
  return matches.map(match =>
    (match.isAskedVerb ? "" : match.verb + ", ") + TENSES[match.tense].toLowerCase() + " · " + match.labels.join(", ")
  ).join("; ");
}

function describeInEnglish(matches) {
  return matches.map(match =>
    (match.isAskedVerb ? "the " : `a form of ${match.verb} (${ENGLISH[match.verb]}), the `)
    + TENSES_EN[match.tense].toLowerCase() + " · " + match.englishLabels.join(", ")
  ).join("; ");
}

// ---- The page ----

const answerInput = byId("ans"), feedback = byId("fb"), mainButton = byId("go");
const progress = byId("prog"), scoreLabel = byId("score"), progressBar = byId("fill");

const appendOr = (element, forms) => appendAlternatives(element, forms, "lub");

addLetterKeys(["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"], () => answerInput);

// ---- Settings ----

let questionCount = 20;
let verbGroup = "all"; // or one class: "ac", "ow" or "ic"
let chosenTenses = [PRESENT, PAST, FUTURE, CONDITIONAL];

singleChoice("seg", value => { questionCount = Number(value); });
singleChoice("cls", value => { verbGroup = value; });
multiChoice(
  byId("tns"),
  TENSE_BUTTONS.map((label, tense) => ({ value: tense, label, english: TENSE_BUTTONS_EN[tense] })),
  () => chosenTenses,
  chosen => { chosenTenses = chosen; }
);

// ---- The round ----

let questions = [], questionIndex = 0, score = 0, mistakes = [];
let phase = ""; // "ask" while the player types, "review" while the answer shows

// The tenses and verb classes are spread evenly over the round; within a class each verb
// is used once before any comes back, and the person is drawn at random.
function startRound() {
  const tenses = shuffled(chosenTenses);
  const classes = verbGroup === "all" ? ["ac", "ow", "ic"] : [verbGroup];
  const tenseOfQuestion = shuffled(Array.from({ length: questionCount }, (_, k) => tenses[k % tenses.length]));
  const classOfQuestion = shuffled(Array.from({ length: questionCount }, (_, k) => classes[k % classes.length]));
  const unusedVerbs = {};

  questions = tenseOfQuestion.map((tense, k) => {
    const verbClass = classOfQuestion[k];
    if (!unusedVerbs[verbClass] || !unusedVerbs[verbClass].length) {
      unusedVerbs[verbClass] = shuffled(VERBS_BY_CLASS[verbClass]);
    }
    const verb = unusedVerbs[verbClass].pop();
    const rows = CONJUGATIONS.get(verb)[tense];
    const row = rows[Math.floor(Math.random() * rows.length)];
    return { verb, tense, ...row };
  });
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
  const question = questions[questionIndex];
  const number = questionIndex + 1, total = questions.length;
  phase = "ask";
  setText(progress, `Pytanie ${number} z ${total}`, `Question ${number} of ${total}`);
  showScore();
  showProgress(progressBar, questionIndex, score, total);
  setText(byId("verb"), question.verb, ENGLISH[question.verb]);
  setText(byId("tense"), TENSES[question.tense], TENSES_EN[question.tense]);
  setText(byId("who"), question.label, question.english);
  byId("tline").innerHTML = timelineSvg(TIMELINE_OF_TENSE[question.tense]);
  highlightPerson(byId("pgrid"), question.person);
  answerInput.value = "";
  answerInput.readOnly = false;
  answerInput.className = "";
  setLetterKeysEnabled(true);
  feedback.hidden = true;
  setText(mainButton, "Sprawdź", "Check");
  answerInput.focus();
}

function checkAnswer() {
  const question = questions[questionIndex];
  const typed = normalizeAnswer(answerInput.value);
  if (!typed) return;
  const asTyped = answerInput.value.trim();
  const isRight = question.answers.some(answer => normalizeAnswer(answer) === typed);
  const matches = isRight ? null : identifyForm(typed, question);
  if (isRight) score++;
  else mistakes.push({ question, typed: asTyped, matches });

  answerInput.readOnly = true;
  answerInput.className = isRight ? "ok" : "bad";
  setLetterKeysEnabled(false);
  feedback.hidden = false;
  feedback.className = "fb " + (isRight ? "ok" : "bad");
  feedback.textContent = "";
  if (isRight) {
    feedback.append(setText(makeElement("span"), "Dobrze", "Correct"));
    const alsoAccepted = question.answers.filter(answer => normalizeAnswer(answer) !== typed);
    if (alsoAccepted.length) {
      const note = setText(makeElement("span", "k"), "także ", "also accepted: " + alsoAccepted.join(", "));
      appendOr(note, alsoAccepted);
      feedback.append(note);
    }
  } else {
    const answers = makeElement("span", "fa");
    appendOr(answers, question.answers);
    feedback.append(setText(makeElement("span"), "Odpowiedź", "Answer"), " ", answers);
    if (matches) {
      feedback.append(setText(makeElement("span", "k"),
        `„${asTyped}” to ` + describeInPolish(matches), `“${asTyped}” is ` + describeInEnglish(matches)));
    }
  }
  showScore();
  showProgress(progressBar, questionIndex + 1, score, questions.length);
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
  mistakes.forEach(mistake => addMistakeRows(table, mistake));
}

// One mistake: the verb, tense and person, then what was typed beside the right answer.
function addMistakeRows(table, { question, typed, matches }) {
  const body = table.createTBody(), heading = makeElement("th");
  heading.colSpan = 2;
  heading.scope = "rowgroup";
  body.insertRow().append(heading);
  heading.append(
    withEnglish(makeElement("span", "v", question.verb), ENGLISH[question.verb]),
    setText(makeElement("span", "k"),
      TENSE_BUTTONS[question.tense].toLowerCase() + " · " + question.label,
      TENSE_BUTTONS_EN[question.tense].toLowerCase() + " · " + question.english));

  const row = body.insertRow(), typedCell = row.insertCell();
  typedCell.append(makeElement("span", "no", typed));
  if (matches) {
    typedCell.className = "real";
    typedCell.append(setText(makeElement("span", "k"), "to " + describeInPolish(matches), "is " + describeInEnglish(matches)));
  }
  const answerCell = row.insertCell();
  answerCell.className = "yes";
  answerCell.textContent = question.answers[0];
}

// ---- Tables ----

// One model verb from each class; any of them can be shown side by side.
const MODEL_VERBS = ["czytać", "kupować", "robić", "uczyć"];
let tableVerbs = ["czytać"];

const paintTableChoice = multiChoice(
  byId("vchips"),
  MODEL_VERBS.map(verb => ({ value: verb, label: verb })),
  () => tableVerbs,
  chosen => { tableVerbs = MODEL_VERBS.filter(verb => chosen.includes(verb)); buildTables(); }
);

function buildTables() {
  paintTableChoice();
  const conjugations = tableVerbs.map(verb => CONJUGATIONS.get(verb));
  const table = byId("tbl");
  table.textContent = "";
  table.style.minWidth = (170 + tableVerbs.length * 150) + "px";

  const header = table.createTHead().insertRow();
  header.appendChild(makeElement("th"));
  for (const verb of tableVerbs) header.appendChild(makeElement("th", "vh", verb));

  const body = table.createTBody();
  TENSES.forEach((name, tense) => {
    const tenseRow = body.insertRow();
    tenseRow.className = "tg";
    const tenseCell = tenseRow.insertCell();
    tenseCell.colSpan = 1 + tableVerbs.length;
    tenseCell.appendChild(setText(makeElement("span", "tl"), name, TENSES_EN[tense]));
    conjugations[0][tense].forEach((formRow, k) => {
      const row = body.insertRow();
      setText(row.insertCell(), formRow.label, formRow.english);
      for (const conjugation of conjugations) row.insertCell().textContent = conjugation[tense][k].answers[0];
    });
  });
}

// ---- Wiring ----

byId("start").onclick = startRound;
mainButton.onclick = onMainButton;
byId("again").onclick = startRound;
byId("change").onclick = () => showSection("setup");
answerInput.addEventListener("keydown", event => {
  if (event.key !== "Enter" || event.isComposing) return;
  event.preventDefault();
  if (!event.repeat) onMainButton();
});
window.addEventListener("hashchange", updateView);
updateView();
