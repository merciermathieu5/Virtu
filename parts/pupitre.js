
/* ====================================================================
   LE PUPITRE · une chose à la fois (ajouts sans toucher à la mécanique)
   ==================================================================== */
function uxStepsHtml(){return '<div class="uxsteps" id="uxsteps">'
 +'<span class="uxstep" data-s="1"><b>1</b> Lis l\'histoire</span>'
 +'<span class="uxstep" data-s="2"><b>2</b> Étudie la source</span>'
 +'<span class="uxstep" data-s="3"><b>3</b> Décide</span></div>';}
function uxMajSteps(){
  const el=document.getElementById('uxsteps');if(!el||!F)return;
  const n=STORY[F.noeud];if(!n||n.fin){el.style.display='none';return;}
  const hasSrc=!!n.src,locked=!!document.getElementById('locknote');
  const p=document.getElementById('poursuite'),choisi=p&&p.classList.contains('show');
  el.querySelectorAll('.uxstep').forEach(s=>{
    const k=+s.dataset.s;s.classList.remove('fait','cur','sans');
    if(k===1)s.classList.add('fait');
    if(k===2){if(!hasSrc)s.classList.add('sans');else s.classList.add(locked?'cur':'fait');}
    if(k===3){if(choisi)s.classList.add('fait');else if(!hasSrc||!locked)s.classList.add('cur');}
  });
}
/* ---- le tableau de bord du bas : qualités, jauges, Muses, Fortune ---- */
function uxMajHud(deltas){
  const h=document.getElementById('uxhud');if(!h)return;
  if(!F){h.innerHTML='';return;}
  const d0=k=>(deltas||[]).find(d=>d.k===k);
  const chip=k=>{const d=d0(k);return '<span class="uxchip'+(d?(d.d>0?' up':' down'):'')+'"><i>'+LAB[k]+'</i><b>'+F[k]+'</b></span>';};
  const mets=[...METRES,...METRES_X.filter(k=>F[k]>0)];
  h.innerHTML='<span class="uxnom">'+esc(F.nom)+'</span>'
   +'<span class="uxgrp">'+QUALITES.map(chip).join('')+'</span>'
   +'<span class="uxgrp jauges">'+mets.map(chip).join('')+'</span>'
   +(F.faveursMax?'<span class="uxpet muses" title="Invoquer les Muses permet de relancer les dés, une seule fois par épreuve ou par affrontement">Inspiration '+F.faveurs+'/'+F.faveursMax+'</span>':'')
   +'<span class="uxpet rev" title="Au troisième revers aux dés, la Fortune t\'abandonne">Revers '+(F._echecs||0)+'/'+MALCHANCE+'</span>';
  uxFiche();
}
function uxFiche(){
  const h=document.getElementById('uxhud');if(!h||!F)return;
  h.insertAdjacentHTML('beforeend','<button type="button" class="uxbtn" id="uxfiche"></button>');
  const fb=document.getElementById('uxfiche'),n=F.sceaux.size;
  fb.textContent='Ta feuille · sacoche : '+n;
  fb.title='Ta feuille de personnage et ce que contient ta sacoche';
  const st=document.getElementById('sheettab');
  if(st&&st.classList.contains('lit'))fb.classList.add('lit');
  fb.onclick=()=>{if(st)st.click();fb.classList.remove('lit');};
}
const _uxTab=rendreTablette;rendreTablette=function(ch,de){_uxTab(ch,de);uxMajHud(de);};
const _uxEnable=enableOpen;enableOpen=function(){_uxEnable();uxMajSteps();};
const _uxFin=finaliser;finaliser=function(b,c,s){_uxFin(b,c,s);uxMajSteps();};

/* ---- deux onglets : l'histoire, puis la décision ---- */
document.querySelector('.topbar').insertAdjacentHTML('afterend',
 '<div class="cnav" id="cnav"><button type="button" id="ctab1" class="on"><b>1</b> L\'histoire</button><button type="button" id="ctab2"><b>2</b> Ta décision</button></div>');
document.body.insertAdjacentHTML('beforeend','<div id="uxhud"></div>');
function cVoir(v){
  document.body.classList.toggle('cvue-dec',v==='dec');
  const t1=document.getElementById('ctab1'),t2=document.getElementById('ctab2');
  if(t1){t1.classList.toggle('on',v!=='dec');t2.classList.toggle('on',v==='dec');}
  const st=document.querySelector('.stage');if(st)st.scrollTop=0;
}
document.getElementById('ctab1').onclick=()=>cVoir('recit');
document.getElementById('ctab2').onclick=()=>cVoir('dec');
function uxObsDes(){
  const dz=document.getElementById('dicezone');if(!dz)return;
  const maj=()=>document.body.classList.toggle('des-ouverts',dz.classList.contains('show'));
  new MutationObserver(maj).observe(dz,{attributes:true,attributeFilter:['class']});maj();
}
function UX_APRES(){
  if(!F)return;const n=STORY[F.noeud];
  if(n&&!n.fin){
    cVoir('recit');
    const ll=document.getElementById('leftleaf');
    if(ll&&!document.getElementById('cgo'))ll.insertAdjacentHTML('beforeend','<button type="button" class="cgo" id="cgo">Passe à ta décision »</button>');
    const g=document.getElementById('cgo');if(g)g.onclick=()=>cVoir('dec');
    const dec=document.querySelector('.dec');
    if(dec&&!document.getElementById('cback'))dec.insertAdjacentHTML('afterbegin','<button type="button" class="cback" id="cback">‹ Relire l\'histoire</button>');
    const b=document.getElementById('cback');if(b)b.onclick=()=>cVoir('recit');
  }
  uxObsDes();
}
const _uxRendre=rendre;rendre=function(fl){_uxRendre(fl);
  const dec=document.querySelector('.dec');
  if(dec&&!document.getElementById('uxsteps'))dec.insertAdjacentHTML('afterbegin',uxStepsHtml());
  document.querySelectorAll('#renvois .renvoi.open .go').forEach(g=>{if(/^§/.test(g.textContent.trim()))g.classList.add('sec');});
  uxMajSteps();uxMajHud();UX_APRES();};

/* ---- la trace réelle : photos documentaires du dossier medias/ du dépôt ---- */
const UX_IMG_BASE="medias/";
const UX_IMAGES=/*__UX_IMAGES__*/{};
const _uxPlate=plate;plate=function(s){
  const k=Object.keys(UX_IMAGES).find(x=>SRC[x]===s);
  if(!k)return _uxPlate(s);
  const im=UX_IMAGES[k];
  /* une image d'époque remplace le schéma : la lecture décrit alors ce que montre la photo */
  let out=s.doc?_uxPlate(s):_uxPlate(Object.assign({},s,{svg:null,arts:im.a||s.arts,kind:im.k||"Photographie"}));
  if(s.doc&&im.k)out=out.replace(/<span class="plate-kind">[^<]*<\/span>/,'<span class="plate-kind">'+im.k+'</span>');
  const fs=Array.isArray(im.f)?im.f:[im.f];
  const imgs=fs.map(f=>'<img loading="lazy" src="'+UX_IMG_BASE+f+'" alt="'+im.l.replace(/"/g,'&quot;')+'">').join('');
  const fig='<figure class="uxphoto'+(fs.length>1?' duo':'')+'">'+(fs.length>1?'<div class="uxduo">'+imgs+'</div>':imgs)
    +'<figcaption><b>La trace réelle</b> · '+im.l+'<span class="uxprov">Image : '+im.c+'</span></figcaption></figure>';
  const i=out.lastIndexOf('</div>');
  return out.slice(0,i)+fig+out.slice(i);
};
document.addEventListener('error',e=>{const t=e.target;if(t&&t.tagName==='IMG'&&t.closest&&t.closest('.uxphoto'))t.closest('.uxphoto').style.display='none';},true);

/* ---- la molette défile partout, jamais coincée sur une zone fixe ---- */
document.addEventListener('wheel',e=>{
  for(let n=e.target;n&&n!==document.body;n=n.parentElement){
    const st=getComputedStyle(n);
    if(/(auto|scroll)/.test(st.overflowY)&&n.scrollHeight>n.clientHeight+1)return;
  }
  const intro=document.getElementById('intro'),frontis=document.getElementById('frontis');
  const cible=document.querySelector('.modal.show .modal-card')
    ||document.querySelector('.overlay.show .ov-card')
    ||(frontis&&frontis.style.display!=='none'?document.querySelector('.fcard'):null)
    ||(intro&&getComputedStyle(intro).display!=='none'?document.querySelector('.icard'):null)
    ||document.querySelector('.stage');
  if(cible)cible.scrollTop+=e.deltaY;
},{passive:true});

/* ---- une section par page : la plus récente s'ouvre d'office ---- */
computePages=function(){const t=(F&&F.histoire.length)||0;return t?Array.from({length:t},(_,i)=>[i]):[[]];};

/* ---- la règle des dés se replie sous « Comment se joue… ? » ---- */
(function(){const pg=document.getElementById('pages');if(!pg)return;
  new MutationObserver(()=>{pg.querySelectorAll('#dicezone .dz-rule').forEach(r=>{if(r.closest('details'))return;
    const d=document.createElement('details');d.className='dz-regle';
    d.innerHTML='<summary>'+(r.closest('.cz')?'Comment se joue cet affrontement ?':'Comment se joue ce lancer ?')+'</summary>';
    r.parentNode.insertBefore(d,r);d.appendChild(r);});}).observe(pg,{childList:true,subtree:true});})();
