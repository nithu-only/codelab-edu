import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Ide from "./pages/Ide";
import Learn from "./pages/Learn";
import PathOverview from "./pages/PathOverview";
import TopicPage from "./pages/TopicPage";
import ProblemPage from "./pages/ProblemPage";
import Saved from "./pages/Saved";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ide" element={<Ide />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:lang" element={<PathOverview />} />
        <Route path="/learn/:lang/:topicId" element={<TopicPage />} />
        <Route path="/problems/:problemId" element={<ProblemPage />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
