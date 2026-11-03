import { describe, expect, it } from "vitest";

import {
  countViolationsInContent,
  checkDesignTokens,
} from "./check-design-tokens.mjs";

describe("check-design-tokens", () => {
  it("flags palette utility classes", () => {
    const count = countViolationsInContent(
      '<div className="bg-blue-500 text-white" />',
      "shared/ui/Example.tsx",
    );
    expect(count).toBeGreaterThan(0);
  });

  it("flags hex colors in class strings", () => {
    const count = countViolationsInContent(
      '<span className="text-[#112233]" />',
      "shared/ui/Example.tsx",
    );
    expect(count).toBeGreaterThan(0);
  });

  it("flags arbitrary pixel values in className", () => {
    const count = countViolationsInContent(
      '<div className="w-[13px]" />',
      "shared/ui/Example.tsx",
    );
    expect(count).toBeGreaterThan(0);
  });

  it("honors tokens:allow on the previous line", () => {
    const content = [
      "/* tokens:allow sticky portal header */",
      '<header className="backdrop-blur-md" />',
    ].join("\n");
    expect(countViolationsInContent(content, "app/_components/SiteHeader.tsx")).toBe(0);
  });

  it("detects multiple violations on separate lines", () => {
    const content = [
      '<div className="bg-blue-500" />',
      '<div className="bg-red-500" />',
    ].join("\n");
    const over = countViolationsInContent(content, "games/alphabet/components/Fake.tsx");
    expect(over).toBe(2);
  });

  it("passes on the real repo with baseline ratchet", () => {
    const { errors } = checkDesignTokens(process.cwd());
    expect(errors).toEqual([]);
  });
});
