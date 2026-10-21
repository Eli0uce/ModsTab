/**
 * @name ModsTab
 * @author Eli0uce
 * @description Ajoute un onglet "Mods" sous "Quêtes" : découvrir, installer et gérer les plugins et thèmes BetterDiscord.
 * @version 0.1.0
 * @source https://github.com/Eli0uce/ModsTab
 */

const STORE_API = "https://api.betterdiscord.app/v3/store/addons";
const downloadUrl = (id) => `https://betterdiscord.app/Download?id=${id}`;

const TAB_ATTR = "data-modstab";
const PANEL_ID = "modstab-panel";
const STYLE_ID = "modstab-style";
const THEME_ATTR = "data-modstab-theme";
const PAGE_SIZE = 18;
const TAG_LABELS = {
    activity: "Activité", channels: "Salons", chat: "Discussion", developers: "Développement",
    edit: "Édition", emotes: "Émojis", enhancement: "Améliorations", friends: "Amis",
    fun: "Divertissement", game: "Jeux", library: "Bibliothèques", members: "Membres",
    notifications: "Notifications", organization: "Organisation", roles: "Rôles", search: "Recherche",
    security: "Sécurité", servers: "Serveurs", shortcut: "Raccourcis", status: "Statut",
    text: "Texte", utility: "Utilitaires", voice: "Vocal",
    flat: "Plat", transparent: "Transparent", layout: "Disposition", customizable: "Personnalisable",
    fiction: "Fiction", nature: "Nature", space: "Espace", minimal: "Minimaliste",
    anime: "Anime", gaming: "Jeux", dark: "Sombre", light: "Clair", abstract: "Abstrait",
    red: "Rouge", orange: "Orange", green: "Vert", blue: "Bleu", purple: "Violet",
    black: "Noir", white: "Blanc", aqua: "Turquoise", yellow: "Jaune",
    "high-contrast": "Contraste élevé", other: "Autres",
};
const numberFormat = new Intl.NumberFormat("fr-FR");
const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

const ICON_PATH =
    "M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z";

const CSS = `
#${PANEL_ID}{--mt-bg:#10121b;--mt-surface:#1b1e2d;--mt-border:#32374d;--mt-text:#f2f3fc;--mt-muted:#b0b7d0;--mt-accent:#a6a3ff;
  position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(5,7,15,.82);backdrop-filter:blur(8px);animation:mt-fade .18s ease-out}
#${PANEL_ID},#${PANEL_ID} *{box-sizing:border-box}
#${PANEL_ID}[hidden],#${PANEL_ID} [hidden]{display:none!important}
#${PANEL_ID} .mt-win{width:min(1180px,100%);height:min(900px,calc(100vh - 48px));height:min(900px,calc(100dvh - 48px));display:flex;flex-direction:column;
  border:1px solid var(--mt-border);border-radius:20px;overflow:hidden;background:var(--mt-bg);color:var(--mt-text);font-family:var(--font-primary,system-ui,sans-serif);
  box-shadow:0 28px 100px #0008;animation:mt-rise .25s ease-out;color-scheme:dark;font-size:14px;line-height:1.5}
#${PANEL_ID} :is(h2,h3,p){margin:0}
#${PANEL_ID} button,#${PANEL_ID} input,#${PANEL_ID} select{font:inherit}
#${PANEL_ID} button{cursor:pointer}
#${PANEL_ID} button:disabled{cursor:not-allowed;opacity:.55}
#${PANEL_ID} :is(button,input,select,a,[tabindex]):focus-visible{outline:2px solid var(--mt-accent);outline-offset:4px}
#${PANEL_ID} a{color:var(--mt-accent);text-decoration:none}
#${PANEL_ID} a:hover{text-decoration:underline}
#${PANEL_ID} .mt-head{display:flex;align-items:center;gap:24px;padding:18px 28px;border-bottom:1px solid var(--mt-border);flex-shrink:0}
#${PANEL_ID} .mt-brand{display:flex;align-items:center;gap:10px}
#${PANEL_ID} .mt-brand h2{font-size:19px;letter-spacing:-.6px}
#${PANEL_ID} .mt-brand-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;color:white;background:linear-gradient(140deg,#7b5af0,#4859c9)}
#${PANEL_ID} .mt-icon{width:20px;height:20px;flex-shrink:0}
#${PANEL_ID} .mt-tabs{display:flex;gap:4px;margin-right:auto;padding:4px;background:#ffffff06;border:1px solid var(--mt-border);border-radius:12px}
#${PANEL_ID} .mt-tab{border:0;border-radius:8px;padding:8px 14px;background:transparent;color:var(--mt-muted);transition:color .15s,background .15s}
#${PANEL_ID} .mt-tab.on{background:#37334f;color:white;box-shadow:0 2px 6px #0003}
#${PANEL_ID} .mt-count{display:inline-block;margin-left:8px;font-size:11px;padding:1px 6px;border-radius:5px;background:#ffffff12}
#${PANEL_ID} .mt-close{display:grid;place-items:center;width:36px;height:36px;flex-shrink:0;border:1px solid var(--mt-border);border-radius:10px;color:var(--mt-muted);background:transparent}
#${PANEL_ID} .mt-close:hover{color:white;background:var(--mt-surface)}
#${PANEL_ID} .mt-scroll{overflow-y:auto;min-height:0;flex:1;scrollbar-color:#454b66 transparent;scrollbar-width:thin}
#${PANEL_ID} .mt-hero{position:relative;isolation:isolate;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:22px 28px;margin:20px 28px;
  background:radial-gradient(ellipse at 95% 10%,#6652bb70,transparent 65%),linear-gradient(120deg,#26253d,#191d32);border:1px solid #555080;border-radius:16px}
#${PANEL_ID} .mt-eyebrow{color:#c7bfff;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
#${PANEL_ID} .mt-hero h3{font-size:clamp(26px,2.8vw,34px);font-weight:800;letter-spacing:-1.3px;line-height:1.15;margin:10px 0}
#${PANEL_ID} .mt-hero h3 span{color:#bcb0ff}
#${PANEL_ID} .mt-hero p{max-width:540px;color:#c2c7df;line-height:1.6;font-size:13px}
#${PANEL_ID} .mt-hero-meta{display:flex;gap:18px;flex-wrap:wrap;margin-top:16px;font-size:12px;color:#e2dffb}
#${PANEL_ID} .mt-hero-meta span{display:flex;align-items:center;gap:7px}
#${PANEL_ID} .mt-dot{width:6px;height:6px;border-radius:50%;background:#83e4b7;box-shadow:0 0 12px #83e4b750}
#${PANEL_ID} .mt-art{position:relative;display:grid;place-items:center;flex:0 0 210px;height:120px}
#${PANEL_ID} .mt-orbit{position:absolute;width:165px;height:165px;border:1px solid #c8bcff25;border-radius:50%;transform:rotate(-25deg) scaleX(1.3)}
#${PANEL_ID} .mt-orbit:nth-child(2){width:115px;height:115px;transform:rotate(35deg) scaleX(1.5)}
#${PANEL_ID} .mt-art-icon{display:grid;place-items:center;width:86px;height:86px;border-radius:24px;border:1px solid #c5b5ff70;background:linear-gradient(140deg,#aa8aff,#5860cb);
  box-shadow:0 15px 50px #090a2580,inset 0 1px 0 #fff5;transform:rotate(-12deg);animation:mt-float 6s ease-in-out infinite}
#${PANEL_ID} .mt-art-icon .mt-icon{width:42px;height:42px}
#${PANEL_ID} .mt-spark{position:absolute;right:8px;top:15px;font-size:26px;color:#d6c5ff}
#${PANEL_ID} .mt-toolbar{display:grid;grid-template-columns:minmax(180px,1fr) minmax(140px,185px) minmax(140px,185px);gap:12px;padding:0 28px 16px}
#${PANEL_ID} .mt-field{display:flex;flex-direction:column;gap:6px;min-width:0;color:var(--mt-muted);font-size:11px;font-weight:600}
#${PANEL_ID} .mt-input-wrap{position:relative;display:flex;align-items:center}
#${PANEL_ID} .mt-input-wrap .mt-icon{position:absolute;left:13px;color:var(--mt-muted);width:17px;pointer-events:none}
#${PANEL_ID} .mt-search,#${PANEL_ID} .mt-select{width:100%;min-width:0;height:42px;padding:0 12px;border-radius:10px;border:1px solid var(--mt-border);background:var(--mt-surface);color:var(--mt-text);font-size:13px}
#${PANEL_ID} .mt-search{padding-left:40px}
#${PANEL_ID} .mt-search::placeholder{color:var(--mt-muted)}
#${PANEL_ID} .mt-chips{display:flex;gap:8px;flex-wrap:wrap;padding:0 28px 20px}
#${PANEL_ID} .mt-kinds{display:flex;gap:8px;flex-wrap:wrap;padding:0 28px 18px}
#${PANEL_ID} .mt-chip{border:1px solid var(--mt-border);border-radius:20px;background:transparent;color:var(--mt-muted);padding:6px 12px;font-size:12px;transition:background .15s,border-color .15s}
#${PANEL_ID} .mt-chip:hover,#${PANEL_ID} .mt-chip[aria-pressed="true"]{color:#e6e0ff;border-color:#8073c1;background:#a087ff1c}
#${PANEL_ID} .mt-body{padding:0 28px 28px;min-width:0}
#${PANEL_ID} .mt-originals{display:grid;gap:24px;padding-top:24px}
#${PANEL_ID} .mt-originals .mt-theme{margin:0}
#${PANEL_ID} .mt-section-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}
#${PANEL_ID} .mt-section-head h3{font-size:17px;letter-spacing:-.3px}
#${PANEL_ID} .mt-muted{color:var(--mt-muted);font-size:12px}
#${PANEL_ID} .mt-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
#${PANEL_ID} .mt-card{display:flex;flex-direction:column;min-width:0;border:1px solid var(--mt-border);border-radius:14px;overflow:hidden;background:var(--mt-surface);transition:transform .18s,border-color .18s,box-shadow .18s;
  animation:mt-rise .3s ease-out backwards;animation-delay:calc(var(--mt-i,0) * 22ms)}
#${PANEL_ID} .mt-card:hover{transform:translateY(-3px);border-color:#6a628e;box-shadow:0 12px 28px #0003}
#${PANEL_ID} .mt-preview{position:relative;display:grid;place-items:center;width:100%;aspect-ratio:16/7;overflow:hidden;background:radial-gradient(circle at 25% 25%,#b5a0ff30,transparent 60%),linear-gradient(135deg,#292e50,#30223e)}
#${PANEL_ID} .mt-card:nth-child(3n+2) .mt-preview{background:radial-gradient(circle at 75% 20%,#74e8d330,transparent 60%),linear-gradient(135deg,#233a42,#24283f)}
#${PANEL_ID} .mt-card:nth-child(3n+3) .mt-preview{background:radial-gradient(circle at 20% 50%,#ec9bbf30,transparent 60%),linear-gradient(135deg,#3e2945,#292744)}
#${PANEL_ID} .mt-monogram{font-size:46px;letter-spacing:-3px;color:#e1dbff;font-weight:800;opacity:.7;transform:rotate(-8deg)}
#${PANEL_ID} .mt-preview img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .35s}
#${PANEL_ID} .mt-card:hover .mt-preview img{transform:scale(1.035)}
#${PANEL_ID} .mt-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border:1px solid #53586f;border-radius:6px;background:#121623ed;color:#dcdef1;font-size:10px;font-weight:700}
#${PANEL_ID} .mt-preview .mt-badge{position:absolute;top:10px;right:10px}
#${PANEL_ID} .mt-badge-positive{color:#a8f0cf;border-color:#346653;background:#152b26f5}
#${PANEL_ID} .mt-card-content{display:flex;flex-direction:column;gap:8px;flex:1;padding:16px}
#${PANEL_ID} .mt-name{font-size:16px;font-weight:750;letter-spacing:-.3px;overflow-wrap:anywhere}
#${PANEL_ID} .mt-name-button{border:0;background:none;color:inherit;padding:0;text-align:left;font-weight:inherit}
#${PANEL_ID} .mt-name-button:hover{color:var(--mt-accent)}
#${PANEL_ID} .mt-author{font-size:11px;color:var(--mt-muted);margin-top:3px;overflow-wrap:anywhere}
#${PANEL_ID} .mt-desc{font-size:12px;color:#bdc3d9;line-height:1.7;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:41px;overflow-wrap:anywhere}
#${PANEL_ID} .mt-tags{display:flex;flex-wrap:wrap;gap:6px}
#${PANEL_ID} .mt-tag{font-size:10px;color:#c6c1ed;padding:3px 7px;background:#a28df111;border-radius:5px}
#${PANEL_ID} .mt-card-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:12px;border-top:1px solid var(--mt-border)}
#${PANEL_ID} .mt-metrics{display:flex;flex-wrap:wrap;gap:10px;font-size:11px;color:var(--mt-muted)}
#${PANEL_ID} .mt-metric{display:inline-flex;align-items:center;gap:4px}
#${PANEL_ID} .mt-metric .mt-icon{width:13px;height:13px}
#${PANEL_ID} .mt-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid #8a7be8;border-radius:8px;padding:8px 13px;
  font-size:12px;font-weight:700;color:#fff;background:#6554c0;transition:background .15s,transform .15s;white-space:normal}
#${PANEL_ID} .mt-btn:hover:not(:disabled){background:#7664d5;transform:translateY(-1px)}
#${PANEL_ID} .mt-btn-secondary{background:transparent;border-color:var(--mt-border);color:var(--mt-text)}
#${PANEL_ID} .mt-btn-secondary:hover:not(:disabled){background:#ffffff0b}
#${PANEL_ID} .mt-btn .mt-icon{width:15px;height:15px}
#${PANEL_ID} .mt-state{display:flex;flex-direction:column;align-items:center;gap:12px;padding:56px 20px;text-align:center;border:1px dashed var(--mt-border);border-radius:14px;color:var(--mt-muted)}
#${PANEL_ID} .mt-state h3{font-size:18px;color:var(--mt-text)}
#${PANEL_ID} .mt-state p{max-width:520px;overflow-wrap:anywhere}
#${PANEL_ID} .mt-state>.mt-icon{width:36px;height:36px;color:var(--mt-accent);margin-bottom:6px}
#${PANEL_ID} .mt-switch-wrap{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--mt-muted)}
#${PANEL_ID} .mt-switch{position:relative;width:38px;height:22px;flex:0 0 auto}
#${PANEL_ID} .mt-switch input{position:absolute;inset:0;width:100%;height:100%;opacity:0;margin:0;cursor:pointer;z-index:1}
#${PANEL_ID} .mt-switch span{position:absolute;inset:0;border-radius:12px;background:#5e657c;transition:background .2s}
#${PANEL_ID} .mt-switch span::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .2s}
#${PANEL_ID} .mt-switch input:checked+span{background:#427b65}
#${PANEL_ID} .mt-switch input:checked+span::after{transform:translateX(16px)}
#${PANEL_ID} .mt-switch input:disabled{cursor:not-allowed}
#${PANEL_ID} .mt-switch input:focus-visible+span{outline:2px solid var(--mt-accent);outline-offset:4px}
#${PANEL_ID} .mt-pagination{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:24px;padding-top:20px;border-top:1px solid var(--mt-border);flex-wrap:wrap}
#${PANEL_ID} .mt-pagination-actions{display:flex;align-items:center;gap:12px}
#${PANEL_ID} .mt-skeleton{pointer-events:none}
#${PANEL_ID} .mt-skeleton-bar{height:12px;background:#ffffff0b;border-radius:5px;margin-bottom:8px}
#${PANEL_ID} .mt-skeleton .mt-preview,#${PANEL_ID} .mt-skeleton-bar{animation:mt-pulse 1.6s ease-in-out infinite}
#${PANEL_ID} .mt-detail{padding-top:24px;animation:mt-rise .2s ease-out}
#${PANEL_ID} .mt-detail-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(230px,1fr);gap:24px;margin-top:20px}
#${PANEL_ID} .mt-detail-preview{aspect-ratio:16/9;border-radius:14px;border:1px solid var(--mt-border)}
#${PANEL_ID} .mt-detail-info{display:flex;flex-direction:column;align-items:flex-start;gap:16px;min-width:0}
#${PANEL_ID} .mt-detail h3{font-size:28px;letter-spacing:-.8px;overflow-wrap:anywhere}
#${PANEL_ID} .mt-detail-description{font-size:14px;line-height:1.8;color:#c5cbe0;white-space:pre-wrap;overflow-wrap:anywhere}
#${PANEL_ID} .mt-detail-stats{display:grid;grid-template-columns:1fr 1fr;gap:16px;width:100%;padding:18px;border:1px solid var(--mt-border);border-radius:12px;background:var(--mt-surface)}
#${PANEL_ID} .mt-detail-stats strong{display:block;color:var(--mt-text);font-size:17px}
#${PANEL_ID} .mt-notice{font-size:11px;line-height:1.7;color:var(--mt-muted);padding:16px;border:1px solid var(--mt-border);border-radius:10px}
#${PANEL_ID} .mt-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
#${PANEL_ID} .mt-theme{display:grid;grid-template-columns:minmax(0,1fr) minmax(200px,.8fr);gap:28px;align-items:center;margin:0 28px 24px;padding:28px;
  border:1px solid #414141;border-radius:16px;background:radial-gradient(ellipse at 100% 0,#ffffff09,transparent 65%),#161616;color:#f2f2f2}
#${PANEL_ID} .mt-theme-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#bcbcbc}
#${PANEL_ID} .mt-theme h3{font-size:34px;font-weight:600;letter-spacing:-1.4px;line-height:1.2;margin:8px 0}
#${PANEL_ID} .mt-theme p{font-size:12px;line-height:1.8;color:#bcbcbc;max-width:360px}
#${PANEL_ID} .mt-theme-swatches{display:flex;gap:6px;margin:16px 0}
#${PANEL_ID} .mt-theme-swatches span{width:23px;height:8px;border-radius:4px;border:1px solid #ffffff26;background:var(--swatch)}
#${PANEL_ID} .mt-theme-control{display:flex;align-items:center;flex-wrap:wrap;gap:12px}
#${PANEL_ID} .mt-theme .mt-switch-wrap{color:#d4d4d4;font-size:12px}
#${PANEL_ID} .mt-theme .mt-switch span{background:#555}
#${PANEL_ID} .mt-theme .mt-switch input:checked+span{background:#dedede}
#${PANEL_ID} .mt-theme .mt-switch input:checked+span::after{background:#181818}
#${PANEL_ID} .mt-theme .mt-switch input:focus-visible+span{outline-color:#f2f2f2}
#${PANEL_ID} .mt-theme-note{color:#a8a8a8;font-size:10px}
#${PANEL_ID} .mt-theme-sample{display:flex;height:166px;border:1px solid #4a4a4a;border-radius:12px;background:#202020;overflow:hidden;box-shadow:0 16px 32px #0004;transform:rotate(-2deg)}
#${PANEL_ID} .mt-sample-servers{display:flex;flex-direction:column;gap:10px;padding:14px 10px;background:#101010;border-right:1px solid #303030}
#${PANEL_ID} .mt-sample-servers i{display:block;width:22px;height:22px;background:#353535;border-radius:50%}
#${PANEL_ID} .mt-sample-servers i:first-child{background:#dedede;border-radius:8px}
#${PANEL_ID} .mt-sample-channels{width:76px;flex-shrink:0;background:#181818;padding:18px 10px}
#${PANEL_ID} .mt-sample-channels i{display:block;height:5px;background:#444;border-radius:4px;margin-bottom:14px}
#${PANEL_ID} .mt-sample-channels i:nth-child(2){background:#bcbcbc;box-shadow:0 0 0 6px #ffffff0a}
#${PANEL_ID} .mt-sample-chat{display:flex;flex-direction:column;gap:15px;flex:1;min-width:0;padding:16px 12px}
#${PANEL_ID} .mt-sample-title{font-size:10px;color:#d4d4d4;letter-spacing:.5px;padding-bottom:10px;border-bottom:1px solid #383838}
#${PANEL_ID} .mt-sample-message{display:flex;gap:8px;align-items:center}
#${PANEL_ID} .mt-sample-avatar{width:19px;height:19px;flex-shrink:0;background:linear-gradient(135deg,#aaa,#555);border-radius:50%}
#${PANEL_ID} .mt-sample-lines{flex:1}
#${PANEL_ID} .mt-sample-lines i{display:block;width:85%;height:4px;background:#626262;border-radius:4px;margin:5px 0}
#${PANEL_ID} .mt-sample-lines i:first-child{width:45%;background:#bcbcbc}
#${PANEL_ID} .mt-sample-compose{height:22px;border:1px solid #414141;border-radius:6px;background:#292929;margin-top:auto}
@keyframes mt-fade{from{opacity:0}to{opacity:1}}
@keyframes mt-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes mt-pulse{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes mt-float{0%,100%{transform:translateY(0) rotate(-12deg)}50%{transform:translateY(-9px) rotate(-6deg)}}
@media(max-width:950px){
  #${PANEL_ID} .mt-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  #${PANEL_ID} .mt-art{flex-basis:155px}
  #${PANEL_ID} .mt-hero{padding:28px}
}
@media(max-width:620px){
  #${PANEL_ID}{padding:8px}
  #${PANEL_ID} .mt-win{height:calc(100vh - 16px);height:calc(100dvh - 16px);border-radius:14px}
  #${PANEL_ID} .mt-head{padding:14px 16px;gap:12px;flex-wrap:wrap}
  #${PANEL_ID} .mt-brand{margin-right:auto}
  #${PANEL_ID} .mt-tabs{order:2;width:100%;min-width:0;box-sizing:border-box}
  #${PANEL_ID} .mt-tab{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;padding:8px 4px}
  #${PANEL_ID} .mt-hero{margin:16px;padding:20px}
  #${PANEL_ID} .mt-art{display:none}
  #${PANEL_ID} .mt-hero h3{font-size:26px}
  #${PANEL_ID} .mt-hero-meta{gap:8px;font-size:11px}
  #${PANEL_ID} .mt-toolbar{grid-template-columns:1fr 1fr;padding:0 16px 16px;gap:10px}
  #${PANEL_ID} .mt-field:first-child{grid-column:1/-1}
  #${PANEL_ID} .mt-chips{padding:0 16px 16px;gap:6px}
  #${PANEL_ID} .mt-kinds{padding:0 16px 16px}
  #${PANEL_ID} .mt-theme{grid-template-columns:minmax(0,1fr);margin:0 16px 20px;padding:20px;gap:22px}
  #${PANEL_ID} .mt-theme-sample{transform:none}
  #${PANEL_ID} .mt-chip{font-size:11px;padding:6px 10px}
  #${PANEL_ID} .mt-body{padding:0 16px 20px}
  #${PANEL_ID} .mt-grid{grid-template-columns:minmax(0,1fr)}
  #${PANEL_ID} .mt-detail-grid{grid-template-columns:minmax(0,1fr)}
  #${PANEL_ID} .mt-pagination-actions{width:100%;justify-content:space-between}
}
@media(prefers-reduced-motion:reduce){
  #${PANEL_ID},#${PANEL_ID} *,#${PANEL_ID} *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
}
`;

// Change interface tokens only: media, role colors and semantic statuses stay intact.
const GRAPHITE_CSS = `
html[${THEME_ATTR}="graphite"]{
  color-scheme:dark;background:#101010;
}
html[${THEME_ATTR}="graphite"],
html[${THEME_ATTR}="graphite"] :is(.theme-dark,.theme-light,.theme-darker,.theme-midnight){
  --background-primary:#202020!important;--background-secondary:#181818!important;--background-secondary-alt:#141414!important;
  --background-tertiary:#101010!important;--background-floating:#242424!important;--background-accent:#353535!important;
  --background-base-lowest:#101010!important;--background-base-lower:#181818!important;--background-base-low:#202020!important;
  --background-surface-high:#292929!important;--background-surface-higher:#303030!important;--background-surface-highest:#383838!important;
  --background-mod-subtle:#ffffff08!important;--background-mod-normal:#ffffff0d!important;--background-mod-strong:#ffffff14!important;
  --background-modifier-hover:#ffffff0a!important;--background-modifier-active:#ffffff12!important;--background-modifier-selected:#ffffff18!important;
  --background-modifier-accent:#ffffff14!important;--bg-base-primary:#202020!important;--bg-base-secondary:#181818!important;--bg-base-tertiary:#101010!important;
  --bg-surface-overlay:#242424!important;--bg-surface-raised:#292929!important;--bg-overlay-chat:linear-gradient(#202020,#202020)!important;
  --bg-overlay-home:linear-gradient(#181818,#181818)!important;--chat-background-default:#202020!important;--chat-border:#363636!important;
  --channeltextarea-background:#2b2b2b!important;--input-background:#161616!important;
  --text-normal:#e4e4e4!important;--text-primary:#e4e4e4!important;--text-default:#e4e4e4!important;
  --text-muted:#a8a8a8!important;--text-secondary:#bcbcbc!important;--text-tertiary:#a8a8a8!important;
  --header-primary:#f2f2f2!important;--header-secondary:#bcbcbc!important;--channels-default:#a8a8a8!important;
  --interactive-normal:#bcbcbc!important;--interactive-hover:#f2f2f2!important;--interactive-active:#fff!important;--interactive-muted:#757575!important;
  --icon-primary:#d4d4d4!important;--icon-secondary:#bcbcbc!important;--icon-tertiary:#a8a8a8!important;
  --text-link:#afbed8!important;--text-brand:#afbed8!important;--brand-500:#4b586f!important;--brand-560:#414d62!important;--brand-600:#384356!important;
  --blurple-50:#4b586f!important;--control-brand-foreground:#afbed8!important;
  --button-filled-brand-background:#4b586f!important;--button-filled-brand-background-hover:#56647d!important;
  --button-filled-brand-background-active:#414d62!important;--button-filled-brand-text:#f2f2f2!important;
  --button-secondary-background:#353535!important;--button-secondary-background-hover:#454545!important;--button-secondary-text:#f2f2f2!important;
  --mention-background:#afbed81a!important;--mention-foreground:#bdcbe2!important;
  --background-mentioned:#afbed80a!important;--background-mentioned-hover:#afbed812!important;
  --background-message-highlight:#afbed80d!important;
  --border-subtle:#ffffff0f!important;--border-normal:#ffffff1a!important;--border-strong:#ffffff2b!important;
  --scrollbar-thin-thumb:#505050!important;--scrollbar-thin-track:transparent!important;
  --scrollbar-auto-thumb:#505050!important;--scrollbar-auto-track:#181818!important;
}
html[${THEME_ATTR}="graphite"] #${PANEL_ID}{
  --mt-bg:#141414;--mt-surface:#202020;--mt-border:#3d3d3d;--mt-text:#e4e4e4;--mt-muted:#bcbcbc;--mt-accent:#afbed8;
  background:#080808d9
}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-brand-icon{background:linear-gradient(140deg,#dedede,#999);color:#161616}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-tab.on{background:#353535}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-scroll{scrollbar-color:#505050 transparent}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-hero{background:radial-gradient(ellipse at 95% 10%,#ffffff0a,transparent 65%),linear-gradient(120deg,#262626,#191919);border-color:#414141}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} :is(.mt-eyebrow,.mt-hero h3 span,.mt-hero-meta,.mt-spark){color:#dedede}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} :is(.mt-hero p,.mt-desc,.mt-detail-description){color:#bcbcbc}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-dot{background:#8cb8a2;box-shadow:none}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-orbit{border-color:#ffffff18}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-art-icon{background:linear-gradient(140deg,#555,#252525);border-color:#777;box-shadow:0 15px 50px #0006,inset 0 1px 0 #ffffff40;animation:none}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-chip:is(:hover,[aria-pressed="true"]){color:#f2f2f2;border-color:#858585;background:#ffffff0d}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-card:hover{border-color:#777}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-card .mt-preview,
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-preview{background:radial-gradient(circle at 25% 25%,#ffffff0c,transparent 60%),linear-gradient(135deg,#303030,#1c1c1c)}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-monogram{color:#dedede}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-badge{color:#ededed;border-color:#5d5d5d;background:#1a1a1af5}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-badge-positive{color:#acd4bb;border-color:#405a4b;background:#1b2821}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-tag{color:#d4d4d4;background:#ffffff0a}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-btn{color:#f2f2f2;background:#4b586f;border-color:#74839d}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-btn:hover:not(:disabled){background:#56647d}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-btn-secondary{background:transparent;border-color:var(--mt-border);color:var(--mt-text)}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-btn-secondary:hover:not(:disabled){background:#ffffff0b}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-switch span{background:#626262}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-switch input:checked+span{background:#527460}
html[${THEME_ATTR}="graphite"] #${PANEL_ID} .mt-switch input:checked+span::after{background:#f2f2f2}
`;

const icon = (name) => {
    const paths = {
        puzzle: ICON_PATH,
        search: "m21 21-4.5-4.5M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16",
        download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
        heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
        close: "m6 6 12 12M6 18 18 6",
        arrow: "m12 5-7 7 7 7M5 12h15",
        check: "m5 12 4 4L19 6",
        external: "M14 3h7v7m0-7L10 14M10 3H3v18h18v-7",
        play: "M7 4v16l13-8Z",
        pause: "M8 5v14M16 5v14",
        next: "m5 5 10 7-10 7ZM19 5v14",
        prev: "m19 5-10 7 10 7ZM5 5v14",
        shuffle: "M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5",
        repeat: "m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3",
        share: "M4 12v8h16v-8M16 6l-4-4-4 4M12 2v14",
    };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "mt-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", paths[name] || paths.puzzle);
    path.setAttribute("fill", name === "puzzle" ? "currentColor" : "none");
    path.setAttribute("stroke", name === "puzzle" ? "none" : "currentColor");
    path.setAttribute("stroke-width", "1.7");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
    return svg;
};

const safeThumbnail = (value) => {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
        const url = new URL(value, "https://betterdiscord.app");
        return url.protocol === "https:" && url.hostname === "betterdiscord.app" ? url.href : null;
    } catch {
        return null;
    }
};

const h = (tag, props = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
        if (k === "class") el.className = v;
        else if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === "checked" || k === "disabled" || k === "value") el[k] = v;
        else if (v != null && v !== false) el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) {
        if (kid == null || kid === false) continue;
        el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const THEME_FONTS = {
    discord: '"gg sans","Noto Sans",sans-serif',
    system: 'system-ui,sans-serif',
    mono: 'ui-monospace,monospace',
};
const THEME_COLORS = {
    primary: "Discussion", secondary: "Salons et membres", tertiary: "Barre des serveurs",
    surface: "Champs et menus", text: "Texte principal", muted: "Texte secondaire", accent: "Accent",
};
const THEME_PRESETS = {
    nuit: { primary: "#202127", secondary: "#191a20", tertiary: "#111218", surface: "#2b2d36", text: "#f2f3fc", muted: "#b0b7d0", accent: "#a6a3ff" },
    clair: { primary: "#ffffff", secondary: "#eef0f5", tertiary: "#dfe3ed", surface: "#e5e8f0", text: "#202333", muted: "#535c70", accent: "#5540b0" },
    foret: { primary: "#182822", secondary: "#122019", tertiary: "#0b1711", surface: "#263c31", text: "#ecf7ef", muted: "#afc9b7", accent: "#83dbaf" },
};
const newThemeDraft = () => ({ name: "Mon thème", ...THEME_PRESETS.nuit, font: "discord", fontSize: 16, radius: 12, spacing: 16 });

function validateThemeDraft(draft) {
    if (!draft || typeof draft !== "object" || typeof draft.name !== "string" ||
        !draft.name.trim() || draft.name.length > 60 || /[\r\n\u0000-\u001f\u007f]/.test(draft.name) || draft.name.includes("*/")) {
        throw new Error("Le nom doit contenir 1 à 60 caractères, sans saut de ligne ni fin de commentaire.");
    }
    for (const key of Object.keys(THEME_COLORS)) {
        if (typeof draft[key] !== "string" || !/^#[0-9a-f]{6}$/i.test(draft[key])) throw new Error(`Couleur invalide : ${THEME_COLORS[key]}.`);
    }
    if (!Object.hasOwn(THEME_FONTS, draft.font)) throw new Error("Police inconnue.");
    for (const [key, min, max] of [["fontSize", 12, 22], ["radius", 0, 24], ["spacing", 4, 24]]) {
        if (!Number.isInteger(draft[key]) || draft[key] < min || draft[key] > max) throw new Error(`Réglage invalide : ${key}.`);
    }
    return draft;
}

function themeCSS(draft) {
    const d = validateThemeDraft(draft);
    const tokens = {
        "background-primary": d.primary, "background-secondary": d.secondary, "background-secondary-alt": d.secondary,
        "background-tertiary": d.tertiary, "background-floating": d.surface, "background-accent": d.surface,
        "background-base-lowest": d.tertiary, "background-base-lower": d.secondary, "background-base-low": d.primary,
        "background-surface-high": d.surface, "background-surface-higher": d.surface,
        "bg-base-primary": d.primary, "bg-base-secondary": d.secondary, "bg-base-tertiary": d.tertiary,
        "bg-surface-overlay": d.surface, "bg-surface-raised": d.surface,
        "bg-overlay-chat": `linear-gradient(${d.primary},${d.primary})`, "bg-overlay-home": `linear-gradient(${d.secondary},${d.secondary})`,
        "chat-background-default": d.primary, "channeltextarea-background": d.surface, "input-background": d.surface,
        "text-normal": d.text, "text-primary": d.text, "text-default": d.text, "header-primary": d.text,
        "text-muted": d.muted, "text-secondary": d.muted, "text-tertiary": d.muted, "header-secondary": d.muted,
        "channels-default": d.muted, "interactive-normal": d.muted, "interactive-hover": d.text, "interactive-active": d.text,
        "icon-primary": d.text, "icon-secondary": d.muted, "icon-tertiary": d.muted,
        "text-link": d.accent, "text-brand": d.accent, "brand-500": d.accent, "brand-560": `${d.accent}dd`, "brand-600": `${d.accent}bb`,
        "blurple-50": d.accent, "control-brand-foreground": d.accent,
        "button-filled-brand-background": d.accent, "button-filled-brand-background-hover": `${d.accent}dd`,
        "button-filled-brand-background-active": `${d.accent}bb`, "button-filled-brand-text": contrastText(d.accent),
        "button-secondary-background": d.surface, "button-secondary-text": d.text,
        "mention-background": `${d.accent}26`, "mention-foreground": d.accent,
        "background-mentioned": `${d.accent}18`, "background-mentioned-hover": `${d.accent}26`,
        "background-modifier-hover": `${d.accent}14`, "background-modifier-selected": `${d.accent}26`,
        "background-modifier-active": `${d.accent}20`, "background-modifier-accent": `${d.muted}30`,
        "background-mod-subtle": `${d.accent}0a`, "background-mod-normal": `${d.accent}14`, "background-mod-strong": `${d.accent}26`,
        "border-subtle": `${d.muted}26`, "border-normal": `${d.muted}40`, "border-strong": `${d.muted}66`, "chat-border": `${d.muted}40`,
        "scrollbar-thin-thumb": d.muted, "scrollbar-thin-track": "transparent",
        "scrollbar-auto-thumb": d.muted, "scrollbar-auto-track": d.secondary,
        "font-primary": THEME_FONTS[d.font], "font-display": THEME_FONTS[d.font],
        "chat-font-scaling": d.fontSize / 16,
    };
    return `:root,.theme-dark,.theme-light,.theme-darker,.theme-midnight{\n${Object.entries(tokens).map(([key, value]) => `  --${key}:${value}!important;`).join("\n")}\n}
[class*="messageContent"]{font-size:${d.fontSize}px!important;line-height:1.5!important}
[class*="cozy_"][class*="message_"]{margin-top:${d.spacing}px!important}
[class*="channelTextArea"],[class*="panels_"],[class*="menu_"],[class*="embedFull"]{border-radius:${d.radius}px!important}
`;
}

function contrastText(hex) {
    const rgb = [1, 3, 5].map((index) => {
        const value = parseInt(hex.slice(index, index + 2), 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.179 ? "#000000" : "#ffffff";
}

const EDITOR_CSS = `
#${PANEL_ID} .mt-editor{padding-top:24px;display:grid;gap:20px}
#${PANEL_ID} .mt-editor-layout{display:grid;grid-template-columns:minmax(230px,1fr) minmax(0,2fr);gap:20px;align-items:start}
#${PANEL_ID} .mt-editor-controls{display:grid;gap:14px;padding:18px;background:var(--mt-surface);border:1px solid var(--mt-border);border-radius:14px}
#${PANEL_ID} .mt-editor-mode{display:flex;gap:8px;flex-wrap:wrap}
#${PANEL_ID} .mt-editor-advanced{display:grid;gap:14px}
#${PANEL_ID} .mt-editor-colors{display:grid;grid-template-columns:1fr 1fr;gap:12px}
#${PANEL_ID} .mt-editor input[type=color]{width:100%;height:34px;padding:2px;border:1px solid var(--mt-border);border-radius:6px;background:transparent;cursor:pointer}
#${PANEL_ID} .mt-editor input[type=range]{width:100%;accent-color:var(--mt-accent)}
#${PANEL_ID} .mt-editor-preview{min-width:0;position:sticky;top:16px;display:grid;gap:12px}
#${PANEL_ID} .mt-editor-actions{display:flex;gap:12px;flex-wrap:wrap}
#${PANEL_ID} .mt-editor-status{overflow-wrap:anywhere}
@media(max-width:850px){#${PANEL_ID} .mt-editor-layout{grid-template-columns:minmax(0,1fr)}#${PANEL_ID} .mt-editor-preview{position:static}}
`;

function themePreview() {
    const host = h("div", { role: "region", "aria-label": "Aperçu Discord en direct" });
    const shadow = host.attachShadow({ mode: "open" });
    const style = h("style");
    shadow.append(h("style", {}, `
        *{box-sizing:border-box} .theme-dark{display:flex;min-height:390px;border:1px solid var(--border-normal);border-radius:14px;overflow:hidden;
        background:var(--background-primary);color:var(--text-normal);font-family:var(--font-primary);font-size:14px;line-height:1.5}
        .servers{background:var(--background-tertiary);padding:14px 8px;display:grid;align-content:start;gap:12px}
        .server,.avatar{display:grid;place-items:center;border-radius:50%;width:32px;height:32px;background:var(--background-surface-high);flex-shrink:0}
        .selected,button{background:var(--brand-500);color:var(--button-filled-brand-text)}
        .channels,.members{background:var(--background-secondary);padding:16px 12px;color:var(--channels-default)}
        .channels{width:128px;flex-shrink:0}.members{width:100px;flex-shrink:0}.channels p{padding:6px;margin:8px 0}
        .active{color:var(--interactive-active);background:var(--background-modifier-selected);border-radius:6px}
        .chat{flex:1;min-width:0;display:flex;flex-direction:column}.title{padding:14px;border-bottom:1px solid var(--border-normal);color:var(--header-primary);font-weight:bold}
        .messages{padding:0 12px 16px}.message{display:flex;gap:8px}.content{min-width:0;overflow-wrap:anywhere}.muted,small{color:var(--text-muted)}
        .messageContent{margin:4px 0}.mention{color:var(--mention-foreground);background:var(--mention-background)}a{color:var(--text-link)}
        .embedFull{padding:12px;background:var(--background-secondary);border-left:3px solid var(--brand-500)}
        button{font:inherit;border:0;padding:7px 12px;cursor:default}.channelTextArea{padding:12px;margin:auto 12px 12px;background:var(--channeltextarea-background);color:var(--text-muted)}
        @media(max-width:650px){.members{display:none}}@media(max-width:420px){.channels{display:none}}
    `), style, h("div", { class: "theme-dark" },
        h("aside", { class: "servers", "aria-label": "Serveurs" }, h("span", { class: "server selected" }, "M"), h("span", { class: "server" }, "A"), h("span", { class: "server" }, "B")),
        h("aside", { class: "channels" }, h("strong", {}, "Votre univers"), h("p", { class: "active" }, "# général"), h("p", {}, "# créations"), h("p", {}, "Vocal")),
        h("div", { class: "chat" }, h("div", { class: "title" }, "# général"),
            h("div", { class: "messages" },
                h("div", { class: "cozy_preview message_preview message" }, h("span", { class: "avatar" }, "A"),
                    h("div", { class: "content" }, h("strong", {}, "Alex"), h("small", {}, " · 14:32"),
                        h("p", { class: "messageContent" }, "Bienvenue dans votre Discord !"),
                        h("p", { class: "messageContent" }, h("span", { class: "mention" }, "@vous"), " Un thème à votre image."))),
                h("div", { class: "cozy_preview message_preview message" }, h("span", { class: "avatar" }, "C"),
                    h("div", { class: "content" }, h("strong", {}, "Camille"), h("p", { class: "messageContent" }, "Tout change en direct."),
                        h("div", { class: "embedFull" }, h("strong", {}, "Votre création"), h("p", { class: "muted" }, "Couleurs, police et détails."),
                            h("button", { type: "button", tabindex: "-1" }, "Bouton accent"))))),
            h("div", { class: "channelTextArea" }, "Envoyer un message dans #général")),
        h("aside", { class: "members" }, "EN LIGNE", h("p", {}, "Alex"), h("p", {}, "Camille"))));
    return { host, style };
}

/* ───────────── ModsTab Original : Spotify ───────────── */

const SPOTIFY_ACCOUNTS = "https://accounts.spotify.com";
const SPOTIFY_API = "https://api.spotify.com/v1";
const SPOTIFY_SCOPES = "user-read-playback-state user-modify-playback-state user-read-currently-playing user-library-read user-library-modify";
const SPOTIFY_DEFAULT_PORT = 8898;
const SPOTIFY_CLIENT_ID = /^[a-f0-9]{32}$/i;
const SPOTIFY_COVER = /^https:\/\/i\.scdn\.co\//;
const PREMIUM_HINT = "Réservé à Spotify Premium";
const SPOTIFY_DOCK_ID = "modstab-spotify-dock";

const SPOTIFY_CSS = `
#${PANEL_ID} .mt-spotify{display:flex;flex-direction:column;gap:16px;padding:22px;border:1px solid var(--mt-border);border-radius:18px;background:var(--mt-surface)}
#${PANEL_ID} .mt-sp-head{display:flex;align-items:center;flex-wrap:wrap;gap:12px}
#${PANEL_ID} .mt-sp-head h3{margin:0 auto 0 0;font-size:18px}
#${PANEL_ID} .mt-sp-now{display:flex;flex-wrap:wrap;align-items:center;gap:16px}
#${PANEL_ID} .mt-sp-cover{width:96px;height:96px;flex-shrink:0;border-radius:12px;object-fit:cover;background:#ffffff10}
#${PANEL_ID} .mt-sp-meta{flex:1 1 200px;min-width:0}
#${PANEL_ID} .mt-sp-title{overflow:hidden;font-size:16px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}
#${PANEL_ID} .mt-sp-sub{overflow:hidden;margin-top:3px;color:var(--mt-muted);font-size:12px;text-overflow:ellipsis;white-space:nowrap}
#${PANEL_ID} .mt-sp-bar{display:flex;align-items:center;gap:8px;margin-top:10px;color:var(--mt-muted);font-size:11px;font-variant-numeric:tabular-nums}
#${PANEL_ID} .mt-sp-bar input{flex:1;min-width:0;accent-color:var(--mt-accent)}
#${PANEL_ID} .mt-sp-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
#${PANEL_ID} .mt-sp-ico{display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--mt-border);border-radius:50%;background:transparent;color:var(--mt-text);cursor:pointer}
#${PANEL_ID} .mt-sp-ico:hover:not(:disabled){background:#ffffff10}
#${PANEL_ID} .mt-sp-ico[aria-pressed="true"]{border-color:currentColor;color:#6fd68f}
#${PANEL_ID} .mt-sp-ico:disabled{opacity:.4;cursor:not-allowed}
#${PANEL_ID} .mt-sp-ico .mt-icon{width:18px;height:18px}
#${PANEL_ID} .mt-sp-volume{display:flex;align-items:center;gap:6px;margin-left:auto;color:var(--mt-muted)}
#${PANEL_ID} .mt-sp-volume input{width:110px;accent-color:var(--mt-accent)}
#${PANEL_ID} .mt-sp-list{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
#${PANEL_ID} .mt-sp-row{display:flex;align-items:center;gap:10px;padding:6px;border:1px solid transparent;border-radius:10px}
#${PANEL_ID} .mt-sp-row:hover{border-color:var(--mt-border)}
#${PANEL_ID} .mt-sp-row img,#${PANEL_ID} .mt-sp-row .mt-sp-thumb{width:40px;height:40px;flex-shrink:0;border-radius:6px;object-fit:cover;background:#ffffff10}
#${PANEL_ID} .mt-sp-row .mt-btn{padding:6px 10px;font-size:12px}
#${PANEL_ID} .mt-sp-notice{margin:0;padding:10px 12px;border:1px solid var(--mt-border);border-radius:10px;color:var(--mt-muted);font-size:12px}
#${PANEL_ID} .mt-sp-error{margin:0;color:#ff9a9a;font-size:12px}
#${PANEL_ID} .mt-sp-form{display:grid;grid-template-columns:minmax(0,1fr) 120px;gap:12px}
#${PANEL_ID} .mt-sp-form .mt-field:last-of-type{grid-column:1/-1}
#${PANEL_ID} .mt-sp-search{display:flex;gap:8px}
#${PANEL_ID} .mt-sp-search .mt-search{flex:1}
@media(max-width:700px){#${PANEL_ID} .mt-sp-form{grid-template-columns:minmax(0,1fr)}#${PANEL_ID} .mt-sp-volume{margin-left:0}}
`;

const SPOTIFY_DOCK_CSS = SPOTIFY_CSS.replaceAll(`#${PANEL_ID}`, `#${SPOTIFY_DOCK_ID}`) + `
#${SPOTIFY_DOCK_ID}{--mt-bg:var(--background-floating,#10121b);--mt-surface:var(--background-secondary,#1b1e2d);--mt-border:var(--background-modifier-accent,#32374d);--mt-text:var(--text-normal,#f2f3fc);--mt-muted:var(--text-muted,#b0b7d0);--mt-accent:var(--text-link,#a6a3ff);
position:fixed;right:16px;bottom:16px;z-index:1000;width:min(360px,calc(100vw - 32px));max-height:calc(100dvh - 32px);overflow:auto;box-sizing:border-box;padding:12px;border:1px solid var(--mt-border);border-radius:12px;background:var(--mt-bg);color:var(--mt-text);font:13px var(--font-primary,system-ui,sans-serif);box-shadow:0 8px 32px #0006}
#${SPOTIFY_DOCK_ID} *{box-sizing:border-box}
#${SPOTIFY_DOCK_ID} [hidden]{display:none!important}
#${SPOTIFY_DOCK_ID} :is(button,input):focus-visible{outline:2px solid var(--mt-accent);outline-offset:3px}
#${SPOTIFY_DOCK_ID} .mt-sp-dock-head{display:flex;align-items:center;gap:8px}
#${SPOTIFY_DOCK_ID} .mt-sp-dock-head strong{margin-right:auto}
#${SPOTIFY_DOCK_ID} .mt-sp-dock-body{display:flex;flex-direction:column;gap:8px;margin-top:8px}
#${SPOTIFY_DOCK_ID} .mt-sp-now{flex-wrap:nowrap;gap:10px}
#${SPOTIFY_DOCK_ID} .mt-sp-meta{flex:1;min-width:0}
#${SPOTIFY_DOCK_ID} .mt-sp-title{font-size:14px}
#${SPOTIFY_DOCK_ID} .mt-sp-sub{font-size:11px}
#${SPOTIFY_DOCK_ID} .mt-sp-bar{margin-top:4px}
#${SPOTIFY_DOCK_ID} .mt-sp-controls{gap:6px}
#${SPOTIFY_DOCK_ID} .mt-sp-ico{width:32px;height:32px}
#${SPOTIFY_DOCK_ID} .mt-sp-volume{height:24px;font-size:11px}
#${SPOTIFY_DOCK_ID} .mt-sp-volume input{width:80px}
#${SPOTIFY_DOCK_ID} :is(.mt-sp-error,.mt-sp-list):empty{display:none}
#${SPOTIFY_DOCK_ID} .mt-badge{font-size:11px;color:var(--mt-muted)}
#${SPOTIFY_DOCK_ID} .mt-btn{padding:6px 8px;border:1px solid var(--mt-border);border-radius:8px;background:var(--mt-surface);color:var(--mt-text);font:inherit;cursor:pointer}
#${SPOTIFY_DOCK_ID} .mt-search{width:100%;min-width:0;padding:8px;border:1px solid var(--mt-border);border-radius:8px;background:var(--mt-surface);color:var(--mt-text)}
#${SPOTIFY_DOCK_ID} .mt-sp-search{flex-wrap:wrap;gap:6px}
#${SPOTIFY_DOCK_ID} .mt-sp-search .mt-btn{font-size:12px}
#${SPOTIFY_DOCK_ID} .mt-sp-search .mt-search{flex-basis:100%}
#${SPOTIFY_DOCK_ID} .mt-sp-cover{width:44px;height:44px;border-radius:8px}
#${SPOTIFY_DOCK_ID} .mt-sp-row{flex-wrap:wrap}
#${SPOTIFY_DOCK_ID} .mt-icon{width:18px;height:18px}
#${SPOTIFY_DOCK_ID}[data-collapsed="true"]{width:min(220px,calc(100vw - 32px))}
`;

class SpotifyError extends Error {
    constructor(status, reason, message) {
        super(message || `Erreur Spotify ${status}`);
        this.status = status;
        this.reason = reason;
    }
}

const nodeModule = (name) => {
    for (const load of [() => require(name), () => require(`node:${name}`), () => window.require?.(name)]) {
        try {
            const mod = load();
            if (mod && typeof mod.createServer === "function") return mod;
        } catch { /* module indisponible dans ce contexte */ }
    }
    return null;
};
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const randomToken = (size) => b64url(crypto.getRandomValues(new Uint8Array(size)));
const pkceChallenge = async (verifier) => b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
const clock = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// `product` was removed from /me for development-mode apps: fall back to "unknown" and probe.
const spotifyPlan = (product) => product === "premium" ? "premium" : product === "free" || product === "open" ? "free" : "unknown";
const spotifyCapabilities = (plan) => {
    const premium = plan !== "free";
    return { control: premium, seek: premium, volume: premium, queue: premium, transfer: premium, library: true, search: true, share: true };
};

class SpotifyOriginal {
    constructor(host) {
        this.host = host;
        this.enabled = false;
        this.clientId = "";
        this.port = SPOTIFY_DEFAULT_PORT;
        this.tokens = null;
        this.me = null;
        this.plan = "unknown";
        this.playback = null;
        this.liked = { uri: "", value: false };
        this.error = "";
        this.connecting = false;
        this.manual = null;
        this.tickCount = 0;
        this.probes = 0;
        this.root = null;
    }

    /* cycle de vie */

    start() {
        this.stopped = false;
        try {
            this.enabled = BdApi.Data.load("ModsTab", "spotifyEnabled") === true;
            this.clientId = BdApi.Data.load("ModsTab", "spotifyClientId") || "";
            this.port = Number(BdApi.Data.load("ModsTab", "spotifyPort")) || SPOTIFY_DEFAULT_PORT;
            this.tokens = BdApi.Data.load("ModsTab", "spotifyTokens") || null;
        } catch (err) {
            this.error = `Réglages Spotify illisibles : ${err.message}`;
        }
        this.timer = setInterval(() => this.onTick(), 1000);
        this.onResize = () => this.positionDock();
        window.addEventListener("resize", this.onResize);
        this.panelObserver = new ResizeObserver(() => this.positionDock());
        this.paint();
        if (this.enabled && this.tokens) this.loadProfile().then(() => this.refreshPlayback());
    }

    stop() {
        this.stopped = true;
        clearInterval(this.timer);
        window.removeEventListener("resize", this.onResize);
        this.panelObserver?.disconnect();
        this.anchorPanel = null;
        this.authServer?.close();
        this.authServer = null;
        this.root?.remove();
        this.root = null;
        this.dock?.remove();
        this.dock = null;
        this.playback = null;
        this.me = null;
    }

    save(key, value) {
        try {
            BdApi.Data.save("ModsTab", key, value);
        } catch (err) {
            this.host.toast(`Impossible d’enregistrer les réglages Spotify : ${err.message}`, "error");
        }
    }

    get redirectUri() {
        return `http://127.0.0.1:${this.port}/callback`;
    }

    get caps() {
        return spotifyCapabilities(this.plan);
    }

    get connected() {
        return Boolean(this.tokens?.refresh);
    }

    /* authentification OAuth PKCE (pas de client secret) */

    async connect() {
        if (!SPOTIFY_CLIENT_ID.test(this.clientId)) throw new Error("Le Client ID doit contenir 32 caractères hexadécimaux.");
        if (!Number.isInteger(this.port) || this.port < 1024 || this.port > 65535) throw new Error("Le port doit être compris entre 1024 et 65535.");
        const http = nodeModule("http");
        const verifier = randomToken(64);
        const state = randomToken(16);
        const url = new URL(`${SPOTIFY_ACCOUNTS}/authorize`);
        url.search = new URLSearchParams({
            client_id: this.clientId, response_type: "code", redirect_uri: this.redirectUri, scope: SPOTIFY_SCOPES,
            code_challenge_method: "S256", code_challenge: await pkceChallenge(verifier), state,
        }).toString();
        if (!http) {
            this.manual = { verifier, state };
            this.openExternal(url.toString());
            this.connecting = false;
            this.paint();
            return false;
        }
        await new Promise((resolve, reject) => {
            let timeout;
            const finish = (err) => {
                clearTimeout(timeout);
                server.close();
                this.authServer = null;
                err ? reject(err) : resolve();
            };
            const server = http.createServer(async (req, res) => {
                const params = new URL(req.url, "http://127.0.0.1").searchParams;
                if (!req.url.startsWith("/callback")) return res.writeHead(404).end();
                const code = params.get("code");
                const valid = Boolean(code) && params.get("state") === state;
                res.writeHead(valid ? 200 : 400, { "Content-Type": "text/html; charset=utf-8", "Referrer-Policy": "no-referrer" });
                res.end(`<!doctype html><meta charset="utf-8"><title>ModsTab</title><body style="font:16px system-ui;text-align:center;margin-top:20vh">${valid ? "Connecté à Spotify. Vous pouvez fermer cet onglet et revenir à Discord." : "Connexion refusée ou invalide. Revenez à Discord pour réessayer."}</body>`);
                if (!valid) return finish(new Error(params.get("error") === "access_denied" ? "Autorisation refusée." : "Réponse Spotify invalide."));
                try {
                    await this.tokenRequest({ grant_type: "authorization_code", code, redirect_uri: this.redirectUri, code_verifier: verifier });
                    finish();
                } catch (err) {
                    finish(err);
                }
            });
            this.authServer?.close();
            this.authServer = server;
            timeout = setTimeout(() => finish(new Error("Délai de connexion dépassé.")), 180000);
            server.on("error", (err) => finish(err.code === "EADDRINUSE" ? new Error(`Le port ${this.port} est déjà utilisé.`) : err));
            server.listen(this.port, "127.0.0.1", () => this.openExternal(url.toString()));
        });
        await this.loadProfile();
        return true;
    }

    // Fallback when Discord's sandboxed require cannot load "http": the user pastes the redirect URL.
    async completeManual(pasted) {
        const { verifier, state } = this.manual || {};
        let params;
        try {
            params = new URL(pasted.trim()).searchParams;
        } catch {
            throw new Error("Collez l’adresse complète affichée dans la barre du navigateur.");
        }
        if (params.get("error")) throw new Error(params.get("error") === "access_denied" ? "Autorisation refusée." : "Réponse Spotify invalide.");
        if (!params.get("code") || params.get("state") !== state) throw new Error("Adresse invalide ou expirée : relancez la connexion.");
        await this.tokenRequest({ grant_type: "authorization_code", code: params.get("code"), redirect_uri: this.redirectUri, code_verifier: verifier });
        this.manual = null;
        await this.loadProfile();
    }

    async tokenRequest(params) {
        const res = await this.host.netFetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ client_id: this.clientId, ...params }).toString(),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            if (data.error === "invalid_grant") this.clearSession();
            throw new SpotifyError(res.status, data.error, data.error_description || "Échec de l’authentification Spotify.");
        }
        this.tokens = {
            access: data.access_token,
            refresh: data.refresh_token || this.tokens?.refresh,
            expiresAt: Date.now() + data.expires_in * 1000,
        };
        this.save("spotifyTokens", this.tokens);
    }

    async accessToken() {
        if (!this.connected) throw new SpotifyError(401, "NOT_CONNECTED", "Spotify n’est pas connecté.");
        if (this.tokens.access && this.tokens.expiresAt - 30000 > Date.now()) return this.tokens.access;
        this._refreshing ||= this.tokenRequest({ grant_type: "refresh_token", refresh_token: this.tokens.refresh })
            .finally(() => { this._refreshing = null; });
        await this._refreshing;
        return this.tokens.access;
    }

    clearSession() {
        this.tokens = null;
        this.me = null;
        this.playback = null;
        this.plan = "unknown";
        this.probes = 0;
        this.save("spotifyTokens", null);
        this.paint();
    }

    openExternal(url) {
        try {
            require("electron").shell.openExternal(url);
        } catch {
            window.open(url, "_blank", "noopener");
        }
    }

    /* API */

    async request(method, path, { query, body, retry = true } = {}) {
        const token = await this.accessToken();
        const url = new URL(SPOTIFY_API + path);
        for (const [key, value] of Object.entries(query || {})) url.searchParams.set(key, value);
        const res = await this.host.netFetch(url.toString(), {
            method,
            headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (res.status === 401 && retry) {
            this.tokens.expiresAt = 0;
            return this.request(method, path, { query, body, retry: false });
        }
        const text = res.status === 204 ? "" : await res.text();
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch { /* corps non JSON */ }
        if (!res.ok) {
            const reason = data?.error?.reason;
            if (res.status === 429) throw new SpotifyError(429, reason, "Trop de requêtes : patientez quelques secondes.");
            throw new SpotifyError(res.status, reason, data?.error?.message);
        }
        return data;
    }

    // Retry once after waking an idle device when Spotify reports no active device.
    async player(method, path, opts) {
        try {
            return await this.request(method, path, opts);
        } catch (err) {
            if (err.reason !== "NO_ACTIVE_DEVICE") throw err;
            const device = ((await this.request("GET", "/me/player/devices"))?.devices || []).find((d) => !d.is_restricted);
            if (!device) throw new SpotifyError(404, err.reason, "Aucun appareil Spotify disponible : ouvrez Spotify sur un appareil.");
            await this.request("PUT", "/me/player", { body: { device_ids: [device.id], play: false } });
            await sleep(700);
            return this.request(method, path, opts);
        }
    }

    async loadProfile() {
        try {
            const me = await this.request("GET", "/me");
            this.me = { name: me.display_name || me.id };
            this.plan = spotifyPlan(me.product);
            this.error = "";
        } catch (err) {
            this.error = err.status === 403
                ? "Accès refusé : ajoutez votre compte dans « User Management » de votre app Spotify (mode développement)."
                : err.message;
            if (err.reason === "NOT_CONNECTED") this.me = null;
        }
        this.paint();
    }

    async refreshPlayback() {
        if (this.stopped || !this.enabled || !this.connected || this._polling) return;
        this._polling = true;
        try {
            const data = await this.request("GET", "/me/player", { query: { additional_types: "episode" } });
            this.playback = data?.item ? { ...data, fetchedAt: Date.now() } : null;
            this.error = "";
            if (this.playback) {
                await this.syncLiked();
                await this.probePremium();
            }
        } catch (err) {
            if (err.reason === "NOT_CONNECTED" || err.reason === "invalid_grant") this.paint();
            else this.error = err.message;
        } finally {
            this._polling = false;
            this.update();
        }
    }

    async syncLiked() {
        const item = this.playback?.item;
        if (item?.type !== "track" || this.liked.uri === item.uri) return;
        this.liked = { uri: item.uri, value: false };
        try {
            const [value] = await this.request("GET", "/me/library/contains", { query: { uris: item.uri } });
            this.liked = { uri: item.uri, value: value === true };
        } catch (err) {
            this.liked = { uri: "", value: false };
            this.error = `Impossible de vérifier les favoris : ${err.message}`;
        }
    }

    // Setting shuffle to its current value is a no-op for Premium and returns 403 PREMIUM_REQUIRED for free accounts.
    async probePremium() {
        if (this.plan !== "unknown" || this.probes >= 3 || typeof this.playback?.shuffle_state !== "boolean") return;
        this.probes++;
        try {
            await this.request("PUT", "/me/player/shuffle", { query: { state: this.playback.shuffle_state } });
            this.plan = "premium";
        } catch (err) {
            if (err.reason === "PREMIUM_REQUIRED") this.plan = "free";
        }
        this.updatePlan();
    }

    /* actions (les contrôles sont refusés côté client pour un compte gratuit) */

    async act(fn, { premium = true, refresh = true } = {}) {
        if (premium && !this.caps.control) return this.host.toast(PREMIUM_HINT, "info");
        try {
            await fn();
            if (refresh) setTimeout(() => this.refreshPlayback(), 350);
        } catch (err) {
            if (err.reason === "PREMIUM_REQUIRED") {
                this.plan = "free";
                this.updatePlan();
            }
            this.host.toast(err.message, "error");
            this.refreshPlayback();
        }
    }

    togglePlay() {
        if (!this.caps.control) return this.host.toast(PREMIUM_HINT, "info");
        const pb = this.playback;
        const playing = pb?.is_playing;
        if (pb) {
            pb.progress_ms = this.position();
            pb.fetchedAt = Date.now();
            pb.is_playing = !playing;
            this.update();
        }
        return this.act(() => this.player("PUT", playing ? "/me/player/pause" : "/me/player/play"));
    }

    toggleLike() {
        const item = this.playback?.item;
        if (item?.type !== "track") return;
        const value = !this.liked.value;
        return this.act(async () => {
            await this.request(value ? "PUT" : "DELETE", "/me/library", { query: { uris: item.uri } });
            this.liked = { uri: item.uri, value };
            this.update();
        }, { premium: false });
    }

    async share(track) {
        const url = track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`;
        try {
            await navigator.clipboard.writeText(url);
            this.host.toast("Lien Spotify copié : collez-le dans un salon.", "success");
        } catch {
            this.host.toast(url, "info");
        }
    }

    /* interface */

    render() {
        if (!this.root) {
            this.root = h("section", { class: "mt-spotify", "aria-labelledby": "modstab-spotify-title" });
            this.paint();
        }
        return this.root;
    }

    paint() {
        if (this.stopped) return;
        this.paintDock();
        if (!this.root) return;
        const state = h("span", { "aria-live": "polite" }, this.enabled ? "Actif" : "Inactif");
        const toggle = h("input", {
            type: "checkbox", role: "switch", "aria-label": "Activer le plugin Spotify", "data-focus-key": "toggle-original-spotify",
            checked: this.enabled,
            onchange: (e) => {
                this.enabled = e.target.checked;
                this.save("spotifyEnabled", this.enabled);
                if (this.enabled && this.connected && !this.me) this.loadProfile().then(() => this.refreshPlayback());
                else if (this.enabled) this.refreshPlayback();
                this.paint();
                this.root.querySelector("[data-focus-key=toggle-original-spotify]")?.focus();
            },
        });
        const head = h("div", { class: "mt-sp-head" },
            h("h3", { id: "modstab-spotify-title" }, "Spotify"),
            h("div", { class: "mt-switch-wrap" }, state, h("label", { class: "mt-switch" }, toggle, h("span", { "aria-hidden": "true" }))));
        const body = !this.enabled
            ? [h("p", { class: "mt-muted" }, "Contrôlez Spotify sans quitter Discord : lecture, file d’attente, recherche et partage. Les fonctions s’adaptent automatiquement à votre abonnement (Premium ou gratuit). Désactivé par défaut.")]
            : this.connected ? [
                h("p", { class: "mt-muted" }, "Le lecteur Spotify est accessible juste au-dessus du panneau utilisateur de Discord, même lorsque ModsTab est fermé."),
                h("div", {}, h("button", { class: "mt-btn", onclick: () => {
                    this.setCollapsed(false);
                    this.ui.play.focus();
                } }, "Afficher le lecteur Spotify")),
            ] : this.setupView();
        this.root.replaceChildren(head, ...body);
        this.updatePlan();
        this.update();
    }

    paintDock() {
        if (!this.enabled || !this.connected) {
            this.dock?.remove();
            this.dock = null;
            this.panelObserver?.disconnect();
            this.anchorPanel = null;
            this.ui = {};
            return;
        }
        if (!this.dock) {
            this.ui = {};
            this.planBadge = h("span", { class: "mt-badge" });
            this.collapseButton = h("button", {
                class: "mt-btn", "aria-controls": "modstab-spotify-controls",
                onclick: () => this.setCollapsed(!this.collapsed),
            });
            this.dockBody = h("div", { id: "modstab-spotify-controls", class: "mt-sp-dock-body" }, ...this.playerView());
            this.dock = h("section", { id: SPOTIFY_DOCK_ID, "aria-label": "Lecteur Spotify" },
                h("div", { class: "mt-sp-dock-head" }, h("strong", {}, "Spotify"), this.planBadge, this.collapseButton),
                this.dockBody);
            this.dock.addEventListener("keydown", (event) => {
                if (event.key !== "Escape") return;
                event.stopPropagation();
                this.setCollapsed(true);
                this.collapseButton.focus();
            });
            this.setCollapsed(Boolean(this.collapsed));
        }
        if (!this.dock.isConnected) document.body.append(this.dock);
        this.positionDock();
        this.updatePlan();
        this.update();
    }

    setCollapsed(collapsed) {
        this.collapsed = collapsed;
        if (!this.dock) return;
        this.dock.dataset.collapsed = String(collapsed);
        this.dockBody.hidden = collapsed;
        this.collapseButton.textContent = collapsed ? "Ouvrir" : "Réduire";
        this.collapseButton.setAttribute("aria-expanded", String(!collapsed));
        this.collapseButton.setAttribute("aria-label", collapsed ? "Ouvrir le lecteur Spotify" : "Réduire le lecteur Spotify");
        this.positionDock();
    }

    positionDock() {
        if (!this.dock?.isConnected) return;
        const panel = Array.from(document.querySelectorAll('[class*="panels_"]'))
            .find((el) => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0);
        if (panel !== this.anchorPanel) {
            this.panelObserver?.disconnect();
            this.anchorPanel = panel;
            if (panel) this.panelObserver?.observe(panel);
        }
        if (!panel) {
            Object.assign(this.dock.style, { left: "", right: "", bottom: "", maxHeight: "" });
            return;
        }
        const bounds = panel.getBoundingClientRect();
        const bottom = Math.max(16, Math.min(window.innerHeight - bounds.top + 8, window.innerHeight - 64));
        const left = Math.max(16, Math.min(bounds.left, window.innerWidth - this.dock.offsetWidth - 16));
        Object.assign(this.dock.style, {
            left: `${left}px`, right: "auto", bottom: `${bottom}px`,
            maxHeight: `${window.innerHeight - bottom - 16}px`,
        });
    }

    setupView() {
        const error = h("p", { class: "mt-sp-error", role: "alert" }, this.error);
        const button = h("button", { class: "mt-btn", disabled: this.connecting, onclick: async () => {
            this.connecting = true;
            error.textContent = "";
            button.disabled = true;
            button.textContent = "En attente de l’autorisation dans votre navigateur…";
            try {
                if (await this.connect()) {
                    this.connecting = false;
                    this.paint();
                    this.refreshPlayback();
                }
            } catch (err) {
                this.connecting = false;
                this.error = err.message;
                this.paint();
            }
        } }, this.connecting ? "En attente de l’autorisation dans votre navigateur…" : "Se connecter à Spotify");
        const port = h("input", { class: "mt-search", type: "number", min: "1024", max: "65535", value: String(this.port), "aria-label": "Port local",
            onchange: (e) => { this.port = Number(e.target.value); this.save("spotifyPort", this.port); redirect.textContent = this.redirectUri; } });
        const redirect = h("code", {}, this.redirectUri);
        if (this.manual) {
            const input = h("input", { class: "mt-search", type: "text", autocomplete: "off", spellcheck: "false", "aria-label": "Adresse de redirection" });
            const submit = async () => {
                error.textContent = "";
                try {
                    await this.completeManual(input.value);
                    this.paint();
                    this.refreshPlayback();
                } catch (err) {
                    error.textContent = err.message;
                }
            };
            return [
                h("p", { class: "mt-sp-notice" }, "Autorisez ModsTab dans le navigateur. La page finale affichera une erreur de connexion : c’est normal. Copiez alors l’adresse complète de cette page (elle commence par ", this.redirectUri, ") et collez-la ci-dessous."),
                h("div", { class: "mt-sp-search" }, input, h("button", { class: "mt-btn", onclick: submit }, "Valider")),
                error,
                h("div", {}, h("button", { class: "mt-btn mt-btn-secondary", onclick: () => { this.manual = null; this.paint(); } }, "Annuler")),
            ];
        }
        return [
            h("p", { class: "mt-sp-notice" }, "1. Créez une app sur developer.spotify.com/dashboard. 2. Ajoutez l’URI de redirection ci-dessous dans ses réglages. 3. Collez son Client ID ici. Aucun secret n’est nécessaire (PKCE)."),
            h("div", { class: "mt-sp-form" },
                h("label", { class: "mt-field" }, "Client ID",
                    h("input", { class: "mt-search", type: "text", value: this.clientId, autocomplete: "off", spellcheck: "false",
                        onchange: (e) => { this.clientId = e.target.value.trim(); this.save("spotifyClientId", this.clientId); } })),
                h("label", { class: "mt-field" }, "Port local", port),
                h("div", { class: "mt-field" }, "URI de redirection à enregistrer", redirect)),
            error,
            h("div", {}, button),
        ];
    }

    control(label, iconName, onclick, key) {
        const btn = h("button", { class: "mt-sp-ico", "aria-label": label, title: label, onclick }, icon(iconName));
        this.ui[key] = btn;
        return btn;
    }

    playerView() {
        const ui = this.ui;
        ui.cover = h("img", { class: "mt-sp-cover", alt: "", hidden: true });
        ui.title = h("div", { class: "mt-sp-title" }, "Rien en cours de lecture");
        ui.sub = h("div", { class: "mt-sp-sub" }, "Lancez un titre dans Spotify ou depuis la recherche ci-dessous.");
        ui.cur = h("span", {}, "0:00");
        ui.dur = h("span", {}, "0:00");
        ui.seek = h("input", { type: "range", min: "0", max: "1000", value: "0", "aria-label": "Position dans le titre",
            oninput: () => { this.seeking = true; },
            onchange: (e) => {
                const target = Math.round(Number(e.target.value) / 1000 * (this.playback?.item?.duration_ms || 0));
                this.seeking = false;
                this.act(() => this.player("PUT", "/me/player/seek", { query: { position_ms: target } }));
            } });
        ui.volume = h("input", { type: "range", min: "0", max: "100", value: "50", "aria-label": "Volume",
            onchange: (e) => this.act(() => this.player("PUT", "/me/player/volume", { query: { volume_percent: e.target.value } })) });
        const controls = h("div", { class: "mt-sp-controls", role: "group", "aria-label": "Contrôles de lecture" },
            this.control("Titre précédent", "prev", () => this.act(() => this.player("POST", "/me/player/previous")), "prev"),
            this.control("Lecture / pause", "play", () => this.togglePlay(), "play"),
            this.control("Titre suivant", "next", () => this.act(() => this.player("POST", "/me/player/next")), "next"),
            this.control("Lecture aléatoire", "shuffle", () => this.act(() => this.player("PUT", "/me/player/shuffle", { query: { state: !this.playback?.shuffle_state } })), "shuffle"),
            this.control("Répéter", "repeat", () => {
                const next = { off: "context", context: "track", track: "off" }[this.playback?.repeat_state || "off"];
                return this.act(() => this.player("PUT", "/me/player/repeat", { query: { state: next } }));
            }, "repeat"),
            this.control("Aimer ce titre", "heart", () => this.toggleLike(), "like"),
            this.control("Copier le lien du titre", "share", () => this.playback?.item && this.share(this.playback.item), "share"),
            h("label", { class: "mt-sp-volume" }, "Vol.", ui.volume));
        ui.notice = h("p", { class: "mt-sp-notice", hidden: true }, "Compte gratuit détecté : lecture seule. Le titre en cours, la recherche, les mentions J’aime et le partage restent disponibles ; les contrôles de lecture, la file d’attente, le volume et la position nécessitent Spotify Premium.");
        ui.error = h("p", { class: "mt-sp-error", role: "alert" });
        ui.results = h("ul", { class: "mt-sp-list", "aria-label": "Résultats" });
        ui.query = h("input", { class: "mt-search", type: "search", placeholder: "Rechercher un titre…", "aria-label": "Rechercher un titre",
            onkeydown: (e) => e.key === "Enter" && this.search() });
        ui.queueBtn = h("button", { class: "mt-btn mt-btn-secondary", onclick: () => this.showQueue() }, "File d’attente");
        return [
            h("div", { class: "mt-sp-now" }, ui.cover,
                h("div", { class: "mt-sp-meta" }, ui.title, ui.sub, h("div", { class: "mt-sp-bar", "aria-hidden": "false" }, ui.cur, ui.seek, ui.dur))),
            controls, ui.notice, ui.error,
            h("div", { class: "mt-sp-search" }, ui.query,
                h("button", { class: "mt-btn", onclick: () => this.search() }, "Rechercher"), ui.queueBtn,
                h("button", { class: "mt-btn mt-btn-secondary", onclick: () => this.disconnect() }, "Se déconnecter")),
            ui.results,
        ];
    }

    disconnect() {
        this.clearSession();
        this.host.toast("Spotify déconnecté.", "info");
    }

    row(track, actions) {
        const art = track.album?.images?.[track.album.images.length - 1]?.url;
        return h("li", { class: "mt-sp-row" },
            SPOTIFY_COVER.test(art || "") ? h("img", { src: art, alt: "" }) : h("span", { class: "mt-sp-thumb" }),
            h("div", { class: "mt-sp-meta" },
                h("div", { class: "mt-sp-title", style: "font-size:13px" }, track.name),
                h("div", { class: "mt-sp-sub" }, (track.artists || []).map((a) => a.name).join(", "))),
            ...actions);
    }

    trackActions(track) {
        const link = track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`;
        const premium = this.caps.control;
        return [
            premium
                ? h("button", { class: "mt-btn", onclick: () => this.act(() => this.player("PUT", "/me/player/play", { body: { uris: [track.uri] } })) }, "Lire")
                : h("button", { class: "mt-btn", title: PREMIUM_HINT, onclick: () => this.openExternal(link) }, "Ouvrir"),
            premium ? h("button", { class: "mt-btn mt-btn-secondary", onclick: () => this.act(async () => {
                await this.player("POST", "/me/player/queue", { query: { uri: track.uri } });
                this.host.toast("Ajouté à la file d’attente.", "success");
            }, { refresh: false }) }, "+ File") : null,
            h("button", { class: "mt-btn mt-btn-secondary", onclick: () => this.share(track) }, "Partager"),
        ];
    }

    async search() {
        const q = this.ui.query.value.trim();
        if (!q) return;
        try {
            const data = await this.request("GET", "/search", { query: { q, type: "track", limit: 10 } });
            const tracks = data?.tracks?.items?.filter(Boolean) || [];
            this.ui.results.replaceChildren(...(tracks.length
                ? tracks.map((t) => this.row(t, this.trackActions(t)))
                : [h("li", { class: "mt-muted" }, "Aucun résultat.")]));
        } catch (err) {
            this.host.toast(err.message, "error");
        }
    }

    async showQueue() {
        if (!this.caps.queue) return this.host.toast(PREMIUM_HINT, "info");
        try {
            const data = await this.request("GET", "/me/player/queue");
            const items = (data?.queue || []).slice(0, 10).filter((t) => t.type === "track");
            this.ui.results.replaceChildren(...(items.length
                ? items.map((t) => this.row(t, [h("button", { class: "mt-btn mt-btn-secondary", onclick: () => this.share(t) }, "Partager")]))
                : [h("li", { class: "mt-muted" }, "La file d’attente est vide.")]));
        } catch (err) {
            this.host.toast(err.message, "error");
        }
    }

    updatePlan() {
        const labels = { premium: "Premium", free: "Gratuit", unknown: "Abonnement : détection…" };
        if (this.planBadge) this.planBadge.textContent = `${this.me?.name ? `${this.me.name} · ` : ""}${labels[this.plan]}`;
        const ui = this.ui;
        if (!ui?.play) return;
        const caps = this.caps;
        for (const key of ["prev", "play", "next", "shuffle", "repeat"]) {
            ui[key].disabled = !caps.control;
            ui[key].title = caps.control ? ui[key].getAttribute("aria-label") : PREMIUM_HINT;
        }
        ui.seek.disabled = !caps.seek;
        ui.volume.disabled = !caps.volume;
        ui.volume.parentElement.hidden = !caps.volume;
        ui.queueBtn.hidden = !caps.queue;
        ui.notice.hidden = this.plan !== "free";
    }

    position() {
        const pb = this.playback;
        if (!pb) return 0;
        const elapsed = pb.is_playing ? Date.now() - pb.fetchedAt : 0;
        return Math.min(pb.item.duration_ms, pb.progress_ms + elapsed);
    }

    update() {
        const ui = this.ui;
        if (!ui?.play || !this.dock?.isConnected) return;
        const pb = this.playback;
        const item = pb?.item;
        ui.error.textContent = this.error;
        ui.title.textContent = item?.name || "Rien en cours de lecture";
        ui.sub.textContent = item
            ? (item.artists?.map((a) => a.name) || [item.show?.name]).filter(Boolean).join(", ")
            : "Lancez un titre dans Spotify ou depuis la recherche ci-dessous.";
        const art = item?.album?.images?.[0]?.url || item?.images?.[0]?.url;
        ui.cover.hidden = !SPOTIFY_COVER.test(art || "");
        if (!ui.cover.hidden && ui.cover.getAttribute("src") !== art) ui.cover.src = art;
        const playIcon = pb?.is_playing ? "pause" : "play";
        if (ui.play.dataset.icon !== playIcon) {
            ui.play.dataset.icon = playIcon;
            ui.play.replaceChildren(icon(playIcon));
        }
        ui.shuffle.setAttribute("aria-pressed", String(pb?.shuffle_state === true));
        ui.repeat.setAttribute("aria-pressed", String((pb?.repeat_state || "off") !== "off"));
        ui.repeat.title = ui.repeat.getAttribute("aria-label") + (pb?.repeat_state === "track" ? " (titre)" : "");
        ui.like.setAttribute("aria-pressed", String(this.liked.value && this.liked.uri === item?.uri));
        ui.like.disabled = item?.type !== "track";
        ui.share.disabled = item?.type !== "track";
        if (pb?.device?.volume_percent != null && document.activeElement !== ui.volume) ui.volume.value = pb.device.volume_percent;
        this.updateProgress();
    }

    updateProgress() {
        const ui = this.ui;
        const duration = this.playback?.item?.duration_ms || 0;
        const position = this.position();
        ui.cur.textContent = clock(position);
        ui.dur.textContent = clock(duration);
        if (!this.seeking) ui.seek.value = duration ? Math.round(position / duration * 1000) : 0;
    }

    onTick() {
        if (!this.enabled || !this.connected || !this.dock?.isConnected || document.hidden) return;
        this.updateProgress();
        if (++this.tickCount % 3 === 0) this.refreshPlayback();
    }
}

module.exports = class ModsTab {
    constructor(meta) {
        this.meta = meta;
        this.view = "catalog"; // "installed" | "catalog" | "originals" | "create"
        this.query = "";
        this.kind = "plugin";
        this.category = "all";
        this.sort = "popular";
        this.page = 1;
        this.detail = null;
        this.catalog = null;
        this.catalogState = "idle"; // idle | loading | error | ready
        this.catalogError = "";
        this.busy = new Set();
        this._raf = 0;
        this.graphiteEnabled = false;
        this.themeDraft = newThemeDraft();
        this.themeEditorMode = "basic";
        this.themeExporting = false;
        this.spotify = new SpotifyOriginal(this);
    }

    /* ───────────── cycle de vie ───────────── */

    start() {
        try {
            const saved = BdApi.Data.load("ModsTab", "themeDraft");
            if (saved != null) this.themeDraft = { ...validateThemeDraft(saved) };
        } catch (err) {
            this.toast(`Impossible de charger le brouillon du thème : ${err.message}`, "error");
        }
        this.graphiteEnabled = false;
        try {
            this.graphiteEnabled = BdApi.Data.load("ModsTab", "graphiteEnabled") === true;
        } catch (err) {
            this.toast(`Impossible de charger le thème Graphite : ${err.message}`, "error");
        }
        this.addStyle();
        this.applyGraphite();
        this.spotify.start();
        this.observer = new MutationObserver(() => this.scheduleSync());
        this.observer.observe(document.body, { childList: true, subtree: true });
        this.syncTab();
    }

    stop() {
        this.observer?.disconnect();
        cancelAnimationFrame(this._raf);
        this.closePanel();
        this.spotify.stop();
        document.querySelectorAll(`[${TAB_ATTR}]`).forEach((n) => n.remove());
        this.removeStyle();
        document.documentElement.removeAttribute(THEME_ATTR);
    }

    addStyle() {
        if (window.BdApi?.DOM?.addStyle) BdApi.DOM.addStyle(STYLE_ID, CSS + GRAPHITE_CSS + SPOTIFY_CSS + SPOTIFY_DOCK_CSS + EDITOR_CSS);
        else document.head.append(h("style", { id: STYLE_ID }, CSS + GRAPHITE_CSS + SPOTIFY_CSS + SPOTIFY_DOCK_CSS + EDITOR_CSS));
    }

    removeStyle() {
        if (window.BdApi?.DOM?.removeStyle) BdApi.DOM.removeStyle(STYLE_ID);
        else document.getElementById(STYLE_ID)?.remove();
    }

    applyGraphite() {
        if (this.graphiteEnabled) document.documentElement.setAttribute(THEME_ATTR, "graphite");
        else document.documentElement.removeAttribute(THEME_ATTR);
    }

    themeShowcase() {
        const state = h("span", { "aria-live": "polite" }, this.graphiteEnabled ? "Actif" : "Inactif");
        const toggle = h("input", {
            type: "checkbox", role: "switch", "aria-label": "Activer le thème Graphite",
            "data-focus-key": "toggle-original-graphite",
            "aria-describedby": "modstab-graphite-description",
            checked: this.graphiteEnabled,
            onchange: (e) => {
                try {
                    BdApi.Data.save("ModsTab", "graphiteEnabled", e.target.checked);
                    this.graphiteEnabled = e.target.checked;
                    this.applyGraphite();
                    state.textContent = this.graphiteEnabled ? "Actif" : "Inactif";
                } catch (err) {
                    e.target.checked = this.graphiteEnabled;
                    this.toast(`Impossible d’enregistrer le thème Graphite : ${err.message}`, "error");
                }
            },
        });
        return h("section", { class: "mt-theme", "aria-labelledby": "modstab-graphite-title" },
            h("div", {},
                h("div", { class: "mt-theme-label" }, "ModsTab Originals · Thème inclus"),
                h("h3", { id: "modstab-graphite-title" }, "Graphite"),
                h("p", { id: "modstab-graphite-description" }, "Discord au calme, même la nuit. Des noirs doux, des gris veloutés et une touche de bleu ardoise. Moins de couleurs décoratives, sans perdre celles qui comptent."),
                h("div", { class: "mt-theme-swatches", "aria-hidden": "true" },
                    ...["#101010", "#202020", "#555555", "#a8a8a8", "#ededed"].map((color) => h("span", { style: `--swatch:${color}` }))),
                h("div", { class: "mt-theme-control" },
                    h("div", { class: "mt-switch-wrap" }, state,
                        h("label", { class: "mt-switch" }, toggle, h("span", { "aria-hidden": "true" }))),
                    h("span", { class: "mt-theme-note" }, "Sans téléchargement · Sans ressource externe")),
                h("p", { class: "mt-theme-note", style: "margin-top:12px;font-size:10px" }, "Avatars, médias, rôles, statuts et alertes gardent leurs couleurs. Aucun filtre global. Désactiver Graphite restaure votre apparence précédente.")),
            h("div", { class: "mt-theme-sample", "aria-hidden": "true" },
                h("div", { class: "mt-sample-servers" }, h("i"), h("i"), h("i"), h("i")),
                h("div", { class: "mt-sample-channels" }, h("i"), h("i"), h("i"), h("i"), h("i")),
                h("div", { class: "mt-sample-chat" },
                    h("div", { class: "mt-sample-title" }, "# slow-living"),
                    ...[0, 1].map(() => h("div", { class: "mt-sample-message" },
                        h("span", { class: "mt-sample-avatar" }),
                        h("div", { class: "mt-sample-lines" }, h("i"), h("i")))),
                    h("div", { class: "mt-sample-compose" }))));
    }

    /* ───────────── onglet dans la barre latérale ───────────── */

    scheduleSync() {
        if (this._raf) return;
        this._raf = requestAnimationFrame(() => {
            this._raf = 0;
            this.syncTab();
            this.spotify.positionDock();
        });
    }

    findQuestsLink() {
        const labelRe = /^(qu[êe]tes?|quests?)$/i;
        for (const nav of document.querySelectorAll("nav")) {
            const exact = nav.querySelector('a[href="/quest-home"], a[href="/quests"]');
            if (exact) return exact;
            for (const a of nav.querySelectorAll("a")) {
                if (!a.closest(`[${TAB_ATTR}]`) && labelRe.test(a.textContent.trim())) return a;
            }
        }
        return null;
    }

    syncTab() {
        const link = this.findQuestsLink();
        if (!link) return;
        const item = link.closest("li") || link.parentElement;
        const existing = document.querySelector(`[${TAB_ATTR}]`);
        if (existing && existing.previousElementSibling === item) return;
        existing?.remove();
        item.after(this.buildTab(item));
    }

    buildTab(item) {
        const tab = item.cloneNode(true);
        tab.setAttribute(TAB_ATTR, "1");
        tab.removeAttribute("data-list-item-id");

        // On retire id et état « sélectionné » hérités de l'élément Quêtes.
        for (const n of [tab, ...tab.querySelectorAll("*")]) {
            n.removeAttribute("id");
            n.removeAttribute("aria-selected");
            n.removeAttribute("aria-current");
            for (const c of [...n.classList]) if (/selected/i.test(c)) n.classList.remove(c);
        }

        const launcher = tab.matches("a") ? tab : tab.querySelector("a") || tab;
        launcher.removeAttribute("href");
        launcher.setAttribute("role", "button");
        launcher.setAttribute("tabindex", "0");
        launcher.setAttribute("aria-label", "Ouvrir l’onglet Mods");
        launcher.setAttribute("aria-haspopup", "dialog");
        launcher.setAttribute("aria-expanded", String(Boolean(this.root)));
        launcher.style.cursor = "pointer";
        this.launcher = launcher;
        launcher.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            e.stopPropagation();
            this.openPanel();
        });

        // Libellé : premier nœud texte non vide = "Mods", les autres (badges) sont vidés.
        const walker = document.createTreeWalker(tab, NodeFilter.SHOW_TEXT);
        let first = true;
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (!node.nodeValue.trim()) continue;
            node.nodeValue = first ? "Mods" : "";
            first = false;
        }

        // Icône : pièce de puzzle.
        const svg = tab.querySelector("svg");
        if (svg) {
            svg.setAttribute("viewBox", "0 0 24 24");
            svg.innerHTML = `<path fill="currentColor" d="${ICON_PATH}"/>`;
        }

        tab.addEventListener(
            "click",
            (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openPanel();
            },
            true
        );
        return tab;
    }

    /* ───────────── panneau Mods ───────────── */

    openPanel() {
        this.closePanel();
        this.opener = document.activeElement;
        this.launcher?.setAttribute("aria-expanded", "true");
        this.detail = null;
        this.searchInput = h("input", {
            class: "mt-search",
            type: "search",
            id: "modstab-search",
            placeholder: "Un plugin, un thème, un créateur…",
            "aria-label": "Rechercher dans le catalogue",
            value: this.query,
            oninput: (e) => {
                this.query = e.target.value;
                this.page = 1;
                clearTimeout(this._searchTimer);
                this._searchTimer = setTimeout(() => this.render(), 140);
            },
            onkeydown: (e) => {
                if (e.key !== "Enter") return;
                clearTimeout(this._searchTimer);
                this.render();
            },
        });
        this.tabInstalled = h("button", {
            id: "modstab-tab-installed",
            class: "mt-tab",
            role: "tab",
            "aria-controls": "modstab-panel-content",
            onclick: () => this.setView("installed"),
        }, "Ma bibliothèque");
        this.tabCatalog = h("button", {
            id: "modstab-tab-catalog",
            class: "mt-tab",
            role: "tab",
            "aria-controls": "modstab-panel-content",
            onclick: () => this.setView("catalog"),
        }, "Découvrir");
        this.tabOriginals = h("button", {
            id: "modstab-tab-originals",
            class: "mt-tab",
            role: "tab",
            "aria-controls": "modstab-panel-content",
            onclick: () => this.setView("originals"),
        }, "Originals");
        this.tabCreate = h("button", {
            id: "modstab-tab-create", class: "mt-tab", role: "tab", "aria-controls": "modstab-panel-content",
            onclick: () => this.setView("create"),
        }, "Créer");
        this.tabs = [this.tabCatalog, this.tabInstalled, this.tabOriginals, this.tabCreate];
        this.kindButtons = ["plugin", "theme"].map((kind) => h("button", {
            class: "mt-chip", "aria-pressed": String(this.kind === kind),
            onclick: () => this.setKind(kind),
        }, kind === "theme" ? "Thèmes" : "Plugins"));
        this.folderButton = h("button", {
            class: "mt-btn mt-btn-secondary", type: "button", onclick: () => this.openAddonFolder(this.kind),
        });
        this.kindControls = h("div", { class: "mt-kinds", role: "group", "aria-label": "Type de création" }, ...this.kindButtons, this.folderButton);
        this.categorySelect = h("select", {
            class: "mt-select",
            "aria-label": "Catégorie",
            onchange: (e) => this.setCategory(e.target.value),
        });
        this.sortSelect = h("select", {
            class: "mt-select",
            "aria-label": "Trier par",
            onchange: (e) => {
                this.sort = e.target.value;
                this.page = 1;
                this.render();
            },
        },
        ...[["popular", "Les plus téléchargés"], ["liked", "Les plus aimés"], ["updated", "Mis à jour récemment"], ["newest", "Les nouveautés"], ["name", "Nom : A → Z"]]
            .map(([value, label]) => h("option", { value }, label)));
        this.sortSelect.value = this.sort;
        this.categoryField = h("label", { class: "mt-field" }, "Catégorie", this.categorySelect);
        this.sortField = h("label", { class: "mt-field" }, "Trier par", this.sortSelect);
        this.toolbar = h("div", { class: "mt-toolbar" },
            h("label", { class: "mt-field" }, "Recherche",
                h("div", { class: "mt-input-wrap" }, icon("search"), this.searchInput)),
            this.categoryField, this.sortField);
        this.chips = h("div", { class: "mt-chips", "aria-label": "Catégories rapides" });
        this.catalogCount = h("span", {}, "Chargement du catalogue…");
        this.hero = h("div", { class: "mt-hero" },
            h("div", {},
                h("div", { class: "mt-eyebrow" }, "Le terrain de jeu de votre Discord"),
                h("h3", {}, "Votre Discord. ", h("span", {}, "Votre univers.")),
                h("p", {}, "Découvrez les créations de la communauté et composez un Discord qui vous ressemble."),
                h("div", { class: "mt-hero-meta" },
                    h("span", {}, h("span", { class: "mt-dot", "aria-hidden": "true" }), "Catalogue officiel BetterDiscord"),
                    this.catalogCount)),
            h("div", { class: "mt-art", "aria-hidden": "true" },
                h("span", { class: "mt-orbit" }), h("span", { class: "mt-orbit" }),
                h("div", { class: "mt-art-icon" }, icon("puzzle")), h("span", { class: "mt-spark" }, "✦")));
        this.resultsStatus = h("div", { class: "mt-sr-only", role: "status", "aria-live": "polite", "aria-atomic": "true" });
        this.body = h("div", {
            id: "modstab-panel-content",
            class: "mt-body",
            role: "tabpanel",
            tabindex: "0",
        });
        this.builtinTheme = this.themeShowcase();
        this.scroller = h("div", { class: "mt-scroll" }, this.hero, this.kindControls, this.toolbar, this.chips, this.resultsStatus, this.body);

        this.root = h(
            "div",
            {
                id: PANEL_ID,
                onclick: (e) => e.target === this.root && this.closePanel(),
            },
            h(
                "section",
                { class: "mt-win", role: "dialog", "aria-modal": "true", "aria-labelledby": "modstab-title" },
                h(
                    "div",
                    { class: "mt-head" },
                    h("div", { class: "mt-brand" },
                        h("span", { class: "mt-brand-icon" }, icon("puzzle")),
                        h("h2", { id: "modstab-title" }, "ModsTab")),
                    h("div", { class: "mt-tabs", role: "tablist", "aria-label": "Navigation ModsTab" }, ...this.tabs),
                    h("button", { class: "mt-close", "aria-label": "Fermer", onclick: () => this.closePanel() }, icon("close"))
                ),
                this.scroller
            )
        );
        document.body.append(this.root);

        this._onKey = (e) => {
            // Les confirmations BetterDiscord gèrent leur propre clavier et leur focus.
            if (this.confirming || (e.key !== "Tab" && !this.root?.contains(e.target))) return;
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                if (this.detail) this.closeDetail();
                else this.closePanel();
                return;
            }
            if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
                const tabs = this.tabs;
                const index = tabs.indexOf(document.activeElement);
                if (index === -1) return;
                e.preventDefault();
                const next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1
                    : (index + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
                this.setView(["catalog", "installed", "originals", "create"][next]);
                tabs[next].focus();
                return;
            }
            if (e.key !== "Tab" || !this.root) return;
            const focusable = [...this.root.querySelectorAll('button:not(:disabled):not([tabindex="-1"]), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')]
                .filter((node) => node.getClientRects().length && !node.closest("[hidden]"));
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && (document.activeElement === first || !this.root.contains(document.activeElement))) {
                e.preventDefault();
                last?.focus();
            } else if (!e.shiftKey && (document.activeElement === last || !this.root.contains(document.activeElement))) {
                e.preventDefault();
                first?.focus();
            }
        };
        document.addEventListener("keydown", this._onKey);

        this.render();
        (["originals", "create"].includes(this.view) ? this.tabs.find((tab) => tab.id === `modstab-tab-${this.view}`) : this.searchInput).focus();
        if (this.catalogState === "idle" || this.catalogState === "error") this.loadCatalog();
    }

    closePanel() {
        clearTimeout(this._searchTimer);
        if (this._onKey) document.removeEventListener("keydown", this._onKey);
        this._onKey = null;
        this.root?.remove();
        this.root = null;
        document.getElementById(PANEL_ID)?.remove();
        this.launcher?.setAttribute("aria-expanded", "false");
        if (this.opener?.isConnected) this.opener.focus();
        this.opener = null;
        this.detail = null;
    }

    setView(view) {
        clearTimeout(this._searchTimer);
        this.view = view;
        this.detail = null;
        this.page = 1;
        this.render();
        this.scroller.scrollTop = 0;
    }

    setCategory(category) {
        this.category = category;
        this.page = 1;
        this.render();
    }

    setKind(kind) {
        clearTimeout(this._searchTimer);
        this.kind = kind;
        this.detail = null;
        this.category = "all";
        this.query = "";
        this.searchInput.value = "";
        this.page = 1;
        this.render();
    }

    get kindLabel() {
        return this.kind === "theme" ? "thèmes" : "plugins";
    }

    manager(type) {
        if (type === "theme") return BdApi.Themes;
        if (type === "plugin") return BdApi.Plugins;
        throw new Error("type de création inconnu");
    }

    async openAddonFolder(type) {
        const label = type === "theme" ? "thèmes" : "plugins";
        try {
            const folder = this.manager(type).folder;
            if (typeof folder !== "string" || !folder.trim()) throw new Error("Dossier BetterDiscord indisponible.");
            const error = await require("electron").shell.openPath(folder);
            if (error) throw new Error(error);
        } catch (err) {
            this.toast(`Impossible d’ouvrir le dossier des ${label} : ${err.message}`, "error");
        }
    }

    resetFilters() {
        this.query = "";
        this.category = "all";
        this.page = 1;
        this.searchInput.value = "";
        this.render();
        this.searchInput.focus();
    }

    render() {
        if (!this.root) return;
        const focusKey = document.activeElement?.getAttribute("data-focus-key");
        const scrollTop = this.scroller.scrollTop;
        this.tabs.forEach((tab) => {
            const selected = tab.id === `modstab-tab-${this.view}`;
            tab.classList.toggle("on", selected);
            tab.setAttribute("aria-selected", String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });
        const installed = this.installedAddons();
        this.tabInstalled.replaceChildren("Ma bibliothèque", h("span", { class: "mt-count" }, installed.length));
        const catalogView = this.view === "catalog";
        const originalsView = this.view === "originals";
        const createView = this.view === "create";
        this.hero.hidden = !catalogView || Boolean(this.detail);
        this.kindControls.hidden = originalsView || createView || Boolean(this.detail);
        this.kindButtons.forEach((button, index) => button.setAttribute("aria-pressed", String(this.kind === (index === 0 ? "plugin" : "theme"))));
        this.folderButton.textContent = `Ouvrir le dossier des ${this.kindLabel}`;
        this.toolbar.hidden = originalsView || createView || Boolean(this.detail);
        this.chips.hidden = !catalogView || Boolean(this.detail) || this.catalogState !== "ready";
        this.categoryField.hidden = !catalogView;
        this.sortField.hidden = !catalogView;
        this.searchInput.parentElement.parentElement.style.gridColumn = catalogView ? "" : "1 / -1";
        const catalog = (this.catalog || []).filter((p) => p.type === this.kind);
        this.catalogCount.textContent = this.catalogState === "ready" ? `${numberFormat.format(catalog.length)} ${this.kindLabel} à explorer`
            : this.catalogState === "error" ? "Catalogue indisponible" : "Chargement du catalogue…";
        const categories = [...new Set(catalog.flatMap((p) => p.tags))].sort((a, b) => this.tagLabel(a).localeCompare(this.tagLabel(b), "fr"));
        this.categorySelect.replaceChildren(h("option", { value: "all" }, "Toutes les catégories"),
            ...categories.map((tag) => h("option", { value: tag }, this.tagLabel(tag))));
        this.categorySelect.value = this.category;
        const quickTags = this.kind === "theme" ? ["dark", "light", "transparent", "customizable", "anime"] : ["enhancement", "utility", "chat", "voice", "fun"];
        this.chips.replaceChildren(...["all", ...quickTags.filter((tag) => categories.includes(tag))]
            .map((tag) => h("button", {
                class: "mt-chip", "aria-pressed": String(this.category === tag), "data-focus-key": `category-${tag}`,
                onclick: () => this.setCategory(tag),
            }, tag === "all" ? "Tout explorer" : this.tagLabel(tag))));
        this.body.setAttribute("aria-labelledby", `modstab-tab-${this.view}`);
        const rows = createView ? [this.renderThemeEditor()] : originalsView ? this.renderOriginals() : this.detail ? [this.renderDetail(this.detail)] : this.view === "installed" ? this.renderInstalled() : this.renderCatalog();
        this.body.replaceChildren(...rows);
        if (focusKey) {
            const target = [...this.root.querySelectorAll("[data-focus-key]")].find((node) => node.getAttribute("data-focus-key") === focusKey);
            (target && !target.disabled ? target : this.body).focus({ preventScroll: true });
        }
        this.scroller.scrollTop = scrollTop;
    }

    renderOriginals() {
        this.resultsStatus.textContent = "ModsTab Originals : 1 plugin, 1 thème intégrés.";
        return [h("div", { class: "mt-originals" },
            h("div", {},
                h("div", { class: "mt-section-head" }, h("h3", {}, "ModsTab Originals")),
                h("p", { class: "mt-muted" }, "Les plugins et thèmes créés pour ModsTab, intégrés et disponibles sans téléchargement.")),
            h("section", { "aria-labelledby": "modstab-originals-themes" },
                h("div", { class: "mt-section-head" }, h("h3", { id: "modstab-originals-themes" }, "Thèmes")),
                this.builtinTheme),
            h("section", { "aria-labelledby": "modstab-originals-plugins" },
                h("div", { class: "mt-section-head" }, h("h3", { id: "modstab-originals-plugins" }, "Plugins")),
                this.spotify.render()))];
    }

    saveThemeDraft() {
        try {
            BdApi.Data.save("ModsTab", "themeDraft", { ...validateThemeDraft(this.themeDraft) });
        } catch (err) {
            this.toast(`Brouillon non enregistré : ${err.message}`, "error");
        }
    }

    renderThemeEditor() {
        this.resultsStatus.textContent = "Créateur de thème avec aperçu Discord en direct.";
        const preview = themePreview();
        const status = h("p", { class: "mt-muted mt-editor-status", role: "status", "aria-live": "polite" });
        const exportButton = h("button", {
            class: "mt-btn", type: "submit", disabled: this.themeExporting,
        }, icon("download"), this.themeExporting ? "Export en cours…" : "Exporter vers ModsTab");
        const update = () => {
            try {
                preview.style.textContent = themeCSS(this.themeDraft);
                status.textContent = "";
                exportButton.disabled = this.themeExporting;
            } catch (err) {
                status.textContent = err.message;
                exportButton.disabled = true;
            }
        };
        const field = (key, label, props = {}) => {
            const input = h("input", {
                ...props, value: this.themeDraft[key], "aria-label": label,
                oninput: (e) => {
                    this.themeDraft[key] = props.type === "range" ? Number(e.target.value) : e.target.value;
                    if (output) output.value = `${e.target.value} px`;
                    update();
                },
                onchange: () => this.saveThemeDraft(),
            });
            const output = props.type === "range" ? h("output", {}, `${this.themeDraft[key]} px`) : null;
            return h("label", { class: "mt-field" }, label, input, output);
        };
        const preset = h("select", {
            class: "mt-select", "aria-label": "Palette de départ",
            onchange: (e) => {
                if (!Object.hasOwn(THEME_PRESETS, e.target.value)) return;
                Object.assign(this.themeDraft, THEME_PRESETS[e.target.value]);
                this.saveThemeDraft();
                this.render();
                this.body.querySelector('[aria-label="Palette de départ"]').focus();
            },
        }, h("option", { value: "" }, "Choisir une palette…"),
        ...[["nuit", "Nuit violette"], ["clair", "Clair"], ["foret", "Forêt"]].map(([value, label]) => h("option", { value }, label)));
        const font = h("select", {
            class: "mt-select", "aria-label": "Police",
            onchange: (e) => { this.themeDraft.font = e.target.value; update(); this.saveThemeDraft(); },
        }, ...[["discord", "Discord"], ["system", "Système"], ["mono", "Monospace"]].map(([value, label]) => h("option", { value }, label)));
        font.value = this.themeDraft.font;
        const advanced = h("div", {
            id: "modstab-editor-advanced", class: "mt-editor-advanced", hidden: this.themeEditorMode !== "advanced",
        },
        h("div", { class: "mt-editor-colors" }, ...Object.entries(THEME_COLORS)
            .filter(([key]) => key !== "primary" && key !== "accent")
            .map(([key, label]) => field(key, label, { type: "color" }))),
        field("spacing", "Espacement des messages", { type: "range", min: "4", max: "24", step: "1" }));
        const modeButtons = [["basic", "Basique"], ["advanced", "Avancé"]].map(([mode, label]) => h("button", {
            type: "button", class: "mt-chip", "aria-pressed": String(this.themeEditorMode === mode),
            "aria-controls": "modstab-editor-advanced",
            onclick: (event) => {
                this.themeEditorMode = mode;
                advanced.hidden = mode !== "advanced";
                modeButtons.forEach((button) => button.setAttribute("aria-pressed", String(button === event.currentTarget)));
            },
        }, label));
        update();
        return h("form", {
            class: "mt-editor",
            onsubmit: async (e) => {
                e.preventDefault();
                if (this.themeExporting) return;
                this.themeExporting = true;
                exportButton.disabled = true;
                exportButton.textContent = "Export en cours…";
                try {
                    const file = this.writeCreatedTheme();
                    status.textContent = `${file} exporté. Activez-le dans Ma bibliothèque → Thèmes une fois chargé par BetterDiscord.`;
                    this.toast("Thème exporté dans votre bibliothèque. Il reste désactivé.", "success");
                } catch (err) {
                    status.textContent = `Échec de l’export : ${err.message}`;
                    this.toast(status.textContent, "error");
                } finally {
                    this.themeExporting = false;
                    exportButton.disabled = false;
                    exportButton.textContent = "Exporter vers ModsTab";
                }
            },
        },
        h("div", {}, h("h3", {}, "Créez votre thème Discord"), h("p", { class: "mt-muted" }, "Aucun CSS à écrire. Votre brouillon est enregistré sur cet appareil.")),
        h("div", { class: "mt-editor-mode", role: "group", "aria-label": "Mode du créateur" }, ...modeButtons),
        h("div", { class: "mt-editor-layout" },
            h("div", { class: "mt-editor-controls" },
                field("name", "Nom du thème", { type: "text", class: "mt-select", maxlength: "60", required: true }),
                h("label", { class: "mt-field" }, "Palette de départ", preset),
                h("div", { class: "mt-editor-colors" }, ...["primary", "accent"].map((key) => field(key, THEME_COLORS[key], { type: "color" }))),
                h("label", { class: "mt-field" }, "Police", font),
                field("fontSize", "Taille du texte", { type: "range", min: "12", max: "22", step: "1" }),
                field("radius", "Arrondis", { type: "range", min: "0", max: "24", step: "1" }),
                advanced),
            h("div", { class: "mt-editor-preview" }, h("strong", {}, "Aperçu en direct"), preview.host,
                h("p", { class: "mt-muted" }, "Simulation de Discord. Les avatars, médias, rôles et statuts conservent leurs couleurs. Le rendu réel peut varier selon la version de Discord et les autres thèmes actifs."),
                h("div", { class: "mt-editor-actions" }, exportButton,
                    h("button", {
                        class: "mt-btn mt-btn-secondary", type: "button",
                        onclick: () => { this.kind = "theme"; this.query = ""; this.searchInput.value = ""; this.setView("installed"); },
                    }, "Voir mes thèmes")),
                status)));
    }

    writeCreatedTheme() {
        const draft = validateThemeDraft(this.themeDraft);
        if (this.manager("theme").getAll().some((theme) => theme.name === draft.name.trim())) {
            throw new Error("Un thème porte déjà ce nom. Choisissez un autre nom pour préserver l’original.");
        }
        const fs = require("fs");
        const path = require("path");
        const id = require("crypto").createHash("sha256").update(draft.name.trim()).digest("hex").slice(0, 12);
        const slug = draft.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_-]/gi, "-").slice(0, 60);
        const file = `ModsTab-${slug}-${id}.theme.css`;
        const code = `/**\n * @name ${draft.name.trim()}\n * @author ModsTab Creator\n * @version 1.0.0\n * @description Créé avec l’éditeur visuel ModsTab.\n */\n\n${themeCSS(draft)}`;
        try {
            fs.writeFileSync(path.join(this.manager("theme").folder, file), code, { encoding: "utf8", flag: "wx" });
        } catch (err) {
            if (err.code === "EEXIST") throw new Error("Ce thème a déjà été exporté. Choisissez un autre nom pour créer une variante.");
            throw err;
        }
        return file;
    }

    matches(...fields) {
        const fold = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const terms = fold(this.query).trim().split(/\s+/).filter(Boolean);
        const text = fields.map(fold).join(" ");
        return terms.every((term) => text.includes(term));
    }

    tagLabel(tag) {
        return TAG_LABELS[tag] || tag;
    }

    filteredCatalog() {
        const list = (this.catalog || []).filter((p) =>
            p.type === this.kind &&
            (this.category === "all" || p.tags.includes(this.category)) &&
            this.matches(p.name, p.author, p.description, ...p.tags.map((tag) => this.tagLabel(tag))));
        const field = { popular: "downloads", liked: "likes", updated: "updatedAt", newest: "publishedAt" }[this.sort];
        return list.sort((a, b) => (field ? b[field] - a[field] : 0) || a.name.localeCompare(b.name, "fr"));
    }

    emptyState(title, text, action) {
        return h("div", { class: "mt-state" }, icon("search"), h("h3", {}, title), h("p", {}, text), action);
    }

    /* ───────────── onglet « Installés » ───────────── */

    installedAddons() {
        return this.manager(this.kind).getAll().map((p) => ({
            type: this.kind,
            key: p.id ?? p.name,
            name: p.name,
            version: p.version,
            author: p.author,
            description: p.description,
        }));
    }

    renderInstalled() {
        const all = this.installedAddons();
        const list = all.filter((p) => this.matches(p.name, p.author, p.description)).sort((a, b) => a.name.localeCompare(b.name, "fr"));
        this.libraryStats = h("span", { class: "mt-muted" }, this.installedSummary());
        this.resultsStatus.textContent = `${list.length} ${this.kindLabel} dans votre bibliothèque.`;
        if (!list.length) return [this.emptyState(this.query.trim() ? "Aucune création trouvée" : "Votre collection commence ici",
            this.query.trim() ? "Essayez un autre nom ou un autre créateur." : `Explorez le catalogue de ${this.kindLabel} pour commencer.`,
            h("button", { class: "mt-btn", onclick: () => this.query.trim() ? this.resetFilters() : this.setView("catalog") },
                this.query.trim() ? "Effacer la recherche" : "Explorer le catalogue"))];
        return [
            h("div", { class: "mt-section-head" }, h("h3", {}, "Votre bibliothèque"), this.libraryStats),
            h("div", { class: "mt-grid" }, ...list.map((p, index) => {
                const catalogEntry = this.catalog?.find((entry) => entry.type === p.type && entry.name === p.name);
                return this.card({ ...p, tags: [], ...catalogEntry, key: p.key }, index, true);
            })),
        ];
    }

    installedSummary() {
        const all = this.installedAddons();
        return `${all.filter((p) => this.manager(p.type).isEnabled(p.key)).length} actifs · ${all.length} ${this.kindLabel}`;
    }

    toggle(key, locked = false, name = key, type = "plugin") {
        const manager = this.manager(type);
        const enabled = manager.isEnabled(key);
        const state = h("span", {}, locked ? "Requis" : enabled ? "Actif" : "Inactif");
        return h(
            "div",
            { class: "mt-switch-wrap", title: locked ? "ModsTab doit rester actif pour afficher ce panneau." : "" },
            state,
            h(
                "label",
                { class: "mt-switch" },
                h("input", {
                    type: "checkbox",
                    role: "switch",
                    "aria-label": locked ? `${name} (désactivation indisponible)` : `${enabled ? "Désactiver" : "Activer"} ${name}`,
                    "data-focus-key": `toggle-${key}`,
                    checked: enabled,
                    disabled: locked,
                    onchange: (e) => {
                        try {
                            e.target.checked ? manager.enable(key) : manager.disable(key);
                            e.target.setAttribute("aria-label", `${e.target.checked ? "Désactiver" : "Activer"} ${name}`);
                            state.textContent = e.target.checked ? "Actif" : "Inactif";
                            if (this.libraryStats?.isConnected) this.libraryStats.textContent = this.installedSummary();
                        } catch (err) {
                            e.target.checked = !e.target.checked;
                            this.toast(`Échec : ${err.message}`, "error");
                        }
                    },
                }),
                h("span", { "aria-hidden": "true" })
            )
        );
    }

    preview(p, detail = false) {
        const preview = h("div", { class: `mt-preview${detail ? " mt-detail-preview" : ""}` },
            h("span", { class: "mt-monogram", "aria-hidden": "true" }, p.name.slice(0, 2).toUpperCase()));
        if (p.thumbnail) {
            const image = h("img", {
                src: p.thumbnail, alt: "", loading: detail ? "eager" : "lazy", decoding: "async",
                onerror: () => image.remove(),
            });
            preview.append(image);
        }
        return preview;
    }

    addonAction(p) {
        const installed = this.findInstalled(p);
        const locked = p.type === "plugin" && (installed?.name === "ModsTab" || installed?.name === this.meta.name);
        if (installed) return this.toggle(installed.id ?? installed.name, locked, installed.name, p.type);
        return h("button", {
            class: "mt-btn", disabled: this.busy.has(p.id), "data-focus-key": `install-${p.id}`,
            "aria-busy": String(this.busy.has(p.id)),
            "aria-label": `Installer ${p.name}`, onclick: () => this.install(p),
        }, icon("download"), this.busy.has(p.id) ? "Installation…" : "Installer");
    }

    card(p, index, installedView = false) {
        const installed = this.findInstalled(p);
        const preview = this.preview(p);
        if (installed) preview.append(h("span", { class: "mt-badge mt-badge-positive" }, icon("check"), "Dans votre bibliothèque"));
        else if (p.publishedAt && Date.now() - p.publishedAt < 30 * 86400000) preview.append(h("span", { class: "mt-badge" }, "Nouveau"));
        const hasDetail = p.id != null && this.catalog?.some((entry) => entry.id === p.id);
        return h("article", { class: "mt-card", style: `--mt-i:${Math.min(index, 8)}` },
            preview,
            h("div", { class: "mt-card-content" },
                h("div", {},
                    h("h3", { class: "mt-name" }, hasDetail ? h("button", {
                        class: "mt-name-button", "data-focus-key": `detail-${p.id}`, onclick: () => this.openDetail(p),
                        "aria-label": `Voir les détails de ${p.name}`,
                    }, p.name) : p.name),
                    h("div", { class: "mt-author" }, `par ${p.author || "Créateur inconnu"}`, p.version ? ` · v${p.version}` : "")),
                h("p", { class: "mt-desc" }, p.description || "Aucune description fournie."),
                h("div", { class: "mt-tags" }, ...(p.tags || []).slice(0, 2).map((tag) => h("span", { class: "mt-tag" }, this.tagLabel(tag)))),
                h("div", { class: "mt-card-bottom" },
                    installedView ? h("span", { class: "mt-muted" }, "BetterDiscord") : this.metrics(p),
                    this.addonAction(p))));
    }

    metrics(p) {
        return h("div", { class: "mt-metrics" },
            h("span", { class: "mt-metric", "aria-label": `${numberFormat.format(p.downloads)} téléchargements`, title: "Téléchargements" }, icon("download"), numberFormat.format(p.downloads)),
            h("span", { class: "mt-metric", "aria-label": `${numberFormat.format(p.likes)} mentions J’aime`, title: "Mentions J’aime" }, icon("heart"), numberFormat.format(p.likes)));
    }

    openDetail(p) {
        clearTimeout(this._searchTimer);
        this.detailScroll = this.scroller.scrollTop;
        this.detail = p;
        this.render();
        this.scroller.scrollTop = 0;
        this.body.querySelector("[data-detail-title]").focus();
    }

    closeDetail() {
        const id = this.detail.id;
        this.detail = null;
        this.render();
        this.scroller.scrollTop = this.detailScroll || 0;
        const opener = [...this.body.querySelectorAll("[data-focus-key]")].find((node) => node.getAttribute("data-focus-key") === `detail-${id}`);
        (opener || this.body).focus({ preventScroll: true });
    }

    renderDetail(p) {
        return h("div", { class: "mt-detail" },
            h("button", { class: "mt-btn mt-btn-secondary", "data-focus-key": "back", onclick: () => this.closeDetail() }, icon("arrow"), "Retour aux résultats"),
            h("div", { class: "mt-detail-grid" },
                h("div", {}, this.preview(p, true),
                    h("p", { class: "mt-detail-description", style: "margin-top:20px" }, p.description || "Aucune description fournie.")),
                h("div", { class: "mt-detail-info" },
                    h("div", {}, h("h3", { tabindex: "-1", "data-detail-title": "" }, p.name),
                        h("p", { class: "mt-author" }, `par ${p.author || "Créateur inconnu"}${p.version ? ` · v${p.version}` : ""}`)),
                    h("div", { class: "mt-tags" }, ...p.tags.map((tag) => h("span", { class: "mt-tag" }, this.tagLabel(tag)))),
                    h("div", { class: "mt-detail-stats" },
                        h("div", { class: "mt-muted" }, h("strong", {}, numberFormat.format(p.downloads)), "Téléchargements"),
                        h("div", { class: "mt-muted" }, h("strong", {}, numberFormat.format(p.likes)), "J’aime"),
                        h("div", { class: "mt-muted" }, "Mise à jour", h("strong", {}, p.updatedAt ? dateFormat.format(p.updatedAt) : "Non précisée")),
                        h("div", { class: "mt-muted" }, "Publication", h("strong", {}, p.publishedAt ? dateFormat.format(p.publishedAt) : "Non précisée"))),
                    this.addonAction(p),
                    h("a", { href: `https://betterdiscord.app/${p.type}?id=${encodeURIComponent(p.id)}`, target: "_blank", rel: "noopener noreferrer" }, "Fiche officielle BetterDiscord ↗"),
                    h("p", { class: "mt-notice" }, p.type === "theme"
                        ? "Ce thème modifie l’apparence de Discord et peut charger des ressources externes. Vérifiez sa fiche officielle avant de l’installer. Plusieurs thèmes peuvent être actifs et entrer en conflit."
                        : "Les plugins ont un accès complet à votre client et à votre machine. Vérifiez le créateur et le code source sur la fiche officielle avant d’installer."))));
    }

    /* ───────────── onglet « Catalogue » ───────────── */

    get netFetch() {
        return BdApi.Net?.fetch ? BdApi.Net.fetch.bind(BdApi.Net) : fetch;
    }

    async loadCatalog() {
        if (this.catalogState === "loading") return;
        this.catalogState = "loading";
        this.catalogError = "";
        this.render();
        try {
            const res = await this.netFetch(STORE_API);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            this.catalog = this.normalize(await res.json());
            this.catalogState = "ready";
        } catch (err) {
            this.catalogState = "error";
            this.catalogError = err.message;
        }
        this.render();
    }

    normalize(raw) {
        const arr = Array.isArray(raw) ? raw : raw?.data ?? raw?.addons ?? raw?.plugins;
        if (!Array.isArray(arr)) throw new Error("format du catalogue inattendu");
        const count = (value) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
        const timestamp = (value) => typeof value === "string" && Number.isFinite(Date.parse(value)) ? Date.parse(value) : 0;
        return arr
            .filter((p) => p && ["plugin", "theme"].includes(p.type) && p.id != null && typeof p.name === "string" && p.name.trim())
            .map((p) => ({
                type: p.type,
                id: p.id,
                name: p.name,
                version: typeof p.version === "string" ? p.version : "",
                description: typeof p.description === "string" ? p.description : "",
                author: typeof p.author === "string" ? p.author : p.author?.display_name || p.author?.github_name || "",
                file: p.file_name || `${p.name}${p.type === "theme" ? ".theme.css" : ".plugin.js"}`,
                tags: Array.isArray(p.tags) ? [...new Set(p.tags.filter((tag) => typeof tag === "string"))] : [],
                downloads: count(p.downloads),
                likes: count(p.likes),
                thumbnail: safeThumbnail(p.thumbnail_url),
                updatedAt: timestamp(p.latest_release_date),
                publishedAt: timestamp(p.initial_release_date),
            }));
    }

    findInstalled(p) {
        return this.manager(p.type).getAll().find((i) => i.name === p.name || i.id === p.name || (p.key != null && i.id === p.key));
    }

    renderCatalog() {
        if (this.catalogState === "loading" || this.catalogState === "idle") {
            this.resultsStatus.textContent = "Chargement du catalogue…";
            const skeletons = Array.from({ length: 6 }, () => h("div", { class: "mt-card mt-skeleton" },
                h("div", { class: "mt-preview" }),
                h("div", { class: "mt-card-content" },
                    h("div", { class: "mt-skeleton-bar", style: "width:65%" }),
                    h("div", { class: "mt-skeleton-bar" }),
                    h("div", { class: "mt-skeleton-bar", style: "width:80%" }))));
            return [h("div", { class: "mt-grid", "aria-hidden": "true" }, ...skeletons)];
        }
        if (this.catalogState === "error") {
            this.resultsStatus.textContent = `Impossible de charger le catalogue : ${this.catalogError}.`;
            return [this.emptyState("Le catalogue fait une pause",
                `Impossible de charger le catalogue (${this.catalogError}). Vérifiez votre connexion, puis réessayez.`,
                h("button", { class: "mt-btn", "data-focus-key": "retry", onclick: () => this.loadCatalog() }, "Réessayer"))];
        }
        const list = this.filteredCatalog();
        if (!list.length) {
            this.resultsStatus.textContent = "Aucune création trouvée.";
            return [this.emptyState("Aucune découverte… pour le moment",
                this.query.trim() || this.category !== "all" ? "Essayez une autre recherche ou élargissez votre sélection." : "Le catalogue officiel est vide pour le moment.",
                this.query.trim() || this.category !== "all"
                    ? h("button", { class: "mt-btn", onclick: () => this.resetFilters() }, "Réinitialiser les filtres")
                    : h("button", { class: "mt-btn", onclick: () => this.loadCatalog() }, "Actualiser"))];
        }
        const pages = Math.ceil(list.length / PAGE_SIZE);
        this.page = Math.min(Math.max(1, this.page), pages);
        const start = (this.page - 1) * PAGE_SIZE;
        this.resultsStatus.textContent = `${list.length} ${this.kindLabel} trouvés. Page ${this.page} sur ${pages}.`;
        return [
            h("div", { class: "mt-section-head" },
                h("div", {}, h("h3", {}, this.category === "all" ? "À découvrir" : this.tagLabel(this.category)),
                    h("span", { class: "mt-muted" }, `${numberFormat.format(list.length)} ${this.kindLabel}${this.query.trim() ? " correspondent à votre recherche" : " de la communauté"}`)),
                h("button", { class: "mt-btn mt-btn-secondary", "data-focus-key": "refresh", onclick: () => this.loadCatalog() }, "Actualiser")),
            h("div", { class: "mt-grid" }, ...list.slice(start, start + PAGE_SIZE).map((p, index) => this.card(p, index))),
            h("div", { class: "mt-pagination" },
                h("span", { class: "mt-muted" }, `${start + 1}–${Math.min(start + PAGE_SIZE, list.length)} sur ${list.length} ${this.kindLabel}`),
                h("nav", { class: "mt-pagination-actions", "aria-label": "Pages du catalogue" },
                    h("button", {
                        class: "mt-btn mt-btn-secondary", disabled: this.page === 1, "data-focus-key": "previous",
                        onclick: () => this.changePage(this.page - 1),
                    }, "Précédent"),
                    h("span", { class: "mt-muted", "aria-current": "page" }, `${this.page} / ${pages}`),
                    h("button", {
                        class: "mt-btn mt-btn-secondary", disabled: this.page === pages, "data-focus-key": "next",
                        onclick: () => this.changePage(this.page + 1),
                    }, "Suivant"))),
        ];
    }

    changePage(page) {
        this.page = page;
        this.render();
        this.body.scrollIntoView({ block: "start" });
        this.body.focus({ preventScroll: true });
    }

    /* ───────────── installation ───────────── */

    install(p) {
        if (this.busy.has(p.id) || this.confirming) return;
        const opener = document.activeElement;
        this.confirming = true;
        // Le dialogue natif doit rester au-dessus de notre panneau, quel que soit son z-index.
        if (this.root) this.root.hidden = true;
        const release = () => {
            this.confirming = false;
            if (this.root) this.root.hidden = false;
            if (this.root && opener?.isConnected && !opener.disabled) opener.focus({ preventScroll: true });
        };
        try {
            const warning = p.type === "theme"
                ? "Ce thème sera téléchargé depuis le catalogue officiel BetterDiscord puis activé. Il peut charger des ressources externes et entrer en conflit avec vos autres thèmes actifs."
                : "Ce plugin sera téléchargé depuis le catalogue officiel BetterDiscord. Les plugins s'exécutent avec un accès complet à votre client : n'installez que ce que vous jugez fiable.";
            BdApi.UI.showConfirmationModal(`Installer ${p.name} ?`, warning, {
                confirmText: "Installer",
                cancelText: "Annuler",
                onConfirm: () => {
                    release();
                    return this.doInstall(p);
                },
                onCancel: release,
                onClose: release,
            });
        } catch (err) {
            release();
            this.toast(`Impossible d’ouvrir la confirmation : ${err.message}`, "error");
        }
    }

    async doInstall(p) {
        if (this.busy.has(p.id)) return;
        this.busy.add(p.id);
        this.render();
        try {
            await this.download(p);
            const manager = this.manager(p.type);
            const installed = await this.waitForAddon(p);
            const key = installed.id ?? installed.name;
            if (!manager.isEnabled(key)) manager.enable(key);
            this.toast(`${p.name} installé et activé`, "success");
        } catch (err) {
            this.toast(`Échec de l'installation de ${p.name} : ${err.message}`, "error");
        } finally {
            this.busy.delete(p.id);
            this.render();
        }
    }

    async download(p) {
        const fs = require("fs");
        const path = require("path");
        const res = await this.netFetch(downloadUrl(p.id));
        if (!res.ok) throw new Error(`téléchargement HTTP ${res.status}`);
        const code = await res.text();
        if (!/@name\s/.test(code.slice(0, 4000))) throw new Error("fichier invalide (en-tête BetterDiscord absent)");
        const manager = this.manager(p.type);
        const fileName = path.basename(p.file);
        const extension = p.type === "theme" ? ".theme.css" : ".plugin.js";
        if (!fileName.endsWith(extension)) throw new Error("nom de fichier inattendu");
        fs.writeFileSync(path.join(manager.folder, fileName), code);
    }

    async waitForAddon(p, timeout = 10000) {
        const manager = this.manager(p.type);
        const end = Date.now() + timeout;
        while (Date.now() < end) {
            const installed = manager.getAll().find((i) => i.name === p.name);
            if (installed) return installed;
            await sleep(300);
        }
        throw new Error("BetterDiscord n'a pas chargé le fichier");
    }

    toast(msg, type = "info") {
        BdApi.UI.showToast(msg, { type });
    }
};

module.exports.Spotify = { SpotifyOriginal, spotifyPlan, spotifyCapabilities };
module.exports.ThemeCreator = { newThemeDraft, validateThemeDraft, themeCSS };
