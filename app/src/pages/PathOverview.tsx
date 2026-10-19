import { Link, Navigate, useParams } from "react-router-dom";
import { getPath } from "../data/content";
import { getProgress } from "../lib/storage";
import type { LanguageId } from "../types";

const VALID: LanguageId[] = ["c", "cpp", "java", "python", "javascript", "sql"];

export default function PathOverview() {
  const { lang } = useParams();
  if (!lang || !VALID.includes(lang as LanguageId)) return <Navigate to="/learn" replace />;
  const language = lang as LanguageId;
  const path = getPath(language);
  const progress = getProgress();
  const done = path.topics.filter((t) =>
    progress.completedTopics.includes(`${language}:${t.id}`),
  ).length;
  const pct = path.topics.length ? Math.round((done / path.topics.length) * 100) : 0;

  return (
    <main className="page page-narrow">
      <div className="page-head">
        <div className="row" style={{ marginBottom: 8 }}>
          <Link to="/learn" className="small">
            ← All courses
          </Link>
          <span className="badge badge-lang">{path.label}</span>
        </div>
        <h1>{path.label} path</h1>
        <p>{path.blurb}</p>
        <div className="progress-track" style={{ width: 260, marginTop: 14 }}>
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-label">
          {done} of {path.topics.length} topics completed ({pct}%)
        </div>
      </div>

      <div className="topic-list">
        {path.topics.map((topic, i) => {
          const isDone = progress.completedTopics.includes(`${language}:${topic.id}`);
          const problemsSolved = topic.problems.filter((p) =>
            progress.solvedProblems.includes(p.id),
          ).length;
          return (
            <Link key={topic.id} to={`/learn/${language}/${topic.id}`} className="topic-row">
              <span className={`topic-index${isDone ? " done" : ""}`}>{isDone ? "✓" : i + 1}</span>
              <span className="topic-meta">
                <strong>{topic.title}</strong>
                <span>
                  {topic.lessons.length} lesson{topic.lessons.length === 1 ? "" : "s"} ·{" "}
                  {problemsSolved}/{topic.problems.length} problems solved
                </span>
              </span>
              <span className={`badge badge-${topic.difficulty}`}>{topic.difficulty}</span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
