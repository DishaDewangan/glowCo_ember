import React from 'react';
import { useChat } from '@ai-sdk/react';
import ToolCallBubble from './ToolCallBubble.jsx';
import './AgentChat.css';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AgentChat({ suggestions = [] }) {
  const [error, setError] = React.useState(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: `${API_URL}/api/agent/chat`,
    maxSteps: 10,
    onError: (err) => {
      console.error('Chat error:', err);
      setError(err.message || 'Something went wrong. Check the server is running.');
    },
    onFinish: () => setError(null),
  });

  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSuggestion(text) {
    append({ role: 'user', content: text });
  }

  return (
    <div className="agent-chat">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <h2>What would you like to do?</h2>
            <p>
              Describe your campaign goal in plain English. Ember handles segmentation,
              messaging, and launch.
            </p>
            <div className="suggestions">
              {suggestions.map((s) => (
                <button key={s} className="suggestion-chip" onClick={() => handleSuggestion(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`message message-${m.role}`}>
            {m.role === 'assistant' && (
              <>
                {m.toolInvocations?.map((t) => (
                  <ToolCallBubble key={t.toolCallId} tool={t} />
                ))}
                {m.parts?.map((part, i) => {
                  if (part.type === 'tool-invocation') {
                    return <ToolCallBubble key={i} tool={part.toolInvocation} />;
                  }
                  if (part.type === 'text' && part.text) {
                    return (
                      <div key={i} className="message-content">
                        {part.text}
                      </div>
                    );
                  }
                  return null;
                })}
                {m.content && !m.parts?.length && (
                  <div className="message-content">{m.content}</div>
                )}
              </>
            )}

            {m.role === 'user' && <div className="message-content">{m.content}</div>}
          </div>
        ))}

        {isLoading && (
          <div className="message message-assistant">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="chat-error">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="e.g. Find customers whose moisturiser ran out 35+ days ago..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
