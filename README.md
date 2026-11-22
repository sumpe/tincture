# Piotrek's Polynoun Tincture

Substantivtrainer, Geschwister von [Polyverb](https://github.com/sumpe/polyverb), jeder auf einer einzigen Seite.

- **Polnisch** (`polish/index.html`): sechs Formen von 115 Alltagssubstantiven (Nominativ Plural, Genitiv Singular und Plural, Akkusativ, Lokativ und Instrumental Singular), jede in einer Wendung, die sie verlangt: *nie ma ___*, *myślę o ___*. Nach jeder Antwort erscheint die Regel, die sie erklärt. Dazu kommt ein eigener Trainer für den Genitiv der unbelebten Maskulina: *-a* oder *-u*?
- **Schwedisch** (`swedish/index.html`): der Plural, in vier Stufen danach, wie vorhersehbar er ist, und nicht danach, wie schwer das Wort ist: leicht, mittel, schwer (Umlaut und Unregelmäßiges) und einsilbige Wörter (*-ar* oder *-er*?).

## Benutzung

Es muss nichts installiert werden: einfach `index.html` im Browser öffnen und eine Sprache wählen.

## Dateien

- `css/site.css`: die Farben (hell und dunkel), die Schrift, die Navigationsleiste und die Fußzeile, die alle Seiten teilen.
- `css/trainer.css`: was die Trainer gemeinsam haben (Auswahlknöpfe, Fragekarte, Wiederholung, Tabellen).
- `js/trainer.js`: die Funktionen, die die Trainer teilen (Abschnitte, Auswahlknöpfe, Buchstabentasten, die Markierung des Teils einer Form, der sich ändert).
- `js/gloss.js`: zeigt die englische Übersetzung eines Textes, wenn man mit der Maus darüberfährt (nur mit Maus, nie auf Touchscreens).
- `<Sprache>/app.js`: das Spiel und die Tabellen der jeweiligen Sprache.
- `swedish/nouns.js`: die schwedischen Substantive mit Plural, Gruppe und Hinweis, in den vier Stufen (`POOLS`).
- `polish/nouns.js`: die polnischen Substantive mit ihren sechs Formen und die Regeln, aus denen die Hinweise entstehen (`rulesFor`).
- `tests/index.html`: prüft die Daten (zum Beispiel, dass jede regelmäßige polnische Form der Regel folgt, die ihr Hinweis nennt) und spielt in jedem Trainer eine Runde. Über HTTP öffnen, nicht direkt von der Festplatte, weil die Seiten in iframes geladen werden.

Jede Seite ergänzt ihre eigenen Farben in einem `<style>`-Block und lädt in dieser Reihenfolge `gloss.js`, `nouns.js`, `trainer.js` und `app.js`. Es gibt keinen Build-Schritt: Die Dateien werden mit einfachen `<link>`- und `<script src>`-Tags geladen, deshalb funktioniert alles sowohl direkt von der Festplatte als auch über GitHub Pages.
