import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type { ExecutionResponse, Language, FileEntry } from "./types";
import { LANGUAGE_TEMPLATES, MONACO_LANGUAGE_MAP, LANGUAGE_LABELS } from "./templates";
import { executeCode, cancelExecution, getApiBase } from "./api";
import { listFiles, createFile, readFile, saveFile, deleteFile, renameFile } from "./api/files";
import FileExplorer from "./components/FileExplorer";

const LANGUAGES: Language[] = ["python", "java", "c", "cpp"];

function extensionToLanguage(path: string): Language | null {
  if (path.endsWith(".py")) return "python";
  if (path.endsWith(".java")) return "java";
  if (path.endsWith(".c")) return "c";
  if (path.endsWith(".cpp") || path.endsWith(".cc")) return "cpp";
  return null;
}

function inferTemplate(path: string, fallback: Language): string {
  const lang = extensionToLanguage(path);
  if (lang) return LANGUAGE_TEMPLATES[lang];
  return LANGUAGE_TEMPLATES[fallback];
}

export default function App() {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState<string>(LANGUAGE_TEMPLATES.python);
  const [stdin, setStdin] = useState<string>("");
  const [result, setResult] = useState<ExecutionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const executionIdRef = useRef<string | null>(null);

  // File workspace state
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const lastSavedRef = useRef<string>(LANGUAGE_TEMPLATES.python);

  const refreshFiles = useCallback(async () => {
    setFilesLoading(true);
    setFilesError(null);
    try {
      const list = await listFiles();
      setFiles(list);
    } catch (e) {
      setFilesError((e as Error).message);
    } finally {
      setFilesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    // only reset code if no active file and not dirty, to avoid clobbering file content
    if (!activeFile && !isDirty) {
      const tpl = LANGUAGE_TEMPLATES[lang];
      setCode(tpl);
      lastSavedRef.current = tpl;
      setIsDirty(false);
    }
  };

  const handleCodeChange = (v: string | undefined) => {
    const val = v ?? "";
    setCode(val);
    // dirty if differs from last saved
    setIsDirty(val !== lastSavedRef.current);
  };

  const confirmDirtySwitch = useCallback(async (): Promise<boolean> => {
    if (!isDirty) return true;
    const shouldSave = window.confirm(
      `You have unsaved changes${activeFile ? ` in ${activeFile}` : ""}. Save before switching? OK = Save, Cancel = Discard`
    );
    if (shouldSave) {
      if (activeFile) {
        try {
          await saveFile(activeFile, code);
          lastSavedRef.current = code;
          setIsDirty(false);
          await refreshFiles();
        } catch (e) {
          const msg = (e as Error).message;
          const proceed = window.confirm(`Save failed: ${msg}. Discard changes and continue?`);
          if (!proceed) return false;
          setIsDirty(false);
        }
      } else {
        // no active file: prompt for filename
        const fname = window.prompt("Save as (e.g. hello.py):", "hello.py");
        if (fname && fname.trim()) {
          try {
            await createFile(fname.trim(), code);
            setActiveFile(fname.trim());
            lastSavedRef.current = code;
            setIsDirty(false);
            await refreshFiles();
          } catch (e) {
            alert(`Save failed: ${(e as Error).message}`);
            return false;
          }
        } else {
          // user cancelled save-as
          return false;
        }
      }
    } else {
      // discard
      setIsDirty(false);
    }
    return true;
  }, [isDirty, activeFile, code, refreshFiles]);

  const handleOpen = useCallback(
    async (path: string) => {
      if (path === activeFile) return;
      const canSwitch = await confirmDirtySwitch();
      if (!canSwitch) return;
      try {
        setFilesError(null);
        const fc = await readFile(path);
        setActiveFile(fc.path);
        setCode(fc.content);
        lastSavedRef.current = fc.content;
        setIsDirty(false);
        const extLang = extensionToLanguage(fc.path);
        if (extLang) setLanguage(extLang);
      } catch (e) {
        setFilesError((e as Error).message);
        alert(`Open failed: ${(e as Error).message}`);
      }
    },
    [activeFile, confirmDirtySwitch]
  );

  const handleNewFile = useCallback(
    async (maybePath?: string) => {
      let fname: string | null = maybePath ?? null;
      if (!fname) {
        fname = window.prompt("New file name (e.g. hello.py):", "hello.py");
      }
      if (!fname) return;
      fname = fname.trim();
      if (!fname) return;
      // if dirty, confirm before creating (but keep current code as content if user wants?)
      // For new file we create with template inferred from name
      const canProceed = await confirmDirtySwitch();
      if (!canProceed) return;
      const template = inferTemplate(fname, language);
      try {
        await createFile(fname, template);
        await refreshFiles();
        // open it
        const fc = await readFile(fname);
        setActiveFile(fc.path);
        setCode(fc.content);
        lastSavedRef.current = fc.content;
        setIsDirty(false);
        const extLang = extensionToLanguage(fc.path);
        if (extLang) setLanguage(extLang);
      } catch (e) {
        alert(`Create failed: ${(e as Error).message}`);
        setFilesError((e as Error).message);
      }
    },
    [language, refreshFiles, confirmDirtySwitch]
  );

  const handleSave = useCallback(async () => {
    if (!activeFile) {
      const fname = window.prompt("Save as (e.g. hello.py):", "hello.py");
      if (!fname || !fname.trim()) return;
      const path = fname.trim();
      setSaveLoading(true);
      try {
        await createFile(path, code);
        setActiveFile(path);
        lastSavedRef.current = code;
        setIsDirty(false);
        await refreshFiles();
      } catch (e) {
        // if 409 conflict, try save via PUT
        const msg = (e as Error).message;
        if (msg.includes("409") || msg.toLowerCase().includes("exists")) {
          try {
            await saveFile(path, code);
            setActiveFile(path);
            lastSavedRef.current = code;
            setIsDirty(false);
            await refreshFiles();
          } catch (e2) {
            alert(`Save failed: ${(e2 as Error).message}`);
          }
        } else {
          alert(`Save failed: ${msg}`);
        }
      } finally {
        setSaveLoading(false);
      }
      return;
    }
    setSaveLoading(true);
    try {
      await saveFile(activeFile, code);
      lastSavedRef.current = code;
      setIsDirty(false);
      await refreshFiles();
    } catch (e) {
      alert(`Save failed: ${(e as Error).message}`);
    } finally {
      setSaveLoading(false);
    }
  }, [activeFile, code, refreshFiles]);

  const handleRename = useCallback(
    async (from: string) => {
      const to = window.prompt(`Rename "${from}" to:`, from);
      if (!to || to.trim() === from) return;
      const dest = to.trim();
      try {
        await renameFile(from, dest);
        if (activeFile === from) setActiveFile(dest);
        await refreshFiles();
      } catch (e) {
        alert(`Rename failed: ${(e as Error).message}`);
      }
    },
    [activeFile, refreshFiles]
  );

  const handleDelete = useCallback(
    async (path: string) => {
      if (!window.confirm(`Delete "${path}"? This cannot be undone.`)) return;
      try {
        await deleteFile(path);
        if (activeFile === path) {
          setActiveFile(null);
          // keep code as is but mark dirty so user can save as new file, or reset to template?
          // keep current code, but lastSaved reset
          lastSavedRef.current = code;
          // isDirty remains as was; if deleted file was saved, now state is dirty-ish?
          // Decide: clear isDirty because file no longer exists but code remains
          // Keep isDirty true so user knows to save
        }
        await refreshFiles();
      } catch (e) {
        alert(`Delete failed: ${(e as Error).message}`);
      }
    },
    [activeFile, code, refreshFiles]
  );

  const execute = useCallback(async () => {
    if (!code.trim()) {
      setError("Source code must not be blank.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    const controller = new AbortController();
    abortRef.current = controller;
    const execId = crypto.randomUUID();
    executionIdRef.current = execId;
    try {
      const res = await executeCode(language, code, stdin, controller.signal, execId);
      setResult(res);
      if (res.status === "CANCELLED") {
        setError("Execution cancelled.");
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        if (executionIdRef.current) {
          try {
            const cancelRes = await fetch(`${getApiBase().replace(/\/$/, "") === "/api" || getApiBase().replace(/\/$/, "").endsWith("/api") ? `${getApiBase().replace(/\/$/, "")}/execute/${executionIdRef.current}` : `${getApiBase().replace(/\/$/, "")}/api/execute/${executionIdRef.current}`}`);
            if (cancelRes.ok) {
              const cr = (await cancelRes.json()) as ExecutionResponse;
              setResult(cr);
            }
          } catch {}
        }
        setError("Execution aborted.");
      } else {
        setError((e as Error).message);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
      executionIdRef.current = null;
    }
  }, [language, code, stdin]);

  const handleRun = useCallback(async () => {
    await execute();
  }, [execute]);

  const handleSaveAndRun = useCallback(async () => {
    if (!code.trim()) {
      setError("Source code must not be blank.");
      return;
    }
    if (isDirty && activeFile) {
      setSaveLoading(true);
      try {
        await saveFile(activeFile, code);
        lastSavedRef.current = code;
        setIsDirty(false);
        await refreshFiles();
      } catch (e) {
        setError(`Save before run failed: ${(e as Error).message}`);
        setSaveLoading(false);
        return;
      }
      setSaveLoading(false);
    } else if (isDirty && !activeFile) {
      // No file open but dirty: prompt save-as before Save+Run to persist
      const fname = window.prompt("Save as before run (e.g. hello.py):", "hello.py");
      if (fname && fname.trim()) {
        const p = fname.trim();
        setSaveLoading(true);
        try {
          await createFile(p, code);
          setActiveFile(p);
          lastSavedRef.current = code;
          setIsDirty(false);
          await refreshFiles();
        } catch (e) {
          const msg = (e as Error).message;
          if (msg.includes("409") || msg.toLowerCase().includes("exists")) {
            try {
              await saveFile(p, code);
              setActiveFile(p);
              lastSavedRef.current = code;
              setIsDirty(false);
              await refreshFiles();
            } catch (e2) {
              setError(`Save failed: ${(e2 as Error).message}`);
              setSaveLoading(false);
              return;
            }
          } else {
            setError(`Save failed: ${msg}`);
            setSaveLoading(false);
            return;
          }
        } finally {
          setSaveLoading(false);
        }
      }
    }
    await execute();
  }, [code, isDirty, activeFile, refreshFiles, execute]);

  const handleStop = useCallback(() => {
    const eid = executionIdRef.current;
    if (eid) {
      cancelExecution(eid).catch(() => {});
    }
    abortRef.current?.abort();
  }, []);

  const statusClass = (s: string) => `badge badge--${s}`;

  const terminalBorderClass = result
    ? result.status === "SUCCESS"
      ? "output-success"
      : result.status === "TIMEOUT"
        ? "output-timeout"
        : result.status === "CANCELLED"
          ? "output-cancelled"
          : result.status === "FAILED" || result.status === "ERROR"
            ? "output-error"
            : ""
    : "";

  return (
    <>
      <header className="header">
        <div className="header__brand">
          <div className="header__brand-icon">{"</>"}</div>
          <span>DCF CodeLab</span>
          <small>Python ▼ Run &middot; Save &middot; Save+Run</small>
        </div>
        <div className="header__actions">
          <select
            className="select"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            aria-label="Language selector"
            data-testid="language-selector"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {LANGUAGE_LABELS[l]}
              </option>
            ))}
          </select>
          <button
            className="btn btn--ghost"
            onClick={handleSave}
            disabled={saveLoading}
            data-testid="save-button"
            title={activeFile ? `Save ${activeFile}` : "Save as new file"}
          >
            {saveLoading ? "Saving..." : `Save${isDirty ? " *" : ""}`}
          </button>
          <button className="btn btn--secondary" onClick={handleRun} disabled={loading} data-testid="run-button" title="Run without saving">
            {loading ? "Running..." : "Run"}
          </button>
          <button className="btn btn--primary" onClick={handleSaveAndRun} disabled={loading || saveLoading} data-testid="save-run-button" title="Save then run">
            {loading && <span className="spinner" aria-hidden />}
            {loading ? "Running..." : "Save+Run"}
          </button>
          <button className="btn btn--danger" onClick={handleStop} disabled={!loading} data-testid="stop-button">
            Stop
          </button>
        </div>
      </header>

      <main className="main">
        <div className="api-hint">
          API: <code>{getApiBase()}/api/execute</code> — contract status, stdout/stderr, exitCode, time
          {activeFile && (
            <span style={{ marginLeft: 12 }}>
              | File: <strong>{activeFile}</strong>
              {isDirty && <span style={{ color: "var(--error)", marginLeft: 6 }}>* modified</span>}
            </span>
          )}
        </div>

        <div className="workspace">
          <FileExplorer
            files={files}
            activeFile={activeFile}
            isDirty={isDirty}
            loading={filesLoading}
            error={filesError}
            onRefresh={refreshFiles}
            onNewFile={handleNewFile as unknown as () => void}
            onOpen={handleOpen}
            onRename={handleRename}
            onDelete={handleDelete}
          />

          <div className="panels">
            {/* Editor panel */}
            <div className="panel">
              <div className="panel__header">
                <span>
                  Editor — {LANGUAGE_LABELS[language]}
                  {activeFile ? ` — ${activeFile}${isDirty ? " *" : ""}` : isDirty ? " * unsaved" : ""}
                </span>
                <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{code.length} chars</span>
              </div>
              <div className="panel__body">
                <div className="editor-wrapper">
                  <Editor
                    height="100%"
                    language={MONACO_LANGUAGE_MAP[language]}
                    value={code}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                      wordWrap: "on",
                      padding: { top: 12, bottom: 12 },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right stack: stdin + output */}
            <div className="right-stack">
              <div className="panel" style={{ minHeight: 160 }}>
                <div className="panel__header">stdin</div>
                <div className="panel__body">
                  <textarea
                    className="stdin-textarea"
                    placeholder="Input to pass to program via stdin (optional)"
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    rows={6}
                    data-testid="stdin-panel"
                  />
                </div>
              </div>

              <div className="panel" style={{ flex: 1, minHeight: 300 }}>
                <div className="panel__header">
                  <span>Output / Terminal</span>
                  {result && <span className={statusClass(result.status)}>{result.status}</span>}
                  {loading && <span className="badge badge--RUNNING">RUNNING</span>}
                  {error && !loading && <span className="badge badge--ERROR">ERROR</span>}
                </div>

                <div className={`terminal ${terminalBorderClass}`}>
                  {loading && <div className="terminal__placeholder">Executing on {language}…</div>}

                  {!loading && error && (
                    <div className="output-section output-section--stderr">
                      <div className="output-section__label">Error</div>
                      <div style={{ color: "#fca5a5" }}>{error}</div>
                    </div>
                  )}

                  {!loading && result && (
                    <>
                      {result.stdout && (
                        <div className="output-section output-section--stdout">
                          <div className="output-section__label">stdout</div>
                          <div>{result.stdout}</div>
                        </div>
                      )}
                      {result.stderr && (
                        <div className="output-section output-section--stderr">
                          <div className="output-section__label">stderr</div>
                          <div>{result.stderr}</div>
                        </div>
                      )}
                      {!result.stdout && !result.stderr && <div className="terminal__placeholder">(no output)</div>}
                    </>
                  )}

                  {!loading && !result && !error && (
                    <div className="terminal__placeholder">Click Run to execute. Output, errors and timing will appear here.</div>
                  )}
                </div>

                {(result || error) && (
                  <div className="meta-row">
                    {result && (
                      <>
                        <span>
                          Exit: <strong>{result.exitCode}</strong>
                        </span>
                        <span>
                          Time: <strong>{result.executionTimeMs} ms</strong>
                        </span>
                        <span>
                          ID: <strong style={{ fontFamily: "monospace", fontSize: 11 }}>{result.executionId.slice(0, 8)}…</strong>
                        </span>
                        <span>
                          Lang: <strong>{result.language}</strong>
                        </span>
                      </>
                    )}
                    {error && !result && <span style={{ color: "var(--error)" }}>{error}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">CodeLab — Frontend on :5173 · Backend on :8080 · Contract: POST /api/execute</footer>
    </>
  );
}
