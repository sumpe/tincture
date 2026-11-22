// Polyverb, Portuguese: the game and the tables. Shared helpers are in ../js/trainer.js.
// Each question asks for one form: a verb, a tense and a person. The tables set each verb beside its Spanish.

// ---- Words on the page ----

const TENSES = ["Presente do indicativo", "Pretérito perfeito", "Pretérito imperfeito", "Mais-que-perfeito simples", "Futuro", "Condicional", "Presente do conjuntivo", "Pretérito imperfeito do conjuntivo", "Futuro do conjuntivo"];
const TENSES_EN = ["Present indicative", "Preterite", "Imperfect", "Simple pluperfect", "Future", "Conditional", "Present subjunctive", "Imperfect subjunctive", "Future subjunctive"];
// Shorter names, for the notes on wrong answers and the review
const TENSES_SHORT = ["presente", "perfeito", "imperfeito", "mais-que-perfeito", "futuro", "condicional", "presente do conjuntivo", "imperfeito do conjuntivo", "futuro do conjuntivo"];
const TENSES_SHORT_EN = ["present", "preterite", "imperfect", "pluperfect", "future", "conditional", "present subjunctive", "imperfect subjunctive", "future subjunctive"];
const PRESENT = 0, PRETERITE = 1, IMPERFECT = 2, PLUPERFECT = 3, FUTURE = 4, CONDITIONAL = 5;
const PRESENT_SUBJUNCTIVE = 6, IMPERFECT_SUBJUNCTIVE = 7, FUTURE_SUBJUNCTIVE = 8;
const isSubjunctive = tense => tense >= PRESENT_SUBJUNCTIVE;
const TIMELINE_OF_TENSE = ["present", "past", "past", "pluperfect", "future", "conditional", "present", "past", "future"];

const PERSONS = [
  { pronoun: "eu", label: "1.ª sing." }, { pronoun: "tu", label: "2.ª sing." }, { pronoun: "ele / ela", label: "3.ª sing." },
  { pronoun: "nós", label: "1.ª pl." }, { pronoun: "vós", label: "2.ª pl." }, { pronoun: "eles / elas", label: "3.ª pl." }
];
const PERSONS_EN = [
  { pronoun: "I", label: "1st person singular" }, { pronoun: "you", label: "2nd person singular" }, { pronoun: "he / she", label: "3rd person singular" },
  { pronoun: "we", label: "1st person plural" }, { pronoun: "you all", label: "2nd person plural" }, { pronoun: "they", label: "3rd person plural" }
];
const PRONOUNS_SHORT = ["eu", "tu", "ele", "nós", "vós", "eles"];
const PRONOUNS_SHORT_EN = ["I", "you", "he", "we", "you all", "they"];
const VOS = 4;

// The verb groups on the setup screen. The regular group's three model verbs are swapped,
// question by question, for regular verbs drawn from REGULAR_VERBS.
const VERB_GROUPS = {
  regular: ["cantar", "comer", "abrir"],
  essential: ["ser", "estar", "ter", "haver", "pôr", "ir"],
  common: ["fazer", "dizer", "dar", "ver", "vir", "poder", "querer", "saber"],
  supplementary: ["trazer", "ler", "sair", "ouvir", "pedir", "dormir"]
};
const GROUP_NAMES = { regular: "Regulares", essential: "Essenciais", common: "Frequentes", supplementary: "Complementares" };
const GROUP_NAMES_EN = { regular: "Regular", essential: "Essential", common: "Common", supplementary: "Supplementary" };
const GROUP_OF_VERB = {};
for (const group in VERB_GROUPS) for (const verb of VERB_GROUPS[group]) GROUP_OF_VERB[verb] = group;
const isRegularModel = verb => GROUP_OF_VERB[verb] === "regular";

// ---- Regular conjugation ----

// Endings by conjugation and tense, one per person; "a/b" gives both forms. The future, the
// conditional and the future subjunctive add their endings to the whole infinitive instead (below).
const REGULAR_ENDINGS = {
  ar: ["o as a amos ais am", "ei aste ou ámos/amos astes aram", "ava avas ava ávamos áveis avam", "ara aras ara áramos áreis aram", "", "", "e es e emos eis em", "asse asses asse ássemos ásseis assem", ""],
  er: ["o es e emos eis em", "i este eu emos estes eram", "ia ias ia íamos íeis iam", "era eras era êramos êreis eram", "", "", "a as a amos ais am", "esse esses esse êssemos êsseis essem", ""],
  ir: ["o es e imos is em", "i iste iu imos istes iram", "ia ias ia íamos íeis iam", "ira iras ira íramos íreis iram", "", "", "a as a amos ais am", "isse isses isse íssemos ísseis issem", ""]
};
const ENDINGS_ON_INFINITIVE = {
  [FUTURE]: ["ei", "ás", "á", "emos", "eis", "ão"],
  [CONDITIONAL]: ["ia", "ias", "ia", "íamos", "íeis", "iam"],
  [FUTURE_SUBJUNCTIVE]: ["", "es", "", "mos", "des", "em"]
};

// A regular verb in the same shape as VERB_TABLES: one string per tense, the six persons
// separated by spaces.
function conjugateRegular(verb) {
  const conjugation = verb.slice(-2), stem = verb.slice(0, -2);
  const attach = (base, endings) =>
    endings.map(ending => ending.split("/").map(variant => base + variant).join("/")).join(" ");
  return REGULAR_ENDINGS[conjugation].map((endings, tense) =>
    tense in ENDINGS_ON_INFINITIVE ? attach(verb, ENDINGS_ON_INFINITIVE[tense]) : attach(stem, endings.split(" ")));
}

// One tense's string, "cantei cantaste cantou cantámos/cantamos …", and a person → ["cantámos", "cantamos"]
const answersFor = (tenseForms, person) => tenseForms.split(" ")[person].split("/");

// ---- Where a wrong answer belongs ----

const ALL_TABLES = Object.assign({}, VERB_TABLES);
for (const conjugation in REGULAR_VERBS) {
  for (const verb of REGULAR_VERBS[conjugation]) {
    if (!ALL_TABLES[verb]) ALL_TABLES[verb] = conjugateRegular(verb);
  }
}

// Every form of every verb, so a wrong answer can be traced to where it belongs.
const FORMS = new Map(); // normalized form → [{ verb, tense, person }]
for (const verb in ALL_TABLES) {
  ALL_TABLES[verb].forEach((tenseForms, tense) => {
    tenseForms.split(" ").forEach((personForms, person) => {
      for (const form of personForms.split("/")) {
        const key = normalizeAnswer(form);
        if (!FORMS.has(key)) FORMS.set(key, []);
        FORMS.get(key).push({ verb, tense, person });
      }
    });
  });
}

// Up to two { verb, tense, persons, isAskedVerb }, or null.
// Forms of the verb that was asked about win over look-alikes from other verbs.
function identifyForm(typed, question) {
  const found = FORMS.get(typed);
  if (!found) return null;
  const groups = new Map();
  for (const { verb, tense, person } of found) {
    const key = verb + "|" + tense;
    if (!groups.has(key)) groups.set(key, { verb, tense, persons: [] });
    groups.get(key).persons.push(person);
  }
  let matches = [...groups.values()];
  const ofAskedVerb = matches.filter(match => match.verb === question.verb);
  if (ofAskedVerb.length) matches = ofAskedVerb;
  return matches.slice(0, 2).map(match => ({ ...match, isAskedVerb: match.verb === question.verb }));
}

// The matches said in Portuguese, "do imperfeito · eu, ele", and in English
function describeInPortuguese(matches) {
  return matches.map(match =>
    (match.isAskedVerb ? "do " : `de ${match.verb}, `) + TENSES_SHORT[match.tense]
    + " · " + match.persons.map(person => PRONOUNS_SHORT[person]).join(", ")
  ).join("; ");
}

function describeInEnglish(matches) {
  return matches.map(match =>
    (match.isAskedVerb ? "the " : `a form of ${match.verb} (${ENGLISH[match.verb]}), `) + TENSES_SHORT_EN[match.tense]
    + " · " + match.persons.map(person => PRONOUNS_SHORT_EN[person]).join(", ")
  ).join("; ");
}

// ---- The page ----

const answerInput = byId("ans"), feedback = byId("fb"), mainButton = byId("go");
const progress = byId("prog"), scoreLabel = byId("score"), progressBar = byId("fill");

// Sets the text, with every "conjuntivo" underlined in the accent colour.
function setTextMarkingSubjunctive(element, text) {
  element.textContent = "";
  text.split(/(conjuntivo)/).forEach((piece, k) => {
    if (!piece) return;
    const isMarker = k % 2 === 1;
    element.append(isMarker ? makeElement("span", "mood", piece) : piece);
  });
  return element;
}

const appendOr = (element, forms) => appendAlternatives(element, forms, "ou");

addLetterKeys(["á", "à", "â", "ã", "é", "ê", "í", "ó", "ô", "õ", "ú", "ç"], () => answerInput);

// ---- Settings ----

let questionCount = 20;
let chosenGroups = ["regular", "essential"];

singleChoice("seg", value => { questionCount = Number(value); });
multiChoice(
  byId("kinds"),
  Object.keys(GROUP_NAMES).map(group => ({ value: group, label: GROUP_NAMES[group], english: GROUP_NAMES_EN[group] })),
  () => chosenGroups,
  chosen => { chosenGroups = chosen; }
);

// ---- The round ----

let questions = [], questionIndex = 0, score = 0, mistakes = [];
let phase = ""; // "ask" while the player types, "review" while the answer shows

function startRound() {
  const includeVos = byId("vos").checked;
  const skipFutureAndConditional = byId("syn").checked;
  const candidates = [];
  for (const verb in VERB_TABLES) {
    if (!chosenGroups.includes(GROUP_OF_VERB[verb])) continue;
    VERB_TABLES[verb].forEach((tenseForms, tense) => {
      if (skipFutureAndConditional && (tense === FUTURE || tense === CONDITIONAL)) return;
      tenseForms.split(" ").forEach((personForms, person) => {
        if (person === VOS && !includeVos) return;
        candidates.push({ verb, tense, person, answers: personForms.split("/") });
      });
    });
  }
  questions = shuffled(candidates).slice(0, questionCount);
  swapInRegularVerbs(questions.filter(question => isRegularModel(question.verb)));
  questionIndex = 0;
  score = 0;
  mistakes = [];
  showSection("quiz");
  showQuestion();
}

// Each question on a model verb gets a regular verb of its own instead, with the
// -ar, -er and -ir conjugations spread evenly and no verb used twice.
function swapInRegularVerbs(regularQuestions) {
  const conjugationOrder = shuffled(["ar", "er", "ir"]);
  const unusedVerbs = {
    ar: shuffled(REGULAR_VERBS.ar),
    er: shuffled(REGULAR_VERBS.er),
    ir: shuffled(REGULAR_VERBS.ir)
  };
  const conjugationOfQuestion = shuffled(regularQuestions.map((_, k) => conjugationOrder[k % 3]));
  regularQuestions.forEach((question, k) => {
    const verb = unusedVerbs[conjugationOfQuestion[k]].pop();
    question.verb = verb;
    question.answers = answersFor(conjugateRegular(verb)[question.tense], question.person);
  });
}

function showScore() {
  setText(scoreLabel, `Pontos ${score}`, `Score ${score}`);
}

function showQuestion() {
  const question = questions[questionIndex];
  const number = questionIndex + 1, total = questions.length;
  const person = PERSONS[question.person], personEn = PERSONS_EN[question.person];
  phase = "ask";
  setText(progress, `Pergunta ${number} de ${total}`, `Question ${number} of ${total}`);
  showScore();
  progressBar.style.width = (questionIndex / total * 100) + "%";
  setText(byId("verb"), question.verb, ENGLISH[question.verb]);
  const tenseLabel = byId("tense");
  withEnglish(setTextMarkingSubjunctive(tenseLabel, TENSES[question.tense]), TENSES_EN[question.tense]);
  tenseLabel.className = "tense" + (isSubjunctive(question.tense) ? " sj" : "");
  setText(byId("who"), `${person.pronoun} (${person.label})`, `${personEn.pronoun} (${personEn.label})`);
  byId("tline").innerHTML = timelineSvg(TIMELINE_OF_TENSE[question.tense]);
  highlightPerson(byId("pgrid"), question.person);
  answerInput.value = "";
  answerInput.readOnly = false;
  answerInput.className = "";
  setLetterKeysEnabled(true);
  feedback.hidden = true;
  setText(mainButton, "Verificar", "Check");
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
    feedback.append(setText(makeElement("span"), "Correto", "Correct"));
    const alsoAccepted = question.answers.filter(answer => normalizeAnswer(answer) !== typed);
    if (alsoAccepted.length) {
      const note = setText(makeElement("span", "k"), "também ", "also accepted: " + alsoAccepted.join(", "));
      appendOr(note, alsoAccepted);
      feedback.append(note);
    }
  } else {
    const answers = makeElement("span", "fa");
    appendOr(answers, question.answers);
    feedback.append(setText(makeElement("span"), "Resposta", "Answer"), " ", answers);
    if (matches) {
      const note = setTextMarkingSubjunctive(makeElement("span", "k"), `«${asTyped}» é ` + describeInPortuguese(matches));
      feedback.append(withEnglish(note, `«${asTyped}» is ` + describeInEnglish(matches)));
    }
  }
  showScore();
  progressBar.style.width = ((questionIndex + 1) / questions.length * 100) + "%";
  const isLast = questionIndex === questions.length - 1;
  setText(mainButton, isLast ? "Ver resultados" : "Seguinte", isLast ? "See results" : "Next");
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
  setText(byId("pct"), `${percent}% corretas` + (perfect ? ", sem erros" : ""), `${percent}% correct` + (perfect ? ", no mistakes" : ""));

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
  const where = setTextMarkingSubjunctive(makeElement("span", "k"),
    TENSES_SHORT[question.tense] + " · " + PRONOUNS_SHORT[question.person]);
  heading.append(
    withEnglish(makeElement("span", "v", question.verb), ENGLISH[question.verb]),
    withEnglish(where, TENSES_SHORT_EN[question.tense] + " · " + PRONOUNS_SHORT_EN[question.person]));

  const row = body.insertRow(), typedCell = row.insertCell();
  typedCell.append(makeElement("span", "no", typed));
  if (matches) {
    typedCell.className = "real";
    const note = setTextMarkingSubjunctive(makeElement("span", "k"), "é " + describeInPortuguese(matches));
    typedCell.append(withEnglish(note, "is " + describeInEnglish(matches)));
  }
  const answerCell = row.insertCell();
  answerCell.className = "yes";
  appendOr(answerCell, question.answers);
}

// ---- Spanish, for the tables ----

const SPANISH_PRESENT = 0, SPANISH_PRETERITE = 1, SPANISH_IMPERFECT = 2, SPANISH_PRESENT_SUBJUNCTIVE = 3;
const SPANISH_RA_SUBJUNCTIVE = 4, SPANISH_FUTURE_STEM = 5, SPANISH_PARTICIPLE = 6;
const HABER_IMPERFECT = ["había", "habías", "había", "habíamos", "habíais", "habían"];
const SPANISH_FUTURE_ENDINGS = ["é", "ás", "á", "emos", "éis", "án"];
const SPANISH_CONDITIONAL_ENDINGS = ["ía", "ías", "ía", "íamos", "íais", "ían"];

// The imperfect subjunctive in -ra gives the one in -se, and the old future subjunctive in -re.
const raToSe = form => form.replace(/ramos$/, "semos").replace(/rais$/, "seis").replace(/ras$/, "ses").replace(/ran$/, "sen").replace(/ra$/, "se");
const raToRe = form => form.replace(/ramos$/, "remos").replace(/rais$/, "reis").replace(/ras$/, "res").replace(/ran$/, "ren").replace(/ra$/, "re");

// The six Spanish forms beside a Portuguese tense
function spanishForms(verb, tense) {
  const spanish = SPANISH[verb];
  const raForms = () => spanish[SPANISH_RA_SUBJUNCTIVE].split(" ");
  switch (tense) {
    case PRESENT: return spanish[SPANISH_PRESENT].split(" ");
    case PRETERITE: return spanish[SPANISH_PRETERITE].split(" ");
    case IMPERFECT: return spanish[SPANISH_IMPERFECT].split(" ");
    case PLUPERFECT: return HABER_IMPERFECT.map(auxiliary => auxiliary + " " + spanish[SPANISH_PARTICIPLE]);
    case FUTURE: return SPANISH_FUTURE_ENDINGS.map(ending => spanish[SPANISH_FUTURE_STEM] + ending);
    case CONDITIONAL: return SPANISH_CONDITIONAL_ENDINGS.map(ending => spanish[SPANISH_FUTURE_STEM] + ending);
    case PRESENT_SUBJUNCTIVE: return spanish[SPANISH_PRESENT_SUBJUNCTIVE].split(" ");
    case IMPERFECT_SUBJUNCTIVE: return raForms().map(form => form + " / " + raToSe(form));
    case FUTURE_SUBJUNCTIVE: return raForms().map(raToRe);
  }
}

// ---- Tables ----

const withSpanishName = verb => verb + (SPANISH_INFINITIVES[verb] ? " / " + SPANISH_INFINITIVES[verb] : "");
let tableVerbs = ["cantar"];

// The verb buttons above the table, under a heading for each group
const tableVerbChips = byId("vchips");
const paintTableChoices = Object.keys(VERB_GROUPS).map(group => {
  tableVerbChips.appendChild(withEnglish(makeElement("span", "gl", GROUP_NAMES[group]), GROUP_NAMES_EN[group]));
  return multiChoice(
    tableVerbChips,
    VERB_GROUPS[group].map(verb => ({ value: verb, label: withSpanishName(verb) })),
    () => tableVerbs,
    chosen => { tableVerbs = chosen; buildTables(); }
  );
});

function buildTables() {
  paintTableChoices.forEach(paint => paint());
  const verbs = Object.keys(VERB_TABLES).filter(verb => tableVerbs.includes(verb));
  const table = byId("tbl");
  table.textContent = "";
  table.style.minWidth = (70 + verbs.length * 280) + "px";

  const header = table.createTHead(), verbRow = header.insertRow(), languageRow = header.insertRow();
  verbRow.appendChild(makeElement("th"));
  languageRow.appendChild(makeElement("th"));
  for (const verb of verbs) {
    const verbHeading = makeElement("th", "vh", withSpanishName(verb));
    verbHeading.colSpan = 2;
    verbRow.appendChild(verbHeading);
    languageRow.appendChild(setText(makeElement("th", "pt"), "PE", "European Portuguese"));
    languageRow.appendChild(setText(makeElement("th", "es"), "ES", "Spanish"));
  }

  const body = table.createTBody();
  TENSES.forEach((name, tense) => {
    const tenseRow = body.insertRow();
    tenseRow.className = "tg" + (isSubjunctive(tense) ? " sj" : "");
    const tenseCell = tenseRow.insertCell();
    tenseCell.colSpan = 1 + verbs.length * 2;
    tenseCell.appendChild(withEnglish(setTextMarkingSubjunctive(makeElement("span", "tl"), name), TENSES_EN[tense]));

    const columns = verbs.map(verb => ({ portuguese: VERB_TABLES[verb][tense].split(" "), spanish: spanishForms(verb, tense) }));
    PERSONS.forEach((person, k) => {
      const row = body.insertRow();
      setText(row.insertCell(), person.label, PERSONS_EN[k].label);
      for (const { portuguese, spanish } of columns) {
        const portugueseCell = row.insertCell();
        portugueseCell.className = "pt";
        portugueseCell.textContent = portuguese[k].replace("/", " / ");
        const spanishCell = row.insertCell();
        spanishCell.className = "es";
        spanishCell.textContent = spanish[k];
      }
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
