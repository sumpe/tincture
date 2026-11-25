// Polynoun, Swedish: two games and the tables. Shared helpers are in ../js/trainer.js.
// Plural: a noun with its article; the player types the plural.
// En eller ett: a noun without its article; the player picks en or ett.

// ---- Words on the page ----

// The levels go by how predictable the answer is rather than how rare the word is.
const PLURAL_LEVELS = {
  easy:   ["Helt förutsägbara: ordets form avslöjar pluralen.", "Fully predictable: the shape of the word gives the plural away."],
  medium: ["Vanliga mönster, men vilket gäller här?", "Common patterns, but which one applies here?"],
  hard:   ["Omljud, luriga ändelser och oregelbundna ord.", "Vowel changes, deceptive endings and true irregulars."],
  short:  ["Enstaviga en-ord: -ar eller -er? Inga omljud, bara ändelser man måste kunna.", "One-syllable en-words: -ar or -er? No vowel changes, just endings you have to know."],
};
const GENUS_LEVELS = {
  easy:   ["Ändelsen avslöjar svaret: -ning och -het är en, -um och -eri är ett.", "The ending gives it away: -ning and -het are en, -um and -eri are ett."],
  medium: ["Vardagsord utan avslöjande ändelse: tendenser, men ingen regel.", "Everyday words with no telling ending: tendencies, but no rule."],
  hard:   ["Ord som bryter mönstren, och ämnen, där det inte finns någon regel alls.", "Words that break the patterns, and substances, where there's no rule at all."],
};

const PLURAL_GROUPS = {
  or: ["Plural på -or: en-ord på -a (en flicka, flickor).", "Plural in -or: en-words ending in -a (en flicka, flickor)."],
  ar: ["Plural på -ar: många en-ord, särskilt på -e, -ning, -dom och obetonat -el, -er, -en.", "Plural in -ar: many en-words, especially those in -e, -ning, -dom and unstressed -el, -er, -en."],
  er: ["Plural på -er eller -r: lånord, ord på -het och -ion, och korta ord på vokal (en sko, skor).", "Plural in -er or -r: loanwords, words in -het and -ion, and short words ending in a vowel (en sko, skor)."],
  n:  ["Plural på -n: ett-ord som slutar på vokal (ett äpple, äpplen).", "Plural in -n: neuter words ending in a vowel (ett äpple, äpplen)."],
  0:  ["Ingen ändelse: ett-ord på konsonant och en-ord på -are och -iker.", "No ending: neuter words ending in a consonant, and en-words in -are and -iker."],
  x:  ["Övriga: omljud (en bok, böcker), -on (ett öga, ögon) och andra undantag.", "The rest: vowel changes (en bok, böcker), -on (ett öga, ögon) and other exceptions."],
};
const GENUS_GROUPS = {
  en:  ["En-ord får -en eller -n i bestämd form: bilen, flickan.", "En-words take -en or -n in the definite form: bilen, flickan."],
  ett: ["Ett-ord får -et eller -t i bestämd form: huset, äpplet.", "Ett-words take -et or -t in the definite form: huset, äpplet."],
};

// ---- The nouns ----

const splitArticle = withArticle => {
  const [article, ...rest] = withArticle.split(" ");
  return { article, base: rest.join(" ") };
};
const hintPair = (hint, hints) => typeof hint === "string" ? hints[hint] : hint;

// nouns.js lists each plural noun as [singular with article, plural, group, English, hint],
// and each en/ett noun as [noun with article, definite singular, English, hint].
const toPluralNoun = ([singular, plural, group, english, hint]) =>
  ({ singular, ...splitArticle(singular), plural, group, english, hint: hintPair(hint, HINTS) });
const toGenusNoun = ([singular, definite, english, hint]) =>
  ({ singular, ...splitArticle(singular), definite, english, hint: hintPair(hint, GENUS_HINTS) });

const byLevel = (pools, toNoun) => Object.fromEntries(Object.entries(pools).map(([level, nouns]) => [level, nouns.map(toNoun)]));
const PLURAL_NOUNS = byLevel(POOLS, toPluralNoun);
const GENUS_NOUNS = byLevel(GENUS_POOLS, toGenusNoun);

// Every noun once, for the tables
const everyNoun = levels => [...new Map(Object.values(levels).flat().map(noun => [noun.singular, noun])).values()];
const ALL_PLURAL_NOUNS = everyNoun(PLURAL_NOUNS);
const ALL_GENUS_NOUNS = everyNoun(GENUS_NOUNS);

// The plural rule for a noun, and a word on vowels that were there all along:
// "häst, hästar" has no umlaut, the ä is in the singular too.
function explainPlural(noun) {
  let [swedish, english] = noun.hint;
  const kept = ["ä", "ö"].find(vowel => noun.base.includes(vowel));
  if (noun.group !== "x" && kept) {
    swedish += ` ${kept.toUpperCase()}:et fanns redan, så inget omljud.`;
    english += ` The ${kept} was there already, so no vowel change.`;
  }
  return [swedish, english];
}

// The noun with its article, the article quieter than the word
function nounWithArticle(noun) {
  const span = makeElement("span");
  span.append(makeElement("span", "art", noun.article), " ", noun.base);
  return withEnglish(span, noun.english);
}

// ---- The page ----

const answerInput = byId("ans"), feedback = byId("fb"), mainButton = byId("go");
const progress = byId("prog"), scoreLabel = byId("score"), progressBar = byId("fill");
const pickButtons = [...document.querySelectorAll("#pick button")];

// ---- Settings ----

let game = "plural";                       // or "genus", en or ett
const level = { plural: "easy", genus: "easy" };
let questionCount = 20;
let tableGame = "plural";
const tableGroup = { plural: "or", genus: "en" };

singleChoice("game", value => { game = value; showGameSettings(); });
singleChoice("plural-level", value => { level.plural = value; describeLevel(); });
singleChoice("genus-level", value => { level.genus = value; describeLevel(); });
singleChoice("count", value => { questionCount = Number(value); describeLevel(); });
singleChoice("tgame", value => { tableGame = value; buildTables(); });
singleChoice("tplural", value => { tableGroup.plural = value; buildTables(); });
singleChoice("tgenus", value => { tableGroup.genus = value; buildTables(); });

const poolFor = () => (game === "plural" ? PLURAL_NOUNS : GENUS_NOUNS)[level[game]];

function showGameSettings() {
  byId("plural-level").hidden = game !== "plural";
  byId("genus-level").hidden = game !== "genus";
  describeLevel();
}

// The level's description, its size, and a warning when the round would be shorter than asked
function describeLevel() {
  const [swedish, english] = (game === "plural" ? PLURAL_LEVELS : GENUS_LEVELS)[level[game]];
  const size = poolFor().length;
  const short = size < questionCount;
  setText(byId("about"),
    `${swedish} ${size} ord` + (short ? `, så rundan blir ${size} frågor.` : "."),
    `${english} ${size} words` + (short ? `, so the round will be ${size} questions.` : "."));
}
showGameSettings();

addLetterKeys(["å", "ä", "ö"], answerInput);

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
  setText(byId("ask"), typing ? "Plural av" : "En eller ett?", typing ? "The plural of" : "En or ett?");
  showSection("quiz");
  showQuestion();
}

function showScore() {
  setText(scoreLabel, `Poäng ${score}`, `Score ${score}`);
}

function showQuestion() {
  const noun = questions[questionIndex];
  const number = questionIndex + 1, total = questions.length;
  phase = "ask";
  setText(progress, `Fråga ${number} av ${total}`, `Question ${number} of ${total}`);
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
    setText(mainButton, "Kontrollera", "Check");
    answerInput.focus();
  } else {
    word.append(makeElement("span", "blank"), " ", withEnglish(makeElement("span", null, noun.base), noun.english));
    for (const button of pickButtons) { button.disabled = false; button.className = ""; }
    mainButton.hidden = true;
    // Nothing keeps the focus, so an Enter pressed to move on can't also answer "en"; E and T answer.
    document.activeElement?.blur();
  }
}

// Plural: compare what was typed with the plural
function checkPlural() {
  const noun = questions[questionIndex];
  const typed = answerInput.value.trim();
  if (!typed) { answerInput.focus(); return; }
  const right = accepts(noun.plural, typed);
  answerInput.readOnly = true;
  answerInput.className = right ? "ok" : "bad";
  setLetterKeysEnabled(false);

  const answer = makeElement("span", "fa");
  answer.append(markedSpellings(noun.plural, noun.base, "eller"));
  const notes = [];
  if (!right && normalizeAnswer(typed) === normalizeAnswer(noun.base)) {
    notes.push([`”${typed}” är singular.`, `“${typed}” is the singular.`]);
  }
  finishQuestion(noun, typed, right, answer, notes, explainPlural(noun));
}

// En or ett: the chosen article; the blank fills in with the right one
function checkGenus(article) {
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
  const notes = [[`Bestämd form: ${noun.definite}.`, `Definite form: ${noun.definite}.`]];
  finishQuestion(noun, article, right, answer, notes, noun.hint);
  mainButton.hidden = false;
  mainButton.focus();
}

// What both games do once an answer is in: score it, say so, and offer the next question
function finishQuestion(noun, typed, right, answer, notes, [swedish, english]) {
  if (right) score++;
  else mistakes.push({ noun, typed });
  feedback.hidden = false;
  feedback.className = "fb " + (right ? "ok" : "bad");
  feedback.textContent = "";
  if (right) feedback.append(setText(makeElement("span"), "Rätt", "Correct"), ": ", answer);
  else feedback.append(setText(makeElement("span"), "Det heter", "It's"), " ", answer);
  for (const [sv, en] of notes) feedback.append(setText(makeElement("span", "k"), sv, en));
  feedback.append(setText(makeElement("span", "rule"), swedish, english));

  showScore();
  showProgress(progressBar, questionIndex + 1, score, questions.length);
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
  if (phase === "ask") checkPlural();
  else nextQuestion();
}

onEnter(answerInput, onMainButton);
for (const button of pickButtons) button.onclick = () => checkGenus(button.dataset.v);

// In en or ett, E or 1 answers en and T or 2 answers ett, from anywhere on the page.
document.addEventListener("keydown", event => {
  if (roundGame !== "genus" || phase !== "ask" || byId("quiz").hidden) return;
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === "e" || key === "1") checkGenus("en");
  else if (key === "t" || key === "2") checkGenus("ett");
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
  const plural = roundGame === "plural";
  const heads = table.tHead.rows[0].cells;
  setText(heads[0], plural ? "singular" : "ord", plural ? "singular" : "word");
  setText(heads[1], plural ? "plural" : "rätt svar", plural ? "plural" : "the answer");
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
    if (plural) answer.append(markedSpellings(noun.plural, noun.base, "eller"));
    else answer.append(noun.singular);
    cell.append(makeElement("span", "no", plural ? typed : `${typed} ${noun.base}`), answer);
  }
}

// ---- Tables ----

// One plural group, or every en- or ett-word, alphabetical (Swedish order: å, ä, ö after z)
function buildTables() {
  const plural = tableGame === "plural";
  byId("tplural").hidden = !plural;
  byId("tgenus").hidden = plural;
  const group = tableGroup[tableGame];
  const nouns = (plural
    ? ALL_PLURAL_NOUNS.filter(noun => noun.group === group)
    : ALL_GENUS_NOUNS.filter(noun => noun.article === group))
    .sort((a, b) => a.base.localeCompare(b.base, "sv"));
  const [swedish, english] = (plural ? PLURAL_GROUPS : GENUS_GROUPS)[group];
  setText(byId("tabout"), swedish, english);
  setText(byId("tcount"), `${nouns.length} ord`, `${nouns.length} words`);

  const table = byId("tbl");
  table.textContent = "";
  const header = table.createTHead().insertRow();
  header.append(setText(makeElement("th"), "singular", "singular"),
    plural ? setText(makeElement("th"), "plural", "plural") : setText(makeElement("th"), "bestämd form", "definite form"));
  const body = table.createTBody();
  for (const noun of nouns) {
    const row = body.insertRow();
    row.insertCell().append(nounWithArticle(noun));
    row.insertCell().append(plural
      ? markedSpellings(noun.plural, noun.base, "eller")
      : markedForm(noun.definite, noun.base));
  }
}

// ---- Wiring ----

byId("start").onclick = startRound;
mainButton.onclick = onMainButton;
byId("again").onclick = startRound;
byId("change").onclick = () => showSection("setup");
window.addEventListener("hashchange", updateView);
updateView();
