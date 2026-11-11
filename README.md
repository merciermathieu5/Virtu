# Virtù · un livre dont vous êtes le héros

Jeu sérieux d'histoire pour le 1er cycle du secondaire (HEC), réalité sociale
**Le renouvellement de la vision de l'Homme** (fiche 07). Monofichier vanilla
HTML/CSS/JS, hors ligne, déployable tel quel sur GitHub Pages. Construit sur le
moteur de Lugal, avec un moteur d'affrontements sans violence en plus.

## Le jeu en bref
- 35 sections numérotées et mélangées (graine 1517), §1 = l'atelier
- 4 actes : Florence 1508, Venise, Wittenberg 1517-1521, Rome 1542-1547
- 3 métiers au choix (artiste, imprimeur, humaniste), chacun avec atouts,
  objet signature et options exclusives dans le récit
- 4 qualités (Éloquence, Adresse, Érudition, Virtù), 3 jauges (Renommée,
  Florins, Faveur de l'Église), Inspiration des Muses (relances)
- 19 sources à étudier (6 images d'époque, 13 documents composés étiquetés),
  chacune verrouillée par une question de vérification et accompagnée de sa
  « trace réelle » : une photo documentaire (tableau, gravure, imprimé,
  manuscrit) tirée de muniverssocial.ca ou de Wikimedia Commons
- 5 affrontements sans violence aux dés (2d6 opposés, règle du doublé fatal,
  aides et entraves selon les sceaux gagnés) : concours, cargaison, disputatio,
  saisie de la censure, tribunal du Saint-Office
- 12 fins (4 triomphes, 3 médianes, 5 funestes), galerie et distinctions
  persistantes, lexique de 22 entrées couvrant les 8 concepts prescrits

## L'interface : le pupitre, une chose à la fois
Pensée pour des élèves de 12-13 ans, même organisation que Lugal, aux couleurs
de Virtù (parchemin enluminé, sanguine et or) :
- deux onglets au centre, « 1 L'histoire » puis « 2 Ta décision », une seule
  section du récit par page, jamais de défilement
- la frise des actes dans la marge de gauche, le coin des dés dans la marge de
  droite (règle repliable, affrontements compacts)
- un tableau de bord en bas : qualités, jauges, Inspiration des Muses, revers
  de la Fortune et accès à la feuille du personnage
- accueil, création du personnage et verdict final repensés ; aucun texte sous
  12 px ; vérifié sans débordement à 1536×695, 1366×625 et 1280×600

## Fichiers
- `index.html` : le jeu complet (à déposer tel quel sur GitHub Pages)
- `medias/` : les photos documentaires et leurs crédits (`medias/CREDITS.md`)
- `telecharger-medias.ps1` : dépose dans `medias/` les photos manquantes
  (PowerShell, à la racine du dépôt), puis `git add medias`
- `ambiance.mp3` : trame sonore Renaissance fournie (« Renaissance Echo » de
  Vifotofreesounds, Pixabay, boucle activée par le bouton du bandeau) ; à
  déposer à côté de index.html
- `build.py` + `parts/` + `lugal-source.html` : la chaîne d'assemblage ;
  `parts/pupitre.css` et `parts/pupitre.js` portent l'interface,
  `parts/medias.json` le catalogue des photos (légendes, crédits, adresses)
- `test/valide.js` : harnais jsdom (859 vérifications)

## Reconstruire et valider
```
python3 build.py     # réassemble index.html, telecharger-medias.ps1 et medias/CREDITS.md
npm install          # jsdom
npm test             # intégrité des données, Monte-Carlo des combats, smoke DOM
```

## Équilibre des affrontements (Monte-Carlo, 1600 parties)
Avec l'aptitude investie à 10 : concours 74 %, cargaison 84 %, disputatio 74 %,
censure 84 %, tribunal 73 %. Avec une aptitude négligée à 7 : 11 à 30 %.
Les sceaux d'aide ajoutent +1 par objet ou protection pertinente ; au tribunal,
certains sceaux compromettants arment plutôt l'adversaire.
