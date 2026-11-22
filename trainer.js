// Polyverb: what the three trainers share. Each page loads this before its own app.js.
// Loaded with a plain <script src>, not as a module, so the pages still work opened straight from disk.
// view() calls the page's own buildTable(), which app.js defines.

const $=id=>document.getElementById(id);
const norm=s=>s.trim().toLowerCase().normalize("NFC").replace(/\s+/g," ");
const shuf=a=>{a=a.slice();for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]];}return a;};
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
const en=(node,txt)=>{node.dataset.en=txt;return node;};

// A row of buttons where exactly one is on; fn gets the chosen button's data-v
function seg(id,fn){
  const bs=document.querySelectorAll("#"+id+" button");
  bs.forEach(b=>b.onclick=()=>{
    fn(b.dataset.v);
    bs.forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-pressed",String(x===b));});
  });
}

// Which section shows: setup, quiz or results, or the tables when the address ends in #tables.
// A tables section marked data-wide widens the page.
let cur="setup";
function view(){
  const t=location.hash==="#tables";
  ["setup","quiz","done"].forEach(s=>$(s).hidden=t||s!==cur);
  $("tbl-view").hidden=!t;$("sub").hidden=t;
  document.body.classList.toggle("play",!t&&cur!=="setup");
  document.body.classList.toggle("wide",t&&"wide" in $("tbl-view").dataset);
  [["tab-game",!t],["tab-tables",t]].forEach(([id,on])=>on?$(id).setAttribute("aria-current","page"):$(id).removeAttribute("aria-current"));
  if(t)buildTable();
  window.scrollTo(0,0);
}
function show(id){cur=id;view();}

// The letter keys under the answer, in #keys. They type at the cursor of target() and leave the
// focus there, so a phone keyboard stays open.
function letterKeys(chars,target){
  const type=ch=>{
    const a=target();if(a.readOnly)return;
    const s=a.selectionStart??a.value.length,e=a.selectionEnd??s;
    a.setRangeText(ch,s,e,"end");a.focus();
  };
  chars.forEach(ch=>{
    const b=el("button",null,ch);b.type="button";
    b.addEventListener("mousedown",e=>e.preventDefault());
    b.addEventListener("touchstart",e=>{e.preventDefault();type(ch);},{passive:false});
    b.onclick=()=>type(ch);
    $("keys").appendChild(b);
  });
}
const keysOn=on=>[...$("keys").children].forEach(b=>{b.disabled=!on;});

// The little timeline beside the tense (Portuguese and Polish)
const TLM={
  pres:'<circle class="d" cx="26" cy="7" r="3.5"/>',
  past:'<path class="m" d="M26 7H6M11 2.5 6 7l5 4.5"/>',
  plup:'<path class="m" d="M26 7H4M9 2.5 4 7l5 4.5M15 2.5 10 7l5 4.5"/>',
  fut:'<path class="m" d="M26 7H46M41 2.5 46 7l-5 4.5"/>',
  cond:'<path class="m dash" d="M26 7H43"/><path class="m" d="M41 2.5 46 7l-5 4.5"/>'
};
const tline=k=>'<line class="b" x1="2" y1="7" x2="50" y2="7"/><line class="n" x1="26" y1="2" x2="26" y2="12"/>'+TLM[k];
