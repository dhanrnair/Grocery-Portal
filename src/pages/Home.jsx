import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../../shared/rules';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const { addItem } = useCart();

  useEffect(() => {
    getProducts()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['All', ...new Set(items.map((i) => i.category))], [items]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => category === 'All' || i.category === category)
      .filter((i) => !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }, [items, query, category]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error">Could not load groceries: {error}</p>;

  return (
    <>
      <div className="toolbar">
        <input type="search" placeholder="Search groceries…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="chips">
        {categories.map((c) => (
          <button key={c} className={c === category ? 'chip active' : 'chip'} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="muted">Nothing matches your search.</p>
      ) : (
        <div className="grid">
          {visible.map((p) => (
            <div key={p.id} className="card">
              <Link to={`/product/${p.id}`} className="card-link">
                <div className="card-image">{p.image}</div>
                <h3>{p.name}</h3>
                <p className="muted small">{p.category} · {p.unit}</p>
              </Link>
              <div className="card-footer">
                <strong>{formatPrice(p.price)}</strong>
                {p.stock === 0
                  ? <span className="muted small">Out of stock</span>
                  : <button type="button" onClick={() => addItem(p)}>Add</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
