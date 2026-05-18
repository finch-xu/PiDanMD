import { describe, it, expect } from "vitest";
import {
  renderMathInline,
  renderMathBlock,
  tokenizeMathInline,
  tokenizeMathBlock,
  findMathInlineStart,
} from "..";

describe("行内公式 ($..$)", () => {
  it("识别简单 $E=mc^2$", () => {
    expect(tokenizeMathInline("$E=mc^2$")).toEqual({
      type: "mathInline",
      raw: "$E=mc^2$",
      text: "E=mc^2",
    });
  });

  it("不误识别 $$ 块公式", () => {
    expect(tokenizeMathInline("$$E=mc^2$$")).toBeUndefined();
  });

  it("识别带特殊符号的公式 $\\frac{1}{2}$", () => {
    expect(tokenizeMathInline("$\\frac{1}{2}$ rest")?.text).toBe("\\frac{1}{2}");
  });

  it("findMathInlineStart 跳过 $$ 找下一个 $", () => {
    expect(findMathInlineStart("$$x$$ then $y$")).toBe(11);
  });

  it("renderMathInline 圆括 $", () => {
    expect(renderMathInline({ latex: "E=mc^2" })).toBe("$E=mc^2$");
    expect(renderMathInline({ latex: "" })).toBe("$$");
  });

  it("round-trip: tokenize 后 render 应能拿回等价字符串", () => {
    const tok = tokenizeMathInline("$E=mc^2$");
    expect(tok && renderMathInline({ latex: tok.text })).toBe("$E=mc^2$");
  });
});

describe("块级公式 ($$...$$)", () => {
  it("识别单行 $$E=mc^2$$", () => {
    const tok = tokenizeMathBlock("$$E=mc^2$$");
    expect(tok?.type).toBe("mathBlock");
    expect(tok?.text).toBe("E=mc^2");
  });

  it("识别多行 $$\\nE=mc^2\\n$$", () => {
    const tok = tokenizeMathBlock("$$\nE=mc^2\n$$");
    expect(tok?.text).toBe("E=mc^2");
  });

  it("识别复杂多行公式（保留内部换行）", () => {
    const src = "$$\n\\frac{a}{b}\n+\n\\frac{c}{d}\n$$";
    const tok = tokenizeMathBlock(src);
    expect(tok?.text).toBe("\\frac{a}{b}\n+\n\\frac{c}{d}");
  });

  it("lazy match 不会跨越多个 block math", () => {
    const src = "$$x$$ middle $$y$$";
    const tok = tokenizeMathBlock(src);
    expect(tok?.raw).toBe("$$x$$");
    expect(tok?.text).toBe("x");
  });

  it("renderMathBlock 用三明治结构", () => {
    expect(renderMathBlock({ latex: "E=mc^2" })).toBe("$$\nE=mc^2\n$$");
  });

  it("round-trip: 单行 $$ ", () => {
    const tok = tokenizeMathBlock("$$E=mc^2$$");
    const rendered = tok && renderMathBlock({ latex: tok.text });
    // 单行输入会被规范化为多行（符合 Markdown 习惯）
    expect(rendered).toBe("$$\nE=mc^2\n$$");
  });

  it("round-trip: 多行 $$ 保持稳定", () => {
    const src = "$$\nE=mc^2\n$$";
    const tok = tokenizeMathBlock(src);
    const rendered = tok && renderMathBlock({ latex: tok.text });
    expect(rendered).toBe(src);
  });
});
