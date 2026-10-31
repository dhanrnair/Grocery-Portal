import express from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth.js';
import {
  cancelOrder, createOrder, findOrder, getProduct, listOrdersForUser, listProducts, ping,
} from './repo.js';
import { MAX_QTY, validateContact, validateCustomer } from '../shared/rules.js';

const router = express.Router();
router.use(express.json());

// Session helpers. getSession returns null for guests; requireUser throws 401.
// Take the user id from here, NEVER from the request body or query.
export const getSession = (req) => auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
export async function requireUser(req) {
  const session = await getSession(req);
  if (!session) throw Object.assign(new Error('Please sign in'), { status: 401 });
  return session.user;
}

const bad = (message, fields) => Object.assign(new Error(message), { status: 400, fields });
const str = (v) => (typeof v === 'string' ? v.trim() : '');

// Express 5 forwards rejected async handlers to the error handler below: no try/catch needed.
router.get('/health', async (req, res) => {
  await ping();
  res.json({ ok: true });
});

router.get('/products', async (req, res) => {
  res.json(await listProducts());
});

router.get('/products/:id', async (req, res) => {
  const product = await getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Place an order. The client sends only product ids, quantities and delivery details.
router.post('/orders', async (req, res) => {
  const user = await requireUser(req);
  const { items, customer } = req.body ?? {};
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) throw bad('Your basket is empty');
  for (const i of items) {
    if (!i || typeof i.id !== 'string' || !Number.isInteger(i.qty) || i.qty < 1 || i.qty > MAX_QTY) {
      throw bad(`Each item needs an id and a quantity from 1 to ${MAX_QTY}`);
    }
  }
  const clean = {
    name: str(customer?.name), email: str(customer?.email), address: str(customer?.address),
    city: str(customer?.city), zip: str(customer?.zip),
  };
  const fields = validateCustomer(clean);
  if (Object.keys(fields).length) throw bad('Please fix the highlighted fields', fields);
  // Quantity is per line, but duplicate lines are merged server-side, so re-check the merged total.
  const merged = new Map();
  for (const { id, qty } of items) merged.set(id, (merged.get(id) ?? 0) + qty);
  if ([...merged.values()].some((q) => q > MAX_QTY)) throw bad(`You can order at most ${MAX_QTY} of one product`);
  res.status(201).json(await createOrder(user.id, items, clean));
});

router.get('/my/orders', async (req, res) => {
  const user = await requireUser(req);
  res.json(await listOrdersForUser(user.id));
});

router.post('/orders/:id/cancel', async (req, res) => {
  const user = await requireUser(req);
  res.json(await cancelOrder(req.params.id, user.id));
});

// Read-only. POST so the email stays out of URLs. Never modifies anything.
router.post('/orders/lookup', async (req, res) => {
  const id = str(req.body?.id).toUpperCase();
  const email = str(req.body?.email);
  const fields = validateContact({ name: 'x', email });
  if (!id || fields.email) throw bad('Enter your order code and email', { ...(id ? {} : { id: 'Order code is required' }), ...fields });
  const order = await findOrder(id, email);
  if (!order) return res.status(404).json({ error: 'No order found for that code and email' });
  res.json(order);
});

router.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Errors with a .status are intentional and their message is shown to users.
// Anything else is logged and returned as a generic 500 (never leak internals).
router.use((err, req, res, next) => {
  if (!err.status) console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.status ? err.message : 'Something went wrong',
    ...(err.fields && { fields: err.fields }),
  });
});

export default router;
