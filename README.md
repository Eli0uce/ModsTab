<div align="center">

# ModsTab

### Votre Discord. Votre univers.

Un catalogue de créations. Une bibliothèque à vous. Des Originals intégrés.<br>
Le tout, directement dans Discord.

[![Release](https://img.shields.io/github/v/release/Eli0uce/ModsTab?style=flat-square&color=a6a3ff)](https://github.com/Eli0uce/ModsTab/releases/latest)
[![Checks](https://github.com/Eli0uce/ModsTab/actions/workflows/ci.yml/badge.svg)](https://github.com/Eli0uce/ModsTab/actions/workflows/ci.yml)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-a6a3ff?style=flat-square)](LICENSE)
![Plateformes](https://img.shields.io/badge/Windows%20%2B%20macOS-Discord%20desktop-32374d?style=flat-square)

**[Télécharger pour Windows](https://github.com/Eli0uce/ModsTab/releases/latest/download/ModsTab-Windows.zip)** ·
**[Télécharger pour macOS](https://github.com/Eli0uce/ModsTab/releases/latest/download/ModsTab-macOS.zip)** ·
[Signaler un problème](https://github.com/Eli0uce/ModsTab/issues)

Gratuit. Open source. Sans compte ModsTab.

</div>

---

> **À savoir :** ModsTab est un plugin **BetterDiscord**, pour l’application Discord de bureau. Il n’est affilié ni à Discord, ni à BetterDiscord, ni à Spotify. Modifier le client n’est pas autorisé par les conditions de Discord : utilisez-le à vos risques.

## Un seul onglet, plus de possibilités

ModsTab ajoute **Mods** sous **Quêtes** dans Discord.

| Espace | Ce que vous pouvez faire |
|---|---|
| **Découvrir** | Parcourir le catalogue officiel BetterDiscord, rechercher des plugins et thèmes, filtrer, trier et consulter leurs fiches. |
| **Ma bibliothèque** | Retrouver vos créations installées et les activer ou désactiver sans quitter Discord. |
| **Originals** | Activer les créations intégrées à ModsTab : **Graphite** et **Spotify**. |

Le catalogue est paginé sans limite artificielle de résultats. Les installations demandent confirmation, téléchargent le fichier dans le dossier approprié et tentent de l’activer. Le panneau est responsive, accessible au clavier et respecte la réduction des animations du système.

## Installer en quelques étapes

### Windows

1. [Téléchargez l’archive Windows](https://github.com/Eli0uce/ModsTab/releases/latest/download/ModsTab-Windows.zip).
2. **Extrayez tous les fichiers**, puis lancez `Install-Windows.bat`.
3. Dans Discord, ouvrez **Paramètres utilisateur → Plugins** et activez **ModsTab**.

### macOS

1. [Téléchargez l’archive macOS](https://github.com/Eli0uce/ModsTab/releases/latest/download/ModsTab-macOS.zip).
2. **Décompressez toute l’archive**, puis ouvrez `Install-macOS.command`.
3. Dans Discord, ouvrez **Paramètres utilisateur → Plugins** et activez **ModsTab**.

**Prérequis :** Discord de bureau, [Node.js](https://nodejs.org/) et BetterDiscord. Si Node.js manque, le lanceur Windows propose winget ; sur macOS, il utilise Homebrew s’il est disponible, sinon indique comment installer Node.js. Si BetterDiscord manque, l’installeur tente de l’installer avec son CLI : **Discord peut être fermé et relancé**.

Les lanceurs ne sont pas signés/notariés. Sur macOS, si le système bloque le fichier, consultez **Réglages Système → Confidentialité et sécurité** et n’autorisez son ouverture qu’après avoir vérifié sa provenance. Vous pouvez aussi exécuter `bash Install-macOS.command` dans le dossier extrait.

### BetterDiscord est déjà installé ?

Téléchargez seulement [ModsTab.plugin.js](https://github.com/Eli0uce/ModsTab/releases/latest/download/ModsTab.plugin.js) et placez-le dans le dossier de plugins :

| Système | Dossier |
|---|---|
| Windows | `%AppData%\BetterDiscord\plugins` |
| macOS | `~/Library/Application Support/BetterDiscord/plugins` |

Activez ensuite ModsTab dans **Paramètres → Plugins**. Pour PTB ou Canary, lancez l’installeur avec `--channel=ptb` ou `--channel=canary`.

## Les ModsTab Originals

### Graphite — moins de bruit, plus de Discord

Un habillage nocturne aux noirs doux, gris neutres et accents bleu ardoise. **Pas de filtre global** : avatars, vidéos, images, GIF, émojis, rôles et alertes gardent leurs couleurs utiles.

Activez-le dans **Originals → Thèmes**. Il est désactivé par défaut, fonctionne sans téléchargement ni police distante et mémorise votre choix. Le désactiver restaure votre apparence précédente sans toucher aux autres thèmes. Plusieurs thèmes peuvent rester actifs ; désactivez les concurrents s’ils entrent en conflit.

### Spotify — votre musique, là où vous discutez

Une fois activé et connecté, le lecteur reste **en bas à droite de Discord**, même lorsque ModsTab est fermé. Réduisez-le avec **Réduire** ou **Échap**, puis retrouvez-le avec **Ouvrir**. Il revient au démarrage tant que Spotify reste activé et connecté.

| Fonction | Disponibilité |
|---|---|
| Titre, pochette, progression, recherche et copie du lien | Selon l’accès autorisé par Spotify |
| Mentions J’aime | Selon les permissions de bibliothèque |
| Lecture/pause, précédent/suivant, position, volume, aléatoire, répétition | Spotify Premium et appareil compatible |
| Consultation et ajout à la file d’attente | Spotify Premium et accès API autorisé |

**Connexion, une seule fois :**

1. Créez une application sur le [dashboard Spotify](https://developer.spotify.com/dashboard).
2. Enregistrez exactement `http://127.0.0.1:8898/callback` comme URI de redirection (ou le port choisi dans ModsTab).
3. Dans **Originals → Plugins → Spotify**, activez le plugin, entrez le **Client ID** et cliquez sur **Se connecter à Spotify**.
4. Autorisez l’application dans votre navigateur. Si la page finale affiche `ERR_CONNECTION_REFUSED`, c’est le mode manuel : copiez **l’URL complète** de cette page dans le champ **Adresse de redirection** du plugin, puis validez. Ne partagez pas cette URL.

Aucun client secret n’est demandé : l’authentification utilise **OAuth PKCE**. Le plugin pilote Spotify sur un appareil ; il ne diffuse pas d’audio et ne remplace pas l’application Spotify.

**Abonnement et restrictions :** lorsqu’il est fourni, le type de compte vient de Spotify. Pour certaines apps, Spotify ne renvoie plus ce champ : le plugin teste alors une commande conservant l’état de l’aléatoire. Une réponse « Premium requis » désactive les commandes concernées ; une détection impossible reste indiquée comme telle. Les permissions réelles restent imposées par Spotify. Le mode développement limite les utilisateurs autorisés et peut exiger Premium pour le propriétaire : consultez la [documentation actuelle de Spotify](https://developer.spotify.com/documentation/web-api/concepts/quota-modes). Votre propre application et ses utilisateurs doivent être autorisés dans le dashboard.

## Transparence & limites

- Un plugin BetterDiscord s’exécute avec les droits de votre client et peut accéder à votre machine. Vérifiez les créations avant de les installer.
- Le catalogue est chargé depuis l’API officielle BetterDiscord. Thèmes et plugins téléchargés restent des créations tierces.
- Les jetons Spotify sont **stockés en clair** dans les réglages BetterDiscord. **Se déconnecter** efface ceux enregistrés par ModsTab ; vous pouvez aussi révoquer l’accès depuis votre compte Spotify.
- Les modifications de Discord peuvent temporairement casser l’intégration.
- Pas de prise en charge de Vencord, du navigateur ou du mobile. Pas encore de mise à jour/désinstallation des créations depuis ModsTab.
- L’installeur n’a pas été certifié sur toutes les versions de Windows/macOS. Les tests UI simulent BetterDiscord ; ils ne remplacent pas un essai dans le client réel.

## Développer

Le plugin distribué est un fichier autonome, sans dépendance à embarquer. **Node.js 20+** est recommandé pour le développement et les tests navigateur.

```bash
git clone https://github.com/Eli0uce/ModsTab.git
cd ModsTab
npm ci
npx playwright install chromium
npm run check
npm test
npm run test:ui -- --workers=1
```

`plugin/ModsTab.plugin.js` contient le plugin ; `installer/install.js` gère l’installation. `tests/catalog.test.js` couvre la logique du catalogue et les restrictions Spotify ; `tests/ui/` couvre les parcours, le lecteur principal, les erreurs et les petits écrans.

Pour publier : vérifiez les tests, mettez à jour les versions et les notes dans `.github/RELEASE_NOTES.md`, puis poussez un nouveau tag `vX.Y.Z`. Le workflow de release vérifie le projet et produit les archives Windows/macOS, le plugin seul et leurs empreintes SHA-256. Ne remplacez pas un tag déjà publié.

## Contribuer

Un bug ? Ouvrez une [issue](https://github.com/Eli0uce/ModsTab/issues) avec votre système, les versions de Discord/BetterDiscord et les étapes de reproduction. **Ne joignez jamais vos jetons Spotify ni votre URL de retour OAuth.**

Les contributions sont bienvenues. Licence [MIT](LICENSE).
