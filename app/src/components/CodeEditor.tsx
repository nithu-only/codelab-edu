import { Suspense, lazy } from "react";
import type { LanguageId } from "../types";

/**
 * CodeMirror is loaded lazily — the editor bundle (and each language mode)
 * is only fetched when the student first sees an editor.
 */
const CodeEditorInner = lazy(() => import("./CodeEditorInner"));

export interface CodeEditorProps {
  language: LanguageId;
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

export default function CodeEditor(props: CodeEditorProps) {
  return (
    <Suspense
      fallback={
        <div className="editor-loading" style={{ minHeight: props.height ?? "420px" }}>
          Loading editor…
        </div>
      }
    >
      <CodeEditorInner {...props} />
    </Suspense>
  );
}
