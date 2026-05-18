import { describe, it, expect } from "vitest";
import { renderFrontmatter, tokenizeFrontmatter } from "..";

describe("Frontmatter (---...---)", () => {
  it("识别基础 frontmatter", () => {
    const src = "---\ntitle: Hello\n---\n\nbody";
    const tok = tokenizeFrontmatter(src);
    expect(tok?.text).toBe("title: Hello");
  });

  it("识别多键 frontmatter", () => {
    const src = "---\ntitle: Hello\ntags: [a, b]\ndate: 2026-05-18\n---\n\nbody";
    const tok = tokenizeFrontmatter(src);
    expect(tok?.text).toContain("title: Hello");
    expect(tok?.text).toContain("tags: [a, b]");
  });

  it("不识别非开头位置的 ---", () => {
    const src = "intro\n---\ntitle: Hello\n---\n";
    expect(tokenizeFrontmatter(src)).toBeUndefined();
  });

  it("render 三明治结构", () => {
    expect(renderFrontmatter({ data: "title: Hello" })).toBe(
      "---\ntitle: Hello\n---"
    );
  });

  it("round-trip", () => {
    const src = "---\ntitle: Hello\ndate: 2026-05-18\n---\n";
    const tok = tokenizeFrontmatter(src);
    const rendered = tok && renderFrontmatter({ data: tok.text });
    expect(rendered).toBe("---\ntitle: Hello\ndate: 2026-05-18\n---");
  });
});
