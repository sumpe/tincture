# Piotrek's Metaphrase Tincture

Gêm gyfieithu brawddegau, chwaer i [Polyverb](../polyverb/) a [Casebook](../casebook/), pob iaith ar un dudalen.

- **Portiwgaleg** (`portuguese/index.html`): 200 o frawddegau Saesneg i'w cyfieithu i Bortiwgaleg Ewrop neu Bortiwgaleg Brasil, hanner yn yr amser presennol a hanner yn y gorffennol (*pretérito perfeito*), gyda berfau rheolaidd gan mwyaf. Maent yn canolbwyntio ar y pethau sy'n baglu dysgwyr sy'n siarad Sbaeneg: terfyniadau'r berfau yn ôl y person, cywasgiadau fel *à*, *às*, *no* a *da*, yr arddodiaid sy'n dilyn rhai berfau (*telefonar a*, *esperar por*), y fannod o flaen y rhagenw meddiannol, a'r geiriau sy'n wahanol rhwng y ddau amrywiad (*comboio* a *trem*, *telemóvel* a *celular*). Ar ôl pob ateb daw'r ateb cywir gyda'r geiriau sy'n wahanol wedi'u tanlinellu, nodyn ar bob camgymeriad (acen, gair Sbaeneg, y berfenw personol yn lle'r gorffennol, y person anghywir), nodiadau'r frawddeg, a sut y mae'r amrywiad arall yn ei dweud. Mae'r acenion yn cyfrif. Mae'r tab *Frases* yn rhestru pob brawddeg gyda'i chyfieithiad arferol. Yn y modd *Formas base*, mae hofran dros air yn y Saesneg (neu ei dapio) yn dangos ei ffurf sylfaenol yn Bortiwgaleg: berfenw'r ferf; yr enw yn yr unigol gyda'r fannod (neu yn y lluosog, os mai yn y lluosog yn unig y defnyddir ef); yr ansoddair yn y gwrywaidd unigol; neu'r adferf. Rhoddir ffurf sylfaenol idiom yn ei gyfanrwydd (*a lot of* → *muito*), nid fesul gair. Rhaid i chi ddod o hyd i'r ffurf gywir eich hun. Gellir ei droi ymlaen ac i ffwrdd cyn y rownd neu yn ystod y rownd, a chofir y dewis yn y porwr.

## Defnyddio

Nid oes angen gosod dim: agorwch `index.html` mewn porwr a dewiswch iaith. Cofir yr amrywiad a ddewiswyd yn y porwr.

## Sut mae'r marcio'n gweithio

Rhestrir pob cyfieithiad derbyniol fel patrwm yn `portuguese/sentences.js`:

```
"(*Telefonei|*Liguei) à minha mãe depois do jantar."
```

- `(a|b)`: a neu b; dangosir y cyntaf fel yr ateb.
- `[x]`: x neu ddim; dangosir yr ateb hebddo.
- `*gair`: y ferf, er mwyn i ferf anghywir gael ei nodyn ei hun.

Nid yw'r rhagenw goddrychol yn y patrymau: daw o'r Saesneg (*I* → *eu*, *she* → *ela*, *you (informal)* → *tu*, neu *você* ym Mrasil), a derbynnir y frawddeg gydag ef neu hebddo. Nid yw priflythrennau, comas na'r atalnod llawn ar y diwedd yn cyfrif.

Mae'r gêm yn chwilio am yr ateb derbyniol agosaf, gair wrth air, er mwyn tanlinellu'r geiriau sy'n wahanol ac egluro pob gair a gyfnewidiwyd. Ym Mhortiwgal derbynnir *-amos* yn ogystal â *-ámos* yn y gorffennol, fel yn Polyverb, gyda nodyn mai *-ámos* sy'n arferol.

## Ffeiliau

- `css/site.css`: y lliwiau (golau a thywyll), y teip, y bar llywio a'r troedyn, sy'n gyffredin i bob tudalen.
- `css/trainer.css`: yr hyn sy'n gyffredin i'r gemau (botymau dewis, cerdyn y cwestiwn, yr adolygiad, tablau).
- `js/trainer.js`: y swyddogaethau a rennir gan y gemau (adrannau, botymau dewis, bysellau'r llythrennau ag acen).
- `js/gloss.js`: yn dangos y Saesneg pan fydd y llygoden yn hofran dros destun (gyda llygoden yn unig; byth ar sgrin gyffwrdd).
- `portuguese/sentences.js`: y brawddegau, eu patrymau ar gyfer Portiwgal a Brasil, a'r nodiadau (`NOTES`).
- `portuguese/glosses.js`: y ffurfiau sylfaenol ar gyfer y modd *Formas base*, un ar gyfer pob enw, berf, ansoddair, adferf ac idiom yn y Saesneg, ar wahân ar gyfer Portiwgal a Brasil lle maent yn wahanol.
- `portuguese/check.js`: darllen y patrymau, marcio cyfieithiad a rhannu'r Saesneg ar gyfer y modd *Formas base*, heb ddim o'r dudalen, er mwyn i'r profion ei lwytho ar ei ben ei hun.
- `portuguese/app.js`: y gêm a rhestr y brawddegau.
- `tests/index.html`: yn gwirio'r brawddegau (pob patrwm; y caiff pob ateb arferol ei farcio'n gywir gyda'r rhagenw a hebddo; bod gan bob gair yn y Saesneg ffurf sylfaenol neu ei fod wedi'i hepgor yn fwriadol, a bod pob ffurf sylfaenol i'w chael yn atebion y frawddeg), yn sicrhau bod yr atebion anghywir o'r profion cyfieithu gwreiddiol yn cael eu marcio'n anghywir gyda'r nodiadau iawn, ac yn chwarae tair rownd yn y dudalen. Agorwch hi dros HTTP, nid yn syth o'r ddisg, gan fod y gêm yn cael ei llwytho mewn iframe.

Mae pob tudalen yn ychwanegu ei lliwiau ei hun mewn bloc `<style>` ac yn llwytho, yn y drefn hon, `gloss.js`, `sentences.js`, `glosses.js`, `trainer.js`, `check.js` ac `app.js`. Nid oes cam adeiladu: llwythir y ffeiliau â thagiau `<link>` a `<script src>` syml, felly mae popeth yn gweithio o'r ddisg ac ar GitHub Pages fel ei gilydd.
