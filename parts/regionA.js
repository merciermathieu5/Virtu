const ICO_RENOM=`<svg viewBox="0 0 20 20" fill="none" stroke="#5f421e" stroke-width="1.4"><path d="M10 3q-6 2-6 8 0 4 6 6 6-2 6-6 0-6-6-8z"/><path d="M7 9q1.5 3 3 4 1.5-1 3-4" stroke-width="1.1"/></svg>`;
const ICO_FLORIN=`<svg viewBox="0 0 20 20" fill="none" stroke="#5f421e" stroke-width="1.4"><circle cx="10" cy="10" r="6.5"/><path d="M10 6.5v7M7.6 8.2h4.8M7.6 11.8h4.8" stroke-width="1.1"/></svg>`;
const ICO_EGLISE=`<svg viewBox="0 0 20 20" fill="none" stroke="#5f421e" stroke-width="1.4"><path d="M4 16v-5q6-6 12 0v5"/><path d="M4 16h12M10 5V2M8.6 3.4h2.8" stroke-width="1.1"/></svg>`;
const QUALITES=["eloquence","adresse","erudition","virtu"];
const METRES=["renommee","florins","eglise"];
const METRES_X=[];
const ICO_MET={renommee:ICO_RENOM,florins:ICO_FLORIN,eglise:ICO_EGLISE};
const UNLOCK_MSG={};
const LAB={eloquence:"Éloquence",adresse:"Adresse",erudition:"Érudition",virtu:"Virtù",renommee:"Renommée",florins:"Florins",eglise:"Faveur de l'Église"};
const QDESC={
 eloquence:"L'art de convaincre par la parole : les joutes, les disputes savantes et les tribunaux se gagnent avec elle.",
 adresse:"L'habileté de la main et du corps : l'atelier, la presse et les ruelles la mettront à l'épreuve.",
 erudition:"Les langues anciennes, les textes et les sciences : elle arme ton esprit critique et te vaut l'Inspiration des Muses.",
 virtu:"L'audace de saisir la Fortune quand elle passe : oser ce que les autres ne tentent pas."};
const SCEAUX_ORDRE=["Perspective maîtrisée","Anatomiste de l'ombre","Protégé d'un mécène","Esprit libre","Lauréat du concours","Compagnon d'imprimerie","Outremer livré","Ami des humanistes","Presse clandestine","Délateur","Liberté d'examen","Indulgence achetée","Voix critique","Diffuseur des thèses","Défenseur de Rome","Vainqueur de la dispute","Tirage sauvé","Commande du cardinal","Lecteur de Copernic","Philologue","Vérité publiée","Preuve enterrée","Silence acheté","Blanchi par le tribunal","Abjuration","Persistant","Serviteur de la Contre-Réforme","Passage en France","Carnet de croquis","Casse de caractères","Grammaire grecque"];
const BASE=6, POOL=16, MAXADD=10;   // chaque qualité : 6 à 16
let F=null;
const nouvelle=()=>({nom:"Andrea",genre:"apprenti",metier:"artiste",eloquence:0,adresse:0,erudition:0,virtu:0,renommee:1,florins:4,eglise:6,sceaux:new Set(),registre:[],histoire:[],journal:[],feuillet:0,noeud:"atelier",faveurs:0,faveursMax:0,_echecs:0,_combats:0,_combatsWin:0,_srcTotal:0,_srcSeen:0,_quizTotal:0,_quizFirst:0});
