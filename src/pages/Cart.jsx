import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FREE_DELIVERY_THRESHOLD, deliveryFor, formatPrice } from '../../shared/rules';

export default function Cart() {
  const { items, subtotal, setQty, removeItem } = useCart();
  if (items.length === 0) {
    return <div className="empty"><h2>Your basket is empty</h2><Link to="/" className="button">Start shopping</Link></div>;
  }
  const delivery = deliveryFor(subtotal);
  return (
    <div className="cart">
      <div>
        <h1>Your basket</h1>
        {items.map((i) => (
          <div key={i.id} className="cart-item">
            <span className="cart-image">{i.image}</span>
            <div className="grow">
              <Link to={`/product/${i.id}`}>{i.name}</Link>
              <p className="muted">{i.unit} · {formatPrice(i.price)}</p>
            </div>
            <div className="stepper">
              <button type="button" aria-label="Decrease" onClick={() => setQty(i.id, i.qty - 1)}>−</button>
              <span>{i.qty}</span>
              <button type="button" aria-label="Increase" onClick={() => setQty(i.id, i.qty + 1)}>+</button>
            </div>
            <span className="line-total">{formatPrice(i.qty * i.price)}</span>
            <button type="button" className="link-button" onClick={() => removeItem(i.id)}>Remove</button>
          </div>
        ))}
      </div>
      <aside className="summary">
        <h2>Summary</h2>
        <div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        <div className="summary-row"><span>Delivery</span><span>{delivery ? formatPrice(delivery) : 'Free'}</span></div>
        {delivery > 0 && <p className="muted small">Free delivery over {formatPrice(FREE_DELIVERY_THRESHOLD)}.</p>}
        <div className="summary-row total"><span>Total</span><span>{formatPrice(subtotal + delivery)}</span></div>
        <Link to="/checkout" className="button">Checkout</Link>
      </aside>
    </div>
  );
}
