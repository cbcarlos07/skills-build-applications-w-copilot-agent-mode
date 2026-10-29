import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

function loadActivities() {
  return getJson<unknown>('/api/activities');
}

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      loadData={loadActivities}
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
