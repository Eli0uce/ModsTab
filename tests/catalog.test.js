"use strict";

const assert = require("assert").strict;
const ModsTab = require("../plugin/ModsTab.plugin.js");
const fs = require("fs");
const os = require("os");
const path = require("path");

async function main() {
    const plugin = new ModsTab({ name: "ModsTab" });
    const addon = {
        type: "plugin",
        id: 291,
        name: "ShowConnections",
        version: "1.3.3",
        description: "Shows connected accounts.",
        author: { display_name: "DevilBro", github_name: "mwittrien" },
        file_name: "ShowConnections.plugin.js",
        downloads: 424906,
        likes: "281",
        tags: ["members", "enhancement", "enhancement"],
        thumbnail_url: "/image/512",
        latest_release_date: "2026-04-28T16:33:38.051Z",
        initial_release_date: "2021-05-31T13:04:52.109Z",
    };
    let requestedUrl;
    let response = { ok: true, json: async () => [addon] };
    Object.defineProperty(plugin, "netFetch", {
        value: async (url) => {
            requestedUrl = url;
            return response;
        },
    });

    await plugin.loadCatalog();
    assert.equal(requestedUrl, "https://api.betterdiscord.app/v3/store/addons");
    assert.equal(plugin.catalogState, "ready");
    assert.deepEqual(plugin.catalog, [{
        type: "plugin",
        id: 291,
        name: "ShowConnections",
        version: "1.3.3",
        description: "Shows connected accounts.",
        author: "DevilBro",
        file: "ShowConnections.plugin.js",
        downloads: 424906,
        likes: 281,
        tags: ["members", "enhancement"],
        thumbnail: "https://betterdiscord.app/image/512",
        updatedAt: Date.parse(addon.latest_release_date),
        publishedAt: Date.parse(addon.initial_release_date),
    }]);

    const normalized = plugin.normalize([
        { ...addon, id: 2, name: "Écho Vocal", tags: ["voice"], downloads: 10, likes: 500, latest_release_date: "2026-10-01", initial_release_date: "2023-01-01" },
        { ...addon, id: 3, name: "Alpha", downloads: 1, initial_release_date: "2026-01-01" },
        addon,
        null,
        { id: 4 },
    ]);
    plugin.catalog = normalized;
    assert.deepEqual(plugin.filteredCatalog().map((p) => p.id), [291, 2, 3]);
    plugin.sort = "liked";
    assert.equal(plugin.filteredCatalog()[0].id, 2);
    plugin.sort = "name";
    assert.equal(plugin.filteredCatalog()[0].name, "Alpha");
    plugin.sort = "updated";
    assert.equal(plugin.filteredCatalog()[0].id, 2);
    plugin.sort = "newest";
    assert.equal(plugin.filteredCatalog()[0].id, 3);
    plugin.category = "voice";
    plugin.query = "echo devilbro";
    assert.deepEqual(plugin.filteredCatalog().map((p) => p.id), [2]);
    plugin.query = "introuvable";
    assert.deepEqual(plugin.filteredCatalog(), []);
    plugin.query = "";
    plugin.category = "all";
    assert.deepEqual(normalized.map((p) => p.id), [2, 3, 291], "Le tri ne doit pas modifier le catalogue d’origine");
    const fallback = plugin.normalize([{ type: "plugin", id: 9, name: "Minimal", thumbnail_url: "https://example.com/untrusted.png", downloads: "invalid" }])[0];
    assert.equal(fallback.thumbnail, null);
    assert.equal(fallback.downloads, 0);
    assert.deepEqual(fallback.tags, []);
    assert.equal(fallback.updatedAt, 0);
    const theme = plugin.normalize([{ type: "theme", id: 90, name: "Écho Vocal", tags: ["dark"], downloads: 50 }])[0];
    assert.equal(theme.file, "Écho Vocal.theme.css");
    plugin.catalog = [...normalized, theme];
    plugin.kind = "theme";
    assert.deepEqual(plugin.filteredCatalog().map((p) => p.id), [90]);
    assert.equal(plugin.tagLabel("dark"), "Sombre");
    plugin.kind = "plugin";
    assert.equal(plugin.filteredCatalog().length, 3);
    assert.deepEqual(plugin.normalize([{ type: "unknown", id: 99, name: "Invalid" }]), []);
    assert.throws(() => plugin.normalize({ unexpected: [] }), /format du catalogue inattendu/);

    response = { ok: true, json: async () => [] };
    await plugin.loadCatalog();
    assert.equal(plugin.catalogState, "ready");
    assert.deepEqual(plugin.catalog, []);

    response = { ok: false, status: 503 };
    await plugin.loadCatalog();
    assert.equal(plugin.catalogState, "error");
    assert.equal(plugin.catalogError, "HTTP 503");

    response = { ok: true, json: async () => [addon] };
    await plugin.loadCatalog();
    assert.equal(plugin.catalogState, "ready");
    assert.equal(plugin.catalog.length, 1);
    response = { ok: true, json: async () => ({ unexpected: [] }) };
    await plugin.loadCatalog();
    assert.equal(plugin.catalogState, "error");
    assert.match(plugin.catalogError, /format du catalogue inattendu/);

    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "modstab-addons-"));
    const previousApi = global.BdApi;
    try {
        const plugins = [];
        const themes = [];
        const enabledPlugins = new Set();
        const enabledThemes = new Set();
        const createManager = (items, enabled, folder) => ({
            folder,
            getAll: () => items,
            isEnabled: (key) => enabled.has(key),
            enable: (key) => enabled.add(key),
        });
        const pluginFolder = path.join(directory, "plugins");
        const themeFolder = path.join(directory, "themes");
        fs.mkdirSync(pluginFolder);
        fs.mkdirSync(themeFolder);
        global.BdApi = {
            Plugins: createManager(plugins, enabledPlugins, pluginFolder),
            Themes: createManager(themes, enabledThemes, themeFolder),
            UI: { showToast: (message, options) => notifications.push({ message, ...options }) },
        };
        const notifications = [];
        const installer = new ModsTab({ name: "ModsTab" });
        const css = "/**\n * @name Écho Vocal\n */\nbody { color: red; }";
        Object.defineProperty(installer, "netFetch", { value: async () => ({ ok: true, text: async () => css }) });
        plugins.push({ id: "same-name-plugin", name: theme.name });
        assert.equal(installer.findInstalled(theme), undefined, "Un plugin homonyme n’est pas un thème installé");
        await installer.download(theme);
        assert.equal(fs.readFileSync(path.join(themeFolder, theme.file), "utf8"), css);
        assert.deepEqual(fs.readdirSync(pluginFolder), []);
        await assert.rejects(installer.download({ ...theme, file: "Invalid.plugin.js" }), /nom de fichier inattendu/);
        await installer.download({ ...addon, file: addon.file_name });
        assert.equal(fs.existsSync(path.join(pluginFolder, addon.file_name)), true);
        await assert.rejects(installer.waitForAddon(theme, 0), /n'a pas chargé/);
        themes.push({ id: "theme-key", name: theme.name });
        assert.equal((await installer.waitForAddon(theme)).id, "theme-key");
        await installer.doInstall(theme);
        assert.equal(enabledThemes.has("theme-key"), true);
        assert.equal(enabledPlugins.size, 0);
        assert.equal(notifications.at(-1).type, "success");
        assert.equal(installer.busy.size, 0);
        await installer.doInstall({ ...theme, file: "Invalid.plugin.js" });
        assert.equal(notifications.at(-1).type, "error");
        assert.equal(installer.busy.size, 0);
    } finally {
        global.BdApi = previousApi;
        fs.rmSync(directory, { recursive: true });
    }
    console.log("Catalogue : API, métadonnées, filtres, recherche, tri, liste vide, erreurs et nouvelle tentative OK.");
}

async function spotifyTest() {
    const { SpotifyOriginal, spotifyPlan, spotifyCapabilities } = ModsTab.Spotify;
    assert.equal(spotifyPlan("premium"), "premium");
    assert.equal(spotifyPlan("free"), "free");
    assert.equal(spotifyPlan("open"), "free");
    assert.equal(spotifyPlan(undefined), "unknown");
    assert.equal(spotifyCapabilities("free").control, false);
    assert.equal(spotifyCapabilities("free").queue, false);
    assert.equal(spotifyCapabilities("free").search, true);
    assert.equal(spotifyCapabilities("free").library, true);
    assert.equal(spotifyCapabilities("premium").control, true);
    assert.equal(spotifyCapabilities("unknown").control, true);

    const toasts = [];
    const calls = [];
    const host = { toast: (message, type) => toasts.push({ message, type }), netFetch: async () => { throw new Error("réseau interdit"); } };
    const previousApi = global.BdApi;
    global.BdApi = { Data: { load: () => undefined, save: () => {} } };
    try {
        const spotify = new SpotifyOriginal(host);
        spotify.request = async (method, path, opts) => {
            calls.push([method, path, opts]);
            if (path === "/me/player/shuffle") {
                const error = new Error("Premium required");
                error.reason = "PREMIUM_REQUIRED";
                error.status = 403;
                throw error;
            }
            return null;
        };
        spotify.playback = { shuffle_state: false, item: { duration_ms: 1000 }, fetchedAt: Date.now(), progress_ms: 0 };
        await spotify.probePremium();
        assert.equal(spotify.plan, "free");
        calls.length = 0;
        await spotify.act(() => spotify.request("PUT", "/me/player/play"));
        assert.equal(calls.length, 0);
        assert.equal(toasts.at(-1).message, "Réservé à Spotify Premium");

        const premium = new SpotifyOriginal(host);
        premium.request = async (method, path, opts) => { calls.push([method, path, opts]); return null; };
        premium.playback = { shuffle_state: true, item: { duration_ms: 1000 }, fetchedAt: Date.now(), progress_ms: 0 };
        await premium.probePremium();
        assert.equal(premium.plan, "premium");
        premium.start = () => {};
    } finally {
        global.BdApi = previousApi;
    }
    console.log("Spotify : détection de l’abonnement et restrictions des contrôles OK.");
}

function themeCreatorTest() {
    const { newThemeDraft, validateThemeDraft, themeCSS } = ModsTab.ThemeCreator;
    const draft = newThemeDraft();
    assert.notEqual(draft, newThemeDraft());
    assert.match(themeCSS(draft), /--background-primary:#202127!important/);
    assert.match(themeCSS(draft), /--button-filled-brand-text:#000000!important/);
    assert.match(themeCSS({ ...draft, accent: "#000000" }), /--button-filled-brand-text:#ffffff!important/);
    assert.match(themeCSS({ ...draft, fontSize: 22, radius: 0, spacing: 4 }), /font-size:22px!important/);
    assert.match(themeCSS({ ...draft, fontSize: 12, radius: 24, spacing: 24 }), /border-radius:24px!important/);
    for (const changes of [
        { name: "" }, { name: "x".repeat(61) }, { name: "Test\n * @import url(x)" }, { name: "*/body{}" },
        { accent: "red;}" }, { font: "__proto__" }, { fontSize: 23 }, { radius: -1 }, { spacing: 4.5 },
    ]) assert.throws(() => validateThemeDraft({ ...draft, ...changes }));
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), "modstab-creator-"));
    const previousApi = global.BdApi;
    try {
        const themes = [];
        global.BdApi = { Themes: { folder, getAll: () => themes } };
        const plugin = new ModsTab({ name: "ModsTab" });
        plugin.themeDraft = { ...draft, name: "../../Création" };
        const file = plugin.writeCreatedTheme();
        assert.equal(path.basename(file), file);
        assert.match(file, /^ModsTab-.*\.theme\.css$/);
        const code = fs.readFileSync(path.join(folder, file), "utf8");
        assert.match(code, /@name \.\.\/\.\.\/Création/);
        assert.ok(code.endsWith(themeCSS(plugin.themeDraft)));
        themes.push({ name: plugin.themeDraft.name });
        assert.throws(() => plugin.writeCreatedTheme(), /déjà ce nom/);
        assert.deepEqual(fs.readdirSync(folder), [file]);
        themes.length = 0;
        assert.throws(() => plugin.writeCreatedTheme(), /déjà été exporté/);
        global.BdApi.Themes.folder = path.join(folder, "absent");
        assert.throws(() => plugin.writeCreatedTheme(), /ENOENT/);
    } finally {
        global.BdApi = previousApi;
        fs.rmSync(folder, { recursive: true });
    }
}

main().then(spotifyTest).then(themeCreatorTest).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
