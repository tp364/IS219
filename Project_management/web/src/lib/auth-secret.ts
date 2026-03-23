export function resolveAuthSecret(env: Record<string, string | undefined> = process.env) {
  const secret = env.AUTH_SECRET;
  const isTest = env.NODE_ENV === "test";
  const isBuildPhase = env.NEXT_PHASE === "phase-production-build";

  if (isTest && !secret) {
    return "test-auth-secret";
  }

  if (isBuildPhase && !secret) {
    return "build-time-placeholder-auth-secret-0123456789";
  }

  if (!secret || secret === "dev-only-secret-change-me") {
    throw new Error("Missing AUTH_SECRET. Set a strong AUTH_SECRET in environment variables.");
  }

  if (secret.length < 32) {
    throw new Error("AUTH_SECRET is too short. Use at least 32 characters.");
  }

  return secret;
}
