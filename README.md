# ModsTab · Le site

Le site vitrine de [ModsTab](https://github.com/Eli0uce/ModsTab) : une page statique, responsive et animée, sans dépendance ni outil de compilation.

**HTML sémantique · CSS natif · JavaScript léger**

## Prévisualiser

Depuis ce dossier :

```bash
python3 -m http.server 4178 --bind 127.0.0.1
```

Ouvrez <http://127.0.0.1:4178>. Vous pouvez aussi ouvrir `index.html` directement.

## Contenu

- Présentation du catalogue, de la bibliothèque et des Originals.
- Illustrations interactives : onglets, aperçu Graphite et animation du lecteur Spotify (sans audio).
- Téléchargements Windows et macOS depuis la dernière release GitHub.
- Instructions d’installation, FAQ et limites du projet.
- Respect du réglage de réduction des mouvements, navigation clavier et liens d’évitement.

Les aperçus sont des illustrations, pas une connexion à Discord ou Spotify. Aucun compte, formulaire, cookie publicitaire ou outil de suivi n’est intégré.

## Héberger

En ligne : **https://lab.studio-karasu.nc/ModsTab/** (VPS nginx, fichiers dans `/var/www/modstab`, bloc `location ^~ /ModsTab/` dans `lab.studio-karasu.nc.conf` avec les mêmes en-têtes de sécurité que `netlify.toml`).

Mettre à jour :

```bash
rsync -az --delete index.html styles.css app.js favicon.svg LICENSE root@107.191.56.224:/var/www/modstab/
```

Publiez sinon le contenu du dossier sur n'importe quel hébergeur statique. Aucun build requis. `netlify.toml` fournit la configuration et les en-têtes HTTP pour Netlify.

Les sources du site sont dans la branche **website** du dépôt ; le plugin et les workflows restent sur **main**. Pour une intégration Git Netlify, choisissez `website`, sans commande de build, avec `.` comme dossier à publier.

## Mettre à jour

Les téléchargements utilisent `/releases/latest/download/` : ils suivent automatiquement les nouvelles releases, à condition de conserver les noms `ModsTab-Windows.zip`, `ModsTab-macOS.zip` et `ModsTab.plugin.js`.

La pastille de version et l’annonce dans `index.html` doivent être mises à jour à chaque release. Les styles sont dans `styles.css`, les interactions dans `app.js`.

Licence [MIT](LICENSE). Non affilié à Discord, BetterDiscord ou Spotify.
