import './ToolCallBubble.css';

const TOOL_LABELS = {
  segment_customers: 'Segmenting customers',
  draft_message: 'Drafting messages',
  launch_campaign: 'Launching campaign',
  get_campaign_stats: 'Fetching campaign stats',
  explain_audience: 'Analyzing audience',
};

export default function ToolCallBubble({ tool }) {
  const name = tool.toolName || tool.name;
  const label = TOOL_LABELS[name] || name;
  const state = tool.state || (tool.result !== undefined ? 'result' : 'call');
  const isDone = state === 'result' || tool.result !== undefined;

  return (
    <div className={`tool-bubble ${isDone ? 'done' : 'running'}`}>
      <div className="tool-header">
        <span className="tool-icon">{isDone ? '✓' : '⚡'}</span>
        <span className="tool-label">{label}</span>
        {!isDone && <span className="tool-spinner" />}
      </div>
      {isDone && tool.result && (
        <pre className="tool-result">
          {typeof tool.result === 'string'
            ? tool.result
            : JSON.stringify(tool.result, null, 2)}
        </pre>
      )}
    </div>
  );
}
