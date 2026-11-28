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
const TU = 1, VOS = 4;

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

// ---- European or Brazilian ----

// Brazilian Portuguese has no tu or vós forms here (você and vocês take the third person),
// and writes the -ar preterite's "nós" form only as "cantamos", never "cantámos".
let variant = loadSetting("variant", "pe"); // "pe" or "br"
const isBrazilian = () => variant === "br";
const personsInUse = () => PERSONS.map((_, person) => person).filter(person => !isBrazilian() || (person !== TU && person !== VOS));

// The settings that outlast a visit. localStorage can be missing or refused (some browsers, files opened from disk).
function loadSetting(name, fallback) {
  try { return localStorage.getItem("polyverb-pt-" + name) ?? fallback; } catch { return fallback; }
}
function saveSetting(name, value) {
  try { localStorage.setItem("polyverb-pt-" + name, value); } catch { /* not remembered, that's all */ }
}

// One person's forms, "cantámos/cantamos" → ["cantámos", "cantamos"], as the chosen variant writes them
function variantForms(personForms) {
  const forms = personForms.split("/");
  return isBrazilian() && forms.length > 1 ? forms.filter(form => !form.endsWith("ámos")) : forms;
}

// One tense's string, "cantei cantaste cantou cantámos/cantamos …", and a person → ["cantámos", "cantamos"]
const answersFor = (tenseForms, person) => variantForms(tenseForms.split(" ")[person]);

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

// The matches said in Portuguese, "do imperfeito · eu, ele", with only what doesn't match the question underlined:
// the verb if it's another one, the tense, the mood and the persons. "do presente do conjuntivo · eu"
// for an imperfect subjunctive underlines "presente"; for a present indicative, "do conjuntivo".
// An indicative form given for a subjunctive says "do indicativo", so that difference shows too.
const TENSE_BASES = ["presente", "perfeito", "imperfeito", "mais-que-perfeito", "futuro", "condicional", "presente", "imperfeito", "futuro"];

function appendDifferences(element, matches, question) {
  const pieces = []; // [text, differs]
  matches.forEach((match, k) => {
    if (k > 0) pieces.push(["; ", false]);
    if (match.isAskedVerb) pieces.push(["do ", false]);
    else pieces.push(["de ", false], [match.verb, true], [", ", false]);
    pieces.push([TENSE_BASES[match.tense], TENSE_BASES[match.tense] !== TENSE_BASES[question.tense]]);
    if (isSubjunctive(match.tense)) pieces.push([" ", false], ["do conjuntivo", !isSubjunctive(question.tense)]);
    else if (isSubjunctive(question.tense)) pieces.push([" ", false], ["do indicativo", true]);
    pieces.push([" · ", false], [match.persons.map(person => PRONOUNS_SHORT[person]).join(", "), !match.persons.includes(question.person)]);
  });
  // Two underlined parts with only a space between them are underlined as one: "imperfeito do indicativo"
  const merged = [];
  for (const [text, differs] of pieces) {
    const last = merged[merged.length - 1], beforeLast = merged[merged.length - 2];
    if (differs && last && last[0] === " " && beforeLast && beforeLast[1]) {
      merged.pop();
      beforeLast[0] += " " + text;
    } else merged.push([text, differs]);
  }
  for (const [text, differs] of merged) element.append(differs ? makeElement("span", "off", text) : text);
  return element;
}

// And in English, for the hover
function describeInEnglish(matches) {
  return matches.map(match =>
    (match.isAskedVerb ? "the " : `a form of ${match.verb} (${ENGLISH[match.verb]}), `) + TENSES_SHORT_EN[match.tense]
    + " · " + match.persons.map(person => PRONOUNS_SHORT_EN[person]).join(", ")
  ).join("; ");
}

// ---- Slips in a regular verb's stem ----

// True when a and b differ by one letter: one missing, one extra, one wrong, or two side by side swapped.
function isOneSlipApart(a, b) {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const differ = [...a].map((letter, k) => letter !== b[k] ? k : -1).filter(k => k >= 0);
    if (differ.length === 1) return true;
    const [first, second] = differ;
    return differ.length === 2 && second === first + 1 && a[first] === b[second] && a[second] === b[first];
  }
  const [shorter, longer] = a.length < b.length ? [a, b] : [a, b].reverse();
  for (let k = 0; k < longer.length; k++) {
    if (longer.slice(0, k) + longer.slice(k + 1) === shorter) return true;
  }
  return false;
}

// A regular verb's stem is only spelling; its ending is what's being practised. So one slip in
// the stem ("esreverem" for "escreverem") still counts, as long as the ending is exactly right.
// Returns the answer the player meant, or null.
function answerWithStemSlip(typed, question) {
  if (!question.isRegular) return null;
  const stem = normalizeAnswer(question.verb.slice(0, -2));
  if (stem.length < 3) return null;
  return question.answers.find(answer => {
    const ending = normalizeAnswer(answer).slice(stem.length);
    return typed.endsWith(ending) && isOneSlipApart(typed.slice(0, typed.length - ending.length), stem);
  }) ?? null;
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

singleChoice("seg", value => { questionCount = value === "all" ? "all" : Number(value); });
// The variant can be chosen on the setup screen or above the tables; both trays show the same choice.
function chooseVariant(value) {
  variant = value;
  saveSetting("variant", value);
  showVariant();
  if (location.hash === "#tables") buildTables();
}
singleChoice("variant", chooseVariant);
singleChoice("tbl-variant", chooseVariant);

// The variant shows in the subtitle and the page language; the vós switch only matters in European.
const SUBTITLES = {
  pe: ["Português europeu. Escreve a forma verbal; os acentos contam.", "European Portuguese. Type the verb form; accents count."],
  br: ["Português do Brasil. Escreve a forma verbal; os acentos contam.", "Brazilian Portuguese. Type the verb form; accents count."]
};
function showVariant() {
  document.querySelectorAll("#variant button, #tbl-variant button").forEach(button => setPressed(button, button.dataset.v === variant));
  setText(byId("sub"), ...SUBTITLES[variant]);
  document.documentElement.lang = isBrazilian() ? "pt-BR" : "pt-PT";
  byId("vos-row").hidden = isBrazilian();
  showAllCount();
}
showVariant();
multiChoice(
  byId("kinds"),
  Object.keys(GROUP_NAMES).map(group => ({ value: group, label: GROUP_NAMES[group], english: GROUP_NAMES_EN[group] })),
  () => chosenGroups,
  chosen => { chosenGroups = chosen; showAllCount(); }
);

// "Todos": every form in the chosen groups. Every tense and person of each irregular verb, and with
// the regular group, every tense and person of -ar, -er and -ir, each on a regular verb of that
// conjugation. The tenses and persons are those the settings leave in.
function slotsInUse() {
  const persons = personsInUse().filter(person => person !== VOS || byId("vos").checked);
  const skipFutureAndConditional = byId("syn").checked;
  const slots = [];
  VERB_TABLES.ser.forEach((_, tense) => {
    if (skipFutureAndConditional && (tense === FUTURE || tense === CONDITIONAL)) return;
    for (const person of persons) slots.push({ tense, person });
  });
  return slots;
}
function irregularVerbsChosen() {
  return Object.keys(VERB_TABLES).filter(verb => chosenGroups.includes(GROUP_OF_VERB[verb]) && !isRegularModel(verb));
}
function showAllCount() {
  const slots = slotsInUse().length;
  const regularForms = chosenGroups.includes("regular") ? 3 * slots : 0;
  byId("all-n").textContent = irregularVerbsChosen().length * slots + regularForms;
}
showAllCount();
byId("vos").addEventListener("change", showAllCount);
byId("syn").addEventListener("change", showAllCount);

// ---- The round ----

let questions = [], questionIndex = 0, score = 0, slips = 0, mistakes = [];
let phase = ""; // "ask" while the player types, "review" while the answer shows

function startRound() {
  const includeVos = byId("vos").checked;
  const skipFutureAndConditional = byId("syn").checked;
  const persons = personsInUse().filter(person => person !== VOS || includeVos);
  const candidates = [];
  for (const verb in VERB_TABLES) {
    if (!chosenGroups.includes(GROUP_OF_VERB[verb])) continue;
    VERB_TABLES[verb].forEach((tenseForms, tense) => {
      if (skipFutureAndConditional && (tense === FUTURE || tense === CONDITIONAL)) return;
      for (const person of persons) candidates.push({ verb, tense, person, answers: answersFor(tenseForms, person) });
    });
  }
  if (questionCount === "all") questions = everyForm();
  else {
    questions = shuffled(candidates).slice(0, questionCount);
    swapInRegularVerbs(questions.filter(question => isRegularModel(question.verb)));
  }
  questionIndex = 0;
  score = 0;
  slips = 0;
  mistakes = [];
  showSection("quiz");
  showQuestion();
}

// Every form once: the irregular verbs' own, and the regular ones each on a verb dealt from its
// conjugation like a card, each verb once before any comes up again. Then all in random order.
function everyForm() {
  const slots = slotsInUse();
  const dealer = cards => {
    let deck = [];
    return () => {
      if (!deck.length) deck = shuffled(cards);
      return deck.pop();
    };
  };
  const questions = [];
  for (const verb of irregularVerbsChosen()) {
    for (const { tense, person } of slots) questions.push({ verb, tense, person, answers: answersFor(VERB_TABLES[verb][tense], person) });
  }
  if (chosenGroups.includes("regular")) {
    for (const conjugation of ["ar", "er", "ir"]) {
      const dealVerb = dealer(REGULAR_VERBS[conjugation]);
      for (const { tense, person } of slots) {
        const verb = dealVerb();
        questions.push({ verb, tense, person, isRegular: true, answers: answersFor(conjugateRegular(verb)[tense], person) });
      }
    }
  }
  return withoutRepeats(shuffled(questions));
}

// A verb comes up many times in a round; this keeps the same verb from coming up twice in
// a row, swapping a repeat with another question that fits in its place.
function withoutRepeats(questions) {
  for (let k = 1; k < questions.length; k++) {
    if (questions[k].verb !== questions[k - 1].verb) continue;
    const swap = questions.findIndex((other, j) => Math.abs(j - k) > 1 && other.verb !== questions[k - 1].verb &&
      other.verb !== questions[k + 1]?.verb && questions[j - 1]?.verb !== questions[k].verb && questions[j + 1]?.verb !== questions[k].verb);
    if (swap >= 0) [questions[k], questions[swap]] = [questions[swap], questions[k]];
  }
  return questions;
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
    question.isRegular = true;
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
  showProgress(progressBar, questionIndex, score, total, slips);
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
  const isExact = question.answers.some(answer => normalizeAnswer(answer) === typed);
  const meant = isExact ? null : answerWithStemSlip(typed, question);
  const isRight = isExact || meant !== null;
  const matches = isRight ? null : identifyForm(typed, question);
  // A slip in the stem still scores, but shows amber, so it doesn't pass for a clean answer
  if (isRight) score++;
  if (meant) slips++;
  if (!isRight) mistakes.push({ question, typed: asTyped, matches });

  answerInput.readOnly = true;
  const state = meant ? "slip" : isRight ? "ok" : "bad";
  answerInput.className = state;
  setLetterKeysEnabled(false);
  feedback.hidden = false;
  feedback.className = "fb " + state;
  feedback.textContent = "";
  if (isRight) {
    feedback.append(meant ? setText(makeElement("span"), "Gralha", "Typo") : setText(makeElement("span"), "Correto", "Correct"));
    const alsoAccepted = question.answers.filter(answer => normalizeAnswer(answer) !== typed);
    if (meant) {
      feedback.append(setText(makeElement("span", "k"), `no radical: escreve-se «${meant}»`, `in the stem: it's spelled «${meant}»`));
    } else if (alsoAccepted.length) {
      const note = setText(makeElement("span", "k"), "também ", "also accepted: " + alsoAccepted.join(", "));
      appendOr(note, alsoAccepted);
      feedback.append(note);
    }
  } else {
    const answers = makeElement("span", "fa");
    appendOr(answers, question.answers);
    feedback.append(setText(makeElement("span"), "Resposta", "Answer"), " ", answers);
    if (matches) {
      const note = makeElement("span", "k", `«${asTyped}» é `);
      feedback.append(withEnglish(appendDifferences(note, matches, question), `«${asTyped}» is ` + describeInEnglish(matches)));
    }
  }
  showScore();
  showProgress(progressBar, questionIndex + 1, score, questions.length, slips);
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
  const where = makeElement("span", "k", TENSES_SHORT[question.tense] + " · " + PRONOUNS_SHORT[question.person]);
  heading.append(
    withEnglish(makeElement("span", "v", question.verb), ENGLISH[question.verb]),
    withEnglish(where, TENSES_SHORT_EN[question.tense] + " · " + PRONOUNS_SHORT_EN[question.person]));

  const row = body.insertRow(), typedCell = row.insertCell();
  typedCell.append(makeElement("span", "no", typed));
  if (matches) {
    typedCell.className = "real";
    const note = appendDifferences(makeElement("span", "k", "é "), matches, question);
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

let tableVerbs = ["cantar"];
let showSpanish = loadSetting("spanish", "on") === "on";
const withSpanishName = verb => verb + (showSpanish && SPANISH_INFINITIVES[verb] ? " / " + SPANISH_INFINITIVES[verb] : "");

const spanishSwitch = byId("es");
spanishSwitch.checked = showSpanish;
spanishSwitch.onchange = () => {
  showSpanish = spanishSwitch.checked;
  saveSetting("spanish", showSpanish ? "on" : "off");
  buildTableChoices();
  buildTables();
};

// The verb buttons above the table, under a heading for each group. They're rebuilt when
// Spanish is turned on or off, since their names carry the Spanish infinitive only while it shows.
const tableVerbChips = byId("vchips");
let paintTableChoices = [];
function buildTableChoices() {
  tableVerbChips.textContent = "";
  paintTableChoices = Object.keys(VERB_GROUPS).map(group => {
    tableVerbChips.appendChild(withEnglish(makeElement("span", "gl", GROUP_NAMES[group]), GROUP_NAMES_EN[group]));
    return multiChoice(
      tableVerbChips,
      VERB_GROUPS[group].map(verb => ({ value: verb, label: withSpanishName(verb) })),
      () => tableVerbs,
      chosen => { tableVerbs = chosen; buildTables(); }
    );
  });
}
buildTableChoices();

function buildTables() {
  paintTableChoices.forEach(paint => paint());
  const variantName = isBrazilian() ? ["Português do Brasil", "Brazilian Portuguese"] : ["Português europeu", "European Portuguese"];
  const abbreviation = isBrazilian() ? "PB" : "PE";
  setText(byId("tbl-sub"),
    "Escolhe um ou mais verbos." + (showSpanish ? ` ${variantName[0]} (${abbreviation}) primeiro, espanhol (ES) depois.` : ""),
    "Choose one or more verbs." + (showSpanish ? ` ${variantName[1]} (${abbreviation}) first, then Spanish (ES).` : ""));
  byId("es-hint").hidden = !showSpanish;

  const verbs = Object.keys(VERB_TABLES).filter(verb => tableVerbs.includes(verb));
  const persons = personsInUse();
  const table = byId("tbl");
  table.textContent = "";
  table.style.minWidth = (70 + verbs.length * (showSpanish ? 280 : 150)) + "px";

  const header = table.createTHead(), verbRow = header.insertRow();
  verbRow.appendChild(makeElement("th"));
  for (const verb of verbs) {
    const verbHeading = makeElement("th", "vh", withSpanishName(verb));
    if (showSpanish) verbHeading.colSpan = 2;
    verbRow.appendChild(verbHeading);
  }
  if (showSpanish) {
    const languageRow = header.insertRow();
    languageRow.appendChild(makeElement("th"));
    for (const verb of verbs) {
      languageRow.appendChild(setText(makeElement("th", "pt"), abbreviation, variantName[1]));
      languageRow.appendChild(setText(makeElement("th", "es"), "ES", "Spanish"));
    }
  }

  const body = table.createTBody();
  TENSES.forEach((name, tense) => {
    const tenseRow = body.insertRow();
    tenseRow.className = "tg" + (isSubjunctive(tense) ? " sj" : "");
    const tenseCell = tenseRow.insertCell();
    tenseCell.colSpan = 1 + verbs.length * (showSpanish ? 2 : 1);
    tenseCell.appendChild(withEnglish(setTextMarkingSubjunctive(makeElement("span", "tl"), name), TENSES_EN[tense]));

    const columns = verbs.map(verb => ({ portuguese: VERB_TABLES[verb][tense], spanish: showSpanish && spanishForms(verb, tense) }));
    for (const person of persons) {
      const row = body.insertRow();
      setText(row.insertCell(), PERSONS[person].label, PERSONS_EN[person].label);
      for (const { portuguese, spanish } of columns) {
        const portugueseCell = row.insertCell();
        portugueseCell.className = "pt";
        portugueseCell.textContent = answersFor(portuguese, person).join(" / ");
        if (!spanish) continue;
        const spanishCell = row.insertCell();
        spanishCell.className = "es";
        spanishCell.textContent = spanish[person];
      }
    }
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
