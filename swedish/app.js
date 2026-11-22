// Polyverb, Swedish: the game and the tables. Shared helpers are in ../trainer.js.

const SLOT=["presens","preteritum","supinum"],SLOT_EN=["present","past","supine"];
const GL=["Första","Andra","Tredje","Fjärde"],GL_EN=["First","Second","Third","Fourth"];
const GN=["första konjugationen","andra konjugationen","tredje konjugationen","fjärde konjugationen"];
const GN_EN=["1st conjugation","2nd conjugation","3rd conjugation","4th conjugation: strong and irregular"];

const accepts=(form,typed)=>form.split("/").some(x=>norm(x)===norm(typed));
const mk=common=>([v,pres,pret,sup,g,gloss])=>({v,f:[pres,pret,sup],g:g-1,gloss,common});
const VERBS=SV.map(mk(true)).concat(SV_MORE.map(mk(false)));
const FI=[$("f0"),$("f1"),$("f2")];
// Every form of every verb, infinitive included (slot -1), so a wrong answer can be traced to where it belongs
const IDX=Object.create(null);
VERBS.forEach(x=>[x.v].concat(x.f).forEach((f,s)=>f.split("/").forEach(y=>{const k=norm(y);(IDX[k]=IDX[k]||[]).push({x,s:s-1});})));
// What a wrong answer in box k really is: up to two {verb, slots}, or null.
// Forms of the verb that was asked win over look-alikes from other verbs.
function info(c,k,t){
  const m=t&&IDX[norm(t)];if(!m)return null;
  const by=new Map();
  m.forEach(({x,s})=>{if(x===c&&s===k)return;if(!by.has(x))by.set(x,[]);if(!by.get(x).includes(s))by.get(x).push(s);});
  let l=[...by].map(([x,s])=>({x,s}));const own=l.filter(y=>y.x===c);if(own.length)l=own;
  return l.length?l.slice(0,2):null;
}
// ...said in Swedish, "preteritum av se", and in English, "the past of se (to see)"
const list=(a,w)=>a.length>1?a.slice(0,-1).join(", ")+" "+w+" "+a[a.length-1]:a[0];
const infoSv=(l,c)=>l.map(y=>list(y.s.map(s=>s<0?"infinitiv":SLOT[s]),"och")+(y.x===c?"":" av "+y.x.v)).join(" eller ");
const infoEn=(l,c)=>l.map(y=>"the "+list(y.s.map(s=>s<0?"infinitive":SLOT_EN[s]),"and")+(y.x===c?"":" of "+y.x.v+" ("+y.x.gloss+")")).join(" or ");

let n=20,groups=[0,1,2,3],which="common",tg=0,q=[],i=0,score=0,miss=[],phase="",lastInput=FI[0];

seg("seg",v=>{n=+v;});
seg("which",v=>{which=v;});
seg("tconj",v=>{tg=+v;buildTable();});

// The four conjugations: any combination, at least one
GL.forEach((l,k)=>{
  const b=en(el("button",null,l),GL_EN[k]+" conjugation");
  b.onclick=()=>{const on=groups.includes(k);if(on&&groups.length===1)return;groups=on?groups.filter(x=>x!==k):groups.concat(k).sort();paintG();};
  $("conj").appendChild(b);
});
function paintG(){
  [...$("conj").children].forEach((b,k)=>{const on=groups.includes(k);b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));});
  // How many verbs each choice gives, for the conjugations picked
  const inG=VERBS.filter(x=>groups.includes(x.g)),c=inG.filter(x=>x.common).length;
  $("w-common").textContent="Vanliga ("+c+")";$("w-all").textContent="Alla ("+inG.length+")";
}
paintG();

letterKeys("å ä ö".split(" "),()=>lastInput);

function start(){
  const pool=shuf(VERBS.filter(x=>groups.includes(x.g)&&(which==="all"||x.common)));
  q=pool.slice(0,n);i=0;score=0;miss=[];
  show("quiz");render();
}

function render(){
  const c=q[i];phase="ask";
  en($("prog"),"Question "+(i+1)+" of "+q.length).textContent="Fråga "+(i+1)+" av "+q.length;
  en($("score"),"Score "+score).textContent="Poäng "+score;
  $("fill").style.width=(i/q.length*100)+"%";
  en($("verb"),c.gloss).textContent=c.v;
  FI.forEach((f,k)=>{f.value="";f.readOnly=false;f.className="";$("r"+k).textContent="";});
  keysOn(true);
  $("fb").hidden=true;en($("go"),"Check").textContent="Kontrollera";
  FI[0].focus();
}

function go(){
  if(phase==="ask"){
    const c=q[i],typed=FI.map(f=>f.value.trim()),ok=typed.map((t,k)=>!!t&&accepts(c.f[k],t)),all=ok.every(Boolean);
    if(all)score++;else miss.push({c,typed,ok});
    FI.forEach((f,k)=>{
      f.readOnly=true;f.className=ok[k]?"ok":"bad";
      const r=$("r"+k);r.textContent="";
      if(!ok[k]){
        r.append(c.f[k].replace("/"," / "));
        // Typed a real form, of this verb or another, in the wrong box? Say which one it is.
        const inf=info(c,k,typed[k]);
        if(inf)r.append(en(el("span","k","det är "+infoSv(inf,c)),"that's "+infoEn(inf,c)));
      }
    });
    keysOn(false);
    const right=ok.filter(Boolean).length,fb=$("fb");
    fb.hidden=false;fb.className="fb "+(all?"ok":"bad");fb.textContent="";
    fb.append(all?en(el("span",null,"Rätt"),"Correct"):en(el("span",null,right+" av 3 rätt"),right+" of 3 correct"));
    en($("score"),"Score "+score).textContent="Poäng "+score;
    $("fill").style.width=((i+1)/q.length*100)+"%";
    const last=i===q.length-1;en($("go"),last?"See your score":"Next").textContent=last?"Se resultatet":"Nästa";
    phase="review";
  }else{
    i++;
    if(i<q.length)render();else finish();
  }
}

function finish(){
  show("done");
  $("res").textContent=score+" / "+q.length;
  const pc=Math.round(score/q.length*100);
  en($("pct"),pc+"% correct"+(miss.length?"":", no mistakes")).textContent=pc+" % rätt"+(miss.length?"":", inga fel");
  $("misshead").hidden=$("miss").hidden=!miss.length;
  const L=$("miss");[...L.tBodies].forEach(b=>b.remove());
  miss.forEach(m=>{
    const c=m.c,b=L.createTBody(),h=el("th");
    h.colSpan=3;h.scope="rowgroup";b.insertRow().append(h);
    h.append(en(el("span","v",c.v),c.gloss),en(el("span","k",GN[c.g]),GN_EN[c.g]));
    const r=b.insertRow();
    c.f.forEach((form,k)=>{
      const td=r.insertCell();
      if(m.ok[k]){td.append(el("span","fine",m.typed[k]));return;}
      const inf=info(c,k,m.typed[k]);
      if(inf)td.className="real";
      td.append(el("span","no",m.typed[k]||"—"),el("span","yes",form.replace("/"," / ")));
      if(inf)td.append(en(el("span","k","det är "+infoSv(inf,c)),"you wrote "+infoEn(inf,c)));
    });
  });
}

// Enter moves on to the next empty box; once all three are filled it checks them.
FI.forEach((f,k)=>{
  f.addEventListener("focus",()=>{lastInput=f;});
  f.addEventListener("keydown",e=>{
    if(e.key!=="Enter"||e.isComposing)return;
    e.preventDefault();if(e.repeat)return;
    if(phase==="ask"){
      const next=[...FI.slice(k+1),...FI.slice(0,k)].find(x=>!x.value.trim());
      if(next){next.focus();return;}
    }
    go();
  });
});
// One conjugation, every verb, alphabetical (Swedish order: å, ä, ö after z).
// Only the infinitive carries English on hover.
const ORD=["första","andra","tredje","fjärde"],ORD_EN=["first","second","third","fourth"];
function buildTable(){
  const vs=VERBS.filter(x=>x.g===tg).sort((a,b)=>a.v.localeCompare(b.v,"sv")),tab=$("tbl");
  en($("tcount"),vs.length+" verbs in the "+ORD_EN[tg]+" conjugation").textContent=vs.length+" verb i "+ORD[tg]+" konjugationen";
  tab.textContent="";
  const h=tab.createTHead().insertRow();
  [["infinitiv","infinitive"]].concat(SLOT.map((x,k)=>[x,SLOT_EN[k]])).forEach(([sv,e])=>h.appendChild(en(el("th",null,sv),e)));
  const tb=tab.createTBody();
  vs.forEach(x=>{
    const r=tb.insertRow();
    en(r.insertCell(),x.gloss).textContent=x.v;
    x.f.forEach(f=>{r.insertCell().textContent=f.replace("/"," / ");});
  });
}
window.addEventListener("hashchange",view);
$("start").onclick=start;
$("go").onclick=go;
$("again").onclick=start;
$("change").onclick=()=>show("setup");
view();
