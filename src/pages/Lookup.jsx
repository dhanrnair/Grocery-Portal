import { useState } from 'react';
import { lookupOrder } from '../services/api';
import { OrderCard } from './MyOrders';

// Public, read-only: find an order by its code and the email used.
export default function Lookup() {
  const [form, setForm] = useState({ id: '', email: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrors({});
    setOrder(null);
    try {
      setOrder(await lookupOrder(form.id, form.email));
    } catch (err) {
      setErrors(err.fields ?? {});
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <>
      <h1>Find an order</h1>
      <form className="card" onSubmit={submit} noValidate>
        <label className="field"><span>Order code</span>
          <input value={form.id} placeholder="GRO-XXXXXXXX" onChange={(e) => setForm({ ...form, id: e.target.value })} />
          {errors.id && <small className="error">{errors.id}</small>}
        </label>
        <label className="field"><span>Email used for the order</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <small className="error">{errors.email}</small>}
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Searching…' : 'Find order'}</button>
        {error && <p className="error">{error}</p>}
      </form>
      {order && <OrderCard order={order} />}
    </>
  );
}
