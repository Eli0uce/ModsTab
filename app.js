"use strict";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        }
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("will-reveal");
        observer.observe(el);
    });
}

const tabs = [...document.querySelectorAll("[data-demo]")];
const demoPanel = document.querySelector("#demo-panel");
function selectTab(tab) {
    for (const candidate of tabs) {
        candidate.setAttribute("aria-selected", String(candidate === tab));
        candidate.tabIndex = candidate === tab ? 0 : -1;
    }
    demoPanel.setAttribute("aria-labelledby", tab.id);
    const originals = tab.dataset.demo === "originals";
    document.querySelector("#demo-cards").hidden = originals;
    document.querySelector("#demo-originals").hidden = !originals;
    document.querySelectorAll(".card-bottom").forEach((el, i) => {
        const labels = tab.dataset.demo === "library"
            ? ["Installé · Actif", "Installé · Actif", "Installé · Inactif"]
            : ["Plugin", "Original inclus", "Spotify Original"];
        el.replaceChildren(document.createTextNode(labels[i]));
    });
}
for (const tab of tabs) {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
        let next;
        const index = tabs.indexOf(tab);
        if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
        if (event.key === "ArrowLeft") next = tabs[(index + tabs.length - 1) % tabs.length];
        if (event.key === "Home") next = tabs[0];
        if (event.key === "End") next = tabs.at(-1);
        if (!next) return;
        event.preventDefault();
        selectTab(next);
        next.focus();
    });
}

document.querySelector("#theme-toggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const active = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(active));
    document.querySelector("#graphite-demo").classList.toggle("theme-off", !active);
    button.querySelector(".visual-switch").classList.toggle("on", active);
    button.childNodes[1].textContent = active ? " Graphite activé " : " Graphite désactivé ";
});

const playButton = document.querySelector("#demo-play");
playButton.addEventListener("click", () => {
    const playing = playButton.getAttribute("aria-pressed") !== "true";
    playButton.setAttribute("aria-pressed", String(playing));
    playButton.setAttribute("aria-label", playing ? "Mettre en pause l’animation du lecteur" : "Lancer l’animation du lecteur");
    document.querySelector(".spotify-visual").classList.toggle("playing", playing);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", playing ? "M8 5v14M16 5v14" : "m8 5 11 7-11 7Z");
    svg.append(path);
    playButton.replaceChildren(svg);
});
