import { useMemo, useState, type ReactNode } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { getPath } from "../../data/content";
import { getProgress } from "../../lib/storage";
import type { Topic } from "../../types";
import styles from "./ctutorial.module.css";

function flatten(path: ReturnType<typeof getPath>) {
  const flat: Array<{ topic: Topic; lesson: Topic["lessons"][number] }> = [];
  for (const topic of path.topics) {
    for (const lesson of topic.lessons) flat.push({ topic, lesson });
  }
  return flat;
}

export default function CTutorialLayout({ children }: { children: ReactNode }) {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const path = getPath("c");
  const topic = topicId ? path.topics.find((t) => t.id === topicId) : undefined;
  const lessonId = searchParams.get("lesson");
  const lesson = topic?.lessons.find((l) => l.id === lessonId) ?? topic?.lessons[0];

  const flat = useMemo(() => flatten(path), [path]);

  const sections = useMemo(() => {
    const map = new Map<string, Topic[]>();
    for (const t of path.topics) {
      const key = t.section || "C Tutorial";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries());
  }, [path]);

  const filtered = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections
      .map(([name, topics]) => {
        const matched = topics
          .map((t) => ({
            ...t,
            lessons: t.title.toLowerCase().includes(q)
              ? t.lessons
              : t.lessons.filter((l) => l.title.toLowerCase().includes(q)),
          }))
          .filter((t) => t.title.toLowerCase().includes(q) || t.lessons.length > 0);
        return [name, matched] as [string, Topic[]];
      })
      .filter(([, topics]) => topics.length > 0);
  }, [query, sections]);

  if (!topic || !lesson) {
    const first = path.topics[0];
    return <Navigate to={first ? `/learn/c/${first.id}` : "/learn"} replace />;
  }

  const currentIndex = flat.findIndex((f) => f.topic.id === topic.id && f.lesson.id === lesson.id);
  const prev = currentIndex > 0 ? flat[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null;
  const progress = getProgress();
  const isTopicDone = (tid: string) => progress.completedTopics.includes(`c:${tid}`);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.courseTitle}>C TUTORIAL</div>
          <input
            className={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons…"
            aria-label="Search lessons"
          />
        </div>
        <nav className={styles.nav} aria-label="C tutorial lessons">
          {filtered.map(([sectionName, topics]) => {
            const isOpen = open[sectionName] !== false;
            return (
              <div key={sectionName} className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionBtn}
                  onClick={() =>
                    setOpen((o) => ({ ...o, [sectionName]: !(o[sectionName] !== false) }))
                  }
                >
                  <span>
                    {sectionName}
                    {topics.every((t) => isTopicDone(t.id)) ? " ✓" : ""}
                  </span>
                  <span aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
                </button>
                {isOpen &&
                  topics.map((t) => (
                    <div key={t.id} className={styles.topicGroup}>
                      {topics.length > 1 && (
                        <div className={styles.topicGroupTitle}>
                          {t.title}
                          {isTopicDone(t.id) ? " ✓" : ""}
                        </div>
                      )}
                      {t.lessons.map((l) => {
                        const active = topic.id === t.id && lesson.id === l.id;
                        return (
                          <Link
                            key={l.id}
                            to={`/learn/c/${t.id}?lesson=${encodeURIComponent(l.id)}`}
                            className={`${styles.lessonLink} ${active ? styles.active : ""}`}
                            aria-current={active ? "page" : undefined}
                          >
                            {l.title}
                          </Link>
                        );
                      })}
                    </div>
                  ))}
              </div>
            );
          })}
        </nav>
      </aside>

      <main className={styles.main}>
        <div className={styles.breadcrumbs}>
          <Link to="/learn">Learn</Link>
          <span>/</span>
          <Link to="/learn/c">C</Link>
          <span>/</span>
          <span>{topic.title}</span>
          <span>/</span>
          <span>{lesson.title}</span>
        </div>

        {children}

        <div className={styles.pager}>
          {prev ? (
            <Link className={styles.pagerBtn} to={`/learn/c/${prev.topic.id}?lesson=${encodeURIComponent(prev.lesson.id)}`}>
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className={styles.pagerBtn} to={`/learn/c/${next.topic.id}?lesson=${encodeURIComponent(next.lesson.id)}`}>
              Next →
            </Link>
          ) : (
            <Link className={styles.pagerBtn} to="/learn/c">
              Finish →
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
