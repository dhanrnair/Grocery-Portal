import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import { MAX_QTY, formatPrice } from '../../shared/rules';

export default function Product() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error">Could not load product: {error}</p>;
  if (!product) return <div className="empty"><p>Product not found.</p><Link to="/" className="button">Back to shop</Link></div>;

  const max = Math.min(MAX_QTY, product.stock);
  return (
    <>
      <p><Link to="/">← All groceries</Link></p>
      <div className="detail">
        <div className="detail-image">{product.image}</div>
        <div>
          <h1>{product.name}</h1>
          <p className="muted">{product.category} · {product.unit}</p>
          <p>{product.description}</p>
          <p className="price">{formatPrice(product.price)}</p>
          {product.stock === 0 ? <p className="error">Out of stock</p> : (
            <div className="row">
              <input className="qty" type="number" min="1" max={max} value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(max, Number(e.target.value) || 1)))} />
              <button type="button" onClick={() => { addItem(product, qty); setAdded(true); }}>Add to basket</button>
            </div>
          )}
          {product.stock > 0 && product.stock <= 10 && <p className="muted small">Only {product.stock} left</p>}
          {added && <p>Added to your basket. <Link to="/cart">View basket</Link></p>}
        </div>
      </div>
    </>
  );
}
