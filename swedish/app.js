// Polynoun, Swedish: the game and the tables. Shared helpers are in ../js/trainer.js.
// Each question shows a noun with its article; the player types the plural.

// ---- Words on the page ----

// The four levels, by how predictable the plural is rather than how rare the word is
const LEVELS = {
  easy:   { label: "Lätt", en: "Easy",
            about: ["Helt förutsägbara: ordets form avslöjar pluralen.", "Fully predictable: the shape of the word gives the plural away."] },
  medium: { label: "Medel", en: "Medium",
            about: ["Vanliga mönster, men vilket gäller här?", "Common patterns, but which one applies here?"] },
  hard:   { label: "Svår", en: "Hard",
            about: ["Omljud, luriga ändelser och oregelbundna ord.", "Vowel changes, deceptive endings and true irregulars."] },
  short:  { label: "Enstaviga", en: "One syllable",
            about: ["Enstaviga en-ord: -ar eller -er? Inga omljud, bara ändelser man måste kunna.", "One-syllable en-words: -ar or -er? No vowel changes, just endings you have to know."] },
};

const GROUPS = {
  or: { label: "-or", en: "Plural in -or",
        about: ["Plural på -or: en-ord på -a (en flicka, flickor).", "Plural in -or: en-words ending in -a (en flicka, flickor)."] },
  ar: { label: "-ar", en: "Plural in -ar",
        about: ["Plural på -ar: många en-ord, särskilt på -e, -ning, -dom och obetonat -el, -er, -en.", "Plural in -ar: many en-words, especially those in -e, -ning, -dom and unstressed -el, -er, -en."] },
  er: { label: "-er", en: "Plural in -er or -r",
        about: ["Plural på -er eller -r: lånord, ord på -het och -ion, och korta ord på vokal (en sko, skor).", "Plural in -er or -r: loanwords, words in -het and -ion, and short words ending in a vowel (en sko, skor)."] },
  n:  { label: "-n", en: "Plural in -n",
        about: ["Plural på -n: ett-ord som slutar på vokal (ett äpple, äpplen).", "Plural in -n: neuter words ending in a vowel (ett äpple, äpplen)."] },
  0:  { label: "Ingen", en: "No ending",
        about: ["Ingen ändelse: ett-ord på konsonant och en-ord på -are och -iker.", "No ending: neuter words ending in a consonant, and en-words in -are and -iker."] },
  x:  { label: "Övriga", en: "The rest: vowel changes and oddities",
        about: ["Övriga: omljud (en bok, böcker), -on (ett öga, ögon) och andra undantag.", "The rest: vowel changes (en bok, böcker), -on (ett öga, ögon) and other exceptions."] },
};

// ---- The nouns ----

// nouns.js lists each noun as [singular with article, plural, group, English, hint].
const toNoun = ([singular, plural, group, english, hint]) => {
  const [article, ...rest] = singular.split(" ");
  return { singular, article, base: rest.join(" "), plural, group, english,
           hint: typeof hint === "string" ? HINTS[hint] : hint };
};
const LEVEL_NOUNS = Object.fromEntries(Object.entries(POOLS).map(([level, nouns]) => [level, nouns.map(toNoun)]));

// Every noun once, for the tables
const ALL_NOUNS = [...new Map(Object.values(LEVEL_NOUNS).flat().map(noun => [noun.singular, noun])).values()];

// The rule for a noun, and a word on vowels that were there all along:
// "häst, hästar" has no umlaut, the ä is in the singular too.
function explain(noun) {
  let [swedish, english] = noun.hint;
  const kept = ["ä", "ö"].find(vowel => noun.base.includes(vowel));
  if (noun.group !== "x" && kept) {
    swedish += ` ${kept.toUpperCase()}:et fanns redan, så inget omljud.`;
    english += ` The ${kept} was there already, so no vowel change.`;
  }
  return [swedish, english];
}

// The noun as the question shows it: the article quieter than the word
function nounWithArticle(noun) {
  const span = makeElement("span");
  span.append(makeElement("span", "art", noun.article), " ", noun.base);
  return withEnglish(span, noun.english);
}

// ---- The page ----

const answerInput = byId("ans"), feedback = byId("fb"), mainButton = byId("go");
const progress = byId("prog"), scoreLabel = byId("score"), progressBar = byId("fill");

// ---- Settings ----

let level = "easy", questionCount = 20, tableGroup = "or";

singleChoice("level", value => { level = value; describeLevel(); });
singleChoice("count", value => { questionCount = Number(value); describeLevel(); });
singleChoice("tgroup", value => { tableGroup = value; buildTables(); });

// The level's description, its size, and a warning when the round would be shorter than asked
function describeLevel() {
  const [swedish, english] = LEVELS[level].about;
  const size = LEVEL_NOUNS[level].length;
  const short = size < questionCount;
  setText(byId("about"),
    `${swedish} ${size} ord` + (short ? `, så rundan blir ${size} frågor.` : "."),
    `${english} ${size} words` + (short ? `, so the round will be ${size} questions.` : "."));
}
describeLevel();

addLetterKeys(["å", "ä", "ö"], answerInput);

// ---- The round ----

let questions = [], questionIndex = 0, score = 0, mistakes = [];
let phase = ""; // "ask" while the player types, "review" while the answer shows

function startRound() {
  questions = shuffled(LEVEL_NOUNS[level]).slice(0, questionCount);
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
  const noun = questions[questionIndex];
  const number = questionIndex + 1, total = questions.length;
  phase = "ask";
  setText(progress, `Fråga ${number} av ${total}`, `Question ${number} of ${total}`);
  showScore();
  progressBar.style.width = (questionIndex / total * 100) + "%";
  const word = byId("word");
  word.textContent = "";
  word.append(nounWithArticle(noun));
  answerInput.value = "";
  answerInput.readOnly = false;
  answerInput.className = "";
  setLetterKeysEnabled(true);
  feedback.hidden = true;
  setText(mainButton, "Kontrollera", "Check");
  answerInput.focus();
}

function checkAnswer() {
  const noun = questions[questionIndex];
  const typed = answerInput.value.trim();
  if (!typed) { answerInput.focus(); return; }
  const right = accepts(noun.plural, typed);
  if (right) score++;
  else mistakes.push({ noun, typed });

  answerInput.readOnly = true;
  answerInput.className = right ? "ok" : "bad";
  setLetterKeysEnabled(false);

  feedback.hidden = false;
  feedback.className = "fb " + (right ? "ok" : "bad");
  feedback.textContent = "";
  if (right) {
    feedback.append(setText(makeElement("span"), "Rätt", "Correct"));
  } else {
    const answer = makeElement("span", "fa");
    answer.append(markedSpellings(noun.plural, noun.base, "eller"));
    feedback.append(setText(makeElement("span"), "Det heter", "It's"), " ", answer);
    if (normalizeAnswer(typed) === normalizeAnswer(noun.base)) {
      feedback.append(setText(makeElement("span", "k"), `”${typed}” är singular.`, `“${typed}” is the singular.`));
    }
  }
  const [swedish, english] = explain(noun);
  feedback.append(setText(makeElement("span", "rule"), swedish, english));

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

onEnter(answerInput, onMainButton);

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
  const body = table.createTBody();
  for (const { noun, typed } of mistakes) {
    const row = body.insertRow();
    const heading = makeElement("th");
    heading.scope = "row";
    heading.append(nounWithArticle(noun));
    row.append(heading);
    const cell = row.insertCell();
    const answer = makeElement("span", "yes");
    answer.append(markedSpellings(noun.plural, noun.base, "eller"));
    cell.append(makeElement("span", "no", typed), answer);
  }
}

// ---- Tables ----

// One plural group, every noun in it, alphabetical (Swedish order: å, ä, ö after z).
function buildTables() {
  const nouns = ALL_NOUNS.filter(noun => noun.group === tableGroup)
    .sort((a, b) => a.base.localeCompare(b.base, "sv"));
  const [swedish, english] = GROUPS[tableGroup].about;
  setText(byId("tabout"), swedish, english);
  setText(byId("tcount"), `${nouns.length} ord`, `${nouns.length} words`);

  const table = byId("tbl");
  table.textContent = "";
  const header = table.createTHead().insertRow();
  header.append(setText(makeElement("th"), "singular", "singular"), setText(makeElement("th"), "plural", "plural"));
  const body = table.createTBody();
  for (const noun of nouns) {
    const row = body.insertRow();
    row.insertCell().append(nounWithArticle(noun));
    row.insertCell().append(markedSpellings(noun.plural, noun.base, "eller"));
  }
}

// ---- Wiring ----

byId("start").onclick = startRound;
mainButton.onclick = onMainButton;
byId("again").onclick = startRound;
byId("change").onclick = () => showSection("setup");
window.addEventListener("hashchange", updateView);
updateView();
