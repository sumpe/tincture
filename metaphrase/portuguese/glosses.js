// Metaphrase, Portuguese: base forms for the gloss mode, where a word in the English shows its
// Portuguese base form: a verb's infinitive; a noun in the singular with its article, or in the plural
// when that's the only way it's used (os óculos, as férias); an adjective in the masculine singular;
// an adverb. An idiom is glossed as a whole (a lot of → muito), never word by word. The inflection,
// the contractions and whether the article belongs in the sentence are left to the player.
//
// A gloss is a string, or { pe, br } where Portugal and Brazil differ. A word that's a verb after a
// subject (I work) and a noun elsewhere (at work) is { verb, noun }.
// Each gloss is one the sentence's accepted answers use; the tests check that.

const GLOSSES = {
  // Verbs
  answer: "responder", answered: "responder",
  arrive: "chegar", arrives: "chegar", arrived: "chegar",
  ate: "comer", eat: "comer",
  buy: "comprar", bought: "comprar",
  call: { pe: "telefonar", br: "ligar" }, called: { pe: "telefonar", br: "ligar" },
  change: "mudar",
  clean: "limpar", cleaned: "limpar",
  close: "fechar", closed: "fechar",
  cook: "cozinhar", cooks: "cozinhar", cooked: "cozinhar",
  decide: "decidir", decided: "decidir",
  discovered: "descobrir",
  drink: "beber", drinks: "beber", drank: "beber",
  earn: "ganhar",
  finished: "acabar",
  forget: "esquecer", forgot: "esquecer",
  help: { verb: "ajudar", noun: "a ajuda" }, helps: "ajudar", helped: "ajudar",
  invited: "convidar",
  learn: "aprender", learned: "aprender",
  leave: "deixar", left: "deixar",
  lend: "emprestar", lent: "emprestar",
  live: { pe: "viver", br: "morar" }, lives: { pe: "viver", br: "morar" }, lived: { pe: "viver", br: "morar" },
  lost: "perder", missed: "perder",
  met: "encontrar",
  need: "precisar",
  open: "abrir", opens: "abrir", opened: "abrir",
  park: { verb: "estacionar", noun: "o parque" }, parked: "estacionar",
  pay: "pagar", paid: "pagar",
  play: "jogar",
  prepare: "preparar", prepared: "preparar",
  read: "ler",
  receive: "receber", received: "receber",
  rent: { pe: "arrendar", br: "alugar" }, rented: "alugar",
  repairs: { pe: "arranjar", br: "consertar" },
  return: "voltar",
  sell: "vender", sells: "vender", sold: "vender",
  send: "mandar", sends: "mandar", sent: "mandar",
  speak: "falar", talked: "falar",
  start: "começar",
  stay: "ficar",
  study: "estudar", studies: "estudar", studied: "estudar",
  swim: "nadar",
  take: "levar", takes: "levar",
  teach: "ensinar", teaches: "ensinar",
  travel: "viajar", travelled: "viajar",
  use: "usar", wear: "usar",
  visit: "visitar", visited: "visitar",
  wait: "esperar", waited: "esperar",
  walk: "caminhar", walked: "caminhar",
  was: "estar",
  wash: "lavar", washed: "lavar",
  work: { verb: "trabalhar", noun: "o trabalho" }, works: "trabalhar", worked: "trabalhar",
  write: "escrever", wrote: "escrever",

  // Nouns
  account: "a conta", airport: "o aeroporto", aunt: "a tia",
  bag: { pe: "a mala", br: "a bolsa" }, bakery: "a padaria", bank: "o banco", beach: "a praia", beans: "o feijão",
  bicycle: "a bicicleta", bill: "a conta", bills: "a conta", book: "o livro", books: "o livro", boss: "o chefe",
  bottle: "a garrafa", bread: "o pão", brother: "o irmão", bus: { pe: "o autocarro", br: "o ônibus" },
  café: "o café", car: "o carro", cars: "o carro", card: { pe: "o postal", br: "o cartão" }, centre: "o centro",
  children: "a criança", cinema: "o cinema", city: "a cidade", class: "a aula", clothes: "a roupa", coffee: "o café",
  colleagues: "o colega", computer: "o computador", concert: { pe: "o concerto", br: "o show" }, country: "o campo",
  day: "o dia", dinner: "o jantar", dishes: { pe: "a loiça", br: "a louça" }, doctor: "o médico",
  dog: { pe: "o cão", br: "o cachorro" }, door: "a porta", email: "o e-mail", emails: "o e-mail", end: "o fim",
  exam: { pe: "o exame", br: "a prova" }, family: "a família", father: "o pai", fish: "o peixe",
  flat: "o apartamento", floor: "o andar", flowers: "a flor", football: "o futebol", form: "o formulário",
  friend: "o amigo", friends: "o amigo", fruit: "a fruta", garage: "a garagem", glass: "o copo",
  glasses: "os óculos", grandfather: "o avô", grandmother: "a avó", grandparents: "os avós", hair: "o cabelo",
  heat: "o calor", holidays: "as férias", home: "a casa",
  homework: { pe: "os trabalhos de casa", br: "o dever de casa" }, hospital: "o hospital", hotel: "o hotel",
  hour: "a hora", hours: "a hora", house: "a casa", keys: "a chave", kitchen: "a cozinha", law: "o direito",
  letter: "a carta", letters: "a carta", library: "a biblioteca", lunch: "o almoço", manager: "o gerente",
  market: "o mercado", match: "o jogo", maths: "a matemática", medicine: "a medicina", meeting: "a reunião",
  message: "a mensagem", messages: "a mensagem", midnight: "a meia-noite", milk: "o leite",
  minutes: "o minuto", money: "o dinheiro", month: "o mês", morning: "a manhã", mother: "a mãe",
  move: "a mudança", museum: "o museu", name: "o nome", neighbour: "o vizinho", neighbours: "o vizinho",
  news: "a notícia", night: "a noite", north: "o norte", office: "o escritório", paintings: "o quadro",
  parcel: { pe: "a encomenda", br: "o pacote" }, parents: "os pais", party: "a festa", passports: "o passaporte",
  phone: { pe: "o telemóvel", br: "o celular" }, photos: "a foto", police: "a polícia",
  postcard: { pe: "o postal", br: "o cartão-postal" }, present: "o presente", presents: "o presente",
  problem: "o problema", questions: "a pergunta", restaurant: "o restaurante", results: "o resultado",
  rice: "o arroz", river: "o rio", salad: "a salada", school: "a escola", sea: "o mar", shop: "a loja",
  shopping: "as compras", sister: "a irmã", soup: "a sopa", station: "a estação", street: "a rua",
  summer: "o verão", sunset: "o pôr do sol", table: "a mesa", tea: "o chá", teacher: "o professor",
  test: { pe: "o teste", br: "a prova" }, tickets: "o bilhete", train: { pe: "o comboio", br: "o trem" },
  trains: { pe: "o comboio", br: "o trem" }, truth: "a verdade", umbrella: "o guarda-chuva",
  underground: { pe: "o metro", br: "o metrô" }, university: "a universidade",
  vegetables: "o legume", village: { pe: "a aldeia", br: "o vilarejo" }, wallet: "a carteira",
  water: "a água", week: "a semana", window: "a janela", windows: "a janela",
  wine: "o vinho", word: "a palavra", year: "o ano", years: "o ano",

  // Days and months
  monday: "a segunda-feira", wednesdays: "a quarta-feira", friday: "a sexta-feira", fridays: "a sexta-feira",
  saturday: "o sábado", saturdays: "o sábado", sunday: "o domingo", sundays: "o domingo",
  march: "março", july: "julho", august: "agosto",

  // Places, with the article where the place takes one; languages with theirs, though the sentence
  // usually goes without (falo português)
  algarve: "o Algarve", brazil: "o Brasil", coimbra: "Coimbra", europe: "a Europa", faro: "Faro",
  lisbon: "Lisboa", london: "Londres", paris: "Paris", porto: "o Porto", spain: { pe: "Espanha", br: "a Espanha" },
  english: "o inglês", polish: { pe: "o polaco", br: "o polonês" }, portuguese: "o português", swedish: "o sueco",

  // Adjectives, in the masculine singular
  big: "grande", bigger: "maior", brazilian: "brasileiro", good: "bom", last: "passado", little: "pouco",
  long: "longo", new: "novo", old: "velho", same: "mesmo", small: "pequeno", third: "terceiro",
  every: "todo", all: "todo", whole: "todo",

  // Adverbs, and prepositions Portuguese says in more than one word
  always: "sempre", early: "cedo", fast: { pe: "depressa", br: "rápido" }, late: "tarde", online: "online",
  quickly: { pe: "depressa", br: "rápido" }, together: "junto", very: "muito", well: "bem", yesterday: "ontem",
  near: "perto de", behind: "atrás de", along: "ao longo de",
};

// Several English words glossed as one, idioms above all; the longest match wins
const GLOSS_PHRASES = {
  "a lot of": "muito", "a lot": "muito",
  "before bed": "antes de dormir",
  "on time": { pe: "a horas", br: "na hora" },
  "because of": "por causa de",
  "too much": { pe: "demasiado", br: "demais" },
  "very hard": "muito",
  "in front of": "em frente de",
  "in the middle of": { pe: "a meio de", br: "no meio de" },
  "far from": "longe de",
  "half past": "e meia",
  "in the morning": "de manhã",
  "in the evening": "à noite",
  "at night": "à noite",
  "at the weekend": { pe: "ao fim de semana", br: "no fim de semana" },
  "had dinner": "jantar",
  "had breakfast": { pe: "tomar o pequeno-almoço", br: "tomar o café da manhã" },
  "eat lunch": "almoçar",
  "christmas eve": "a véspera de Natal",
  "secondary school": { pe: "a escola secundária", br: "a escola de ensino médio" },
};

// Where a word means something else in one sentence
const GLOSS_OVERRIDES = {
  "I take the bus to work every day.": { take: { pe: "apanhar", br: "pegar" } },
  "I take photos of the city.": { take: "tirar" },
  "You (informal) answer the phone at work.": { answer: "atender", phone: "o telefone" },
  "You (informal) answered the phone in the middle of the meeting.": { answered: "atender", phone: "o telefone" },
  "We buy the tickets at the station.": { tickets: { pe: "o bilhete", br: "a passagem" } },
  "They bought tickets for the concert.": { tickets: { pe: "o bilhete", br: "o ingresso" } },
  "She repairs cars in her father’s garage.": { garage: "a oficina" },
};

// Left alone: articles, pronouns, possessives, numbers and simple prepositions
const NOT_GLOSSED = new Set(("a about after an and around at before by eight everything five for from he her his i " +
  "in informal my nine o’clock of on our seven she six ten the their they this three to twenty two until we with " +
  "you your").split(" "));
