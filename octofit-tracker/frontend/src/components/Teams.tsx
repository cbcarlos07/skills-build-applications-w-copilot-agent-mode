import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

function loadTeams() {
  return getJson<unknown>('/api/teams');
}

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      loadData={loadTeams}
      emptyText="No teams"
      getItems={(payload) => Array.isArray((payload as { teams?: unknown[] })?.teams) ? (payload as { teams: unknown[] }).teams : []}
      renderItem={(item) => <>{String((item.name ?? 'Unknown team'))} ({String(((item.members ?? []) as unknown[]).length)})</>}
    />
  );
}
