// The ONLY place the browser talks to the server.
async function request(path, options) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.fields = body.fields; // per-field validation messages from the server
    throw err;
  }
  return body;
}

const post = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data ?? {}) });

export const getProducts = () => request('/products');

export const getProduct = (id) =>
  request(`/products/${encodeURIComponent(id)}`).catch((err) => {
    if (err.status === 404) return null;
    throw err;
  });

// Only ids and quantities are sent; the server prices the order.
export const placeOrder = ({ items, customer }) =>
  post('/orders', { items: items.map(({ id, qty }) => ({ id, qty })), customer });

export const getMyOrders = () => request('/my/orders');
export const cancelOrder = (id) => post(`/orders/${encodeURIComponent(id)}/cancel`);
export const lookupOrder = (id, email) => post('/orders/lookup', { id, email });
