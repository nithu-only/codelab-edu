import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import { findProblem } from "../data/content";
import { runSamples, type SampleResult } from "../lib/compare";
import { getProgress, solveProblem } from "../lib/storage";
import { LANGUAGE_LABELS } from "../types";

export default function ProblemPage() {
  const { problemId } = useParams();
  const location = problemId ?? "";
  const found = findProblem(location);

  const [code, setCode] = useState(found?.problem.starterCode ?? "");
  const [results, setResults] = useState<SampleResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);

  // Reset the workspace when navigating between problems.
  useEffect(() => {
    if (found) {
      setCode(found.problem.starterCode);
      setResults(null);
      setRunning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const doRunSamples = useCallback(async () => {
    if (!found) return;
    setRunning(true);
    setResults(null);
    try {
      const r = await runSamples(
        found.path.language,
        code,
        found.problem.samples,
      );
      setResults(r);
      if (r.length > 0 && r.every((x) => x.passed)) {
        solveProblem(found.problem.id);
        setTick((t) => t + 1);
      }
    } finally {
      setRunning(false);
    }
  }, [found, code]);

  if (!found) {
    return (
      <main className="page page-narrow">
        <div className="empty-state">
          <h3>Problem not found</h3>
          <p>
            <Link to="/learn">Browse the courses instead</Link>
          </p>
        </div>
      </main>
    );
  }

  const { problem, topic, path } = found;
  const language = path.language;
  const progress = getProgress();
  const solved = progress.solvedProblems.includes(problem.id);
  const allPassed = results !== null && results.length > 0 && results.every((r) => r.passed);
  const anyNotConfigured = results?.some((r) => r.skipped) ?? false;
  const remote = !(language === "javascript" || language === "sql");

  return (
    <main className="page">
      <div className="row" style={{ marginBottom: 10 }}>
        <Link to={`/learn/${language}/${topic.id}`} className="small">
          ← {path.label} · {topic.title}
        </Link>
        <span className={`badge badge-lang`}>{path.label}</span>
        <span className={`badge badge-${problem.difficulty}`}>{problem.difficulty}</span>
        {solved && <span className="solved-flag">✓ Solved</span>}
      </div>

      <div className="page-head">
        <h1>{problem.title}</h1>
        <p>{problem.prompt}</p>
      </div>

      {remote && anyNotConfigured && (
        <div className="banner">
          <strong>This language runs through a remote execution provider, which is not configured.</strong>{" "}
          Add a Judge0-compatible provider (see <code>app/README.md → Code execution</code>) to run
          the sample tests. The expected outputs below are shown from the course content.
        </div>
      )}
      {allPassed && (
        <div className="banner" style={{ borderColor: "var(--accent)" }}>
          <strong>✓ All sample tests passed</strong> — problem marked as solved. Progress is saved
          in this browser.
        </div>
      )}

      <div className="ide-toolbar">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void doRunSamples()}
          disabled={running}
        >
          {running ? "Running tests…" : "▶ Run sample tests"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setCode(problem.starterCode);
            setResults(null);
          }}
        >
          Reset to starter
        </button>
        <div className="nav-spacer" />
        <span className="small muted" data-solved-refresh={tick}>
          {problem.samples.length} visible sample test{problem.samples.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="ide-layout">
        <CodeEditor language={language} value={code} onChange={setCode} />

        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <h3>Solution</h3>
            <p>
              Write your code for <strong>{LANGUAGE_LABELS[language]}</strong> on the left, then run
              the visible sample tests. Only sample tests are shown — there are no hidden tests in
              this browser-only app.
            </p>
          </div>

          {running && (
            <div className="card">
              <p className="muted small" style={{ margin: 0 }}>
                Running sample tests…
              </p>
            </div>
          )}

          {results?.map((r, i) => (
            <div className="test-result" key={i}>
              <div className="test-result-head">
                <span>
                  Test {i + 1}
                  {r.input && <span className="muted"> · stdin: {JSON.stringify(r.input)}</span>}
                </span>
                <span className={r.passed ? "test-pass" : "test-fail"}>
                  {r.passed ? "✓ Pass" : r.skipped ? "— Not run" : "✗ Fail"}
                </span>
              </div>
              <div className="test-columns">
                <div className="test-column">
                  <span className="col-label">Expected</span>
                  {r.expectedOutput}
                </div>
                <div className="test-column">
                  <span className="col-label">Actual</span>
                  {r.skipped
                    ? r.actualError || "execution unavailable"
                    : r.actualOutput || "(no output)"}
                </div>
              </div>
            </div>
          ))}

          {!running && results === null && remote && (
            <div className="example-expected">
              Example expected output (from content):
              {"\n"}
              {problem.samples[0]?.expectedOutput}
            </div>
          )}

          <h3 className="section-title" style={{ marginTop: 22 }}>
            Hints
          </h3>
          {problem.hints.map((h, i) => (
            <details className="hint-item" key={i}>
              <summary>Hint {i + 1}</summary>
              <div>{h}</div>
            </details>
          ))}

          <h3 className="section-title">Explanation</h3>
          <p className="muted" style={{ marginTop: -6 }}>
            {problem.explanation}
          </p>
        </div>
      </div>
    </main>
  );
}
