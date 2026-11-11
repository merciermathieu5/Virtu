# telecharger-medias.ps1
# A lancer dans PowerShell, a la racine du depot Virtu :
#   .\telecharger-medias.ps1
# Depose dans medias/ les images documentaires manquantes (les fichiers deja
# presents sont conserves). Ensuite : git add medias ; git commit ; git push ;
# puis npm test.
# Fichier genere par build.py a partir de parts/medias.json : ne pas modifier a la main.
$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path "medias" | Out-Null
$ua = "Virtu-jeu-serieux/1.0 (https://github.com/merciermathieu5/Virtu)"
$n = 0

function Recuperer($fichier, $url) {
  $dest = "medias/" + $fichier
  if (Test-Path $dest) { Write-Host ($dest + " : deja present"); return }
  Invoke-WebRequest -Uri $url -OutFile $dest -UserAgent $ua
  Write-Host ($dest + " : telecharge")
  $script:n++
  Start-Sleep -Milliseconds 400
}

Recuperer "bapteme-verrocchio.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Verrocchio%2C_Leonardo_da_Vinci_-_Battesimo_di_Cristo_-_Google_Art_Project.jpg/960px-Verrocchio%2C_Leonardo_da_Vinci_-_Battesimo_di_Cristo_-_Google_Art_Project.jpg"
Recuperer "perugin-cles.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Entrega_de_las_llaves_a_San_Pedro_%28Perugino%29.jpg/960px-Entrega_de_las_llaves_a_San_Pedro_%28Perugino%29.jpg"
Recuperer "laurent-magnifique.jpg" "https://muniverssocial.ca/medias/07-vision-de-lhomme/laurent-magnifique.jpg"
Recuperer "concours-ghiberti.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Lorenzo_ghiberti%2C_sacrificio_di_isacco%2C_1401%2C_01.jpg/500px-Lorenzo_ghiberti%2C_sacrificio_di_isacco%2C_1401%2C_01.jpg"
Recuperer "concours-brunelleschi.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Filippo_brunelleschi%2C_sacrificio_di_isacco%2C_1401%2C_01.jpg/500px-Filippo_brunelleschi%2C_sacrificio_di_isacco%2C_1401%2C_01.jpg"
Recuperer "imprimerie-amman.png" "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Buchdrucker-1568.png/500px-Buchdrucker-1568.png"
Recuperer "virgile-alde-1501.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Page_from_the_edition_of_Virgil_printed_by_Aldus_Manutius_in_1501.jpg/500px-Page_from_the_edition_of_Virgil_printed_by_Aldus_Manutius_in_1501.jpg"
Recuperer "lapis-lazuli.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Lapis-lazuli_hg.jpg/500px-Lapis-lazuli_hg.jpg"
Recuperer "titien-bacchus-ariane.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Titian_-_Bacchus_and_Ariadne_-_Google_Art_Project.jpg/500px-Titian_-_Bacchus_and_Ariadne_-_Google_Art_Project.jpg"
Recuperer "erasme.jpg" "https://muniverssocial.ca/medias/07-vision-de-lhomme/erasme.jpg"
Recuperer "holbein-folie.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Folly_Steps_Down_from_the_Pulpit%2C_marginal_drawing_by_Hans_Holbein_the_Younger.jpg/960px-Folly_Steps_Down_from_the_Pulpit%2C_marginal_drawing_by_Hans_Holbein_the_Younger.jpg"
Recuperer "lettre-indulgence-1517.png" "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Letter_of_indulgence.png/960px-Letter_of_indulgence.png"
Recuperer "theses-1517.png" "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Luther_95_Thesen.png/500px-Luther_95_Thesen.png"
Recuperer "disputatio-leipzig-1519.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Disputatio_1519.jpg/500px-Disputatio_1519.jpg"
Recuperer "luther-worms.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Luther-in-Worms-auf-Rt.jpg/500px-Luther-in-Worms-auf-Rt.jpg"
Recuperer "siege-rome-1527.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Bestorming_van_Rome%2C_1527_Overwinningen_van_Karel_V_%28serietitel%29_Divi_Caroli._V._imp._opt._max._victoriae%2C_ex_multis_praecipuae_%28serietitel%29%2C_RP-P-BI-6604.jpg/960px-Bestorming_van_Rome%2C_1527_Overwinningen_van_Karel_V_%28serietitel%29_Divi_Caroli._V._imp._opt._max._victoriae%2C_ex_multis_praecipuae_%28serietitel%29%2C_RP-P-BI-6604.jpg"
Recuperer "chantier-saint-pierre.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Heemskerck_Construction_of_St_Peters.jpg/960px-Heemskerck_Construction_of_St_Peters.jpg"
Recuperer "velho-geocentrisme.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Bartolomeu_Velho_1568.jpg/500px-Bartolomeu_Velho_1568.jpg"
Recuperer "copernic-heliocentrisme.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Copernican_heliocentrism_diagram-2.jpg/500px-Copernican_heliocentrism_diagram-2.jpg"
Recuperer "donation-constantin.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Unknown_painter_-_The_Donation_of_Constantine_-_WGA23883.jpg/960px-Unknown_painter_-_The_Donation_of_Constantine_-_WGA23883.jpg"
Recuperer "valla-herodote.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Herodotus%2C_Histories%2C_with_marginalia_by_Lorenzo_Valla%2C_Vat._gr._122%2C_fol._41r_und_122r.jpg/960px-Herodotus%2C_Histories%2C_with_marginalia_by_Lorenzo_Valla%2C_Vat._gr._122%2C_fol._41r_und_122r.jpg"
Recuperer "inquisition.jpg" "https://muniverssocial.ca/medias/07-vision-de-lhomme/inquisition.jpg"
Recuperer "concile-trente.jpg" "https://muniverssocial.ca/medias/07-vision-de-lhomme/concile-trente.jpg"

Write-Host ""
Write-Host ("Termine : " + $n + " nouvelle(s) image(s) dans medias/. Lance maintenant : npm test")
