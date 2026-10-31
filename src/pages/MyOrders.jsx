import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cancelOrder, getMyOrders } from '../services/api';
import { useSession } from '../services/auth';
import { formatPrice } from '../../shared/rules';

export default function MyOrders() {
  const { data: session, isPending } = useSession();
  const placed = useLocation().state?.placed;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!session) return;
    getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session]);

  async function cancel(id) {
    if (!window.confirm(`Cancel order ${id}?`)) return;
    setBusy(id);
    setError('');
    try {
      await cancelOrder(id);
      setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)));
    } catch (err) {
      setError(err.message);
    }
    setBusy('');
  }

  if (isPending) return <p>Loading…</p>;
  if (!session) {
    return <div className="empty"><p>Sign in to see your orders.</p>
      <Link to="/signin" state={{ from: '/my-orders' }} className="button">Sign in</Link></div>;
  }
  if (loading) return <p>Loading…</p>;

  return (
    <>
      <h1>My orders</h1>
      {placed && <p>🎉 Order <strong>{placed}</strong> placed. Thank you!</p>}
      {error && <p className="error">{error}</p>}
      {orders.length === 0 ? (
        <div className="empty"><p>No orders yet.</p><Link to="/" className="button">Start shopping</Link></div>
      ) : orders.map((o) => <OrderCard key={o.id} order={o} onCancel={cancel} busy={busy === o.id} />)}
    </>
  );
}

export function OrderCard({ order: o, onCancel, busy }) {
  return (
    <div className="order">
      <div className="order-head">
        <strong>{o.id}</strong>
        <span className="muted">{new Date(o.createdAt).toLocaleString()} · {o.status}</span>
        <strong>{formatPrice(o.total)}</strong>
      </div>
      <ul>
        {o.items.map((i) => <li key={i.id}>{i.image} {i.name} ({i.unit}) × {i.qty}</li>)}
      </ul>
      <p className="muted small">
        Delivery to {o.customer.address}, {o.customer.city} {o.customer.zip} · {o.delivery ? `delivery ${formatPrice(o.delivery)}` : 'free delivery'}
      </p>
      {onCancel && o.status === 'placed' && (
        <button type="button" className="secondary" disabled={busy} onClick={() => onCancel(o.id)}>
          {busy ? 'Cancelling…' : 'Cancel order'}
        </button>
      )}
    </div>
  );
}
