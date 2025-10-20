"use client";
import { useChat } from "ai/react";
import { useEffect, useRef } from "react";

export default function Chat() {
  const sessionIdRef = useRef<string | undefined>(undefined);

  // Initialize sessionId once on mount
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID().replace(/-/g, "");
      console.log("Session ID:", sessionIdRef.current);
    }
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      headers: {
        "x-session-id": sessionIdRef.current || "",
      },
    });

  return (
    <main className="max-w-4xl mx-auto  flex flex-col h-screen">
      <div className="flex items-center justify-between mb-4 p-6">
        <h1 className="text-2xl font-bold">
          🎩 Carif-Oref {"<>"} RI assistant
        </h1>
        <span className="text-xs text-gray-500">
          Session: {sessionIdRef.current}
        </span>
      </div>

      <div className="space-y-3 p-6 border border-gray-200  flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            Commencez une conversation...
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-white border border-gray-200">
              <p className="text-sm text-gray-400">En train d'écrire...</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4 mb-4 ">
        <textarea
          className="flex-1 border border-gray-300 p-3  focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={handleInputChange}
          placeholder="Écris ton message…"
          disabled={isLoading}
          rows={4}
        />
        <button
          className="bg-emerald-500 cursor-pointer text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
        >
          Envoyer
        </button>
      </form>
    </main>
  );
}
