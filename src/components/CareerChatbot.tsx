'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const starterPrompts = [
  'What career should I choose if I like technology?',
  'What skills are needed for cybersecurity?',
  'What free courses can help me start a tech career?',
];

const CareerChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi! I am your AI career advisor for students in Montgomery, Alabama. Ask me about careers, skills, learning resources, and next steps.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError('');
    setInput('');
    setLoading(true);

    const nextMessages = [...messages, { role: 'user' as const, content: trimmed }];
    setMessages(nextMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        const reason = errorPayload?.error || `Chat request failed: ${response.status}`;
        throw new Error(reason);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'No response generated.' }]);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Chatbot is temporarily unavailable. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendMessage(input);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
      {isOpen && (
        <section className="mb-3 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl backdrop-blur">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-white">AI Career Advisor</h3>
              <p className="text-xs text-slate-400">Montgomery student career guide</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <div
            ref={messagesContainerRef}
            className="h-60 overflow-y-auto rounded-md border border-slate-700 bg-slate-950 p-3"
          >
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div key={`${msg.role}-${idx}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-cyan-600 text-white'
                        : 'border border-slate-700 bg-slate-800 text-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-60"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your career question..."
              className="flex-1 rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-60"
            >
              Send
            </button>
          </form>

          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </section>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/40 hover:bg-cyan-700"
      >
        {isOpen ? 'Hide Chat' : 'AI Chat'}
      </button>
    </div>
  );
};

export default CareerChatbot;
