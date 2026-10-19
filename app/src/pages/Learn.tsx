import { Link } from "react-router-dom";
import { LANGUAGE_LABELS } from "../types";
import { getPath, PATH_ORDER, totalProblems, totalTopics } from "../data/content";
import { getProgress } from "../lib/storage";

export default function Learn() {
  const progress = getProgress();
  const topicsDone = progress.completedTopics.length;
  const problemsDone = progress.solvedProblems.length;

  return (
    <main className="page">
      <div className="page-head">
        <h1>Learn</h1>
        <p>
          Structured paths for six languages. Each topic pairs a short lesson with a runnable
          example and a practice problem — progress is stored in this browser only.{" "}
          <span className="muted">
            {topicsDone}/{totalTopics()} topics · {problemsDone}/{totalProblems()} problems solved
          </span>
        </p>
      </div>

      <div className="grid grid-3">
        {PATH_ORDER.map((lang) => {
          const path = getPath(lang);
          const done = path.topics.filter((t) =>
            progress.completedTopics.includes(`${lang}:${t.id}`),
          ).length;
          const pct = path.topics.length ? Math.round((done / path.topics.length) * 100) : 0;
          return (
            <Link key={lang} to={`/learn/${lang}`} className="card card-clickable">
              <div className="row-between">
                <h3>{LANGUAGE_LABELS[lang]}</h3>
                <span className="badge badge-lang">
                  {done}/{path.topics.length}
                </span>
              </div>
              <p>{path.blurb}</p>
              <div className="progress-track" style={{ marginTop: 12 }}>
                <div className="progress-bar" style={{ width: `${pct}%` }} />
              </div>
              <div className="progress-label">{pct}% complete</div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
