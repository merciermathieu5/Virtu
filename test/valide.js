/* Harnais de validation Virtù — jsdom
   1) Intégrité des données (STORY, SRC, quiz, folios, fins, lexique)
   2) Affrontements : intégrité et équilibre Monte-Carlo
   3) Smoke test DOM : intro → allocation → début → source (chrono + quiz) → épreuve → choix → poursuite → affrontement
   Lancer : node test/valide.js                                                     */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error("ÉCHEC  " + msg); } };
const info = (msg) => console.log("       " + msg);

const vc = new (require("jsdom").VirtualConsole)();
vc.on("jsdomError", e => { /* CSS parse etc. : silencieux */ });

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  pretendToBeVisual: true,
  url: "https://localhost/",
  virtualConsole: vc
});
const { window } = dom;
const { document } = window;

window.HTMLMediaElement.prototype.play = function(){ return Promise.resolve(); };
window.HTMLMediaElement.prototype.pause = function(){};

function $(s){ return document.querySelector(s); }
function ev(expr){ return window.eval(expr); }

setTimeout(main, 150); // laisser le script inline s'exécuter

function main(){
  console.log("— Volet 1 · intégrité des données —");

  const STORY = ev("STORY"), SRC = ev("SRC"), FINS = ev("FINS_ORDRE"), GLOSS = ev("GLOSS");

  // 1. Toutes les cibles pointent vers des nœuds existants
  let cibles = 0;
  for (const k in STORY){
    const n = STORY[k];
    (n.renvois || []).forEach(r => {
      if (r.cible){ cibles++; ok(STORY[r.cible], `cible inconnue « ${r.cible} » depuis ${k}`); }
      if (r.epreuve){
        if (r.epreuve.ok && r.epreuve.ok.cible){ cibles++; ok(STORY[r.epreuve.ok.cible], `cible ok inconnue depuis ${k}`); }
        if (r.epreuve.penalite && r.epreuve.penalite.cible){ cibles++; ok(STORY[r.epreuve.penalite.cible], `cible penalite inconnue depuis ${k}`); }
      }
    });
    if (n.combat){
      cibles += 2;
      ok(STORY[n.combat.win.cible], `cible de victoire inconnue depuis ${k}`);
      ok(STORY[n.combat.lose.cible], `cible de défaite inconnue depuis ${k}`);
    }
  }
  info(`${cibles} cibles de renvois vérifiées`);

  // 2. Sources référencées existent
  let refs = 0;
  for (const k in STORY){
    if (STORY[k].src){ refs++; ok(SRC[STORY[k].src], `src inconnue « ${STORY[k].src} » au nœud ${k}`); }
  }
  info(`${refs} références de sources vérifiées`);

  // 3. Visuels : aucune photo externe ; chaque source non textuelle a son SVG
  let nSvg = 0;
  for (const k in SRC){
    const s = SRC[k];
    ok(!s.ph, `résidu de photo externe dans la source ${k}`);
    if (!s.doc){ nSvg++; ok(s.svg && s.svg.includes("<svg"), `SVG manquant pour la source ${k}`); }
  }
  ok(!fs.existsSync(path.join(ROOT, "assets")), "le dossier assets/ devrait avoir disparu");
  info(`${nSvg} illustrations SVG originales, aucune image externe`);

  // 4. Quiz : chaque source a une question à 3 choix, ok valide, choix distincts
  let nQ = 0;
  for (const k in SRC){
    const q = SRC[k].q;
    ok(q, `source ${k} sans question de vérification`);
    if (!q) continue;
    nQ++;
    ok(Array.isArray(q.ch) && q.ch.length === 3, `quiz ${k} : il faut 3 choix`);
    ok(Number.isInteger(q.ok) && q.ok >= 0 && q.ok < 3, `quiz ${k} : ok hors bornes`);
    ok(new Set(q.ch).size === 3, `quiz ${k} : choix en double`);
    ok(q.txt && q.txt.length > 8, `quiz ${k} : question vide`);
  }
  info(`${nQ}/${Object.keys(SRC).length} sources avec question de vérification`);

  // 5. Folios parsables → frise des quatre actes
  let nActes = 0;
  const seen = new Set();
  for (const k in STORY){
    const n = STORY[k];
    if (n.fin) continue;
    const m = /^Acte ([IVX]+)/.exec(n.folio || "");
    const epr = /^(Épreuve|Affrontement) · /.test(n.folio || "");
    ok(m || epr, `folio non parsable au nœud ${k} : « ${n.folio} »`);
    if (m){ seen.add(m[1]); nActes++; } else if (epr){ nActes++; }
  }
  ok(seen.size === 4, `attendu 4 actes distincts, trouvé ${seen.size} (${[...seen].join(",")})`);
  info(`${nActes} folios parsables couvrant les actes ${[...seen].join(", ")}`);

  // 6. Toutes les fins de la galerie existent et sont des fins
  FINS.forEach(f => { ok(STORY[f] && STORY[f].fin, `fin de galerie invalide : ${f}`); });
  info(`${FINS.length} fins de galerie vérifiées`);

  // 6bis. cibleFn dynamiques : sondées avec des profils contrastés
  const mkF = (v) => { const f = ev("nouvelle()"); ["eloquence","adresse","erudition","virtu"].forEach(k=>f[k]=v);
    f.renommee=v; f.florins=v; f.eglise=v; return f; };
  let nFn = 0;
  for (const k in STORY){
    (STORY[k].renvois || []).forEach((r, i) => {
      const fns = [];
      if (r.cibleFn) fns.push(r.cibleFn);
      if (r.epreuve && r.epreuve.ok && r.epreuve.ok.cibleFn) fns.push(r.epreuve.ok.cibleFn);
      if (r.epreuve && r.epreuve.penalite && r.epreuve.penalite.cibleFn) fns.push(r.epreuve.penalite.cibleFn);
      fns.forEach(fn => { nFn++;
        for (const v of [0, 6, 12, 16]){
          let out; try { out = fn(mkF(v)); } catch(e){ out = "(exception " + e.message + ")"; }
          ok(STORY[out], `cibleFn ${k}#${i} (profil ${v}) → cible invalide « ${out} »`);
        }
      });
    });
  }
  info(`${nFn} cibleFn sondées avec 4 profils chacune`);

  // 6ter. evaluerFin : sondée avec sceaux décisifs
  const finAvec = (sceaux, v) => { const f = mkF(v); sceaux.forEach(s=>f.sceaux.add(s)); return ev("evaluerFin")(f); };
  ok(finAvec(["Persistant"], 10) === "nF_bucher", "Persistant devrait mener au bûcher");
  ok(finAvec(["Abjuration"], 2) === "nF_prison", "Abjuration avec Église basse devrait mener aux geôles");
  ok(finAvec(["Abjuration"], 10) === "nF_abjure", "Abjuration devrait mener à la fin abjuration");
  ok(finAvec([], 0) === "nF_oubli", "Renommée nulle devrait mener à l'oubli");
  ok(finAvec(["Passage en France"], 10) === "nF_france", "Passage en France devrait mener à la cour de France");
  const toutes = new Set();
  for (const v of [0,3,6,9,12,16]) for (const s of [[],["Philologue"],["Lauréat du concours"],["Compagnon d'imprimerie"],["Serviteur de la Contre-Réforme"],["Passage en France"],["Abjuration"]])
    toutes.add(finAvec(s, v));
  info(`evaluerFin atteint ${toutes.size} fins distinctes sur l'échantillon sondé`);

  // 7. Lexique : clés définies, définitions non vides, concepts prescrits présents
  let nG = 0;
  for (const k in GLOSS){ nG++; ok(typeof GLOSS[k] === "string" && GLOSS[k].length > 20, `définition trop courte : ${k}`); }
  ["esprit critique","géocentrisme","héliocentrisme","humanisme","indulgence","philosophie","raison","Réforme"]
    .forEach(c => ok(GLOSS[c], `concept prescrit absent du lexique : ${c}`));
  info(`${nG} entrées de lexique, 8 concepts prescrits présents`);

  // 8. Rendu des sources : parchemin pour les textes (avec étiquette de
  //    reconstitution), SVG sans référence, aucune mention de crédits
  let nDoc = 0, nVis = 0, nStone = 0;
  for (const k in SRC){
    const out = ev(`plate(SRC[${JSON.stringify(k)}])`);
    ok(!/SOURCES\.md/.test(out), `mention « SOURCES.md » dans la source ${k}`);
    ok(!/crédits/.test(out), `mention « crédits » dans la source ${k}`);
    ok(!/<figure|<img/.test(out), `image externe rendue pour la source ${k}`);
    if (SRC[k].doc){
      nDoc++;
      ok(!/plate-read/.test(out), `bloc Lecture affiché pour la source textuelle ${k}`);
      ok(/class="clay/.test(out), `rendu parchemin absent pour ${k}`);
      ok(/class="cite">[^<]*(composé|reconstitution)/i.test(out), `étiquette de reconstitution absente pour ${k}`);
      if (SRC[k].mat === "stone"){ nStone++; ok(/clay stone/.test(out), `variante pierre absente pour ${k}`); }
    } else {
      ok(!/class="cite"/.test(out), `référence affichée sous l'illustration ${k}`);
      if ((SRC[k].arts || []).length){
        nVis++;
        ok(/plate-read/.test(out), `bloc « Ce que montre l'image » absent pour ${k}`);
      }
    }
  }
  ok(nStone === 1, `attendu 1 source gravée dans la pierre, trouvé ${nStone}`);
  ok(SRC.theses95.doc && !SRC.theses95.ph, "theses95 devrait être un document composé sans photo");
  info(`${nDoc} documents composés étiquetés, ${nVis} illustrations avec lecture, sans référence`);

  // 9. Numérotation des sections : bijection STORY ↔ SEC, §1 = le début
  const SEC = ev("SEC");
  const sk = Object.keys(SEC), tk = Object.keys(STORY);
  ok(sk.length === tk.length, `SEC (${sk.length}) et STORY (${tk.length}) désalignés`);
  tk.forEach(k => ok(Number.isInteger(SEC[k]), `nœud sans numéro de section : ${k}`));
  const vals = Object.values(SEC);
  ok(new Set(vals).size === vals.length, "numéros de section en double");
  ok(Math.min(...vals) === 1 && Math.max(...vals) === vals.length, "les numéros ne couvrent pas 1..N");
  ok(SEC.atelier === 1, "le livre devrait s'ouvrir au §1");
  info(`${vals.length} sections numérotées, §1 = atelier`);

  // 10. Les grands paris passent aux dés ; chaque nœud à épreuve garde une porte de sortie
  ["atelier","mecene","manuscrit"].forEach(k => ok(!!STORY[k].renvois[0].epreuve, `le premier choix de ${k} devrait être une épreuve`));
  let nEp = 0;
  Object.values(STORY).forEach(n => (n.renvois||[]).forEach(r => { if (r.epreuve) nEp++; }));
  Object.keys(STORY).forEach(k => {
    const n = STORY[k];
    if (n.fin || !(n.renvois||[]).some(r=>r.epreuve)) return;
    ok(n.renvois.length >= 2, `le nœud à épreuve ${k} n'offre aucune autre voie après un échec`);
  });
  info(`${nEp} épreuves de dés sur le graphe`);
  ok(STORY.nF_fortune && STORY.nF_fortune.fin, "la fin de la roue de la Fortune manque");

  console.log("\n— Volet 2 · affrontements sans violence —");
  combats();

  console.log("\n— Volet 3 · smoke test DOM —");
  smoke();
}

function combats(){
  const STORY = ev("STORY"), QUALITES = ev("QUALITES");
  const ids = Object.keys(STORY).filter(k => STORY[k].combat);
  ok(ids.length === 5, `attendu 5 affrontements, trouvé ${ids.length} (${ids.join(",")})`);
  ids.forEach(k => {
    const c = STORY[k].combat;
    ok(QUALITES.includes(c.stat), `affrontement ${k} : aptitude inconnue « ${c.stat} »`);
    ok(c.advApt >= 6 && c.advApt <= 12, `affrontement ${k} : aptitude adverse hors bornes`);
    ok(c.jPts > 0 && c.advPts > 0, `affrontement ${k} : points nuls`);
    ok(c.advNom && c.jLbl && c.advLbl, `affrontement ${k} : étiquettes manquantes`);
    ok(c.win && c.win.impact && c.win.suite && c.win.reg, `affrontement ${k} : victoire incomplète`);
    ok(c.lose && c.lose.impact && c.lose.suite && c.lose.reg, `affrontement ${k} : défaite incomplète`);
    ok((STORY[k].renvois||[]).some(r=>r.combat), `le nœud ${k} n'offre pas le renvoi d'affrontement`);
    const M = ev("MARQUES");
    (c.aides||[]).concat(c.entraves||[]).forEach(a => ok(M[a.sceau], `affrontement ${k} : sceau inconnu « ${a.sceau} »`));
  });

  // Le doublé fatal, cas par cas
  const deg = ev("combatDegats");
  let g = deg({d1:6,d2:6,tot:20},{d1:3,d2:4,tot:15}); ok(g.da===4&&g.dj===0, "double-six du joueur : 4 points à l'adversaire");
  g = deg({d1:1,d2:1,tot:14},{d1:2,d2:3,tot:12}); ok(g.dj===2&&g.da===0, "double-un du joueur : il perd la ronde malgré son total");
  g = deg({d1:2,d2:5,tot:15},{d1:6,d2:6,tot:20}); ok(g.dj===4, "double-six adverse : 4 points au joueur");
  g = deg({d1:2,d2:5,tot:9},{d1:1,d2:1,tot:10}); ok(g.da===2&&g.dj===0, "double-un adverse : il perd la ronde");
  g = deg({d1:6,d2:6,tot:20},{d1:1,d2:1,tot:10}); ok(g.da===6&&g.dj===0, "doubles croisés : les deux effets s'appliquent");
  g = deg({d1:2,d2:4,tot:14},{d1:3,d2:5,tot:14}); ok(g.da===0&&g.dj===0, "égalité : personne ne cède");
  g = deg({d1:2,d2:4,tot:15},{d1:3,d2:5,tot:14}); ok(g.da===2, "total supérieur : 2 points à l'adversaire");

  // Monte-Carlo : équilibre avec un profil investi (aptitude 10) et sensibilité au profil
  const N = 1600;
  ids.forEach(k => {
    const c = ev("STORY")[k].combat;
    const taux = (v) => { let w=0; for(let i=0;i<N;i++){ if (ev("simulerCombat")(k, {[c.stat]:v}).win) w++; } return w/N; };
    const t10 = taux(10), t7 = taux(7);
    ok(t10 >= 0.30 && t10 <= 0.92, `équilibre ${k} : taux de victoire ${Math.round(t10*100)} % hors de [30, 92] avec aptitude 10`);
    ok(t10 > t7, `équilibre ${k} : l'aptitude 10 (${Math.round(t10*100)} %) devrait battre l'aptitude 7 (${Math.round(t7*100)} %)`);
    info(`${k} : victoire ${Math.round(t10*100)} % (apt 10), ${Math.round(t7*100)} % (apt 7), contre aptitude ${c.advApt}`);
  });
}

function smoke(){
  // Intro → frontispice
  $("#introgo").click();
  ok($("#frontis").style.display === "flex", "le frontispice ne s'ouvre pas");

  // Allocation : 4 points sur chacune des 4 qualités (POOL=16)
  const QUALITES = ev("QUALITES");
  for (const k of QUALITES){
    for (let i = 0; i < 4; i++){
      const b = document.querySelector(`#alloc button[data-k="${k}"][data-d="1"]`);
      ok(b && !b.disabled, `stepper + indisponible pour ${k}`);
      b && b.click();
    }
  }
  // Personnalisation : prénom et genre choisis au frontispice
  $("#nom").value = "Bianca";
  const segF = document.querySelector('#seg button[data-g="apprentie"]');
  segF && segF.click();
  const begin = $("#begin");
  ok(!begin.disabled, "le bouton d'ouverture reste verrouillé après 16 points");
  begin.click();

  ok(ev("F.nom") === "Bianca", "le prénom personnalisé n'est pas retenu");
  ok(ev("F.genre") === "apprentie", "le genre choisi n'est pas retenu");

  ok(ev("F && F.histoire.length") === 1, "histoire.length ≠ 1 après l'ouverture");
  ok(document.body.classList.contains("playing"), "body.playing absent");
  ok(ev("F.metier") === "artiste", "le métier par défaut devrait être artiste");
  ok(ev('F.sceaux.has("Carnet de croquis")'), "l'objet de métier manque à la sacoche");

  // Frise rendue avec 4 encoches, acte I courant
  const notches = document.querySelectorAll("#progress .frise i");
  ok(notches.length === 4, `frise : attendu 4 encoches, trouvé ${notches.length}`);
  ok(notches[0] && notches[0].classList.contains("cur"), "frise : l'acte I n'est pas marqué courant");

  // Lexique : bouton topbar + termes soulignés dans la page
  ok($("#lexbtn"), "bouton Lexique absent du bandeau");
  const gl = document.querySelectorAll("#story .gl");
  ok(gl.length >= 1, "aucun terme de lexique détecté dans la page 1");
  if (gl.length){
    gl[0].click();
    ok($("#modal").classList.contains("show"), "le clic sur un terme n'ouvre pas la définition");
    const mb = $("#modalbtn") || $("#modal .modal-btn");
    mb && mb.click();
    ok(!$("#modal").classList.contains("show"), "la définition ne se referme pas");
  }

  // Renvois verrouillés tant que la source n'est pas étudiée
  const lockedBefore = [...document.querySelectorAll("#renvois .renvoi.open")].every(b => b.disabled);
  ok(lockedBefore, "les renvois devraient être verrouillés avant l'étude de la source");
  ok($("#locknote"), "la note de verrouillage est absente");

  // Consulter la source (nœud atelier → contrat, document avec quiz)
  $("#consultbtn").click();
  ok($("#modal").classList.contains("show"), "la fenêtre de source ne s'ouvre pas");
  ok($("#srcclose") && $("#srcclose").disabled, "le bouton de fermeture devrait être verrouillé avant la bonne réponse");
  ok(/Réponds d'abord à la question/.test($("#srcclose").textContent), "le bouton verrouillé devrait annoncer la question");
  ok($(".plate"), "pas de planche dans la fenêtre de source");
  ok($(".clay"), "le contrat devrait se présenter en feuille de papier enluminée");
  ok(/Bianca/.test($("#modal").textContent), "le contrat devrait porter le prénom personnalisé");
  ok(!/Andrea/.test($("#modal").textContent), "le prénom par défaut ne devrait plus apparaître dans le contrat");
  ok(/L'apprentie promet/.test($("#modal").textContent), "l'accord de genre du contrat ne suit pas le choix apprentie");
  ok(!/\{NOM\}|\{E\}/.test($("#modal").textContent), "des jetons de substitution restent visibles dans le document");
  ok($("#srcquizview"), "la vue de vérification est absente du DOM");
  ok($("#srcquizview").classList.contains("off"), "la question ne devrait pas s'afficher avant le clic");
  ok(!$("#srcview").classList.contains("off"), "la source devrait s'afficher en premier");
  ok(ev("READ_LOCK") === 0, "le chrono de consultation devrait avoir disparu (READ_LOCK = 0)");
  ok(ev("F._quizTotal") === 1, "F._quizTotal ≠ 1");
  const fwd = $("#sqfwd");
  ok(fwd && !fwd.classList.contains("off"), "« Répondre à la question » devrait être disponible d'emblée");
  ok(fwd.classList.contains("primo"), "« Répondre à la question » devrait être mis en évidence (classe primo)");

  // Échap ne doit PAS fermer tant que le bouton est verrouillé
  window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  ok($("#modal").classList.contains("show"), "Échap contourne le verrou de lecture");

  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const waitFor = async (fn, ms = 5000, step = 60) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { try { if (fn()) return true; } catch (e) {} await wait(step); }
    try { return !!fn(); } catch (e) { return false; }
  };
  setTimeout(async () => {
    // Bascule manuelle vers la question par le bouton mis en évidence
    fwd.click();
    ok(!$("#srcquizview").classList.contains("off"), "la question n'apparaît pas après le clic sur le bouton");
    ok($("#srcview").classList.contains("off"), "la source devrait s'effacer au profit de la question");
    ok($("#srcclose").disabled, "le bouton se déverrouille sans réponse au quiz");

    // Bascule : revoir la source, puis revenir à la question
    $("#sqback").click();
    ok(!$("#srcview").classList.contains("off") && $("#srcquizview").classList.contains("off"), "« Revoir la source » ne rebascule pas");
    ok(!$("#sqfwd").classList.contains("off"), "le bouton « Répondre à la question » est absent");
    $("#sqfwd").click();
    ok($("#srcview").classList.contains("off") && !$("#srcquizview").classList.contains("off"), "le retour à la question ne fonctionne pas");

    // Mauvaise réponse d'abord : indice, pas de déverrouillage
    const okIdx = ev('SRC["contrat"].q.ok');
    const wrong = document.querySelector(`#sqch button:not([data-qi="${okIdx}"])`);
    wrong.click();
    ok(wrong.disabled && wrong.classList.contains("no"), "la mauvaise réponse n'est pas marquée");
    ok($("#sqhint").classList.contains("err"), "pas d'indice après une erreur");
    ok($("#srcclose").disabled, "déverrouillé malgré une mauvaise réponse");

    // Bonne réponse : déverrouillage
    document.querySelector(`#sqch button[data-qi="${okIdx}"]`).click();
    ok(!$("#srcclose").disabled, "le bouton ne se déverrouille pas après la bonne réponse");
    ok(ev("F._quizFirst") === 0, "F._quizFirst devrait rester à 0 (erreur commise)");
    $("#srcclose").click();
    ok(!$("#modal").classList.contains("show"), "la fenêtre de source ne se ferme pas");
    ok(ev("F._srcSeen") === 1, "F._srcSeen ≠ 1");

    // Renvois déverrouillés, note disparue
    const openBtns = [...document.querySelectorAll("#renvois .renvoi.open")];
    ok(openBtns.some(b => !b.disabled), "aucun renvoi déverrouillé après l'étude");
    ok(!$("#locknote"), "la note de verrouillage persiste");

    // --- Inspiration des Muses : épreuve, échec forcé, relance, revers ---
    const STORY = ev("STORY");
    ok(ev("F.erudition") === 10, "Érudition devrait être à 10 (6 + 4)");
    ok(ev("F.faveurs") === 3 && ev("F.faveursMax") === 3, "Érudition 10 devrait accorder 3 Inspirations");
    ok(document.querySelectorAll("#tablet .flame.on").length === 3, "les 3 flammes ne brillent pas au tiroir");
    const btnE = openBtns.find(b => !b.disabled && STORY.atelier.renvois[+b.dataset.i].epreuve);
    ok(btnE, "aucun renvoi avec épreuve au nœud atelier");
    btnE.click();
    const dz = $("#dicezone");
    ok(dz.classList.contains("show") && $("#rollbtn"), "la zone de dés ne s'ouvre pas");
    ok(/invoquer les Muses/i.test(dz.textContent), "la règle de l'Inspiration n'est pas annoncée");
    ok(/Fortune/i.test(dz.textContent), "la règle de la Fortune n'est pas annoncée dans la zone de dés");
    ok(ev("F._echecs") === 0 && document.querySelectorAll("#tablet .bolt").length === 3 && document.querySelectorAll("#tablet .bolt.on").length === 0, "la roue devrait afficher 0 revers sur 3 au départ");

    const realRandom = Math.random;
    window.eval("Math.random = () => 0");   // dés à 1-1 : échec garanti
    $("#rollbtn").click();
    ok(await waitFor(() => $("#dzfavor")), "l'offre d'invocation n'apparaît pas après l'échec");
    ok(ev("F.faveurs") === 3, "l'Inspiration ne doit pas être consommée avant l'invocation");
    ok(!$("#modal").classList.contains("show"), "le revers ne doit pas s'appliquer tant que l'offre est ouverte");
    const renBefore = ev("F.renommee");

    $("#favyes").click();                    // invoquer : relance
    ok(ev("F.faveurs") === 2, "l'Inspiration n'est pas décomptée");
    ok(document.querySelectorAll("#tablet .flame.on").length === 2, "le tiroir ne reflète pas l'Inspiration consommée");

    ok(await waitFor(() => $("#modal").classList.contains("show")), "le verdict d'échec ne s'affiche pas après la relance");
    ok(!$("#dzfavor"), "une seconde invocation ne devrait pas être offerte");
    ok(/double-un/.test($("#modal").textContent) && /parlent contre toi/.test($("#modal").textContent), "le verdict devrait nommer le double-un");
    ok(ev("F._echecs") === 1, "l'échec résolu devrait compter un revers");
    ok(document.querySelectorAll("#tablet .bolt.on").length === 1, "le tiroir devrait afficher 1 revers de Fortune");
    ok(/Échec/.test($("#modal").textContent), "le verdict devrait annoncer l'échec");
    ok(ev("F.renommee") === renBefore - 1, "le revers (Renommée −1) ne s'applique qu'à la résolution");
    window.eval("Math.random = undefined"); window.Math.random = realRandom;
    ev("Math.random()");                     // sanity : restauré
    $("#modalbtn").click();
    ok(btnE.disabled && btnE.classList.contains("burned"), "le choix raté devrait être condamné");
    ok(openBtns.some(b => b !== btnE && !b.disabled), "les autres voies ne rouvrent pas après l'échec");

    // Choisir LE renvoi sans épreuve (l'ordre DOM est mélangé)
    const btn = openBtns.find(b => { const r = STORY.atelier.renvois[+b.dataset.i]; return !b.disabled && !r.epreuve; });
    ok(btn, "aucun renvoi sans épreuve au nœud atelier");
    const floBefore = ev("F.florins");
    btn.click();
    ok($("#modal").classList.contains("show"), "la fenêtre de conséquence ne s'ouvre pas");
    ok(ev("F.florins") === floBefore - 2, "payer son entrée devrait coûter 2 florins");
    $("#modalbtn").click();

    // Un sceau gagné fait scintiller la sacoche et illumine la languette
    $("#sheettab").click(); $("#sheettab").click();   // consulter → languette éteinte
    ev('gagneSceau("Outremer livré");rendreTablette();');
    const chip = [...document.querySelectorAll("#tablet .seal")].find(c => /Outremer livré/.test(c.textContent));
    ok(chip, "le sceau gagné n'apparaît pas à la sacoche");
    ok(chip && chip.classList.contains("flash"), "le sceau fraîchement gagné devrait scintiller");
    ok((chip.getAttribute("title") || "").includes("outremer"), "l'infobulle du sceau manque");
    ok($("#sheettab").classList.contains("lit"), "la languette devrait s'illuminer quand un sceau est gagné");
    ok(fs.readFileSync(path.join(ROOT, "index.html"), "utf8").includes("Scellé : ${r.lock}"), "les verrous ne mentionnent pas le sceau manquant");
    ev('F.sceaux.delete("Outremer livré");');

    const p = $("#poursuite");
    ok(p.classList.contains("show"), "le bouton Poursuis n'apparaît pas");
    ok(/Rends-toi au §\d+/.test(p.textContent), `le bouton devrait annoncer la section : « ${p.textContent.trim()} »`);
    p.click();

    // La table des sections s'ouvre : seule la destination est déverrouillée
    ok($("#overlay").classList.contains("show"), "la table des sections ne s'ouvre pas");
    const cibleKey = ev("SECNAV");
    ok(typeof cibleKey === "string" && cibleKey === "perspective", "SECNAV devrait viser perspective");
    const targetBtn = document.querySelector("#seclist .secn.target");
    ok(targetBtn && targetBtn.dataset.sk === cibleKey, "la destination n'est pas marquée dans la table");
    const others = [...document.querySelectorAll("#seclist .secn:not(.target)")];
    ok(others.length && others.every(b => b.disabled), "des sections non atteintes sont cliquables");
    others[0].click();
    ok($("#overlay").classList.contains("show"), "cliquer une section scellée ne devrait rien faire");
    targetBtn.click();
    ok(!$("#overlay").classList.contains("show"), "la table ne se ferme pas après le feuilletage");

    ok(ev("F.histoire.length") === 2, "histoire.length ≠ 2 après la poursuite");
    ok(ev("F.histoire[1].sec") === ev(`SEC[${JSON.stringify(cibleKey)}]`), "l'entrée du récit ne porte pas son numéro de section");
    ok(/§\d+ · /.test(($("#story") || {textContent:""}).textContent), "le numéro de section n'apparaît pas dans le récit");
    ok(ev("F._srcTotal") === 2, "F._srcTotal non incrémenté au nœud perspective");

    // L'option de métier : ouverte pour l'artiste au nœud perspective
    const persBtns = [...document.querySelectorAll("#renvois .renvoi")];
    const iCond = ev("STORY").perspective.renvois.findIndex(r => r.cond);
    ok(iCond >= 0, "le nœud perspective devrait offrir une option de métier");
    ok(persBtns.some(b => +b.dataset.i === iCond && b.classList.contains("open")), "l'option d'artiste devrait être ouverte pour le métier artiste");

    // La frise suit : au moins une encoche fait/cur cohérente
    const cur = document.querySelectorAll("#progress .frise i.cur, #progress .frise i.fait");
    ok(cur.length >= 1, "la frise ne se met pas à jour");

    // Lexique plein écran
    $("#lexbtn").click();
    ok($("#overlay").classList.contains("show"), "l'écran Lexique ne s'ouvre pas");
    const items = document.querySelectorAll("#overlay .lexlist .lex-e");
    ok(items.length >= 20, `lexique : attendu ≥ 20 entrées listées, trouvé ${items.length}`);
    window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    ok(!$("#overlay").classList.contains("show"), "Échap ne ferme pas le Lexique");

    // Table des sections consultative : lues marquées, position cliquable, reste scellé
    $("#secbtn").click();
    ok($("#overlay").classList.contains("show"), "la table consultative ne s'ouvre pas");
    ok(document.querySelectorAll("#seclist .secn.seen").length >= 2, "les sections lues ne sont pas marquées");
    const here = document.querySelector("#seclist .secn.here");
    ok(here && !here.disabled, "la position courante devrait être cliquable");
    ok(!document.querySelector("#seclist .secn.target"), "aucune destination ne devrait pulser en consultation");
    here.click();
    ok(!$("#overlay").classList.contains("show"), "cliquer sa position ne referme pas la table");

    // --- Seuils d'effondrement : florins, Église, Fortune ---
    const secOf = (k) => ev(`SEC[${JSON.stringify(k)}]`);
    const pBtn = $("#poursuite");
    ev('F.florins=0;');
    ev('finaliser(null,"mecene",null);');
    ok(pBtn.textContent.includes(`§${secOf("nF_misere")}`), "florins à zéro devrait détourner vers La misère");
    pBtn.click();
    ok(ev("SECNAV") === "nF_misere", "la table devrait mener à la fin de la misère");
    ev("SECNAV=null;closeOverlay();");
    ev('F.florins=4;F.eglise=0;');
    ev('finaliser(null,"mecene",null);');
    ok(pBtn.textContent.includes(`§${secOf("nF_prison")}`), "Faveur de l'Église à zéro devrait détourner vers les geôles");
    ev('finaliser(null,"sentence",null);');
    ok(pBtn.textContent.includes(`§${secOf("sentence")}`), "la sentence ne devrait jamais être détournée par un effondrement");
    ev('F.eglise=6;F._echecs=3;');
    ev('finaliser(null,"mecene",null);');
    ok(pBtn.textContent.includes(`§${secOf("nF_fortune")}`), "trois revers devraient détourner vers La roue de la Fortune");
    ev('F._echecs=1;');
    ev('finaliser(null,"mecene",null);');
    ok(pBtn.textContent.includes(`§${secOf("mecene")}`), "jauges rétablies, le renvoi normal devrait reprendre");
    ok(!pBtn.textContent.includes("Découvre le sort"), "sans effondrement, pas de détour vers une fin");

    // --- Affrontement : la zone de duel s'ouvre et une ronde s'applique ---
    ev('F.noeud="concours";F.histoire.push({num:F.histoire.length+1,sec:SEC.concours,folio:STORY.concours.folio,paras:STORY.concours.texte});rendre(false);enableOpen();');
    const cbBtn = [...document.querySelectorAll("#renvois .renvoi.open")].find(b => ev("STORY").concours.renvois[+b.dataset.i] && ev("STORY").concours.renvois[+b.dataset.i].combat);
    ok(cbBtn, "le renvoi d'affrontement du concours est introuvable");
    ok(/Affrontement aux dés/.test(cbBtn.textContent), "le renvoi d'affrontement ne s'annonce pas comme tel");
    ev("F.faveurs=0;");                       // pas d'offre des Muses pendant ce duel
    cbBtn.click();
    ok($("#czroll") && $("#czj") && $("#cza"), "la zone de duel ne s'ouvre pas");
    ok(/doublé fatal/i.test($("#dicezone").textContent), "la règle du doublé fatal n'est pas annoncée");
    ok(document.querySelectorAll("#czj i").length === ev("STORY").concours.combat.jPts, "les points du joueur ne sont pas tous affichés");
    ok(/Carnet de croquis/.test($("#dicezone").textContent), "l'aide du carnet de croquis n'est pas annoncée");
    const jAvant = ev("CB.j"), aAvant = ev("CB.a");
    window.eval("Math.random = () => 0");     // 1-1 des deux côtés : chacun perd 2
    $("#czroll").click();
    ok(await waitFor(() => ev("CB && CB.j") === jAvant - 2, 4000), "le double-un du joueur ne lui coûte pas 2 points");
    ok(ev("CB.a") === aAvant - 2, "le double-un adverse ne lui coûte pas 2 points");
    ok(document.querySelectorAll("#czlog .lg").length >= 1, "la ronde ne s'inscrit pas au journal du duel");
    ok(await waitFor(() => !$("#czroll").disabled, 2000), "le bouton de ronde ne se réarme pas");
    ok(/ronde 2/.test($("#czroll").textContent), "le compteur de rondes n'avance pas");
    window.eval("Math.random = undefined"); window.Math.random = realRandom;

    // --- Fins : bandeau funeste vs triomphe ---
    ev('CB=null;F.noeud="nF_oubli";rendre(false);');
    ok($(".fin-doom") && /histoire s'achève ici/i.test($(".fin-doom").textContent), "le bandeau funeste manque");
    ok($(".fin-wrap").classList.contains("chute"), "la fin nF_oubli devrait être une chute");
    ok(/parti(e)? de Florence en 1508/.test($(".fin-duree").textContent), "la durée de vie ne mentionne pas Florence");
    ev('F.noeud="nF_maitre";rendre(false);');
    ok(!$(".fin-doom"), "un triomphe ne devrait pas porter le bandeau funeste");
    ok($(".fin-wrap").classList.contains("triomphe"), "la fin nF_maitre devrait être un triomphe");
    ok($("#restart"), "le bouton Vivre une autre vie manque au bilan");
    ok(/Vivre une autre vie/.test($("#restart").textContent), "le bouton de relance devrait inviter à vivre une autre vie");

    bilan();
  }, ev("READ_LOCK") * 1000 + 600);
}

function bilan(){
  console.log("\n————————————————————————");
  console.log(`RÉUSSITES : ${pass}   ÉCHECS : ${fail}`);
  process.exit(fail ? 1 : 0);
}
