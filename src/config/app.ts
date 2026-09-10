import { ManodxSite, type Document } from "../index";
import { baseComponents, createManoCard } from "./components";
import type { ManodxConfig } from "./types";

export class SiteApp {
  private readonly site: ManodxSite;
  private readonly config: ManodxConfig;
  private isDarkMode: boolean = false;
  private isTransitioning: boolean = false;

  constructor(
    private readonly root: HTMLElement,
    modules: Record<string, string>,
    config: ManodxConfig,
  ) {
    this.config = config;
    this.site = new ManodxSite({
      modules,
      contentMarker: config.contentMarker,
      indexFile: config.indexFile,
      components: { ...baseComponents, ...config.components },
    });
    this.initTheme();
  }

  private initTheme(): void {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      this.isDarkMode = true;
      document.documentElement.classList.add("dark");
    } else if (saved === "light") {
      this.isDarkMode = false;
      document.documentElement.classList.remove("dark");
    }
  }

  start(): void {
    this.open(this.config.indexFile);
  }

  open(file: string): void {
    if (this.isTransitioning) return;
    void this.transitionTo(file);
  }

  private async transitionTo(file: string): Promise<void> {
    const doc = this.site.get(file);
    if (!doc) {
      console.error(`Missing file: ${file}`);
      return;
    }

    this.isTransitioning = true;
    this.root.style.pointerEvents = "none";

    try {
      if (this.root.childElementCount > 0) {
        await this.animatePage("out");
      }

      window.scrollTo({ top: 0 });

      const body = this.site.renderDocument(doc, {
        ManoCard: createManoCard(this.site, doc.file),
      });

      this.mount(doc, body);
      this.bindManoCards();
      this.bindThemeSwitch();
      if (!this.isHome(doc)) this.bindBack(doc);

      await this.animatePage("in");
    } finally {
      this.root.style.pointerEvents = "";
      this.isTransitioning = false;
    }
  }

  private async animatePage(direction: "in" | "out"): Promise<void> {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const keyframes =
      direction === "out"
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [{ opacity: 0 }, { opacity: 1 }];

    const animation = this.root.animate(keyframes, {
      duration: direction === "out" ? 160 : 220,
      easing: "ease-in-out",
      fill: "forwards",
    });

    await animation.finished;
    animation.cancel();
  }

  private isHome(doc: Document): boolean {
    return doc.type === "home" || doc.file === this.config.indexFile;
  }

  private mount(doc: Document, body: string): void {
    const home = this.isHome(doc);

    this.clearModes();
    this.root.classList.add(home ? "home-mode" : "page-mode");

    const content = home
      ? `<section class="m-card-list home-content" aria-label="Content">${body}</section>`
      : `<div class="page-content surface-card">${body}</div>`;

    this.root.innerHTML = `
    <article class="page">
      ${home ? "" : this.backButton()}
      <header class="header">
        ${this.badgeRow(doc)}
        ${this.heading(doc)}
        ${this.subtitle(doc)}
      </header>
      ${content}
    </article>`;
  }

  private bindManoCards(): void {
    this.root
      .querySelectorAll<HTMLElement>("[data-mano-file]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const file = button.dataset.manoFile;
          if (file) this.open(file);
        });
      });
  }

  private bindThemeSwitch(): void {
    const toggle = document.getElementById("theme-switch");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      this.isDarkMode = !this.isDarkMode;
      document.documentElement.classList.toggle("dark", this.isDarkMode);
      localStorage.setItem("theme", this.isDarkMode ? "dark" : "light");
      toggle.setAttribute("aria-checked", String(!this.isDarkMode));
    });
  }

  private bindBack(doc: Document): void {
    document.getElementById("nav-back-btn")?.addEventListener("click", () => {
      this.open(this.site.parentOf(doc.file));
    });
  }

  private clearModes(...keep: string[]): void {
    const modes = ["home-mode", "page-mode"];
    for (const mode of modes) {
      if (!keep.includes(mode)) this.root.classList.remove(mode);
    }
  }

  private badge(doc: Document): string {
    return doc.meta.badge
      ? `<p class="header-badge">${this.escape(doc.meta.badge)}</p>`
      : "";
  }

  private badgeRow(doc: Document): string {
    const badge = this.badge(doc);
    const showSwitch = doc.meta.showSwitchButtonTheme === "true";

    if (!badge && !showSwitch) return "";
    if (!showSwitch) return badge;

    return `
    <div class="header-row">
      ${badge}
      ${this.themeSwitch()}
    </div>`;
  }

  private themeSwitch(): string {
    const isLight = !this.isDarkMode;
    return `
    <div class="theme-switch">
      <button
        type="button"
        id="theme-switch"
        class="theme-switch-track"
        role="switch"
        aria-checked="${isLight}"
        aria-label="Toggle theme"
      >
        <svg class="theme-switch-icon theme-switch-icon--sun" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" fill="currentColor"/>
        </svg>
        <span class="theme-switch-thumb"></span>
        <svg class="theme-switch-icon theme-switch-icon--moon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" fill="currentColor"/>
        </svg>
      </button>
    </div>`;
  }

  private heading(doc: Document): string {
    const title = this.escape(doc.meta.title ?? doc.title);
    const thumbnail = doc.meta.thumbnail?.trim();

    if (!thumbnail) {
      return `<h1>${title}</h1>`;
    }

    return `
    <h1>
      <span class="header-hero">
        <img src="${this.escape(thumbnail)}" alt="logo" width="128">
        ${title}
      </span>
    </h1>`;
  }

  private subtitle(doc: Document): string {
    if (!doc.meta.description) return "";
    const centered = Boolean(doc.meta.thumbnail?.trim());
    return `<p class="subtitle"${centered ? ' align="center"' : ""}>${this.escape(doc.meta.description)}</p>`;
  }

  private backButton(): string {
    return `
    <button type="button" class="nav-back" id="nav-back-btn" aria-label="Back">
      <svg class="nav-back-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
      </svg>
    </button>`;
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}
