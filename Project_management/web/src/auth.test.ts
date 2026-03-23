/** @jest-environment node */

import { resolveAuthSecret } from "@/lib/auth-secret";

describe("resolveAuthSecret", () => {
  it("returns test fallback when NODE_ENV=test and AUTH_SECRET is absent", () => {
    expect(resolveAuthSecret({ NODE_ENV: "test" })).toBe("test-auth-secret");
  });

  it("returns build placeholder when NEXT_PHASE is production build and AUTH_SECRET is absent", () => {
    expect(resolveAuthSecret({ NEXT_PHASE: "phase-production-build" })).toBe(
      "build-time-placeholder-auth-secret-0123456789",
    );
  });

  it("throws when AUTH_SECRET is missing in non-test environments", () => {
    expect(() => resolveAuthSecret({ NODE_ENV: "development" })).toThrow("Missing AUTH_SECRET");
  });

  it("throws when AUTH_SECRET is too short", () => {
    expect(() =>
      resolveAuthSecret({ NODE_ENV: "development", AUTH_SECRET: "short-secret" }),
    ).toThrow("too short");
  });

  it("accepts a strong secret", () => {
    expect(
      resolveAuthSecret({
        NODE_ENV: "development",
        AUTH_SECRET: "0123456789abcdef0123456789abcdef",
      }),
    ).toBe("0123456789abcdef0123456789abcdef");
  });
});
