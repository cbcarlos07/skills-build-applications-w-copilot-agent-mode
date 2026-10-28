import { CapabilityCard } from './CapabilityCard.js';

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      emptyText="No leaderboard"
      getItems={(payload) => Array.isArray((payload as { leaderboard?: unknown[] })?.leaderboard) ? (payload as { leaderboard: unknown[] }).leaderboard : []}
      renderItem={(item) => (
        <>
          <span>{String((item.teamName ?? 'Unknown team'))}</span>
          <span className="ms-2">{String((item.totalPoints ?? 0))}</span>
        </>
      )}
    />
  );
}
