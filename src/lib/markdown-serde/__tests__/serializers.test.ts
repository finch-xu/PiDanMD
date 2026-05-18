import { describe, it, expect } from "vitest";
import {
  renderMermaidBlock,
  renderSubscript,
  renderSuperscript,
} from "..";

describe("Mermaid Block 序列化", () => {
  it("用 ```mermaid 代码块包裹", () => {
    expect(renderMermaidBlock({ code: "graph TD\nA-->B" })).toBe(
      "```mermaid\ngraph TD\nA-->B\n```"
    );
  });

  it("空代码也能正常序列化", () => {
    expect(renderMermaidBlock({ code: "" })).toBe("```mermaid\n\n```");
  });

  it("多行 mermaid 代码保持换行", () => {
    const code = "sequenceDiagram\n  Alice->>Bob: Hi\n  Bob-->>Alice: Hello";
    expect(renderMermaidBlock({ code })).toBe("```mermaid\n" + code + "\n```");
  });
});

describe("上下标 sub/sup 序列化", () => {
  it("sup 用 HTML 标签", () => {
    expect(renderSuperscript("2")).toBe("<sup>2</sup>");
    expect(renderSuperscript("nd")).toBe("<sup>nd</sup>");
  });

  it("sub 用 HTML 标签", () => {
    expect(renderSubscript("2")).toBe("<sub>2</sub>");
  });

  it("化学式经典示例 H₂O / CO₂", () => {
    expect(renderSubscript("2")).toBe("<sub>2</sub>");
    // H<sub>2</sub>O 是 markdown 友好语法
  });
});
