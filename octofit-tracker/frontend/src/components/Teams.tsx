import { CapabilityCard } from './CapabilityCard.js';

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
      emptyText="No teams"
      getItems={(payload) => Array.isArray((payload as { teams?: unknown[] })?.teams) ? (payload as { teams: unknown[] }).teams : []}
      renderItem={(item) => <>{String((item.name ?? 'Unknown team'))} ({String(((item.members ?? []) as unknown[]).length)})</>}
    />
  );
}
