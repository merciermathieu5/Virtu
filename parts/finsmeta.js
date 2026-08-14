const KFINS="virtu.fins",KTITRES="virtu.titres",KVIES="virtu.vies";
const TRIOMPHES=["nF_maitre","nF_humaniste","nF_presse","nF_france"];
const FINS_ORDRE=["nF_maitre","nF_humaniste","nF_presse","nF_france","nF_concile","nF_abjure","nF_ombre","nF_oubli","nF_misere","nF_fortune","nF_prison","nF_bucher"];
const FIN_INDICE={
 nF_maitre:"Une main que les siècles retiendront.",
 nF_humaniste:"Un nom dans la grande république des lettres.",
 nF_presse:"Une encre qui a conquis l'Europe entière.",
 nF_france:"Un accueil royal au nord des Alpes.",
 nF_concile:"Un talent mis au service de la reconquête catholique.",
 nF_abjure:"Une vie sauvée au prix de la parole.",
 nF_ombre:"Une vie honnête que l'histoire n'a pas retenue.",
 nF_oubli:"Un nom que personne n'a songé à inscrire.",
 nF_misere:"Un talent que les florins ont abandonné.",
 nF_fortune:"Une roue qui élève les mortels et les précipite.",
 nF_prison:"Des murs épais dans la Rome du soupçon.",
 nF_bucher:"Le prix du feu pour qui refuse de plier."};
const TITRES=[
 {id:"virtuose",nom:"La Virtù accomplie",crit:"Atteindre l'une des quatre grandes fins de triomphe.",test:(F,c)=>TRIOMPHES.includes(c.fin)},
 {id:"philologue",nom:"Le Philologue",crit:"Démasquer le faux manuscrit par la méthode de Valla.",test:(F)=>F.sceaux.has("Philologue")},
 {id:"critique",nom:"L'Esprit critique",crit:"Publier la vérité sur le manuscrit, quoi qu'il en coûte.",test:(F)=>F.sceaux.has("Vérité publiée")},
 {id:"invaincu",nom:"L'Invaincu des lices",crit:"Remporter trois affrontements dans une même vie.",test:(F)=>(F._combatsWin||0)>=3},
 {id:"muses",nom:"L'Ami des Muses",crit:"Finir une vie sans dépenser une seule Inspiration.",test:(F)=>F.faveursMax>0&&F.faveurs===F.faveursMax},
 {id:"sage_sources",nom:"Le Sage des sources",crit:"Consulter chaque source proposée durant une vie.",test:(F)=>(F._srcTotal||0)>=5&&(F._srcSeen||0)>=(F._srcTotal||0)},
 {id:"oeil",nom:"L'Oeil du correcteur",crit:"Répondre juste du premier coup à 5 vérifications de lecture dans une même vie.",test:(F)=>(F._quizFirst||0)>=5},
 {id:"prudent",nom:"Le Prudent",crit:"Traverser au moins 10 décisions sans aucune décision périlleuse.",test:(F)=>F.histoire.length>=10&&!(F.journal||[]).some(d=>d.juge==="risque")},
 {id:"troisvies",nom:"Les Trois Métiers",crit:"Mener une vie à son terme avec chacun des trois métiers.",test:(F,c)=>c.viesCount>=3},
 {id:"explorateur",nom:"L'Explorateur des destins",crit:"Découvrir au moins 6 des 12 fins.",test:(F,c)=>c.finsCount>=6}];
