import { authClient } from "./auth-client";

let cachedToken: string | null = null;

/**
 * Lazily fetch the better-auth JWT. This must never run at module scope:
 * a top-level `await authClient.token()` executes during SSR module
 * evaluation and crashes every route that imports the API modules.
 *
 * Returns null when no token is available (e.g. signed-out visitor or
 * unreachable auth server) — callers then send requests unauthenticated,
 * which is correct for public GETs and surfaces a clean 401 for mutations.
 */
export async function getTokenFromClient(): Promise<string | null> {
  if (cachedToken) return cachedToken;

  try {
    const { data } = await authClient.token();
    if (data?.token) {
      cachedToken = data.token;
    }
    return data?.token ?? null;
  } catch {
    // Never break rendering because the auth server is unreachable
    return null;
  }
}
