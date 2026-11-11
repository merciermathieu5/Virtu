#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Assemble index.html de Virtù à partir du moteur de Lugal."""
import re, random, sys, io

SRCF = "lugal-source.html"
OUT = "index.html"
html = io.open(SRCF, encoding="utf-8").read()
errors = []

def part(name):
    return io.open("parts/" + name, encoding="utf-8").read()

def between(text, start, end, repl, label):
    """Remplace le bloc [start, end) ; start inclus, end exclu."""
    i = text.find(start)
    j = text.find(end, i + len(start)) if i >= 0 else -1
    if i < 0 or j < 0:
        errors.append("ancre introuvable : " + label)
        return text
    return text[:i] + repl + text[j:]

def rep(text, old, new, label, count=1):
    n = text.count(old)
    if n != count:
        errors.append(f"remplacement « {label} » : {n} occurrence(s), attendu {count}")
        return text
    return text.replace(old, new)

def rrep(text, pattern, new, label, count=1):
    r = re.compile(pattern, re.S)
    n = len(r.findall(text))
    if n != count:
        errors.append(f"regex « {label} » : {n} occurrence(s), attendu {count}")
        return text
    return r.sub(new, text, count=count)

# ---- 1. numérotation des sections (graine 1517, §1 = atelier) ----
NODES = ["atelier","perspective","mecene","concours","nouvelles","venise","pigment","savants",
         "presse","depart2","tetzel","theses","dispute","censure","entracte","rome","cosmos",
         "manuscrit","verdict","verdict_flou","tribunal","sentence","concile",
         "nF_maitre","nF_humaniste","nF_presse","nF_france","nF_concile","nF_abjure","nF_ombre",
         "nF_bucher","nF_prison","nF_misere","nF_fortune","nF_oubli"]
rnd = random.Random(1517)
nums = list(range(2, len(NODES) + 1))
rnd.shuffle(nums)
sec = {"atelier": 1}
for k, n in zip(NODES[1:], nums):
    sec[k] = n
sec_js = "{" + ",".join(f"{k}:{v}" for k, v in sec.items()) + "}"

regionA = part("regionA.js").rstrip() + "\n"
regionB = (part("regionB1.js").rstrip() + "\n" +
           part("regionB2.js").replace("__SEC__", sec_js).rstrip() + "\n")

# ---- 2. régions ancrées ----
html = between(html, "const QUALITES=[", "const d6=()=>", regionA, "région A")
html = between(html, "const SRC={", "const $=s=>document.querySelector(s);", regionB, "région B")
html = between(html, "const GLOSS={", "const GLOSS_LOOKUP", part("gloss.js").rstrip() + "\n", "lexique")
html = between(html, 'const KFINS="lugal.fins"', "function enregistrerFin", part("finsmeta.js").rstrip() + "\n", "fins meta")
html = between(html, "/* ====== Cités sumériennes", "function reset(){", part("metiers.js").rstrip() + "\n", "métiers")
html = rep(html, "/* ----- frontispice : répartition des points ----- */",
           part("combat.js").rstrip() + "\n/* ----- frontispice : répartition des points ----- */", "insertion combat")

# ---- 3. coquille HTML ----
shell = part("shell.html")
topbar = shell.split("<!-- ===TOPBAR=== -->")[1].split("<!-- ===INTRO=== -->")[0].strip()
intro = shell.split("<!-- ===INTRO=== -->")[1].split("<!-- ===FRONTIS=== -->")[0].strip()
frontis = shell.split("<!-- ===FRONTIS=== -->")[1].strip()
html = between(html, '<div class="topbar">', '<div class="stage">', topbar + "\n", "topbar")
html = between(html, '<div class="intro" id="intro">', '<div class="frontis"', intro + "\n\n", "intro")
html = between(html, '<div class="frontis"', '<div class="overlay"', frontis + "\n\n", "frontis")

# ---- 4. petits remplacements ----
P = [
 # en-tête
 ("<title>Lugal · un livre dont vous êtes le roi</title>",
  "<title>Virtù · un livre dont vous êtes le héros</title>", 1),
 # étiquette des documents composés
 ("Document composé pour Lugal", "Document composé pour Virtù", 2),
 # fiche du personnage
 ('id="sheetlbl">Le roi</span>', 'id="sheetlbl">L\u2019apprenti</span>', 1),
 ('F.genre==="roi"?"Le roi":"La reine"', 'F.genre==="apprentie"?"L\u2019apprentie":"L\u2019apprenti"', 1),
 ('const KEYS=["autorite","sagesse","piete","legitimite","prosperite","rayonnement","savoir","technique"];',
  'const KEYS=["eloquence","adresse","erudition","virtu","renommee","florins","eglise"];', 1),
 # effondrements des jauges dans finaliser
 ('''if((F._echecs||0)>=MALCHANCE)cible="nF_maudit";
    else if(F.prosperite<=0)cible="nF_greniers";
    else if(F.legitimite<=0)cible="nF_revolte";
    else if(F.autorite<=0)cible="nF_poignards";
    else if(F.piete<=0)cible="nF_deluge";''',
  '''if((F._echecs||0)>=MALCHANCE&&cible!=="sentence")cible="nF_fortune";
    else if(F.florins<=0&&cible!=="sentence")cible="nF_misere";
    else if(F.eglise<=0&&cible!=="sentence"&&F.noeud!=="tribunal")cible="nF_prison";''', 1),
 # la roue de la Fortune plutôt que le courroux des dieux
 ('<div class="t-sect">Le courroux des dieux</div>', '<div class="t-sect">La roue de la Fortune</div>', 1),
 ("Chaque revers aux dés attise le courroux : au troisième, la cité te tiendra pour maudit.",
  "Chaque revers aux dés fait tourner la roue : au troisième, la Fortune t'abandonne.", 1),
 ("Les dieux relancent les dés…", "Les Muses relancent les dés…", 1),
 ('<span class="plabel">Fin du règne</span>', '<span class="plabel">Fin de l\u2019histoire</span>', 1),
 ("Ce règne t'a fait découvrir", "Cette vie t'a fait découvrir", 1),
 ("Petit lexique de la Mésopotamie</div>", "Petit lexique de la Renaissance</div>", 1),
 ('<div class="t-sect">Chronique du règne</div>', '<div class="t-sect">Chronique d\u2019une vie</div>', 1),
 ('${F.genre==="roi"?"Lugal":"Reine"} de ${esc(F.cite)}',
  '${F.genre==="apprentie"?"Apprentie":"Apprenti"} ${MET_SUB[F.metier]||""}', 1),
 ('"Sa civilisation"', '"Tes jauges"', 0),
 ('<div class="t-sect">Sa civilisation</div>', '<div class="t-sect">Tes jauges</div>', 1),
 ('<div class="t-sect">Sceaux royaux</div>', '<div class="t-sect">La sacoche</div>', 1),
 ("aucun sceau encore : tes grandes décisions les graveront",
  "sacoche vide : tes décisions et tes objets la rempliront", 1),
 ('<div class="t-sect">Faveur des dieux</div>', '<div class="t-sect">L\u2019Inspiration des Muses</div>', 1),
 ("Implorer les dieux permet de relancer un jet de dés raté, une seule fois par épreuve.",
  "Invoquer les Muses permet de relancer les dés, une seule fois par épreuve ou par affrontement.", 1),
 ('(k==="prosperite"||k==="legitimite"||k==="autorite")&&F[k]<=2',
  '(k==="florins"||k==="eglise")&&F[k]<=2', 1),
 ('<div class="signet sg-stats">Capacités du personnage</div>',
  '<div class="signet sg-stats">La feuille du personnage</div>', 1),
 # navigation et gauche
 ("Les sections déjà lues portent l'encre de ton règne", "Les sections déjà lues portent l'encre de ta vie", 1),
 ('<span>Le livre du règne</span>', '<span>Le livre d\u2019une vie</span>', 1),
 ('<div class="signet sg-decision">Décision royale</div>', '<div class="signet sg-decision">La décision</div>', 1),
 ('<div class="rhead"><span></span><span>${esc(F.cite)}</span></div>',
  '<div class="rhead"><span></span><span>${F.metier==="artiste"?"La bottega":F.metier==="imprimeur"?"L\u2019officina":"Le studiolo"}</span></div>', 1),
 ("Découvre le sort de ton règne", "Découvre le sort de ta vie", 1),
 # fin de partie
 ('const triomphe=["nF_legislateur","nF_orfevre","nF_dieu","nF_savoir"].includes(F.noeud);',
  'const triomphe=TRIOMPHES.includes(F.noeud);', 1),
 ('"Ainsi s\'acheva un grand règne":"Ainsi s\'acheva ton règne"',
  '"Ainsi s\'écrit une grande vie":"Ainsi s\'écrit ta vie"', 1),
 ("Ton règne s'achève ici.", "Ton histoire s'achève ici.", 1),
 ('Ton règne aura traversé ${F.histoire.length} décisions, ${esc(F.nom)} ${/^[aeiouhAEIOUH]/.test(F.cite)?"d\'":"de "}${esc(F.cite)}.',
  'Ta vie aura traversé ${F.histoire.length} décisions, ${esc(F.nom)}, ${F.genre==="apprentie"?"partie":"parti"} de Florence en 1508.', 1),
 ('<div class="signet sg-decision">Le verdict du règne</div>', '<div class="signet sg-decision">Le verdict d\u2019une vie</div>', 1),
 ("Décisions périlleuses pour ta cité", "Décisions périlleuses", 1),
 ("aucune, ton règne fut prudent", "aucune, ta vie fut prudente", 1),
 ("Ce qui aura marqué ton règne", "Ce qui aura marqué ta vie", 1),
 ("Régner à nouveau", "Vivre une autre vie", 1),
 ("La galerie des règnes", "La galerie des destins", 1),
 ("des 13 destins découverts", "des ${FINS_ORDRE.length} destins découverts", 1),
 # frise et folios
 ('const ROMAN_INV=["I","II","III","IV","V","VI","VII","VIII"];', 'const ROMAN_INV=["I","II","III","IV"];', 1),
 ('const ACTE_TT=["Les eaux","Le surplus et les échanges","L\'écriture et le savoir","La société et la cité","Les dieux","La justice","La défense","L\'héritage"];',
  'const ACTE_TT=["Florence","Venise","Wittenberg","Rome"];', 1),
 ('ep=/^Épreuve/.test(n.folio)', 'ep=/^(Épreuve|Affrontement)/.test(n.folio)', 1),
 # épreuves et fortune
 ('finaliser(btn,"nF_maudit",null)', 'finaliser(btn,"nF_fortune",null)', 1),
 ('Comme les rois de Sumer avant toi, tu peux <b>implorer les dieux</b> et relancer, une seule fois.',
  'Comme les poètes le chantent, tu peux <b>invoquer les Muses</b> et relancer, une seule fois.', 1),
 ('Implorer les dieux · faveur −1', 'Invoquer les Muses · Inspiration −1', 1),
 # bascule choisir + habillage des renvois
 ('function choisir(r,btn){\n  if(r.epreuve){tenterEpreuve(r,btn);return;}',
  'function choisir(r,btn){\n  if(r.combat){tenterCombat(r,btn);return;}\n  if(r.epreuve){tenterEpreuve(r,btn);return;}', 1),
 ("const titre=r.t+(r.epreuve?' <span class=\"jdd\">(Jet de dés)</span>':'')",
  "const titre=r.t+(r.epreuve?' <span class=\"jdd\">(Jet de dés)</span>':(r.combat?' <span class=\"jdd\">(Affrontement aux dés)</span>':''))", 1),
 ('function ebsFor(r){\n  const out=[];',
  'function ebsFor(r){\n  const out=[];\n  if(r.combat){out.push(\'<span class="eb">Rondes de dés opposées</span>\');}', 1),
 # persistance
 ('"lugal.sound"', '"virtu.sound"', 2),
 ('const titres=loadSet(KTITRES),ctx={fin:finId,finsCount:fins.size},nouveaux=[];',
  'const vies=loadSet(KVIES);if(F&&F.metier)vies.add(F.metier);saveSet(KVIES,vies);\n  const titres=loadSet(KTITRES),ctx={fin:finId,finsCount:fins.size,viesCount:vies.size},nouveaux=[];', 1),
 ('alloc={autorite:0,sagesse:0,piete:0,legitimite:0}',
  'alloc={eloquence:0,adresse:0,erudition:0,virtu:0}', 1),
 # le prénom et l'accord de genre s'injectent dans les documents
 ('function plate(s){',
  'function plate(s){return _plateRaw(s).replace(/\\{NOM\\}/g,(F&&F.nom)?esc(F.nom):"Andrea").replace(/\\{E\\}/g,(F&&F.genre==="apprentie")?"e":"");}\nfunction _plateRaw(s){', 1),
 # exports pour le harnais
 ('module.exports={STORY,SRC,SCEAUX_ORDRE,QUALITES,METRES,evaluerFin,pReussite,BASE,POOL,MAXADD};',
  'module.exports={STORY,SRC,SEC,SCEAUX_ORDRE,QUALITES,METRES,evaluerFin,pReussite,BASE,POOL,MAXADD,FINS_ORDRE,TRIOMPHES,METIERS,MARQUES,combatDegats,simulerCombat};', 1),
 # palette des documents (parchemin plutôt qu'argile)
 ("radial-gradient(130% 100% at 28% 16%,#d3b78d 0%,#c4a375 46%,#a8845b 100%)",
  "radial-gradient(130% 100% at 28% 16%,#f0e4c4 0%,#e4d2a6 46%,#ccb27e 100%)", 1),
 # plus de chrono de consultation : la question est accessible d'emblée
 ("const READ_LOCK=6;", "const READ_LOCK=0;", 1),
 ("`<span class=\"src-timer\" id=\"srctimer\">Prends le temps de l'étudier… <b id=\"srcnum\">${READ_LOCK}</b> s</span><button class=\"modal-btn\" id=\"srcclose\" disabled>Patiente…</button>`",
  "`<span class=\"src-timer\" id=\"srctimer\">Lis la source, puis montre que tu as bien lu.</span><button class=\"modal-btn\" id=\"srcclose\" disabled>Réponds d'abord à la question</button>`", 1),
 ('<button type="button" class="swapbtn off" id="sqfwd">Répondre à la question ↓</button>',
  '<button type="button" class="swapbtn primo off" id="sqfwd">Répondre à la question »</button>', 1),
 ("            swap(true);\n", "", 1),
 # défilement automatique vers l'offre des Muses et la zone de dés
 ('dz.appendChild(div);\n    $("#favyes")', 'dz.appendChild(div);voirEl(div);\n    $("#favyes")', 1),
 ('$("#rollbtn").onclick=()=>{audioInit();audioResume();lancer();};',
  '$("#rollbtn").onclick=()=>{audioInit();audioResume();lancer();};\n  voirEl(dz);', 1),
]
for old, new, cnt in P:
    if cnt == 0:
        continue
    html = rep(html, old, new, old[:46], cnt)

# ---- 5. remplacements par regex ----
html = rrep(html,
  r" C'est ton troisième revers : dans la cité,[^\"]*?\.\"",
  " C'est ton troisième revers : dans le milieu, on murmure que la Fortune t'a tourné le dos.\"",
  "texte troisième revers", 1)
html = rrep(html,
  r" C'est ton deuxième revers\.[^\"]*?\.\"",
  " C'est ton deuxième revers. Les langues vont bon train : au prochain, on te dira abandonné par la Fortune.\"",
  "texte deuxième revers", 1)
html = rep(html,
  'même le plus grand roi peut être trahi par le sort, et un double-un échoue toujours, et les dieux comptent tes revers : au troisième, ton règne est maudit.${F.faveurs>0?" Si le sort te trahit, tu pourras <b>implorer les dieux</b> et relancer, une seule fois par épreuve.":""}',
  'même le plus grand esprit peut être trahi par le sort, et un double-un échoue toujours, et la Fortune compte tes revers : au troisième, elle t\'abandonne.${F.faveurs>0?" Si le sort te trahit, tu pourras <b>invoquer les Muses</b> et relancer, une seule fois par épreuve.":""}',
  "règle des dés", 1)

html = rrep(html,
  r"let t=READ_LOCK;\s*const iv=setInterval\(\(\)=>\{t--;const num=\$\(\"#srcnum\"\);if\(num\)num\.textContent=Math\.max\(t,0\);\s*if\(t<=0\)\{clearInterval\(iv\);",
  "{", "chrono : ouverture immédiate", 1)
html = rep(html, 'armClose();}\n        }},1000);', 'armClose();}\n        }', "chrono : fermeture du bloc", 1)

# ---- 6. MARQUES ----
marques = {
 "Perspective maîtrisée":"tu as percé le secret du point de fuite",
 "Anatomiste de l'ombre":"tu as étudié le corps humain dans l'ombre",
 "Protégé d'un mécène":"tu as gagné la protection d'un mécène",
 "Esprit libre":"tu as refusé toute tutelle",
 "Lauréat du concours":"tu as remporté le concours de la Seigneurie",
 "Compagnon d'imprimerie":"tu as servi les presses d'Alde à Venise",
 "Outremer livré":"tu as livré l'outremer à travers Venise",
 "Ami des humanistes":"tu as été reçu au cercle des humanistes",
 "Presse clandestine":"tu as imprimé sous le manteau",
 "Liberté d'examen":"tu as imprimé la critique à visage découvert",
 "Indulgence achetée":"tu as acheté une lettre d'indulgence",
 "Voix critique":"tu as questionné le prédicateur d'indulgences",
 "Diffuseur des thèses":"tu as diffusé les thèses de Wittenberg",
 "Défenseur de Rome":"tu as pris la plume pour défendre Rome",
 "Vainqueur de la dispute":"tu as ébranlé un docteur en disputatio",
 "Tirage sauvé":"tu as sauvé un tirage de la censure",
 "Commande du cardinal":"tu as servi un cardinal romain",
 "Lecteur de Copernic":"tu as étudié le livre de Copernic",
 "Philologue":"tu as démasqué le faux par la philologie",
 "Vérité publiée":"tu as publié la vérité, quoi qu'il en coûte",
 "Preuve enterrée":"tu as remis la preuve sous le sceau du secret",
 "Silence acheté":"tu as monnayé ton silence",
 "Blanchi par le tribunal":"tu es sorti libre du Saint-Office",
 "Abjuration":"tu as abjuré pour sauver ta vie",
 "Persistant":"tu as refusé de plier devant le tribunal",
 "Serviteur de la Contre-Réforme":"tu as servi la Contre-Réforme",
 "Passage en France":"tu as porté la Renaissance en France",
 "Carnet de croquis":"ton carnet de croquis ne te quitte jamais",
 "Casse de caractères":"ta casse de caractères te suit partout",
 "Grammaire grecque":"ta grammaire grecque ne te quitte pas",
}
mjs = "const MARQUES={" + ",".join(f'"{k}":"{v}"' for k, v in marques.items()) + "};"
html = rrep(html, r"const MARQUES=\{[^\n]*\};", mjs, "MARQUES", 1)

# ---- 7. emblème de la fiche (laurier et livre plutôt que roseau) ----
embl = ('const EMBLEME=`<svg viewBox="0 0 40 40" fill="none" stroke="#5e451f" stroke-width="1.5" '
        'stroke-linecap="round" stroke-linejoin="round"><path d="M11 33q-4-9 2-15" /><path d="M29 33q4-9-2-15"/>'
        '<g stroke-width="1.2"><path d="M11 28l-4-2M12 23l-4-3M14 19l-3-4M29 28l4-2M28 23l4-3M26 19l3-4"/></g>'
        '<path d="M14 30v-12q6-4 12 0v12q-6-3-12 0z"/><path d="M20 17.5v12" stroke-width="1.2"/>'
        '<circle cx="20" cy="9" r="3.4" stroke="#9c3a2c" stroke-width="1.3"/></svg>`;')
html = rrep(html, r"const EMBLEME=`<svg[^`]*`;", embl, "emblème", 1)

# ---- 8. CSS des affrontements + retouches ----
css = """
/* ====== affrontements sans violence ====== */
.cz{display:flex;flex-direction:column;gap:8px}
.cz-duel{display:flex;align-items:stretch;gap:8px}
.cz-side{flex:1;border:1px solid var(--paper-edge);border-radius:4px;padding:7px 9px;background:rgba(255,252,242,.55)}
.cz-side.adv{background:rgba(156,58,44,.07)}
.cz-n{display:block;font-family:"IM Fell English SC",serif;font-size:12.5px;letter-spacing:.04em}
.cz-apt{display:block;font-size:12px;color:var(--ink-soft);margin:1px 0 5px}
.cz-lbl{font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-soft)}
.cz-pts{display:flex;gap:3px;margin-top:3px;flex-wrap:wrap}
.cz-pts i{width:11px;height:11px;border:1px solid var(--ink-soft);border-radius:2px;background:transparent}
.cz-pts i.on{background:var(--rubric);border-color:var(--rubric)}
.cz-side.me .cz-pts i.on{background:var(--pos);border-color:var(--pos)}
.cz-vs{align-self:center;font-family:"IM Fell English",serif;font-style:italic;color:var(--ink-soft);font-size:13px}
.cz-aides{font-size:11.5px;color:var(--ink-soft);line-height:1.5}
.cz-aides b{color:var(--ink)}
.cz-dice{display:flex;justify-content:space-around;gap:10px;flex-wrap:wrap}
.cz-dr{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink-soft)}
.cz-dr b{color:var(--ink);min-width:34px}
.cz-log{max-height:96px;overflow:auto;border-top:1px dashed var(--rule);padding-top:5px;display:flex;flex-direction:column;gap:3px;font-size:12px}
.cz-log .lg{color:var(--ink-soft)}
.cz-log .lg b{color:var(--ink)}
.cz-log .lg.win b{color:var(--pos)}
.cz-log .lg.lose b{color:var(--rubric)}
.cz-roll{align-self:center}
.cz-favor{border:1px solid var(--paper-edge);background:rgba(231,198,106,.16);border-radius:4px;padding:6px 9px;font-size:12.5px}
.cz-favor p{margin:0 0 6px}
.wedge{display:none}
/* ====== la page de décision défile : plus de bouton hors page ====== */
.dec{overflow-y:auto;overflow-x:hidden;scrollbar-width:thin}
.dec::-webkit-scrollbar{width:5px}
.dec::-webkit-scrollbar-thumb{background:rgba(120,90,45,.32);border-radius:3px}
/* ====== documents : feuille de papier enluminée, lisible ====== */
.clay{background:radial-gradient(140% 120% at 30% 12%,#fcf6e2 0%,#f4e8c8 52%,#e4d2a4 100%);border-radius:2px 5px 3px 5px/4px 3px 5px 3px;border:1px solid #ad9160;box-shadow:0 3px 10px rgba(40,26,10,.22),inset 0 0 30px rgba(176,138,46,.13);padding:20px 26px 17px}
.clay::before{content:"";position:absolute;inset:7px;border:1.5px solid rgba(176,138,46,.78);pointer-events:none;background-image:radial-gradient(circle,#b08a2e 0 2.1px,rgba(156,58,44,.85) 2.1px 3px,transparent 3.5px),radial-gradient(circle,#b08a2e 0 2.1px,rgba(156,58,44,.85) 2.1px 3px,transparent 3.5px),radial-gradient(circle,#b08a2e 0 2.1px,rgba(156,58,44,.85) 2.1px 3px,transparent 3.5px),radial-gradient(circle,#b08a2e 0 2.1px,rgba(156,58,44,.85) 2.1px 3px,transparent 3.5px);background-size:11px 11px;background-repeat:no-repeat;background-position:-5px -5px,calc(100% + 5px) -5px,-5px calc(100% + 5px),calc(100% + 5px) calc(100% + 5px)}
.clay::after{content:"";position:absolute;inset:11px;border:1px solid rgba(156,58,44,.4);pointer-events:none}
.clay p{font-style:normal;font-size:17px;line-height:1.66;color:#2b2010;text-shadow:none;position:relative;z-index:1}
.clay p:first-of-type::first-letter{font-family:"IM Fell English SC",serif;font-size:46px;line-height:.82;float:left;padding:4px 8px 0 2px;color:var(--rubric);text-shadow:1.4px 1.4px 0 rgba(176,138,46,.65)}
.clay.stone p{color:#ece2c8}
.clay.stone p:first-of-type::first-letter{color:#e7c66a;text-shadow:1.4px 1.4px 0 rgba(0,0,0,.5)}
/* ====== bouton « Répondre à la question » mis en évidence ====== */
.swapbtn.primo{display:flex;align-items:center;justify-content:center;margin:16px auto 4px;background:var(--rubric);color:#f6e7d8;border:1px solid #7d2c20;text-decoration:none;font-style:normal;font-family:"IM Fell English SC",serif;font-size:13.5px;letter-spacing:.06em;padding:10px 22px;border-radius:4px;cursor:pointer;animation:primopulse 1.7s ease-in-out infinite}
.swapbtn.primo:hover{filter:brightness(1.1)}
@keyframes primopulse{0%,100%{box-shadow:0 2px 6px rgba(60,20,10,.3)}50%{box-shadow:0 2px 16px rgba(156,58,44,.6)}}
/* ====== accueil : feuille de papier à enluminures ====== */
.icard{background:radial-gradient(120% 100% at 50% 0%,#f9f0d8 0%,#f1e3bf 55%,#e1cc9e 100%);border:1px solid #a98d5b;border-radius:2px;padding:16px 44px 22px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.62)}
.icard::before{content:"";position:absolute;inset:10px;border:1.7px solid rgba(176,138,46,.8);pointer-events:none;background-image:radial-gradient(circle,#b08a2e 0 2.4px,rgba(156,58,44,.85) 2.4px 3.4px,transparent 4px),radial-gradient(circle,#b08a2e 0 2.4px,rgba(156,58,44,.85) 2.4px 3.4px,transparent 4px),radial-gradient(circle,#b08a2e 0 2.4px,rgba(156,58,44,.85) 2.4px 3.4px,transparent 4px),radial-gradient(circle,#b08a2e 0 2.4px,rgba(156,58,44,.85) 2.4px 3.4px,transparent 4px);background-size:13px 13px;background-repeat:no-repeat;background-position:-6px -6px,calc(100% + 6px) -6px,-6px calc(100% + 6px),calc(100% + 6px) calc(100% + 6px)}
.icard::after{content:"";position:absolute;inset:14px;border:1px solid rgba(156,58,44,.42);pointer-events:none}
.icard>*{position:relative;z-index:1}
.iwm{color:var(--ink)}
.iwm::first-letter{color:var(--rubric);text-shadow:1.6px 1.6px 0 rgba(176,138,46,.65)}
.ihook{font-style:normal;text-align:justify;text-align-last:center}
.ihook::first-letter{font-family:"IM Fell English SC",serif;font-size:38px;line-height:.85;float:left;padding:3px 7px 0 0;color:var(--rubric);text-shadow:1.3px 1.3px 0 rgba(176,138,46,.6)}
.ibanner svg{border:1px solid rgba(176,138,46,.55);border-radius:2px;background:rgba(255,251,238,.35)}
.hcard{border:1px solid rgba(176,138,46,.5);border-top:2.5px solid rgba(156,58,44,.55);background:rgba(255,251,238,.5)}
.ireal{border-color:rgba(176,138,46,.6)}
/* ====== les boutons du bandeau restent sous la feuille et les voiles ====== */
.soundtgl,.lexbtn{z-index:29}
"""
html = rep(html, "</style>", css + "</style>", "CSS combat")

# ---- 9. lisibilité : plancher de 12 px, même échelle que le moteur de Lugal ----
ECHELLE = {8.5: 12, 9: 12, 9.5: 12, 10: 12, 10.5: 12.5, 11: 13, 11.5: 13, 12: 13.5, 12.5: 14,
           13: 14, 13.5: 14.5, 14: 15, 14.5: 15.5, 15: 15.5, 15.5: 16, 16: 16.5, 16.5: 17,
           17: 17.5, 17.5: 18}
def grossir(m):
    v = float(m.group(1))
    n = ECHELLE.get(v, 12 if v < 12 else v)
    return "font-size:%gpx" % n
a, b = html.index("<style>"), html.index("</style>")
html = html[:a] + re.sub(r"font-size:\s*([0-9.]+)px", grossir, html[a:b]) + html[b:]

# ---- 10. le pupitre : interface repensée (une chose à la fois) ----
import json
html = rep(html, "</style>", part("pupitre.css").rstrip() + "\n</style>", "CSS pupitre")
MEDIAS = json.loads(part("medias.json"))
uxi = {m["cle"]: {k: m[k] for k in ("f", "l", "c", "k", "a") if m.get(k)} for m in MEDIAS}
js = part("pupitre.js").replace("/*__UX_IMAGES__*/{}", json.dumps(uxi, ensure_ascii=False))
html = rep(html, "\n</script>", "\n" + js.rstrip() + "\n</script>", "JS pupitre")

# ---- 11. le dossier medias/ : script de téléchargement et crédits, tirés du même catalogue ----
ps = ["# telecharger-medias.ps1",
      "# A lancer dans PowerShell, a la racine du depot Virtu :",
      "#   .\\telecharger-medias.ps1",
      "# Depose dans medias/ les images documentaires manquantes (les fichiers deja",
      "# presents sont conserves). Ensuite : git add medias ; git commit ; git push ;",
      "# puis npm test.",
      "# Fichier genere par build.py a partir de parts/medias.json : ne pas modifier a la main.",
      '$ErrorActionPreference = "Stop"',
      'New-Item -ItemType Directory -Force -Path "medias" | Out-Null',
      '$ua = "Virtu-jeu-serieux/1.0 (https://github.com/merciermathieu5/Virtu)"',
      "$n = 0", "",
      "function Recuperer($fichier, $url) {",
      '  $dest = "medias/" + $fichier',
      '  if (Test-Path $dest) { Write-Host ($dest + " : deja present"); return }',
      "  Invoke-WebRequest -Uri $url -OutFile $dest -UserAgent $ua",
      '  Write-Host ($dest + " : telecharge")',
      "  $script:n++",
      "  Start-Sleep -Milliseconds 400",
      "}", ""]
for m in MEDIAS:
    for d in m["dl"]:
        ps.append(f'Recuperer "{d["f"]}" "{d["url"]}"')
ps += ["", 'Write-Host ""',
       'Write-Host ("Termine : " + $n + " nouvelle(s) image(s) dans medias/. Lance maintenant : npm test")', ""]
io.open("telecharger-medias.ps1", "w", encoding="utf-8-sig", newline="\r\n").write("\n".join(ps))
cr = ["# Crédits des images documentaires", "",
      "Images affichées sous « La trace réelle » dans les sources du jeu. Ce fichier est généré par",
      "`build.py` à partir de `parts/medias.json`. Les fichiers sont téléchargés par",
      "`telecharger-medias.ps1`.", "",
      "| Fichier | Source dans le jeu | Œuvre, auteur | Licence | Provenance |",
      "|---|---|---|---|---|"]
for m in MEDIAS:
    for d in m["dl"]:
        prov = ("Wikimedia Commons : " + d["commons"]) if d.get("commons") else ("muniverssocial.ca (fiche 07)")
        cr.append(f'| `{d["f"]}` | {m["cle"]} | {d["auteur"]} | {d["licence"]} | {prov} |')
cr += ["", "Les images sous licence CC BY-SA restent sous cette licence ; les autres sont dans le domaine public ou sous CC0.", ""]
import os
os.makedirs("medias", exist_ok=True)
io.open("medias/CREDITS.md", "w", encoding="utf-8").write("\n".join(cr))

io.open(OUT, "w", encoding="utf-8").write(html)
if errors:
    print("ERREURS :")
    for e in errors:
        print(" - " + e)
    sys.exit(1)
print(f"OK · {OUT} écrit ({len(html)} octets) · {len(NODES)} sections, §1 = atelier")
