"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  accentColor: string;
}

const SUGGESTIONS = [
  "Tell me about Ritam",
  "Open source journey?",
  "Philosophy & code",
  "Your tech stack",
];

export default function ChatPanel({ isOpen, onClose, accentColor: ac }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "welcome, traveler. ask me anything about my projects, the philosophy behind them, my open source work, or what drives me to build. what's on your mind?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 400);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      const conversationHistory = messages
        .filter((msg) => msg.id !== "welcome")
        .map((msg) => ({ role: msg.role, content: msg.content }));

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader available");

      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "token") {
                accumulatedContent += data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "apologies — having trouble responding right now. try again in a moment.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: errorMessage }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    textareaRef.current?.focus();
  };

  const showSuggestions = messages.length === 1;
  const canSend = inputValue.trim() && !isLoading;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 49,
          background: "rgba(0,0,4,0.4)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 92vw)",
          zIndex: 50,
          background: "rgba(0,0,4,0.85)",
          backdropFilter: "blur(20px)",
          borderLeftWidth: 1,
          borderLeftStyle: "solid",
          borderLeftColor: `${ac}10`,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.6s ease",
          boxShadow: isOpen
            ? `-20px 0 60px rgba(0,0,0,0.5), -4px 0 20px ${ac}08`
            : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottomWidth: 1,
            borderBottomStyle: "solid",
            borderBottomColor: `${ac}10`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            transition: "border-color 0.6s ease",
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: "rgba(255,255,255,0.72)",
              letterSpacing: "-0.02em",
            }}
          >
            Chat with Atharva
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: `${ac}15`,
              background: "transparent",
              color: "rgba(255,255,255,0.3)",
              fontFamily: "'DM Mono',monospace",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = ac;
              e.currentTarget.style.color = ac;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${ac}15`;
              e.currentTarget.style.color = "rgba(255,255,255,0.3)";
            }}
          >
            &times;
          </button>
        </div>

        {/* Messages */}
        <div
          className="chat-messages"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {messages.map((message) => (
            <div key={message.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(message.content || message.role === "user") && (
                <span
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: message.role === "user" ? "rgba(255,255,255,0.2)" : ac,
                    opacity: 0.7,
                    textAlign: message.role === "user" ? "right" : "left",
                    transition: "color 0.6s ease",
                  }}
                >
                  {message.role === "user" ? "You" : "Atharva"}
                </span>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {message.role === "user" ? (
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: `${ac}18`,
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: `${ac}22`,
                      transition: "background 0.6s ease, border-color 0.6s ease",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 15,
                        lineHeight: 1.5,
                        color: "rgba(255,255,255,0.72)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {message.content}
                    </span>
                  </div>
                ) : message.content ? (
                  <div style={{ width: "100%" }} className="chat-markdown">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p
                            style={{
                              fontFamily: "'Cormorant Garamond',serif",
                              fontSize: 15,
                              lineHeight: 1.65,
                              color: "rgba(255,255,255,0.55)",
                              margin: "0 0 8px 0",
                            }}
                          >
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
                            {children}
                          </em>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: ac,
                              textDecoration: "none",
                              borderBottomWidth: 1,
                              borderBottomStyle: "solid",
                              borderBottomColor: `${ac}40`,
                              transition: "border-color 0.2s ease",
                            }}
                          >
                            {children}
                          </a>
                        ),
                        h1: ({ children }) => (
                          <h1
                            style={{
                              fontFamily: "'Space Grotesk',sans-serif",
                              fontSize: 18,
                              fontWeight: 700,
                              color: "rgba(255,255,255,0.72)",
                              margin: "16px 0 8px 0",
                            }}
                          >
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2
                            style={{
                              fontFamily: "'Space Grotesk',sans-serif",
                              fontSize: 16,
                              fontWeight: 700,
                              color: "rgba(255,255,255,0.68)",
                              margin: "14px 0 6px 0",
                            }}
                          >
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3
                            style={{
                              fontFamily: "'Space Grotesk',sans-serif",
                              fontSize: 15,
                              fontWeight: 600,
                              color: "rgba(255,255,255,0.65)",
                              margin: "12px 0 4px 0",
                            }}
                          >
                            {children}
                          </h3>
                        ),
                        ul: ({ children }) => (
                          <ul
                            style={{
                              fontFamily: "'Cormorant Garamond',serif",
                              fontSize: 15,
                              lineHeight: 1.65,
                              color: "rgba(255,255,255,0.55)",
                              margin: "4px 0 8px 0",
                              paddingLeft: 20,
                            }}
                          >
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol
                            style={{
                              fontFamily: "'Cormorant Garamond',serif",
                              fontSize: 15,
                              lineHeight: 1.65,
                              color: "rgba(255,255,255,0.55)",
                              margin: "4px 0 8px 0",
                              paddingLeft: 20,
                            }}
                          >
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li style={{ marginBottom: 2 }}>{children}</li>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote
                            style={{
                              borderLeftWidth: 2,
                              borderLeftStyle: "solid",
                              borderLeftColor: `${ac}50`,
                              paddingLeft: 12,
                              margin: "8px 0",
                              color: "rgba(255,255,255,0.45)",
                              fontStyle: "italic",
                            }}
                          >
                            {children}
                          </blockquote>
                        ),
                        hr: () => (
                          <hr
                            style={{
                              borderStyle: "none",
                              borderTopWidth: 1,
                              borderTopStyle: "solid",
                              borderTopColor: `${ac}20`,
                              margin: "12px 0",
                            }}
                          />
                        ),
                        table: ({ children }) => (
                          <div style={{ overflowX: "auto", margin: "8px 0" }}>
                            <table
                              style={{
                                borderCollapse: "collapse",
                                width: "100%",
                                fontFamily: "'DM Mono',monospace",
                                fontSize: 12,
                              }}
                            >
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th
                            style={{
                              borderWidth: 1,
                              borderStyle: "solid",
                              borderColor: `${ac}20`,
                              padding: "6px 10px",
                              textAlign: "left",
                              color: "rgba(255,255,255,0.6)",
                              background: `${ac}08`,
                              fontWeight: 600,
                            }}
                          >
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td
                            style={{
                              borderWidth: 1,
                              borderStyle: "solid",
                              borderColor: `${ac}15`,
                              padding: "6px 10px",
                              color: "rgba(255,255,255,0.5)",
                            }}
                          >
                            {children}
                          </td>
                        ),
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const codeString = String(children).replace(/\n$/, "");
                          if (match) {
                            return (
                              <div
                                style={{
                                  margin: "8px 0",
                                  borderRadius: 8,
                                  overflow: "hidden",
                                  borderWidth: 1,
                                  borderStyle: "solid",
                                  borderColor: `${ac}15`,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "6px 12px",
                                    background: `${ac}08`,
                                    borderBottomWidth: 1,
                                    borderBottomStyle: "solid",
                                    borderBottomColor: `${ac}10`,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontFamily: "'DM Mono',monospace",
                                      fontSize: 10,
                                      letterSpacing: "0.08em",
                                      textTransform: "uppercase",
                                      color: `${ac}90`,
                                    }}
                                  >
                                    {match[1]}
                                  </span>
                                </div>
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={match[1]}
                                  PreTag="div"
                                  customStyle={{
                                    margin: 0,
                                    padding: "12px",
                                    background: "rgba(0,0,4,0.6)",
                                    fontSize: 12,
                                    lineHeight: 1.6,
                                    borderRadius: 0,
                                  }}
                                  codeTagProps={{
                                    style: {
                                      fontFamily: "'DM Mono',monospace",
                                    },
                                  }}
                                >
                                  {codeString}
                                </SyntaxHighlighter>
                              </div>
                            );
                          }
                          return (
                            <code
                              style={{
                                fontFamily: "'DM Mono',monospace",
                                fontSize: 13,
                                background: `${ac}12`,
                                color: "rgba(255,255,255,0.7)",
                                padding: "2px 6px",
                                borderRadius: 4,
                                borderWidth: 1,
                                borderStyle: "solid",
                                borderColor: `${ac}10`,
                              }}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {isLoading &&
                      message.id === messages[messages.length - 1]?.id && (
                        <span
                          style={{
                            display: "inline-block",
                            width: 2,
                            height: 15,
                            background: ac,
                            marginLeft: 2,
                            verticalAlign: "text-bottom",
                            animation: "chatBlink 1s infinite",
                            transition: "background 0.6s ease",
                          }}
                        />
                      )}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 4, padding: "4px 0" }}>
                    {["-0.32s", "-0.16s", "0s"].map((delay, i) => (
                      <div
                        key={i}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: ac,
                          opacity: 0.5,
                          animation: "chatBounce 1.4s infinite ease-in-out",
                          animationDelay: delay,
                          transition: "background 0.6s ease",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {showSuggestions && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 8,
              }}
            >
              {SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    background: "transparent",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: `${ac}30`,
                    color: `${ac}90`,
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 11,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = ac;
                    e.currentTarget.style.color = ac;
                    e.currentTarget.style.background = `${ac}12`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${ac}30`;
                    e.currentTarget.style.color = `${ac}90`;
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "14px 20px",
            borderTopWidth: 1,
            borderTopStyle: "solid",
            borderTopColor: `${ac}10`,
            flexShrink: 0,
            transition: "border-color 0.6s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 20,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: `${ac}12`,
              padding: "4px 4px 4px 16px",
              transition: "border-color 0.2s ease",
            }}
          >
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Atharva..."
              disabled={isLoading}
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                background: "transparent",
                borderStyle: "none",
                padding: "8px 0",
                fontSize: 14,
                color: "rgba(255,255,255,0.72)",
                fontFamily: "'DM Mono',monospace",
                outline: "none",
                maxHeight: 120,
                minHeight: 24,
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                borderStyle: "none",
                background: canSend ? ac : "rgba(255,255,255,0.04)",
                color: canSend ? "#000004" : "rgba(255,255,255,0.15)",
                cursor: canSend ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.3s ease",
                fontSize: 16,
              }}
            >
              &#9654;
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
