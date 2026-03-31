import { useMemo } from "react";
import { useEditorStore } from "~/stores/editor-store";
import { useT } from "~/lib/i18n";

function countStats(text: string) {
  const lines = text.split("\n").length;
  const characters = text.length;

  // Word count: Chinese/Japanese/Korean characters count as 1 word each,
  // consecutive latin characters count as 1 word
  const cjk = text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g);
  const latin = text.match(/[a-zA-Z0-9]+/g);
  const words = (cjk?.length ?? 0) + (latin?.length ?? 0);

  return { words, lines, characters };
}

export function StatusBar() {
  const t = useT();
  const filePath = useEditorStore((s) => s.filePath);
  const content = useEditorStore((s) => s.content);

  const stats = useMemo(() => countStats(content), [content]);

  return (
    <div className="flex items-center justify-between border-t bg-muted/50 px-3 text-xs text-muted-foreground select-none shrink-0" style={{ height: 24 }}>
      {filePath && (
        <>
          <div className="truncate mr-4" style={{ maxWidth: "60%" }}>
            {filePath}
          </div>
          <div className="flex gap-3 whitespace-nowrap">
            <span>{t("words")} {stats.words.toLocaleString()}</span>
            <span>{t("lines")} {stats.lines.toLocaleString()}</span>
            <span>{t("characters")} {stats.characters.toLocaleString()}</span>
          </div>
        </>
      )}
    </div>
  );
}
