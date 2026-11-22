// Polyverb, Portuguese: the game and the tables. Shared helpers are in ../trainer.js.

const T=["Presente do indicativo","Pretérito perfeito","Pretérito imperfeito","Mais-que-perfeito simples","Futuro","Condicional","Presente do conjuntivo","Pretérito imperfeito do conjuntivo","Futuro do conjuntivo"];
const P=[["eu","1.ª sing."],["tu","2.ª sing."],["ele / ela","3.ª sing."],["nós","1.ª pl."],["vós","2.ª pl."],["eles / elas","3.ª pl."]];
// English for the hover slips (gloss.js)
const T_EN=["Present indicative","Preterite","Imperfect","Simple pluperfect","Future","Conditional","Present subjunctive","Imperfect subjunctive","Future subjunctive"];
const P_EN=[["I","1st person singular"],["you","2nd person singular"],["he / she","3rd person singular"],["we","1st person plural"],["you all","2nd person plural"],["they","3rd person plural"]];

const IDX=Object.create(null);
const EN={
ar:["o as a amos ais am","ei aste ou ámos/amos astes aram","ava avas ava ávamos áveis avam","ara aras ara áramos áreis aram","","","e es e emos eis em","asse asses asse ássemos ásseis assem",""],
er:["o es e emos eis em","i este eu emos estes eram","ia ias ia íamos íeis iam","era eras era êramos êreis eram","","","a as a amos ais am","esse esses esse êssemos êsseis essem",""],
ir:["o es e imos is em","i iste iu imos istes iram","ia ias ia íamos íeis iam","ira iras ira íramos íreis iram","","","a as a amos ais am","isse isses isse íssemos ísseis issem",""]
};
const TL4="ei ás á emos eis ão".split(" "),TL5="ia ias ia íamos íeis iam".split(" "),TL8=["","es","","mos","des","em"];
function conj(v){
  const k=v.slice(-2),s=v.slice(0,-2);
  const mk=(st,en)=>en.map(x=>x.split("/").map(y=>st+y).join("/")).join(" ");
  return EN[k].map((e,t)=>t===4?mk(v,TL4):t===5?mk(v,TL5):t===8?mk(v,TL8):mk(s,e.split(" ")));
}
const ALLV=Object.assign({},D);
for(const c in REGV)REGV[c].forEach(v=>{if(!ALLV[v])ALLV[v]=conj(v);});
for(const v in ALLV)ALLV[v].forEach((s,t)=>s.split(" ").forEach((f,p)=>f.split("/").forEach(x=>{const k=norm(x);(IDX[k]=IDX[k]||[]).push({v:v,t:t,p:p});})));
const TS=["presente","perfeito","imperfeito","mais-que-perfeito","futuro","condicional","presente do conjuntivo","imperfeito do conjuntivo","futuro do conjuntivo"];
const PS=["eu","tu","ele","nós","vós","eles"];
const TS_EN=["present","preterite","imperfect","pluperfect","future","conditional","present subjunctive","imperfect subjunctive","future subjunctive"];
const PS_EN=["I","you","he","we","you all","they"];
// Where a wrong answer really belongs: up to two {verb, tense, persons}, or none.
// Forms of the verb that was asked win over look-alikes from other verbs.
function info(g,c){
  const m=IDX[g];if(!m)return null;
  const k={};
  m.forEach(x=>{const key=x.v+"|"+x.t;(k[key]=k[key]||{v:x.v,t:x.t,ps:[]}).ps.push(x.p);});
  let l=Object.values(k);const own=l.filter(x=>x.v===c.v);if(own.length)l=own;
  return l.slice(0,2).map(x=>({same:x.v===c.v,v:x.v,t:x.t,ps:x.ps}));
}
// ...said in Portuguese, e.g. "do imperfeito · eu, ele", and in English
const infoPt=l=>l.map(x=>(x.same?"do ":"de "+x.v+", ")+TS[x.t]+" · "+x.ps.map(p=>PS[p]).join(", ")).join("; ");
const infoEn=l=>l.map(x=>(x.same?"the ":"a form of "+x.v+" ("+GLOSS[x.v]+"), ")+TS_EN[x.t]+" · "+x.ps.map(p=>PS_EN[p]).join(", ")).join("; ");
const mood=(node,s)=>{node.textContent="";s.split(/(conjuntivo)/).forEach((x,k)=>{if(x)node.append(k%2?el("span","mood",x):x);});return node;};
const alts=(node,a)=>a.forEach((x,k)=>{if(k)node.append(" ",en(el("span","or","ou"),"or")," ");node.append(x);});
const KEYS="á à â ã é ê í ó ô õ ú ç".split(" ");
letterKeys(KEYS,()=>$("ans"));
const REG=["cantar","comer","abrir"];
let n=20,q=[],i=0,score=0,miss=[],phase="";
const GR={reg:["cantar","comer","abrir"],ess:["ser","estar","ter","haver","pôr","ir"],fre:["fazer", "dizer", "dar", "ver", "vir", "poder", "querer", "saber"],com:["trazer", "ler", "sair", "ouvir", "pedir", "dormir"]};
const GL={reg:"Regulares",ess:"Essenciais",fre:"Frequentes",com:"Complementares"};
const GL_EN={reg:"Regular",ess:"Essential",fre:"Common",com:"Supplementary"};
const GRP={};for(const g in GR)GR[g].forEach(v=>{GRP[v]=g;});
const GK=Object.keys(GL);let kinds=["reg","ess"];
function paintK(){[...$("kinds").children].forEach((b,k)=>{const on=kinds.includes(GK[k]);b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));});}
GK.forEach(g=>{
  const b=en(el("button",null,GL[g]),GL_EN[g]);
  b.onclick=()=>{const on=kinds.includes(g);if(on&&kinds.length===1)return;kinds=on?kinds.filter(x=>x!==g):kinds.concat(g);paintK();};
  $("kinds").appendChild(b);
});
paintK();

seg("seg",v=>{n=+v;});

function start(){
  const vos=$("vos").checked,syn=$("syn").checked,pool=[];
  for(const v in D){
    if(!kinds.includes(GRP[v]))continue;
    D[v].forEach((s,t)=>{
      if(syn&&(t===4||t===5))return;
      s.split(" ").forEach((f,p)=>{
        if(p===4&&!vos)return;
        pool.push({v,t,p,a:f.split("/"),r:REG.includes(v)});
      });
    });
  }
  for(let k=pool.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[pool[k],pool[j]]=[pool[j],pool[k]];}
  q=pool.slice(0,n);i=0;score=0;miss=[];
  const ord=shuf(["ar","er","ir"]),bank={ar:shuf(REGV.ar),er:shuf(REGV.er),ir:shuf(REGV.ir)};
  const R=q.filter(x=>x.r),cl=shuf(R.map((_,k)=>ord[k%3]));
  R.forEach((x,k)=>{const w=bank[cl[k]].pop();x.v=w;x.a=conj(w)[x.t].split(" ")[x.p].split("/");});
  show("quiz");render();
}

const TK=["pres","past","past","plup","fut","cond","pres","past","fut"];
function render(){
  const c=q[i];phase="ask";
  en($("prog"),"Question "+(i+1)+" of "+q.length).textContent="Pergunta "+(i+1)+" de "+q.length;
  en($("score"),"Score "+score).textContent="Pontos "+score;
  $("fill").style.width=(i/q.length*100)+"%";
  en($("verb"),GLOSS[c.v]).textContent=c.v;
  en(mood($("tense"),T[c.t]),T_EN[c.t]);
  $("tense").className="tense"+(c.t>5?" sj":"");
  en($("who"),P_EN[c.p][0]+" ("+P_EN[c.p][1]+")").textContent=P[c.p][0]+" ("+P[c.p][1]+")";
  $("tline").innerHTML=tline(TK[c.t]);
  [...$("pgrid").children].forEach((d,k)=>d.classList.toggle("on",k===(c.p%3)*2+(c.p>=3?1:0)));
  const a=$("ans");a.value="";a.readOnly=false;a.className="";keysOn(true);
  $("fb").hidden=true;en($("go"),"Check").textContent="Verificar";
  a.focus();
}

function go(){
  if(phase==="ask"){
    const a=$("ans"),c=q[i],g=norm(a.value);
    if(!g)return;
    const ok=c.a.some(x=>norm(x)===g),inf=ok?"":info(g,c);
    if(ok)score++;else miss.push({c:c,g:a.value.trim(),inf:inf});
    a.readOnly=true;a.className=ok?"ok":"bad";keysOn(false);
    const fb=$("fb");fb.hidden=false;fb.className="fb "+(ok?"ok":"bad");
    const others=c.a.filter(x=>norm(x)!==g);
    fb.textContent="";
    if(ok){
      fb.append(en(el("span",null,"Correto"),"Correct"));
      if(others.length){const k=en(el("span","k","também "),"also accepted: "+others.join(", "));alts(k,others);fb.append(k);}
    }else{
      const b=el("span","fa");alts(b,c.a);fb.append(en(el("span",null,"Resposta"),"Answer")," ",b);
      if(inf)fb.append(en(mood(el("span","k"),"«"+a.value.trim()+"» é "+infoPt(inf)),"«"+a.value.trim()+"» is "+infoEn(inf)));
    }
    en($("score"),"Score "+score).textContent="Pontos "+score;
    $("fill").style.width=((i+1)/q.length*100)+"%";
    const last=i===q.length-1;en($("go"),last?"See results":"Next").textContent=last?"Ver resultados":"Seguinte";
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
  en($("pct"),pc+"% correct"+(miss.length?"":", no mistakes")).textContent=pc+"% corretas"+(miss.length?"":", sem erros");
  $("misshead").hidden=$("miss").hidden=!miss.length;
  const L=$("miss");[...L.tBodies].forEach(b=>b.remove());
  miss.forEach(m=>{
    const c=m.c,b=L.createTBody(),h=el("th");
    h.colSpan=2;h.scope="rowgroup";b.insertRow().append(h);
    h.append(en(el("span","v",c.v),GLOSS[c.v]),en(mood(el("span","k"),TS[c.t]+" · "+PS[c.p]),TS_EN[c.t]+" · "+PS_EN[c.p]));
    const r=b.insertRow(),w=r.insertCell();w.append(el("span","no",m.g));
    if(m.inf){w.className="real";w.append(en(mood(el("span","k"),"é "+infoPt(m.inf)),"is "+infoEn(m.inf)));}
    const a=r.insertCell();a.className="yes";alts(a,c.a);
  });
}

$("start").onclick=start;
$("go").onclick=go;
$("again").onclick=start;
$("change").onclick=()=>show("setup");
$("ans").addEventListener("keydown",e=>{
  if(e.key==="Enter"&&!e.isComposing){e.preventDefault();if(!e.repeat)go();}
});

const AUX="había habías había habíamos habíais habían".split(" ");
const FU="é ás á emos éis án".split(" "),CO="ía ías ía íamos íais ían".split(" ");
const seRa=w=>w.replace(/ramos$/,"semos").replace(/rais$/,"seis").replace(/ras$/,"ses").replace(/ran$/,"sen").replace(/ra$/,"se");
const reRa=w=>w.replace(/ramos$/,"remos").replace(/rais$/,"reis").replace(/ras$/,"res").replace(/ran$/,"ren").replace(/ra$/,"re");
const es=(v,t)=>{
  const e=E[v];
  if(t===8)return e[4].split(" ").map(reRa);
  if(t===3)return AUX.map(a=>a+" "+e[6]);
  if(t===4)return FU.map(x=>e[5]+x);
  if(t===5)return CO.map(x=>e[5]+x);
  const s=e[{0:0,1:1,2:2,6:3,7:4}[t]].split(" ");
  return t===7?s.map(w=>w+" / "+seRa(w)):s;
};
let sel=["cantar"];
function buildTable(){
  const keys=Object.keys(D),c=$("vchips");
  if(!c.children.length)keys.forEach((v,k)=>{
    if(k===0||GRP[v]!==GRP[keys[k-1]]){c.appendChild(en(el("span","gl",GL[GRP[v]]),GL_EN[GRP[v]]));}
    const b=document.createElement("button");
    b.textContent=v+(XI[v]?" / "+XI[v]:"");
    b.onclick=()=>{
      if(sel.includes(v)){if(sel.length>1)sel=sel.filter(x=>x!==v);}else sel.push(v);
      buildTable();
    };
    c.appendChild(b);
  });
  const bs=c.querySelectorAll("button");
  keys.forEach((v,k)=>{
    const on=sel.includes(v);
    bs[k].classList.toggle("on",on);
    bs[k].setAttribute("aria-pressed",String(on));
  });
  const vs=keys.filter(v=>sel.includes(v)),tab=$("tbl");
  tab.textContent="";tab.style.minWidth=(70+vs.length*280)+"px";
  const th=(r,txt,cls,span)=>{
    const x=document.createElement("th");x.textContent=txt;
    if(cls)x.className=cls;if(span)x.colSpan=span;r.appendChild(x);
  };
  const h=tab.createTHead(),r1=h.insertRow(),r2=h.insertRow();
  th(r1,"");th(r2,"");
  vs.forEach(v=>{
    th(r1,v+(XI[v]?" / "+XI[v]:""),"vh",2);
    th(r2,"PE","pt");th(r2,"ES","es");
    en(r2.cells[r2.cells.length-2],"European Portuguese");en(r2.cells[r2.cells.length-1],"Spanish");
  });
  const tb=tab.createTBody();
  T.forEach((name,ti)=>{
    const g=tb.insertRow();g.className="tg"+(ti>5?" sj":"");
    const gc=g.insertCell();gc.colSpan=1+vs.length*2;
    gc.appendChild(en(mood(el("span","tl"),name),T_EN[ti]));
    const cols=vs.map(v=>[D[v][ti].split(" "),es(v,ti)]);
    for(let p=0;p<6;p++){
      const r=tb.insertRow();
      en(r.insertCell(),P_EN[p][1]).textContent=P[p][1];
      cols.forEach(cc=>{
        const a=r.insertCell();a.className="pt";a.textContent=cc[0][p].replace("/"," / ");
        const b=r.insertCell();b.className="es";b.textContent=cc[1][p];
      });
    }
  });
}
window.addEventListener("hashchange",view);
view();
