import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import './CampaignStats.css';

const FUNNEL_COLORS = ['#ff6b4a', '#ff8f7a', '#ffb5a0', '#ffd4c8', '#4ade80'];

export default function CampaignStats({ stats, campaignName }) {
  if (!stats) return null;

  const funnelData = [
    { stage: 'Sent', value: stats.sent || 0 },
    { stage: 'Delivered', value: stats.delivered || 0 },
    { stage: 'Opened', value: stats.opened || 0 },
    { stage: 'Clicked', value: stats.clicked || 0 },
    { stage: 'Converted', value: stats.converted || 0 },
  ];

  const rateCards = [
    { label: 'Delivery Rate', value: `${stats.deliveryRate || 0}%`, sub: 'delivered / sent' },
    { label: 'Open Rate', value: `${stats.openRate || 0}%`, sub: 'opened / delivered' },
    { label: 'Click Rate', value: `${stats.clickRate || 0}%`, sub: 'clicked / opened' },
    { label: 'Conversion', value: `${stats.conversionRate || 0}%`, sub: 'converted / delivered' },
  ];

  return (
    <div className="campaign-stats">
      {campaignName && <h3 className="stats-title">{campaignName}</h3>}

      <div className="rate-cards">
        {rateCards.map((card) => (
          <div key={card.label} className="rate-card">
            <span className="rate-label">{card.label}</span>
            <span className="rate-value">{card.value}</span>
            <span className="rate-sub">{card.sub}</span>
          </div>
        ))}
      </div>

      <div className="funnel-chart">
        <h4>Campaign Funnel</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" stroke="#8888a0" fontSize={12} />
            <YAxis type="category" dataKey="stage" stroke="#8888a0" fontSize={12} width={80} />
            <Tooltip
              contentStyle={{
                background: '#1a1a22',
                border: '1px solid #2a2a36',
                borderRadius: 8,
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {funnelData.map((_, i) => (
                <Cell key={i} fill={FUNNEL_COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {stats.failed > 0 && (
        <div className="failed-notice">
          {stats.failed} messages failed to deliver ({Math.round((stats.failed / stats.sent) * 100)}%)
        </div>
      )}
    </div>
  );
}
