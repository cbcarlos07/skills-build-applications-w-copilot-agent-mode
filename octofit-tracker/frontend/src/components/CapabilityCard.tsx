import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props = {
  title: string;
  description: string;
  endpoint: string;
  emptyText: string;
  getItems: (payload: unknown) => unknown[];
  renderItem: (item: Record<string, unknown>, index: number) => React.ReactNode;
};

export function CapabilityCard({ title, description, endpoint, emptyText, getItems, renderItem }: Props) {
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getJson<unknown>(endpoint)
      .then((payload) => {
        if (cancelled) return;
        setItems(getItems(payload));
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message || 'Unable to load data');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, getItems]);

  if (loading) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <p role="status">Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <div role="alert">Unable to load {title.toLowerCase()}.</div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <p>{emptyText}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        <ul className="list-unstyled mb-0">
          {items.map((item, index) => (
            <li key={index}>{renderItem(item as Record<string, unknown>, index)}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
