import catalog from "./catalog.json" with { type: "json" };

export type AppearanceId = keyof typeof catalog;
export const APPEARANCE_IDS = Object.keys(catalog) as [
  AppearanceId,
  ...AppearanceId[],
];
export const APPEARANCES = catalog;
export const isAppearanceId = (value: unknown): value is AppearanceId =>
  typeof value === "string" && Object.hasOwn(catalog, value);

// These are authored identities for fictional game characters, not guesses
// made from Vietnamese or English names at runtime.
export const ARCHETYPE_APPEARANCE: Readonly<Record<string, AppearanceId>> = {
  "dev-junior": "male-trousers",
  "dev-careful": "female-trousers-short",
  "dev-senior": "male-trousers",
  "dev-builder": "male-shorts",
  "dev-pragmatic": "female-trousers-long",
  "dev-intern": "male-trousers",
  "qa-junior": "female-skirt-long-short",
  "qa-analyst": "male-shorts",
  "qa-lead": "female-trousers-short",
  "qa-explorer": "male-trousers",
  "qa-client": "female-skirt-long-long",
  "ux-junior": "female-skirt-long-short",
  "ux-senior": "male-shorts",
  "ux-product": "male-trousers",
  "ux-system": "female-trousers-long",
  "growth-junior": "female-skirt-short-short",
  "growth-sales": "male-trousers",
  "growth-senior": "male-shorts",
  "growth-research": "female-skirt-short-long",
  "growth-calm": "male-shorts",
  "ops-junior": "female-skirt-short-short",
  "ops-organizer": "male-trousers",
  "ops-lead": "female-skirt-long-long",
  "ops-resolver": "male-trousers",
};

export function appearanceForArchetype(id: string): AppearanceId {
  const appearance = ARCHETYPE_APPEARANCE[id];
  if (!appearance)
    throw new Error(`Missing authored character appearance: ${id}`);
  return appearance;
}
