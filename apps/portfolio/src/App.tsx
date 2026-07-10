import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Favicon } from "@/components/Favicon";
import { initGA, trackPageView } from "@/lib/analytics";
import Chat from "@/pages/Chat";
import Projects from "@/pages/Projects";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Favicon />
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
    </>
  );
}
