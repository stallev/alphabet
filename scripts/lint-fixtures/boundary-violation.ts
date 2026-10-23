/**
 * ESLint boundary fixture — linted only from scripts/check-boundaries.test.mjs
 * with virtual file paths. Do not import from production code.
 */

export const SHARED_IMPORTS_GAMES = "import '@/games/alphabet/page';";
export const SHARED_IMPORTS_SERVER = "import '@/server/db/client';";
export const GAME_A_IMPORTS_GAME_B = "import '@/games/b/page';";
export const GAME_A_IMPORTS_SERVER = "import '@/server/auth/auth';";
export const SERVER_IMPORTS_GAMES = "import '@/games/alphabet/manifest';";
