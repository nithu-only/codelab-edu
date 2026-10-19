import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import ConsoleView, { StatusPill } from "../components/ConsoleView";
import { findTopic, getPath } from "../data/content";
import { completeTopic, getProgress, visitTopic } from "../lib/storage";
import { useRunner } from "../lib/useRunner";
import type { LanguageId } from "../types";

const VALID: LanguageId[] = ["c", "cpp", "java", "python", "javascript", "sql"];

export default function TopicPage() {
  const { lang, topicId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, run, reset } = useRunner();
  // Setter only: forces a re-render after progress mutations (the value is irrelevant).
  const [, setRefresh] = useState(0);
  const ranExampleRef = useRef<string | null>(null);

  const validLang = !!lang && VALID.includes(lang as LanguageId);
  const topic = validLang && topicId ? findTopic(lang as LanguageId, topicId) : undefined;
  const path = validLang ? getPath(lang as LanguageId) : undefined;

  const lessonId = searchParams.get("lesson");
  const lesson = topic?.lessons.find((l) => l.id === lessonId) ?? topic?.lessons[0];

  // Record the visit for "Continue Learning" on the home page.
  useEffect(() => {
    if (validLang && topicId && lang) visitTopic(lang as LanguageId, topicId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, topicId]);

  // Reset the console when the visible lesson changes.
  useEffect(() => {
    ranExampleRef.current = null;
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  const runExample = useCallback(() => {
    if (!lesson || !lang) return;
    ranExampleRef.current = lesson.id;
    void run(lang as LanguageId, lesson.exampleCode, lesson.exampleStdin);
    setRefresh((r) => r + 1);
  }, [lesson, lang, run]);

  if (!validLang) return <Navigate to="/learn" replace />;
  if (!topic || !path || !lesson) {
    return (
      <main className="page page-narrow">
        <div className="empty-state">
          <h3>Topic not found</h3>
          <p>
            <Link to={`/learn/${lang}`}>Back to the {lang} path</Link>
          </p>
        </div>
      </main>
    );
  }

  const progress = getProgress();
  const language = lang as LanguageId;
  const topicKey = `${language}:${topic.id}`;
  const isDone = progress.completedTopics.includes(topicKey);

  const topicIndex = path.topics.findIndex((t) => t.id === topic.id);
  const prev = topicIndex > 0 ? path.topics[topicIndex - 1] : undefined;
  const next = topicIndex < path.topics.length - 1 ? path.topics[topicIndex + 1] : undefined;

  const selectLesson = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id === topic.lessons[0]?.id) params.delete("lesson");
    else params.set("lesson", id);
    setSearchParams(params, { replace: true });
  };

  const markDone = () => completeTopic(language, topic.id);

  const ranOk = ranExampleRef.current === lesson.id && !state.running && state.status !== undefined;
  const showReference = ranOk && state.status !== "SUCCESS" && lesson.exampleOutput;

  return (
    <main className="page page-narrow">
      <div className="row" style={{ marginBottom: 10 }}>
        <Link to={`/learn/${language}`} className="small">
          ← {path.label} path
        </Link>
        <span className="muted small">/</span>
        <span className="small">{topic.title}</span>
        <span className={`badge badge-${topic.difficulty}`}>{topic.difficulty}</span>
        {isDone && <span className="solved-flag">✓ Completed</span>}
      </div>

      <div className="page-head">
        <h1>{topic.title}</h1>
        <p>
          {topic.lessons.length} lesson{topic.lessons.length === 1 ? "" : "s"} ·{" "}
          {topic.problems.length} practice problem{topic.problems.length === 1 ? "" : "s"}
        </p>
      </div>

      {topic.lessons.length > 1 && (
        <div className="row" style={{ marginBottom: 16 }}>
          {topic.lessons.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`btn btn-sm${l.id === lesson.id ? " btn-primary" : ""}`}
              onClick={() => selectLesson(l.id)}
            >
              {l.title}
            </button>
          ))}
        </div>
      )}

      <article className="prose">
        <h2>{lesson.title}</h2>
        <p>{lesson.concept}</p>

        <h3>Syntax</h3>
        <pre className="syntax-block">{lesson.syntax}</pre>

        <h3>Example</h3>
        <CodeEditor language={language} value={lesson.exampleCode} onChange={() => {}} />
        <div className="row" style={{ margin: "12px 0" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={runExample}
            disabled={state.running}
          >
            {state.running ? "Running…" : "▶ Run example"}
          </button>
          <StatusPill status={state.status} />
          {lesson.exampleStdin && (
            <span className="small muted mono">stdin: {JSON.stringify(lesson.exampleStdin)}</span>
          )}
        </div>

        <div className="console-panel" style={{ minHeight: 220, marginBottom: 16 }}>
          <div className="console-head">
            <span>Example output</span>
          </div>
          <ConsoleView
            status={state.status}
            running={state.running}
            stdout={state.stdout}
            stderr={state.stderr}
            timeMs={state.timeMs}
          />
        </div>

        {showReference && (
          <>
            <p className="small muted">Reference output (from the course content):</p>
            <pre className="example-expected">{lesson.exampleOutput}</pre>
          </>
        )}
        {ranOk && state.status === "SUCCESS" && lesson.exampleOutput && (
          <details className="hint-item" style={{ marginBottom: 16 }}>
            <summary>Expected output</summary>
            <div className="mono" style={{ whiteSpace: "pre-wrap" }}>
              {lesson.exampleOutput}
            </div>
          </details>
        )}

        <div className="row" style={{ margin: "18px 0 6px" }}>
          <button
            type="button"
            className={isDone ? "btn" : "btn btn-primary"}
            onClick={() => {
              markDone();
              setRefresh((r) => r + 1);
            }}
            disabled={isDone}
          >
            {isDone ? "✓ Topic completed" : "Mark topic as complete"}
          </button>
        </div>
      </article>

      <h2 className="section-title">Practice</h2>
      {topic.problems.length === 0 ? (
        <p className="muted">No practice problems for this topic yet.</p>
      ) : (
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
      )}

      <div className="row-between" style={{ marginTop: 34 }}>
        {prev ? (
          <Link to={`/learn/${language}/${prev.id}`} className="btn btn-ghost">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/learn/${language}/${next.id}`} className="btn btn-ghost">
            {next.title} →
          </Link>
        ) : (
          <Link to="/learn" className="btn btn-ghost">
            Finish path →
          </Link>
        )}
      </div>
    </main>
  );
}
