import { defineGame } from "@/shared/game-kit/manifest";

import { ALPHABET_MANIFEST } from "./manifest-data";

export { ALPHABET_MANIFEST } from "./manifest-data";

export default defineGame({
  manifest: ALPHABET_MANIFEST,
  loadPage: () => import("./page"),
});
