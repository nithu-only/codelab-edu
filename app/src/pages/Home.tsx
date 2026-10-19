import { Link } from "react-router-dom";
import { LANGUAGE_LABELS, type LanguageId } from "../types";
import { allProblems, getPath, PATH_ORDER, totalProblems, totalTopics } from "../data/content";
import { getProgress, listPrograms } from "../lib/storage";

function progressStats() {
  const p = getProgress();
  const topics = totalTopics();
  const problems = totalProblems();
  return {
    topicsDone: p.completedTopics.length,
    topics,
    problemsDone: p.solvedProblems.filter((id) => allProblems().some((x) => x.problem.id === id)).length,
    problems,
    lastTopic: p.lastTopic,
    solvedIds: p.solvedProblems,
  };
}

export default function Home() {
  const stats = progressStats();
  const recent = listPrograms().slice(0, 4);
  const practice = allProblems()
    .filter((p) => !stats.solvedIds.includes(p.problem.id))
    .slice(0, 6);
  const fallbackPractice = practice.length > 0 ? practice : allProblems().slice(0, 6);

  const continuePath = stats.lastTopic
    ? `/learn/${stats.lastTopic.split(":")[0]}/${stats.lastTopic.split(":")[1]}`
    : "/learn/python/variables";

  const topicPct = stats.topics ? Math.round((stats.topicsDone / stats.topics) * 100) : 0;

  return (
    <main className="page">
      <section className="page-head" style={{ marginTop: 8 }}>
        <h1>Learn to code, right in your browser.</h1>
        <p>
          Short lessons, runnable examples and practice problems in C, C++, Java, Python, JavaScript
          and SQL — plus a full online IDE with one-click execution. Progress is saved locally in
          your browser; no account needed.
        </p>
        <div className="row" style={{ marginTop: 16 }}>
          <Link to="/ide" className="btn btn-primary">
            ▶ Start Coding
          </Link>
          <Link to={continuePath} className="btn">
            Continue Learning
          </Link>
          <Link to="/learn" className="btn btn-ghost">
            Browse courses
          </Link>
        </div>
      </section>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-value">
            {stats.topicsDone}/{stats.topics}
          </div>
          <div className="stat-label">Topics completed</div>
          <div className="progress-track" style={{ marginTop: 8 }}>
            <div className="progress-bar" style={{ width: `${topicPct}%` }} />
          </div>
        </div>
        <div className="stat">
          <div className="stat-value">
            {stats.problemsDone}/{stats.problems}
          </div>
          <div className="stat-label">Problems solved</div>
        </div>
        <div className="stat">
          <div className="stat-value">6</div>
          <div className="stat-label">Languages supported</div>
        </div>
        <div className="stat">
          <div className="stat-value">{recent.length}</div>
          <div className="stat-label">Recent programs</div>
        </div>
      </div>

      <h2 className="section-title">Start coding</h2>
      <div className="grid grid-3">
        {PATH_ORDER.map((lang) => (
          <Link key={lang} to={`/ide?lang=${lang}`} className="card card-clickable">
            <div className="row-between">
              <h3>{LANGUAGE_LABELS[lang]}</h3>
              <span className="badge badge-lang">{getPath(lang).topics.length} topics</span>
            </div>
            <p>{getPath(lang).blurb}</p>
          </Link>
        ))}
      </div>

      <h2 className="section-title">Practice problems</h2>
      <div className="grid grid-3">
        {fallbackPractice.map(({ problem, topic, path }) => (
          <Link key={problem.id} to={`/problems/${problem.id}`} className="card card-clickable">
            <div className="row-between" style={{ marginBottom: 6 }}>
              <span className="badge badge-lang">{path.label}</span>
              <span className={`badge badge-${problem.difficulty}`}>{problem.difficulty}</span>
            </div>
            <h3>{problem.title}</h3>
            <p>
              {topic.title} — {problem.prompt.slice(0, 90)}
              {problem.prompt.length > 90 ? "…" : ""}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="section-title">Recent programs</h2>
      {recent.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing saved yet</h3>
          <p>
            Open the <Link to="/ide">IDE</Link>, write some code and press Save — your programs will
            show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-3">
          {recent.map((p) => (
            <Link key={p.id} to={`/ide?open=${p.id}`} className="card card-clickable">
              <div className="row-between">
                <h3>{p.name}</h3>
                <span className="badge badge-lang">{LANGUAGE_LABELS[p.language as LanguageId]}</span>
              </div>
              <p className="mono" style={{ fontSize: 12.5, opacity: 0.75 }}>
                {new Date(p.updatedAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
