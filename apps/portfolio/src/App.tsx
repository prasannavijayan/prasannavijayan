import { Routes, Route } from "react-router-dom";
import { Favicon } from "@/components/Favicon";
import Chat from "@/pages/Chat";
import Projects from "@/pages/Projects";

export default function App() {
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
