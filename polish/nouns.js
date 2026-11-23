// Polynoun, Polish: nouns, six of their forms, and the rules that explain them.
// Loaded with a plain <script src>, not as a module, so the page still works opened straight from disk.
//
// Each entry: [nominative, gender, English, nominative plural, genitive, genitive plural,
//              accusative, locative, instrumental, extras?]
// Genders: "f" feminine, "n" neuter, "mi" masculine inanimate, "ma" masculine animate (animals),
// "mp" masculine personal (people), "m-a" masculine personal nouns in -a, which decline like feminines.
// "a/b" means both forms are accepted. The optional extras are notes in [Polish, English]:
// one per case where the noun breaks its rule (nomPl, genSg, genPl, accSg, locSg, insSg),
// and "note" for something true of every form, such as a stem change.

const CASES = ["nomPl", "genSg", "genPl", "accSg", "locSg", "insSg"];

const NOUNS = [
  // Feminine, hard stems
  ["kobieta", "f", "woman", "kobiety", "kobiety", "kobiet", "kobietę", "kobiecie", "kobietą"],
  ["szkoła", "f", "school", "szkoły", "szkoły", "szkół", "szkołę", "szkole", "szkołą"],
  ["siostra", "f", "sister", "siostry", "siostry", "sióstr", "siostrę", "siostrze", "siostrą"],
  ["gazeta", "f", "newspaper", "gazety", "gazety", "gazet", "gazetę", "gazecie", "gazetą"],
  ["głowa", "f", "head", "głowy", "głowy", "głów", "głowę", "głowie", "głową"],
  ["minuta", "f", "minute", "minuty", "minuty", "minut", "minutę", "minucie", "minutą"],
  ["mapa", "f", "map", "mapy", "mapy", "map", "mapę", "mapie", "mapą"],
  ["woda", "f", "water", "wody", "wody", "wód", "wodę", "wodzie", "wodą"],
  ["rodzina", "f", "family", "rodziny", "rodziny", "rodzin", "rodzinę", "rodzinie", "rodziną"],
  ["ryba", "f", "fish", "ryby", "ryby", "ryb", "rybę", "rybie", "rybą"],
  // Feminine, stems in k and g
  ["noga", "f", "leg", "nogi", "nogi", "nóg", "nogę", "nodze", "nogą"],
  ["droga", "f", "road, way", "drogi", "drogi", "dróg", "drogę", "drodze", "drogą"],
  ["matka", "f", "mother", "matki", "matki", "matek", "matkę", "matce", "matką"],
  ["książka", "f", "book", "książki", "książki", "książek", "książkę", "książce", "książką"],
  ["córka", "f", "daughter", "córki", "córki", "córek", "córkę", "córce", "córką"],
  ["koleżanka", "f", "friend, colleague (woman)", "koleżanki", "koleżanki", "koleżanek", "koleżankę", "koleżance", "koleżanką"],
  ["apteka", "f", "pharmacy", "apteki", "apteki", "aptek", "aptekę", "aptece", "apteką"],
  ["ręka", "f", "hand", "ręce", "ręki", "rąk", "rękę", "ręce/ręku", "ręką",
    { nomPl: ["Wyjątek: ręce, dawna liczba podwójna.", "Irregular: ręce, an old dual form."] }],
  // Feminine, soft stems
  ["ulica", "f", "street", "ulice", "ulicy", "ulic", "ulicę", "ulicy", "ulicą"],
  ["praca", "f", "work, job", "prace", "pracy", "prac", "pracę", "pracy", "pracą"],
  ["kuchnia", "f", "kitchen", "kuchnie", "kuchni", "kuchni/kuchen", "kuchnię", "kuchni", "kuchnią"],
  ["ziemia", "f", "earth, land", "ziemie", "ziemi", "ziem", "ziemię", "ziemi", "ziemią"],
  ["lekcja", "f", "lesson", "lekcje", "lekcji", "lekcji", "lekcję", "lekcji", "lekcją"],
  ["stacja", "f", "station", "stacje", "stacji", "stacji", "stację", "stacji", "stacją"],
  ["pani", "f", "lady; you (to a woman)", "panie", "pani", "pań", "panią", "pani", "panią",
    { accSg: ["Wyjątek: panią, z końcówką jak w przymiotniku.", "Irregular: panią, with an ending like an adjective's."] }],
  ["noc", "f", "night", "noce", "nocy", "nocy", "noc", "nocy", "nocą"],
  ["twarz", "f", "face", "twarze", "twarzy", "twarzy", "twarz", "twarzy", "twarzą"],
  ["wiadomość", "f", "message, piece of news", "wiadomości", "wiadomości", "wiadomości", "wiadomość", "wiadomości", "wiadomością"],

  // Neuter
  ["okno", "n", "window", "okna", "okna", "okien", "okno", "oknie", "oknem"],
  ["miasto", "n", "town, city", "miasta", "miasta", "miast", "miasto", "mieście", "miastem"],
  ["słowo", "n", "word", "słowa", "słowa", "słów", "słowo", "słowie", "słowem"],
  ["piwo", "n", "beer", "piwa", "piwa", "piw", "piwo", "piwie", "piwem"],
  ["drzewo", "n", "tree", "drzewa", "drzewa", "drzew", "drzewo", "drzewie", "drzewem"],
  ["krzesło", "n", "chair", "krzesła", "krzesła", "krzeseł", "krzesło", "krześle", "krzesłem"],
  ["lato", "n", "summer", "lata", "lata", "lat", "lato", "lecie", "latem"],
  ["jabłko", "n", "apple", "jabłka", "jabłka", "jabłek", "jabłko", "jabłku", "jabłkiem"],
  ["łóżko", "n", "bed", "łóżka", "łóżka", "łóżek", "łóżko", "łóżku", "łóżkiem"],
  ["jajko", "n", "egg", "jajka", "jajka", "jajek", "jajko", "jajku", "jajkiem"],
  ["dziecko", "n", "child", "dzieci", "dziecka", "dzieci", "dziecko", "dziecku", "dzieckiem",
    { nomPl: ["Wyjątek: dzieci.", "Irregular: dzieci."], genPl: ["Wyjątek: dzieci, tak jak mianownik.", "Irregular: dzieci, the same as the nominative."] }],
  ["oko", "n", "eye", "oczy", "oka", "oczu", "oko", "oku", "okiem",
    { nomPl: ["Wyjątek: oczy, dawna liczba podwójna.", "Irregular: oczy, an old dual form."], genPl: ["Wyjątek: oczu.", "Irregular: oczu."] }],
  ["ucho", "n", "ear", "uszy", "ucha", "uszu", "ucho", "uchu", "uchem",
    { nomPl: ["Wyjątek: uszy, dawna liczba podwójna.", "Irregular: uszy, an old dual form."], genPl: ["Wyjątek: uszu.", "Irregular: uszu."] }],
  ["morze", "n", "sea", "morza", "morza", "mórz", "morze", "morzu", "morzem"],
  ["pole", "n", "field", "pola", "pola", "pól", "pole", "polu", "polem"],
  ["serce", "n", "heart", "serca", "serca", "serc", "serce", "sercu", "sercem"],
  ["mieszkanie", "n", "flat, apartment", "mieszkania", "mieszkania", "mieszkań", "mieszkanie", "mieszkaniu", "mieszkaniem"],
  ["pytanie", "n", "question", "pytania", "pytania", "pytań", "pytanie", "pytaniu", "pytaniem"],
  ["imię", "n", "first name", "imiona", "imienia", "imion", "imię", "imieniu", "imieniem"],
  ["zwierzę", "n", "animal", "zwierzęta", "zwierzęcia", "zwierząt", "zwierzę", "zwierzęciu", "zwierzęciem"],
  ["muzeum", "n", "museum", "muzea", "muzeum", "muzeów", "muzeum", "muzeum", "muzeum"],

  // Masculine inanimate: the genitive takes -a or -u, with no sure rule
  ["stół", "mi", "table", "stoły", "stołu", "stołów", "stół", "stole", "stołem"],
  ["dom", "mi", "house, home", "domy", "domu", "domów", "dom", "domu", "domem",
    { locSg: ["Wyjątek: w domu, z -u zamiast -e.", "Irregular: w domu, with -u instead of -e."] }],
  ["samochód", "mi", "car", "samochody", "samochodu", "samochodów", "samochód", "samochodzie", "samochodem"],
  ["sklep", "mi", "shop", "sklepy", "sklepu", "sklepów", "sklep", "sklepie", "sklepem"],
  ["telefon", "mi", "telephone", "telefony", "telefonu", "telefonów", "telefon", "telefonie", "telefonem"],
  ["obiad", "mi", "lunch, dinner", "obiady", "obiadu", "obiadów", "obiad", "obiedzie", "obiadem"],
  ["las", "mi", "forest", "lasy", "lasu", "lasów", "las", "lesie", "lasem"],
  ["ogród", "mi", "garden", "ogrody", "ogrodu", "ogrodów", "ogród", "ogrodzie", "ogrodem"],
  ["bilet", "mi", "ticket", "bilety", "biletu", "biletów", "bilet", "bilecie", "biletem"],
  ["autobus", "mi", "bus", "autobusy", "autobusu", "autobusów", "autobus", "autobusie", "autobusem"],
  ["samolot", "mi", "plane", "samoloty", "samolotu", "samolotów", "samolot", "samolocie", "samolotem"],
  ["rower", "mi", "bicycle", "rowery", "roweru", "rowerów", "rower", "rowerze", "rowerem"],
  ["zeszyt", "mi", "exercise book", "zeszyty", "zeszytu", "zeszytów", "zeszyt", "zeszycie", "zeszytem"],
  ["list", "mi", "letter", "listy", "listu", "listów", "list", "liście", "listem"],
  ["film", "mi", "film", "filmy", "filmu", "filmów", "film", "filmie", "filmem"],
  ["obraz", "mi", "painting, picture", "obrazy", "obrazu", "obrazów", "obraz", "obrazie", "obrazem"],
  ["pociąg", "mi", "train", "pociągi", "pociągu", "pociągów", "pociąg", "pociągu", "pociągiem"],
  ["sok", "mi", "juice", "soki", "soku", "soków", "sok", "soku", "sokiem"],
  ["kraj", "mi", "country", "kraje", "kraju", "krajów", "kraj", "kraju", "krajem"],
  ["pokój", "mi", "room", "pokoje", "pokoju", "pokoi/pokojów", "pokój", "pokoju", "pokojem"],
  ["plac", "mi", "square", "place", "placu", "placów", "plac", "placu", "placem"],
  ["hotel", "mi", "hotel", "hotele", "hotelu", "hoteli/hotelów", "hotel", "hotelu", "hotelem"],
  ["deszcz", "mi", "rain", "deszcze", "deszczu", "deszczów/deszczy", "deszcz", "deszczu", "deszczem"],
  ["rok", "mi", "year", "lata", "roku", "lat", "rok", "roku", "rokiem",
    { nomPl: ["Wyjątek: w liczbie mnogiej lata, jak od „lato”.", "Irregular: the plural is lata, as if from “lato”."],
      genPl: ["Wyjątek: lat, jak od „lato”.", "Irregular: lat, as if from “lato”."] }],
  ["chleb", "mi", "bread", "chleby", "chleba", "chlebów", "chleb", "chlebie", "chlebem"],
  ["ser", "mi", "cheese", "sery", "sera", "serów", "ser", "serze", "serem"],
  ["komputer", "mi", "computer", "komputery", "komputera", "komputerów", "komputer", "komputerze", "komputerem"],
  ["ołówek", "mi", "pencil", "ołówki", "ołówka", "ołówków", "ołówek", "ołówku", "ołówkiem"],
  ["kubek", "mi", "mug", "kubki", "kubka", "kubków", "kubek", "kubku", "kubkiem"],
  ["język", "mi", "tongue; language", "języki", "języka", "języków", "język", "języku", "językiem"],
  ["ząb", "mi", "tooth", "zęby", "zęba", "zębów", "ząb", "zębie", "zębem"],
  ["nos", "mi", "nose", "nosy", "nosa", "nosów", "nos", "nosie", "nosem"],
  ["but", "mi", "shoe", "buty", "buta", "butów", "but", "bucie", "butem"],
  ["świat", "mi", "world", "światy", "świata", "światów", "świat", "świecie", "światem"],
  ["kościół", "mi", "church", "kościoły", "kościoła", "kościołów", "kościół", "kościele", "kościołem"],
  ["klucz", "mi", "key", "klucze", "klucza", "kluczy", "klucz", "kluczu", "kluczem"],
  ["nóż", "mi", "knife", "noże", "noża", "noży", "nóż", "nożu", "nożem"],
  ["talerz", "mi", "plate", "talerze", "talerza", "talerzy", "talerz", "talerzu", "talerzem"],
  ["banan", "mi", "banana", "banany", "banana", "bananów", "banan", "bananie", "bananem"],
  ["pomidor", "mi", "tomato", "pomidory", "pomidora", "pomidorów", "pomidor", "pomidorze", "pomidorem"],
  ["ogórek", "mi", "cucumber", "ogórki", "ogórka", "ogórków", "ogórek", "ogórku", "ogórkiem"],
  ["miesiąc", "mi", "month", "miesiące", "miesiąca", "miesięcy", "miesiąc", "miesiącu", "miesiącem"],
  ["pieniądz", "mi", "coin; (pl.) money", "pieniądze", "pieniądza", "pieniędzy", "pieniądz", "pieniądzu", "pieniądzem"],
  ["dzień", "mi", "day", "dni", "dnia", "dni", "dzień", "dniu", "dniem",
    { nomPl: ["Wyjątek: dni.", "Irregular: dni."], note: ["Temat skraca się: dzień, dnia.", "The stem shortens: dzień, dnia."] }],
  ["tydzień", "mi", "week", "tygodnie", "tygodnia", "tygodni", "tydzień", "tygodniu", "tygodniem",
    { note: ["Temat zmienia się: tydzień, tygodnia.", "The stem changes: tydzień, tygodnia."] }],

  // Masculine animate: animals
  ["kot", "ma", "cat", "koty", "kota", "kotów", "kota", "kocie", "kotem"],
  ["pies", "ma", "dog", "psy", "psa", "psów", "psa", "psie", "psem"],
  ["koń", "ma", "horse", "konie", "konia", "koni", "konia", "koniu", "koniem"],
  ["ptak", "ma", "bird", "ptaki", "ptaka", "ptaków", "ptaka", "ptaku", "ptakiem"],

  // Masculine personal: people
  ["student", "mp", "student", "studenci", "studenta", "studentów", "studenta", "studencie", "studentem"],
  ["Polak", "mp", "Pole (man)", "Polacy", "Polaka", "Polaków", "Polaka", "Polaku", "Polakiem"],
  ["sąsiad", "mp", "neighbour", "sąsiedzi", "sąsiada", "sąsiadów", "sąsiada", "sąsiedzie", "sąsiadem"],
  ["aktor", "mp", "actor", "aktorzy", "aktora", "aktorów", "aktora", "aktorze", "aktorem"],
  ["pracownik", "mp", "worker, employee", "pracownicy", "pracownika", "pracowników", "pracownika", "pracowniku", "pracownikiem"],
  ["profesor", "mp", "professor", "profesorowie", "profesora", "profesorów", "profesora", "profesorze", "profesorem"],
  ["ojciec", "mp", "father", "ojcowie", "ojca", "ojców", "ojca", "ojcu", "ojcem",
    { note: ["Temat skraca się: ojciec, ojca.", "The stem shortens: ojciec, ojca."] }],
  ["syn", "mp", "son", "synowie", "syna", "synów", "syna", "synu", "synem",
    { locSg: ["Wyjątek: o synu, z -u zamiast -e.", "Irregular: o synu, with -u instead of -e."] }],
  ["pan", "mp", "gentleman; you (to a man)", "panowie", "pana", "panów", "pana", "panu", "panem",
    { locSg: ["Wyjątek: o panu, z -u zamiast -e.", "Irregular: o panu, with -u instead of -e."] }],
  ["chłopiec", "mp", "boy", "chłopcy", "chłopca", "chłopców", "chłopca", "chłopcu", "chłopcem"],
  ["lekarz", "mp", "doctor", "lekarze", "lekarza", "lekarzy", "lekarza", "lekarzu", "lekarzem"],
  ["nauczyciel", "mp", "teacher", "nauczyciele", "nauczyciela", "nauczycieli", "nauczyciela", "nauczycielu", "nauczycielem"],
  ["przyjaciel", "mp", "friend", "przyjaciele", "przyjaciela", "przyjaciół", "przyjaciela", "przyjacielu", "przyjacielem",
    { genPl: ["Wyjątek: przyjaciół.", "Irregular: przyjaciół."] }],
  ["brat", "mp", "brother", "bracia", "brata", "braci", "brata", "bracie", "bratem",
    { nomPl: ["Wyjątek: bracia.", "Irregular: bracia."], genPl: ["Wyjątek: braci.", "Irregular: braci."] }],
  ["człowiek", "mp", "person, human being", "ludzie", "człowieka", "ludzi", "człowieka", "człowieku", "człowiekiem",
    { nomPl: ["Wyjątek: w liczbie mnogiej ludzie.", "Irregular: the plural is ludzie."], genPl: ["Wyjątek: ludzi.", "Irregular: ludzi."] }],
  ["mężczyzna", "m-a", "man", "mężczyźni", "mężczyzny", "mężczyzn", "mężczyznę", "mężczyźnie", "mężczyzną"],
  ["kolega", "m-a", "friend, colleague", "koledzy", "kolegi", "kolegów", "kolegę", "koledze", "kolegą"],
];

// ---- What kind of stem a noun has ----

// "hard", "velar" (k, g), "ch", "soft", or for some feminines and neuters a shape of their own:
// "ość", "cons" (a feminine ending in a consonant), "ę" and "um".
function stemType(nominative, gender) {
  const word = nominative.toLowerCase();
  let stem = word;
  if (gender === "f" || gender === "m-a") {
    if (word.endsWith("ość")) return "ość";
    if (word.endsWith("i")) return "soft";
    if (!word.endsWith("a")) return "cons";
    stem = word.slice(0, -1);
  } else if (gender === "n") {
    if (word.endsWith("um")) return "um";
    if (word.endsWith("ę")) return "ę";
    if (word.endsWith("e")) return "soft";
    stem = word.slice(0, -1);
  }
  if (/[kg]$/.test(stem)) return "velar";
  if (/ch$/.test(stem)) return "ch";
  if (/(i|j|l|c|cz|sz|rz|ż|dz|dź|dż|ń|ś|ć|ź)$/.test(stem)) return "soft";
  return "hard";
}

// ---- The rules ----

// For a noun and a case, the rules its form may follow: [test, Polish note, English note].
// A test is a pattern for the form, or a function of the form and the noun.
// The first rule that fits the form is the one shown; tests/index.html checks that one always fits.
const NO_ENDING = /[^aeiouyąęó]$/;
const SAME_AS = key => (form, noun) => form === (key === "nominative" ? noun.nominative : noun.forms[key]);
const ZERO_NOTE = ["Bez końcówki. Często o zmienia się w ó (szkół), a między spółgłoski wchodzi e (okien).",
                   "No ending. Often o turns into ó (szkół), and an e slips in between consonants (okien)."];
const SOFTENS_NOTE = ["Temat twardy: -e, a spółgłoska mięknie (t → ci, d → dzi, r → rz, ł → l).",
                      "Hard stem: -e, and the consonant softens (t → ci, d → dzi, r → rz, ł → l)."];
const AFTER_CZ = [/y$/, "Po c, cz, sz, rz i ż: -y.", "After c, cz, sz, rz and ż: -y."];
const SOFT_I = [/i$/, "Temat miękki: -i.", "Soft stem: -i."];

function rulesFor(caseKey, noun) {
  const { gender, stem } = noun;
  const feminine = gender === "f" || gender === "m-a";
  const masculine = gender === "mi" || gender === "ma" || gender === "mp";
  const velar = stem === "velar";

  switch (caseKey) {
    case "nomPl":
      if (gender === "mp" || gender === "m-a") return [
        [/owie$/, "Męskoosobowy: tu -owie, częste przy tytułach i w rodzinie.", "Masculine personal: here -owie, common for titles and family."],
        [/e$/, "Męskoosobowy, temat miękki: -e.", "Masculine personal, soft stem: -e."],
        ...(stem === "soft" ? [[/y$/, "Męskoosobowy, temat miękki: -y.", "Masculine personal, soft stem: -y."]] : []),
        [/[iy]$/, "Męskoosobowy: -i lub -y, a ostatnia spółgłoska mięknie (t → ci, d → dzi, r → rz, k → c, g → dz).",
                  "Masculine personal: -i or -y, and the last consonant softens (t → ci, d → dzi, r → rz, k → c, g → dz)."],
      ];
      if (gender === "f") {
        if (stem === "ość") return [[/ości$/, "-ość → -ości.", "-ość becomes -ości."]];
        if (stem === "cons") return [[/e$/, "Żeński zakończony na spółgłoskę miękką: -e.", "Feminine ending in a soft consonant: -e."]];
        if (stem === "soft") return [[/e$/, "Żeński, temat miękki: -e.", "Feminine, soft stem: -e."]];
        if (velar) return [[/i$/, "Żeński, po k i g: -i.", "Feminine, after k and g: -i."]];
        return [[/y$/, "Żeński, temat twardy: -y.", "Feminine, hard stem: -y."]];
      }
      if (gender === "n") {
        if (stem === "ę") return [[/(ona|ęta)$/, "Nijaki na -ę: -iona albo -ęta.", "Neuter in -ę: -iona or -ęta."]];
        if (stem === "um") return [[/a$/, "Wyrazy na -um: -um → -a.", "Words in -um: -um becomes -a."]];
        return [[/a$/, "Nijaki: zawsze -a.", "Neuter: always -a."]];
      }
      if (stem === "soft") return [[/e$/, "Męski nieosobowy, temat miękki: -e.", "Masculine, not a person, soft stem: -e."]];
      if (velar) return [[/i$/, "Męski nieosobowy, po k i g: -i.", "Masculine, not a person, after k and g: -i."]];
      return [[/y$/, "Męski nieosobowy, temat twardy: -y.", "Masculine, not a person, hard stem: -y."]];

    case "genSg":
      if (feminine) {
        if (stem === "ość") return [[/ości$/, "-ość → -ości.", "-ość becomes -ości."]];
        if (stem === "cons" || stem === "soft") return [AFTER_CZ, SOFT_I];
        if (velar) return [[/i$/, "Po k i g: -i.", "After k and g: -i."]];
        return [[/y$/, "Temat twardy: -y.", "Hard stem: -y."]];
      }
      if (gender === "n") {
        if (stem === "ę") return [[/(enia|ęcia)$/, "Nijaki na -ę: -enia albo -ęcia.", "Neuter in -ę: -enia or -ęcia."]];
        if (stem === "um") return [[SAME_AS("nominative"), "Wyrazy na -um nie odmieniają się w liczbie pojedynczej.", "Words in -um don't change in the singular."]];
        return [[/a$/, "Nijaki: -a.", "Neuter: -a."]];
      }
      if (gender === "mi") return [
        [/a$/, "Męski nieżywotny: -a albo -u, i trzeba to zapamiętać. Ten ma -a.", "Masculine inanimate: -a or -u, and it has to be learnt. This one takes -a."],
        [/u$/, "Męski nieżywotny: -a albo -u, i trzeba to zapamiętać. Ten ma -u.", "Masculine inanimate: -a or -u, and it has to be learnt. This one takes -u."],
      ];
      return [[/a$/, "Męski żywotny: zawsze -a.", "Masculine animate: always -a."]];

    case "genPl":
      if (gender === "m-a") return [
        [NO_ENDING, "Jak żeński: bez końcówki.", "Like a feminine noun: no ending."],
        [/ów$/, "Tu -ów, jak w rodzaju męskim.", "Here -ów, as in masculine nouns."],
      ];
      if (gender === "f") {
        if (stem === "ość") return [[/ości$/, "-ość → -ości.", "-ość becomes -ości."]];
        if (stem === "cons") return [AFTER_CZ, SOFT_I];
        if (stem === "soft") return [
          [/[iy]$/, "Temat miękki: -i.", "Soft stem: -i."],
          [NO_ENDING, "Temat miękki, a tu bez końcówki.", "A soft stem, and here no ending."],
        ];
        return [[NO_ENDING, ...ZERO_NOTE]];
      }
      if (gender === "n") {
        if (stem === "um") return [[/ów$/, "Wyrazy na -um: -ów.", "Words in -um: -ów."]];
        return [[NO_ENDING, ...ZERO_NOTE]];
      }
      if (stem === "soft") return [
        [/[iy]$/, "Męski, temat miękki: -i lub -y.", "Masculine, soft stem: -i or -y."],
        [/ów$/, "Temat miękki, a jednak -ów.", "A soft stem, yet -ów."],
      ];
      return [[/ów$/, "Męski, temat twardy: -ów.", "Masculine, hard stem: -ów."]];

    case "accSg":
      if (feminine) {
        if (stem === "ość" || stem === "cons") return [[SAME_AS("nominative"), "Żeński na spółgłoskę: biernik = mianownik.", "Feminine ending in a consonant: accusative = nominative."]];
        return [[/ę$/, "Na -a: -ę.", "Ending in -a: -ę."]];
      }
      if (gender === "n") return [[SAME_AS("nominative"), "Nijaki: biernik = mianownik.", "Neuter: accusative = nominative."]];
      if (gender === "mi") return [[SAME_AS("nominative"), "Męski nieżywotny: biernik = mianownik.", "Masculine inanimate: accusative = nominative."]];
      return [[SAME_AS("genSg"), "Męski żywotny: biernik = dopełniacz.", "Masculine animate: accusative = genitive."]];

    case "locSg":
      if (feminine) {
        if (stem === "ość") return [[/ości$/, "-ość → -ości.", "-ość becomes -ości."]];
        if (stem === "cons" || stem === "soft") return [AFTER_CZ, SOFT_I];
        if (velar) return [[/(ce|dze)$/, "k → ce, g → dze.", "k becomes ce, g becomes dze."]];
        return [[/e$/, ...SOFTENS_NOTE]];
      }
      if (gender === "n") {
        if (stem === "ę") return [[/(eniu|ęciu)$/, "Nijaki na -ę: -eniu albo -ęciu.", "Neuter in -ę: -eniu or -ęciu."]];
        if (stem === "um") return [[SAME_AS("nominative"), "Wyrazy na -um nie odmieniają się w liczbie pojedynczej.", "Words in -um don't change in the singular."]];
      }
      if (stem === "soft") return [[/u$/, "Temat miękki: -u.", "Soft stem: -u."]];
      if (velar || stem === "ch") return [[/u$/, "Po k, g i ch: -u.", "After k, g and ch: -u."]];
      return [[/e$/, ...SOFTENS_NOTE]];

    case "insSg":
      if (feminine) return [[/ą$/, "Zawsze -ą.", "Always -ą."]];
      if (gender === "n" && stem === "ę") return [[/(eniem|ęciem)$/, "Nijaki na -ę: -eniem albo -ęciem.", "Neuter in -ę: -eniem or -ęciem."]];
      if (gender === "n" && stem === "um") return [[SAME_AS("nominative"), "Wyrazy na -um nie odmieniają się w liczbie pojedynczej.", "Words in -um don't change in the singular."]];
      if (velar) return [[/iem$/, "Po k i g: -iem.", "After k and g: -iem."]];
      return [[/em$/, masculine ? "Męski: -em." : "Nijaki: -em.", masculine ? "Masculine: -em." : "Neuter: -em."]];
  }
  return [];
}

// The rule a form follows, as [Polish, English], or null when none fits
function ruleFor(caseKey, noun) {
  const form = noun.forms[caseKey].split("/")[0];
  for (const [test, polish, english] of rulesFor(caseKey, noun)) {
    const fits = typeof test === "function" ? test(form, noun) : test.test(form.toLowerCase());
    if (fits) return [polish, english];
  }
  return null;
}

// A change of stem that every form but the nominative shares, read off the genitive:
// ó → o (stół, stołu), ą → ę (ząb, zęba), or a mobile e (pies, psa; ołówek, ołówka).
function stemChange(noun) {
  if (noun.extras.note) return noun.extras.note;
  if (!["mi", "ma", "mp"].includes(noun.gender)) return null;
  const nominative = noun.nominative.toLowerCase(), genitive = noun.forms.genSg.toLowerCase();
  const pair = `${noun.nominative}, ${noun.forms.genSg}`;
  let k = 0;
  while (nominative[k] === genitive[k]) k++;
  if (nominative[k] === "ó" && genitive[k] === "o") return [`ó zmienia się w o: ${pair}.`, `ó turns into o: ${pair}.`];
  if (nominative[k] === "ą" && genitive[k] === "ę") return [`ą zmienia się w ę: ${pair}.`, `ą turns into ę: ${pair}.`];
  const e = nominative.lastIndexOf("e");
  if (e > 0) {
    const without = nominative[e - 1] === "i" && e === k + 1
      ? nominative.slice(0, e - 1) + nominative.slice(e + 1)
      : nominative.slice(0, e) + nominative.slice(e + 1);
    if (genitive.startsWith(without) && !genitive.startsWith(nominative)) return [`Ruchome e: ${pair}.`, `Mobile e: ${pair}.`];
  }
  return null;
}

// ---- The nouns, ready to use ----

const POLISH_NOUNS = NOUNS.map(([nominative, gender, english, ...rest]) => {
  const extras = typeof rest[rest.length - 1] === "object" ? rest.pop() : {};
  const forms = Object.fromEntries(CASES.map((key, k) => [key, rest[k]]));
  return { nominative, gender, english, forms, extras, stem: stemType(nominative, gender) };
});

// ---- Gender: ten, ta or to ----
//
// Each entry: [noun, gender ("m", "f" or "n"), English, hint].
// The levels go by how far the ending gives the gender away: plain endings first, then
// endings with a rule of their own, then the soft consonants that can go either way,
// masculine nouns in -a, and loanwords that don't decline.

const GENDER_HINTS = {
  consM:   ["Kończy się na spółgłoskę: męski.", "Ends in a consonant: masculine."],
  aF:      ["Kończy się na -a: żeński.", "Ends in -a: feminine."],
  oN:      ["Kończy się na -o: nijaki.", "Ends in -o: neuter."],
  eN:      ["Kończy się na -e: nijaki.", "Ends in -e: neuter."],
  ęN:      ["Kończy się na -ę: nijaki (imię, zwierzę).", "Ends in -ę: neuter (imię, zwierzę)."],
  umN:     ["Kończy się na -um: nijaki, a w liczbie pojedynczej się nie odmienia.", "Ends in -um: neuter, and it doesn't decline in the singular."],
  ośćF:    ["Kończy się na -ość: zawsze żeński.", "Ends in -ość: always feminine."],
  iF:      ["Kończy się na -i: żeński (pani, bogini).", "Ends in -i: feminine (pani, bogini)."],
  ewF:     ["Kończy się na -ew: żeński (krew, marchew).", "Ends in -ew: feminine (krew, marchew)."],
  ekM:     ["Kończy się na -ek: męski, często zdrobnienie.", "Ends in -ek: masculine, often a diminutive."],
  ecM:     ["Kończy się na -ec: męski.", "Ends in -ec: masculine."],
  nikM:    ["Kończy się na -nik: męski.", "Ends in -nik: masculine."],
  arzM:    ["Kończy się na -arz albo -erz: męski.", "Ends in -arz or -erz: masculine."],
  softM:   ["Spółgłoska miękka na końcu: rodzaj męski albo żeński, trzeba zapamiętać. Ten jest męski.", "A soft consonant at the end: masculine or feminine, and you have to learn which. This one is masculine."],
  softF:   ["Spółgłoska miękka na końcu: rodzaj męski albo żeński, trzeba zapamiętać. Ten jest żeński.", "A soft consonant at the end: masculine or feminine, and you have to learn which. This one is feminine."],
  manA:    ["Kończy się na -a, ale to mężczyzna: męski.", "Ends in -a, but it's a man: masculine."],
  loanN:   ["Zapożyczenie, które się nie odmienia: nijaki.", "A loanword that doesn't decline: neuter."],
};

const GENDER_POOLS = {
  // A hard consonant, -a or -o: the ending says it all.
  easy: [
    ["stół", "m", "table", "consM"],
    ["dom", "m", "house, home", "consM"],
    ["kot", "m", "cat", "consM"],
    ["pies", "m", "dog", "consM"],
    ["samochód", "m", "car", "consM"],
    ["sklep", "m", "shop", "consM"],
    ["telefon", "m", "telephone", "consM"],
    ["las", "m", "forest", "consM"],
    ["chleb", "m", "bread", "consM"],
    ["ser", "m", "cheese", "consM"],
    ["nos", "m", "nose", "consM"],
    ["syn", "m", "son", "consM"],
    ["kobieta", "f", "woman", "aF"],
    ["szkoła", "f", "school", "aF"],
    ["siostra", "f", "sister", "aF"],
    ["gazeta", "f", "newspaper", "aF"],
    ["głowa", "f", "head", "aF"],
    ["mapa", "f", "map", "aF"],
    ["woda", "f", "water", "aF"],
    ["ryba", "f", "fish", "aF"],
    ["noga", "f", "leg", "aF"],
    ["matka", "f", "mother", "aF"],
    ["książka", "f", "book", "aF"],
    ["ulica", "f", "street", "aF"],
    ["okno", "n", "window", "oN"],
    ["miasto", "n", "town, city", "oN"],
    ["słowo", "n", "word", "oN"],
    ["piwo", "n", "beer", "oN"],
    ["drzewo", "n", "tree", "oN"],
    ["krzesło", "n", "chair", "oN"],
    ["jabłko", "n", "apple", "oN"],
    ["łóżko", "n", "bed", "oN"],
    ["jajko", "n", "egg", "oN"],
    ["dziecko", "n", "child", "oN"],
    ["lato", "n", "summer", "oN"],
    ["mleko", "n", "milk", "oN"],
  ],
  // Endings with a rule of their own: -e, -ę and -um; -ość, -ew and -i; -ek, -ec, -nik, -arz and -erz
  medium: [
    ["ołówek", "m", "pencil", "ekM"],
    ["kubek", "m", "mug", "ekM"],
    ["ogórek", "m", "cucumber", "ekM"],
    ["chłopiec", "m", "boy", "ecM"],
    ["widelec", "m", "fork", "ecM"],
    ["palec", "m", "finger", "ecM"],
    ["pracownik", "m", "worker, employee", "nikM"],
    ["słownik", "m", "dictionary", "nikM"],
    ["lekarz", "m", "doctor", "arzM"],
    ["talerz", "m", "plate", "arzM"],
    ["kalendarz", "m", "calendar", "arzM"],
    ["pisarz", "m", "writer", "arzM"],
    ["żołnierz", "m", "soldier", "arzM"],
    ["wiadomość", "f", "message, piece of news", "ośćF"],
    ["miłość", "f", "love", "ośćF"],
    ["radość", "f", "joy", "ośćF"],
    ["młodość", "f", "youth", "ośćF"],
    ["przyszłość", "f", "future", "ośćF"],
    ["kość", "f", "bone", "ośćF"],
    ["krew", "f", "blood", "ewF"],
    ["marchew", "f", "carrot", "ewF"],
    ["brew", "f", "eyebrow", "ewF"],
    ["pani", "f", "lady; you (to a woman)", "iF"],
    ["bogini", "f", "goddess", "iF"],
    ["morze", "n", "sea", "eN"],
    ["pole", "n", "field", "eN"],
    ["serce", "n", "heart", "eN"],
    ["słońce", "n", "sun", "eN"],
    ["zdjęcie", "n", "photo", "eN"],
    ["pytanie", "n", "question", "eN"],
    ["imię", "n", "first name", "ęN"],
    ["zwierzę", "n", "animal", "ęN"],
    ["ramię", "n", "arm, shoulder", "ęN"],
    ["muzeum", "n", "museum", "umN"],
    ["centrum", "n", "centre", "umN"],
    ["liceum", "n", "upper secondary school", "umN"],
  ],
  // Soft consonants that go either way, men in -a, and loanwords that don't decline
  hard: [
    ["koń", "m", "horse", "softM"],
    ["dzień", "m", "day", "softM"],
    ["gość", "m", "guest", ["Uwaga: gość nie jest wyrazem na -ość, tylko rodzaju męskiego.", "Careful: gość isn't an -ość word; it's masculine."]],
    ["liść", "m", "leaf", "softM"],
    ["ogień", "m", "fire", "softM"],
    ["kamień", "m", "stone", "softM"],
    ["gwóźdź", "m", "nail", "softM"],
    ["mężczyzna", "m", "man", "manA"],
    ["kolega", "m", "friend, colleague", "manA"],
    ["tata", "m", "dad", "manA"],
    ["poeta", "m", "poet", "manA"],
    ["kierowca", "m", "driver", "manA"],
    ["noc", "f", "night", "softF"],
    ["twarz", "f", "face", "softF"],
    ["rzecz", "f", "thing", "softF"],
    ["mysz", "f", "mouse", "softF"],
    ["sól", "f", "salt", "softF"],
    ["wieś", "f", "village; countryside", "softF"],
    ["jesień", "f", "autumn", "softF"],
    ["dłoń", "f", "palm (of the hand)", "softF"],
    ["sieć", "f", "net, network", "softF"],
    ["kolej", "f", "railway", "softF"],
    ["łódź", "f", "boat", "softF"],
    ["odpowiedź", "f", "answer", "softF"],
    ["kiwi", "n", "kiwi", "loanN"],
    ["menu", "n", "menu", "loanN"],
    ["taxi", "n", "taxi", "loanN"],
    ["alibi", "n", "alibi", "loanN"],
    ["jury", "n", "jury", "loanN"],
    ["zoo", "n", "zoo", "loanN"],
    ["bikini", "n", "bikini", "loanN"],
  ],
};
