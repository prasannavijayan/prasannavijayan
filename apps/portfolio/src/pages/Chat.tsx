import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Nav, ThemeToggle } from "@pv/ui";
import { ResumeModal } from "@/components/ResumeModal";
import { useLogo } from "@/lib/useLogo";
import {
  AVATAR_URL,
  SUGGESTIONS,
  buildSystemPrompt,
  formatText,
  loadContext,
  sendChat,
  type Message,
} from "@/lib/chat";

function AssistantAvatar() {
  const [failed, setFailed] = useState(false);
  if (failed) return <>PV</>;
  return <img src={AVATAR_URL} alt="Prasanna" onError={() => setFailed(true)} />;
}

const userSVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [resumeOpen, setResumeOpen] = useState(false);

  const logo = useLogo();
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadContext().then(({ resume, md }) => setSystemPrompt(buildSystemPrompt(resume, md)));
  }, []);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    const next = [...messages, { role: "user", content } as Message];
    setMessages(next);
    setIsLoading(true);

    try {
      const reply = await sendChat(systemPrompt, next);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Something went wrong. Please refresh and try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      <Nav
        name="Prasanna Vijayan"
        avatarUrl={logo}
        chip="AI Frontend Engineer · 10+ yrs"
      >
        <Link className="nav-link" to="/projects" title="Projects">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Projects</span>
        </Link>
        <button className="resume-btn" onClick={() => setResumeOpen(true)} title="View Resume">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Resume
        </button>
        <ThemeToggle />
      </Nav>

      <div className="main">
        <div className={`messages${isEmpty ? " is-empty" : ""}`} ref={messagesRef}>
          {isEmpty ? (
            <div className="empty-state">
              <div className="empty-avatar">
                <AssistantAvatar />
              </div>
              <div className="empty-title">Hi, I'm Prasanna's assistant</div>
              <p className="empty-sub">
                Ask me anything about Prasanna's experience, skills, projects, or how to get in touch.
              </p>
              <div className="suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="suggest-btn" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={i} className={`msg-row ${m.role}`}>
                  <div className={`msg-icon ${m.role === "assistant" ? "ai" : "user-icon"}`}>
                    {m.role === "assistant" ? <AssistantAvatar /> : userSVG}
                  </div>
                  {m.role === "assistant" ? (
                    <div
                      className="msg-bubble ai"
                      dangerouslySetInnerHTML={{ __html: formatText(m.content) }}
                    />
                  ) : (
                    <div className="msg-bubble user">{m.content}</div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="msg-row assistant">
                  <div className="msg-icon ai">
                    <AssistantAvatar />
                  </div>
                  <div className="msg-bubble ai">
                    <div className="typing">
                      <div className="dot" />
                      <div className="dot" />
                      <div className="dot" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="input-area">
          <div className="input-box">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Ask anything about Prasanna…"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                const el = e.target;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 140) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button
              className="send-btn"
              disabled={!input.trim() || isLoading}
              onClick={() => send()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div className="input-footer">
            Answers based on Prasanna's resume &amp; context &nbsp;·&nbsp;
            <a href="mailto:prasannavijayan.tm@gmail.com">Get in touch</a>
          </div>
        </div>
      </div>

      <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} />
    </>
  );
}
