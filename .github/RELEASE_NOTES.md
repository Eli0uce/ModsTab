## Votre Discord. Votre univers.

**ModsTab 0.2.0** : créez vos propres thèmes et utilisez les nouveaux lanceurs natifs.

- **Créer** : composez un thème Discord sans CSS, avec aperçu en direct, brouillon local et export direct vers BetterDiscord.
- Les thèmes créés refusent les noms vides ou déjà utilisés et valident couleurs, polices et réglages avant export.
- Le lecteur Spotify se positionne au-dessus du panneau utilisateur Discord et s’adapte à sa taille.
- **Windows** : lanceur natif `.exe` non signé (SmartScreen peut afficher un avertissement).
- **macOS** : app universelle Intel/Apple Silicon, non signée et non notariée (Gatekeeper peut la bloquer).
- Les archives ZIP historiques et le plugin `.js` autonome restent disponibles.

- **Découvrir** : catalogue officiel BetterDiscord, plugins et thèmes, recherche, filtres, tri et fiches détaillées.
- **Ma bibliothèque** : installation et activation des créations depuis Discord.
- **Graphite** : thème Original inclus, facultatif, sans filtre sur vos médias.
- **Spotify** : lecteur directement dans Discord, avec recherche, favoris et file d’attente ; contrôles adaptés aux permissions du compte.
- Interface en français, navigation clavier et animations respectant la réduction des mouvements.

### Télécharger

| Système | Livrable | Signature |
|---|---|---|
| Windows | `ModsTab-Setup.exe` | Non signé |
| macOS | `ModsTab-macOS.dmg` | App non signée |
| Les deux | `ModsTab.zip` | Scripts historiques non signés |

Lancez l’installeur natif correspondant à votre système. Discord de bureau et Node.js sont requis ; le lanceur propose une installation de Node.js via winget (Windows) ou Homebrew si disponible (macOS). BetterDiscord est nécessaire ; l’installeur tente de l’installer s’il est absent. Il peut fermer et relancer Discord.

BetterDiscord déjà installé ? Téléchargez `ModsTab.plugin.js` et placez-le dans votre dossier de plugins BetterDiscord.

### Spotify

Créez votre propre application dans le [dashboard Spotify](https://developer.spotify.com/dashboard), enregistrez `http://127.0.0.1:8898/callback` puis saisissez le Client ID dans Originals. Aucun client secret nécessaire. Si le navigateur refuse la connexion locale après autorisation, collez son URL complète dans le champ du plugin.

Spotify doit être ouvert sur un appareil. Premium est nécessaire aux commandes de lecture ; l’accès à l’API dépend aussi des restrictions de votre application Spotify. Les jetons sont conservés en clair dans les réglages BetterDiscord.

**Attention :** ModsTab n’est affilié ni à Discord, ni à BetterDiscord, ni à Spotify. Les modifications du client ne sont pas autorisées par les conditions de Discord. Les lanceurs natifs ne sont ni signés ni notariés ; le plugin JavaScript et les scripts contenus dans les archives sont également non signés.
