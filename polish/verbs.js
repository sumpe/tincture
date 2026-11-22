// Polyverb, Polish: the verbs, by class, and their English. The game script in app.js reads these.
// Loaded with a plain <script src>, not as a module, so the page still works opened straight from disk.

const VERBS_BY_CLASS={
ac:["czytać","pytać","słuchać","grać","czekać","szukać","kochać","pamiętać","wracać","sprzątać","odpowiadać","zaczynać","pomagać","otwierać","zamykać","mieszkać","śpiewać","wołać","oglądać","zapominać","powtarzać","używać"],
ow:["kupować","pracować","gotować","rysować","planować","potrzebować","dziękować","pakować","parkować","rezerwować","studiować","malować","ratować","podróżować","spacerować","telefonować","organizować"],
ic:["robić","lubić","mówić","dzwonić","gubić","karmić","bronić","chwalić","palić","mylić","uczyć","liczyć","ćwiczyć","tańczyć","tłumaczyć","męczyć","kończyć","marzyć","mierzyć"]
};
// English for each infinitive, shown on hover in the game (not in the tables). All are imperfective.
const ENGLISH={
"czytać":"to read","pytać":"to ask","słuchać":"to listen","grać":"to play","czekać":"to wait","szukać":"to look for",
"kochać":"to love","pamiętać":"to remember","wracać":"to come back","sprzątać":"to tidy up, to clean","odpowiadać":"to answer",
"zaczynać":"to begin","pomagać":"to help","otwierać":"to open","zamykać":"to close","mieszkać":"to live (somewhere)",
"śpiewać":"to sing","wołać":"to call (out)","oglądać":"to watch","zapominać":"to forget","powtarzać":"to repeat","używać":"to use",
"kupować":"to buy","pracować":"to work","gotować":"to cook","rysować":"to draw","planować":"to plan","potrzebować":"to need",
"dziękować":"to thank","pakować":"to pack","parkować":"to park","rezerwować":"to book, to reserve","studiować":"to study (at university)",
"malować":"to paint","ratować":"to rescue, to save","podróżować":"to travel","spacerować":"to go for a walk","telefonować":"to phone",
"organizować":"to organise",
"robić":"to do, to make","lubić":"to like","mówić":"to speak, to say","dzwonić":"to ring, to call","gubić":"to lose",
"karmić":"to feed","bronić":"to defend","chwalić":"to praise","palić":"to smoke, to burn","mylić":"to mix up",
"uczyć":"to teach","liczyć":"to count","ćwiczyć":"to practise, to exercise","tańczyć":"to dance","tłumaczyć":"to translate, to explain",
"męczyć":"to tire, to wear out","kończyć":"to finish","marzyć":"to dream","mierzyć":"to measure, to try on"
};
