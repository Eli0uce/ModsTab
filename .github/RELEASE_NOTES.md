## Votre Discord. Votre univers.

Première version publique de **ModsTab**, gratuit et open source.

- **Découvrir** : catalogue officiel BetterDiscord, plugins et thèmes, recherche, filtres, tri et fiches détaillées.
- **Ma bibliothèque** : installation et activation des créations depuis Discord.
- **Graphite** : thème Original inclus, facultatif, sans filtre sur vos médias.
- **Spotify** : lecteur directement dans Discord, avec recherche, favoris et file d’attente ; contrôles adaptés aux permissions du compte.
- Interface en français, navigation clavier et animations respectant la réduction des mouvements.

### Télécharger

| Système | Archive | Lanceur |
|---|---|---|
| Windows | `ModsTab-Windows.zip` | `Install-Windows.bat` |
| macOS | `ModsTab-macOS.zip` | `Install-macOS.command` |
| Les deux | `ModsTab.zip` | Lanceur de votre système |

Décompressez **toute l’archive** avant de lancer l’installation. Discord de bureau et Node.js sont requis ; le lanceur propose une installation de Node.js via winget (Windows) ou Homebrew si disponible (macOS). BetterDiscord est nécessaire ; l’installeur tente de l’installer s’il est absent. Il peut fermer et relancer Discord.

BetterDiscord déjà installé ? Téléchargez `ModsTab.plugin.js` et placez-le dans votre dossier de plugins BetterDiscord.

### Spotify

Créez votre propre application dans le [dashboard Spotify](https://developer.spotify.com/dashboard), enregistrez `http://127.0.0.1:8898/callback` puis saisissez le Client ID dans Originals. Aucun client secret nécessaire. Si le navigateur refuse la connexion locale après autorisation, collez son URL complète dans le champ du plugin.

Spotify doit être ouvert sur un appareil. Premium est nécessaire aux commandes de lecture ; l’accès à l’API dépend aussi des restrictions de votre application Spotify. Les jetons sont conservés en clair dans les réglages BetterDiscord.

**Attention :** ModsTab n’est affilié ni à Discord, ni à BetterDiscord, ni à Spotify. Les modifications du client ne sont pas autorisées par les conditions de Discord. Les archives ne sont ni des exécutables signés ni des installateurs notariés.
