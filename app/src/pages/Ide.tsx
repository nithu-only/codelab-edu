import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import ConsoleView, { StatusPill } from "../components/ConsoleView";
import { TEMPLATES } from "../data/templates";
import { useRunner } from "../lib/useRunner";
import {
  getDraft,
  getProgram,
  getLastLang,
  saveProgram,
  setDraft,
  setLastLang,
} from "../lib/storage";
import { LANGUAGE_LABELS, type LanguageId } from "../types";

const LANGUAGES = Object.keys(LANGUAGE_LABELS) as LanguageId[];

export default function Ide() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [language, setLanguage] = useState<LanguageId>("python");
  const [code, setCode] = useState(TEMPLATES.python.code);
  const [stdin, setStdin] = useState(TEMPLATES.python.stdin);
  const [programName, setProgramName] = useState("");
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const { state, run } = useRunner();
  const loadedRef = useRef(false);
  const languageRef = useRef(language);
  languageRef.current = language;

  // Persist the draft of the language we are leaving before swapping.
  const persistDraft = useCallback((lang: LanguageId, c: string, s: string) => {
    setDraft(lang, c, s);
  }, []);

  // Initial load: ?open=<saved id> wins, then ?lang=, then the last language used.
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const openId = searchParams.get("open");
    const langParam = searchParams.get("lang") as LanguageId | null;
    if (openId) {
      const saved = getProgram(openId);
      if (saved) {
        setLanguage(saved.language);
        setCode(saved.code);
        setStdin(saved.stdin);
        setProgramName(saved.name);
        setLastLang(saved.language);
        return;
      }
    }
    const lang: LanguageId =
      langParam && LANGUAGES.includes(langParam) ? langParam : getLastLang() ?? "python";
    setLanguage(lang);
    const draft = getDraft(lang);
    setCode(draft?.code ?? TEMPLATES[lang].code);
    setStdin(draft?.stdin ?? TEMPLATES[lang].stdin);
    setLastLang(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchLanguage = (next: LanguageId) => {
    if (next === language) return;
    persistDraft(language, code, stdin);
    setLanguage(next);
    const draft = getDraft(next);
    setCode(draft?.code ?? TEMPLATES[next].code);
    setStdin(draft?.stdin ?? TEMPLATES[next].stdin);
    setLastLang(next);
    setSavedNote(null);
    const params = new URLSearchParams(searchParams);
    params.delete("open");
    params.set("lang", next);
    setSearchParams(params, { replace: true });
  };

  const onCodeChange = (value: string) => {
    setCode(value);
    setDraft(languageRef.current, value, stdin);
    setSavedNote(null);
  };

  const onStdinChange = (value: string) => {
    setStdin(value);
    setDraft(languageRef.current, code, value);
    setSavedNote(null);
  };

  const doRun = useCallback(() => {
    void run(languageRef.current, code, stdin);
  }, [run, code, stdin]);

  // Ctrl/Cmd + Enter runs the program from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        doRun();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doRun]);

  const clearAll = () => {
    setCode(TEMPLATES[language].code);
    setStdin(TEMPLATES[language].stdin);
    setSavedNote(null);
  };

  const doSave = () => {
    const name = programName.trim() || `${LANGUAGE_LABELS[language]} program`;
    const saved = saveProgram({ name, language, code, stdin });
    setSavedNote(`Saved as “${saved.name}”`);
    const params = new URLSearchParams(searchParams);
    params.delete("lang");
    params.set("open", saved.id);
    setSearchParams(params, { replace: true });
  };

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setSavedNote("Code copied to clipboard");
    } catch {
      setSavedNote("Could not copy — your browser blocked clipboard access");
    }
  };

  const doDownload = () => {
    const exts: Record<LanguageId, string> = {
      c: "c",
      cpp: "cpp",
      java: "java",
      python: "py",
      javascript: "js",
      sql: "sql",
    };
    const name = (programName.trim() || `codelab-${language}`).replace(/[^\w.-]+/g, "-");
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.${exts[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const label = useMemo(() => LANGUAGE_LABELS[language], [language]);

  return (
    <main className="page">
      <div className="page-head">
        <h1>Online IDE</h1>
        <p>
          Write, run and save programs. JavaScript and SQL run locally in your browser; C, C++, Java
          and Python run through your configured execution provider. Press <span className="kbd">Ctrl</span>+<span className="kbd">Enter</span> to run.
        </p>
      </div>

      {state.status === "NOT_CONFIGURED" && (
        <div className="banner">
          <strong>{label} execution is not configured yet.</strong> JavaScript and SQL always work
          offline in the browser. To run {label}, add a Judge0-compatible provider — see{" "}
          <code>app/README.md → Code execution</code>.
        </div>
      )}

      <div className="ide-toolbar">
        <label className="field-label" htmlFor="lang-select" style={{ margin: 0 }}>
          Language
        </label>
        <select
          id="lang-select"
          value={language}
          onChange={(e) => switchLanguage(e.target.value as LanguageId)}
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {LANGUAGE_LABELS[l]}
              {l === "javascript" || l === "sql" ? " (runs in browser)" : ""}
            </option>
          ))}
        </select>

        <button type="button" className="btn btn-primary" onClick={doRun} disabled={state.running}>
          {state.running ? "Running…" : "▶ Run"}
        </button>

        <input
          type="text"
          placeholder="Program name"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          style={{ width: 190 }}
          aria-label="Program name"
        />
        <button type="button" className="btn" onClick={doSave}>
          Save
        </button>
        <button type="button" className="btn btn-ghost" onClick={doCopy}>
          Copy
        </button>
        <button type="button" className="btn btn-ghost" onClick={doDownload}>
          Download
        </button>
        <button type="button" className="btn btn-ghost" onClick={clearAll}>
          Reset to template
        </button>
        <div className="nav-spacer" />
        {savedNote && <span className="small muted">{savedNote}</span>}
      </div>

      <div className="ide-layout">
        <div>
          <CodeEditor language={language} value={code} onChange={onCodeChange} />
          <div style={{ marginTop: 14 }}>
            <label className="field-label" htmlFor="stdin-box">
              Standard input (stdin)
            </label>
            <textarea
              id="stdin-box"
              className="stdin-input"
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="Input your program will read, if any…"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="console-panel">
          <div className="console-head">
            <span>Output</span>
            <div className="row">
              <StatusPill status={state.status} />
              <span className="small">
                {language === "javascript" || language === "sql"
                  ? "in-browser"
                  : "remote provider"}
              </span>
            </div>
          </div>
          <ConsoleView
            status={state.status}
            running={state.running}
            stdout={state.stdout}
            stderr={state.stderr}
            timeMs={state.timeMs}
          />
        </div>
      </div>
    </main>
  );
}
