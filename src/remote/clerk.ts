// Helpers for deriving Clerk URLs and metadata from a publishable key.
// Side-effect-free: safe to import from both the worker entry and tests.

/**
 * Derive the Clerk Frontend API URL from a publishable key.
 *
 * A Clerk publishable key looks like `pk_test_<base64>` or `pk_live_<base64>`.
 * The base64 payload decodes to the Frontend API host with a trailing `$`,
 * e.g. `pk_test_...` -> `clerk.example.com$` -> `https://clerk.example.com`.
 */
export function frontendApiUrlFromPublishableKey(publishableKey: string): string {
  const withoutPrefix = publishableKey
    .replace(/^pk_test_/, "")
    .replace(/^pk_live_/, "");

  let decoded: string;
  try {
    decoded = atob(withoutPrefix);
  } catch {
    throw new Error("CLERK_PUBLISHABLE_KEY is not a valid publishable key");
  }

  const host = decoded.replace(/\$$/, "");
  if (!host) {
    throw new Error("CLERK_PUBLISHABLE_KEY did not decode to a host");
  }

  return `https://${host}`;
}
