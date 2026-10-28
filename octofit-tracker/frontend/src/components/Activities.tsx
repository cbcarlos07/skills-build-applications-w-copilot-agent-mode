import { CapabilityCard } from './CapabilityCard.js';

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      endpoint="/api/activities"
      emptyText="No activities"
      getItems={(payload) => Array.isArray((payload as { activities?: unknown[] })?.activities) ? (payload as { activities: unknown[] }).activities : []}
      renderItem={(item) => (
        <>
          <span>{String((item.type ?? 'Unknown'))}</span>
          <span className="ms-2">{String((item.minutes ?? 0))} min</span>
          <span className="ms-2">{String((item.points ?? 0))} pts</span>
        </>
      )}
    />
  );
}
