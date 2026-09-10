import type { ComponentRenderer } from "../index";

export interface ManodxConfig {
  title: string;
  description: string;
  contentDir: string;
  contentMarker: string;
  indexFile: string;
  components: Record<string, ComponentRenderer>;
}

export const defaultConfig: ManodxConfig = {
  title: "manodx",
  description: "Websites rendered by the manodx framework",
  contentDir: "app",
  contentMarker: "/app/",
  indexFile: "main.md",
  components: {},
};
