/* ====== Les trois métiers : note et atouts de départ ====== */
const METIERS=[
 {id:"artiste",n:"Artiste d'atelier",note:"La bottega, les pigments et la perspective : ta main parlera pour toi.",k:"adresse",eff:{renommee:1},objet:"Carnet de croquis"},
 {id:"imprimeur",n:"Apprenti imprimeur",note:"Les caractères de plomb et les presses : le savoir voyagera par tes mains.",k:"virtu",eff:{florins:2},objet:"Casse de caractères"},
 {id:"erudit",n:"Jeune humaniste",note:"Le grec, le latin et les textes anciens : ta plume ouvrira bien des portes.",k:"erudition",eff:{},objet:"Grammaire grecque"}];
const MET_SUB={artiste:"de la bottega",imprimeur:"de l'officina",erudit:"du studiolo"};
let cityIdx=0;
function renderCites(){
  const cc=$("#citechips");if(!cc)return;
  cc.innerHTML=METIERS.map((c,i)=>`<button type="button" data-ci="${i}" class="${i===cityIdx?'on':''}">${c.n}</button>`).join("");
  const c=METIERS[cityIdx];
  const effTxt=Object.keys(c.eff||{}).map(k=>`+${c.eff[k]} ${LAB[k]}`).join(", ");
  $("#citenote").innerHTML=`<span class="cn-note">${c.note}</span> <span class="cn-atout">Atouts : +1 ${LAB[c.k]}${effTxt?", "+effTxt:""} · objet « ${c.objet} »</span>`;
}

let genre="apprenti",alloc={eloquence:0,adresse:0,erudition:0,virtu:0};
function pointsLeft(){return POOL-QUALITES.reduce((s,k)=>s+alloc[k],0);}
function renderAlloc(){
  const left=pointsLeft();
  $("#pool").innerHTML=`Points à placer : <b>${left}</b>`;
  $("#alloc").innerHTML=QUALITES.map(k=>{
    const v=BASE+alloc[k],moins=alloc[k]<=0,plus=alloc[k]>=MAXADD||left<=0;
    return `<div class="arow"><div class="ah"><span class="an">${LAB[k]}</span><div class="stepper"><button data-k="${k}" data-d="-1"${moins?" disabled":""}>−</button><span class="av">${v}</span><button data-k="${k}" data-d="1"${plus?" disabled":""}>+</button></div></div><div class="ad">${QDESC[k]}</div></div>`;
  }).join("");
  const b=$("#begin");b.disabled=left!==0;
  b.textContent=left!==0?`Place tous tes points (${left} restants)`:"Ouvre le livre · §1";
}
$("#alloc").addEventListener("click",e=>{
  const b=e.target.closest("button[data-k]");if(!b)return;
  const k=b.dataset.k,d=+b.dataset.d;
  if(d>0&&(pointsLeft()<=0||alloc[k]>=MAXADD))return;
  if(d<0&&alloc[k]<=0)return;
  alloc[k]+=d;renderAlloc();
});
$("#seg").addEventListener("click",e=>{const b=e.target.closest("button[data-g]");if(!b)return;genre=b.dataset.g;document.querySelectorAll("#seg button").forEach(x=>x.classList.toggle("on",x===b));});
document.querySelectorAll("[data-fact]").forEach(el=>{const f=el.dataset.fact;el.textContent=f==="sections"?Object.keys(SEC).length:f==="sources"?Object.keys(SRC).length:FINS_ORDRE.length;});
$("#introgo").addEventListener("click",()=>{$("#intro").style.display="none";$("#frontis").style.display="flex";});
function toggleSheet(){const d=$("#sheetdrawer");if(!d)return;const open=d.classList.toggle("open");d.setAttribute("aria-hidden",open?"false":"true");const t=$("#sheettab");if(open&&t){t.classList.remove("pulse");t.classList.remove("lit");}}
$("#sheettab").addEventListener("click",toggleSheet);
window.addEventListener("keydown",e=>{
  if(e.key!=="Escape")return;
  const m=$("#modal");
  if(m&&m.classList.contains("show")){
    const b=m.querySelector("#modalbtn")||m.querySelector("#srcclose");
    if(b&&!b.disabled)b.click();
    return;
  }
  const o=$("#overlay");
  if(o&&o.classList.contains("show")){closeOverlay();return;}
  const d=$("#sheetdrawer");
  if(d&&d.classList.contains("open")){d.classList.remove("open");d.setAttribute("aria-hidden","true");}
});
$("#citechips").addEventListener("click",e=>{const b=e.target.closest("button[data-ci]");if(!b)return;cityIdx=+b.dataset.ci;renderCites();});
$("#begin").addEventListener("click",()=>{
  if(pointsLeft()!==0)return;
  const met=METIERS[cityIdx];
  F=nouvelle();F.nom=$("#nom").value.trim()||"Andrea";F.metier=met.id;F.genre=genre;
  QUALITES.forEach(k=>F[k]=BASE+alloc[k]);
  F[met.k]+=1;
  if(met.eff)for(const k in met.eff)F[k]=(F[k]||0)+met.eff[k];
  if(met.objet)F.sceaux.add(met.objet);
  F.faveurs=F.faveursMax=(F.erudition>=10?3:2);
  F.registre.push("Arrivée à Florence, le coeur battant.");
  F.noeud="atelier";const n=STORY.atelier;F.histoire.push({num:1,sec:SEC.atelier,folio:n.folio,paras:n.texte});
  $("#frontis").style.display="none";document.body.classList.add("playing");const dr=$("#sheetdrawer");if(dr){dr.classList.remove("open");dr.setAttribute("aria-hidden","true");}rendre(false);
});
