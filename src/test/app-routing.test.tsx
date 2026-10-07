import { matchRoutes } from "react-router";
import { describe, expect, it } from "vitest";

import { routes } from "@/routes";

// Match routes without rendering: pages touch Supabase, which the test run lacks.
describe("App routing", () => {
  it.each(["/", "/app", "/signin", "/signup"])(
    "matches a page for %s instead of not found",
    (path) => {
      const matches = matchRoutes(routes, path);

      expect(matches?.at(-1)?.route.path).toBe(path);
    },
  );

  it("falls back to not found for unknown paths", () => {
    const matches = matchRoutes(routes, "/does-not-exist");

    expect(matches?.at(-1)?.route.path).toBe("*");
  });
});
