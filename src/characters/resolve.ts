import { ARCHETYPES } from "../content/catalog";
import {
  APPEARANCE_IDS,
  appearanceForArchetype,
  isAppearanceId,
  type AppearanceId,
} from "./catalog";

const legacyIdentities = new Map<string, AppearanceId>([
  ...ARCHETYPES.map(
    (profile) =>
      [
        profile.name.normalize("NFC"),
        appearanceForArchetype(profile.id),
      ] as const,
  ),
  ["Minh Nguyễn", "male-trousers"],
  ["Linh Trần", "female-trousers-short"],
]);

export interface CharacterIdentity {
  id: string;
  name: string;
  variant?: number;
  appearance?: AppearanceId;
}

/** Read-only legacy projection: no schema defaults, state mutation or RNG. */
export function resolveAppearance(person: CharacterIdentity): AppearanceId {
  if (isAppearanceId(person.appearance)) return person.appearance;
  const registered = legacyIdentities.get(person.name.normalize("NFC"));
  if (registered) return registered;
  // Unknown legacy identities have no gender metadata. Choose a repeatable
  // cosmetic preset from stable fields; never infer gender from their name.
  const hash = [...person.id].reduce(
    (n, c) => (n * 31 + c.charCodeAt(0)) >>> 0,
    0,
  );
  const variant =
    Number.isSafeInteger(person.variant) && (person.variant ?? 0) >= 0
      ? person.variant!
      : 0;
  return APPEARANCE_IDS[(hash + variant) % APPEARANCE_IDS.length];
}
