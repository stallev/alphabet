import { describe, expect, it } from "vitest";
import { findIsolationViolations, importSpecifiers, isTestFile } from "./check-build-isolation.mjs";

describe("isTestFile", () => {
  it("recognizes test and spec files and __tests__ folders", () => {
    expect(isTestFile("games/registry.test.ts")).toBe(true);
    expect(isTestFile("shared/x.spec.tsx")).toBe(true);
    expect(isTestFile("shared/__tests__/x.ts")).toBe(true);
    expect(isTestFile("shared/ui/Button.tsx")).toBe(false);
  });
});

describe("importSpecifiers", () => {
  it("reads static, side-effect, re-export, dynamic and require forms", () => {
    const code = [
      "import a from 'alpha';",
      "import { b } from \"@/beta\";",
      "import 'gamma';",
      "export * from './delta';",
      "const e = await import('epsilon');",
      "const z = require('zeta');",
    ].join("\n");
    expect(importSpecifiers(code)).toEqual(["alpha", "@/beta", "gamma", "./delta", "epsilon", "zeta"]);
  });
});

describe("findIsolationViolations", () => {
  it("flags test-only packages in production files", () => {
    const result = findIsolationViolations([
      { path: "shared/ui/Button.tsx", content: "import { describe } from 'vitest';" },
      { path: "app/x.ts", content: "import { render } from '@testing-library/react';" },
    ]);
    expect(result.map((v) => [v.path, v.specifier])).toEqual([
      ["shared/ui/Button.tsx", "vitest"],
      ["app/x.ts", "@testing-library/react"],
    ]);
  });

  it("flags production files importing a test file", () => {
    const result = findIsolationViolations([
      { path: "games/a/logic/x.ts", content: "import { fixture } from './x.test';" },
      { path: "games/a/logic/y.ts", content: "import { fixture } from '@/games/a/logic/y.spec';" },
    ]);
    expect(result).toHaveLength(2);
  });

  it("ignores test files themselves and non-source files", () => {
    expect(
      findIsolationViolations([
        { path: "games/registry.test.ts", content: "import { it } from 'vitest';" },
        { path: "docs/readme.md", content: "import x from 'vitest'" },
      ]),
    ).toEqual([]);
  });

  it("accepts clean production code", () => {
    expect(findIsolationViolations([{ path: "shared/lib/cn.ts", content: "import { clsx } from 'clsx';" }])).toEqual([]);
  });
});
