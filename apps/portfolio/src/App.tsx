import { Routes, Route } from "react-router-dom";
import Chat from "@/pages/Chat";
import Projects from "@/pages/Projects";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Chat />} />
      <Route path="/projects" element={<Projects />} />
    </Routes>
  );
}
