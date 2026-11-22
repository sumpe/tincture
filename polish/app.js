// Polyverb, Polish: the game and the tables. Shared helpers are in ../trainer.js.

const T=["Czas teraźniejszy","Czas przeszły","Czas przyszły","Tryb przypuszczający"];
const TS=["Teraźniejszy","Przeszły","Przyszły","Przypuszczający"];
const PR=["ja","ty","on / ona / ono","my","wy","oni / one"];
const GR="grupa z mężczyznami / same kobiety".split(" / ");
const AUX=["będę","będziesz","będzie","będziemy","będziecie","będą"];
const PAST=[[0,0,"łem","łbym"],[0,1,"łam","łabym"],[1,0,"łeś","łbyś"],[1,1,"łaś","łabyś"],[2,0,"ł","łby"],[2,1,"ła","łaby"],[2,2,"ło","łoby"],[3,0,"liśmy","libyśmy"],[3,1,"łyśmy","łybyśmy"],[4,0,"liście","libyście"],[4,1,"łyście","łybyście"],[5,0,"li","liby"],[5,1,"ły","łyby"]];
const lab=(p,g)=>p===2?["on","ona","ono"][g]:PR[p]+" ("+(p<2?["mężczyzna","kobieta"][g]:GR[g])+")";
// English for the hover slips (gloss.js)
const T_EN=["Present tense","Past tense","Future tense","Conditional mood"];
const TS_EN=["Present","Past","Future","Conditional"];
const PR_EN=["I","you","he / she / it","we","you all","they"];
// Grammatical gender: masculine / feminine in the singular; in the plural, masculine personal
// (any group that includes a man) against non-masculine personal (everything else).
const labEn=(p,g)=>p===2?["he","she","it"][g]:PR_EN[p]+" ("+(p<2?["masculine","feminine"][g]:["masculine personal","non-masculine personal"][g])+")";
function conj(v){
  const s=v.slice(0,-1);let pr;
  if(v.endsWith("ować")){const b=v.slice(0,-4);pr=["uję","ujesz","uje","ujemy","ujecie","ują"].map(e=>b+e);}
  else if(v.endsWith("ać"))pr=["m","sz","","my","cie","ją"].map(e=>s+e);
  else{
    const b=v.slice(0,-2),E=v.endsWith("yć")?["ę","ysz","y","ymy","ycie","ą"]:b.endsWith("l")?["ę","isz","i","imy","icie","ą"]:["ię","isz","i","imy","icie","ią"];
    pr=E.map(e=>b+e);
  }
  const fu=AUX.map((x,p)=>{
    const l=p<3?[s+"ł",s+"ła"]:[s+"li",s+"ły"];
    if(p===2)l.push(s+"ło");
    return{p,w:PR[p],e:PR_EN[p],a:[x+" "+v].concat(l.map(y=>x+" "+y))};
  });
  const past=k=>PAST.map(r=>({p:r[0],w:lab(r[0],r[1]),e:labEn(r[0],r[1]),a:[s+r[k]]}));
  return[pr.map((f,p)=>({p,w:PR[p],e:PR_EN[p],a:[f]})),past(2),fu,past(3)];
}

const IDX=Object.create(null);
for(const c in V)V[c].forEach(v=>conj(v).forEach((rows,t)=>rows.forEach(r=>r.a.forEach(f=>{
  const k=norm(f);(IDX[k]=IDX[k]||[]).push({v:v,t:t,w:r.w,e:r.e});
}))));
// Where a wrong answer really belongs: up to two {verb, tense, persons}, or none.
// Forms of the verb that was asked win over look-alikes from other verbs.
function info(g,c){
  const m=IDX[g];if(!m)return null;
  const k={};
  m.forEach(x=>{const key=x.v+"|"+x.t;(k[key]=k[key]||{v:x.v,t:x.t,w:[],e:[]});k[key].w.push(x.w);k[key].e.push(x.e);});
  let l=Object.values(k);const own=l.filter(x=>x.v===c.v);if(own.length)l=own;
  return l.slice(0,2).map(x=>({same:x.v===c.v,v:x.v,t:x.t,w:x.w,e:x.e}));
}
// ...said in Polish, e.g. "czas przeszły · ja (kobieta)", and in English
const infoPl=l=>l.map(x=>(x.same?"":x.v+", ")+T[x.t].toLowerCase()+" · "+x.w.join(", ")).join("; ");
const infoEn=l=>l.map(x=>(x.same?"the ":"a form of "+x.v+" ("+GLOSS[x.v]+"), the ")+T_EN[x.t].toLowerCase()+" · "+x.e.join(", ")).join("; ");
const alts=(node,a)=>a.forEach((x,k)=>{if(k)node.append(" ",en(el("span","or","lub"),"or")," ");node.append(x);});
const KEYS="ą ć ę ł ń ó ś ź ż".split(" ");
letterKeys(KEYS,()=>$("ans"));

let n=20,cls="all",selT=[0,1,2,3],q=[],i=0,score=0,miss=[],phase="",sel=["czytać"];
const REP=["czytać","kupować","robić","uczyć"];

seg("seg",v=>{n=+v;});
seg("cls",v=>{cls=v;});

function toggles(box,labels,get,set,english){
  const c=$(box);
  labels.forEach((l,k)=>{
    const b=document.createElement("button");b.textContent=l;if(english)b.dataset.en=english[k];
    b.onclick=()=>{
      const a=get(),on=a.includes(k);
      if(on&&a.length===1)return;
      set(on?a.filter(x=>x!==k):a.concat(k));
      paint();
    };
    c.appendChild(b);
  });
  function paint(){[...c.children].forEach((b,k)=>{const on=get().includes(k);b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));});}
  paint();
  return paint;
}
toggles("tns",TS,()=>selT,a=>{selT=a;},TS_EN);
const paintRep=toggles("vchips",REP,()=>sel.map(v=>REP.indexOf(v)),a=>{sel=a.sort((x,y)=>x-y).map(k=>REP[k]);buildTable();});

function start(){
  const ts=shuf(selT),cs=cls==="all"?["ac","ow","ic"]:[cls],bank={};
  const tl=shuf(Array.from({length:n},(_,k)=>ts[k%ts.length])),cl=shuf(Array.from({length:n},(_,k)=>cs[k%cs.length]));
  q=tl.map((t,k)=>{
    const c=cl[k];if(!bank[c]||!bank[c].length)bank[c]=shuf(V[c]);
    const v=bank[c].pop(),rows=conj(v)[t],r=rows[Math.floor(Math.random()*rows.length)];
    return{v:v,t:t,p:r.p,w:r.w,e:r.e,a:r.a};
  });
  i=0;score=0;miss=[];
  show("quiz");render();
}

const TK=["pres","past","fut","cond"];
function render(){
  const c=q[i];phase="ask";
  en($("prog"),"Question "+(i+1)+" of "+q.length).textContent="Pytanie "+(i+1)+" z "+q.length;
  en($("score"),"Score "+score).textContent="Punkty "+score;
  $("fill").style.width=(i/q.length*100)+"%";
  en($("verb"),GLOSS[c.v]).textContent=c.v;
  en($("tense"),T_EN[c.t]).textContent=T[c.t];
  en($("who"),c.e).textContent=c.w;
  $("tline").innerHTML=tline(TK[c.t]);
  [...$("pgrid").children].forEach((d,k)=>d.classList.toggle("on",k===(c.p%3)*2+(c.p>=3?1:0)));
  const a=$("ans");a.value="";a.readOnly=false;a.className="";keysOn(true);
  $("fb").hidden=true;en($("go"),"Check").textContent="Sprawdź";
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
      fb.append(en(el("span",null,"Dobrze"),"Correct"));
      if(others.length){const k=en(el("span","k","także "),"also accepted: "+others.join(", "));alts(k,others);fb.append(k);}
    }else{
      const b=el("span","fa");alts(b,c.a);fb.append(en(el("span",null,"Odpowiedź"),"Answer")," ",b);
      if(inf)fb.append(en(el("span","k","„"+a.value.trim()+"” to "+infoPl(inf)),"“"+a.value.trim()+"” is "+infoEn(inf)));
    }
    en($("score"),"Score "+score).textContent="Punkty "+score;
    $("fill").style.width=((i+1)/q.length*100)+"%";
    const last=i===q.length-1;en($("go"),last?"See your score":"Next").textContent=last?"Zobacz wynik":"Dalej";
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
  en($("pct"),pc+"% correct"+(miss.length?"":", no mistakes")).textContent=pc+"% poprawnych"+(miss.length?"":", bez błędów");
  $("misshead").hidden=$("miss").hidden=!miss.length;
  const L=$("miss");[...L.tBodies].forEach(b=>b.remove());
  miss.forEach(m=>{
    const c=m.c,b=L.createTBody(),h=el("th");
    h.colSpan=2;h.scope="rowgroup";b.insertRow().append(h);
    h.append(en(el("span","v",c.v),GLOSS[c.v]),en(el("span","k",TS[c.t].toLowerCase()+" · "+c.w),TS_EN[c.t].toLowerCase()+" · "+c.e));
    const r=b.insertRow(),w=r.insertCell();w.append(el("span","no",m.g));
    if(m.inf){w.className="real";w.append(en(el("span","k","to "+infoPl(m.inf)),"is "+infoEn(m.inf)));}
    const a=r.insertCell();a.className="yes";a.textContent=c.a[0];
  });
}

function buildTable(){
  paintRep();
  const vs=sel,tab=$("tbl"),cj=vs.map(conj);
  tab.textContent="";tab.style.minWidth=(170+vs.length*150)+"px";
  const h=tab.createTHead().insertRow();
  [""].concat(vs).forEach((x,k)=>{
    const th=document.createElement("th");th.textContent=x;if(k)th.className="vh";h.appendChild(th);
  });
  const tb=tab.createTBody();
  T.forEach((name,t)=>{
    const g=tb.insertRow();g.className="tg";
    const gc=g.insertCell();gc.colSpan=1+vs.length;
    gc.appendChild(en(el("span","tl",name),T_EN[t]));
    cj[0][t].forEach((row,k)=>{
      const r=tb.insertRow();en(r.insertCell(),row.e).textContent=row.w;
      cj.forEach(x=>{r.insertCell().textContent=x[t][k].a[0];});
    });
  });
}

$("start").onclick=start;
$("go").onclick=go;
$("again").onclick=start;
$("change").onclick=()=>show("setup");
$("ans").addEventListener("keydown",e=>{
  if(e.key==="Enter"&&!e.isComposing){e.preventDefault();if(!e.repeat)go();}
});
window.addEventListener("hashchange",view);
view();
