/** Embedded assets are optional and only used by the single-file local build. */
type AssetGlobal = typeof globalThis & {
  __SOFTWARE_CEO_ASSETS__?: Record<string, string>;
};
export const assetURL = (file: string) =>
  (globalThis as AssetGlobal).__SOFTWARE_CEO_ASSETS__?.[file] ??
  `${import.meta.env.BASE_URL}assets/${file}`;
