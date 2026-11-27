// Polyphrase, Portuguese: reading the answer patterns and marking a translation.
// No page code here, so the tests can load it beside sentences.js and ../js/trainer.js on its own.

// ---- Patterns ----

// "(a|b) c [d]" → a list of alternatives, each a sequence of pieces: a piece is either text or,
// for a bracket, a list of alternatives of its own. [x] is the alternatives nothing and x.
function parsePattern(pattern) {
  let at = 0;
  function sequence(stops) {
    const pieces = [];
    let text = "";
    while (at < pattern.length && !stops.includes(pattern[at])) {
      const char = pattern[at];
      if (char === "(" || char === "[") {
        if (text) pieces.push(text);
        text = "";
        at++;
        const close = char === "(" ? ")" : "]";
        const options = alternatives(close);
        if (pattern[at] !== close) throw new Error(`${char} without ${close} in "${pattern}"`);
        at++;
        pieces.push(char === "[" ? [[], ...options] : options);
      } else if (char === ")" || char === "]") {
        throw new Error(`${char} without its opening bracket in "${pattern}"`);
      } else {
        text += char;
        at++;
      }
    }
    if (text) pieces.push(text);
    return pieces;
  }
  function alternatives(close) {
    const options = [sequence(["|", close])];
    while (pattern[at] === "|") {
      at++;
      options.push(sequence(["|", close]));
    }
    return options;
  }
  return alternatives(null);
}

// Every sentence a sequence stands for, the first choices first, so the first is the one shown
function expandSequence(pieces) {
  let results = [""];
  for (const piece of pieces) {
    if (typeof piece === "string") {
      results = results.map(start => start + piece);
    } else {
      const longer = [];
      for (const start of results) {
        for (const option of piece) {
          for (const end of expandSequence(option)) longer.push(start + end);
        }
      }
      results = longer;
    }
  }
  return results;
}

const expandPattern = pattern => parsePattern(pattern).flatMap(expandSequence);

// ---- Words ----

const PUNCTUATION = /[.,;:!?¡¿"“”«»]/g;
const stripAccents = text => text.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");
const MACRON = /[āēīōū]/i;

// One space between words and none before punctuation, as an empty [x] at the end leaves "oito ."
const cleanText = text => text.normalize("NFC").replace(/\s+/g, " ").replace(/ ([.,;:!?])/g, "$1").trim();

// A sentence as words. Each word keeps how it's written (shown), the same without punctuation
// (bare) and the key it's compared by. In patterns, *word marks the verb.
function toWords(text) {
  return cleanText(text).split(" ").map((raw, k) => {
    const verb = raw.startsWith("*");
    const shown = verb ? raw.slice(1) : raw;
    let bare = shown.replace(PUNCTUATION, "");
    if (k === 0) bare = bare.charAt(0).toLowerCase() + bare.slice(1); // capitalized only for starting the sentence
    return { shown, bare, key: bare.toLowerCase(), verb };
  }).filter(word => word.key);
}

const wordKeys = words => words.map(word => word.key).join(" ");

// Letters apart, for telling a slip from a different word
function letterDistance(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, k) => k);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1), previous[j] + 1, row[j - 1] + 1);
    }
    previous = row;
  }
  return previous[b.length];
}

// Words in Spanish that aren't Portuguese too: tu, como or dos aren't here, for they're both.
const SPANISH = new Set(("un una unos unas el la lo los las le les del al con en y pero muy mucho mucha muchos muchas " +
  "también tambien después despues hoy ayer siempre ahora hasta cuando allí sin más mi mis su sus nuestro nuestra " +
  "nuestros nuestras vuestro yo él ellos ellas nosotros usted ustedes es son soy estoy están hay tengo tiene tienen " +
  "hace hizo hermano hermana hermanos abuela abuelo abuelos hijo hija hijos novio trabajo trabajar trabaja trabajan " +
  "trabajamos ventana ventanas puerta puertas tren autobús autobus desayuno almuerzo leche pan agua vino libro libros " +
  "escuela playa dinero tienda teléfono nueve nuevo nueva ocho siete diez once cuatro veinte treinta año día días mes " +
  "tres noche viejo vieja bueno buena bien vivimos comimos bebimos escribimos escribe escribo escriben escribir " +
  "recibimos recibe recivimos estudio cocina cocino cocinan cocinar lejos detrás detras delante enfrente qué cómo " +
  "gracias decidí compré").split(" "));
const isSpanish = key => SPANISH.has(key) || /ñ|ll|ción$|sión$|dad$|ió$/.test(key);

// ---- The sentences ----

// The subject pronoun comes from the English. In Brazil it's shown in the answer, except eu and
// nós, whose verb endings already say who it is.
const SUBJECTS = [
  ["You (informal) ", { pe: ["tu"], br: ["você"] }],
  ["I ", { pe: ["eu"], br: ["eu"] }],
  ["We ", { pe: ["nós"], br: ["nós"] }],
  ["He ", { pe: ["ele"], br: ["ele"] }],
  ["She ", { pe: ["ela"], br: ["ela"] }],
  ["They ", { pe: ["eles", "elas"], br: ["eles", "elas"] }],
];
const SHOWN_IN_BRAZIL = new Set(["você", "ele", "ela", "eles"]);

function pronounsFor(english, variety) {
  const subject = SUBJECTS.find(([start]) => english.startsWith(start));
  return subject ? subject[1][variety] : [];
}

// sentences.js lists each as [English, tense, European pattern, Brazilian pattern or "=", notes, extra note?]
const SENTENCES = SENTENCE_LIST.map(([english, tense, pe, br, notes, extra]) =>
  ({ english, tense, patterns: { pe, br: br === "=" ? pe : br }, notes: notes ? notes.split(" ") : [], extra }));

// Every accepted answer, as words, once each
const answerCache = new Map();
function answersFor(sentence, variety) {
  const cacheKey = variety + sentence.english;
  if (!answerCache.has(cacheKey)) {
    const seen = new Map();
    for (const text of expandPattern(sentence.patterns[variety])) {
      const words = toWords(text);
      const key = wordKeys(words);
      if (!seen.has(key)) seen.set(key, words);
    }
    answerCache.set(cacheKey, [...seen.values()]);
  }
  return answerCache.get(cacheKey);
}

const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1);

// The answer to show: the words, with the subject pronoun in front where it belongs
function withPronoun(words, pronoun) {
  if (!pronoun || !words.length) return words;
  const [first, ...rest] = words;
  return [{ shown: pronoun, bare: pronoun, key: pronoun, verb: false }, { ...first, shown: first.bare + first.shown.slice(first.bare.length) }, ...rest];
}
const shownPronoun = (sentence, variety) => {
  const first = pronounsFor(sentence.english, variety)[0];
  return variety === "br" && SHOWN_IN_BRAZIL.has(first) ? first : null;
};
const wordsAsText = words => capitalize(words.map(word => word.shown).join(" "));

// The usual answer, as text
const mainAnswer = (sentence, variety) =>
  wordsAsText(withPronoun(answersFor(sentence, variety)[0], shownPronoun(sentence, variety)));

// Whether Portugal and Brazil share the usual answer, pronoun aside
const sameMainAnswer = sentence => wordKeys(answersFor(sentence, "pe")[0]) === wordKeys(answersFor(sentence, "br")[0]);

// A note is a [Portuguese, English] pair, or { pe, br } with one for either variety
const noteFor = (note, variety) => Array.isArray(note) ? note : note[variety] || null;

function sentenceNotes(sentence, variety) {
  const notes = sentence.notes.map(key => noteFor(NOTES[key], variety));
  if (sentence.extra) notes.push(noteFor(sentence.extra, variety));
  return notes.filter(Boolean);
}

// ---- Marking ----

// In Portugal, the -ámos of the preterite may be written -amos too (cantámos, cantamos), as in Polyverb.
const relaxedAmos = (typedKey, answerKey, variety) =>
  variety === "pe" && answerKey.endsWith("ámos") && typedKey === answerKey.slice(0, -4) + "amos";
const sameWord = (typedKey, answerKey, variety) => typedKey === answerKey || relaxedAmos(typedKey, answerKey, variety);

// Two words close enough that one was probably meant for the other
const looksAlike = (a, b) => stripAccents(a) === stripAccents(b) || letterDistance(a, b) <= Math.max(1, Math.floor(Math.max(a.length, b.length) / 2));

// Word by word, the cheapest way from what was typed to an answer: words kept, swapped, missing
// or extra. Swapping two unlike words costs nearly as much as dropping one and adding the other.
function align(typed, answer, variety) {
  const n = typed.length, m = answer.length;
  const swapCost = (i, j) => sameWord(typed[i].key, answer[j].key, variety) ? 0 : looksAlike(typed[i].key, answer[j].key) ? 1 : 1.9;
  const cost = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      cost[i][j] = Math.min(cost[i - 1][j - 1] + swapCost(i - 1, j - 1), cost[i - 1][j] + 1, cost[i][j - 1] + 1);
    }
  }
  const steps = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && cost[i][j] === cost[i - 1][j - 1] + swapCost(i - 1, j - 1)) {
      i--; j--;
      steps.push({ type: swapCost(i, j) === 0 ? "same" : "swap", typed: typed[i], answer: answer[j] });
    } else if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) {
      i--;
      steps.push({ type: "extra", typed: typed[i] });
    } else {
      j--;
      steps.push({ type: "missing", answer: answer[j] });
    }
  }
  return { cost: cost[n][m], steps: steps.reverse() };
}

// What was typed, against the closest accepted answer. The subject pronoun may be typed or left out.
function markAnswer(sentence, variety, text) {
  const typed = toWords(text);
  const tries = [{ words: typed, pronoun: null }];
  if (typed.length && pronounsFor(sentence.english, variety).includes(typed[0].key)) {
    tries.push({ words: typed.slice(1), pronoun: typed[0].key });
  }
  let best = null;
  for (const answer of answersFor(sentence, variety)) {
    for (const { words, pronoun } of tries) {
      const { cost, steps } = align(words, answer, variety);
      if (!best || cost < best.cost) best = { cost, steps, answer, pronoun };
    }
  }
  const right = best.cost === 0;
  const pronoun = best.pronoun || shownPronoun(sentence, variety);
  // The answer word by word, each marked if it's not what was typed
  const marked = withPronoun(best.answer, pronoun).map(word => ({ ...word, changed: false }));
  const offset = pronoun ? 1 : 0;
  let k = offset;
  for (const step of best.steps) {
    if (step.type === "extra") continue;
    if (step.type !== "same") marked[k].changed = true;
    k++;
  }
  marked[0].shown = capitalize(marked[0].shown);
  const usual = best.answer === answersFor(sentence, variety)[0];
  return { right, usual, marked, notes: right ? notesWhenRight(best) : notesWhenWrong(best, variety, text) };
}

function notesWhenRight({ steps }) {
  const plain = steps.find(step => step.type === "same" && step.typed.key !== step.answer.key);
  if (!plain) return [];
  const { typed, answer } = plain;
  return [[`Também está certo, mas em Portugal escreve-se normalmente «${answer.bare}», com acento, que o distingue do presente.`,
           `That's right too, but in Portugal it's usually written “${answer.bare}”, with the accent that tells it apart from the present.`]];
}

function notesWhenWrong({ steps }, variety, text) {
  const notes = [];
  for (const step of steps) {
    const note = step.type === "swap" ? explainSwap(step.typed, step.answer, variety)
      : step.type === "extra" && isSpanish(step.typed.key) ? [`«${step.typed.bare}» é espanhol.`, `“${step.typed.bare}” is Spanish.`]
      : null;
    if (note && !notes.some(([pt]) => pt === note[0])) notes.push(note);
  }
  if (MACRON.test(text)) notes.push(["ā é um mácron. O português usa o til: ã, õ.", "ā is a macron. Portuguese uses the tilde: ã, õ."]);
  return notes;
}

// Why one word should be another, where there's something useful to say
function explainSwap(typed, answer, variety) {
  const t = typed.bare, a = answer.bare, tk = typed.key, ak = answer.key;
  const swap = `«${t}» → «${a}»`, swapEn = `“${t}” → “${a}”`;
  if ((ak === "à" || ak === "às") && stripAccents(tk) === stripAccents(ak)) {
    const article = ak === "à" ? "a" : "as";
    return [`${swap}: a preposição a mais o artigo ${article}, com acento grave.`, `${swapEn}: the preposition a plus the article ${article}, with a grave accent.`];
  }
  if (variety === "br" && tk.endsWith("ámos") && ak === tk.slice(0, -4) + "amos") {
    return [`${swap}: no Brasil não se escreve -ámos.`, `${swapEn}: Brazilian Portuguese doesn't write -ámos.`];
  }
  if (MACRON.test(tk)) return null; // said once for the whole answer
  if (stripAccents(tk) === stripAccents(ak)) {
    return tk.replace(/ç/g, "c") === ak.replace(/ç/g, "c")
      ? [`${swap}: só a cedilha.`, `${swapEn}: just the cedilla.`]
      : [`${swap}: só o acento.`, `${swapEn}: just the accent.`];
  }
  if (isSpanish(tk)) return [`«${t}» é espanhol. Aqui: «${a}».`, `“${t}” is Spanish. Here: “${a}”.`];
  if (answer.verb && /[aei]rem$/.test(tk) && ak === tk.replace(/rem$/, "ram")) {
    return [`«${t}» é o infinitivo pessoal; o pretérito é «${a}».`, `“${t}” is the personal infinitive; the preterite is “${a}”.`];
  }
  if (answer.verb) return [`${swap}: vê outra vez a pessoa e o tempo do verbo.`, `${swapEn}: check the verb's person and tense again.`];
  if (letterDistance(tk, ak) === 1) return [`${swap}: uma letra.`, `${swapEn}: one letter.`];
  return null;
}
