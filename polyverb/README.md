# Polyverb

Aditz-jokoko ariketak, bakoitza orri bakarrean.

- **Portugesa** (`portuguese/index.html`): indikatiboko, baldintzazko eta subjuntiboko bederatzi aldi, subjuntiboko geroaldia barne. Aditz erregularrak eta irregularrak, Europako portugesez (*vós* formak aukeran) edo Brasilgo portugesez (*tu* eta *vós* gabe), eta aditz-taulak, nahi izanez gero gaztelaniarekin alderatuta. Bi aukerak nabigatzailean gordetzen dira.
- **Poloniera** (`polish/index.html`): -ać, -ować eta -ić/-yć amaierako aditz erregularrak orainaldian, iraganean, geroaldian eta baldintzan, genero bakoitzaren formekin.
- **Suediera** (`swedish/index.html`): 483 aditzen aldi nagusiak (presens, preteritum eta supinum), lau aditz-taldeetakoak: ohikoenak ariketan, lehenetsita, eta denak tauletan, ordena alfabetikoan.

## Erabilera

Ez da ezer instalatu behar: ireki `index.html` nabigatzaile batean eta aukeratu hizkuntza bat.

## Fitxategiak

- `css/site.css`: koloreak (argia eta iluna), tipografia, nabigazio-barra eta orri-oina, hiru orrietan berdinak.
- `css/trainer.css`: ariketek partekatzen dutena (aukerak, galderaren txartela, berrikuspena, taulak).
- `js/trainer.js`: hiru ariketek partekatzen dituzten funtzioak (atalak, aukera-botoiak, letra-teklak, denbora-lerroa).
- `<hizkuntza>/app.js`: hizkuntza bakoitzaren jokoa eta taulak.
- `portuguese/verbs.js`: portugesezko eta gaztelaniazko aditzen datuak.
- `polish/verbs.js`: polonierazko aditzak, klaseka, eta haien ingelesezko itzulpena.
- `swedish/verbs.js`: suedierazko aditzak eta haien aldi nagusiak, ohikoak (`COMMON_VERBS`) eta gainerakoak (`RARER_VERBS`).
- `js/gloss.js`: testu baten ingelesezko itzulpena erakusten du sagua gainetik pasatzean (saguarekin bakarrik; ukipen-pantailetan inoiz ez).

Orri bakoitzak bere koloreak gehitzen ditu `<style>` bloke batean, eta ordena honetan kargatzen ditu `gloss.js`, `verbs.js`, `trainer.js` eta `app.js`. Ez dago konpilazio-urratsik: fitxategiak `<link>` eta `<script src>` etiketa soilekin kargatzen dira, eta, beraz, dena dabil bai diskotik zuzenean irekita, bai GitHub Pages-en bidez zerbitzatuta.
