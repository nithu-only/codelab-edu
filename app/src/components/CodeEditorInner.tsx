import { useEffect, useRef } from "react";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import type { LanguageId } from "../types";
import type { CodeEditorProps } from "./CodeEditor";

/** Language modes are imported on demand — one small chunk per language. */
async function loadLanguage(lang: LanguageId) {
  switch (lang) {
    case "c":
    case "cpp":
      return (await import("@codemirror/lang-cpp")).cpp();
    case "java":
      return (await import("@codemirror/lang-java")).java();
    case "python":
      return (await import("@codemirror/lang-python")).python();
    case "javascript":
      return (await import("@codemirror/lang-javascript")).javascript();
    case "sql":
      return (await import("@codemirror/lang-sql")).sql();
    default:
      return [];
  }
}

/**
 * Syntax colors use CSS variables (defined in styles.css per theme), so the
 * editor follows the light/dark toggle without being rebuilt.
 */
const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--syn-kw)" },
  { tag: [tags.string, tags.special(tags.string)], color: "var(--syn-str)" },
  { tag: [tags.number, tags.bool, tags.null], color: "var(--syn-num)" },
  { tag: tags.comment, color: "var(--syn-cm)", fontStyle: "italic" },
  { tag: [tags.function(tags.variableName), tags.definition(tags.variableName)], color: "var(--syn-fn)" },
  { tag: tags.variableName, color: "var(--syn-var)" },
  { tag: tags.operator, color: "var(--syn-op)" },
  { tag: tags.typeName, color: "var(--syn-num)" },
  { tag: tags.className, color: "var(--syn-fn)" },
]);

const editorTheme = EditorView.theme({
  "&": { backgroundColor: "var(--panel)", color: "var(--text)", minHeight: "420px" },
  ".cm-content": {
    fontFamily: "var(--font-mono)",
    fontSize: "14px",
    padding: "12px 0",
    caretColor: "var(--accent)",
  },
  ".cm-scroller": { fontFamily: "var(--font-mono)", overflow: "auto" },
  ".cm-gutters": {
    backgroundColor: "var(--panel)",
    color: "var(--text-faint)",
    border: "none",
    borderRight: "1px solid var(--border)",
  },
  ".cm-activeLineGutter": { backgroundColor: "var(--panel-2)", color: "var(--text-muted)" },
  ".cm-activeLine": { backgroundColor: "rgba(16, 185, 129, 0.06)" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "var(--accent)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(16, 185, 129, 0.25)",
  },
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
    backgroundColor: "rgba(16, 185, 129, 0.18)",
    outline: "1px solid var(--accent)",
  },
  ".cm-panels": { backgroundColor: "var(--panel-2)", color: "var(--text)" },
  ".cm-panels.cm-panels-top": { borderBottom: "1px solid var(--border)" },
  ".cm-panels.cm-panels-bottom": { borderTop: "1px solid var(--border)" },
  ".cm-tooltip": {
    backgroundColor: "var(--panel-2)",
    border: "1px solid var(--border-strong)",
    color: "var(--text)",
  },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
    backgroundColor: "var(--accent-soft)",
    color: "var(--text)",
  },
});

export default function CodeEditorInner({ language, value, onChange, height }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const langCompartment = useRef(new Compartment()).current;
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          editorTheme,
          syntaxHighlighting(highlightStyle),
          langCompartment.of([]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap the language mode when the selection changes (lazy, one chunk each).
  useEffect(() => {
    let cancelled = false;
    loadLanguage(language).then((ext) => {
      if (!cancelled && viewRef.current) {
        viewRef.current.dispatch({ effects: langCompartment.reconfigure(ext) });
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Keep the editor in sync when the value is replaced externally
  // (switching language, loading a saved program or a problem template).
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return (
    <div
      ref={hostRef}
      className="editor-shell"
      style={height ? { minHeight: height } : undefined}
      data-language={language}
    />
  );
}
