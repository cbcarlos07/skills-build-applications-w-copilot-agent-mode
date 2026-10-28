import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

function loadWorkoutSuggestions() {
  return getJson<unknown>('/api/workouts/suggestions/mona@example.com');
}

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      loadData={loadWorkoutSuggestions}
      emptyText="No workout suggestions"
      getItems={(payload) => Array.isArray((payload as { suggestions?: unknown[] })?.suggestions) ? (payload as { suggestions: unknown[] }).suggestions : []}
      renderItem={(item) => (
        <>
          <span>{String((item.title ?? 'Workout'))}</span>
          <span className="ms-2 text-muted">{String((item.reason ?? ''))}</span>
        </>
      )}
    />
  );
}
