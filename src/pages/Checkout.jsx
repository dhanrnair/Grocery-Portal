import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSession } from '../services/auth';
import { placeOrder } from '../services/api';
import { deliveryFor, formatPrice, validateCustomer } from '../../shared/rules';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (items.length === 0) return <Navigate to="/cart" replace />;
  if (isPending) return <p>Loading…</p>;

  const delivery = deliveryFor(subtotal);
  const total = subtotal + delivery;

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validateCustomer(form);
    setErrors(e);
    setSubmitError('');
    if (Object.keys(e).length) return;
    setSubmitting(true);
    try {
      const order = await placeOrder({ items, customer: form });
      clearCart();
      navigate('/my-orders', { state: { placed: order.id } });
    } catch (err) {
      if (err.status === 401) setSubmitError('Your session expired. Please sign in again.');
      else setSubmitError(err.message);
      setErrors(err.fields ?? {});
      setSubmitting(false);
    }
  };

  const field = (name, label, type = 'text') => (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
      {errors[name] && <small className="error">{errors[name]}</small>}
    </label>
  );

  return (
    <div className="cart">
      <form onSubmit={handleSubmit} noValidate>
        <h1>Checkout</h1>
        {field('name', 'Full name')}
        {field('email', 'Email', 'email')}
        {field('address', 'Delivery address')}
        <div className="row">
          {field('city', 'City')}
          {field('zip', 'Postal code')}
        </div>
        <p className="muted small">This is a demo. No payment is taken.</p>
        {submitError && <p className="error">{submitError}</p>}
        {session ? (
          <button type="submit" disabled={submitting}>
            {submitting ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
          </button>
        ) : (
          <Link to="/signin" state={{ from: '/checkout' }} className="button">Sign in to order</Link>
        )}
      </form>
      <aside className="summary">
        <h2>Order summary</h2>
        {items.map((i) => (
          <div key={i.id} className="summary-row">
            <span>{i.image} {i.name} × {i.qty}</span>
            <span>{formatPrice(i.qty * i.price)}</span>
          </div>
        ))}
        <div className="summary-row"><span>Delivery</span><span>{delivery ? formatPrice(delivery) : 'Free'}</span></div>
        <div className="summary-row total"><span>Total</span><span>{formatPrice(total)}</span></div>
      </aside>
    </div>
  );
}
