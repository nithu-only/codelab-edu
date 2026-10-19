import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="page page-narrow">
      <div className="empty-state">
        <h3>Page not found</h3>
        <p>
          The page you were looking for does not exist. <Link to="/">Back to home</Link>
        </p>
      </div>
    </main>
  );
}
