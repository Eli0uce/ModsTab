const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "../../plugin/ModsTab.plugin.js"), "utf8");
const addons = Array.from({ length: 41 }, (_, index) => ({
    type: "plugin",
    id: index + 1,
    name: ["Écho Vocal", "BetterFolders", "QuietHours", "QuickSearch", "FriendNotes", "ThemeTools"][index % 6] + (index < 6 ? "" : ` ${index + 1}`),
    version: "1.2.0",
    description: [
        "Une expérience vocale plus claire. Retrouvez vos raccourcis et personnalisez vos appels.",
        "Organisez vos serveurs et vos conversations pour vous concentrer sur l’essentiel.",
        "Prenez le contrôle de vos notifications et profitez d’un Discord plus tranquille.",
    ][index % 3],
    author: { display_name: index % 2 ? "Studio Nova" : "Camille" },
    file_name: `Plugin${index + 1}.plugin.js`,
    tags: [index % 2 ? "utility" : "voice", "enhancement"],
    downloads: 125000 - index * 2500,
    likes: 100 + index,
    thumbnail_url: index === 1 ? "/image/broken" : index % 3 === 0 ? `/image/${index}` : null,
    latest_release_date: new Date(Date.UTC(2026, 8, index + 1)).toISOString(),
    initial_release_date: new Date(Date.UTC(2025, 0, index + 1)).toISOString(),
}));
const themes = Array.from({ length: 20 }, (_, index) => ({
    ...addons[index],
    id: 100 + index,
    type: "theme",
    name: index === 0 ? "Écho Vocal" : index === 1 ? "ModsTab" : `Aurora ${index}`,
    file_name: `Aurora${index}.theme.css`,
    tags: [index % 2 ? "light" : "dark", "customizable"],
}));

async function startSpotify(page, product = "premium") {
    await page.evaluate((product) => {
        window.plugin.stop();
        window.savedSettings.spotifyEnabled = true;
        window.savedSettings.spotifyTokens = { access: "test", refresh: "test", expiresAt: Date.now() + 3600000 };
        window.spotifyCalls = [];
        window.spotifyFailure = false;
        window.BdApi.Net.fetch = async (url, options = {}) => {
            window.spotifyCalls.push({ url, method: options.method });
            let data = null;
            const status = window.spotifyFailure ? 503 : 200;
            if (window.spotifyFailure) data = { error: { message: "Service Spotify indisponible" } };
            else if (url.endsWith("/me")) data = { display_name: "Auditeur", product };
            else if (url.includes("/me/player?")) data = {
                item: { type: "track", name: "Titre de test", uri: "spotify:track:test", duration_ms: 240000, artists: [{ name: "Artiste" }] },
                is_playing: true, progress_ms: 10000, shuffle_state: false, repeat_state: "off", device: { volume_percent: 50 },
            };
            else if (url.includes("/me/library/contains")) data = [false];
            return { ok: status === 200, status, text: async () => JSON.stringify(data) };
        };
        window.plugin = new window.module.exports({ name: "ModsTab" });
        window.plugin.start();
    }, product);
    await expect(page.getByRole("region", { name: "Lecteur Spotify", exact: true })).toContainText("Titre de test");
}

test("Spotify fonctionne sans ouvrir ModsTab et revient après redémarrage", async ({ page }) => {
    await openCatalog(page);
    await startSpotify(page);
    const dock = page.getByRole("region", { name: "Lecteur Spotify", exact: true });
    await expect(page.locator("#modstab-panel")).toHaveCount(0);
    await expect(dock.getByRole("button", { name: "Lecture / pause", exact: true })).toBeEnabled();
    await dock.getByRole("button", { name: "Titre suivant", exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.spotifyCalls.some((c) => c.url.endsWith("/me/player/next") && c.method === "POST"))).toBe(true);
    await dock.getByRole("button", { name: "Réduire le lecteur Spotify" }).click();
    await expect(dock.getByRole("button", { name: "Titre suivant" })).toBeHidden();
    const polls = await page.evaluate(() => window.spotifyCalls.filter((c) => c.url.includes("/me/player?")).length);
    await expect.poll(() => page.evaluate(() => window.spotifyCalls.filter((c) => c.url.includes("/me/player?")).length)).toBeGreaterThan(polls);
    await dock.getByRole("button", { name: "Ouvrir le lecteur Spotify" }).click();
    await expect(dock.getByRole("button", { name: "Titre suivant" })).toBeVisible();
    await page.getByRole("button", { name: "Ouvrir l’onglet Mods" }).click();
    await page.getByRole("tab", { name: "Originals", exact: true }).click();
    await page.getByRole("button", { name: "Fermer", exact: true }).click();
    await expect(dock).toBeVisible();
    await page.evaluate(() => { window.plugin.stop(); });
    await expect(dock).toHaveCount(0);
    await page.evaluate(() => { window.plugin = new window.module.exports({ name: "ModsTab" }); window.plugin.start(); });
    await expect(dock).toContainText("Titre de test");
    await expect(dock).toHaveCount(1);
    await page.getByRole("button", { name: "Ouvrir l’onglet Mods" }).click();
    await page.getByRole("tab", { name: "Originals", exact: true }).click();
    await page.getByRole("switch", { name: "Activer le plugin Spotify", exact: true }).uncheck();
    await expect(dock).toHaveCount(0);
    await page.getByRole("switch", { name: "Activer le plugin Spotify", exact: true }).check();
    await expect(dock).toHaveCount(1);
    await page.getByRole("button", { name: "Fermer", exact: true }).click();
    await dock.getByRole("button", { name: "Se déconnecter", exact: true }).click();
    await expect(dock).toHaveCount(0);
});

test("Spotify gratuit désactive les contrôles du lecteur principal", async ({ page }) => {
    await openCatalog(page);
    await startSpotify(page, "free");
    const dock = page.getByRole("region", { name: "Lecteur Spotify", exact: true });
    await expect(dock.getByRole("button", { name: "Lecture / pause", exact: true })).toBeDisabled();
    await expect(dock.getByRole("button", { name: "File d’attente", exact: true })).toBeHidden();
    await expect(dock.getByRole("button", { name: "Aimer ce titre", exact: true })).toBeEnabled();
    await expect(dock).toContainText("Compte gratuit détecté");
});

test("Spotify affiche les erreurs réseau dans le lecteur principal", async ({ page }) => {
    await openCatalog(page);
    await startSpotify(page);
    await page.evaluate(async () => { window.spotifyFailure = true; await window.plugin.spotify.refreshPlayback(); });
    await expect(page.getByRole("region", { name: "Lecteur Spotify", exact: true }).getByRole("alert")).toContainText("Service Spotify indisponible");
});

for (const width of [360, 1280]) {
    test(`lecteur Spotify compact à ${width}px avec toutes ses commandes`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await openCatalog(page);
        await startSpotify(page);
        const dock = page.getByRole("region", { name: "Lecteur Spotify", exact: true });
        const bounds = await dock.boundingBox();
        expect(bounds.width).toBeLessThanOrEqual(360);
        expect(bounds.height).toBeLessThanOrEqual(300);
        expect(await dock.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
        await expect(dock.getByRole("slider", { name: "Volume", exact: true })).toBeVisible();
        await expect(dock.getByRole("slider", { name: "Position dans le titre" })).toBeVisible();
        await expect(dock.getByRole("searchbox", { name: "Rechercher un titre" })).toBeVisible();
        await expect(dock.getByRole("button", { name: "File d’attente", exact: true })).toBeVisible();
        await dock.getByRole("button", { name: "Titre suivant", exact: true }).click();
        await expect.poll(() => page.evaluate(() => window.spotifyCalls.some((c) => c.url.endsWith("/me/player/next")))).toBe(true);
        await dock.getByRole("button", { name: "Réduire le lecteur Spotify" }).click();
        expect((await dock.boundingBox()).width).toBeLessThanOrEqual(220);
    });
}

test("le lecteur Spotify ne déborde pas sur une petite fenêtre", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await openCatalog(page);
    await startSpotify(page);
    const dock = page.getByRole("region", { name: "Lecteur Spotify", exact: true });
    const bounds = await dock.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(360);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(640);
    expect(await dock.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
});

for (const width of [360, 1280]) {
    test(`Spotify reste au-dessus du panneau utilisateur à ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 640 });
        await openCatalog(page);
        await startSpotify(page);
        const dock = page.getByRole("region", { name: "Lecteur Spotify", exact: true });
        await page.evaluate(() => {
            const panel = document.createElement("section");
            panel.className = "panels_test";
            panel.style.cssText = "position:fixed;left:10px;bottom:10px;width:320px;height:116px;background:#202127";
            document.body.append(panel);
        });
        const panel = page.locator(".panels_test");
        const assertAbovePanel = async () => {
            await expect.poll(async () => {
                const player = await dock.boundingBox();
                const anchor = await panel.boundingBox();
                return Math.round(anchor.y - player.y - player.height);
            }).toBe(8);
            const bounds = await dock.boundingBox();
            expect(bounds.x).toBe(16);
            expect(bounds.y).toBeGreaterThanOrEqual(16);
            expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 16);
        };
        await assertAbovePanel();
        await panel.evaluate((el) => { el.style.height = "180px"; });
        await assertAbovePanel();
        await dock.getByRole("button", { name: "Réduire le lecteur Spotify" }).click();
        await assertAbovePanel();
        await panel.evaluate((el) => { el.replaceWith(el.cloneNode()); });
        await panel.evaluate((el) => { el.style.height = "80px"; });
        await dock.getByRole("button", { name: "Ouvrir le lecteur Spotify" }).click();
        await assertAbovePanel();
        await page.setViewportSize({ width, height: 700 });
        await assertAbovePanel();
        await panel.evaluate((el) => el.remove());
        await expect(dock).toHaveCSS("right", "16px");
        await expect(dock).toHaveCSS("bottom", "16px");
    });
}

async function openCatalog(page, { mode = "ready", data = addons } = {}) {
    await page.route("https://betterdiscord.app/image/**", (route) => {
        if (route.request().url().endsWith("broken")) return route.abort();
        return route.fulfill({
            contentType: "image/svg+xml",
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><defs><linearGradient id="g"><stop stop-color="#36315e"/><stop offset="1" stop-color="#1b404d"/></linearGradient></defs><rect width="640" height="320" fill="url(#g)"/><rect x="130" y="70" width="380" height="190" rx="15" fill="#141b2b" stroke="#8884bb"/><rect x="150" y="90" width="70" height="150" rx="6" fill="#292b45"/><rect x="240" y="95" width="160" height="12" rx="6" fill="#b2a1ff"/><rect x="240" y="125" width="240" height="8" rx="4" fill="#64718c"/><rect x="240" y="150" width="210" height="8" rx="4" fill="#64718c"/><circle cx="445" cy="205" r="20" fill="#8472de"/></svg>',
        });
    });
    await page.setContent('<html lang="fr"><head><title>ModsTab</title></head><body style="margin:0;background:#202127"><nav aria-label="Discord"><ul><li><a href="/quests">Quêtes</a></li></ul></nav><main><h1>Discord</h1></main></body></html>');
    await page.evaluate(({ data, mode }) => {
        window.testData = data;
        window.fetchMode = mode;
        window.enabled = new Set(["internal-echo", "ModsTab"]);
        window.installed = [
            { id: "internal-echo", name: data[0]?.name || "Écho Vocal", author: "Camille", version: "1.2.0", description: "Une expérience vocale plus claire." },
            { id: "ModsTab", name: "ModsTab", author: "ModsTab", version: "0.1.0", description: "Votre catalogue de plugins." },
        ];
        window.toasts = [];
        window.installedThemes = [];
        window.enabledThemes = new Set();
        window.savedSettings = {};
        window.BdApi = {
            Data: {
                load: (plugin, key) => {
                    if (window.loadError) throw new Error("Lecture refusée");
                    return window.savedSettings[key];
                },
                save: (plugin, key, value) => {
                    if (window.saveError) throw new Error("Écriture refusée");
                    window.savedSettings[key] = value;
                },
            },
            Themes: {
                getAll: () => window.installedThemes,
                isEnabled: (key) => window.enabledThemes.has(key),
                enable: (key) => { if (window.toggleError) throw new Error("Activation refusée"); window.enabledThemes.add(key); },
                disable: (key) => { if (window.toggleError) throw new Error("Désactivation refusée"); window.enabledThemes.delete(key); },
            },
            Plugins: {
                getAll: () => window.installed,
                isEnabled: (key) => window.enabled.has(key),
                enable: (key) => { if (window.toggleError) throw new Error("Activation refusée"); window.enabled.add(key); },
                disable: (key) => { if (window.toggleError) throw new Error("Désactivation refusée"); window.enabled.delete(key); },
            },
            Net: {
                fetch: async () => {
                    if (window.fetchMode === "pending") await new Promise((resolve) => { window.resolveFetch = resolve; });
                    return window.fetchMode === "error" ? { ok: false, status: 503 }
                        : { ok: true, json: async () => window.testData };
                },
            },
            UI: {
                showToast: (message, options) => window.toasts.push({ message, ...options }),
                showConfirmationModal: (title, description, options) => {
                    window.confirmOptions = options;
                    const overlay = document.createElement("div");
                    overlay.setAttribute("role", "dialog");
                    overlay.setAttribute("aria-label", title);
                    overlay.setAttribute("aria-modal", "true");
                    overlay.style.cssText = "position:fixed;inset:0;z-index:3000;background:#111e;color:white;display:grid;place-content:center";
                    const cancel = document.createElement("button");
                    cancel.textContent = "Annuler";
                    cancel.onclick = () => { overlay.remove(); options.onCancel(); options.onClose(); };
                    const confirm = document.createElement("button");
                    confirm.textContent = "Confirmer l’installation";
                    confirm.onclick = () => { overlay.remove(); options.onConfirm(); options.onClose(); };
                    overlay.addEventListener("keydown", (event) => {
                        if (event.key === "Escape") cancel.click();
                    });
                    overlay.append(document.createTextNode(description), cancel, confirm);
                    document.body.append(overlay);
                    cancel.focus();
                },
            },
        };
    }, { data, mode });
    await page.addScriptTag({ content: `window.module = {exports: {}};\n${source}\nwindow.plugin = new module.exports({name: "ModsTab"}); window.plugin.start();` });
    await page.getByRole("button", { name: "Ouvrir l’onglet Mods" }).click();
    const plugins = data.filter((p) => p.type === "plugin");
    if (mode === "ready" && plugins.length) await expect(page.locator(".mt-card:not(.mt-skeleton)")).toHaveCount(Math.min(18, plugins.length));
}

test("les dossiers plugins et thèmes s’ouvrent depuis le catalogue et la bibliothèque vide", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await openCatalog(page);
    await page.evaluate(() => {
        window.openedFolders = [];
        window.BdApi.Plugins.folder = "/BetterDiscord/plugins";
        window.BdApi.Themes.folder = "/BetterDiscord/themes";
        window.require = (name) => {
            if (name !== "electron") throw new Error(`Module inconnu : ${name}`);
            return { shell: { openPath: async (folder) => { window.openedFolders.push(folder); return ""; } } };
        };
    });
    await page.getByRole("button", { name: "Ouvrir le dossier des plugins", exact: true }).click();
    await page.getByRole("button", { name: "Thèmes", exact: true }).click();
    await page.getByRole("button", { name: "Ouvrir le dossier des thèmes", exact: true }).click();
    await page.getByRole("tab", { name: /Ma bibliothèque/ }).click();
    await expect(page.locator(".mt-card")).toHaveCount(0);
    await page.getByRole("button", { name: "Ouvrir le dossier des thèmes", exact: true }).click();
    expect(await page.evaluate(() => window.openedFolders)).toEqual([
        "/BetterDiscord/plugins", "/BetterDiscord/themes", "/BetterDiscord/themes",
    ]);
    expect(await page.locator(".mt-scroll").evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
});

test("une erreur d’ouverture du dossier est signalée", async ({ page }) => {
    await openCatalog(page);
    const button = page.getByRole("button", { name: "Ouvrir le dossier des plugins", exact: true });
    await button.click();
    expect(await page.evaluate(() => window.toasts.at(-1))).toMatchObject({
        type: "error", message: expect.stringContaining("Dossier BetterDiscord indisponible"),
    });
    await page.evaluate(() => {
        window.BdApi.Plugins.folder = "/BetterDiscord/plugins";
        window.require = () => ({ shell: { openPath: async () => "Accès refusé" } });
    });
    await button.click();
    expect(await page.evaluate(() => window.toasts.at(-1).message)).toContain("Accès refusé");
    await page.evaluate(() => {
        window.require = () => ({ shell: { openPath: async () => { throw new Error("Explorateur indisponible"); } } });
    });
    await button.click();
    expect(await page.evaluate(() => window.toasts.at(-1).message)).toContain("Explorateur indisponible");
});

test("recherche, catégories, tri et remise à zéro", async ({ page }) => {
    await openCatalog(page);
    const search = page.getByRole("searchbox");
    await search.fill("echo camille");
    await expect(page.locator(".mt-card")).toHaveCount(7);
    await expect(search).toBeFocused();
    await search.fill("");
    await page.getByRole("combobox", { name: "Catégorie", exact: true }).selectOption("voice");
    await expect(page.locator(".mt-section-head")).toContainText("21 plugins");
    await page.getByRole("button", { name: "Tout explorer", exact: true }).click();
    await page.getByRole("combobox", { name: "Trier par", exact: true }).selectOption("liked");
    await expect(page.locator(".mt-name").first()).toContainText("FriendNotes 41");
    await page.getByRole("combobox", { name: "Trier par", exact: true }).selectOption("updated");
    await expect(page.locator(".mt-name").first()).toContainText("FriendNotes 41");
    await search.fill("introuvable");
    await expect(page.getByText("Aucune découverte… pour le moment")).toBeVisible();
    await page.getByRole("button", { name: "Réinitialiser les filtres" }).click();
    await expect(search).toHaveValue("");
    await expect(page.locator(".mt-card")).toHaveCount(18);
});

test("Originals sépare les créations intégrées du catalogue et de la bibliothèque", async ({ page }) => {
    await openCatalog(page, { data: [...addons, ...themes] });
    await page.getByRole("button", { name: "Thèmes", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Graphite", exact: true })).toBeHidden();
    await page.getByRole("tab", { name: "Ma bibliothèque" }).click();
    await expect(page.getByRole("heading", { name: "Graphite", exact: true })).toBeHidden();
    const originals = page.getByRole("tab", { name: "Originals", exact: true });
    await originals.click();
    await expect(originals).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "modstab-tab-originals");
    await expect(page.getByRole("region", { name: "Thèmes", exact: true })).toContainText("Graphite");
    await expect(page.getByRole("region", { name: "Plugins", exact: true })).toContainText("Spotify");
    await expect(page.getByRole("searchbox")).toBeHidden();
    await expect(page.locator(".mt-card")).toHaveCount(0);
    await page.getByRole("button", { name: "Fermer", exact: true }).click();
    await page.getByRole("button", { name: "Ouvrir l’onglet Mods" }).click();
    await expect(originals).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Créer", exact: true })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Découvrir" })).toBeFocused();
    await expect(page.getByRole("button", { name: "Thèmes", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: "Créer", exact: true })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(originals).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("tab", { name: "Ma bibliothèque" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: "Découvrir" })).toBeFocused();
});

test("créateur : aperçu isolé, brouillon persistant et export dans la bibliothèque", async ({ page }) => {
    await openCatalog(page);
    await page.getByRole("tab", { name: "Créer", exact: true }).click();
    await expect(page.getByRole("searchbox")).toBeHidden();
    const preview = page.getByRole("region", { name: "Aperçu Discord en direct" });
    await expect(preview.locator(".theme-dark")).toHaveCSS("background-color", "rgb(32, 33, 39)");
    await page.getByLabel("Discussion", { exact: true }).fill("#123456");
    await expect(preview.locator(".theme-dark")).toHaveCSS("background-color", "rgb(18, 52, 86)");
    await page.getByLabel("Nom du thème", { exact: true }).fill("Mon univers");
    await page.getByLabel("Police", { exact: true }).selectOption("mono");
    await page.getByLabel("Taille du texte", { exact: true }).fill("22");
    await expect(preview.locator(".messageContent").first()).toHaveCSS("font-size", "22px");
    await expect(page.getByLabel("Taille du texte", { exact: true })).toBeFocused();
    await page.getByRole("button", { name: "Avancé", exact: true }).click();
    await page.getByLabel("Salons et membres", { exact: true }).fill("#234567");
    await page.getByLabel("Espacement des messages", { exact: true }).fill("24");
    await page.getByRole("button", { name: "Basique", exact: true }).click();
    expect(await page.locator("html").evaluate((el) => el.style.getPropertyValue("--background-primary"))).toBe("");
    await page.getByRole("button", { name: "Fermer", exact: true }).click();
    await page.evaluate(() => { window.plugin.stop(); window.plugin = new window.module.exports({ name: "ModsTab" }); window.plugin.start(); });
    await page.getByRole("button", { name: "Ouvrir l’onglet Mods" }).click();
    await page.getByRole("tab", { name: "Créer", exact: true }).click();
    await expect(page.getByLabel("Nom du thème", { exact: true })).toHaveValue("Mon univers");
    await expect(page.getByLabel("Discussion", { exact: true })).toHaveValue("#123456");
    await expect(page.getByLabel("Salons et membres", { exact: true })).toBeHidden();
    await page.getByRole("button", { name: "Avancé", exact: true }).click();
    await expect(page.getByLabel("Salons et membres", { exact: true })).toHaveValue("#234567");
    await expect(page.getByLabel("Espacement des messages", { exact: true })).toHaveValue("24");
    await page.getByRole("button", { name: "Basique", exact: true }).click();
    await page.evaluate(() => {
        window.exports = [];
        window.require = (name) => {
            if (name === "crypto") return { createHash: () => ({ update: () => ({ digest: () => "123456abcdef" }) }) };
            if (name === "path") return { join: (...parts) => parts.join("/") };
            if (name === "fs") return { writeFileSync: (file, code, options) => {
                window.exports.push({ file, code, options });
                window.installedThemes.push({ id: "created-theme", name: code.match(/@name (.+)/)[1], author: "ModsTab Creator" });
            } };
            throw new Error(`Module inconnu : ${name}`);
        };
        window.BdApi.Themes.folder = "/themes";
    });
    await page.getByRole("button", { name: "Exporter vers ModsTab" }).click();
    await expect(page.locator(".mt-editor-status")).toContainText("exporté");
    const exported = await page.evaluate(() => window.exports);
    expect(exported).toHaveLength(1);
    expect(exported[0].code).toContain("--background-primary:#123456!important");
    expect(exported[0].code).toContain("--background-secondary:#234567!important");
    expect(exported[0].options.flag).toBe("wx");
    await page.getByRole("button", { name: "Voir mes thèmes" }).click();
    await expect(page.locator(".mt-card")).toContainText("Mon univers");
    await expect(page.getByRole("switch", { name: "Activer Mon univers" })).not.toBeChecked();
    await page.getByRole("switch", { name: "Activer Mon univers" }).check();
});

test("créateur : validation, erreurs d’export et sauvegarde visibles", async ({ page }) => {
    await openCatalog(page);
    await page.getByRole("tab", { name: "Créer", exact: true }).click();
    await page.getByLabel("Nom du thème", { exact: true }).fill("*/");
    await expect(page.getByRole("button", { name: "Exporter vers ModsTab" })).toBeDisabled();
    await expect(page.locator(".mt-editor-status")).toContainText("Le nom");
    await page.getByLabel("Nom du thème", { exact: true }).fill("Valide");
    await page.evaluate(() => {
        window.saveError = true;
        window.require = () => { throw new Error("Accès au disque refusé"); };
    });
    await page.getByLabel("Police", { exact: true }).selectOption("system");
    expect(await page.evaluate(() => window.toasts.at(-1).message)).toContain("Brouillon non enregistré");
    await page.getByRole("button", { name: "Exporter vers ModsTab" }).click();
    await expect(page.locator(".mt-editor-status")).toContainText("Échec de l’export : Accès au disque refusé");
    await expect(page.getByRole("button", { name: "Exporter vers ModsTab" })).toBeEnabled();
});

test("créateur : modes Basique et Avancé avec brouillon commun et validation conservée", async ({ page }) => {
    await openCatalog(page);
    await page.getByRole("tab", { name: "Créer", exact: true }).click();
    const basic = page.getByRole("button", { name: "Basique", exact: true });
    const advanced = page.getByRole("button", { name: "Avancé", exact: true });
    const secondary = page.getByLabel("Salons et membres", { exact: true });
    const spacing = page.getByLabel("Espacement des messages", { exact: true });
    await expect(basic).toHaveAttribute("aria-pressed", "true");
    await expect(secondary).toBeHidden();
    await expect(spacing).toBeHidden();
    await page.getByLabel("Accent", { exact: true }).fill("#abcdef");
    await advanced.focus();
    await page.keyboard.press("Enter");
    await expect(advanced).toHaveAttribute("aria-pressed", "true");
    await expect(advanced).toBeFocused();
    await secondary.fill("#123456");
    await spacing.fill("24");
    await page.getByLabel("Nom du thème", { exact: true }).fill("*/");
    await basic.click();
    await expect(secondary).toBeHidden();
    await expect(page.getByRole("button", { name: "Exporter vers ModsTab" })).toBeDisabled();
    await expect(page.locator(".mt-editor-status")).toContainText("Le nom");
    await advanced.click();
    await expect(secondary).toHaveValue("#123456");
    await expect(spacing).toHaveValue("24");
    await expect(page.getByLabel("Accent", { exact: true })).toHaveValue("#abcdef");
    await page.getByLabel("Nom du thème", { exact: true }).fill("Commun");
    await page.getByRole("tab", { name: "Découvrir", exact: true }).click();
    await page.getByRole("tab", { name: "Créer", exact: true }).click();
    await expect(advanced).toHaveAttribute("aria-pressed", "true");
    await expect(secondary).toHaveValue("#123456");
    await page.getByLabel("Palette de départ", { exact: true }).selectOption("clair");
    await expect(advanced).toHaveAttribute("aria-pressed", "true");
    await expect(secondary).toHaveValue("#eef0f5");
    await expect(spacing).toHaveValue("24");
    expect(await page.evaluate(() => window.savedSettings.themeDraft.spacing)).toBe(24);
});

test("créateur : palette claire et petite fenêtre sans débordement", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await openCatalog(page);
    await page.getByRole("tab", { name: "Créer", exact: true }).click();
    await page.getByLabel("Palette de départ", { exact: true }).selectOption("clair");
    await expect(page.getByRole("region", { name: "Aperçu Discord en direct" }).locator(".theme-dark")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    expect(await page.locator(".mt-scroll").evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(await page.locator(".mt-tabs").evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.getByRole("button", { name: "Avancé", exact: true }).click();
    await expect(page.getByLabel("Espacement des messages", { exact: true })).toBeVisible();
    expect(await page.locator(".mt-scroll").evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
});

test("Originals reste utilisable pendant le chargement du catalogue", async ({ page }) => {
    await openCatalog(page, { mode: "pending" });
    await page.getByRole("tab", { name: "Originals", exact: true }).click();
    await expect(page.locator(".mt-skeleton")).toHaveCount(0);
    const toggle = page.getByRole("switch", { name: "Activer le thème Graphite", exact: true });
    await toggle.check();
    await toggle.focus();
    await page.evaluate(() => { window.fetchMode = "ready"; window.resolveFetch(); });
    await expect.poll(() => page.evaluate(() => window.plugin.catalogState)).toBe("ready");
    await expect(toggle).toBeChecked();
    await expect(toggle).toBeFocused();
    await expect(page.getByRole("tabpanel")).toContainText("ModsTab Originals");
});

test("Graphite est inclus, facultatif et mémorisé après redémarrage", async ({ page }) => {
    await openCatalog(page);
    await expect(page.locator(".mt-theme")).toBeHidden();
    await expect(page.locator("html")).not.toHaveAttribute("data-modstab-theme", "graphite");
    await page.getByRole("tab", { name: "Originals", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Graphite", exact: true })).toBeVisible();
    const toggle = page.getByRole("switch", { name: "Activer le thème Graphite", exact: true });
    await expect(toggle).not.toBeChecked();
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).toBeChecked();
    await expect(toggle).toBeFocused();
    await expect(page.locator("html")).toHaveAttribute("data-modstab-theme", "graphite");
    expect(await page.locator(".mt-win").evaluate((node) => getComputedStyle(node).backgroundColor)).toBe("rgb(20, 20, 20)");
    expect(await page.evaluate(() => window.savedSettings.graphiteEnabled)).toBe(true);
    expect(await page.evaluate(() => window.enabledThemes.size)).toBe(0);
    await page.getByRole("button", { name: "Fermer", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-modstab-theme", "graphite");
    await page.evaluate(() => {
        window.plugin.stop();
    });
    await expect(page.locator("html")).not.toHaveAttribute("data-modstab-theme", "graphite");
    await expect(page.locator("#modstab-style")).toHaveCount(0);
    await page.evaluate(() => {
        window.plugin = new window.module.exports({ name: "ModsTab" });
        window.plugin.start();
    });
    await expect(page.locator("html")).toHaveAttribute("data-modstab-theme", "graphite");
    await page.getByRole("button", { name: "Ouvrir l’onglet Mods" }).click();
    await page.getByRole("tab", { name: "Originals", exact: true }).click();
    await expect(toggle).toBeChecked();
    await toggle.uncheck();
    await expect(page.locator("html")).not.toHaveAttribute("data-modstab-theme", "graphite");
    expect(await page.locator(".mt-win").evaluate((node) => getComputedStyle(node).backgroundColor)).toBe("rgb(16, 18, 27)");
    expect(await page.evaluate(() => window.savedSettings.graphiteEnabled)).toBe(false);
});

test("Graphite reste disponible hors ligne et une erreur de sauvegarde ne change pas le thème", async ({ page }) => {
    await openCatalog(page, { mode: "error" });
    await page.getByRole("tab", { name: "Originals", exact: true }).click();
    await expect(page.getByText("Le catalogue fait une pause")).toBeHidden();
    const toggle = page.getByRole("switch", { name: "Activer le thème Graphite", exact: true });
    await expect(toggle).toBeEnabled();
    await page.evaluate(() => { window.saveError = true; });
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    await expect(page.locator("html")).not.toHaveAttribute("data-modstab-theme", "graphite");
    expect(await page.evaluate(() => window.toasts.at(-1).message)).toContain("Écriture refusée");
    await page.evaluate(() => { window.saveError = false; });
    await toggle.check();
    await page.getByRole("tab", { name: "Ma bibliothèque" }).click();
    await expect(toggle).toBeHidden();
    await page.getByRole("tab", { name: "Originals", exact: true }).click();
    await expect(toggle).toBeChecked();
    await page.evaluate(() => { window.saveError = true; });
    await toggle.click();
    await expect(toggle).toBeChecked();
    await expect(page.locator("html")).toHaveAttribute("data-modstab-theme", "graphite");
});

test("une erreur de lecture des préférences est signalée sans empêcher l’ouverture de ModsTab", async ({ page }) => {
    await openCatalog(page);
    await page.evaluate(() => {
        window.plugin.stop();
        window.loadError = true;
        window.plugin.start();
    });
    expect(await page.evaluate(() => window.toasts.at(-1).message)).toContain("Lecture refusée");
    await page.getByRole("button", { name: "Ouvrir l’onglet Mods" }).click();
    await page.getByRole("tab", { name: "Originals", exact: true }).click();
    await expect(page.getByRole("switch", { name: "Activer le thème Graphite", exact: true })).not.toBeChecked();
    await expect(page.locator("html")).not.toHaveAttribute("data-modstab-theme", "graphite");
});

test("Graphite respecte les thèmes hôtes et restaure leurs couleurs en mode clair ou sombre", async ({ page }) => {
    await openCatalog(page);
    await page.addStyleTag({ content: ".theme-dark,.theme-light,.theme-darker,.theme-midnight{--background-primary:rgb(100, 110, 120);--text-normal:rgb(10, 20, 30)} .host-chat{background:var(--background-primary);color:var(--text-normal)}" });
    await page.evaluate(() => {
        const host = document.createElement("div");
        host.id = "host-theme";
        host.className = "theme-light host-chat";
        document.body.append(host);
    });
    await page.getByRole("tab", { name: "Originals", exact: true }).click();
    const toggle = page.getByRole("switch", { name: "Activer le thème Graphite", exact: true });
    for (const mode of ["theme-light", "theme-dark", "theme-darker", "theme-midnight"]) {
        await page.locator("#host-theme").evaluate((node, value) => { node.className = `${value} host-chat`; }, mode);
        await toggle.check();
        await expect(page.locator("#host-theme")).toHaveCSS("background-color", "rgb(32, 32, 32)");
        await expect(page.locator("#host-theme")).toHaveCSS("color", "rgb(228, 228, 228)");
        await toggle.uncheck();
        await expect(page.locator("#host-theme")).toHaveCSS("background-color", "rgb(100, 110, 120)");
        await expect(page.locator("#host-theme")).toHaveCSS("color", "rgb(10, 20, 30)");
    }
});

test("Graphite préserve les couleurs des médias, rôles et statuts sans filtre global", async ({ page }) => {
    await openCatalog(page);
    await page.evaluate(() => {
        const fixture = document.createElement("div");
        fixture.id = "night-colors";
        fixture.style.cssText = "position:fixed;left:20px;top:20px;width:256px;height:128px;display:grid;grid-template-columns:repeat(4,64px);background:white;pointer-events:none";
        for (const color of ["#ff0000", "#00ff00", "#0000ff", "#ffffff"]) {
            const tile = document.createElement("div");
            tile.style.background = color;
            fixture.append(tile);
        }
        const avatar = document.createElement("img");
        avatar.alt = "Avatar coloré";
        avatar.src = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><path fill="#ff00ff" d="M0 0h64v64H0z"/></svg>');
        const role = document.createElement("span");
        role.style.cssText = "color:#00ffff;background:#ff8800;font:16px sans-serif";
        role.textContent = "Rôle";
        const status = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        status.setAttribute("viewBox", "0 0 64 64");
        status.innerHTML = '<circle cx="32" cy="32" r="30" fill="#00ff00"/>';
        const media = document.createElement("video");
        media.style.cssText = "width:64px;height:64px";
        media.poster = avatar.src;
        fixture.append(avatar, role, status, media);
        document.body.append(fixture);
    });
    await page.locator("#night-colors img").evaluate((image) => image.decode());
    await page.getByRole("button", { name: "Fermer", exact: true }).click();
    const original = await page.locator("#night-colors").screenshot();
    await page.getByRole("button", { name: "Ouvrir l’onglet Mods" }).click();
    await page.getByRole("tab", { name: "Originals", exact: true }).click();
    const toggle = page.getByRole("switch", { name: "Activer le thème Graphite", exact: true });
    await toggle.check();
    const bounds = await page.locator(".mt-win").boundingBox();
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(900);
    await page.getByRole("button", { name: "Fermer", exact: true }).click();
    await expect(page.locator("html")).toHaveCSS("filter", "none");
    expect(await page.locator("#night-colors").screenshot()).toEqual(original);
    await page.getByRole("button", { name: "Ouvrir l’onglet Mods" }).click();
    await toggle.uncheck();
    await page.getByRole("button", { name: "Fermer", exact: true }).click();
    expect(await page.locator("#night-colors").screenshot()).toEqual(original);
    await expect(page.locator("#night-colors span")).toHaveText("Rôle");
    await expect(page.locator("#night-colors svg circle")).toHaveAttribute("fill", "#00ff00");
});

test("Graphite neutralise les surfaces et adoucit les actions sans effacer les alertes", async ({ page }) => {
    await openCatalog(page);
    await page.addStyleTag({ content: `
        #soft-interface{--background-primary:#fff;--button-filled-brand-background:#5865f2;--button-filled-brand-text:#fff;--text-link:#00b0ff;--status-danger:#ed4245;--status-positive:#23a559}
        #soft-interface .surface{background:var(--background-primary)}
        #soft-interface button{background:var(--button-filled-brand-background);color:var(--button-filled-brand-text)}
        #soft-interface a{color:var(--text-link)}
        #soft-interface .danger{color:var(--status-danger)}
        #soft-interface .positive{color:var(--status-positive)}
    ` });
    await page.evaluate(() => {
        const fixture = document.createElement("div");
        fixture.id = "soft-interface";
        fixture.className = "theme-dark";
        fixture.innerHTML = '<div class="surface">Discussion</div><button>Envoyer</button><a href="#message">Lien</a><span class="danger">Erreur</span><span class="positive">En ligne</span>';
        document.body.append(fixture);
    });
    await page.getByRole("tab", { name: "Originals", exact: true }).click();
    const toggle = page.getByRole("switch", { name: "Activer le thème Graphite", exact: true });
    await toggle.check();
    await expect(page.locator("#soft-interface .surface")).toHaveCSS("background-color", "rgb(32, 32, 32)");
    await expect(page.locator("#soft-interface button")).toHaveCSS("background-color", "rgb(75, 88, 111)");
    await expect(page.locator("#soft-interface a")).toHaveCSS("color", "rgb(175, 190, 216)");
    await expect(page.locator("#soft-interface .danger")).toHaveCSS("color", "rgb(237, 66, 69)");
    await expect(page.locator("#soft-interface .positive")).toHaveCSS("color", "rgb(35, 165, 89)");
    await page.getByRole("tab", { name: "Découvrir", exact: true }).click();
    const contrast = ([red, green, blue], [r, g, b]) => {
        const luminance = (channels) => channels.map((value) => value / 255)
            .map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
            .reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
        const values = [luminance([red, green, blue]), luminance([r, g, b])].sort((a, b) => b - a);
        return (values[0] + .05) / (values[1] + .05);
    };
    for (const selector of ["#soft-interface button", ".mt-btn:not(.mt-btn-secondary)"]) {
        const colors = await page.locator(selector).first().evaluate((node) => {
            const css = getComputedStyle(node);
            return [css.color, css.backgroundColor].map((color) => color.match(/\d+/g).slice(0, 3).map(Number));
        });
        expect(contrast(...colors)).toBeGreaterThanOrEqual(4.5);
    }
    await page.getByRole("tab", { name: "Originals", exact: true }).click();
    await toggle.uncheck();
    await expect(page.locator("#soft-interface .surface")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page.locator("#soft-interface button")).toHaveCSS("background-color", "rgb(88, 101, 242)");
});

for (const width of [360, 1280]) {
    test(`Graphite à ${width}px : aperçu, catalogue et détails sans débordement`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await openCatalog(page, { data: [...addons, ...themes] });
        await page.getByRole("tab", { name: "Originals", exact: true }).click();
        await page.getByRole("switch", { name: "Activer le thème Graphite", exact: true }).check();
        expect(await page.locator("#modstab-panel").evaluate((root) =>
            [...root.querySelectorAll(".mt-win,.mt-scroll,.mt-theme,.mt-tabs")].every((node) => node.scrollWidth <= node.clientWidth + 1))).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`graphite-${width}.png`), animations: "disabled" });
        await page.getByRole("tab", { name: "Découvrir", exact: true }).click();
        await page.getByRole("button", { name: "Thèmes", exact: true }).click();
        await page.locator(".mt-name-button").first().click();
        await expect(page.locator(".mt-theme")).toBeHidden();
        expect(await page.locator(".mt-win").evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
        await page.keyboard.press("Escape");
        await expect(page.locator(".mt-theme")).toBeHidden();
        await page.getByRole("tab", { name: "Originals", exact: true }).click();
        await expect(page.getByRole("switch", { name: "Activer le thème Graphite", exact: true })).toBeChecked();
    });
}

test("tous les résultats sont accessibles et les détails conservent la page", async ({ page }) => {
    await openCatalog(page);
    await page.getByRole("button", { name: "Suivant", exact: true }).click();
    await expect(page.locator(".mt-pagination")).toContainText("19–36 sur 41");
    const detailButton = page.locator(".mt-name-button").first();
    const name = await detailButton.textContent();
    await detailButton.click();
    await expect(page.locator("[data-detail-title]")).toBeFocused();
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Fiche officielle BetterDiscord" })).toHaveAttribute("rel", "noopener noreferrer");
    await page.keyboard.press("Escape");
    await expect(page.locator(".mt-pagination")).toContainText("19–36 sur 41");
    await expect(detailButton).toBeFocused();
    await page.getByRole("button", { name: "Suivant", exact: true }).click();
    await expect(page.locator(".mt-card")).toHaveCount(5);
    await expect(page.getByRole("button", { name: "Suivant", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Précédent", exact: true }).click();
    await expect(page.locator(".mt-card")).toHaveCount(18);
});

test("navigation clavier, focus modal et retour au lanceur", async ({ page }) => {
    await openCatalog(page);
    await page.keyboard.press("Escape");
    const launcher = page.getByRole("button", { name: "Ouvrir l’onglet Mods" });
    await expect(launcher).toBeFocused();
    await launcher.press("Enter");
    await expect(page.getByRole("searchbox")).toBeFocused();
    const discover = page.getByRole("tab", { name: "Découvrir" });
    await discover.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Ma bibliothèque" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: "Ma bibliothèque" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(discover).toHaveAttribute("aria-selected", "true");
    await discover.press("Shift+Tab");
    await expect(page.getByRole("button", { name: "Suivant", exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(discover).toBeFocused();
});

test("interrupteurs, identifiants BetterDiscord et protection de ModsTab", async ({ page }) => {
    await openCatalog(page);
    await page.getByRole("tab", { name: "Ma bibliothèque" }).click();
    const toggle = page.locator('[data-focus-key="toggle-internal-echo"]');
    await toggle.uncheck();
    await expect(page.getByRole("switch", { name: "Activer Écho Vocal" })).not.toBeChecked();
    expect(await page.evaluate(() => window.enabled.has("internal-echo"))).toBe(false);
    await expect(page.getByRole("switch", { name: "ModsTab (désactivation indisponible)", exact: true })).toBeDisabled();
    await page.evaluate(() => { window.toggleError = true; });
    await page.getByRole("switch", { name: "Activer Écho Vocal" }).click();
    await expect(page.getByRole("switch", { name: "Activer Écho Vocal" })).not.toBeChecked();
    expect(await page.evaluate(() => window.toasts.at(-1).type)).toBe("error");
});

test("chargement animé, erreur puis nouvelle tentative", async ({ page }) => {
    await openCatalog(page, { mode: "pending" });
    await expect(page.locator(".mt-skeleton")).toHaveCount(6);
    await page.evaluate(() => { window.fetchMode = "error"; window.resolveFetch(); });
    await expect(page.getByText("Le catalogue fait une pause")).toBeVisible();
    await page.evaluate(() => { window.fetchMode = "ready"; });
    await page.getByRole("button", { name: "Réessayer", exact: true }).click();
    await expect(page.locator(".mt-card")).toHaveCount(18);
});

test("catalogue vide et miniature indisponible", async ({ page }) => {
    await openCatalog(page, { data: [] });
    await expect(page.getByText("Le catalogue officiel est vide pour le moment.")).toBeVisible();
    await page.evaluate((data) => { window.testData = data; }, addons);
    await page.getByRole("button", { name: "Actualiser", exact: true }).click();
    const card = page.locator(".mt-card").filter({ has: page.getByRole("button", { name: "Voir les détails de BetterFolders", exact: true }) });
    await expect(card).toBeVisible();
    await expect(card.locator("img")).toHaveCount(0);
    await expect(card.locator(".mt-monogram")).toBeVisible();
});

test("confirmation non bloquée, installation et erreur explicite", async ({ page }) => {
    await openCatalog(page);
    const install = page.getByRole("button", { name: "Installer BetterFolders", exact: true });
    await install.click();
    await expect(page.locator("#modstab-panel")).toBeHidden();
    await expect(page.getByRole("button", { name: "Annuler", exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Mods" })).toBeVisible();
    await expect(install).toBeFocused();
    await page.evaluate(() => {
        window.plugin.download = async (p) => {
            window.installed.push({ id: "new-plugin-key", name: p.name });
        };
    });
    await install.click();
    await page.getByRole("button", { name: "Confirmer l’installation" }).click();
    await expect(page.getByRole("switch", { name: "Désactiver BetterFolders", exact: true })).toBeChecked();
    expect(await page.evaluate(() => window.enabled.has("new-plugin-key"))).toBe(true);
    await page.evaluate(() => {
        window.plugin.download = async () => { throw new Error("Réseau indisponible"); };
    });
    await page.getByRole("button", { name: "Installer QuietHours", exact: true }).click();
    await page.getByRole("button", { name: "Confirmer l’installation" }).click();
    await expect(page.getByRole("button", { name: "Installer QuietHours", exact: true })).toBeEnabled();
    expect(await page.evaluate(() => window.toasts.at(-1).message)).toContain("Réseau indisponible");
});

test("l’installation en cours reste visible après un changement d’onglet", async ({ page }) => {
    await openCatalog(page);
    await page.evaluate(() => {
        window.plugin.download = (p) => new Promise((resolve) => {
            window.finishDownload = () => {
                window.installed.push({ id: "pending-plugin", name: p.name });
                resolve();
            };
        });
    });
    await page.getByRole("button", { name: "Installer BetterFolders", exact: true }).click();
    await page.getByRole("button", { name: "Confirmer l’installation" }).click();
    const install = page.getByRole("button", { name: "Installer BetterFolders", exact: true });
    await expect(install).toBeDisabled();
    await expect(install).toHaveAttribute("aria-busy", "true");
    await page.getByRole("tab", { name: "Ma bibliothèque" }).click();
    await page.getByRole("tab", { name: "Découvrir" }).click();
    await expect(install).toContainText("Installation…");
    await page.evaluate(() => window.finishDownload());
    await expect(page.getByRole("switch", { name: "Désactiver BetterFolders", exact: true })).toBeChecked();
});

for (const width of [360, 1280]) {
    test(`rendu responsive sans débordement à ${width}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await openCatalog(page);
        const overflow = () => page.locator("#modstab-panel").evaluate((root) =>
            [...root.querySelectorAll(".mt-win,.mt-scroll,.mt-card,.mt-toolbar")].some((node) => node.scrollWidth > node.clientWidth + 1));
        expect(await overflow()).toBe(false);
        const columns = await page.locator(".mt-grid").evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
        expect(columns).toBe(width === 360 ? 1 : 3);
        await page.screenshot({ path: testInfo.outputPath(`catalog-${width}.png`), animations: "disabled" });
        await page.locator(".mt-name-button").first().click();
        expect(await overflow()).toBe(false);
        await page.screenshot({ path: testInfo.outputPath(`detail-${width}.png`), animations: "disabled" });
    });
}

test("le survol anime les cartes sans masquer leurs actions", async ({ page }) => {
    await openCatalog(page);
    const card = page.locator(".mt-card").first();
    await card.hover();
    await expect.poll(() => card.evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m42)).toBeLessThan(0);
    await expect(card.getByRole("switch")).toBeEnabled();
});

test("respect du mode de réduction des animations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openCatalog(page);
    expect(await page.locator(".mt-art-icon").evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
    expect(await page.locator(".mt-card").first().evaluate((node) => getComputedStyle(node).transitionDuration)).toBe("0s");
});

test("catalogue des thèmes : catégories, pagination, détails et installation isolée", async ({ page }) => {
    await openCatalog(page, { data: [...addons, ...themes] });
    await page.getByRole("button", { name: "Suivant", exact: true }).click();
    await page.getByRole("button", { name: "Thèmes", exact: true }).click();
    await expect(page.locator(".mt-pagination")).toContainText("1–18 sur 20 thèmes");
    await expect(page.getByRole("combobox", { name: "Catégorie", exact: true }).getByRole("option", { name: "Sombre", exact: true })).toHaveCount(1);
    await page.getByRole("button", { name: "Sombre", exact: true }).click();
    await expect(page.locator(".mt-card")).toHaveCount(10);
    await page.getByRole("button", { name: "Tout explorer", exact: true }).click();
    await page.getByRole("button", { name: "Voir les détails de Écho Vocal", exact: true }).click();
    await expect(page.getByRole("link", { name: "Fiche officielle BetterDiscord" })).toHaveAttribute("href", "https://betterdiscord.app/theme?id=100");
    await expect(page.getByRole("button", { name: "Installer Écho Vocal", exact: true })).toBeEnabled();
    await page.evaluate(() => {
        window.plugin.download = async (p) => window.installedThemes.push({ id: "theme-echo", name: p.name });
    });
    await page.getByRole("button", { name: "Installer Écho Vocal", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Installer Écho Vocal ?" })).toContainText("Ce thème");
    await page.getByRole("button", { name: "Confirmer l’installation" }).click();
    await expect(page.getByRole("switch", { name: "Désactiver Écho Vocal" })).toBeChecked();
    expect(await page.evaluate(() => window.enabledThemes.has("theme-echo"))).toBe(true);
    await page.getByRole("tab", { name: "Ma bibliothèque" }).click();
    await expect(page.locator(".mt-card")).toHaveCount(1);
    await page.getByRole("switch", { name: "Désactiver Écho Vocal" }).click();
    await expect(page.getByRole("switch", { name: "Activer Écho Vocal" })).not.toBeChecked();
    expect(await page.evaluate(() => window.enabled.has("internal-echo"))).toBe(true);
    await page.getByRole("button", { name: "Plugins", exact: true }).click();
    await expect(page.locator(".mt-card")).toHaveCount(2);
});

test("un thème nommé ModsTab reste désactivable et les erreurs sont signalées", async ({ page }) => {
    await openCatalog(page, { data: [...addons, ...themes] });
    await page.evaluate(() => {
        window.installedThemes.push({ id: "theme-modstab", name: "ModsTab" });
        window.enabledThemes.add("theme-modstab");
    });
    await page.getByRole("button", { name: "Thèmes", exact: true }).click();
    await page.getByRole("tab", { name: "Ma bibliothèque" }).click();
    const toggle = page.getByRole("switch", { name: "Désactiver ModsTab", exact: true });
    await expect(toggle).toBeEnabled();
    await toggle.click();
    await expect(page.getByRole("switch", { name: "Activer ModsTab", exact: true })).not.toBeChecked();
    await page.evaluate(() => { window.toggleError = true; });
    await page.getByRole("switch", { name: "Activer ModsTab", exact: true }).click();
    await expect(page.getByRole("switch", { name: "Activer ModsTab", exact: true })).not.toBeChecked();
    expect(await page.evaluate(() => window.toasts.at(-1).type)).toBe("error");
    await page.getByRole("tab", { name: "Découvrir" }).click();
    await page.evaluate(() => {
        window.plugin.download = async () => { throw new Error("Téléchargement du thème impossible"); };
    });
    await page.getByRole("button", { name: "Installer Écho Vocal", exact: true }).click();
    await page.getByRole("button", { name: "Confirmer l’installation" }).click();
    await expect(page.getByRole("button", { name: "Installer Écho Vocal", exact: true })).toBeEnabled();
    expect(await page.evaluate(() => window.toasts.at(-1).message)).toContain("Téléchargement du thème impossible");
});

test("une installation de thème reste ciblée après passage aux plugins", async ({ page }) => {
    await openCatalog(page, { data: [...addons, ...themes] });
    await page.getByRole("button", { name: "Thèmes", exact: true }).click();
    await page.evaluate(() => {
        window.plugin.download = (p) => new Promise((resolve) => {
            window.finishTheme = () => {
                window.installedThemes.push({ id: "background-theme", name: p.name });
                resolve();
            };
        });
    });
    await page.getByRole("button", { name: "Installer ModsTab", exact: true }).click();
    await page.getByRole("button", { name: "Confirmer l’installation" }).click();
    await expect(page.getByRole("button", { name: "Installer ModsTab", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Plugins", exact: true }).click();
    await page.evaluate(() => window.finishTheme());
    await expect.poll(() => page.evaluate(() => window.enabledThemes.has("background-theme"))).toBe(true);
    expect(await page.evaluate(() => window.enabled.has("background-theme"))).toBe(false);
    await page.getByRole("button", { name: "Thèmes", exact: true }).click();
    await expect(page.getByRole("switch", { name: "Désactiver ModsTab", exact: true })).toBeChecked();
});

for (const width of [360, 1280]) {
    test(`thèmes à ${width}px : bibliothèque vide et absence de débordement`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await openCatalog(page, { data: [...addons, ...themes] });
        await page.getByRole("button", { name: "Thèmes", exact: true }).click();
        await expect(page.locator(".mt-card")).toHaveCount(18);
        expect(await page.locator(".mt-win").evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
        await page.getByRole("tab", { name: "Ma bibliothèque" }).click();
        await expect(page.getByText("Votre collection commence ici")).toBeVisible();
        await page.getByRole("button", { name: "Explorer le catalogue", exact: true }).click();
        await expect(page.getByRole("button", { name: "Thèmes", exact: true })).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator(".mt-card")).toHaveCount(18);
    });
}
