// The Tincture Project: the game's name in the navigation bar opens a menu of all three games.
// The page keeps a plain link to the game's own menu page; this script turns it into a button,
// so without JavaScript the name still works as a link. It brings its own styles too. It knows the
// game, and where the project's root is, from its own address (…/casebook/js/games.js), so the
// same file works in every game.
(function () {
  const GAMES = [
    { id: "polyverb", name: "Polyverb", what: "verbs" },
    { id: "casebook", name: "Casebook", what: "nouns" },
    { id: "metaphrase", name: "Metaphrase", what: "sentences" },
  ];
  const script = document.currentScript;
  const link = document.querySelector(".nav .brand");
  if (!script || !link) return;
  // The menu's own styles travel with it, so a browser holding an older stylesheet still draws it
  // properly. They use the colours site.css defines.
  const style = document.createElement("style");
  style.textContent = [
    ".games{position:relative}",
    "button.brand{gap:7px;padding:0;border:0;background:none;-webkit-appearance:none;appearance:none;cursor:pointer}",
    ".gm-chev{width:10px;height:6px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;transition:transform .15s}",
    '.brand[aria-expanded="true"] .gm-chev{transform:rotate(180deg)}',
    ".games-menu{position:absolute;top:calc(100% + 2px);left:-12px;z-index:30;min-width:250px;margin:0;padding:6px;list-style:none;background:var(--card);border:1px solid var(--line);border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.14)}",
    ".games-menu a{display:flex;font-size:1rem;font-weight:400;font-style:normal;align-items:baseline;justify-content:space-between;gap:18px;min-height:44px;padding:11px 10px;border-radius:5px;color:var(--ink);text-decoration:none;line-height:1.2}",
    ".games-menu .gm-name{font-size:1rem}",
    ".games-menu .gm-what{color:var(--muted);font-style:italic;font-size:.9rem}",
    ".games-menu a[aria-current] .gm-name{color:var(--accent);font-weight:600}",
    ".games-menu .gm-home{margin-top:6px;padding-top:6px;border-top:1px solid var(--line)}",
    ".games-menu .gm-home a{color:var(--muted);font-style:italic}",
    "@media (hover:hover){.games-menu a:hover{background:var(--hover)}}",
  ].join("\n");
  document.head.append(style);

  const root = new URL("../../", script.src);
  const current = new URL("..", script.src).pathname.split("/").filter(Boolean).pop();

  const button = document.createElement("button");
  button.type = "button";
  button.className = "brand";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "games-menu");
  button.innerHTML = '<span></span><svg class="gm-chev" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';
  button.firstChild.textContent = link.textContent;

  const menu = document.createElement("ul");
  menu.className = "games-menu";
  menu.id = "games-menu";
  menu.hidden = true;
  for (const game of GAMES) {
    const item = document.createElement("li");
    const a = document.createElement("a");
    a.href = new URL(game.id + "/index.html", root).href;
    a.innerHTML = '<span class="gm-name"></span><span class="gm-what"></span>';
    a.firstChild.textContent = game.name;
    a.lastChild.textContent = game.what;
    if (game.id === current) a.setAttribute("aria-current", "true");
    item.append(a);
    menu.append(item);
  }
  const home = document.createElement("li");
  home.className = "gm-home";
  home.innerHTML = '<a><span class="gm-name">The Tincture Project</span></a>';
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
