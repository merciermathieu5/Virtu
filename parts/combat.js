/* ====== Affrontements sans violence : rondes de dés opposées ====== */
function combatDegats(p,a){
  let dj=0,da=0;const notes=[];
  const pd=(p.d1===p.d2)?p.d1:0, ad=(a.d1===a.d2)?a.d1:0;
  let decisif=false;
  if(pd===6){da+=4;decisif=true;notes.push("doublé fatal : ton double-six compte double");}
  if(pd===1){dj+=2;decisif=true;notes.push("doublé fatal : ton double-un te coûte la ronde");}
  if(ad===6){dj+=4;decisif=true;notes.push("doublé fatal : son double-six compte double");}
  if(ad===1){da+=2;decisif=true;notes.push("doublé fatal : son double-un le trahit");}
  if(!decisif){
    if(p.tot>a.tot)da+=2;
    else if(a.tot>p.tot)dj+=2;
    else notes.push("égalité : les forces s'équilibrent");
  }
  return {dj,da,notes};
}
function combatMods(c){
  const aides=(c.aides||[]).filter(x=>F&&F.sceaux.has(x.sceau));
  const entraves=(c.entraves||[]).filter(x=>F&&F.sceaux.has(x.sceau));
  return {aides,entraves,bd:aides.reduce((s,x)=>s+x.d,0),ad:entraves.reduce((s,x)=>s+x.d,0)};
}
function simulerCombat(id,profil){
  const c=STORY[id].combat;let j=c.jPts,a=c.advPts,r=0;
  const pmod=((profil&&profil[c.stat])||8)+((profil&&profil._bd)||0),amod=c.advApt+((profil&&profil._ad)||0);
  while(j>0&&a>0&&r<80){r++;
    const p={d1:d6(),d2:d6()},q={d1:d6(),d2:d6()};
    p.tot=p.d1+p.d2+pmod;q.tot=q.d1+q.d2+amod;
    const g=combatDegats(p,q);j-=g.dj;a-=g.da;}
  return {win:a<=0&&j>0,rondes:r};
}
let CB=null;
function czPts(cur,max,me){
  let s="";for(let i=0;i<max;i++)s+=`<i class="${i<cur?'on':''}"></i>`;
  return s;
}
function czMaj(){
  const j=$("#czj"),a=$("#cza");
  if(j)j.innerHTML=czPts(Math.max(0,CB.j),CB.c.jPts,true);
  if(a)a.innerHTML=czPts(Math.max(0,CB.a),CB.c.advPts,false);
}
function czLog(html,cls){
  const l=$("#czlog");if(!l)return;
  const d=document.createElement("div");d.className="lg"+(cls?" "+cls:"");d.innerHTML=html;
  l.prepend(d);
}
function tenterCombat(r,btn){
  const n=STORY[F.noeud],c=n.combat;if(!c)return;
  const m=combatMods(c);
  CB={n,c,r,btn,m,j:c.jPts,a:c.advPts,rd:0,relance:false,fini:false};
  document.querySelectorAll("#renvois .renvoi").forEach(x=>x.disabled=true);
  const cell=$("#qual-"+c.stat);if(cell)cell.classList.add("flash");
  const aidesHtml=(m.aides.length||m.entraves.length)?`<div class="cz-aides">${m.aides.map(x=>`<b>${x.sceau}</b> te donne +${x.d}`).join(" · ")}${m.aides.length&&m.entraves.length?" · ":""}${m.entraves.map(x=>`<b>${x.sceau}</b> arme l'adversaire de +${x.d}`).join(" · ")}</div>`:"";
  const dz=$("#dicezone");dz.classList.add("show");
  dz.innerHTML=`<div class="cz">
    <div class="dz-explain"><div class="dz-rule">À chaque ronde, chacun lance 2 dés et y ajoute son aptitude : le plus haut total fait perdre <b>2 points</b> à l'autre. <b>Doublé fatal</b> : un double-six inflige 4 points quel que soit le total, un double-un fait perdre la ronde à celui qui l'obtient. La première jauge à zéro perd l'affrontement.</div></div>
    <div class="cz-duel">
      <div class="cz-side me"><span class="cz-n">${esc(F.nom)}</span><span class="cz-apt">${LAB[c.stat]} ${F[c.stat]}${m.bd?` + ${m.bd}`:""}</span><div class="cz-lbl">${c.jLbl}</div><div class="cz-pts" id="czj"></div></div>
      <div class="cz-vs">contre</div>
      <div class="cz-side adv"><span class="cz-n">${c.advNom}</span><span class="cz-apt">Aptitude ${c.advApt}${m.ad?` + ${m.ad}`:""}</span><div class="cz-lbl">${c.advLbl}</div><div class="cz-pts" id="cza"></div></div>
    </div>
    ${aidesHtml}
    <div class="cz-dice">
      <div class="cz-dr">toi <span class="die" id="cd1">${dieFace()}</span><span class="die" id="cd2">${dieFace()}</span><b id="czpt"></b></div>
      <div class="cz-dr">lui <span class="die" id="ce1">${dieFace()}</span><span class="die" id="ce2">${dieFace()}</span><b id="czat"></b></div>
    </div>
    <div class="cz-log" id="czlog"></div>
    <button class="btn-ink cz-roll" id="czroll">Lancer les dés · ronde 1</button>
  </div>`;
  czMaj();
  $("#czroll").onclick=()=>{audioInit();audioResume();czTour();};
}
function czMontrerDes(p,q,cb){
  const ids=[["cd1",p.d1],["cd2",p.d2],["ce1",q.d1],["ce2",q.d2]];
  ids.forEach(([id])=>{const el=$("#"+id);if(el){el.classList.remove("settle");el.classList.add("tumbling");}});
  let ticks=0;const iv=setInterval(()=>{
    ids.forEach(([id])=>{const el=$("#"+id);if(el)el.innerHTML=dieFace(d6());});
    sfxClack();
    if(++ticks<7)return;
    clearInterval(iv);
    ids.forEach(([id,v])=>{const el=$("#"+id);if(el){el.classList.remove("tumbling");el.innerHTML=dieFace(v);el.classList.add("settle");}});
    const pt=$("#czpt"),at=$("#czat");
    if(pt)pt.textContent="= "+p.tot;
    if(at)at.textContent="= "+q.tot;
    setTimeout(cb,340);
  },78);
}
function czTour(){
  if(!CB||CB.fini)return;
  const c=CB.c,m=CB.m,rb=$("#czroll");
  if(rb){rb.disabled=true;rb.textContent="Les dés roulent…";}
  const old=$("#czfavor");if(old)old.remove();
  CB.rd++;
  const p={d1:d6(),d2:d6()},q={d1:d6(),d2:d6()};
  p.tot=p.d1+p.d2+F[c.stat]+m.bd;q.tot=q.d1+q.d2+c.advApt+m.ad;
  CB.p=p;CB.q=q;
  czMontrerDes(p,q,()=>{
    const g=combatDegats(p,q);
    if(g.dj>0&&!CB.relance&&F.faveurs>0&&CB.j-g.dj>0){czOffrirRelance(g);return;}
    czAppliquer(g,false);
  });
}
function czOffrirRelance(g){
  const dz=$("#dicezone");if(!dz)return;
  const div=document.createElement("div");div.id="czfavor";div.className="cz-favor";
  div.innerHTML=`<p>La ronde tourne contre toi : tu perds <b>${g.dj}</b> point${g.dj>1?"s":""}. Tu peux <b>invoquer les Muses</b> et relancer tes dés, une seule fois par affrontement.</p><div class="dz-favor-b"><button type="button" class="btn-ink" id="czfy">Invoquer les Muses · Inspiration −1</button><button type="button" class="btn-ink" id="czfn">Laisser les dés parler</button></div>`;
  dz.querySelector(".cz").appendChild(div);
  $("#czfy").onclick=()=>{
    CB.relance=true;F.faveurs=Math.max(0,F.faveurs-1);rendreTablette();sfxUnlock();div.remove();
    const c=CB.c,m=CB.m;
    const p={d1:d6(),d2:d6()};p.tot=p.d1+p.d2+F[c.stat]+m.bd;CB.p=p;
    czLog("Les Muses soufflent : tu relances tes dés.","");
    czMontrerDes(p,CB.q,()=>czAppliquer(combatDegats(p,CB.q),true));
  };
  $("#czfn").onclick=()=>{div.remove();czAppliquer(g,false);};
}
function czAppliquer(g,relance){
  CB.j-=g.dj;CB.a-=g.da;czMaj();
  const bits=[];
  if(g.da>0)bits.push(`l'adversaire perd <b>${g.da}</b>`);
  if(g.dj>0)bits.push(`tu perds <b>${g.dj}</b>`);
  if(!g.da&&!g.dj)bits.push("personne ne cède");
  const note=g.notes.length?` · ${g.notes.join(" · ")}`:"";
  czLog(`Ronde ${CB.rd} : ${CB.p.tot} contre ${CB.q.tot}, ${bits.join(", ")}${note}`,g.da>g.dj?"win":(g.dj>g.da?"lose":""));
  if(g.da>g.dj)sfxSuccess();else if(g.dj>g.da)sfxFail();else sfxClack();
  if(CB.a<=0&&CB.j>0){czFinir(true);return;}
  if(CB.j<=0){czFinir(false);return;}
  const rb=$("#czroll");if(rb){rb.disabled=false;rb.textContent=`Lancer les dés · ronde ${CB.rd+1}`;}
}
function czFinir(win){
  CB.fini=true;
  F._combats=(F._combats||0)+1;
  if(win)F._combatsWin=(F._combatsWin||0)+1;else F._echecs=(F._echecs||0)+1;
  const out=win?CB.c.win:CB.c.lose,b=snap();
  gagneSceau(out.sceau);appliquer(out.eff);
  if(out.reg)F.registre.push(out.reg);
  F.journal.push({t:CB.r?CB.r.t:"Affrontement",juge:win?(CB.r&&CB.r.juge||"bon"):"risque"});
  const diff=diffFrom(b);rendreTablette(diff.changed,diff.deltas);
  const cell=$("#qual-"+CB.c.stat);if(cell)cell.classList.remove("flash");
  sfxFin(win);
  const btn=CB.btn,cible=out.cible,suite=out.suite;
  impactModal({kicker:win?"L'affrontement tourne en ta faveur":"L'affrontement t'échappe",
    title:CB.c.advNom,body:out.impact,deltas:diff.deltas,
    onContinue:()=>{const dz=$("#dicezone");if(dz){dz.classList.remove("show");dz.innerHTML="";}CB=null;finaliser(btn,cible,suite);}});
}
