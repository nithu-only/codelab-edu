import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import ConsoleView, { StatusPill } from "../components/ConsoleView";
import CTutorialLayout from "../components/learn/CTutorialLayout";
import { findTopic } from "../data/content";
import { completeTopic, getProgress, visitTopic } from "../lib/storage";
import { useRunner } from "../lib/useRunner";

export default function CTutorialPage() {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const { state, run, reset } = useRunner();
  const [, setRefresh] = useState(0);
  const [code, setCode] = useState("");
  const ranExampleRef = useRef<string | null>(null);

  const topic = topicId ? findTopic("c", topicId) : undefined;
  const lessonId = searchParams.get("lesson");
  const lesson = topic?.lessons.find((l) => l.id === lessonId) ?? topic?.lessons[0];

  useEffect(() => {
    if (topicId) visitTopic("c", topicId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  useEffect(() => {
    ranExampleRef.current = null;
    setCode(lesson?.exampleCode ?? "");
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  const runExample = useCallback(() => {
    if (!lesson) return;
    ranExampleRef.current = lesson.id;
    void run("c", code, lesson.exampleStdin);
    setRefresh((r) => r + 1);
  }, [code, lesson, run]);

  if (!topic || !lesson) return <Navigate to="/learn/c" replace />;

  const progress = getProgress();
  const topicKey = `c:${topic.id}`;
  const isDone = progress.completedTopics.includes(topicKey);
  const ranOk = ranExampleRef.current === lesson.id && !state.running && state.status !== undefined;
  const showReference = ranOk && state.status !== "SUCCESS" && lesson.exampleOutput;

  return (
    <CTutorialLayout>
      <article className="prose" style={{ maxWidth: 920 }}>
        <h1 style={{ marginTop: 0 }}>{lesson.title}</h1>

        {lesson.objectives && lesson.objectives.length > 0 && (
          <>
            <h2>Learning Objectives</h2>
            <ul>
              {lesson.objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </>
        )}

        <h2>Overview</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{lesson.concept}</p>

        {lesson.syntax.trim() && (
          <>
            <h2>Syntax</h2>
            <pre className="syntax-block">{lesson.syntax}</pre>
          </>
        )}

        <h2>Example</h2>
        <div className="editor-shell" style={{ marginBottom: 10 }}>
          <CodeEditor language="c" value={code} onChange={setCode} height="360px" />
        </div>

        {lesson.exampleStdin && (
          <p className="small muted">
            <strong>Input:</strong> <span className="mono">{lesson.exampleStdin}</span>
          </p>
        )}

        <div className="row" style={{ margin: "12px 0 14px" }}>
          <button type="button" className="btn btn-primary" onClick={runExample} disabled={state.running}>
            {state.running ? "Running…" : "▶ Try it Yourself"}
          </button>
          <StatusPill status={state.status} />
          <button
            type="button"
            className="btn"
            onClick={() => {
              setCode(lesson.exampleCode);
              reset();
            }}
          >
            Restore example
          </button>
          <Link className="btn btn-ghost" to="/ide">
            Open in IDE
          </Link>
        </div>

        <div className="console-panel" style={{ minHeight: 200, marginBottom: 16 }}>
          <div className="console-head">
            <span>Output</span>
          </div>
          <ConsoleView
            status={state.status}
            running={state.running}
            stdout={state.stdout}
            stderr={state.stderr}
            timeMs={state.timeMs}
          />
        </div>

        {ranOk && state.status === "SUCCESS" && lesson.exampleOutput && (
          <details className="hint-item" style={{ marginBottom: 16 }} open>
            <summary>Expected Output</summary>
            <pre className="example-expected" style={{ marginTop: 8 }}>
              {lesson.exampleOutput}
            </pre>
          </details>
        )}

        {showReference && (
          <>
            <p className="small muted">Reference output (from the course content):</p>
            <pre className="example-expected">{lesson.exampleOutput}</pre>
          </>
        )}

        {lesson.explanation && (
          <>
            <h2>Code Explanation</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{lesson.explanation}</p>
          </>
        )}

        {lesson.tips && lesson.tips.length > 0 && (
          <>
            <h2>Tips</h2>
            <ul>
              {lesson.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </>
        )}

        {lesson.mistakes && lesson.mistakes.length > 0 && (
          <>
            <h2>Common Mistakes</h2>
            <ul>
              {lesson.mistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </>
        )}

        <div className="row" style={{ margin: "22px 0 10px", gap: 10 }}>
          <button
            type="button"
            className={isDone ? "btn" : "btn btn-primary"}
            onClick={() => {
              completeTopic("c", topic.id);
              setRefresh((r) => r + 1);
            }}
            disabled={isDone}
          >
            {isDone ? "✓ Topic completed" : "Mark topic as complete"}
          </button>
        </div>

        {topic.problems.length > 0 && (
          <>
            <h2>Practice Exercises</h2>
            <div className="topic-list">
              {topic.problems.map((p) => {
                const solved = progress.solvedProblems.includes(p.id);
                return (
                  <Link key={p.id} to={`/problems/${p.id}`} className="topic-row">
                    <span className={`topic-index${solved ? " done" : ""}`}>{solved ? "✓" : "→"}</span>
                    <span className="topic-meta">
                      <strong>{p.title}</strong>
                      <span>{p.prompt}</span>
                    </span>
                    <span className={`badge badge-${p.difficulty}`}>{p.difficulty}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </article>
    </CTutorialLayout>
  );
}
