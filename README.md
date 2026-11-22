# Piotrek's Polyverb Tincture

Treinos de conjugação verbal, cada um numa só página.

- **Português europeu** (`portuguese/index.html`): nove tempos do indicativo, condicional e conjuntivo, incluindo o futuro do conjuntivo. Verbos regulares e irregulares, formas de *vós* opcionais e tabelas de verbos com comparação com o espanhol.
- **Polaco** (`polish/index.html`): verbos regulares em -ać, -ować e -ić/-yć no presente, no passado, no futuro e no condicional, com as formas de cada género.
- **Sueco** (`swedish/index.html`): os tempos principais (presens, preteritum e supinum) de 483 verbos, das quatro conjugações: os mais comuns no treino por omissão, todos nas tabelas, por ordem alfabética.

## Como usar

Não é preciso instalar nada: abre o `index.html` num browser e escolhe uma língua.

## Ficheiros

- `site.css`: as cores (claro e escuro), a tipografia, a barra de navegação e o rodapé, comuns às três páginas.
- `trainer.css`: o que os treinos partilham (escolhas, cartão da pergunta, revisão, tabelas).
- `trainer.js`: as funções que os três treinos partilham (secções, botões de escolha, teclas de letras, linha do tempo).
- `<língua>/app.js`: o jogo e as tabelas de cada língua.
- `portuguese/verbs.js`: os dados dos verbos portugueses e espanhóis.
- `polish/verbs.js`: os verbos polacos, por classe, e a sua tradução inglesa.
- `swedish/verbs.js`: os verbos suecos e os seus tempos principais, os comuns (`SV`) e os restantes (`SV_MORE`).
- `gloss.js`: mostra a tradução inglesa de um texto quando se passa o rato por cima (só com rato; nunca em ecrãs táteis).

Cada página acrescenta as suas próprias cores num bloco `<style>` e carrega, por esta ordem, `gloss.js`, `verbs.js`, `trainer.js` e `app.js`. Não há passo de compilação: os ficheiros são carregados com `<link>` e `<script src>` simples, por isso tudo funciona tanto aberto diretamente do disco como servido pelo GitHub Pages.
