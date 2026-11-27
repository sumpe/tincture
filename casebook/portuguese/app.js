// Casebook, Portuguese: two games and the tables. Shared helpers are in ../js/trainer.js.
// Plural: a noun with its article; the player types the plural.
// O ou a: a noun without its article; the player picks o or a.

// ---- Words on the page ----

// The levels go by how predictable the answer is rather than how rare the word is.
const PLURAL_LEVELS = {
  easy:   ["Totalmente previsíveis: a última letra diz o plural.", "Fully predictable: the last letter gives the plural away."],
  medium: ["Regras claras, mas qual se aplica? Muitas vezes depende da sílaba tónica.", "Clear rules, but which one applies? It often depends on the stressed syllable."],
  hard:   ["O imprevisível: -ão, diminutivos, compostos e irregulares.", "The unpredictable: -ão, diminutives, compounds and irregulars."],
  ao:     ["Só palavras em -ão: -ões, -ães ou -ãos? A maioria faz -ões; o espanhol ajuda muitas vezes.", "Only words in -ão: -ões, -ães or -ãos? Most take -ões; Spanish often helps."],
};
const GENDER_LEVELS = {
  easy:   ["A terminação diz tudo: -o e -mento são masculinas; -a, -ção, -dade e -gem são femininas.", "The ending gives it away: -o and -mento are masculine; -a, -ção, -dade and -gem are feminine."],
  medium: ["Palavras do dia a dia em -e ou em consoante: tendências, mas nenhuma regra.", "Everyday words ending in -e or a consonant: tendencies, but no rule."],
  hard:   ["Palavras que quebram as regras: o problema, a foto, a flor.", "Words that break the rules: o problema, a foto, a flor."],
};

const PLURAL_GROUPS = {
  s:  ["Plural em -s: palavras que acabam em vogal ou ditongo (a casa, as casas).", "Plural in -s: words ending in a vowel or a diphthong (a casa, as casas)."],
  ns: ["Plural em -ns: palavras em -m (o homem, os homens).", "Plural in -ns: words ending in -m (o homem, os homens)."],
  es: ["Plural em -es: palavras em -r, -z e -s tónico (a flor, as flores; o mês, os meses).", "Plural in -es: words ending in -r, -z and stressed -s (a flor, as flores; o mês, os meses)."],
  is: ["Plural em -is: palavras em -l (o animal, os animais; o papel, os papéis).", "Plural in -is: words ending in -l (o animal, os animais; o papel, os papéis)."],
  0:  ["Sem mudança: palavras em -s átono e em -x (o lápis, os lápis).", "No change: words ending in unstressed -s and in -x (o lápis, os lápis)."],
  ão: ["Palavras em -ão: -ões, -ães ou -ãos.", "Words in -ão: -ões, -ães or -ãos."],
  x:  ["Os restantes: compostos, diminutivos e irregulares.", "The rest: compounds, diminutives and irregulars."],
};
const GENDER_GROUPS = {
  o: ["Masculinas: o e os.", "Masculine: o and os."],
  a: ["Femininas: a e as.", "Feminine: a and as."],
};

// ---- The nouns ----

const splitArticle = withArticle => {
  const [article, ...rest] = withArticle.split(" ");
  return { article, base: rest.join(" ") };
};
const hintPair = (hint, hints) => typeof hint === "string" ? hints[hint] : hint;

// nouns.js lists each plural noun as [singular with article, plural, group, English, hint, Spanish plural?],
// and each gender noun as [noun with article, plural with article, English, hint, Spanish?].
const toPluralNoun = ([singular, plural, group, english, hint, spanish]) =>
  ({ singular, ...splitArticle(singular), plural, group, english, hint: hintPair(hint, HINTS), spanish });
const toGenderNoun = ([singular, plural, english, hint, spanish]) =>
  ({ singular, ...splitArticle(singular), plural: splitArticle(plural).base, english, hint: hintPair(hint, GENDER_HINTS), spanish });

const byLevel = (pools, toNoun) => Object.fromEntries(Object.entries(pools).map(([level, nouns]) => [level, nouns.map(toNoun)]));
const PLURAL_NOUNS = byLevel(POOLS, toPluralNoun);
const GENDER_NOUNS = byLevel(GENDER_POOLS, toGenderNoun);

// Every noun once, for the tables
const everyNoun = levels => [...new Map(Object.values(levels).flat().map(noun => [noun.singular, noun])).values()];
const ALL_PLURAL_NOUNS = everyNoun(PLURAL_NOUNS);
const ALL_GENDER_NOUNS = everyNoun(GENDER_NOUNS);

const pluralArticle = noun => noun.article + "s";

// The noun with its article, the article quieter than the word
function nounWithArticle(noun) {
  const span = makeElement("span");
  span.append(makeElement("span", "art", noun.article), " ", noun.base);
  return withEnglish(span, noun.english);
}

// The plural with its article, the part that changed marked
function pluralWithArticle(noun) {
  const span = makeElement("span");
  span.append(makeElement("span", "art", pluralArticle(noun)), " ", markedSpellings(noun.plural, noun.base, "ou"));
  return span;
}

// A plural may be typed with its article: "os livros" is as good as "livros", but "as livros" isn't.
function acceptsPlural(noun, typed) {
  if (accepts(noun.plural, typed)) return true;
  const [first, ...rest] = normalizeAnswer(typed).split(" ");
  return first === pluralArticle(noun) && accepts(noun.plural, rest.join(" "));
}

// ---- The page ----

const answerInput = byId("ans"), feedback = byId("fb"), mainButton = byId("go");
const progress = byId("prog"), scoreLabel = byId("score"), progressBar = byId("fill");
const pickButtons = [...document.querySelectorAll("#pick button")];

// ---- Settings ----

let game = "plural";                       // or "gender", o or a
const level = { plural: "easy", gender: "easy" };
let questionCount = 20;
let tableGame = "plural";
const tableGroup = { plural: "s", gender: "o" };

singleChoice("game", value => { game = value; showGameSettings(); });
singleChoice("plural-level", value => { level.plural = value; describeLevel(); });
singleChoice("gender-level", value => { level.gender = value; describeLevel(); });
singleChoice("count", value => { questionCount = Number(value); describeLevel(); });
singleChoice("tgame", value => { tableGame = value; buildTables(); });
singleChoice("tplural", value => { tableGroup.plural = value; buildTables(); });
singleChoice("tgender", value => { tableGroup.gender = value; buildTables(); });

const poolFor = () => (game === "plural" ? PLURAL_NOUNS : GENDER_NOUNS)[level[game]];

function showGameSettings() {
  byId("plural-level").hidden = game !== "plural";
  byId("gender-level").hidden = game !== "gender";
  describeLevel();
}

// The level's description, its size, and a warning when the round would be shorter than asked
function describeLevel() {
  const [portuguese, english] = (game === "plural" ? PLURAL_LEVELS : GENDER_LEVELS)[level[game]];
  const size = poolFor().length;
  const short = size < questionCount;
  setText(byId("about"),
    `${portuguese} ${size} palavras` + (short ? `, por isso a ronda terá ${size} perguntas.` : "."),
    `${english} ${size} words` + (short ? `, so the round will be ${size} questions.` : "."));
}
showGameSettings();

addLetterKeys(["á", "à", "â", "ã", "é", "ê", "í", "ó", "ô", "õ", "ú", "ç"], answerInput);

// ---- The round ----

let questions = [], questionIndex = 0, score = 0, mistakes = [];
let roundGame = "plural";
let phase = ""; // "ask" while the player answers, "review" while the answer shows

function startRound() {
  roundGame = game;
  questions = shuffled(poolFor()).slice(0, questionCount);
  questionIndex = 0;
  score = 0;
  mistakes = [];
  const typing = roundGame === "plural";
  answerInput.hidden = byId("keys").hidden = !typing;
  byId("pick").hidden = typing;
  setText(byId("ask"), typing ? "O plural de" : "O ou a?", typing ? "The plural of" : "O or a?");
  showSection("quiz");
  showQuestion();
}

function showScore() {
  setText(scoreLabel, `Pontos ${score}`, `Score ${score}`);
}

function showQuestion() {
  const noun = questions[questionIndex];
  const number = questionIndex + 1, total = questions.length;
  phase = "ask";
  setText(progress, `Pergunta ${number} de ${total}`, `Question ${number} of ${total}`);
  showScore();
  showProgress(progressBar, questionIndex, score, total);
  const word = byId("word");
  word.textContent = "";
  feedback.hidden = true;
  if (roundGame === "plural") {
    word.append(nounWithArticle(noun));
    answerInput.value = "";
    answerInput.readOnly = false;
    answerInput.className = "";
    setLetterKeysEnabled(true);
    mainButton.hidden = false;
    setText(mainButton, "Verificar", "Check");
    answerInput.focus();
  } else {
    word.append(makeElement("span", "blank"), " ", withEnglish(makeElement("span", null, noun.base), noun.english));
    for (const button of pickButtons) { button.disabled = false; button.className = ""; }
    mainButton.hidden = true;
    // Nothing keeps the focus, so an Enter pressed to move on can't also answer "o"; O and A answer.
    document.activeElement?.blur();
  }
}

// Plural: compare what was typed with the plural
function checkPlural() {
  const noun = questions[questionIndex];
  const typed = answerInput.value.trim();
  if (!typed) { answerInput.focus(); return; }
  const right = acceptsPlural(noun, typed);
  answerInput.readOnly = true;
  answerInput.className = right ? "ok" : "bad";
  setLetterKeysEnabled(false);

  const answer = makeElement("span", "fa");
  answer.append(markedSpellings(noun.plural, noun.base, "ou"));
  const notes = [];
  const bare = normalizeAnswer(typed).replace(/^[oa]s? /, "");
  if (!right && bare === normalizeAnswer(noun.base)) {
    notes.push([`«${typed}» é o singular.`, `“${typed}” is the singular.`]);
  } else if (!right && accepts(noun.plural, bare)) {
    notes.push([`O plural certo, mas o artigo é ${pluralArticle(noun)}.`, `The right plural, but the article is ${pluralArticle(noun)}.`]);
  }
  notes.push(...otherForms(noun, typed, right));
  if (noun.spanish) notes.push([`Em espanhol: ${noun.spanish}.`, `In Spanish: ${noun.spanish}.`]);
  finishQuestion(noun, typed, right, answer, notes, noun.hint);
}

// When more than one plural is right: after a right answer, the others; after a wrong one, that all of them count
function otherForms(noun, typed, right) {
  const forms = spellings(noun.plural);
  if (forms.length < 2) return [];
  if (!right) {
    return forms.length === 2
      ? [["As duas formas estão certas.", "Both forms are right."]]
      : [[`As ${forms.length === 3 ? "três" : forms.length} formas estão certas.`, `All ${forms.length} forms are right.`]];
  }
  const others = forms.filter(form => !acceptsPlural({ ...noun, plural: form }, typed)).join(" ou ");
  return [[`Também está certo: ${others}.`, `Also right: ${others.replace(/ ou /g, " or ")}.`]];
}

// O or a: the chosen article; the blank fills in with the right one
function checkGender(article) {
  if (phase !== "ask") return;
  const noun = questions[questionIndex];
  const right = article === noun.article;
  for (const button of pickButtons) {
    button.disabled = true;
    if (button.dataset.v === article) button.className = right ? "ok" : "bad";
    else if (button.dataset.v === noun.article) button.className = "was";
  }
  const blank = byId("word").querySelector(".blank");
  blank.replaceWith(makeElement("span", "filled", noun.article));

  const answer = makeElement("span", "fa", noun.singular);
  const plural = `${pluralArticle(noun)} ${noun.plural}`;
  const notes = [[`Plural: ${plural}.`, `Plural: ${plural}.`]];
  if (noun.spanish) notes.push([`Atenção: em espanhol é ${noun.spanish}.`, `Careful: in Spanish it's ${noun.spanish}.`]);
  finishQuestion(noun, article, right, answer, notes, noun.hint);
  mainButton.hidden = false;
  mainButton.focus();
}

// What both games do once an answer is in: score it, say so, and offer the next question
function finishQuestion(noun, typed, right, answer, notes, [portuguese, english]) {
  if (right) score++;
  else mistakes.push({ noun, typed });
  feedback.hidden = false;
  feedback.className = "fb " + (right ? "ok" : "bad");
  feedback.textContent = "";
  if (right) feedback.append(setText(makeElement("span"), "Correto", "Correct"), ": ", answer);
  else feedback.append(setText(makeElement("span"), "Resposta", "Answer"), " ", answer);
  for (const [pt, en] of notes) feedback.append(setText(makeElement("span", "k"), pt, en));
  feedback.append(setText(makeElement("span", "rule"), portuguese, english));

  showScore();
  showProgress(progressBar, questionIndex + 1, score, questions.length);
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
  if (phase === "ask") checkPlural();
  else nextQuestion();
}

onEnter(answerInput, onMainButton);
for (const button of pickButtons) button.onclick = () => checkGender(button.dataset.v);

// In o or a, O or 1 answers o and A or 2 answers a, from anywhere on the page.
document.addEventListener("keydown", event => {
  if (roundGame !== "gender" || phase !== "ask" || byId("quiz").hidden) return;
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === "o" || key === "1") checkGender("o");
  else if (key === "a" || key === "2") checkGender("a");
});

// ---- Results ----

function showResults() {
  showSection("done");
  const total = questions.length, percent = Math.round(score / total * 100);
  byId("res").textContent = `${score} / ${total}`;
  const perfect = mistakes.length === 0;
  setText(byId("pct"), `${percent}% corretas` + (perfect ? ", sem erros" : ""), `${percent}% correct` + (perfect ? ", no mistakes" : ""));

  const table = byId("miss");
  byId("misshead").hidden = table.hidden = perfect;
  const plural = roundGame === "plural";
  const heads = table.tHead.rows[0].cells;
  setText(heads[0], plural ? "singular" : "palavra", plural ? "singular" : "word");
  setText(heads[1], plural ? "plural" : "resposta", plural ? "plural" : "the answer");
  [...table.tBodies].forEach(body => body.remove());
  const body = table.createTBody();
  for (const { noun, typed } of mistakes) {
    const row = body.insertRow();
    const heading = makeElement("th");
    heading.scope = "row";
    heading.append(plural ? nounWithArticle(noun) : withEnglish(makeElement("span", null, noun.base), noun.english));
    row.append(heading);
    const cell = row.insertCell();
    const answer = makeElement("span", "yes");
    if (plural) answer.append(markedSpellings(noun.plural, noun.base, "ou"));
    else answer.append(noun.singular);
    cell.append(makeElement("span", "no", plural ? typed : `${typed} ${noun.base}`), answer);
  }
}

// ---- Tables ----

// One plural group, or every masculine or feminine noun, in Portuguese alphabetical order
function buildTables() {
  const plural = tableGame === "plural";
  byId("tplural").hidden = !plural;
  byId("tgender").hidden = plural;
  const group = tableGroup[tableGame];
  const nouns = (plural
    ? ALL_PLURAL_NOUNS.filter(noun => noun.group === group)
    : ALL_GENDER_NOUNS.filter(noun => noun.article === group))
    .sort((a, b) => a.base.localeCompare(b.base, "pt"));
  const [portuguese, english] = (plural ? PLURAL_GROUPS : GENDER_GROUPS)[group];
  setText(byId("tabout"), portuguese, english);
  setText(byId("tcount"), `${nouns.length} palavras`, `${nouns.length} words`);

  const table = byId("tbl");
  table.textContent = "";
  const header = table.createTHead().insertRow();
  header.append(setText(makeElement("th"), "singular", "singular"), setText(makeElement("th"), "plural", "plural"));
  const body = table.createTBody();
  for (const noun of nouns) {
    const row = body.insertRow();
    row.insertCell().append(nounWithArticle(noun));
    row.insertCell().append(pluralWithArticle(noun));
  }
}

// ---- Wiring ----

byId("start").onclick = startRound;
mainButton.onclick = onMainButton;
byId("again").onclick = startRound;
byId("change").onclick = () => showSection("setup");
window.addEventListener("hashchange", updateView);
updateView();
