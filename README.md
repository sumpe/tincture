# Piotrek's Polynoun Tincture

Treinos de substantivos, irmão do [Polyverb](https://github.com/sumpe/polyverb), cada um numa só página.

- **Polaco** (`polish/index.html`): seis formas de 115 substantivos do dia a dia (nominativo plural, genitivo singular e plural, acusativo, locativo e instrumental), cada uma numa frase que a pede: *nie ma ___*, *myślę o ___*. Depois de cada resposta aparece a regra que a explica. Há ainda um treino só para o genitivo dos masculinos inanimados: *-a* ou *-u*?
- **Sueco** (`swedish/index.html`): o plural, em quatro níveis consoante quão previsível ele é, e não quão difícil é a palavra: fácil, médio, difícil (metafonia e irregulares) e monossílabos (*-ar* ou *-er*?).

## Como usar

Não é preciso instalar nada: abre o `index.html` num browser e escolhe uma língua.

## Ficheiros

- `css/site.css`: as cores (claro e escuro), a tipografia, a barra de navegação e o rodapé, comuns a todas as páginas.
- `css/trainer.css`: o que os treinos partilham (escolhas, cartão da pergunta, revisão, tabelas).
- `js/trainer.js`: as funções que os treinos partilham (secções, botões de escolha, teclas de letras, a parte da forma que muda).
- `js/gloss.js`: mostra a tradução inglesa de um texto quando se passa o rato por cima (só com rato; nunca em ecrãs táteis).
- `<língua>/app.js`: o jogo e as tabelas de cada língua.
- `swedish/nouns.js`: os substantivos suecos, o plural, o grupo e a dica de cada um, nos quatro níveis (`POOLS`).
- `polish/nouns.js`: os substantivos polacos e as suas seis formas, e as regras que geram as notas (`rulesFor`).
- `tests/index.html`: verifica os dados (por exemplo, que cada forma polaca regular segue a regra que a nota lhe atribui) e joga uma ronda de cada treino. Abre-o num browser servido por HTTP, não diretamente do disco, porque carrega as páginas em iframes.

Cada página acrescenta as suas próprias cores num bloco `<style>` e carrega, por esta ordem, `gloss.js`, `nouns.js`, `trainer.js` e `app.js`. Não há passo de compilação: os ficheiros são carregados com `<link>` e `<script src>` simples, por isso tudo funciona tanto aberto diretamente do disco como servido pelo GitHub Pages.
