import assert from "node:assert/strict";
import { test } from "node:test";

import nextConfig from "../../next.config";

test("takumi core is externalized", () => {
  const externals = (nextConfig as { serverExternalPackages?: string[] })
    .serverExternalPackages;

  assert.ok(externals?.includes("@takumi-rs/core"));
});
