// Metaphrase, Portuguese: an English sentence to translate, into European or Brazilian Portuguese.
// The patterns and the marking are in check.js; the shared helpers in ../js/trainer.js.

const TENSES = {
  pres: ["presente", "present"],
  pret: ["pretérito perfeito", "preterite"],
};
const TENSE_CHOICES = {
  pres: ["Só o presente", "Only the present"],
  pret: ["Só o pretérito perfeito", "Only the preterite"],
  both: ["O presente e o pretérito perfeito", "The present and the preterite"],
};
const SUBTITLES = {
  pe: ["Português europeu. Traduz a frase; os acentos contam.", "European Portuguese. Translate the sentence; accents count."],
  br: ["Português do Brasil. Traduz a frase; os acentos contam. You (informal) é você.", "Brazilian Portuguese. Translate the sentence; accents count. You (informal) is você."],
};
const VARIETY_NAMES = {
  pe: ["Português europeu", "European Portuguese"],
  br: ["Português do Brasil", "Brazilian Portuguese"],
};
const OTHER_VARIETY = {
  pe: ["br", "No Brasil", "In Brazil"],
  br: ["pe", "Em Portugal", "In Portugal"],
};

// ---- Settings ----

// The variety outlasts a visit. localStorage can be missing or refused (some browsers, files opened from disk).
// Before its rename the game was Polyphrase, so a choice saved under that name still counts.
function loadSetting(name, fallback) {
  try { return localStorage.getItem("metaphrase-pt-" + name) ?? localStorage.getItem("polyphrase-pt-" + name) ?? fallback; } catch { return fallback; }
}
function saveSetting(name, value) {
  try { localStorage.setItem("metaphrase-pt-" + name, value); } catch { /* not remembered, that's all */ }
}

let variety = loadSetting("variant", "pe") === "br" ? "br" : "pe";
let tense = "both";
let questionCount = 20;
let tableTense = "pres";

const poolFor = chosen => SENTENCES.filter(sentence => chosen === "both" || sentence.tense === chosen);

// The variety can be chosen on the setup screen or above the list of sentences; both show the same choice.
function chooseVariety(value) {
  variety = value;
  saveSetting("variant", value);
  showVariety();
  if (location.hash === "#tables") buildTables();
}
function showVariety() {
  document.querySelectorAll("#variant button, #tbl-variant button").forEach(button => setPressed(button, button.dataset.v === variety));
  setText(byId("sub"), ...SUBTITLES[variety]);
  document.documentElement.lang = variety === "br" ? "pt-BR" : "pt-PT";
}

singleChoice("variant", chooseVariety);
singleChoice("tbl-variant", chooseVariety);
singleChoice("tense", value => { tense = value; describePool(); });
singleChoice("count", value => { questionCount = Number(value); describePool(); });
singleChoice("ttense", value => { tableTense = value; buildTables(); });

// The tenses chosen, how many sentences that is, and a warning when the round would be shorter than asked
function describePool() {
  const [portuguese, english] = TENSE_CHOICES[tense];
  const size = poolFor(tense).length;
  const short = size < questionCount;
  setText(byId("about"),
    `${portuguese}: ${size} frases` + (short ? `, por isso a ronda terá ${size}.` : "."),
    `${english}: ${size} sentences` + (short ? `, so the round will be ${size}.` : "."));
}

showVariety();
describePool();

const answerInput = byId("ans"), feedback = byId("fb"), mainButton = byId("go");
const progress = byId("prog"), scoreLabel = byId("score"), progressBar = byId("fill");
addLetterKeys(["á", "à", "â", "ã", "é", "ê", "í", "ó", "ô", "õ", "ú", "ç"], answerInput);

// ---- Showing an answer ----

// The answer, with the words that differ from what was typed underlined
function markedAnswer(marked) {
  const span = makeElement("span");
  marked.forEach((word, k) => {
    if (k > 0) span.append(" ");
    span.append(word.changed ? makeElement("span", "end", word.shown) : word.shown);
  });
  return span;
}

// A non-breaking hyphen before an ending (-aram), so a line never breaks between the two
const keepEndings = text => text.replace(/(^|[\s(])-(?=\p{L})/gu, "$1\u2011");

const englishSentence = sentence => {
  const span = makeElement("span", null, sentence.english);
  span.lang = "en";
  return span;
};

// ---- The round ----

let questions = [], questionIndex = 0, score = 0, mistakes = [];
let roundVariety = "pe";
let phase = ""; // "ask" while the player answers, "review" while the answer shows

function startRound() {
  roundVariety = variety;
  questions = shuffled(poolFor(tense)).slice(0, questionCount);
  questionIndex = 0;
  score = 0;
  mistakes = [];
  showSection("quiz");
  showQuestion();
}

function showScore() {
  setText(scoreLabel, `Pontos ${score}`, `Score ${score}`);
}

function showQuestion() {
  const sentence = questions[questionIndex];
  const number = questionIndex + 1, total = questions.length;
  phase = "ask";
  setText(progress, `Frase ${number} de ${total}`, `Sentence ${number} of ${total}`);
  showScore();
  showProgress(progressBar, questionIndex, score, total);
  byId("en").textContent = sentence.english;
  const [portuguese, english] = TENSES[sentence.tense];
  const voce = roundVariety === "br" && sentence.english.startsWith("You (informal)");
  setText(byId("tag"), portuguese + (voce ? " · you = você" : ""), english + (voce ? " · you is você" : ""));
  feedback.hidden = true;
  answerInput.value = "";
  answerInput.readOnly = false;
  answerInput.className = "";
  setLetterKeysEnabled(true);
  setText(mainButton, "Verificar", "Check");
  answerInput.focus();
}

function checkAnswer() {
  const sentence = questions[questionIndex];
  const typed = answerInput.value.trim();
  if (!typed) { answerInput.focus(); return; }
  const result = markAnswer(sentence, roundVariety, typed);
  answerInput.readOnly = true;
  answerInput.className = result.right ? "ok" : "bad";
  setLetterKeysEnabled(false);

  if (result.right) score++;
  else mistakes.push({ sentence, typed, marked: result.marked });

  feedback.hidden = false;
  feedback.className = "fb " + (result.right ? "ok" : "bad");
  feedback.textContent = "";
  const answer = makeElement("span", "fa");
  answer.append(markedAnswer(result.marked));
  if (result.right) feedback.append(setText(makeElement("span"), "Correto", "Correct"), ": ", answer);
  else feedback.append(setText(makeElement("span"), "Resposta", "Answer"), ": ", answer);

  for (const [pt, en] of result.notes) feedback.append(setText(makeElement("span", "fix"), keepEndings(pt), en));
  // A right answer that isn't the usual one: the usual one too
  const usual = mainAnswer(sentence, roundVariety);
  if (result.right && !result.usual) {
    feedback.append(setText(makeElement("span", "k"), `Também se diz: ${usual}`, `Also said: ${usual}`));
  }
  for (const [pt, en] of sentenceNotes(sentence, roundVariety)) feedback.append(setText(makeElement("span", "rule"), keepEndings(pt), en));
  // The other variety's answer, unless the only difference is the pronoun Brazil shows
  const [other, portugueseWhere, englishWhere] = OTHER_VARIETY[roundVariety];
  const otherAnswer = mainAnswer(sentence, other);
  if (!sameMainAnswer(sentence)) {
    feedback.append(setText(makeElement("span", "k"), `${portugueseWhere}: ${otherAnswer}`, `${englishWhere}: ${otherAnswer}`));
  }

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
  setText(byId("pct"), `${percent}% corretas` + (perfect ? ", sem erros" : ""), `${percent}% correct` + (perfect ? ", no mistakes" : ""));

  const table = byId("miss");
  byId("misshead").hidden = table.hidden = perfect;
  [...table.tBodies].forEach(body => body.remove());
  const body = table.createTBody();
  for (const { sentence, typed, marked } of mistakes) {
    const row = body.insertRow();
    const heading = makeElement("th");
    heading.scope = "row";
    heading.append(englishSentence(sentence));
    row.append(heading);
    const cell = row.insertCell();
    const answer = makeElement("span", "yes");
    answer.append(markedAnswer(marked));
    cell.append(makeElement("span", "no", typed), answer);
  }
}

// ---- The sentences ----

// Every sentence of one tense, with its usual answer in the chosen variety
function buildTables() {
  const sentences = poolFor(tableTense);
  const [portuguese, english] = TENSES[tableTense];
  setText(byId("tcount"), `${sentences.length} frases no ${portuguese}`, `${sentences.length} sentences in the ${english}`);
  const table = byId("tbl");
  table.textContent = "";
  const header = table.createTHead().insertRow();
  header.append(setText(makeElement("th", null, "inglês"), "inglês", "English"), setText(makeElement("th"), ...VARIETY_NAMES[variety]));
  const body = table.createTBody();
  for (const sentence of sentences) {
    const row = body.insertRow();
    row.insertCell().append(englishSentence(sentence));
    row.insertCell().append(mainAnswer(sentence, variety));
  }
}

// ---- Wiring ----

byId("start").onclick = startRound;
mainButton.onclick = onMainButton;
byId("again").onclick = startRound;
byId("change").onclick = () => showSection("setup");
window.addEventListener("hashchange", updateView);
updateView();
