import { escapeHtml, type ComponentRenderer, type ManodxSite } from "../index";

const ManoCallout: ComponentRenderer = (props, children) => {
  const label = (props.label ?? "note").toLowerCase();
  const title = props.title ?? label.toUpperCase();
  return `
  <div class="callout callout--${escapeHtml(label)}">
    <span class="callout-label">${escapeHtml(title)}</span>
    <div class="callout-body">${children}</div>
  </div>`;
};

const ManoBadge: ComponentRenderer = (props) =>
  `<span class="badge">${escapeHtml(props.label ?? "")}</span>`;

const ManoWarning: ComponentRenderer = (_props, children) =>
  `<div class="warning-strip">${children}</div>`;

export function createManoCard(
  site: ManodxSite,
  fromFile: string,
): ComponentRenderer {
  return (props) => {
    const ref = props.file ?? "";
    const target = site.router.resolve(fromFile, ref);
    const doc = site.get(target);

    const title = doc?.meta.title ?? doc?.title ?? target;
    const description = doc?.meta.description ?? target;
    const tag = doc?.meta.tag ?? "";

    const tagHtml = tag
      ? `<span class="m-card-tag">${escapeHtml(tag)}</span>`
      : "";

    return `
    <button type="button" class="m-card m-card--page" data-mano-file="${escapeHtml(target)}">
      ${tagHtml}
      <span class="m-card-title">${escapeHtml(title)}</span>
      <span class="m-card-meta">${escapeHtml(description)}</span>
    </button>`;
  };
}

export const baseComponents: Record<string, ComponentRenderer> = {
  ManoCallout,
  ManoBadge,
  ManoWarning,
};
