// Metaphrase, Portuguese: base forms for the gloss mode, where a noun or verb in the English shows
// its Portuguese base form: a verb's infinitive, a noun in the singular with its article, or in the
// plural when that's the only way it's used (os óculos, as férias). The inflection is left to the player.
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
  evening: "a noite", exam: { pe: "o exame", br: "a prova" }, family: "a família", father: "o pai", fish: "o peixe",
  flat: "o apartamento", floor: "o andar", flowers: "a flor", football: "o futebol", form: "o formulário",
  friend: "o amigo", friends: "o amigo", fruit: "a fruta", garage: "a garagem", glass: "o copo",
  glasses: "os óculos", grandfather: "o avô", grandmother: "a avó", grandparents: "os avós", hair: "o cabelo",
  heat: "o calor", holidays: "as férias", home: "a casa",
  homework: { pe: "os trabalhos de casa", br: "o dever de casa" }, hospital: "o hospital", hotel: "o hotel",
  hour: "a hora", hours: "a hora", house: "a casa", keys: "a chave", kitchen: "a cozinha", law: "o direito",
  letter: "a carta", letters: "a carta", library: "a biblioteca", lunch: "o almoço", manager: "o gerente",
  market: "o mercado", match: "o jogo", maths: "a matemática", medicine: "a medicina", meeting: "a reunião",
  message: "a mensagem", messages: "a mensagem", middle: "o meio", midnight: "a meia-noite", milk: "o leite",
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
  water: "a água", week: "a semana", weekend: "o fim de semana", window: "a janela", windows: "a janela",
  wine: "o vinho", word: "a palavra", year: "o ano", years: "o ano",

  // Days and months
  monday: "a segunda-feira", wednesdays: "a quarta-feira", friday: "a sexta-feira", fridays: "a sexta-feira",
  saturday: "o sábado", saturdays: "o sábado", sunday: "o domingo", sundays: "o domingo",
  march: "março", july: "julho", august: "agosto",

  // Places and languages, which go without an article in the sentence (falo português)
  algarve: "o Algarve", brazil: "o Brasil", coimbra: "Coimbra", europe: "a Europa", faro: "Faro",
  lisbon: "Lisboa", london: "Londres", paris: "Paris", porto: "o Porto", spain: { pe: "Espanha", br: "a Espanha" },
  english: "inglês", polish: { pe: "polaco", br: "polonês" }, portuguese: "português", swedish: "sueco",
};

// Two English words glossed as one
const GLOSS_PHRASES = {
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

// Words that are neither nouns nor verbs, or are part of an idiom (before bed, on time, a lot of)
const NOT_GLOSSED = new Set(("a about after all along always an and around at because bed before behind big bigger " +
  "brazilian by early eight every everything far fast five for from front good half hard he her his i in informal " +
  "last late little long lot much my near new nine o’clock of old on online our past quickly same seven she six " +
  "small ten the their they third this three time to together too twenty two until very we well whole with " +
  "yesterday you your").split(" "));
