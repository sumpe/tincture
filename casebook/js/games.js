// The Tincture Project: the game's name in the navigation bar opens a menu of all three games.
// The page keeps a plain link to the game's own menu page; this script turns it into a button,
// so without JavaScript the name still works as a link. It knows the game, and where the project's
// root is, from its own address (…/casebook/js/games.js), so the same file works in every game.
(function () {
  const GAMES = [
    { id: "polyverb", name: "Polyverb", what: "verbs" },
    { id: "casebook", name: "Casebook", what: "nouns" },
    { id: "metaphrase", name: "Metaphrase", what: "sentences" },
  ];
  const script = document.currentScript;
  const link = document.querySelector(".nav .brand");
  if (!script || !link) return;
  const root = new URL("../../", script.src);
  const current = new URL("..", script.src).pathname.split("/").filter(Boolean).pop();

  const button = document.createElement("button");
  button.type = "button";
  button.className = "brand";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "games-menu");
  button.innerHTML = '<span></span><svg class="chev" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';
  button.firstChild.textContent = link.textContent;

  const menu = document.createElement("ul");
  menu.className = "games-menu";
  menu.id = "games-menu";
  menu.hidden = true;
  for (const game of GAMES) {
    const item = document.createElement("li");
    const a = document.createElement("a");
    a.href = new URL(game.id + "/index.html", root).href;
    a.innerHTML = '<span class="name"></span><span class="what"></span>';
    a.firstChild.textContent = game.name;
    a.lastChild.textContent = game.what;
    if (game.id === current) a.setAttribute("aria-current", "true");
    item.append(a);
    menu.append(item);
  }
  const home = document.createElement("li");
  home.className = "home";
  home.innerHTML = '<a><span class="name">The Tincture Project</span></a>';
  home.firstChild.href = new URL("index.html", root).href;
  menu.append(home);

  const wrapper = document.createElement("div");
  wrapper.className = "games";
  link.replaceWith(wrapper);
  wrapper.append(button, menu);

  function setOpen(open) {
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
  }
  // Opened from the keyboard (a click with no pointer behind it), the focus moves to the first game.
  button.addEventListener("click", event => {
    setOpen(menu.hidden);
    if (!menu.hidden && event.detail === 0) menu.querySelector("a").focus();
  });
  // Escape closes it and gives the focus back; a click or focus anywhere else closes it too.
  wrapper.addEventListener("keydown", event => {
    if (event.key === "Escape" && !menu.hidden) {
      setOpen(false);
      button.focus();
    }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !menu.hidden) {
      event.preventDefault();
      const links = [...menu.querySelectorAll("a")];
      const at = links.indexOf(document.activeElement);
      links[(at + (event.key === "ArrowDown" ? 1 : links.length - 1)) % links.length].focus();
    }
  });
  document.addEventListener("click", event => { if (!wrapper.contains(event.target)) setOpen(false); });
  wrapper.addEventListener("focusout", event => { if (!wrapper.contains(event.relatedTarget)) setOpen(false); });
})();
