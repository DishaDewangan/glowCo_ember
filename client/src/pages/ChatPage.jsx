import AgentChat from '../components/AgentChat.jsx';
import './ChatPage.css';

const SUGGESTIONS = [
  'Find customers whose moisturiser has probably run out — bought 35+ days ago, no reorder.',
  'Which customers have dry skin but never bought serum? They need it.',
  'Who bought moisturiser but never sunscreen? Their routine has a gap.',
  'Show me high-value loyalists with 5+ orders and avg spend above ₹900.',
];

export default function ChatPage() {
  return (
    <div className="chat-page">
      <AgentChat suggestions={SUGGESTIONS} />
    </div>
  );
}
