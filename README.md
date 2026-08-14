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
- 19 sources à étudier (6 illustrations SVG originales, 13 documents composés
  étiquetés), chacune verrouillée par une question de vérification
- 5 affrontements sans violence aux dés (2d6 opposés, règle du doublé fatal,
  aides et entraves selon les sceaux gagnés) : concours, cargaison, disputatio,
  saisie de la censure, tribunal du Saint-Office
- 12 fins (4 triomphes, 3 médianes, 5 funestes), galerie et distinctions
  persistantes, lexique de 22 entrées couvrant les 8 concepts prescrits

## Fichiers
- `index.html` : le jeu complet (à déposer tel quel sur GitHub Pages)
- `ambiance.mp3` : trame sonore Renaissance fournie (« Renaissance Echo » de
  Vifotofreesounds, Pixabay, boucle activée par le bouton du bandeau) ; à
  déposer à côté de index.html
- `build.py` + `parts/` + `lugal-source.html` : la chaîne d'assemblage
- `test/valide.js` : harnais jsdom (653 vérifications)

## Reconstruire et valider
```
python3 build.py     # réassemble index.html depuis lugal-source.html + parts/
npm install          # jsdom
npm test             # intégrité des données, Monte-Carlo des combats, smoke DOM
```

## Équilibre des affrontements (Monte-Carlo, 1600 parties)
Avec l'aptitude investie à 10 : concours 74 %, cargaison 84 %, disputatio 74 %,
censure 84 %, tribunal 73 %. Avec une aptitude négligée à 7 : 11 à 30 %.
Les sceaux d'aide ajoutent +1 par objet ou protection pertinente ; au tribunal,
certains sceaux compromettants arment plutôt l'adversaire.
