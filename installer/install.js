#!/usr/bin/env node
"use strict";

/**
 * Installe ModsTab :
 *   1. vérifie que BetterDiscord est présent, sinon l'installe via le CLI officiel (bdcli) ;
 *   2. copie ModsTab.plugin.js dans le dossier de plugins BetterDiscord.
 *
 * Usage : node installer/install.js [--channel=stable|ptb|canary]
 * Fonctionne sous Windows et macOS (Linux : chemin standard).
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const PLUGIN_FILE = "ModsTab.plugin.js";
const isWin = process.platform === "win32";
const isMac = process.platform === "darwin";
const channel = (process.argv.find((a) => a.startsWith("--channel=")) || "--channel=stable").split("=")[1];

const log = (m) => console.log(`[ModsTab] ${m}`);
const fail = (m) => {
    console.error(`[ModsTab] ERREUR : ${m}`);
    process.exit(1);
};

function bdDir() {
    if (isWin) return path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "BetterDiscord");
    if (isMac) return path.join(os.homedir(), "Library", "Application Support", "BetterDiscord");
    return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "BetterDiscord");
}

const run = (cmd, args) => spawnSync(cmd, args, { stdio: "inherit", shell: isWin });
const has = (cmd) => spawnSync(isWin ? "where" : "which", [cmd], { stdio: "ignore", shell: isWin }).status === 0;

// BetterDiscord installé = son bundle principal existe dans son dossier de données.
const bdInstalled = () => fs.existsSync(path.join(bdDir(), "data", "betterdiscord.asar"));

// Cherche bdcli dans le PATH, puis dans le dossier global de npm (PATH parfois non rafraîchi).
function findBdcli() {
    if (has("bdcli")) return "bdcli";
    const r = spawnSync("npm", ["prefix", "-g"], { encoding: "utf8", shell: isWin });
    if (r.status === 0 && r.stdout.trim()) {
        const prefix = r.stdout.trim();
        const names = isWin ? ["bdcli.cmd", "bdcli.exe"] : ["bdcli"];
        for (const dir of isWin ? [prefix] : [path.join(prefix, "bin")]) {
            for (const n of names) {
                const full = path.join(dir, n);
                if (fs.existsSync(full)) return isWin ? `"${full}"` : full;
            }
        }
    }
    return null;
}

function ensureBdcli() {
    let cli = findBdcli();
    if (cli) return cli;
    log("CLI BetterDiscord (bdcli) introuvable, tentative d'installation…");
    const attempts = [];
    if (has("npm")) attempts.push(["npm", ["install", "-g", "@betterdiscord/cli"]]);
    if (isWin && has("winget")) attempts.push(["winget", ["install", "betterdiscord.cli"]]);
    if (isMac && has("brew")) attempts.push(["brew", ["install", "betterdiscord/tap/bdcli"]]);
    for (const [cmd, args] of attempts) {
        run(cmd, args);
        cli = findBdcli();
        if (cli) return cli;
    }
    return fail(
        "impossible d'installer bdcli automatiquement. Installez-le à la main " +
            "(https://github.com/BetterDiscord/cli/releases) puis relancez ce script."
    );
}

function main() {
    if (process.argv.includes("--help")) {
        console.log("Usage : node installer/install.js [--channel=stable|ptb|canary]");
        return;
    }
    if (bdInstalled()) {
        log("BetterDiscord est déjà installé.");
    } else {
        log("BetterDiscord n'est pas installé : installation en cours (Discord sera fermé puis relancé)…");
        const cli = ensureBdcli();
        const res = run(cli, ["install", "--channel", channel]);
        if (res.status !== 0) fail("l'installation de BetterDiscord a échoué. Vérifiez que l'application Discord de bureau est installée (pas la version navigateur), lancez-la une fois, puis relancez ce script.");
        if (!bdInstalled()) log("Avertissement : BetterDiscord installé mais non détecté à l'emplacement attendu.");
    }

    const src = path.join(__dirname, "..", "plugin", PLUGIN_FILE);
    if (!fs.existsSync(src)) fail(`${PLUGIN_FILE} introuvable dans le dossier plugin/.`);
    const dest = path.join(bdDir(), "plugins");
    fs.mkdirSync(dest, { recursive: true });
    fs.copyFileSync(src, path.join(dest, PLUGIN_FILE));
    log(`Plugin copié dans ${dest}`);
    log("Dernière étape : Discord > Paramètres > Plugins > activer « ModsTab ».");
}

main();
